[![npm version][npm-image]][npm-url]
[![downloads][downloads-image]][npm-url]
[![build status][build-image]][build-url]
[![coverage status][coverage-image]][coverage-url]
[![Language grade: JavaScript][lgtm-image]][lgtm-url]


# core-types

This package provides TypeScript types describing core types useful in TypeScript, JavaScript, JSON, JSON Schema etc. It also contains functions for simplifying unnecessarily complex types, as well helper utilities for other packages converting to/from core-types and another type system.

Using core-types, e.g. implementing conversions to other type systems is easy, since core-types is relatively small and well defined.

 * [See](#see) use cases and other packages using this package
 * [Usage](#usage)
   * [simplify](#simplify) types, merge, flatten and remove unncessary types
   * [validate](#validate) types
   * [helpers](#helpers) for package implementors
 * [Specification](#specification) of the types in this package are:
   * [any](#any-type) (any of the below types)
   * [null](#null-type)
   * [boolean](#boolean-type) (`true`, `false`)
   * [string](#string-type)
   * [number](#number-type) and integer; distinguished in JSON Schema, equivalent in TypeScript
   * [object](#object-type); key-value of core types where the key is a string
   * [array](#array-type); list of arbitrary length of a specific core type
   * [tuple](#tuple-type); list of specific length with distinguished core types in each position
   * [ref](#ref-type) a reference to a named type
   * unions and intersections of the above
     * [union](#union-type); `{ or: [ core-types... ] }`
     * [intersection](#intersection-type); `{ and: [ core-types... ] }`

The above describes JSON completely, and is a lowest common denominator for describing types useful for JSON, JSON Schema and TypeScript. Think of it as an *extremely* simplified version of JSON Schema.


# See

This package is used by [`core-types-json-schema`][core-types-json-schema-github-url] [![npmjs][core-types-json-schema-npm-image]][core-types-json-schema-npm-url] (converting to and from JSON Schema), [`core-types-ts`][core-types-ts-github-url] [![npmjs][core-types-ts-npm-image]][core-types-ts-npm-url] (converting to and from TypeScript types/interfaces) and [`core-types-graphql`][core-types-graphql-github-url] [![npmjs][core-types-graphql-npm-image]][core-types-graphql-npm-url] (converting to and from GraphQL) hence implicitly [`schema-ts`][schema-ts-github-url] [![npmjs][schema-ts-npm-image]][schema-ts-npm-url] (conversion between JSON Schema, TypeScript and GraphQL through core-types).


# Usage

To create a core-types type, just cast it to `NodeType`.

```ts
import type { NodeType } from 'core-types'

const myStringType: NodeType = { type: 'string' };
```

For more information on the specific types, see the [Specification](#specification).


## simplify

The function `simplify` can take a type, or an array of types, and returns simplified versions.

Examples of simpifications performed:
 * An empty `and` or `or` will often be removed.
 * A union of `any`, `string` and `union` (except for `const` and `enum`) can be simplified as just `any`.
 * An intersection of `any` and `string` can be simplified to `string`.
 * An `or` containing child `or`s, will be flattened to the parent `or`.
 * and more...

The simplify function is type-wise *lossless*, but can remove annotations (e.g. descriptions). It is however usually recommended to perform a simplification after a type has been converted *to* core-types before converting to another type system.

```ts
import { simplify } from 'core-types'

const simplified = simplify( myType );

simplify( {
	type: 'or',
	or: [
		{ type: 'or', or: [ { type: 'string' } ] },
		{ type: 'any', const: 'foo' }
	]
} ); // { type: 'string', const: 'foo' }
```


## validate

The `validate` function validates that a `NodeType` type tree is valid.

It ensures e.g.
 * Non-negative *integer* `minItems`
 * Non-mismatching enums and const if both are specified.

```ts
import { validate } from 'core-types'

validate( myType ); // Throws error if not valid
```


## helpers

When implementing conversions to and from core-types, the following helper functions may come in handy:

 * `ensureArray` converts values to arrays of such values, or returns arrays as-is. null and undefined become empty array
 * `isPrimitiveType` returns true for primitive `NodeType`s
 * `hasConstEnum` returns true for `NodeType`s which has (or can have) `const` and `enum` properties.
 * `isEqual` deep-equal comparison (of JSON compatible non-recursive types)
 * `intersection` returns an array of values found in both of two arrays. Handles primitives as well as arrays and objects (uses `isEqual`)
 * `union` returns an array of unique values from two arrays. Handles primitives as well as arrays and objects (uses `isEqual`)
 * `encodePathPart` -
 * `decodePathPart` -


# Specification

The main type is called `NodeType` and is a union of the specific types. A `NodeType` always has a `type` property of the type `Types`. The `Types` is defined as:

```ts
type Types =
	| 'any'
	| 'null'
	| 'boolean'
	| 'string'
	| 'number'
	| 'integer'
	| 'object'
	| 'array'
	| 'tuple'
	| 'ref'
	| 'and'
	| 'or';
```

Depending on which type is used, other properties in `NodeType` will be required. In fact, the `NodeType` is defined as:

```ts
type NodeType =
	| AnyType
	| NullType
	| BooleanType
	| StringType
	| NumberType
	| IntegerType
	| ObjectType
	| ArrayType
	| TupleType
	| RefType
	| AndType
	| OrType;
```

These types have an optional `name` (string) property which can be converted to be *required* using `NamedType<T = NodeType>`. This is useful when converting to other type systems where at least the top-most types must have names (like JSON Schema definitions or exported TypeScript types/interfaces).

The types also have optional annotation properties `title` (string), `description` (string), `examples` (string or array of strings), `default` (string) and `comment` (string).

All types except `NullType`, `AndType` and `OrType` can have two properties `const` (of type `T`) or `enum` (of type `Array<T>`). The `T` depends on the `NodeType`. These have the same semantics as in JSON Schema, meaning a `const` value is equivalent of an `enum` with only that value. The `enum` can be seen as a type literal union in TypeScript.


## any type

The `AnyType` matches any type. Its `const` and `enum` properties have the element type `T` set to `unknown`.

This corresponds to `any` or `unknown` in TypeScript, and the empty schema `{}` in JSON Schema.

Example: `{ type: 'any' }`


## null type

The `NullType` is simply equivalent to the TypeScript, JavaScript and JSON type `null`.

Example: `{ type: 'null' }`

## boolean type

The `BooleanType` is equivalent to the TypeScript, JavaScript and JSON `Boolean` (`true` and `false`).

The element type `T` for `const` and `enum` is `boolean`.

Example: `{ type: 'boolean', const: false }`


## string type

The `StringType` is equivalent to the TypeScript, JavaScript and JSON type `String`.

The element type `T` for `const` and `enum` is `string`.

Example: `{ type: 'string', enum: [ "foo", "bar" ] }`


## number type

core-types distinguishes between `NumberType` and `IntegerType`.

In TypeScript, JavaScript and JSON they are both equivalent to `Number`. In JSON Schema however, `integer` is a separate type, and can therefore be converted to `core-types` with maintained type information.

The element type `T` for `const` and `enum` is `number`.

Example: `{ type: 'number', enum: [ 17, 42 ] }`


## object type

The `ObjectType` is used to describe the TypeScript type `Record<string, NodeType>` and the JavaScript and JSON type `Object`. In TypeScript or JavaScript, the keys must only be strings, not numbers or symbols.

The element type `T` for `const` and `enum` is `Record<string, any-json-type>`, i.e. plain objects.

Two more properties are required for an `ObjectType`, `properties` and `additionalProperties`.

`properties` is defined as `Record<string, { node: NodeType; required: boolean; }>`.

`additionalProperties` is defined as `boolean | NodeType`. When this is `false`, no additional properties apart from those defined in `properties` are allowed, and if `true` properties are allowed of any type (`AnyType`). Otherwise additional properties are allowed of the defined `NodeType`.

Example:
```ts
{
	type: 'object',
	properties: {
		name: { node: { type: 'string' }, required: true },
		age: { node: { type: 'number' }, required: true },
		level: { node: { type: 'string', enum: [ 'novice', 'proficient', 'expert' ] }, required: false },
	},
	additionalProperties: false,
}
```


## array type

The `ArrayType` is used to describe the TypeScript type `Array<NodeType>` and the JavaScript and JSON type `Array`.

The element type `T` for `const` and `enum` is `Array<any-json-type>`, i.e. arrays of JSON-compatible types defined by the `NodeType` in `elementType`.

The extra and required property `elementType` is of type `NodeType` and defines what types the array can hold.

Example:
```ts
{
	type: 'array',
	elementType: { type: 'string' },
}
```


## tuple type

The `TupleType` describes specific-length arrays where each position has a specific type. It matches the tuple type `[A, B, ...]` in `TypeScript` and is an `Array` in JavaScript and JSON.

The element type `T` for `const` and `enum` is `[...any-json-types]`, i.e. tuples of JSON-compatible types defined by the `NodeType` in the required `elementTypes` and `additionalItems`.

The extra and required properties for `TupleType` are `elementTypes`, `minItems` and `additionalItems`.

`elementTypes` is defined as `[...NodeType]` and describes the valid types for each position in the tuple for the required and individually typed optional tuple elements.

`minItems` is an integer (TypeScript/JavaScript number) defining the minimum required elements and must not be negative. If this is greater than the number of `elementTypes`, although valid in core-types per se, some conversions will limit it to the size of `elementTypes`.

`additionalProperties` is used to describe optional extra elemenents. It is defined as `boolean | NodeType`. When this is `false`, no additional elements are allowed, and if `true` elements are allowed of any type (`AnyType`). Otherwise additional elemenets are allowed of the defined `NodeType`.

Example:
```ts
{
	type: 'tuple',
	elementTypes: [
		{ type: 'string' },
		{ type: 'boolean' }, // Optional, because minItems is 1
	],
	minItems: 1,
	additionalItems: { type: 'number' },
}
```


## ref type

The `RefType` describes references to other named types. Exactly what this means is up to the implementation of the user of core-types, but it is recommended that a reference type in a list of `NodeType`s refers to a named type within that list. This corresponds to TypeScript named types being referred to in the same file as in which the type is defined, or JSON Schema `$ref` references only referring to `#/definitions/*` types.

A `RefType` has a required property `ref` which is a string corresponding to the name of the reference.

Example:
```ts
[
	{
		name: 'User',
		type: 'object',
		properties: {
			name: { node: { type: 'string' }, required: true },
			id: { node: { type: 'number' }, required: true },
		},
		additionalProperties: true,
	},
	{
		name: 'UserList',
		type: 'array',
		elementType: { type: 'ref', ref: 'User' },
	},
]
```


## union type

The `OrType` describes a union of other types. This is equivalent to union types in TypeScript (e.g. `number | string`) and `anyOf` in JSON Schema.

An `OrType` has a required property `or` which is defined as `Array<NodeType>`.

Example:
```ts
{
	type: 'or',
	or: [
		{ type: 'string' },
		{ type: 'number' },
		{ type: 'ref', ref: 'IdType' }, // Defined somewhere...
	},
}
```


## intersection type

The `AndType` describes an intersection of other types. This is equivalent to intersection types in TypeScript (e.g. `A & B`) and `allOf` in JSON Schema.

An `AndType` has a required property `and` which is defined as `Array<NodeType>`.

Example:
```ts
[
	{
		name: 'CommentWithId',
		type: 'and',
		and: [
			{ type: 'ref', ref: 'Comment' },
			{ type: 'ref', ref: 'WithId' },
		},
	},
	{
		name: 'Comment',
		type: 'object',
		properties: {
			line: { node: { type: 'string' }, required: true },
			user: { node: { type: 'ref', ref: 'User' }, required: true },
		},
		additionalProperties: false,
	},
	{
		name: 'WithId',
		type: 'object',
		properties: {
			id: { node: { type: 'string' }, required: true },
		},
		additionalProperties: false,
	},
]
```



[npm-image]: https://img.shields.io/npm/v/core-types.svg
[npm-url]: https://npmjs.org/package/core-types
[downloads-image]: https://img.shields.io/npm/dm/core-types.svg
[build-image]: https://img.shields.io/github/workflow/status/grantila/core-types/Master.svg
[build-url]: https://github.com/grantila/core-types/actions?query=workflow%3AMaster
[coverage-image]: https://coveralls.io/repos/github/grantila/core-types/badge.svg?branch=master
[coverage-url]: https://coveralls.io/github/grantila/core-types?branch=master
[lgtm-image]: https://img.shields.io/lgtm/grade/javascript/g/grantila/core-types.svg?logo=lgtm&logoWidth=18
[lgtm-url]: https://lgtm.com/projects/g/grantila/core-types/context:javascript

[core-types-json-schema-npm-image]: https://img.shields.io/npm/v/core-types-json-schema.svg
[core-types-json-schema-npm-url]: https://npmjs.org/package/core-types-json-schema
[core-types-json-schema-github-url]: https://github.com/grantila/core-types-json-schema
[core-types-ts-npm-image]: https://img.shields.io/npm/v/core-types-ts.svg
[core-types-ts-npm-url]: https://npmjs.org/package/core-types-ts
[core-types-ts-github-url]: https://github.com/grantila/core-types-ts
[core-types-graphql-npm-image]: https://img.shields.io/npm/v/core-types-graphql.svg
[core-types-graphql-npm-url]: https://npmjs.org/package/core-types-graphql
[core-types-graphql-github-url]: https://github.com/grantila/core-types-graphql
[schema-ts-npm-image]: https://img.shields.io/npm/v/schema-ts.svg
[schema-ts-npm-url]: https://npmjs.org/package/schema-ts
[schema-ts-github-url]: https://github.com/grantila/schema-ts
