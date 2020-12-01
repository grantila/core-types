import { LineColumn, LocationOffset, LocationWithLineColumn } from './types'
import { isNonNullable } from './util';


export function positionToLineColumn( text: string, pos: number )
: LineColumn
{
	const line = text.slice( 0, pos ).split( "\n" ).length;
	const columnIndex = text.lastIndexOf( "\n", pos );
	return columnIndex === -1
		? { offset: pos, line, column: pos }
		: { offset: pos, line, column: pos - columnIndex };
}

export function locationToLineColumn(
	text: string,
	loc: LocationOffset | LocationWithLineColumn
)
: LocationWithLineColumn
{
	if ( typeof loc.start === 'object' )
		return loc as LocationWithLineColumn;

	return {
		start: typeof loc.start === 'undefined'
			? undefined
			: positionToLineColumn( text, loc.start ),
		...(
			loc.end == null
			? { }
			: { end: positionToLineColumn( text, loc.end as number ) }
		),
	};
}

export function getPositionOffset< T extends LineColumn | number | undefined >(
	pos: T
)
: T extends undefined ? undefined : number
{
	type Ret = T extends undefined ? undefined : number;

	if ( typeof pos === 'undefined' )
		return pos as undefined as Ret;
	else if ( typeof pos === 'number' )
		return pos as number as Ret;
	return pos.offset as Ret;
}

/**
 * Use the smallest {start} and the biggest {end} to make a range consiting of
 * all locations
 */
export function mergeLocations(
	locations: Array< LocationOffset | LocationWithLineColumn | undefined >
)
: LocationOffset | LocationWithLineColumn | undefined
{
	interface Boundary {
		location:
			| LocationOffset[ 'start' ]
			| LocationWithLineColumn[ 'end' ]
			| undefined;
		offset: number;
	}
	let low: Boundary | undefined;
	let high: Boundary | undefined;

	const getOffset =
		( loc: LocationOffset[ 'end' ] | LocationWithLineColumn[ 'end' ] ) =>
			typeof loc === 'number' ? loc : loc?.offset;

	locations
		.filter( isNonNullable )
		.forEach( ( { start, end } ) =>
		{
			const startOffset = getOffset( start );
			const endOffset = getOffset( end );
			if ( startOffset !== undefined )
			{
				if (
					!low
					||
					typeof low.location === 'number'
					&&
					low.location === startOffset
					||
					low.offset > startOffset
				)
					low = {
						location: start,
						offset: startOffset,
					};
			}
			if ( endOffset !== undefined )
			{
				if (
					!high
					||
					typeof high.location === 'number'
					&&
					high.location === startOffset
					||
					high.offset > endOffset
				)
					high = {
						location: end,
						offset: endOffset,
					};
			}
		} );

	const start = low?.location;
	const end = high?.location;

	if ( typeof start === 'undefined' && typeof end === 'undefined' )
		return undefined;

	if (
		typeof ( start as LineColumn )?.offset !== 'undefined'
		&&
		(
			typeof ( end as LineColumn )?.offset !== 'undefined'
			||
			typeof end === 'undefined'
		)
	)
		return {
			start: start as LineColumn,
			end: end as LineColumn | undefined,
		};

	return {
		start: getOffset( start ) ?? 0,
		end: getOffset( end ),
	};
}
