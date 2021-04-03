import { Location, NodePath, NodeType } from "./types"


export interface CoreTypesErrorMeta
{
	blob?: any;
	path?: NodePath;
	loc?: Location;
	source?: string;
	filename?: string;
	relatedError?: Error;
}

export class CoreTypesError extends Error implements CoreTypesErrorMeta
{
	public blob?: any;
	public path?: NodePath;
	public loc?: Location;
	public source?: string;
	public filename?: string;
	public relatedError?: Error;

	constructor( message: string, meta: CoreTypesErrorMeta = { } )
	{
		super( message );
		Object.setPrototypeOf( this, CoreTypesError.prototype );

		this.blob = meta.blob;
		this.path = meta.path;
		this.loc = meta.loc;
		this.source = meta.source;
		this.filename = meta.filename;
		this.relatedError = meta.relatedError;
	}
}

export class MalformedTypeError extends CoreTypesError
{
	constructor( message: string, meta: CoreTypesErrorMeta = { } )
	{
		super( message, meta );
		Object.setPrototypeOf( this, MalformedTypeError.prototype );
	}
}

export class MissingReferenceError extends CoreTypesError
{
	constructor( ref: string, meta: CoreTypesErrorMeta = { } )
	{
		super( `Refernce to missing type "${ref}"`, meta );
		Object.setPrototypeOf( this, MissingReferenceError.prototype );
	}
}

export class UnsupportedError extends CoreTypesError
{
	constructor( message: string, meta: CoreTypesErrorMeta = { } )
	{
		super( message, meta );
		Object.setPrototypeOf( this, UnsupportedError.prototype );
	}
}

export class RelatedError extends CoreTypesError
{
	constructor( err: Error, meta: CoreTypesErrorMeta = { } )
	{
		super( err.message, { ...meta, relatedError: err } );
		Object.setPrototypeOf( this, RelatedError.prototype );
	}
}

export function throwUnsupportedError(
	msg: string,
	node: NodeType,
	path?: NodePath
)
: never
{
	throw new UnsupportedError(
		msg,
		{
			blob: node,
			...( node.loc ? { loc: node.loc } : { } ),
			...( path ? { path } : { } ),
		}
	);
}

export function throwRelatedError(
	err: Error,
	meta?: Omit< CoreTypesErrorMeta, 'relatedError' >
)
: never
{
	throw new RelatedError( err, meta );
}

export function isCoreTypesError( err: Error | CoreTypesError )
: err is CoreTypesError
{
	return err instanceof CoreTypesError;
}

export function decorateErrorMeta(
	target: CoreTypesErrorMeta,
	source: Partial< CoreTypesErrorMeta >
)
: CoreTypesErrorMeta
{
	if ( source.blob )
		target.blob ??= source.blob;
	if ( source.path )
		target.path ??= source.path;
	if ( source.loc )
		target.loc ??= source.loc;
	if ( source.source )
		target.source ??= source.source;
	if ( source.filename )
		target.filename ??= source.filename;
	return target;
}

export function decorateError< T extends Error >(
	err: T,
	meta: Partial< CoreTypesErrorMeta >
)
: T
{
	if ( isCoreTypesError( err ) )
		decorateErrorMeta( err as CoreTypesErrorMeta, meta );

	return err;
}

export type WarnFunction = ( msg: string, meta?: CoreTypesErrorMeta ) => void;
