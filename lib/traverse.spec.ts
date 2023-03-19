import { type TraverseCallbackArgument, some, traverse } from './traverse.js'
import type { NodeType } from './types.js'


const root: NodeType = {
	type: 'object',
	title: 'root',
	additionalProperties: { type: 'string', title: 'o-ap' },
	properties: {
		any: { required: true, node: {
			title: 'o-any',
			type: 'any'
		}, },
		null: { required: true, node: {
			title: 'o-null',
			type: 'null'
		}, },
		string: { required: true, node: {
			title: 'o-string',
			type: 'string'
		}, },
		number: { required: true, node: {
			title: 'o-number',
			type: 'number'
		}, },
		integer: { required: false, node: {
			title: 'o-integer',
			type: 'integer'
		}, },
		boolean: { required: true, node: {
			title: 'o-boolean',
			type: 'boolean'
		}, },
		and: {
			required: true,
			node: {
				title: 'o-and',
				type: 'and',
				and: [ { type: 'number', title: 'o-and-number' } ],
			},
		},
		or: {
			required: true,
			node: {
				title: 'o-or',
				type: 'or',
				or: [ { type: 'number', title: 'o-or-number' } ],
			},
		},
		ref: {
			required: true,
			node: {
				title: 'o-ref',
				type: 'ref',
				ref: 'the-ref',
			},
		},
		object: {
			required: true,
			node: {
				title: 'o-object',
				type: 'object',
				properties: {
					foo: {
						required: false,
						node: {
							type: 'integer',
							title: 'o-o-foo-integer',
						},
					},
				},
				additionalProperties: { type: 'any', title: 'o-o-ap' },
			},
		},
		array: {
			required: false,
			node: {
				title: 'o-array',
				type: 'array',
				elementType: { type: 'null', title: 'o-array-null' },
			},
		},
		tuple: {
			required: true,
			node: {
				title: 'o-tuple',
				type: 'tuple',
				elementTypes: [
					{ type: 'number', title: 'o-tuple-0-number' },
					{ type: 'boolean', title: 'o-tuple-0-boolean' },
				],
				additionalItems: { type: 'any', title: 'o-tuple-any' },
				minItems: 1,
			},
		},
	},
};

describe( "traverse", ( ) =>
{
	type TestObject =
		{ title?: string }
		&
		Pick<
			TraverseCallbackArgument,
			| 'path'
			| 'required'
			| 'parentProperty'
			| 'index'
		>
		&
		Partial< Pick< TraverseCallbackArgument, 'rootNode' > >;

	const testObjectSorter = ( a: TestObject, b: TestObject ) =>
	{
		if ( a.path.length < b.path.length )
			return -1;
		else if ( a.path.length > b.path.length )
			return 1;
		return JSON.stringify( a ).localeCompare( JSON.stringify( b ) );
	};

	it( "should traverse deeply", ( ) =>
	{
		const visited: Array< TestObject > = [ ];
		traverse(
			root,
			( { node, path, required, parentProperty, index, rootNode } ) =>
			{
				const { title } = node;
				visited.push( {
					title,
					path,
					required,
					parentProperty,
					index,
					rootNode,
				} );
			}
		);

		for ( const elem of visited )
		{
			expect( elem.rootNode ).toBe( root );
			delete elem.rootNode;
		}

		visited.sort( testObjectSorter );

		expect( visited ).toMatchSnapshot( );
	} );

	it( "should traverse without additionals", ( ) =>
	{
		const visited: Array< TestObject > = [ ];
		const root: NodeType = {
			type: 'object',
			properties: {
				p: { required: false, node: {
					type: 'object',
					properties: {
						foo: { required: true, node: { type: 'boolean' } },
					},
					additionalProperties: false,
				} },
				tup: { required: true, node: {
					type: 'tuple',
					elementTypes: [ { type: 'null' } ],
					minItems: 0,
					additionalItems: false,
				}, },
			},
			additionalProperties: true,
		};
		traverse(
			root,
			( { node, path, required, parentProperty, index } ) =>
			{
				visited.push( {
					title: node === root ? '' : JSON.stringify( node ),
					path,
					required,
					parentProperty,
					index,
				} );
			}
		);

		visited.sort( testObjectSorter );

		expect( visited ).toMatchSnapshot( );
	} );
} );

describe( "some", ( ) =>
{
	it( "should not find what's not there", ( ) =>
	{
		const found = some(
			root,
			( { node } ) =>
				node.title === 'o-ref' && node.type === 'integer'
		);

		expect( found ).toBe( false );
	} );

	it( "should not find what's actually there", ( ) =>
	{
		const found = some(
			root,
			( { node } ) =>
				node.title === 'o-ref' && node.type === 'ref'
		);

		expect( found ).toBe( true );
	} );

	it( "should forward errors", ( ) =>
	{
		const find = ( ) => some(
			root,
			( { node } ) =>
			{
				if ( node.title === 'o-ref' && node.type === 'ref' )
					throw new Error( 'some error' );
				return false;
			}
		);

		expect( find ).toThrowError( 'some error' );
	} );
} );
