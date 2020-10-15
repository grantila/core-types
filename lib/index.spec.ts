import { NodeType } from './types'
import { simplify } from './'

describe( "simplify", ( ) =>
{
	it( "primitive type", ( ) =>
	{
		const result = simplify( {
			type: 'string',
			const: "foo",
		} );

		expect( result ).toStrictEqual( {
			type: 'string',
			const: 'foo',
		} );
	} );

	it( "and types without sub-ands", ( ) =>
	{
		const node: NodeType = {
			type: 'and',
			and: [
				{
					type: 'string',
					const: "foo",
				},
				{
					type: 'number',
					const: 42,
				},
			]
		};
		const result = simplify( node );

		expect( result ).toStrictEqual( node );
	} );

	it( "and types with single sub-and and single sub-or", ( ) =>
	{
		const node: NodeType = {
			type: 'and',
			and: [
				{
					type: 'string',
					const: "foo",
				},
				{
					type: 'and',
					and: [
						{
							type: 'number',
							const: 42,
						}
					]
				},
				{
					type: 'or',
					or: [
						{
							type: 'boolean',
							const: true,
						}
					]
				},
			]
		};
		const result = simplify( node );

		expect( result ).toStrictEqual( {
			type: 'and',
			and: [
				{
					type: 'string',
					const: "foo",
				},
				{
					type: 'number',
					const: 42,
				},
				{
					type: 'boolean',
					const: true,
				},
			]
		} );
	} );

	it( "should flatten single ors and ands", ( ) =>
	{
		const node: Array< NodeType > = [
			{
				type: 'or',
				or: [
					{
						type: 'and',
						and: [
							{
								type: 'or',
								or: [
									{ type: 'string' }
								]
							}
						]
					}
				]
			},
			{
				type: 'and',
				and: [
					{
						type: 'or',
						or: [
							{
								type: 'and',
								and: [
									{ type: 'number' }
								]
							}
						]
					}
				]
			},
		];

		expect( simplify( node ) ).toStrictEqual( [
			{ type: 'string' },
			{ type: 'number' },
		] );
	} );

	it( "and types with multiple sub-and and multiple sub-or", ( ) =>
	{
		const node: NodeType = {
			type: 'and',
			and: [
				{
					type: 'and',
					and: [
						{
							type: 'string',
							const: "foo",
						},
						{
							type: 'string',
							enum: [ "foo", "bar" ],
						},
					]
				},
				{
					type: 'and',
					and: [
						{
							type: 'number',
							enum: [ 17, 42 ],
						},
						{
							type: 'integer',
							const: 17,
						},
					]
				},
				{
					type: 'or',
					or: [
						{
							type: 'boolean',
							const: true,
						},
						{
							type: 'boolean',
							const: false,
						},
					]
				},
			]
		};
		const result = simplify( node );

		expect( result ).toStrictEqual( {
			type: 'and',
			and: [
				{
					type: 'string',
					const: "foo",
				},
				{
					type: 'number',
					const: 17,
				},
				{
					type: 'boolean',
				},
			]
		} );
	} );

	it( "or types with single sub-and and single sub-or", ( ) =>
	{
		const node: NodeType = {
			type: 'or',
			or: [
				{
					type: 'string',
					const: "foo",
				},
				{
					type: 'and',
					and: [
						{
							type: 'number',
							const: 42,
						}
					]
				},
				{
					type: 'or',
					or: [
						{
							type: 'boolean',
							const: true,
						}
					]
				},
			]
		};
		const result = simplify( node );

		expect( result ).toStrictEqual( {
			type: 'or',
			or: [
				{
					type: 'string',
					const: "foo",
				},
				{
					type: 'number',
					const: 42,
				},
				{
					type: 'boolean',
					const: true,
				},
			]
		} );
	} );

	it( "and with any", ( ) =>
	{
		const node: NodeType = {
			type: 'and',
			and: [
				{
					type: 'string',
				},
				{
					type: 'any',
				},
			]
		};
		const result = simplify( node );

		expect( result ).toStrictEqual( {
			type: 'string',
		} );
	} );
} );
