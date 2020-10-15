# core-types

This package provides TypeScript types describing core types useful in TypeScript, JavaScript, JSON, JSON Schema etc.

The types describeable by this package are:
 * any (any of the below types)
 * null
 * boolean (`true`, `false`)
 * string
 * number and integer; distinguished in JSON Schema, equivalent in TypeScript
 * object; key-value of core types where the key is a string
 * array; list of arbitrary length of a specific core type
 * tuple; list of specific length with distinguished core types in each position
 * unions and intersections of the above
   * union; `{ or: [ core-types... ] }`
   * intersection; `{ and: [ core-types... ] }`

The above describes JSON completely, and is a lowest common denominator for describing types useful for JSON, JSON Schema and TypeScript. Think of it as an *extremely* simplified version of JSON Schema.


# See

This package is used by [`json-schema-to-core-types`]() and [`core-types-to-ts`]() hence implicitly [`schema-ts`]().


# Usage

`core-types` provides TypeScript interfaces and types describing the different types. They are all combined in the union type `Node`. There's also a helper function `simplify` which will optimize a core type (a `Node`) and combine unions and intersections, extract single unions and intersections and combine types when they are subsets of each other or a simpler type.

You can think of the generic type `Node` as:

```ts
type Node =
	{
		name?: string;
	}
	&
	(
		| { type: ..., const: ..., enum: ... } // An actual type
		| { or: Node[ ] }                      // A union type
		| { and: Node[ ] }                     // An intersection type
	);
```

Example:

```ts
import { Node, simplify } from 'core-types'

const type: Node = {
	or: [
		{
			type: 'number',
			enum: [ 17, 42 ],
		},
		{
			or: [
				{
					type: 'number',
					enum: [ 1 ],
				},
				{
					type: 'string'
				}
			]
		}
	]
};

const simplifiedType = simplify( type );

/**
 * simplifiedType is now: {
 *   or: [
 *     {
 *       type: 'number'
 *       enum: [ 1, 17, 42 ],
 *     },
 *     {
 *       type: 'string'
 *     }
 *   ]
 * }
 */
```


# Specification

The types are defined in a string union as:

```ts
type Types =
	| 'any'
	| 'null'
	| 'string'
	| 'number'
	| 'integer'
	| 'boolean'
	| 'object'
	| 'array'
	| 'tuple';
```

A `Node` is either a primitive node type, an array type, tuple type or object type. A primitive node type has the form:

```ts
interface NodePrimitiveType< T >
{
	type: Types;          // as above
	const?: T;            // a specific const value, as in JSON Schema, or:
	enum?: Array< T >;    // an enum of values, as in JSON Schema
	description?: string; // a description of this type
}
```

An object `Node` (called `NodeObjectType`) has the following form:

```ts
interface NodeObjectType extends NodePrimitiveType
{
	properties?: {
		[ name: string ]: Node;
	};
}
```

An array type as the following form:

```ts
interface NodeArrayType extends NodePrimitiveType
{
	elementType: Node;
}
```

An array type as the following form:

```ts
interface NodeTupleType extends NodePrimitiveType
{
	elementTypes: Array< Node >;
}
```

The generic `Node` can be seen as:

```ts
type Node =
	| AnyType
	| NullType
	| StringType
	| NumberType
	| IntegerType
	| BooleanType
	| NodeObjectType
	| NodeArrayType
	| NodeTupleType
	| OrType
	| AndType;
```
