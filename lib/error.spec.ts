import { MalformedTypeError, UnsupportedError } from './error'

describe( "errors", ( ) =>
{
	describe( "MalformedTypeError", ( ) =>
	{
		it( "should contain the blob", ( ) =>
		{
			const err = new MalformedTypeError( "msg", { blob: { foo: 42 } } );
			expect( err.message ).toEqual( "msg" );
			expect( err.blob ).toStrictEqual( { foo: 42 } );
		} );
	} );

	describe( "UnsupportedError", ( ) =>
	{
		it( "should contain the blob", ( ) =>
		{
			const err = new UnsupportedError( "msg", { blob: { foo: 42 } } );
			expect( err.message ).toEqual( "msg" );
			expect( err.blob ).toStrictEqual( { foo: 42 } );
		} );
	} );
} );
