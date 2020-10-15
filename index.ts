export * from './lib/types'
export { simplify } from './lib'
export {
	ensureArray,
	isPrimitiveType,
	hasConstEnum,
	ComparablePrimitives,
	ComparableArray,
	ComparableObject,
	Comparable,
	isEqual,
	encodePathPart,
	decodePathPart,
	intersection,
	union,
} from './lib/util'
export { MalformedTypeError, UnsupportedError } from './lib/error'
