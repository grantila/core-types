import {
	positionToLineColumn,
	locationToLineColumn,
	getPositionOffset,
	mergeLocations,
} from './location'
import { LocationWithLineColumn } from './types'


describe( "location", ( ) =>
{
	describe( "positionToLineColumn", ( ) =>
	{
		it( "empty string, pos 0", ( ) =>
		{
			expect( positionToLineColumn( "", 0 ) ).toStrictEqual( {
				line: 1,
				column: 0,
				offset: 0,
			} );
		} );
	} );

	describe( "locationToLineColumn", ( ) =>
	{
		it( "should return location if start is an object", ( ) =>
		{
			const loc = { start: { } } as LocationWithLineColumn;
			expect( locationToLineColumn( '', loc ) ).toBe( loc );
		} );

		it( "should return location undefined if undefined", ( ) =>
		{
			const loc = { start: undefined } as LocationWithLineColumn;
			expect( locationToLineColumn( '', loc ) ).toStrictEqual( loc );
		} );

		it( "should return only start properly", ( ) =>
		{
			const loc = { start: 4 };
			expect( locationToLineColumn( 'hello world', loc ) )
				.toStrictEqual( { start: { offset: 4, line: 1, column: 4 } } );
		} );

		it( "should return start and end properly", ( ) =>
		{
			const loc = { start: 4, end: 6 };
			expect( locationToLineColumn( 'hello world', loc ) )
				.toStrictEqual( {
					start: { offset: 4, line: 1, column: 4 },
					end: { offset: 6, line: 1, column: 6 },
				} );
		} );
	} );

	describe( "getPositionOffset", ( ) =>
	{
		it( "undefined", ( ) =>
		{
			expect( getPositionOffset( undefined ) ).toBe( undefined );
		} );

		it( "number", ( ) =>
		{
			expect( getPositionOffset( 47 ) ).toBe( 47 );
		} );

		it( "object", ( ) =>
		{
			expect( getPositionOffset( { offset: 42, line: 2, column: 4 } ) )
				.toBe( 42 );
		} );
	} );

	describe( "mergeLocations", ( ) =>
	{
		it( "should merge", ( ) =>
		{
			expect(
				mergeLocations( [
					undefined,
					{
						start: 5,
						end: 4,
					},
					{
						start: 3,
					}
				] )
			).toStrictEqual( { start: 3, end: 4 } );
		} );

		it( "should pick lowest start and highest end", ( ) =>
		{
			expect(
				mergeLocations( [
					undefined,
					{
						start: 5,
						end: 10,
					},
					{
						start: 7,
						end: 12,
					}
				] )
			).toStrictEqual( { start: 5, end: 12 } );
		} );
	} );
} );
