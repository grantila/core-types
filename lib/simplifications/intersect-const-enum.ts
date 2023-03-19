import { mergeAnnotations } from '../annotation.js'
import type { CoreTypeAnnotations, NodeWithConstEnum } from '../types.js'
import { type Comparable, intersection } from '../util.js'


export function intersectConstEnum< T extends NodeWithConstEnum >(
	nodes: Array< T >
)
: Pick< T, 'type' | 'const' | 'enum' | keyof CoreTypeAnnotations >
{
	if ( nodes.length === 0 )
		throw new Error(
			"Cannot intersect const and enum from an empty array of nodes"
		);

	if ( nodes.length === 1 )
		return nodes[ 0 ];

	const elements = nodes
		.map( ( node ): Array< Comparable > | undefined =>
			typeof node.const !== 'undefined'
			? [ node.const as Comparable ]
			: typeof node.enum !== 'undefined'
			? node.enum as Array< Comparable >
			: undefined
		)
		.filter( < T >( v: T ): v is NonNullable< T > => !!v );

	const constEnum = elements.slice( 1 ).reduce(
		( prev, cur ) => intersection( prev, cur ),
		elements[ 0 ]
	);

	return {
		type: nodes[ 0 ].type,
		...( constEnum.length === 1 ? { const: constEnum[ 0 ] } : { } ),
		...( constEnum.length !== 1 ? { enum: constEnum } : { } ),
		...mergeAnnotations( nodes ),
	};
}
