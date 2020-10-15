import { NodeType, Types } from './types';
import {
	uniq,
	ensureArray,
	isPrimitiveType,
	hasConstEnum,
	isEqual,
	encodePathPart,
	decodePathPart,
	intersection,
	union,
} from './util'


const nodeify = ( type: Types ): NodeType => ( { type } ) as NodeType;

describe( "utils", ( ) =>
{
	describe( "uniq", ( ) =>
	{
		it( "should work on empty arrays", ( ) =>
		{
			expect( uniq( [ ] ) ).toStrictEqual( [ ] );
		} );

		it( "should work on numerics", ( ) =>
		{
			expect( uniq( [ 2, 4, 2, 3 ] ) ).toStrictEqual( [ 2, 4, 3 ] );
		} );

		it( "should work on strings", ( ) =>
		{
			expect( uniq( [ "a", "b", "a", "c" ] ) )
				.toStrictEqual( [ "a", "b", "c" ] );
		} );

		it( "should work on objects", ( ) =>
		{
			expect(
				uniq( [ { a: 1 }, { b: 2 }, { a: 1 }, { a: 2 }, { c: 3 } ] )
			).toStrictEqual(
				[ { a: 1 }, { b: 2 }, { a: 2 }, { c: 3 } ]
			);
		} );

		it( "should work on arrays", ( ) =>
		{
			expect(
				uniq( [ [ 1, 2 ], [ 1, 3 ], [ 1, 2 ], [ 1, 4 ] ] )
			).toStrictEqual(
				[ [ 1, 2 ], [ 1, 3 ], [ 1, 4 ] ]
			);
		} );
	} );

	describe( "ensureArray", ( ) =>
	{
		it( "should turn null to empty array", ( ) =>
		{
			expect(
				ensureArray( null )
			).toStrictEqual(
				[ ]
			);
		} );

		it( "should turn undefined to empty array", ( ) =>
		{
			expect(
				ensureArray( undefined )
			).toStrictEqual(
				[ ]
			);
		} );

		it( "should turn string into array of string", ( ) =>
		{
			expect(
				ensureArray( "foo" )
			).toStrictEqual(
				[ "foo" ]
			);
		} );

		it( "should return same empty array", ( ) =>
		{
			const arr = [ ] as Array< never >;
			expect( ensureArray( arr ) ).toBe( arr );
		} );

		it( "should return same non-empty array", ( ) =>
		{
			const arr = [ "foo", "bar" ] as Array< never >;
			expect( ensureArray( arr ) ).toBe( arr );
		} );
	} );

	describe( "isPrimitiveType", ( ) =>
	{
		it( "should return true for null", ( ) =>
		{
			expect( isPrimitiveType( nodeify( "null" ) ) ).toBe( true );
		} );

		it( "should return true for string", ( ) =>
		{
			expect( isPrimitiveType( nodeify( "string" ) ) ).toBe( true );
		} );

		it( "should return true for number", ( ) =>
		{
			expect( isPrimitiveType( nodeify( "number" ) ) ).toBe( true );
		} );

		it( "should return true for integer", ( ) =>
		{
			expect( isPrimitiveType( nodeify( "integer" ) ) ).toBe( true );
		} );

		it( "should return true for boolean", ( ) =>
		{
			expect( isPrimitiveType( nodeify( "boolean" ) ) ).toBe( true );
		} );

		it( "should return true for and", ( ) =>
		{
			expect( isPrimitiveType( nodeify( "and" ) ) ).toBe( false );
		} );

		it( "should return true for or", ( ) =>
		{
			expect( isPrimitiveType( nodeify( "or" ) ) ).toBe( false );
		} );

		it( "should return true for ref", ( ) =>
		{
			expect( isPrimitiveType( nodeify( "ref" ) ) ).toBe( false );
		} );

		it( "should return true for any", ( ) =>
		{
			expect( isPrimitiveType( nodeify( "any" ) ) ).toBe( false );
		} );

		it( "should return true for object", ( ) =>
		{
			expect( isPrimitiveType( nodeify( "object" ) ) ).toBe( false );
		} );

		it( "should return true for array", ( ) =>
		{
			expect( isPrimitiveType( nodeify( "array" ) ) ).toBe( false );
		} );

		it( "should return true for tuple", ( ) =>
		{
			expect( isPrimitiveType( nodeify( "tuple" ) ) ).toBe( false );
		} );
	} );

	describe( "hasConstEnum", ( ) =>
	{
		it( "should return false for and", ( ) =>
		{
			expect( hasConstEnum( nodeify( "and" ) ) ).toBe( false );
		} );

		it( "should return false for or", ( ) =>
		{
			expect( hasConstEnum( nodeify( "or" ) ) ).toBe( false );
		} );

		it( "should return true for any", ( ) =>
		{
			expect( hasConstEnum( nodeify( "any" ) ) ).toBe( true );
		} );

		it( "should return true for string", ( ) =>
		{
			expect( hasConstEnum( nodeify( "string" ) ) ).toBe( true );
		} );

		it( "should return true for number", ( ) =>
		{
			expect( hasConstEnum( nodeify( "number" ) ) ).toBe( true );
		} );

		it( "should return true for integer", ( ) =>
		{
			expect( hasConstEnum( nodeify( "integer" ) ) ).toBe( true );
		} );

		it( "should return true for boolean", ( ) =>
		{
			expect( hasConstEnum( nodeify( "boolean" ) ) ).toBe( true );
		} );

		it( "should return true for object", ( ) =>
		{
			expect( hasConstEnum( nodeify( "object" ) ) ).toBe( true );
		} );

		it( "should return true for array", ( ) =>
		{
			expect( hasConstEnum( nodeify( "array" ) ) ).toBe( true );
		} );

		it( "should return true for tuple", ( ) =>
		{
			expect( hasConstEnum( nodeify( "tuple" ) ) ).toBe( true );
		} );

		it( "should return true for ref", ( ) =>
		{
			expect( hasConstEnum( nodeify( "ref" ) ) ).toBe( true );
		} );
	} );

	describe( "isEqual", ( ) =>
	{
		isEqual;
	} );

	describe( "encodePathPart", ( ) =>
	{
		encodePathPart;
	} );

	describe( "decodePathPart", ( ) =>
	{
		decodePathPart;
	} );

	describe( "intersection", ( ) =>
	{
		intersection;
	} );

	describe( "union", ( ) =>
	{
		union;
	} );
} );
