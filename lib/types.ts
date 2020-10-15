export interface CoreTypeAnnotations
{
	name?: string;
	title?: string;
	description?: string;
	examples?: string | Array< string >;
	default?: string;
	comment?: string;
}

export interface AndType extends CoreTypeAnnotations
{
	type: 'and';
	and: NodeType[ ];
}

export interface OrType extends CoreTypeAnnotations
{
	type: 'or';
	or: NodeType[ ];
}

export interface TypeMap
{
	and: void;
	or: void;
	ref: string;
	any: unknown;
	null: null;
	string: string;
	number: number;
	integer: number;
	boolean: boolean;
	object: object;
	array: Array< unknown >;
	tuple: Array< unknown >;
}

export type Types = keyof TypeMap;

export interface Const< T >
{
	const?: T;
}

export interface Enum< T >
{
	enum?: Array< T >;
}

export type GenericTypeInfo< T > =
	& Const< T >
	& Enum< T >;

export interface NodePrimitiveCoreType<
	Type extends 'any' | 'null' | 'string' | 'number' | 'integer' | 'boolean'
>
{
	type: Type;
}

export type NodePrimitiveType<
	Type extends 'any' | 'null' | 'string' | 'number' | 'integer' | 'boolean'
> =
	& NodePrimitiveCoreType< Type >
	& GenericTypeInfo< TypeMap[ Type ] >;

export type AnyType = NodePrimitiveType< 'any' > & CoreTypeAnnotations;
export type NullType = NodePrimitiveCoreType< 'null' > & CoreTypeAnnotations;
export type StringType = NodePrimitiveType< 'string' > & CoreTypeAnnotations;
export type NumberType = NodePrimitiveType< 'number' > & CoreTypeAnnotations;
export type IntegerType = NodePrimitiveType< 'integer' > & CoreTypeAnnotations;
export type BooleanType = NodePrimitiveType< 'boolean' > & CoreTypeAnnotations;

export type PrimitiveType =
	| NullType
	| StringType
	| NumberType
	| IntegerType
	| BooleanType;

export interface NodeRefCoreType
{
	type: 'ref';
	ref: string;
}

export type RefType =
	& NodeRefCoreType
	& GenericTypeInfo< unknown >
	& CoreTypeAnnotations;

export interface ObjectProperty
{
	required: boolean;
	node: NodeType;
}

export interface NodeObjectCoreType
{
	type: 'object';
	properties: {
		[ name: string ]: ObjectProperty;
	};
	additionalProperties: boolean | NodeType;
}

export type ObjectType =
	& NodeObjectCoreType
	& GenericTypeInfo< object >
	& CoreTypeAnnotations;

export interface NodeArrayCoreType
{
	type: 'array';
	elementType: NodeType;
}

export type ArrayType =
	& NodeArrayCoreType
	& GenericTypeInfo< Array< unknown > >
	& CoreTypeAnnotations;

export interface NodeTupleCoreType
{
	type: 'tuple';
	elementTypes: Array< NodeType >;
	minItems: number;
	additionalItems: boolean | NodeType;
}

export type TupleType =
	& NodeTupleCoreType
	& GenericTypeInfo< Array< unknown > >
	& CoreTypeAnnotations;

export interface NodeTypeMap
{
	and: AndType;
	or: OrType;
	ref: RefType;
	any: AnyType;
	null: NullType;
	string: StringType;
	number: NumberType;
	integer: IntegerType;
	boolean: BooleanType;
	object: ObjectType;
	array: ArrayType;
	tuple: TupleType;
}

export type NodeType = NodeTypeMap[ keyof NodeTypeMap ];

export type NamedType< T extends NodeType = NodeType > = T & { name: string; };

export type NodeWithConstEnum =
	| AnyType
	| StringType
	| NumberType
	| IntegerType
	| BooleanType
	| ObjectType
	| ArrayType
	| TupleType
	| RefType;
