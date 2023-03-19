import type { NodePath, NodeType } from './types.js'

export interface TraverseCallbackArgument
{
	node: NodeType;
	rootNode: NodeType;
	path: NodePath;
	parentProperty?: string;
	parentNode?: NodeType;
	index?: string | number;
	required?: boolean;
}

export type TraverseCallback = ( arg: TraverseCallbackArgument ) => void;
export type SomeCallback = ( arg: TraverseCallbackArgument ) => boolean;

class StopError extends Error { }

export function traverse( node: NodeType, cb: TraverseCallback )
{
	function makeNewArg< T extends NodeType >(
		arg: TraverseCallbackArgument,
		parentNode: T,
		parentProperty: keyof T,
		index?: string | number,
		required?: boolean,
		newNode?: NodeType
	)
	: TraverseCallbackArgument
	{
		const node =
			newNode !== undefined
			? newNode
			: index === undefined
			? parentNode[ parentProperty ]
			: ( parentNode[ parentProperty ] as any)[ index ];

		const newPath: NodePath = [
			...arg.path,
			parentProperty as string,
			...( index === undefined ? [ ] : [ index ] ),
		];

		const newValues: Partial< TraverseCallbackArgument > = {
			node,
			path: newPath,
			parentNode,
			parentProperty: parentProperty as string,
			index,
			required,
		};

		return Object.assign( { }, arg, newValues );
	}

	function recurse( arg: TraverseCallbackArgument, cb: TraverseCallback )
	{
		cb( arg );

		const { node } = arg;

		if ( node.type === 'array' )
			recurse(
				makeNewArg< typeof node >( arg, node, 'elementType' ),
				cb
			);
		else if ( node.type === 'tuple' )
		{
			node.elementTypes.forEach( ( _, i ) =>
				recurse(
					makeNewArg< typeof node >( arg, node, 'elementTypes', i ),
					cb
				)
			);
			if ( typeof node.additionalItems === 'object' )
				recurse(
					makeNewArg< typeof node >( arg, node, 'additionalItems' ),
					cb
				);
		}
		else if ( node.type === 'object' )
		{
			for ( const prop of Object.keys( node.properties ) )
				recurse(
					makeNewArg< typeof node >(
						arg,
						node,
						'properties',
						prop,
						node.properties[ prop ].required,
						node.properties[ prop ].node
					),
					cb
				);

			if ( typeof node.additionalProperties === 'object' )
				recurse(
					makeNewArg< typeof node >(
						arg,
						node,
						'additionalProperties'
					),
					cb
				);
		}
		else if ( node.type === 'and' )
			node.and.forEach( ( _, i ) =>
				recurse(
					makeNewArg< typeof node >( arg, node, 'and', i ),
					cb
				)
			);
		else if ( node.type === 'or' )
			node.or.forEach( ( _, i ) =>
				recurse(
					makeNewArg< typeof node >( arg, node, 'or', i ),
					cb
				)
			);
	}

	const arg: TraverseCallbackArgument = {
		node,
		rootNode: node,
		path: [ ],
	};

	recurse( arg, cb );
}

export function some( node: NodeType, cb: SomeCallback )
{
	try
	{
		traverse( node, arg =>
		{
			if ( cb( arg ) )
				throw new StopError( );
		} );
	}
	catch ( err )
	{
		if ( err instanceof StopError )
			return true;
		throw err;
	}
	return false;
}
