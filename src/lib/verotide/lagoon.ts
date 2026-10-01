// Lagoon water level snapshot: what the Indian River Lagoon at Wabasso is doing now, when its
// highs/lows land, a short anchored forecast, and a regional flood watch.
//
// THE HONESTY RULES (from the 13-month backtest, Sept 2025 - Sept 2026):
//  * A pure "NOAA prediction -> lagoon level" translator has RMSE 0.43 ft, which is WORSE than the
//    tide signal itself (std 0.18 ft). So we do NOT publish an unanchored absolute level.
//  * Lagoon TIMING is solid: lagoon highs/lows trail the ocean ones by about 3.5 h.
//  * A forecast ANCHORED to the latest live USGS reading is good: RMSE 0.14 ft at 1 h,
//    0.25 ft at 24 h, 0.35 ft at 72 h. No wind forecast is used.
//  * Anything that fails is reported in `errors` and set to null/[]; we never invent a value.

import type {
  CoastalAnomaly,
  FloodWatch,
  FloodWatchPeak,
  ForecastPoint,
  IsoUtc,
  LagoonExtreme,
  LagoonSnapshot,
} from './lagoon-types';
import {
  describeError,
  getFloodThreshold,
  getHiLoPredictions,
  getObservedWaterLevel,
  getSixMinutePredictions,
  type HiLo,
} from './noaa';
import { getWabassoObserved } from './usgs';

// ---------------------------------------------------------------------------
// Constants (all from the validation report)
// ---------------------------------------------------------------------------

/** NOAA ocean reference for the shifted extremes: Vero Beach (ocean side), subordinate, MLLW hilo only. */
export const OCEAN_STATION = '8722105';
/** Nearest OBSERVED coastal gauge (Trident Pier, Port Canaveral). ~85 mi north; regional proxy only. */
export const TRIDENT_STATION = '8721604';

/**
 * Fitted lag of the Wabasso lagoon behind the ocean tide at 8722105: 3.5 h = 210 min.
 * The RMSE profile minimum is at 3.5 h and stays within 1% across 3.0-4.0 h, so the honest
 * confidence interval is 3.0-4.0 h (about 3.0 to 4.0 h, 95% moving-block bootstrap).
 */
export const LAG_MINUTES = 210;

/**
 * Amplitude ratio: lagoon tide-band swing / ocean tide swing at Wabasso. Fitted 0.15
 * (tide-band range 0.13-0.16). The lagoon is a tiny, damped copy of the ocean tide.
 */
export const AMPLITUDE_RATIO = 0.15;

/**
 * Anchored-forecast uncertainty (RMSE, feet) at three lead times, from the report's table:
 * 1 h -> 0.14, 24 h -> 0.25, 72 h -> 0.35. Between the points we interpolate linearly; before
 * 1 h we hold 0.14; beyond 72 h we hold 0.35 (we never forecast past 72 h anyway).
 * Band half-width = this RMSE, i.e. roughly a 1-sigma (about two-thirds) band, NOT a 95% band.
 */
export const BAND_TABLE: ReadonlyArray<readonly [leadHours: number, halfWidthFt: number]> = [
  [1, 0.14],
  [24, 0.25],
  [72, 0.35],
];

export const FORECAST_HOURS = 72;
export const EXTREMES_WINDOW_HOURS = 48;
/** USGS reading older than this is stale (also enforced in usgs.ts). */
const OBSERVED_FRESH_MS = 2 * 3600_000;
/** Trident observation older than this is stale for anomaly purposes. */
const ANOMALY_FRESH_MS = 90 * 60_000;
/** Need at least this many matched 6-min obs/pred pairs (of ~720 in 72 h) to trust a mean. */
const MIN_ANOMALY_PAIRS = 200;
/** Fallback if mdapi is unreachable: 23.69 ft (NOS minor, station datum) - 18.00 ft (MLLW) = 5.69. Verified 2026-09-30. */
export const TRIDENT_MINOR_MLLW_FALLBACK = 5.69;
/** A cosine segment longer than this means a hilo point is missing, so we refuse to interpolate. */
const MAX_SEGMENT_MS = 9 * 3600_000;

