// Live smoke test for the lagoon + inlet data layer.  Run:  bun scripts/check-lagoon.ts
//
// It calls the REAL NOAA / USGS / NDBC APIs (no mocks), prints a human summary, then runs
// assertions. Exit code 1 if any assertion fails, so it can gate a deploy or a cron check.
// Note: outside Next.js the `next: { revalidate }` fetch option is ignored, so every run is fresh.

import { getLagoonSnapshot, bandHalfWidthFt, FORECAST_HOURS } from '../src/lib/verotide/lagoon';
import { getInletSnapshot } from '../src/lib/verotide/inlet';
import { getFloodThreshold } from '../src/lib/verotide/noaa';

let failures = 0;
function check(name: string, ok: boolean, detail = '') {
  if (!ok) failures++;
  console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? `  (${detail})` : ''}`);
}

/** Recursively look for NaN / Infinity anywhere in a JSON-like value. */
function hasBadNumber(v: unknown): boolean {
  if (typeof v === 'number') return !Number.isFinite(v);
  if (Array.isArray(v)) return v.some(hasBadNumber);
  if (v && typeof v === 'object') return Object.values(v).some(hasBadNumber);
  return false;
}

const hm = (iso: string) =>
  new Date(iso).toLocaleString('en-US', { timeZone: 'America/New_York', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });

async function main() {
  const now = new Date();
  console.log(`\n=== Lagoon snapshot (now ${now.toISOString()}) ===`);
  const lagoon = await getLagoonSnapshot(now);

  const obs = lagoon.observed;
  if (obs?.latest) {
    console.log(`Observed Wabasso: ${obs.latest.ft.toFixed(2)} ft NAVD88 at ${hm(obs.latest.t)} ET  (${obs.samples.length} samples, stale=${obs.stale})`);
  } else console.log('Observed Wabasso: null');
  console.log('Next lagoon extremes (ET):');
  for (const e of lagoon.extremes.slice(0, 6)) {
    console.log(`  ${e.type}  ${hm(e.t)}   (ocean ${e.type} ${e.oceanFtMllw.toFixed(2)} ft MLLW at ${hm(e.oceanT)}, +${e.lagMinutes} min)`);
  }
  const f = lagoon.forecast;
  if (f.length) {
    for (const i of [0, 5, 23, f.length - 1]) {
      const p = f[i];
      console.log(`  forecast +${i + 1}h  ${hm(p.t)}  ${p.ft.toFixed(2)} ft NAVD88  [${p.lo.toFixed(2)}, ${p.hi.toFixed(2)}]`);
    }
  } else console.log('Forecast: empty');
  if (lagoon.anomaly) {
    const a = lagoon.anomaly;
    console.log(`Anomaly (Trident ${a.station}): 72h mean ${a.meanFt72h ?? 'null'} ft; latest ${a.latest?.anomalyFt ?? 'null'} ft; stale=${a.stale}`);
  } else console.log('Anomaly: null');
  if (lagoon.floodWatch) {
    const fw = lagoon.floodWatch;
    console.log(`FloodWatch: threshold ${fw.thresholdMllwFt} ft MLLW; ${fw.nextPeaks.length} predicted highs in 7 d; ${fw.nextPeaks.filter((p) => p.exceedsMinor).length} exceed minor`);
    const top = [...fw.nextPeaks].sort((x, y) => y.withAnomalyFtMllw - x.withAnomalyFtMllw)[0];
    if (top) console.log(`  highest: ${hm(top.t)}  predicted ${top.predictedFtMllw} + anomaly = ${top.withAnomalyFtMllw} ft MLLW`);
  } else console.log('FloodWatch: null');
  console.log(`Errors: ${lagoon.errors.length ? '\n  - ' + lagoon.errors.join('\n  - ') : 'none'}`);

  console.log('\nLagoon assertions:');
  check('observed present', !!obs?.latest);
  if (obs?.latest) {
    const ageH = (now.getTime() - Date.parse(obs.latest.t)) / 3600_000;
    check('observed latest within 2 h', ageH <= 2, `${ageH.toFixed(2)} h old`);
    check('observed samples ascending', obs.samples.every((s, i) => i === 0 || s.t > obs.samples[i - 1].t));
  }
  check('has lagoon extremes', lagoon.extremes.length >= 4, `${lagoon.extremes.length}`);
  check('extremes alternate H/L', lagoon.extremes.every((e, i) => i === 0 || e.type !== lagoon.extremes[i - 1].type));
  check('extremes ascending in time', lagoon.extremes.every((e, i) => i === 0 || e.t > lagoon.extremes[i - 1].t));
  check('lag is 210 min', lagoon.extremes.every((e) => e.lagMinutes === 210 && Date.parse(e.t) - Date.parse(e.oceanT) === 210 * 60_000));
  check(`forecast has ${FORECAST_HOURS} hourly points`, f.length === FORECAST_HOURS, `${f.length}`);
  check('forecast timestamps strictly ascending, hourly', f.every((p, i) => i === 0 || Date.parse(p.t) - Date.parse(f[i - 1].t) === 3600_000));
  if (obs?.latest && f.length) {
    const anchorMs = Date.parse(obs.latest.t);
    check('band half-widths match table (0.14@1h, 0.25@24h, 0.35@72h)',
      f.every((p) => Math.abs((p.hi - p.lo) / 2 - bandHalfWidthFt((Date.parse(p.t) - anchorMs) / 3600_000)) < 0.011) &&
      Math.abs(bandHalfWidthFt(1) - 0.14) < 1e-9 && Math.abs(bandHalfWidthFt(24) - 0.25) < 1e-9 && Math.abs(bandHalfWidthFt(72) - 0.35) < 1e-9);
    check('forecast within sane distance of observed (<1 ft)', f.every((p) => Math.abs(p.ft - obs.latest!.ft) < 1));
  }
  check('anomaly present', !!lagoon.anomaly);
  check('flood threshold == 5.69 (snapshot)', lagoon.floodWatch?.thresholdMllwFt === 5.69, String(lagoon.floodWatch?.thresholdMllwFt));
  const live = await getFloodThreshold('8721604');
  check('flood threshold == 5.69 (live mdapi 23.69 - 18.00)', live.minorMllwFt === 5.69, `${live.nosMinorStationDatumFt} - ${live.mllwStationDatumFt} = ${live.minorMllwFt}`);
  check('no NaN/Infinity in lagoon snapshot', !hasBadNumber(lagoon));

  console.log(`\n=== Inlet snapshot ===`);
  const inlet = await getInletSnapshot(now);
  if (inlet.current) console.log(`Current: ${inlet.current.phase} ${inlet.current.speedKt} kt toward ${inlet.current.dirTrue} deg true at ${hm(inlet.current.t)} (${inlet.current.source})`);
  else console.log('Current: null');
  if (inlet.nextSlack) console.log(`Next slack: ${inlet.nextSlack.type} at ${hm(inlet.nextSlack.t)}`);
  if (inlet.waves) console.log(`Waves (${inlet.waves.station}): Hs ${inlet.waves.hsFt} ft, DPD ${inlet.waves.dominantPeriodS} s, MWD ${inlet.waves.meanWaveDirDeg} deg from, at ${hm(inlet.waves.t)}`);
  else console.log('Waves: null');
  if (inlet.wind) console.log(`Wind (${inlet.wind.station}): ${inlet.wind.speedKt} kt from ${inlet.wind.dirFromDeg} deg at ${hm(inlet.wind.t)}`);
  else console.log('Wind: null');
  console.log(`Wave/current interaction: ${JSON.stringify(inlet.waveCurrentInteraction)}`);
  console.log(`Errors: ${inlet.errors.length ? '\n  - ' + inlet.errors.join('\n  - ') : 'none'}`);

  console.log('\nInlet assertions:');
  check('current present (bin=1 works)', !!inlet.current);
  check('current speed >= 0 and < 8 kt', !!inlet.current && inlet.current.speedKt >= 0 && inlet.current.speedKt < 8);
  check('next slack is in the future', !!inlet.nextSlack && Date.parse(inlet.nextSlack.t) > now.getTime());
  check('waves present and fresh (<3 h)', !!inlet.waves && now.getTime() - Date.parse(inlet.waves.t) <= 3 * 3600_000);
  check('wind is fresh or null (never stale)', !inlet.wind || now.getTime() - Date.parse(inlet.wind.t) <= 3 * 3600_000);
  if (inlet.waves?.dominantPeriodS && inlet.waveCurrentInteraction?.blockingCurrentKt != null) {
    const T = inlet.waves.dominantPeriodS;
    const expect = (0.25 * (9.81 * T) / (4 * Math.PI)) / 0.5144;
    check('blocking current = 0.25*Cg in kt', Math.abs(inlet.waveCurrentInteraction.blockingCurrentKt - expect) < 0.01, `T=${T}s -> ${expect.toFixed(2)} kt`);
  }
  check('no NaN/Infinity in inlet snapshot', !hasBadNumber(inlet));

  console.log(`\n${failures === 0 ? 'ALL CHECKS PASSED' : `${failures} CHECK(S) FAILED`}`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error('check-lagoon crashed:', e);
  process.exit(2);
});
