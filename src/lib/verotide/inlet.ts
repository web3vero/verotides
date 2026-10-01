// Inlet conditions snapshot for Fort Pierce Inlet: tidal current (NOAA prediction), waves and
// wind (NDBC buoys), and ONE physics flag for waves meeting an opposing current.
//
// What this deliberately is NOT: a go/no-go score. There is no composite rating anywhere. The
// expert research drafted a points model, but it is uncalibrated and inlets can kill people, so
// the contract only allows raw readings plus the published wave-blocking physics.
//
// Staleness policy: any buoy reading older than ~3 h is dropped (field becomes null and an
// explanatory note is added to `errors`). We never show an old reading as if it were current.

import type { InletCurrent, InletSnapshot, InletWaves, InletWind, IsoUtc } from './lagoon-types';
import { SourceError, describeError, fetchTextWithRetry, getCurrentPredictions } from './noaa';

const CURRENT_STATION = 'FPI0901'; // Fort Pierce Inlet Entrance; bin 1 (33 ft) is REQUIRED
/** Fallback true bearings (degrees toward) from NOAA metadata, used only if the response lacks them. */
const DEFAULT_EBB_DIR = 77;
const DEFAULT_FLOOD_DIR = 260;

/** |speed| below this counts as slack (NOAA's slack rows are ~0.0 kt; this absorbs interpolation). */
const SLACK_KT = 0.2;
/** Max distance between "now" and the nearest 6-minute prediction we will accept. */
const CURRENT_MAX_GAP_MS = 15 * 60_000;
/** Buoy readings older than this are treated as missing. */
export const BUOY_STALE_MS = 3 * 3600_000;

// Unit conversions
const MS_TO_KT = 1.944; // m/s -> knots (NDBC wind is m/s)
const M_TO_FT = 3.281;
const G = 9.81; // m/s^2
const MS_PER_KT = 0.5144; // knots -> m/s

// ---------------------------------------------------------------------------
// NDBC realtime2 text parsing
// ---------------------------------------------------------------------------

interface NdbcRow {
  t: IsoUtc;
  ms: number;
  // Raw numeric fields; null when NDBC wrote "MM" (missing).
  wdir: number | null; // degrees true, wind FROM
  wspd: number | null; // m/s
  wvht: number | null; // m
  dpd: number | null; // s
  mwd: number | null; // degrees true, waves FROM
}

/**
 * Parse an NDBC realtime2 .txt file. The first two lines are headers (column names + units);
 * data rows are newest-first, whitespace-separated, UTC. "MM" means missing.
 * We locate columns by header name instead of hard-coding positions, in case NDBC adds one.
 */