const HOUR_MS = 3600_000;
const MIN_MS = 60_000;

// ---------------------------------------------------------------------------
// Pure math helpers (exported so the check script / tests can use them)
// ---------------------------------------------------------------------------

/** Band half-width (ft) for a forecast `leadHours` after the anchor observation. */
export function bandHalfWidthFt(leadHours: number): number {
  const tbl = BAND_TABLE;
  if (leadHours <= tbl[0][0]) return tbl[0][1];
  for (let i = 1; i < tbl.length; i++) {
    const [x0, y0] = tbl[i - 1];
    const [x1, y1] = tbl[i];
    if (leadHours <= x1) return y0 + ((y1 - y0) * (leadHours - x0)) / (x1 - x0);
  }
  return tbl[tbl.length - 1][1];
}

interface CurvePoint {
  ms: number;
  ft: number;
}

/**
 * Build a continuous tide curve from high/low points using a half-cosine between neighbours:
 *   h(t) = (h1+h2)/2 + (h1-h2)/2 * cos(pi * (t-t1)/(t2-t1))
 * This starts flat at each extreme (like a real tide turning) and is steepest mid-way.
 * Against NOAA's own 6-minute harmonics it has RMS error ~0.02 ft at Vero. Returns null where
 * t is outside the points or inside a suspiciously long gap (a missing extreme).
 */
export function makeCosineCurve(points: CurvePoint[]): (ms: number) => number | null {
  return (ms: number) => {
    if (points.length < 2 || ms < points[0].ms || ms > points[points.length - 1].ms) return null;
    // Linear scan is fine: we have ~30 points.
    let i = 0;
    while (i + 1 < points.length && points[i + 1].ms < ms) i++;
    const a = points[i];
    const b = points[Math.min(i + 1, points.length - 1)];
    const span = b.ms - a.ms;
    if (span <= 0) return a.ft;
    if (span > MAX_SEGMENT_MS) return null;
    const phase = (ms - a.ms) / span;
    return (a.ft + b.ft) / 2 + ((a.ft - b.ft) / 2) * Math.cos(Math.PI * phase);
  };
}

const round = (x: number, places = 3) => Math.round(x * 10 ** places) / 10 ** places;

// ---------------------------------------------------------------------------
// Sub-source loaders. Each THROWS on failure; getLagoonSnapshot catches per source.
// ---------------------------------------------------------------------------

/** Ocean hilo from `now-2d` through `now+5d` (padded: the forecast anchor needs points before now). */
async function loadOceanHiLo(now: Date): Promise<HiLo[]> {
  return getHiLoPredictions(
    OCEAN_STATION,
    new Date(now.getTime() - 2 * 24 * HOUR_MS),
    new Date(now.getTime() + 5 * 24 * HOUR_MS),
  );
}

/** Shift ocean hilo into lagoon time (+210 min) and keep the provenance the contract wants. */
function toLagoonExtremes(oceanHiLo: HiLo[]): Array<LagoonExtreme & { ms: number }> {
  return oceanHiLo.map((h) => {
    const ms = Date.parse(h.t) + LAG_MINUTES * MIN_MS;
    return {
      ms,
      t: new Date(ms).toISOString(),
      type: h.type,
      oceanT: h.t,
      oceanFtMllw: round(h.ftMllw),
      lagMinutes: LAG_MINUTES,
    };
  });
}

