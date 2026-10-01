// Small display helpers for the /lagoon page.
//
// WHY: the data layer speaks ISO-8601 UTC strings ("2026-10-01T00:30:00Z"), but visitors live in
// Florida. Everything shown on screen is converted to America/New_York here, in ONE place, so no
// component ever formats a time differently from another. Intl handles daylight saving for us.

import type { IsoUtc } from '@/lib/verotide/lagoon-types';

const TZ = 'America/New_York';

// Intl formatters are slowish to construct, so build each once at module load and reuse.
const timeFmt = new Intl.DateTimeFormat('en-US', { timeZone: TZ, hour: 'numeric', minute: '2-digit' });
const dayFmt = new Intl.DateTimeFormat('en-US', { timeZone: TZ, month: 'short', day: 'numeric' });
const weekdayFmt = new Intl.DateTimeFormat('en-US', { timeZone: TZ, weekday: 'short' });
// hourCycle h23 gives 0-23, which makes "is it midnight / noon in Florida" a plain number test.
const hourFmt = new Intl.DateTimeFormat('en-US', { timeZone: TZ, hour: 'numeric', hourCycle: 'h23' });

/** "2:41 AM" (Eastern). */
export const fmtTime = (iso: IsoUtc | number): string => timeFmt.format(new Date(iso));

/** "Oct 1" (Eastern). */
export const fmtDay = (iso: IsoUtc | number): string => dayFmt.format(new Date(iso));

/** "Wed Oct 1, 2:41 AM ET" - the full label used in tables and the "as of" line. */
export const fmtStamp = (iso: IsoUtc | number): string =>
  `${weekdayFmt.format(new Date(iso))} ${fmtDay(iso)}, ${fmtTime(iso)} ET`;

/** Hour of day (0-23) in Eastern time. */
export const etHour = (ms: number): number => Number(hourFmt.format(new Date(ms)));

/** Signed feet with 2 decimals: "+0.93 ft" / "-0.40 ft". Uses a real minus sign for legibility. */
export const fmtSigned = (ft: number): string => `${ft >= 0 ? '+' : '−'}${Math.abs(ft).toFixed(2)} ft`;

/** Plain feet: "0.27 ft" (negative shown with a minus sign). */
export const fmtFt = (ft: number): string => `${ft < 0 ? '−' : ''}${Math.abs(ft).toFixed(2)} ft`;
