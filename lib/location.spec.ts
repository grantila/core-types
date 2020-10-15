import {
	positionToLineColumn,
	locationToLineColumn,
	mergeLocations,
} from './location'


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
		it( "", ( ) =>
		{
			locationToLineColumn;
		} );
	} );

	describe( "mergeLocations", ( ) =>
	{
		it( "numbers only", ( ) =>
		{
			mergeLocations( [
				undefined,
				{
					start: 5,
					end: 4,
				},
				{
					start: 3,
				}
			] );
		} );
	} );
} );