async function loadAnomaly(now: Date): Promise<CoastalAnomaly> {
  const from = new Date(now.getTime() - 72 * HOUR_MS);
  // Both calls cover the same 72 h (+ a UTC-day pad inside chunkDateRange) on the same 6-minute grid.
  const [obs, pred] = await Promise.all([
    getObservedWaterLevel(TRIDENT_STATION, from, now),
    getSixMinutePredictions(TRIDENT_STATION, from, now),
  ]);
  const predByT = new Map(pred.map((p) => [p.t, p.ft]));
  const cutoff = from.getTime();

  // anomaly = observed - astronomical prediction, matched on identical timestamps.
  const pairs: Array<{ t: IsoUtc; observedFt: number; predictedFt: number }> = [];
  for (const o of obs) {
    if (Date.parse(o.t) < cutoff) continue;
    const p = predByT.get(o.t);
    if (p !== undefined) pairs.push({ t: o.t, observedFt: o.ft, predictedFt: p });
  }
  if (pairs.length === 0) {
    throw new Error('Trident Pier: no matching observed/predicted pairs in the last 72 h');
  }

  const last = pairs[pairs.length - 1];
  const stale = now.getTime() - Date.parse(last.t) > ANOMALY_FRESH_MS;
  const mean = pairs.reduce((s, p) => s + (p.observedFt - p.predictedFt), 0) / pairs.length;
  return {
    station: TRIDENT_STATION,
    meanFt72h: pairs.length >= MIN_ANOMALY_PAIRS ? round(mean, 2) : null,
    latest: {
      t: last.t,
      observedFt: round(last.observedFt),
      predictedFt: round(last.predictedFt),
      anomalyFt: round(last.observedFt - last.predictedFt),
    },
    stale,
  };
}

/** Live flood threshold, falling back to the verified constant only if mdapi itself is down. */
export async function resolveTridentMinorThreshold(): Promise<{ ft: number; source: 'live' | 'fallback'; note?: string }> {
  try {
    const f = await getFloodThreshold(TRIDENT_STATION);
    return { ft: f.minorMllwFt, source: 'live' };
  } catch (e) {
    return { ft: TRIDENT_MINOR_MLLW_FALLBACK, source: 'fallback', note: describeError(e) };
  }
}

async function loadFloodWatch(now: Date, anomalyFt: number): Promise<FloodWatch> {
  const [hilo, threshold] = await Promise.all([
    getHiLoPredictions(TRIDENT_STATION, new Date(now.getTime() - HOUR_MS), new Date(now.getTime() + 8 * 24 * HOUR_MS)),
    resolveTridentMinorThreshold(),
  ]);
  const horizon = now.getTime() + 7 * 24 * HOUR_MS;
  // Clamp at 0 so a temporarily NEGATIVE anomaly can't hide a flood-capable astronomical high.
  const boost = Math.max(0, anomalyFt);
  const nextPeaks: FloodWatchPeak[] = hilo
    .filter((h) => h.type === 'H' && Date.parse(h.t) >= now.getTime() && Date.parse(h.t) <= horizon)
    .map((h) => {
      const withAnomaly = h.ftMllw + boost;
      return {
        t: h.t,
        predictedFtMllw: round(h.ftMllw, 2),
        withAnomalyFtMllw: round(withAnomaly, 2),
        exceedsMinor: withAnomaly >= threshold.ft,
      };
    });
  return { station: TRIDENT_STATION, thresholdMllwFt: threshold.ft, nextPeaks };
}

// ---------------------------------------------------------------------------
// Public entry point
// ---------------------------------------------------------------------------

/**
 * Build the whole lagoon snapshot. NEVER throws: each sub-source is wrapped, failures push a
 * readable message into `errors`, and the matching field is null / [].
 * `now` is injectable so tests can pin the clock.
 */
