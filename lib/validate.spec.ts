import { MalformedTypeError } from './error'
import { validate } from './validate'

describe( "validate", ( ) =>
{
	it( "should allow simple type", ( ) =>
	{
		expect( validate( { type: 'string' } ) ).toBeUndefined( );
	} );

	it( "should allow 'and' array of simple types", ( ) =>
	{
		expect(
			validate( { type: 'and', and: [ { type: 'string' } ] } )
		).toBeUndefined( );
	} );

	it( "should allow 'or' array of simple types", ( ) =>
	{
		expect(
			validate( { type: 'or', or: [ { type: 'string' } ] } )
		).toBeUndefined( );
	} );

	it( "should disallow empty enum", ( ) =>
	{
		expect( ( ) => validate( { type: 'string', enum: [ ] } ) )
			.toThrowError( MalformedTypeError );
	} );

	it( "should disallow 'and' array of empty enum", ( ) =>
	{
		expect( ( ) =>
			validate( { type: 'and', and: [ { type: 'string', enum: [ ] } ] } )
		).toThrowError( MalformedTypeError );
	} );

	it( "should disallow 'or' array of empty enum", ( ) =>
	{
		expect( ( ) =>
			validate( { type: 'or', or: [ { type: 'string', enum: [ ] } ] } )
		).toThrowError( MalformedTypeError );
	} );

	it( "should disallow enum & const that mismatch", ( ) =>
	{
		expect( ( ) =>
			validate( {
				type: 'string',
				enum: [ 'foo', 'bar' ], const: 'baz'
			} )
		).toThrowError( MalformedTypeError );
	} );

	it( "should disallow 'and' array of enum & const that mismatch", ( ) =>
	{
		expect( ( ) =>
			validate( {
				type: 'and',
				and: [
					{ type: 'string', enum: [ 'foo', 'bar' ], const: 'baz' }
				]
			} )
		).toThrowError( MalformedTypeError );
	} );

	it( "should disallow 'or' array of enum & const that mismatch", ( ) =>
	{
		expect( ( ) =>
			validate( {
				type: 'or',
				or: [
					{ type: 'string', enum: [ 'foo', 'bar' ], const: 'baz' }
				]
			} )
		).toThrowError( MalformedTypeError );
	} );
} );
