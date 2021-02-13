import {
	NodeType,
	PrimitiveType,
	NodeWithConstEnum,
	Types,
	NodeTypeMap,
	NamedType,
	NodeDocument,
} from "./types"


export function uniq< T extends Comparable | unknown >( arr: Array< T > )
: Array< T >
{
	return arr
		.filter( ( t, index ) =>
		{
			for ( let i = 0; i < index; ++i )
			{
				const u = arr[ i ];
				if ( isEqual( t as Comparable, u as Comparable ) )
					return false;
			}
			return true;
		} );
}

export function ensureArray< T >( t: T | Array< T > | undefined | null )
: Array< T >
{
	if ( t == null )
		return [ ];
	return Array.isArray( t ) ? t : [ t ];
}

export const isPrimitiveType = ( node: NodeType ): node is PrimitiveType =>
	[ "null", "string", "number", "integer", "boolean" ].includes( node.type );

export const constEnumTypes = new Set< NodeType[ 'type' ] >( [
	'any',
	'string',
	'number',
	'integer',
	'boolean',
	'object',
	'array',
	'tuple',
	'ref'
] );

export const hasConstEnum = ( node: NodeType ): node is NodeWithConstEnum =>
	constEnumTypes.has( node.type );

export type ComparablePrimitives =
	undefined | null | boolean | string | number;
export type ComparableArray = Array< Comparable >;
export type ComparableObject = { [ key: string ]: Comparable; };
export type Comparable =
	| ComparablePrimitives
	| ComparableArray
	| ComparableObject;

export function isEqual< T extends Comparable >( a: T, b: T ): boolean;
export function isEqual< T extends Comparable, U extends Comparable >
	( a: T, b: U ): false;
export function isEqual< T extends Comparable, U extends Comparable >
	( a: T, b: U )
: boolean
{
	if ( typeof a !== typeof b )
		return false;
	else if ( ( a === null ) !== ( b === null ) )
		return false;
	else if ( a === null )
		return true;
	else if ( Array.isArray( a ) && Array.isArray( b ) )
	{
		if ( a.length !== b.length )
			return false;
		return !a.some( ( value, index ) => !isEqual( value, b[ index ] ) );
	}
	else if ( Array.isArray( a ) !== Array.isArray( b ) )
		return false;
	else if ( typeof a === 'object' )
	{
		const keysA = Object.keys( a as NonNullable< typeof a > ).sort( );
		const keysB = Object.keys( b as NonNullable< typeof b > ).sort( );
		if ( !isEqual( keysA, keysB ) )
			return false;

		return !keysA.some( key =>
			!isEqual(
				( a as ComparableObject )[ key ],
				( b as ComparableObject )[ key ]
			)
		);
	}
	else
		return a === ( b as ComparablePrimitives );
}

export function encodePathPart( part: string ): string
{
	return encodeURIComponent( part );
}

export function decodePathPart( part: string ): string
{
	return decodeURIComponent( part );
}

export function intersection< T extends Comparable >(
	a: Array< T >,
	b: Array< T >
)
: Array< T >
{
	const ret: Array< T > = [ ];

	a.forEach( aItem =>
	{
		b.forEach( bItem => {
			if ( isEqual( aItem, bItem ) )
				ret.push( aItem );
		} );
	} );

	return ret;
}

export function union< T extends Comparable >(
	a: Array< T >,
	b: Array< T >
)
: Array< T >
{
	const ret: Array< T > = [ ...a ];

	b.forEach( aItem =>
	{
		const unique = !a.some( bItem => isEqual( aItem, bItem ) );
		if ( unique )
			ret.push( aItem );
	} );

	return ret;
}

type SplitTypes = { [ T in Types ]: Array< NodeTypeMap[ T ] >; };

// Split a set of types into individual sets per-type
export function splitTypes( nodes: Array< NodeType > ): SplitTypes
{
	const ret: SplitTypes = {
		and: [ ],
		or: [ ],
		ref: [ ],
		any: [ ],
		null: [ ],
		string: [ ],
		number: [ ],
		integer: [ ],
		boolean: [ ],
		object: [ ],
		array: [ ],
		tuple: [ ],
	};

	nodes.forEach( node =>
	{
		if (
			node.type !== 'and' && node.type !== 'or'
			||
			node.type === 'and' && node.and.length > 0
			||
			node.type === 'or' && node.or.length > 0
		)
			ret[ node.type ].push( node as any );
	} );

	return ret;
}

export function copyName( from: NamedType< any >, to: NamedType< any > )
: typeof to
{
	return typeof from.name === 'undefined' ? to : { ...to, name: from.name };
}

export function isNonNullable< T >( t: T ): t is NonNullable< T >
{
	return t != null;
}

export function isNodeDocument(
	t: NodeDocument | NodeType | Array< NodeType >
)
: t is NodeDocument
{
	return Array.isArray( ( t as NodeDocument ).types );
}
