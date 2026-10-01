import SunCalc from 'suncalc';

export interface TidePrediction {
  t: string; // Time (e.g., "2026-05-31 08:42")
  v: string; // Height (e.g., "3.2")
  type: string; // "H" or "L"
}

export interface SolunarPeriod {
  start: string;
  end: string;
}

export interface SolunarData {
  major: SolunarPeriod[];
  minor: SolunarPeriod[];
  moon: {
    phase: string;
    rise: string;
    set: string;
    illumination: number;
  };
}

// Format a Date as YYYYMMDD for the NOAA API, using the America/New_York CALENDAR day.
//
// Bug this fixes: the old version used getFullYear()/getMonth()/getDate(), which read the
// SERVER's timezone. Vercel runs in UTC, so after 8 PM Eastern (midnight UTC) "today" had
// already rolled to tomorrow and we asked NOAA for the wrong day.
//
// Compatibility wrinkle: app/tides/[month]/page.tsx builds month boundaries with
// `new Date(year, month, 1)`, i.e. a server-local MIDNIGHT that really means "calendar date
// Y-M-D", not an instant. Converting that to New York time would shift it back a day on a UTC
// server. So an exact local midnight is treated as a calendar date and keeps its own Y-M-D;
// any other value is a real instant and gets the New York calendar day.
export function formatNoaaDate(date: Date): string {
  const isCalendarDate =
    date.getHours() === 0 && date.getMinutes() === 0 && date.getSeconds() === 0 && date.getMilliseconds() === 0;
  if (isCalendarDate) {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}${mm}${dd}`;
  }
  // en-CA formats as YYYY-MM-DD; strip the dashes. timeZone makes it the New York day.
  return date
    .toLocaleDateString('en-CA', { timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit' })
    .replace(/-/g, '');
}

// Format time for human consumption in NY time zone
export function formatTimeNY(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'America/New_York',
  });
}

// Add minutes helper
export function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60000);
}

// Fetch NOAA Tide Predictions
//
// Return type is backwards compatible: existing pages read `.predictions`. New: when NOAA is
// down, returns an error, or answers HTTP 200 with an {"error":...} body (NOAA's habit), we
// still return `predictions: []` but ALSO set `error` (and log it), so a page can tell
// "NOAA outage" from "no tides" by checking `result.error`. See also fetchTidePredictionsStrict.
export async function getTidePredictions(
  stationId: string = '8722125',
  dateParam: string = 'today'
): Promise<{ predictions: TidePrediction[]; error?: string }> {
  try {
    return await fetchTidePredictionsStrict(stationId, dateParam);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Error fetching tide predictions from NOAA (station ${stationId}):`, message);
    return { predictions: [], error: message };
  }
}

// Same request, but THROWS on any failure (network, HTTP status, or NOAA error body) so callers
// that want an explicit error path (e.g. a page-level error boundary) can have one.
export async function fetchTidePredictionsStrict(
  stationId: string = '8722125',
  dateParam: string = 'today'
): Promise<{ predictions: TidePrediction[] }> {
  // If dateParam is not 'today' or 'latest', it should be YYYYMMDD format or range
  const url = `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?product=predictions&station=${stationId}&datum=MLLW&time_zone=lst_ldt&units=english&format=json&application=verotides&${
    dateParam.includes('date=') || dateParam.includes('begin_date=')
      ? dateParam
      : `date=${dateParam}`
  }&interval=hilo`;

  const res = await fetch(url, {
    next: { revalidate: 300 }, // Cache for 5 minutes
    signal: AbortSignal.timeout(8000), // never hang a page render on NOAA
  });
  if (!res.ok) {
    throw new Error(`NOAA API returned status ${res.status}`);
  }
  const data = await res.json();
  // NOAA reports most errors as HTTP 200 with {"error":{"message":...}} in the body.
  if (data?.error) {
    throw new Error(`NOAA error: ${data.error.message ?? 'unknown'}`);
  }
  if (!Array.isArray(data?.predictions)) {
    throw new Error('NOAA response had no predictions array');
  }
  return data;
}

