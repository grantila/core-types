import {
	TypeMap,
	GenericTypeInfo,
	NodeType,
	NodeWithConstEnum,
} from '../types'
import { Comparable, uniq } from '../util'


export function simplifyEnumAndConst< T extends NodeType, U >(
	node: T & GenericTypeInfo< U >
)
: NodeType & GenericTypeInfo< U >
{
	const { const: _const, enum: _enum, ...rest } = node;
	type ItemType = UnknownAsComparable< TypeMap[ T[ 'type' ] ] >;

	const combined =
		combineConstAndEnum( node as GenericTypeInfo< ItemType > );

	if ( combined.length === 0 )
		return rest as NodeType & GenericTypeInfo< U >;
	else if ( combined.length === 1 )
		return { ...( rest as typeof node ), const: combined[ 0 ] } as
			NodeType & GenericTypeInfo< U >;
	else
	{
		if (
			node.type === 'boolean'
			&&
			( combined as Array< unknown > ).includes( false )
			&&
			( combined as Array< unknown > ).includes( true )
		)
			// This enum can be removed in favor of generic boolean
			return { ...rest } as NodeType & GenericTypeInfo< U >;
		else
			return { ...rest, enum: combined } as
				NodeType & GenericTypeInfo< U >;
	}
}

type UnknownAsComparable< T > = T extends unknown
	? Comparable
	: T;

export function mergeConstEnumUnion< T extends NodeWithConstEnum >(
	nodes: Array< T >
)
: Array< TypeMap[ T[ 'type' ] ] >
{
	type ItemType = UnknownAsComparable< TypeMap[ T[ 'type' ] ] >;

	const arrays = nodes.map( node =>
		combineConstAndEnum( node as GenericTypeInfo< ItemType > ) as
			Array< TypeMap[ T[ 'type' ] ] >
	);

	if ( arrays.some( arr => arr.length === 0 ) )
		// One of the nodes doesn't have const or enum, so all other const and
		// enums are irrelevant in a union.
		return [ ];

	type ArrType = Array< UnknownAsComparable< TypeMap[ T[ 'type' ] ] > >;

	return uniq(
		( [ ] as ArrType ).concat( ...( arrays as Array< ArrType > ) )
	) as Array< TypeMap[ T[ 'type' ] ] >;
}


// TODO: This shouldn't union but _intersect_ enum and const
export function combineConstAndEnum< T extends Comparable >(
	pseudoNode: GenericTypeInfo< T >
)
: Array< T >
{
	return uniq( [
		...( pseudoNode.const != null ? [ pseudoNode.const ] : [ ] ),
		...( pseudoNode.enum != null ? pseudoNode.enum : [ ] ),
	] );
}
