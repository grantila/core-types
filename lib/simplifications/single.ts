import { NodeType, AndType, OrType } from '../types'
import { simplifyEnumAndConst } from './const-enum'


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
