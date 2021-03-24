import {
	NodeType,
	AndType,
	OrType,
	Types,
	NodeTypeMap,
	NamedType,
	NodeDocument,
	BooleanType,
} from './types'
import { simplifySingle } from './simplifications/single'
import { mergeConstEnumUnion } from './simplifications/const-enum'
import { intersectConstEnum } from './simplifications/intersect-const-enum'
import { MalformedTypeError } from './error'
import { extractAnnotations, mergeAnnotations } from './annotation'
import { copyName, isNodeDocument, splitTypes } from './util'

export function simplify< T extends NamedType >( node: T ): NamedType;
export function simplify< T extends NamedType >( node: Array< T > )
: Array< NamedType >;
export function simplify< T extends NodeType >( node: T ): NodeType;
export function simplify< T extends NodeType >( node: Array< T > ) : NodeType;
export function simplify< T extends NodeType >(
	node: NodeDocument< 1, T >
)
: NodeDocument< 1, NodeType >;
export function simplify( node: NodeDocument | NodeType | Array< NodeType > )
: typeof node
{
	if ( Array.isArray( node ) )
		return node.map( node => simplify( node ) );

	if ( isNodeDocument( node ) )
		return {
			...node,
			types: simplify( ( node as NodeDocument ).types ),
		} as NodeDocument;

	const wrapName = ( newNode: NodeType ) => copyName( node, newNode );

	if ( node.type === 'tuple' )
	{
		return {
			...node,
			elementTypes: node.elementTypes.map( type => simplify( type ) ),
			...(
				node.additionalItems &&
					typeof node.additionalItems === 'object'
				? { additionalItems: simplify( node.additionalItems ) }
				: { }
			),
		};
	}
	else if ( node.type === 'array' )
	{
		return {
			...node,
			elementType: simplify( node.elementType )
		};
	}
	else if ( node.type === 'object' )
	{
		return {
			...node,
			properties: Object.fromEntries(
				Object.entries( node.properties )
				.map( ( [ name, { node, required } ] ) =>
					[ name, { node: simplify( node ), required } ]
				)
			),
			...(
				node.additionalProperties &&
					typeof node.additionalProperties === 'object'
				? {
					additionalProperties: simplify( node.additionalProperties )
				}
				: { }
			),
		};
	}
	else if ( node.type !== 'and' && node.type !== 'or' )
		return wrapName( simplifySingle( node ) );
	else if ( node.type === 'and' )
	{
		const and = simplifyIntersection(
			( [ ] as NodeType[ ] ).concat(
				...node.and.map( node =>
				{
					const simplifiedNode = simplify( node );
					return ( simplifiedNode as AndType ).and
						? ( simplifiedNode as AndType ).and
						: [ simplifiedNode ];
				} )
			)
		);

		if ( and.length === 1 )
			return wrapName( {
				...and[ 0 ],
				...mergeAnnotations( [ extractAnnotations( node ), and[ 0 ] ] )
			} );
		return wrapName( { type: 'and', and, ...extractAnnotations( node ) } );
	}
	else if ( node.type === 'or' )
	{
		const or = simplifyUnion(
			( [ ] as NodeType[ ] ).concat(
				...node.or.map( node =>
				{
					const simplifiedNode = simplify( node );
					return ( simplifiedNode as OrType ).or
						? ( simplifiedNode as OrType ).or
						: [ simplifiedNode ];
				} )
			)
		);

		if ( or.length === 1 )
			return wrapName( {
				...or[ 0 ],
				...mergeAnnotations( [ extractAnnotations( node ), or[ 0 ] ] )
			} );
		return wrapName( { type: 'or', or, ...extractAnnotations( node ) } );
	}
	else
	{
		// istanbul ignore next
		throw new MalformedTypeError( "Invalid node", node );
	}
}

