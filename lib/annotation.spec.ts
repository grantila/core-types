import {
	mergeAnnotations,
	wrapWhitespace,
	arrayOrSingle,
	stripAnnotations,
	stringifyAnnotations,
} from "./annotation"
import { CoreTypeAnnotations, NodeType, ObjectProperty } from "./types"


const exampleAnnotation1: Readonly< CoreTypeAnnotations > = Object.freeze( {
	title: 'foo',
	comment: 'comment',
	description: 'description',
	default: 'def',
	examples: [ 'these', 'are', 'examples' ],
	loc: { start: 17, end: 42 },
	name: 'name',
	see: 'see this',
} );

const exampleAnnotation2: Readonly< CoreTypeAnnotations > = Object.freeze( {
	title: 'bar',
	comment: 'comment2',
	description: 'description2',
	default: 'def2',
	examples: [ 'more', 'examples', 'yay' ],
	loc: { start: 32, end: 64 },
	name: 'name2',
	see: 'see this too',
} );

describe( "annotation", ( ) =>
{
	describe( "mergeAnnotations", ( ) =>
	{
		it ( "should handle empty array", ( ) =>
		{
			expect( mergeAnnotations( [ ] ) ).toStrictEqual( { } );
		} );

		it ( "should handle empty documents", ( ) =>
		{
			expect( mergeAnnotations( [ { } ] ) ).toStrictEqual( { } );
		} );

		it ( "should handle one non-empty document", ( ) =>
		{
			expect( mergeAnnotations( [ exampleAnnotation1 ] ) )
				.toStrictEqual( exampleAnnotation1 );
		} );

		it ( "should handle one empty and one non-empty document", ( ) =>
		{
			expect( mergeAnnotations( [ { }, exampleAnnotation1 ] ) )
				.toStrictEqual( exampleAnnotation1 );
		} );

		it ( "should handle two identical documents", ( ) =>
		{
			expect(
				mergeAnnotations( [ exampleAnnotation1, exampleAnnotation1 ] )
			)
				.toStrictEqual( exampleAnnotation1 );
				exampleAnnotation2;
		} );

		it ( "should handle two non-identical documents", ( ) =>
		{
			const ex1 = exampleAnnotation1;
			const ex2 = exampleAnnotation2;
			expect(
				mergeAnnotations( [ ex1, ex2 ] )
			)
				.toStrictEqual( {
					title: `${ex1.title}, ${ex2.title}`,
					comment: `${ex1.comment}\n${ex2.comment}`,
					description: `${ex1.description}\n${ex2.description}`,
					default: `${ex1.default}\n${ex2.default}`,
					examples: [ ...new Set( [
						...ex1.examples as any[], ...ex2.examples as any[]
					] ) ],
					see: [ ex1.see, ex2.see ],
					name: 'name',
					loc: { start: 17, end: 64 },
				} as CoreTypeAnnotations );
		} );
	} );

	describe( "wrapWhitespace", ( ) =>
	{
		it ( "should handle empty comment", ( ) =>
		{
			expect( wrapWhitespace( "" ) ).toBe( " " );
		} );

		it ( "should handle single line comment", ( ) =>
		{
			expect( wrapWhitespace( "foo" ) ).toBe( " foo" );
		} );

		it ( "should handle single line comment with leading space", ( ) =>
		{
			expect( wrapWhitespace( " foo" ) ).toBe( " foo" );
		} );

		it ( "should handle multi line comment", ( ) =>
		{
			expect( wrapWhitespace( "foo\nbar" ) )
				.toBe( "*\n * foo\n * bar\n " );
		} );
	} );

	describe( "arrayOrSingle", ( ) =>
	{
		it ( "should handle empty array", ( ) =>
		{
			expect( arrayOrSingle( [ ] ) ).toStrictEqual( [ ] );
		} );

		it ( "should handle one-sized array", ( ) =>
		{
			expect( arrayOrSingle( [ "foo" ] ) ).toStrictEqual( "foo" );
		} );

		it ( "should handle multi-sized array", ( ) =>
		{
			expect( arrayOrSingle( [ 1, 2 ] ) ).toStrictEqual( [ 1, 2 ] );
		} );
	} );

	describe( "stripAnnotations", ( ) =>
	{
		it ( "should strip everything", ( ) =>
		{
			let shouldAnnotate = true;
			const annotate = ( node: NodeType, force = false ): NodeType => ( {
				...node,
				...(
					( shouldAnnotate || force )
					? {
						comment: 'cmt',
						default: 'def',
						description: 'descr',
						see: 'see',
						title: 'title',
						examples: 'ex',
					}
					: { }
				),
			} );

			const prop = ( node: NodeType ): ObjectProperty => ( {
				required: false,
				node: annotate( node ),
			} );

			const makeNode = ( ): NodeType => ( {
				type: 'object',
				properties: {
					nul: prop( { type: 'null' } ),
					str: prop( { type: 'string' } ),
					int: prop( { type: 'integer' } ),
					num: prop( { type: 'number' } ),
					bool: prop( { type: 'boolean' } ),
					arr: prop( {
						type: 'array',
						elementType: annotate( { type: 'any' } ),
						// These are value literals, not types
						// (although these particular ones may fool you)
						const: [ annotate( { type: 'boolean' }, true ) ],
						enum: [ [ annotate( { type: 'integer' }, true ) ] ],
					} ),
					tup: prop( {
						type: 'tuple',
						minItems: 2,
						elementTypes: [
							annotate( { type: 'number' } ),
							annotate( { type: 'integer' } ),
						],
						additionalItems: annotate( { type: 'string' } )
					} ),
					ref: prop( { type: 'ref', ref: 'R2' } ),
					and: prop( { type: 'and', and: [
						annotate( { type: 'string' } ),
						annotate( { type: 'boolean' } ),
					] } ),
					or: prop( { type: 'or', or: [
						annotate( { type: 'number' } ),
						annotate( { type: 'integer' } ),
					] } ),
				},
				additionalProperties: annotate( { type: 'ref', ref: 'R' } ),
			} );

			const before = makeNode( );
			shouldAnnotate = false;
			const after = makeNode( );

			expect( stripAnnotations( before ) ).toStrictEqual( after );
		} );
	} );

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
