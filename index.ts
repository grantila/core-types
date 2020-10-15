export * from './lib/types'
export { simplify } from './lib/simplify'
export { validate } from './lib/validate'
export {
	ComparablePrimitives,
	ComparableArray,
	ComparableObject,
	Comparable,
	ensureArray,
	isPrimitiveType,
	hasConstEnum,
	isEqual,
	encodePathPart,
	decodePathPart,
	intersection,
	union,
} from './lib/util'
export {
	mergeAnnotations,
	extractAnnotations,
	stringifyAnnotations,
} from './lib/annotation'
export {
	CoreTypesErrorMeta,
	MalformedTypeError,
	UnsupportedError,
	throwUnsupportedError,
} from './lib/error'
export {
	positionToLineColumn,
	locationToLineColumn,
} from './lib/location'