// Combine types/nodes where one is more generic than some other, or where
// they can be combined to fewer nodes.
function simplifyUnion( nodes: Array< NodeType > ): Array< NodeType >
{
	const typeMap = splitTypes( nodes );

	if ( typeMap.any.length > 0 )
	{
		const enums = mergeConstEnumUnion( typeMap.any );
		if ( enums.length === 0 )
			// If any type in a set of types is an "any" type, without const
			// or enum, the whole union is "any".
			return [ { type: 'any', ...mergeAnnotations( typeMap.any ) } ];
	}

	if ( typeMap.boolean.length === 1 )
		typeMap.boolean = [
			simplifySingle( typeMap.boolean[ 0 ] ) as BooleanType
		];
	else if ( typeMap.boolean.length > 1 )
	{
		const bools = mergeConstEnumUnion( typeMap.boolean );
		if ( bools.length === 0 )
			// This enum/const can be removed in favor of generic boolean
			typeMap.boolean = [ { type: 'boolean' } ];
		else
			typeMap.boolean = [
				simplifySingle( { type: 'boolean', enum: bools } ) as
					BooleanType
			];
	}

	if ( typeMap.or.length > 0 )
		typeMap.or = typeMap.or.filter( ( { or } ) => or.length > 0 );

	if ( typeMap.and.length > 0 )
		typeMap.and = typeMap.and.filter( ( { and } ) => and.length > 0 );

	return ( [ ] as Array< NodeType > ).concat( ...Object.values( typeMap ) );
}

// Combine types/nodes and exclude types, const and enum where other are
// narrower/stricter.
function simplifyIntersection( nodes: Array< NodeType > ): Array< NodeType >
{
	const typeMap = splitTypes( nodes );

	if ( typeMap.any.length > 0 )
	{
		if (
			typeMap.and.length === 0 &&
			typeMap.or.length === 0 &&
			typeMap.ref.length === 0 &&
			typeMap.null.length === 0 &&
			typeMap.string.length === 0 &&
			typeMap.number.length === 0 &&
			typeMap.integer.length === 0 &&
			typeMap.boolean.length === 0 &&
			typeMap.object.length === 0 &&
			typeMap.array.length === 0 &&
			typeMap.tuple.length === 0
		)
			return [ { type: 'any', ...mergeAnnotations( typeMap.any ) } ];
		else
			// A more precise type will supercede this
			typeMap.any = [ ];
	}

	const cast = < T extends Types >( nodes: Array< unknown > ) =>
		nodes as Array< NodeTypeMap[ T ] >;

	if ( typeMap.boolean.length > 1 )
		typeMap.boolean = [ intersectConstEnum( [
			...typeMap.boolean,
			...cast< 'boolean' >( typeMap.any ),
		] ) ];

	if ( typeMap.string.length > 1 )
		typeMap.string = [ intersectConstEnum( [
			...typeMap.string,
			...cast< 'string' >( typeMap.any ),
		] ) ];

	if ( typeMap.number.length > 0 && typeMap.integer.length > 0 )
	{
		typeMap.number = [ intersectConstEnum( [
			...typeMap.number,
			...cast< 'number' >( typeMap.integer ),
			...cast< 'number' >( typeMap.any ),
		] ) ];
		typeMap.integer = [ ];
	}
	else if ( typeMap.number.length > 1 )
		typeMap.number = [ intersectConstEnum( [
			...typeMap.number,
			...cast< 'number' >( typeMap.any ),
		] ) ];
	else if ( typeMap.integer.length > 1 )
		typeMap.integer = [ intersectConstEnum( [
			...typeMap.integer,
			...cast< 'integer' >( typeMap.any ),
		] ) ];

	if ( typeMap.or.length > 0 )
		typeMap.or = typeMap.or.filter( ( { or } ) => or.length > 0 );

	if ( typeMap.and.length > 0 )
		typeMap.and = typeMap.and.filter( ( { and } ) => and.length > 0 );

	return ( [ ] as Array< NodeType > ).concat( ...Object.values( typeMap ) );
}
