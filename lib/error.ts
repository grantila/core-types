export class MalformedTypeError extends Error
{
	constructor( message: string, public blob?: any )
	{
		super( message );
		Object.setPrototypeOf( this, MalformedTypeError.prototype );
	}
}

export class UnsupportedError extends Error
{
	constructor( message: string, public blob: any )
	{
		super( message );
		Object.setPrototypeOf( this, UnsupportedError.prototype );
	}
}
