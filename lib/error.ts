import { Location, NodePath, NodeType } from './types'


export interface CoreTypesErrorMeta
{
	blob?: any;
	path?: NodePath;
	loc?: Location;
}

export class MalformedTypeError extends Error implements CoreTypesErrorMeta
{
	public blob?: any;
	public path?: NodePath;
	public loc?: Location;

	constructor( message: string, meta: CoreTypesErrorMeta = { } )
	{
		super( message );
		Object.setPrototypeOf( this, MalformedTypeError.prototype );

		this.blob = meta.blob;
		this.path = meta.path;
		this.loc = meta.loc;
	}
}

export class UnsupportedError extends Error implements CoreTypesErrorMeta
{
	public blob?: any;
	public path?: NodePath;
	public loc?: Location;

	constructor( message: string, meta: CoreTypesErrorMeta = { } )
	{
		super( message );
		Object.setPrototypeOf( this, UnsupportedError.prototype );

		this.blob = meta.blob;
		this.path = meta.path;
		this.loc = meta.loc;
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
