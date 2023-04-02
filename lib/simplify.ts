import type {
	AndType,
	NamedType,
	NodeDocument,
	NodeType,
	NodeTypeMap,
	NodeWithConstEnum,
	ObjectProperty,
	ObjectType,
	OrType,
	TypeMap,
	Types,
} from './types.js'
import { simplifySingle } from './simplifications/single.js'
import { mergeConstEnumUnion } from './simplifications/const-enum.js'
import { intersectConstEnum } from './simplifications/intersect-const-enum.js'
import { MalformedTypeError } from './error.js'
import { extractAnnotations, mergeAnnotations } from './annotation.js'
import {
	copyName,
	firstSplitTypeIndex,
	flattenSplitTypeValues,
	isNodeDocument,
	NodeWithOrder,
	splitTypes,
} from './util.js'


const enumableTypeNames = [
	'any',
	'string',
	'number',
	'integer',
	'boolean',
];

export interface SimplifyOptions
{
	/**
	 * If true, and-types of objects are merged into one type.
	 * This will also include ref-types that reference objects, they will all be
	 * merged into one object.
	 *
	 * @default false
	 */
	mergeObjects?: boolean;
}

export function simplify< T extends NamedType >(
	node: T,
	options?: SimplifyOptions
): NamedType;
export function simplify< T extends NamedType >(
	node: Array< T >,
	options?: SimplifyOptions
): Array< NamedType >;
export function simplify< T extends NodeType >(
	node: T,
	options?: SimplifyOptions
): NodeType;
export function simplify< T extends NodeType >(
	node: Array< T >,
	options?: SimplifyOptions
): NodeType;
export function simplify< T extends NodeType >(
	node: NodeDocument< 1, T >,
	options?: SimplifyOptions
): NodeDocument< 1, NodeType >;

export function simplify(
	node: NodeDocument | NodeType | Array< NodeType >,
	{ mergeObjects = false }: SimplifyOptions = { }
)
: typeof node
{
	const ctx: Required< SimplifyOptions > & SimplifyContext = {
		mergeObjects,
		refs: new Map( ),
	};

	if ( Array.isArray( node ) )
		return node.map( node => simplifyImpl( node, ctx ) );

	if ( isNodeDocument( node ) )
	{
		const simplified = {
			...node,
			types: simplify( ( node as NodeDocument ).types, ctx ),
		} as NodeDocument;

		if ( !mergeObjects )
			return simplified;

		// Run simplification again, with the named refs available to merge
		// further, if necessary

		simplified.types.forEach( type =>
		{
			ctx.refs.set( type.name, type );
		} );
		simplified.types =
			simplified.types.map( node => simplifyImpl( node, ctx ) );

		return simplified;
	}

	return simplifyImpl( node, ctx );
}

interface SimplifyContext
{
	refs: Map< string, NodeType >;
}