export function parseNdbc(text: string): NdbcRow[] {
  const lines = text.split('\n').filter((l) => l.trim().length > 0);
  const header = lines.find((l) => l.startsWith('#YY'));
  if (!header) throw new SourceError('NDBC', 'parse', 'unexpected buoy file format (no header row)');
  const cols = header.replace(/^#/, '').trim().split(/\s+/);
  const idx = (name: string) => cols.indexOf(name);
  const [iY, iMo, iD, iH, iMi] = ['YY', 'MM', 'DD', 'hh', 'mm'].map(idx);
  const iWdir = idx('WDIR'), iWspd = idx('WSPD'), iWvht = idx('WVHT'), iDpd = idx('DPD'), iMwd = idx('MWD');
  if ([iY, iMo, iD, iH, iMi].some((i) => i < 0)) throw new SourceError('NDBC', 'parse', 'missing time columns');

  const num = (parts: string[], i: number): number | null => {
    if (i < 0) return null;
    const v = parts[i];
    if (v === undefined || v === 'MM') return null;
    const n = Number.parseFloat(v);
    return Number.isFinite(n) ? n : null;
  };

  const rows: NdbcRow[] = [];
  for (const line of lines) {
    if (line.startsWith('#')) continue;
    const p = line.trim().split(/\s+/);
    const ms = Date.UTC(+p[iY], +p[iMo] - 1, +p[iD], +p[iH], +p[iMi]);
    if (!Number.isFinite(ms)) continue;
    rows.push({
      t: new Date(ms).toISOString(),
      ms,
      wdir: num(p, iWdir),
      wspd: num(p, iWspd),
      wvht: num(p, iWvht),
      dpd: num(p, iDpd),
      mwd: num(p, iMwd),
    });
  }
  return rows;
}

async function fetchBuoy(station: string): Promise<NdbcRow[]> {
  // Buoys report every 10-30 min; 5-minute cache is plenty.
  const text = await fetchTextWithRetry(`https://www.ndbc.noaa.gov/data/realtime2/${station}.txt`, {
    revalidate: 300,
    tags: ['ndbc', station],
    source: 'NDBC',
  });
  return parseNdbc(text);
}

// ---------------------------------------------------------------------------
// Current (NOAA FPI0901 prediction)
// ---------------------------------------------------------------------------

interface CurrentResult {
  current: InletCurrent;
  ebbDirTrue: number;
  nextSlack: InletSnapshot['nextSlack'];
}

async function loadCurrent(now: Date): Promise<CurrentResult> {
  // Series: 6-minute velocities for yesterday..tomorrow (UTC days) so "now" is always bracketed.
  // Events: MAX_SLACK rows, same window, to find the next slack and which way it turns.
  const from = new Date(now.getTime() - 24 * 3600_000);
  const to = new Date(now.getTime() + 36 * 3600_000);
  const [series, events] = await Promise.all([
    getCurrentPredictions(CURRENT_STATION, from, to, '6', 1),
    getCurrentPredictions(CURRENT_STATION, from, to, 'MAX_SLACK', 1),
  ]);

  // Nearest 6-minute prediction to now.
  let best = null as (typeof series)[number] | null;
  let bestGap = Infinity;
  for (const s of series) {
    const gap = Math.abs(Date.parse(s.t) - now.getTime());
    if (gap < bestGap) { best = s; bestGap = gap; }
  }
  if (!best || bestGap > CURRENT_MAX_GAP_MS) {
    throw new SourceError('NOAA', 'no-data', 'current predictions do not cover the present moment');
  }

  const ebbDir = best.meanEbbDir ?? DEFAULT_EBB_DIR;
  const floodDir = best.meanFloodDir ?? DEFAULT_FLOOD_DIR;
  const v = best.velocityKt; // NOAA: negative = ebb, positive = flood
  const phase: InletCurrent['phase'] = Math.abs(v) < SLACK_KT ? 'slack' : v < 0 ? 'ebb' : 'flood';
  // Direction the water moves TOWARD. For slack we report the direction of the sign it is turning from.
  const dirTrue = v < 0 ? ebbDir : floodDir;

  // Next slack: first 'slack' event after now. Which turn is it? Look at the event right after it:
  // an ebb max following means water was flooding and is about to ebb -> 'slack-before-ebb'.
  let nextSlack: InletSnapshot['nextSlack'] = null;
  const nowMs = now.getTime();
  for (let i = 0; i < events.length; i++) {
    const e = events[i];
    if (e.type !== 'slack' || Date.parse(e.t) <= nowMs) continue;
    const after = events.slice(i + 1).find((x) => x.type === 'ebb' || x.type === 'flood');
    const before = [...events.slice(0, i)].reverse().find((x) => x.type === 'ebb' || x.type === 'flood');
    const turnsTo = after?.type ?? (before?.type === 'flood' ? 'ebb' : before?.type === 'ebb' ? 'flood' : undefined);
    if (turnsTo) nextSlack = { t: e.t, type: turnsTo === 'ebb' ? 'slack-before-ebb' : 'slack-before-flood' };
    break;
  }

  return {
    current: {
      t: best.t,
      speedKt: Math.round(Math.abs(v) * 100) / 100,
      dirTrue,
      phase,
      source: 'NOAA FPI0901 prediction',
    },
    ebbDirTrue: ebbDir,
    nextSlack,
  };
}

// ---------------------------------------------------------------------------
// Waves + wind from buoys
// ---------------------------------------------------------------------------

const WAVE_STATIONS = ['41114', '41113', '41009'] as const; // Fort Pierce nearshore first
const WIND_STATIONS = ['41114', '41009', '41068'] as const; // 41114 is wave-only in practice; 41009 usually has wind

/** Search newest-first rows for the first one within the stale window that satisfies `ok`. */
function freshRow(rows: NdbcRow[], nowMs: number, ok: (r: NdbcRow) => boolean): NdbcRow | null {
  for (const r of rows) {
    if (nowMs - r.ms > BUOY_STALE_MS) return null; // rows are newest-first, so the rest are older still
    if (ok(r)) return r;
  }
  return null;
}

async function loadWaves(now: Date, errors: string[]): Promise<InletWaves | null> {
  for (const station of WAVE_STATIONS) {
    try {
      const rows = await fetchBuoy(station);
      const r = freshRow(rows, now.getTime(), (x) => x.wvht !== null);
      if (!r) {
        errors.push(`Buoy ${station}: no wave reading newer than 3 hours.`);
        continue; // try the next-closest buoy
      }
      return {
        station,
        t: r.t,
        hsFt: r.wvht === null ? null : Math.round(r.wvht * M_TO_FT * 10) / 10,
        dominantPeriodS: r.dpd,
        meanWaveDirDeg: r.mwd,
      };
    } catch (e) {
      errors.push(`Buoy ${station} unavailable (${describeError(e)}).`);
    }
  }
  return null;
}

async function loadWind(now: Date, errors: string[]): Promise<InletWind | null> {
  for (const station of WIND_STATIONS) {
    try {
      const rows = await fetchBuoy(station);
      const r = freshRow(rows, now.getTime(), (x) => x.wspd !== null && x.wdir !== null);
      if (!r) continue; // 41114 normally lands here (it reports no wind); silently try the next buoy
      return {
        station, // labelled honestly: the wind is from THIS buoy, offshore, not at the inlet mouth
        t: r.t,
        speedKt: r.wspd === null ? null : Math.round(r.wspd * MS_TO_KT * 10) / 10,
        dirFromDeg: r.wdir,
      };
    } catch (e) {
      errors.push(`Wind buoy ${station} unavailable (${describeError(e)}).`);
    }
  }
  errors.push('No buoy wind reading newer than 3 hours (checked 41114, 41009, 41068).');
  return null;
}

// ---------------------------------------------------------------------------
// Wave-current interaction (published physics only)
// ---------------------------------------------------------------------------

/** Smallest angle between two compass bearings, 0-180 degrees. */
export function angleDiffDeg(a: number, b: number): number {
  const d = Math.abs(((a - b) % 360 + 540) % 360 - 180);
  return d;
}

/**
 * Linear wave theory: waves running into an opposing current shorten and steepen, and are
 * BLOCKED when the current reaches 1/4 of the deep-water group velocity:
 *   Cg = g*T / (4*pi)   (m/s, deep water)    blocking current U = 0.25 * Cg
 * Example: T=5 s -> Cg 3.9 m/s -> U 0.97 m/s = 1.9 kt (matches the report's table).
 * Assumption flagged for readers: deep-water form; at an inlet mouth depths are shallow so
 * real behaviour differs. This is a physics flag, NOT a safety rating.
 */
export function computeWaveCurrentInteraction(
  waves: InletWaves | null,
  current: InletCurrent | null,
  ebbDirToward: number,
): InletSnapshot['waveCurrentInteraction'] {
  if (!waves || !current || waves.meanWaveDirDeg === null) return null;

  // Waves coming FROM a bearing near where the ebb flows TOWARD run head-on into the ebb jet.
  const opposing = angleDiffDeg(waves.meanWaveDirDeg, ebbDirToward) <= 60;

  const T = waves.dominantPeriodS;
  const blockingCurrentKt =
    T !== null && T > 0 ? Math.round(((0.25 * ((G * T) / (4 * Math.PI))) / MS_PER_KT) * 100) / 100 : null;

  // Only an ACTUAL ebb opposes these waves; on flood/slack the current speed counts as 0 here.
  const ebbSpeedKt = current.phase === 'ebb' ? current.speedKt : 0;
  const flagged = opposing && blockingCurrentKt !== null && ebbSpeedKt >= blockingCurrentKt;
  return { opposing, blockingCurrentKt, flagged };
}

// ---------------------------------------------------------------------------
// Public entry point
// ---------------------------------------------------------------------------

/** Build the Fort Pierce inlet snapshot. Never throws; failures land in `errors` with nulls. */
export async function getInletSnapshot(now: Date = new Date()): Promise<InletSnapshot> {
  const errors: string[] = [];

  const [curR, waves, wind] = await Promise.all([
    loadCurrent(now).then(
      (v) => ({ ok: true as const, v }),
      (e: unknown) => ({ ok: false as const, e }),
    ),
    loadWaves(now, errors),
    loadWind(now, errors),
  ]);

  let current: InletCurrent | null = null;
  let nextSlack: InletSnapshot['nextSlack'] = null;
  let ebbDir = DEFAULT_EBB_DIR;
  if (curR.ok) {
    current = curR.v.current;
    nextSlack = curR.v.nextSlack;
    ebbDir = curR.v.ebbDirTrue;
    if (!nextSlack) errors.push('Next slack water could not be determined from NOAA predictions.');
  } else {
    errors.push(`Inlet current prediction unavailable (${describeError(curR.e)}).`);
  }

  return {
    inlet: 'fort-pierce',
    generatedAt: now.toISOString(),
    current,
    nextSlack,
    waves,
    wind,
    waveCurrentInteraction: computeWaveCurrentInteraction(waves, current, ebbDir),
    errors,
  };
}
