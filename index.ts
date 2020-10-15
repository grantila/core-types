export * from './lib/types'
export { simplify } from './lib'
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
export { MalformedTypeError, UnsupportedError } from './lib/error'
