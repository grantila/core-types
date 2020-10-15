import {
	NodeType,
	AndType,
	OrType,
	Types,
	NodeTypeMap,
	NamedType,
} from './types'
import { simplifySingle } from './simplifications/single'
import { mergeConstEnumUnion } from './simplifications/const-enum'
import { intersectConstEnum } from './simplifications/intersect-const-enum'
import { MalformedTypeError } from './error'
import { mergeAnnotations } from './annotation'


export function simplify( node: NodeType ): typeof node;
export function simplify( node: Array< NodeType > ): typeof node;
export function simplify( node: NodeType | Array< NodeType > ): typeof node
{
	if ( Array.isArray( node ) )
		return node.map( node => simplify( node ) );

	const wrapName = ( newNode: NodeType ) => copyName( node, newNode );

	if ( node.type !== 'and' && node.type !== 'or' )
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
			return wrapName( and[ 0 ] );
		return wrapName( { type: 'and', and } );
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
			return wrapName( or[ 0 ] );
		return wrapName( { type: 'or', or } );
	}
	else
	{
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
		typeMap.boolean = [ simplifySingle( typeMap.boolean[ 0 ] ) ];
	else if ( typeMap.boolean.length > 1 )
	{
		const bools = mergeConstEnumUnion( typeMap.boolean );
		if ( bools.length === 0 )
			// This enum/const can be removed in favor of generic boolean
			typeMap.boolean = [ { type: 'boolean' } ];
		else
			typeMap.boolean = [
				simplifySingle( { type: 'boolean', enum: bools } )
			];
	}

	if ( typeMap.or.length > 1 )
		typeMap.or = typeMap.or.filter( ( { or } ) => or.length > 0 );

	if ( typeMap.and.length > 1 )
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

	if ( typeMap.or.length > 1 )
		typeMap.or = typeMap.or.filter( ( { or } ) => or.length > 0 );

	if ( typeMap.and.length > 1 )
		typeMap.and = typeMap.and.filter( ( { and } ) => and.length > 0 );

	return ( [ ] as Array< NodeType > ).concat( ...Object.values( typeMap ) );
}

type SplitTypes = { [ T in Types ]: Array< NodeTypeMap[ T ] >; };

// Split a set of types into individual sets per-type
function splitTypes( nodes: Array< NodeType > ): SplitTypes
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
		ret[ node.type ].push( node as any );
	} );

	return ret;
}

function copyName( from: NamedType< any >, to: NamedType< any > ): typeof to
{
	return typeof from.name === 'undefined' ? to : { ...to, name: from.name };
}
