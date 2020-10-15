import { MalformedTypeError } from "./error"
import { NodeType, NodeWithConstEnum } from "./types"
import { hasConstEnum, isEqual } from "./util"


export function validate( node: NodeType )
{
	if ( hasConstEnum( node ) )
		validateConstEnum( node )

	if ( node.type === 'and' )
		node.and.forEach( subNode => validate( subNode ) );

	if ( node.type === 'or' )
		node.or.forEach( subNode => validate( subNode ) );
}

function validateConstEnum( node: NodeWithConstEnum )
{
	if ( node.enum && node.enum.length === 0 )
		throw new MalformedTypeError( "Empty enum is not allowed", node );

	if ( node.enum && node.const !== undefined )
	{
		if ( !node.enum.some( entry => isEqual( entry, node.const as any ) ) )
			throw new MalformedTypeError(
				"Enum and const are both set, but enum doesn't contain const",
				node
			);
	}

	// TODO: Check data type of enum/const matching type
}