export async function getLagoonSnapshot(now: Date = new Date()): Promise<LagoonSnapshot> {
  const errors: string[] = [];

  // Fire all independent network work at once; allSettled so one failure can't sink the rest.
  const [obsR, oceanR, anomR] = await Promise.allSettled([
    getWabassoObserved(now),
    loadOceanHiLo(now),
    loadAnomaly(now),
  ]);

  // ---- observed ----
  let observed: LagoonSnapshot['observed'] = null;
  if (obsR.status === 'fulfilled') {
    observed = obsR.value;
    if (observed.stale) errors.push('USGS Wabasso gauge: latest reading is more than 2 hours old.');
  } else {
    errors.push(`Lagoon gauge unavailable (${describeError(obsR.reason)}).`);
  }

  // ---- extremes + forecast (both need the ocean hilo) ----
  let extremes: LagoonExtreme[] = [];
  const forecast: ForecastPoint[] = [];
  if (oceanR.status === 'fulfilled' && oceanR.value.length > 1) {
    const shifted = toLagoonExtremes(oceanR.value);

    // Next ~48 h of lagoon highs/lows, strip the helper `ms` field to match the contract type.
    const until = now.getTime() + EXTREMES_WINDOW_HOURS * HOUR_MS;
    extremes = shifted
      .filter((e) => e.ms >= now.getTime() && e.ms <= until)
      .map((e) => ({ t: e.t, type: e.type, oceanT: e.oceanT, oceanFtMllw: e.oceanFtMllw, lagMinutes: e.lagMinutes }));

    // Anchored forecast. Requires a FRESH observation: anchoring on a stale reading would
    // silently publish an old level as if it were current.
    const latest = observed?.latest ?? null;
    const anchorMs = latest ? Date.parse(latest.t) : NaN;
    if (!latest || !Number.isFinite(anchorMs)) {
      errors.push('Lagoon forecast unavailable: no live lagoon gauge reading to anchor it on.');
    } else if (now.getTime() - anchorMs > OBSERVED_FRESH_MS) {
      errors.push('Lagoon forecast unavailable: the latest lagoon gauge reading is too old to anchor on.');
    } else {
      // oceanTide(t): the (lag-shifted) ocean tide as a continuous curve.
      const oceanTide = makeCosineCurve(shifted.map((e) => ({ ms: e.ms, ft: e.oceanFtMllw })));
      const tideAtAnchor = oceanTide(anchorMs);
      if (tideAtAnchor === null) {
        errors.push('Lagoon forecast unavailable: tide predictions do not cover the gauge reading time.');
      } else {
        // First forecast hour = the next whole UTC hour after now.
        const firstHour = Math.ceil(now.getTime() / HOUR_MS) * HOUR_MS;
        for (let i = 0; i < FORECAST_HOURS; i++) {
          const ms = firstHour + i * HOUR_MS;
          const tideNow = oceanTide(ms);
          if (tideNow === null) break; // ran off the end of the prediction window
          // forecast(t) = latestObserved + a * (oceanTide(t) - oceanTide(tAnchor))
          // i.e. "start from where the gauge is, then add only the CHANGE the tide implies".
          const ft = latest.ft + AMPLITUDE_RATIO * (tideNow - tideAtAnchor);
          const half = bandHalfWidthFt((ms - anchorMs) / HOUR_MS);
          forecast.push({
            t: new Date(ms).toISOString(),
            ft: round(ft, 2),
            lo: round(ft - half, 2),
            hi: round(ft + half, 2),
          });
        }
        if (forecast.length < FORECAST_HOURS) {
          errors.push(`Lagoon forecast truncated to ${forecast.length} h: NOAA predictions ended early.`);
        }
      }
    }
  } else {
    const why = oceanR.status === 'rejected' ? describeError(oceanR.reason) : 'no high/low data returned';
    errors.push(`NOAA tide predictions unavailable (${why}); lagoon high/low times and forecast withheld.`);
  }

  // ---- anomaly ----
  let anomaly: CoastalAnomaly | null = null;
  if (anomR.status === 'fulfilled') {
    anomaly = anomR.value;
    if (anomaly.stale) errors.push('Trident Pier observations are more than 90 minutes old.');
    if (anomaly.meanFt72h === null) errors.push('Trident Pier: too few observations for a 72-hour mean anomaly.');
  } else {
    errors.push(`Coastal sea-level anomaly unavailable (${describeError(anomR.reason)}).`);
  }

  // ---- flood watch (needs the anomaly; withheld rather than shown optimistic without it) ----
  let floodWatch: FloodWatch | null = null;
  // Prefer the 72 h mean: it is the smoother, persistent signal. Fall back to the latest value.
  const anomalyFt = anomaly ? (anomaly.meanFt72h ?? anomaly.latest?.anomalyFt ?? null) : null;
  if (anomalyFt === null) {
    errors.push('Flood watch withheld: needs the live coastal anomaly, which is unavailable.');
  } else {
    try {
      floodWatch = await loadFloodWatch(now, anomalyFt);
    } catch (e) {
      errors.push(`Flood watch unavailable (${describeError(e)}).`);
    }
  }

  return {
    generatedAt: now.toISOString(),
    observed,
    extremes,
    forecast,
    anomaly,
    floodWatch,
    errors,
  };
}
