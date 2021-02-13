import { stringifyAnnotations } from "./annotation"
import { CoreTypeAnnotations } from "./types";

describe( "annotation", ( ) =>
{
	describe( "stringifyAnnotations", ( ) =>
	{
		const getAnnotations = ( multi: boolean ): CoreTypeAnnotations => ( {
			name: "Name",
			title: "Title",
			description: "The description\non multiple lines...",
			examples: multi ? [ "Ex1", "Ex2 is here" ] : 'The example',
			default: "Joe",
			see: multi ? [ "This thing", "and this too" ] : 'Interesting',
			comment: "Should be secret by default",
		} );

		it( "should stringify everything corrently with arrays", ( ) =>
		{
			const text = stringifyAnnotations( getAnnotations( true ) );
			expect( text ).toMatchSnapshot( );
		} );

		it( "should stringify everything corrently with singles", ( ) =>
		{
			const text = stringifyAnnotations( getAnnotations( false ) );
			expect( text ).toMatchSnapshot( );
		} );
	} );
} );
