
export interface LineColumn
{
	line: number;
	column: number;
	offset: number;
}

export interface LocationWithLineColumn {
    start?: LineColumn;
    end?: LineColumn;
}

export interface LocationOffset
{
	start?: number;
	end?: number;
}

export type Location =
	| LocationWithLineColumn
	| LocationOffset;

export interface CoreTypeAnnotations
{
	name?: string;
	title?: string;
	description?: string;
	examples?: string | Array< string >;
	default?: string;
	see?: string | Array< string >;
	comment?: string;
	loc?: LocationOffset | LocationWithLineColumn;
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

export type ArrayType< T = unknown > =
	& NodeArrayCoreType
	& GenericTypeInfo< Array< T > >
	& CoreTypeAnnotations;

export interface NodeTupleCoreType
{
	type: 'tuple';
	elementTypes: Array< NodeType >;
	minItems: number;
	additionalItems: boolean | NodeType;
}

export type TupleType< T extends unknown[ ] = unknown[ ] > =
	& NodeTupleCoreType
	& GenericTypeInfo< T >
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

export type NodePath = Array< string | number >;

export interface NodeDocument<
	Version extends number = 1,
	T extends NodeType = NodeType
>
{
	version: Version;
	types: Array< NamedType< T > >;
}

export interface ConversionResult< T = string >
{
	data: T;
	convertedTypes: Array< string >;
	notConvertedTypes: Array< string >;
}
