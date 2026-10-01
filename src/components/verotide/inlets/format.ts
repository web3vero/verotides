// Small, pure formatting helpers shared by the /inlets components.
//
// Why a separate file: the page and several components all need "show this timestamp in Eastern
// time" and "turn 116 degrees into ESE". Keeping them here means every number on the page is
// formatted the same way, and the components stay about layout.

/** The 16 compass points, starting at north and going clockwise every 22.5 degrees. */
const POINTS = [
  'N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
  'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW',
] as const;

/** 116 -> "ESE". Each point owns a 22.5 degree wedge centred on its bearing, hence the +11.25. */
export function compassPoint(deg: number): string {
  const d = ((deg % 360) + 360) % 360; // normalise any input into 0-359.99
  return POINTS[Math.floor((d + 11.25) / 22.5) % 16];
}

/** 116 -> "116° (ESE)". Used wherever a bearing is shown as text. */
export function bearingLabel(deg: number): string {
  return `${Math.round(deg)}° (${compassPoint(deg)})`;
}

// Intl formatters are built once at module load; building one per call is slow.
const TIME = new Intl.DateTimeFormat('en-US', {
  timeZone: 'America/New_York', // the site is about Vero Beach, so always show local time
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
  timeZoneName: 'short', // prints EDT / EST so the reader is never guessing
});

/** ISO UTC string -> "Sep 30, 8:24 PM EDT". Returns 'unavailable' for bad input instead of throwing. */
export function etTime(iso: string | null | undefined): string {
  if (!iso) return 'unavailable';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? 'unavailable' : TIME.format(d);
}

/** One decimal place, e.g. 1.52 -> "1.5". */
export function oneDecimal(n: number): string {
  return n.toFixed(1);
}
