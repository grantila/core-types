import { intersectConstEnum } from './intersect-const-enum.js'


describe( "intersectConstEnum", ( ) =>
{
	it( "should fail if no types", ( ) =>
	{
		const thrower = ( ) => intersectConstEnum( [ ] );
		expect( thrower ).toThrowError( /empty/ );
	} );

	it( "should return the only type if only one", ( ) =>
	{
		const theOnlyType = { type: 'string', title: 'Foo' } as const;
		expect( intersectConstEnum( [ theOnlyType ] ) ).toBe( theOnlyType );
	} );

	it( "should intersect const even if enum", ( ) =>
	{
		const result = intersectConstEnum( [
			{ type: 'string', const: 'foo', enum: [ 'fee' ] },
			{ type: 'string', const: 'bar', enum: [ 'baz', 'foo' ] },
		] )
		expect( result ).toStrictEqual( {
			type: 'string',
			enum: [ ],
		} );
	} );

	it( "should intersect const and nothing", ( ) =>
	{
		const result = intersectConstEnum( [
			{ type: 'string', const: 'foo', enum: [ 'fee' ] },
			{ type: 'string' },
		] )
		expect( result ).toStrictEqual( {
			type: 'string',
			const: 'foo',
		} );
	} );

	it( "should intersect const and enum", ( ) =>
	{
		const result = intersectConstEnum( [
			{ type: 'string', const: 'foo', enum: [ 'fee' ] },
			{ type: 'string', enum: [ 'baz', 'foo' ] },
		] )
		expect( result ).toStrictEqual( {
			type: 'string',
			const: 'foo',
		} );
	} );

	it( "should intersect enums", ( ) =>
	{
		const result = intersectConstEnum( [
			{ type: 'string', enum: [ 'foo', 'fee', 'bar', 'baz' ] },
			{ type: 'string', enum: [ 'baz', 'foo' ] },
		] )
		expect( result ).toStrictEqual( {
			type: 'string',
			enum: [ 'foo', 'baz' ],
		} );
	} );

	it( "should intersect annotations", ( ) =>
	{
		const result = intersectConstEnum( [
			{
				type: 'string',
				enum: [ 'foo', 'fee', 'bar', 'baz' ],
				title: 'Foo',
			},
			{
				type: 'string',
				enum: [ 'baz', 'foo' ],
				title: 'Bar',
				description: 'Bars',
			},
		] )
		expect( result ).toStrictEqual( {
			type: 'string',
			enum: [ 'foo', 'baz' ],
			title: 'Foo, Bar',
			description: 'Bars'
		} );
	} );
} );
