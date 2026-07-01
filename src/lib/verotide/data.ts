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

// Format Date object to YYYYMMDD for NOAA API
export function formatNoaaDate(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}${mm}${dd}`;
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
export async function getTidePredictions(
  stationId: string = '8722125',
  dateParam: string = 'today'
): Promise<{ predictions: TidePrediction[] }> {
  // If dateParam is not 'today' or 'latest', it should be YYYYMMDD format or range
  const url = `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?product=predictions&station=${stationId}&datum=MLLW&time_zone=lst_ldt&units=english&format=json&${
    dateParam.includes('date=') || dateParam.includes('begin_date=')
      ? dateParam
      : `date=${dateParam}`
  }&interval=hilo`;

  try {
    const res = await fetch(url, {
      next: { revalidate: 300 } // Cache for 5 minutes
    });
    if (!res.ok) {
      throw new Error(`NOAA API returned status ${res.status}`);
    }
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Error fetching tide predictions from NOAA:', error);
    return { predictions: [] };
  }
}

// Fetch 7-day Tide Predictions
export async function getWeeklyTidePredictions(
  stationId: string = '8722125'
): Promise<{ predictions: TidePrediction[] }> {
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
