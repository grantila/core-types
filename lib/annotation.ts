import { mergeLocations } from "./location";
import type { CoreTypeAnnotations } from "./types"
import { ensureArray } from "./util"


export function mergeAnnotations( nodes: Array< CoreTypeAnnotations > )
: CoreTypeAnnotations
{
	const nonEmpty = < T >( t: T ): t is NonNullable< T > => !!t;
	const join = < T >( t: Array< T > ) =>
		t.filter( nonEmpty ).join( "\n" ).trim( );

	const name = nodes.find( n => n.name )?.name;
	const title = join( nodes.map( n => n.title ) );
	const description = join( nodes.map( n => n.description ) );
	const examples =
		( [ ] as Array< string > ).concat(
			...nodes.map( n => ensureArray( n.examples ) )
		)
		.filter( nonEmpty );
	const _default = join( nodes.map( n => n.default ) );
	const see =
		( [ ] as Array< string > ).concat(
			...nodes.map( n => ensureArray( n.see ) )
		)
		.filter( nonEmpty );
	const comment = join( nodes.map( n => n.comment ) );
	const loc = mergeLocations( nodes.map( n => n.loc ) );

	return {
		...( name ? { name } : { } ),
		...( title ? { title } : { } ),
		...( description ? { description } : { } ),
		...(
			examples.length > 0
			? { examples: arrayOrSingle( examples ) }
			: { }
		),
		...( _default ? { default: _default } : { } ),
		...(
			see.length > 0
			? { see: arrayOrSingle( see ) }
			: { }
		),
		...( comment ? { comment } : { } ),
		...( loc ? { loc } : { } ),
	};
}

export function extractAnnotations( node: CoreTypeAnnotations )
: CoreTypeAnnotations
{
	const { title, description, examples, default: _default, comment } = node;
	return {
		...( title ? { title } : { } ),
		...( description ? { description } : { } ),
		...( examples ? { examples } : { } ),
		...( _default ? { default: _default } : { } ),
		...( comment ? { comment } : { } ),
	};
}

export interface StringifyAnnotationsOptions
{
	/**
	 * Include the comment part of the annotation
	 */
	includeComment?: boolean;

	/**
	 * Format whitespace so that the comment can be either wrapped within
	 * a \/* and *\/ boundary or prefixed with //
	 */
	formatWhitespace?: boolean;
}

function wrapWhitespace( text: string ): string
{
	if ( !text.includes( "\n" ) )
		return text.startsWith( " " ) ? text : ` ${text}`;

	return [
		"*",
		text.split( "\n" ).map( line => ` * ${line}` ).join( "\n" ),
		" "
	].join( "\n" );
}

function makeSafeComment( text: string ): string
{
	return text.replace( /\*\//g, '*\\/' );
}

export function stringifyAnnotations(
	node: CoreTypeAnnotations,
	{
		includeComment = false,
		formatWhitespace = false,
	}: StringifyAnnotationsOptions = { }
)
: string
{
	const { title, description, examples, default: _default, comment } = node;
	const fullComment = makeSafeComment(
		[
			title,
			description,
			...( examples == undefined ? [ ] : [
				formatExamples( ensureArray( examples ) )
			] ),
			...( _default === undefined ? [ ] : [
				formatDefault( _default )
			] ),
			...( includeComment ? [ comment ] : [ ] ),
		]
		.filter( v => v )
		.join( "\n\n" )
		.trim( )
	);

	return formatWhitespace && fullComment
		? wrapWhitespace( fullComment )
		: fullComment;
}

function arrayOrSingle< T >( arr: Array< T > ): T | Array< T >
{
	if ( arr.length === 1 )
		return arr[ 0 ];
	return arr;
}

function formatExamples( examples: Array< string > ): string
{
	const lines =
		examples.map( example =>
			"@example\n" + indent( stringify( example ).split( "\n" ), 4 )
		)
		.join( "\n" );

	return lines.trim( );
}

function formatDefault( _default: string ): string
{
	const lines = [
		"@default",
		indent( stringify( _default ).split( "\n" ), 4 )
	]
	.join( "\n" );

	return lines.trim( );
}

function stringify( value: any )
{
	return JSON.stringify( value, null, 2 );
}

function indent( lines: Array< string >, indent: number, bullet = false )
{
	return lines
		.map( ( line, index ) =>
		{
			const prefix =
				index === 0 && bullet
				? ( ' '.repeat( indent - 2 ) + "* " )
				: ' '.repeat( indent );
			return prefix + line;
		} )
		.join( "\n" );
}