// Fetch 7-day Tide Predictions
export async function getWeeklyTidePredictions(
  stationId: string = '8722125'
): Promise<{ predictions: TidePrediction[]; error?: string }> {
  const start = new Date();
  const end = new Date(start.getTime() + 7 * 24 * 3600000);
  const startStr = formatNoaaDate(start);
  const endStr = formatNoaaDate(end);
  const dateParam = `begin_date=${startStr}&end_date=${endStr}`;
  return getTidePredictions(stationId, dateParam);
}

// Calculate Solunar periods locally (no external API needed)
export function getSolunarData(date: Date, lat: number = 27.6386, lon: number = -80.3973): SolunarData {
  // Make a copy of the date to avoid side-effects
  const calcDate = new Date(date);
  
  const moonTimes = SunCalc.getMoonTimes(calcDate, lat, lon);
  const moonIllum = SunCalc.getMoonIllumination(calcDate);

  // Solunar major periods: 2-hour windows centered on moonrise and moon transit (overhead/underfoot)
  // Minor periods: 1-hour windows centered on moonset and opposite transit
  const rise = moonTimes.rise ? moonTimes.rise.getTime() : calcDate.getTime() - 6 * 3600000;
  const set = moonTimes.set ? moonTimes.set.getTime() : calcDate.getTime() + 6 * 3600000;
  const transit = new Date((rise + set) / 2);
  const underfoot = new Date(transit.getTime() + 12 * 3600000);

  const majorPeriods = [
    { start: formatTimeNY(addMinutes(transit, -60)), end: formatTimeNY(addMinutes(transit, 60)) },
    { start: formatTimeNY(addMinutes(underfoot, -60)), end: formatTimeNY(addMinutes(underfoot, 60)) },
  ];

  const minorPeriods = moonTimes.rise && moonTimes.set
    ? [
        { start: formatTimeNY(addMinutes(moonTimes.rise, -30)), end: formatTimeNY(addMinutes(moonTimes.rise, 30)) },
        { start: formatTimeNY(addMinutes(moonTimes.set, -30)), end: formatTimeNY(addMinutes(moonTimes.set, 30)) },
      ]
    : [{ start: formatTimeNY(addMinutes(calcDate, -15)), end: formatTimeNY(addMinutes(calcDate, 15)) }];

  const phaseNames = [
    'New Moon', 'Waxing Crescent', 'First Quarter', 'Waxing Gibbous',
    'Full Moon', 'Waning Gibbous', 'Last Quarter', 'Waning Crescent',
  ];
  const phaseIndex = Math.round(moonIllum.phase * 8) % 8;
  const phaseName = phaseNames[phaseIndex];
  const illuminationPct = Math.round(moonIllum.fraction * 100);

  return {
    major: majorPeriods,
    minor: minorPeriods,
    moon: {
      phase: `${phaseName.toUpperCase().replace(/ /g, '_')} (${illuminationPct}%)`,
      rise: moonTimes.rise ? formatTimeNY(moonTimes.rise) : 'N/A',
      set: moonTimes.set ? formatTimeNY(moonTimes.set) : 'N/A',
      illumination: illuminationPct,
    },
  };
}

// Compute 7-day Solunar Forecast
export function getWeeklySolunarData(lat: number = 27.6386, lon: number = -80.3973): { date: string; data: SolunarData }[] {
  const result = [];
  const start = new Date();
  
  for (let i = 0; i < 7; i++) {
    const calcDate = new Date(start.getTime() + i * 24 * 3600000);
    const dateStr = calcDate.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      timeZone: 'America/New_York',
    });
    result.push({
      date: dateStr,
      data: getSolunarData(calcDate, lat, lon),
    });
  }
  return result;
}
