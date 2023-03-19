export * from './lib/types.js'
export { simplify } from './lib/simplify.js'
export { validate } from './lib/validate.js'
export {
	type Comparable,
	type ComparableArray,
	type ComparableObject,
	type ComparablePrimitives,
	ensureArray,
	hasConstEnum,
	intersection,
	isEqual,
	isNonNullable,
	isPrimitiveType,
	union,
} from './lib/util.js'
export {
	extractAnnotations,
	formatDefault,
	formatExamples,
	formatSee,
	mergeAnnotations,
	stringify,
	stringifyAnnotations,
	stripAnnotations,
} from './lib/annotation.js'
export {
	type CoreTypesErrorMeta,
	type WarnFunction,
	decorateError,
	decorateErrorMeta,
	isCoreTypesError,
	MalformedTypeError,
	MissingReferenceError,
	RelatedError,
	throwRelatedError,
	throwUnsupportedError,
	UnsupportedError,
} from './lib/error.js'
export {
	getPositionOffset,
	locationToLineColumn,
	mergeLocations,
	positionToLineColumn,
} from './lib/location.js'
export {
	type SomeCallback,
	type TraverseCallback,
	type TraverseCallbackArgument,
	some,
	traverse,
} from './lib/traverse.js'
