import {
	CoreTypesError,
	MalformedTypeError,
	UnsupportedError,
	RelatedError,
	throwUnsupportedError,
	throwRelatedError,
} from './error'


const catchError = ( thrower: ( ) => any ): CoreTypesError =>
	{
		try
		{
			thrower( );
		}
		catch ( err )
		{
			return err;
		}
		throw new Error( "No error thrown" );
	}

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

	describe( "throwUnsupportedError", ( ) =>
	{
		it( "should forward data properly", ( ) =>
		{
			const err = catchError(
				( ) =>
				throwUnsupportedError(
					"msg",
					{ type: 'string' },
					[ 'a', 'b' ]
				)
			);
			expect( err ).toBeInstanceOf( UnsupportedError );
			expect( err.message ).toEqual( "msg" );
			expect( err.blob ).toStrictEqual( { type: 'string' } );
			expect( err.path ).toEqual( [ 'a', 'b' ] );
		} );
	} );

	describe( "throwRelatedError", ( ) =>
	{
		it( "should forward data properly", ( ) =>
		{
			const related = new Error( "foo" );
			const err = catchError(
				( ) =>
				throwRelatedError(
					related,
					{
						source: 'src',
						filename: 'file',
					},
				)
			);
			expect( err ).toBeInstanceOf( RelatedError );
			expect( err.message ).toEqual( "foo" );
			expect( err.relatedError ).toBe( related );
			expect( err.source ).toEqual( 'src' );
			expect( err.filename ).toEqual( 'file' );
		} );
	} );
} );