export function simplifyImpl< Type extends NodeType | NamedType >(
	node: Type,
	ctx: Required< SimplifyOptions > & SimplifyContext
)
: Type
{
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
		const and = maybeMergeObjects(
			simplifyIntersection(
				( [ ] as NodeType[ ] ).concat(
					...node.and.map( node =>
					{
						const simplifiedNode = simplify( node );
						return ( simplifiedNode as AndType ).and
							? ( simplifiedNode as AndType ).and
							: [ simplifiedNode ];
					} )
				)
			),
			ctx
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

function maybeMergeObjects(
	nodes: Array< NodeType >,
	ctx: Required< SimplifyOptions > & SimplifyContext
)
: Array< NodeType >
{
	const { mergeObjects, refs } = ctx;

	if ( !mergeObjects || nodes.length < 2 )
		return nodes;

	const visited = new Set< NodeType >( );

	const expandNode = ( node: NodeType ): Array< NodeType > =>
	{
		if ( visited.has( node ) )
			throw new Error( `Cyclic dependency detected` );
		visited.add( node );

		if ( node.type === 'object' )
			return [ node ];

		else if ( node.type === 'ref' )
		{
			const ref = refs.get( node.ref );
			if ( !ref )
				// Return the node itself if the ref wasn't found - we'll not
				// try to merge this tree if there are missing refs.
				return [ node ];

			return expandNode( ref );
		}

		else if ( node.type === 'and' )
			return node.and.flatMap( node => expandNode( node ) );

		return [ node ];
	};

	const expanded = nodes.flatMap( node => expandNode( node ) );

	if ( expanded.some( node => node.type !== 'object' ) )
		// Any of the nodes was not an object, so won't try to merge.
		return nodes;

	const objects = expanded as Array< ObjectType >;

	const mergedAnnotations =
		mergeAnnotations( objects.map( obj => extractAnnotations( obj ) ) );

	// Pick the loosest value
	const additionalProperties: boolean | NodeType = objects.reduce(
		( prev, cur ) =>
			prev === false
			? cur.additionalProperties
			: prev === true
			? prev
			: cur.additionalProperties
		,
		false as boolean | NodeType
	);

	const allProperties = new Map< string, ObjectProperty[ ] >( );
	objects.forEach( obj =>
	{
		Object.entries( obj.properties ).forEach( ( [ name, prop ] ) =>
		{
			const props = allProperties.get( name ) ?? [ ];
			props.push( prop );
			allProperties.set( name, props );
		} );
	} );

	const properties = Object.fromEntries(
		[ ...allProperties.entries( ) ]
		.map( ( [ name, props ] ): [ string, ObjectProperty ] =>
		{
			// If any is required, it's required
			const required = props.reduce(
				( prev, cur ) => prev || cur.required,
				false
			);

			const node = simplifyImpl(
				{
					type: 'and',
					and: props.map( prop => prop.node ),
				},
				ctx
			);

			return [ name,  { node, required } ];
		} )
	);

	return [ {
		type: 'object',
		properties,
		additionalProperties,
		...mergedAnnotations,
	} ];
}

// Combine types/nodes where one is more generic than some other, or where
// they can be combined to fewer nodes.
function simplifyUnion( nodes: Array< NodeType > ): Array< NodeType >
{
	const typeMap = splitTypes( nodes );

	if ( typeMap.any.length > 0 )
	{
		const enums = mergeConstEnumUnion(
			typeMap.any.map( ( { node } ) => node )
		);
		if ( enums.length === 0 )
			// If any type in a set of types is an "any" type, without const
			// or enum, the whole union is "any".
			return [ {
				type: 'any',
				...mergeAnnotations( typeMap.any.map( ( { node } ) => node ) ),
			} ];
	}

	for ( const [ _typeName, _types ] of Object.entries( typeMap ) )
	{
		type ThisType = Array< NodeWithOrder< NodeWithConstEnum > >;

		const typeName = _typeName as keyof TypeMap;

		if ( !enumableTypeNames.includes( typeName ) || !_types.length )
			continue;

		const orderedTypes =
			_types as NodeWithOrder< NodeWithConstEnum >[ ];

		const types = orderedTypes.map( ( { node } ) => node );

		const merged = mergeConstEnumUnion( types );

		if ( merged.length === 0 )
			( typeMap[ typeName ] as ThisType ) = [ {
				node: {
					type: typeName,
					...mergeAnnotations( types ),
				} as NodeWithConstEnum,
				order: firstSplitTypeIndex( orderedTypes ),
			} ];
		else
			( typeMap[ typeName ] as ThisType ) = [ {
				node: simplifySingle( {
					type: typeName,
					enum: merged,
					...mergeAnnotations( types ),
				} as NodeWithConstEnum ),
				order: firstSplitTypeIndex( orderedTypes ),
			} ];
	}

	if ( typeMap.or.length > 0 )
		typeMap.or = typeMap.or.filter( ( { node } ) => node.or.length > 0 );

	if ( typeMap.and.length > 0 )
		typeMap.and = typeMap.and
			.filter( ( { node } ) => node.and.length > 0 );

	return flattenSplitTypeValues( typeMap );
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
			return [ {
				type: 'any',
				...mergeAnnotations( typeMap.any.map( ( { node } ) => node ) ),
			} ];
		else
			// A more precise type will supercede this
			typeMap.any = [ ];
	}

	const cast =
		< T extends Types >( nodes: Array< NodeWithOrder< unknown > > ) =>
			nodes.map( ( { node } ) => node ) as Array< NodeTypeMap[ T ] >;

	if ( typeMap.boolean.length > 1 )
		typeMap.boolean = [ {
			node: intersectConstEnum( [
				...typeMap.boolean.map( ( { node } ) => node ),
				...cast< 'boolean' >( typeMap.any ),
			] ),
			order: firstSplitTypeIndex( typeMap.boolean ),
		} ];

	if ( typeMap.string.length > 1 )
		typeMap.string = [ {
			node: intersectConstEnum( [
				...typeMap.string.map( ( { node } ) => node ),
				...cast< 'string' >( typeMap.any ),
			] ),
			order: firstSplitTypeIndex( typeMap.string ),
		} ];

	if ( typeMap.number.length > 0 && typeMap.integer.length > 0 )
	{
		typeMap.number = [ {
			node: intersectConstEnum( [
				...typeMap.number.map( ( { node } ) => node ),
				...cast< 'number' >( typeMap.integer ),
				...cast< 'number' >( typeMap.any ),
			] ),
			order: firstSplitTypeIndex( typeMap.number ),
		} ];
		typeMap.integer = [ ];
	}
	else if ( typeMap.number.length > 1 )
		typeMap.number = [ {
			node: intersectConstEnum( [
				...typeMap.number.map( ( { node } ) => node ),
				...cast< 'number' >( typeMap.any ),
			] ),
			order: firstSplitTypeIndex( typeMap.number ),
		} ];
	else if ( typeMap.integer.length > 1 )
		typeMap.integer = [ {
			node: intersectConstEnum( [
				...typeMap.integer.map( ( { node } ) => node ),
				...cast< 'integer' >( typeMap.any ),
			] ),
			order: firstSplitTypeIndex( typeMap.integer ),
		} ];

	if ( typeMap.or.length > 0 )
		typeMap.or = typeMap.or.filter( ( { node } ) => node.or.length > 0 );

	if ( typeMap.and.length > 0 )
		typeMap.and = typeMap.and
			.filter( ( { node } ) => node.and.length > 0 );

	return flattenSplitTypeValues( typeMap );
}
