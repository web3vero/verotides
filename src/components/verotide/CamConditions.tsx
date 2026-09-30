import Link from 'next/link';
import SunCalc from 'suncalc';
import { getWeeklyTidePredictions, formatTimeNY } from '@/lib/verotide/data';

// Server component: the "right now" strip on cam pages. Everything here is computed on the server
// from cached helpers, so it costs the visitor zero JavaScript and does not depend on the cam loading.

// Vero Beach reference point and the NOAA tide station nearest to it (Intracoastal, not ocean).
const VERO = { lat: 27.6386, lon: -80.3973 };
const STATION = '8722125';

// NOAA returns local time strings like "2026-09-30 14:52". Comparing strings in that same shape
// lets us find "the next tide" without any timezone math.
function nowInNewYork(): string {
  // The 'sv-SE' locale formats as "YYYY-MM-DD HH:MM:SS", matching NOAA's shape.
  return new Date().toLocaleString('sv-SE', { timeZone: 'America/New_York' }).slice(0, 16);
}

function tideTime(t: string): string {
  // "2026-09-30 14:52" -> "2:52 PM"
  const [h, m] = t.split(' ')[1].split(':').map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
}

export default async function CamConditions() {
  const weekly = await getWeeklyTidePredictions(STATION);
  const preds = weekly?.predictions ?? [];
  const now = nowInNewYork();

  const nextIdx = preds.findIndex((p) => p.t > now);
  const next = nextIdx >= 0 ? preds[nextIdx] : undefined;
  // The next high and next low after now (they alternate, so both are within ~12 hours).
  const nextHigh = preds.find((p) => p.t > now && p.type === 'H');
  const nextLow = preds.find((p) => p.t > now && p.type === 'L');
  // If the next extreme is a high the water is rising; if it is a low the water is falling.
  const stage = next ? (next.type === 'H' ? 'Rising (incoming)' : 'Falling (outgoing)') : 'Unavailable';

  // Sunrise/sunset from the suncalc library (pure math, no network).
  const sun = SunCalc.getTimes(new Date(), VERO.lat, VERO.lon);

  const items: { label: string; value: string }[] = [
    { label: 'Tide stage', value: stage },
    { label: 'Next high', value: nextHigh ? `${tideTime(nextHigh.t)} (${nextHigh.v} ft)` : 'n/a' },
    { label: 'Next low', value: nextLow ? `${tideTime(nextLow.t)} (${nextLow.v} ft)` : 'n/a' },
    { label: 'Sunrise', value: formatTimeNY(sun.sunrise) },
    { label: 'Sunset', value: formatTimeNY(sun.sunset) },
  ];

  return (
    <section aria-labelledby="conditions-h" className="terminal-box border border-primary/20 bg-black/60 rounded-xl p-4 font-mono">
      <h2 id="conditions-h" className="text-xs font-black text-primary uppercase tracking-widest mb-3">
        &gt; Vero Beach conditions
      </h2>
      <dl className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
        {items.map((i) => (
          <div key={i.label}>
            <dt className="text-[10px] uppercase tracking-widest text-white/40">{i.label}</dt>
            <dd className="text-white/90">{i.value}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-3 text-[10px] text-white/40">
        Tides are NOAA CO-OPS predictions for station {STATION} (Vero Beach, Intracoastal), not observed water
        levels. Sun times are calculated for Vero Beach. Wind and waves: see{' '}
        <Link href="/weather" className="text-primary underline">Beach Conditions</Link>.
      </p>
    </section>
  );
}
