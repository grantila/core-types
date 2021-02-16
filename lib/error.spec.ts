import {
	CoreTypesError,
	MalformedTypeError,
	UnsupportedError,
	RelatedError,
	throwUnsupportedError,
	throwRelatedError,
	isCoreTypesError,
	decorateError,
	decorateErrorMeta,
	CoreTypesErrorMeta,
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

	describe( "isCoreTypesError", ( ) =>
	{
		it( "should be true for CoreTypesErrors", ( ) =>
		{
			const err1 = catchError(
				( ) => throwUnsupportedError( "foo", { type: 'string' } )
			);
			expect( isCoreTypesError( err1 ) ).toBe( true );

			const err2 = catchError(
				( ) => throwRelatedError( err1 )
			);
			expect( isCoreTypesError( err2 ) ).toBe( true );
		} );

		it( "should be false for non-CoreTypesErrors", ( ) =>
		{
			expect( isCoreTypesError( new Error( ) ) ).toBe( false );
		} );
	} );

	describe( "decorateError", ( ) =>
	{
		it( "should", ( ) =>
		{
			const err = catchError(
				( ) =>
					throwRelatedError( new Error( 'rel' ), { source: 'src' } )
			);
			decorateError( err, { filename: 'file' } );

			expect( err.filename ).toEqual( 'file' );
		} );
	} );

	describe( "decorateErrorMeta", ( ) =>
	{
		it( "should", ( ) =>
		{
			const target: CoreTypesErrorMeta = {
				blob: { blobby: true },
				path: [ 'a' ],
				loc: { start: { offset: 4, line: 1, column: 4 } },
				source: 'src',
				filename: 'file',
			};
			const bak = JSON.parse( JSON.stringify( target ) );
			const out = decorateErrorMeta(
				target,
				{
					blob: { blobby: false },
					path: [ 'b' ],
					loc: { start: { offset: 6, line: 1, column: 6 } },
					source: 'src-data',
					filename: 'file.x',
				}
			);

			expect( out ).toBe( target );
			expect( target ).toStrictEqual( bak );
		} );
	} );
} );
