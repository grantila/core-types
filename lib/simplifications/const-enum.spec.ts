import {
	combineConstAndEnum,
	mergeConstEnumUnion,
	simplifyEnumAndConst,
} from './const-enum.js'


describe( "combineConstAndEnum", ( ) =>
{
	it( "no const or enum", ( ) =>
	{
		expect( combineConstAndEnum( { } ) ).toStrictEqual( [ ] );
	} );

	it( "only const", ( ) =>
	{
		expect(
			combineConstAndEnum( { const: 'foo' } )
		).toStrictEqual(
			[ 'foo' ]
		);
	} );

	it( "only enum", ( ) =>
	{
		expect(
			combineConstAndEnum( { enum: [ 'foo', 'bar' ] } )
		).toStrictEqual(
			[ 'foo', 'bar' ]
		);
	} );

	it( "both const and enum", ( ) =>
	{
		expect(
			combineConstAndEnum( { const: 'baz', enum: [ 'foo', 'bar' ] } )
		).toStrictEqual(
			[ 'baz', 'foo', 'bar' ]
		);
	} );
} );

describe( "mergeConstEnumUnion", ( ) =>
{
	it( "no types", ( ) =>
	{
		expect( mergeConstEnumUnion( [ ] ) ).toStrictEqual( [ ] );
	} );

	it( "one empty type", ( ) =>
	{
		expect( mergeConstEnumUnion( [ { type: 'string' } ] ) )
			.toStrictEqual( [ ] );
	} );

	it( "one empty two other", ( ) =>
	{
		expect( mergeConstEnumUnion( [
			{ type: 'string' },
			{ type: 'string', const: 'foo' },
			{ type: 'string', enum: [ 'foo', 'bar', 'baz' ] },
		] ) ).toStrictEqual( [ ] );
	} );

	it( "one const, one enum", ( ) =>
	{
		expect( mergeConstEnumUnion( [
			{ type: 'string', const: 'foo' },
			{ type: 'string', enum: [ 'bar', 'foo', 'baz' ] },
		] ) ).toStrictEqual( [ 'foo', 'bar', 'baz' ] );
	} );

	// it( "only const", ( ) =>
	// {
	// 	expect(
	// 		mergeConstEnumUnion( { const: 'foo' } )
	// 	).toStrictEqual(
	// 		[ 'foo' ]
	// 	);
	// } );

	// it( "only enum", ( ) =>
	// {
	// 	expect(
	// 		mergeConstEnumUnion( { enum: [ 'foo', 'bar' ] } )
	// 	).toStrictEqual(
	// 		[ 'foo', 'bar' ]
	// 	);
	// } );

	// it( "both const and enum", ( ) =>
	// {
	// 	expect(
	// 		mergeConstEnumUnion( { const: 'baz', enum: [ 'foo', 'bar' ] } )
	// 	).toStrictEqual(
	// 		[ 'baz', 'foo', 'bar' ]
	// 	);
	// } );
} );

describe( "simplifyEnumAndConst", ( ) =>
{
	describe( "boolean", ( ) =>
	{
		it( "without enum/const", ( ) =>
		{
			expect(
				simplifyEnumAndConst( { type: 'boolean' } )
			).toStrictEqual(
				{ type: 'boolean' }
			);
		} );

		it( "with 1 const", ( ) =>
		{
			expect(
				simplifyEnumAndConst( { type: 'boolean', const: false } )
			).toStrictEqual(
				{ type: 'boolean', const: false }
			);
		} );

		it( "with 1 enum", ( ) =>
		{
			expect(
				simplifyEnumAndConst( { type: 'boolean', enum: [ false ] } )
			).toStrictEqual(
				{ type: 'boolean', const: false }
			);
		} );

		it( "with 2 enum", ( ) =>
		{
			expect(
				simplifyEnumAndConst( { type: 'boolean', enum: [ false, true ] } )
			).toStrictEqual(
				{ type: 'boolean' }
			);
		} );
	} );

	describe( "string", ( ) =>
	{
		it( "without enum/const", ( ) =>
		{
			expect(
				simplifyEnumAndConst( { type: 'string' } )
			).toStrictEqual(
				{ type: 'string' }
			);
		} );

		it( "with 1 const", ( ) =>
		{
			expect(
				simplifyEnumAndConst( { type: 'string', const: 'foo' } )
			).toStrictEqual(
				{ type: 'string', const: 'foo' }
			);
		} );

		it( "with 1 enum", ( ) =>
		{
			expect(
				simplifyEnumAndConst( { type: 'string', enum: [ 'foo' ] } )
			).toStrictEqual(
				{ type: 'string', const: 'foo' }
			);
		} );

		it( "with 2 enum", ( ) =>
		{
			expect(
				simplifyEnumAndConst(
					{ type: 'string', enum: [ 'foo', 'bar' ] }
				)
			).toStrictEqual(
				{ type: 'string', enum: [ 'foo', 'bar' ] }
			);
		} );

		it( "with duplicate enum and const", ( ) =>
		{
			const { enum: _enum, ...rest } = simplifyEnumAndConst(
				{
					type: 'string',
					const: 'bar',
					enum: [ 'foo', 'bar', 'foo' ]
				}
			);

			expect( rest ).toStrictEqual( { type: 'string' } );
			expect( _enum?.sort( ) ).toStrictEqual( [ 'foo', 'bar' ].sort( ) );
		} );
	} );
} );
