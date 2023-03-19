import { NodeType, AndType, OrType } from '../types.js'
import { simplifyEnumAndConst } from './const-enum.js'


export function simplifySingle<
	T extends Exclude< NodeType, OrType | AndType >
>( node: T ): T
{
	if (
		node.type === 'boolean' ||
		node.type === 'integer' ||
		node.type === 'number' ||
		node.type === 'string'
	)
		return simplifyEnumAndConst( node );
	else
		return node;
}
