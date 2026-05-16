import { NextResponse } from 'next/server';
import SunCalc from 'suncalc';

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'America/New_York',
  });
}

function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60000);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = parseFloat(searchParams.get('lat') || '27.6386');
  const lon = parseFloat(searchParams.get('lon') || '-80.3973');
  const now = new Date();

  const moonTimes = SunCalc.getMoonTimes(now, lat, lon);
  const moonIllum = SunCalc.getMoonIllumination(now);

  // Solunar major periods: 2-hour windows centered on moonrise and moon transit (overhead/underfoot)
  // Minor periods: 1-hour windows centered on moonset and opposite transit
  const moonPos = SunCalc.getMoonPosition(now, lat, lon);

  // Estimate moon transit (overhead) — time when moon is highest in sky today
  // SunCalc doesn't give transit directly; approximate from rise/set midpoint
  const rise = moonTimes.rise ? moonTimes.rise.getTime() : now.getTime() - 6 * 3600000;
  const set = moonTimes.set ? moonTimes.set.getTime() : now.getTime() + 6 * 3600000;
  const transit = new Date((rise + set) / 2);
  const underfoot = new Date(transit.getTime() + 12 * 3600000);

  const majorPeriods = [
    { start: formatTime(addMinutes(transit, -60)), end: formatTime(addMinutes(transit, 60)) },
    { start: formatTime(addMinutes(underfoot, -60)), end: formatTime(addMinutes(underfoot, 60)) },
  ].sort((a) => (a.start < formatTime(now) ? 1 : -1));

  const minorPeriods = moonTimes.rise && moonTimes.set
    ? [
        { start: formatTime(addMinutes(moonTimes.rise, -30)), end: formatTime(addMinutes(moonTimes.rise, 30)) },
        { start: formatTime(addMinutes(moonTimes.set, -30)), end: formatTime(addMinutes(moonTimes.set, 30)) },
      ]
    : [{ start: '06:00 AM', end: '06:30 AM' }];

  const phaseNames = [
    'New Moon', 'Waxing Crescent', 'First Quarter', 'Waxing Gibbous',
    'Full Moon', 'Waning Gibbous', 'Last Quarter', 'Waning Crescent',
  ];
  const phaseIndex = Math.round(moonIllum.phase * 8) % 8;
  const phaseName = phaseNames[phaseIndex];
  const illuminationPct = Math.round(moonIllum.fraction * 100);

  return NextResponse.json({
    major: majorPeriods,
    minor: minorPeriods,
    moon: {
      phase: `${phaseName.toUpperCase().replace(/ /g, '_')} (${illuminationPct}%)`,
      rise: moonTimes.rise ? formatTime(moonTimes.rise) : 'N/A',
      set: moonTimes.set ? formatTime(moonTimes.set) : 'N/A',
      illumination: illuminationPct,
    },
  });
}
