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
	intersection,
	union,
	isNonNullable,
} from './lib/util'
export {
	mergeAnnotations,
	extractAnnotations,
	stringifyAnnotations,
	stripAnnotations,
	stringify,
	formatExamples,
	formatDefault,
	formatSee,
} from './lib/annotation'
export {
	CoreTypesErrorMeta,
	MalformedTypeError,
	UnsupportedError,
	RelatedError,
	WarnFunction,
	throwUnsupportedError,
	throwRelatedError,
	isCoreTypesError,
	decorateErrorMeta,
	decorateError,
} from './lib/error'
export {
	positionToLineColumn,
	locationToLineColumn,
	getPositionOffset,
	mergeLocations,
} from './lib/location'
