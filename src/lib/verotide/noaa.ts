// NOAA CO-OPS (Tides & Currents) client + shared fetch helper for the lagoon / inlet data layer.
//
// Why this file exists: the older helper in data.ts swallows every failure and returns an empty
// list, so a NOAA outage looks like "no tides today". Everything here instead THROWS a typed
// `SourceError` and lets the caller (lagoon.ts / inlet.ts) decide how to degrade honestly.
//
// Hard-won NOAA gotchas this file handles (see the tidal-data expert report):
//   1. NOAA returns most errors as HTTP 200 with a JSON body like {"error":{"message":"..."}}.
//      Checking `res.ok` alone is not enough; we inspect the body.
//   2. Timestamps come back with NO timezone offset. We always request `time_zone=gmt` and
//      append "Z" ourselves, so DST (and the repeated 1-2 AM hour in November) can't bite us.
//   3. Observation products refuse ranges over 31 days, so we chunk.
//   4. Subordinate prediction stations (e.g. Vero ocean 8722105) only support interval=hilo and
//      datum=MLLW. Heights are always "feet above MLLW" and we label them that way.
//   5. mdapi (metadata) returns an HTML 404 for unknown resources, not JSON.

import type { IsoUtc } from './lagoon-types';

// ---------------------------------------------------------------------------
// Typed errors
// ---------------------------------------------------------------------------

/** What went wrong, coarse enough for the UI/ops to react to. */
export type SourceErrorKind =
  | 'timeout' // no answer within the timeout
  | 'network' // DNS / connection failure
  | 'http' // non-2xx status
  | 'api' // HTTP 200 but the body carries an error (NOAA style)
  | 'no-data' // the service answered but has nothing for that request
  | 'parse'; // body wasn't the shape we expected

/** A failure from an upstream data source (NOAA, USGS, NDBC). */
export class SourceError extends Error {
  readonly source: string;
  readonly kind: SourceErrorKind;
  readonly status?: number;
  constructor(source: string, kind: SourceErrorKind, message: string, status?: number) {
    super(`${source}: ${message}`);
    this.name = 'SourceError';
    this.source = source;
    this.kind = kind;
    this.status = status;
  }
}

/** Convenience: turn anything thrown into a short human-readable string for `errors[]`. */
export function describeError(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}

// ---------------------------------------------------------------------------
// Generic fetch with timeout + retry (also used by usgs.ts and the NDBC reader)
// ---------------------------------------------------------------------------

export const DEFAULT_TIMEOUT_MS = 8000;

export interface FetchOptions {
  /** Next.js data-cache lifetime in seconds. Ignored outside Next (e.g. the bun check script). */
  revalidate?: number;
  tags?: string[];
  timeoutMs?: number;
  /** Extra attempts after the first one. Default 1 (so at most 2 tries). */
  retries?: number;
  /** Label used in error messages, e.g. "NOAA", "USGS". */
  source?: string;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * GET a URL and return the body text. Retries once on timeout, network failure, 5xx and 429.
 * Does NOT retry on 4xx (a 404 will still be a 404 a second later).
 */
export async function fetchTextWithRetry(url: string, opts: FetchOptions = {}): Promise<string> {
  const source = opts.source ?? 'NOAA';
  const retries = opts.retries ?? 1;
  const timeoutMs = opts.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  let lastErr: SourceError | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    if (attempt > 0) await sleep(400 * attempt); // tiny linear backoff
    try {
      const res = await fetch(url, {
        // AbortSignal.timeout aborts the request (headers AND body) after timeoutMs.
        signal: AbortSignal.timeout(timeoutMs),
        // `next` is a Next.js extension to fetch (data cache); plain runtimes ignore it.
        next: opts.revalidate !== undefined ? { revalidate: opts.revalidate, tags: opts.tags } : undefined,
      } as RequestInit);
      if (!res.ok) {
        const retryable = res.status >= 500 || res.status === 429;
        lastErr = new SourceError(source, 'http', `HTTP ${res.status} from ${new URL(url).hostname}`, res.status);
        if (retryable) continue;
        throw lastErr;
      }
      return await res.text();
    } catch (e) {
      if (e instanceof SourceError) {
        // Non-retryable HTTP error thrown above (or a retryable one that fell out of the loop).
        if (e.kind === 'http' && (e.status ?? 0) < 500 && e.status !== 429) throw e;
        lastErr = e;
        continue;
      }
      const name = (e as { name?: string })?.name;
      const isTimeout = name === 'TimeoutError' || name === 'AbortError';
      lastErr = new SourceError(
        source,
        isTimeout ? 'timeout' : 'network',
        isTimeout ? `timed out after ${timeoutMs} ms` : `network failure (${describeError(e)})`,
      );
    }
  }
  throw lastErr ?? new SourceError(source, 'network', 'unknown failure');
}

/** Like fetchTextWithRetry but parses JSON; a body that isn't JSON becomes a 'parse' error. */
export async function fetchJsonWithRetry<T = unknown>(url: string, opts: FetchOptions = {}): Promise<T> {
  const text = await fetchTextWithRetry(url, opts);
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new SourceError(opts.source ?? 'NOAA', 'parse', 'response was not valid JSON');
  }
}

// ---------------------------------------------------------------------------
// Time helpers (everything internal is UTC; display conversion happens in the UI)
// ---------------------------------------------------------------------------

/** NOAA "YYYY-MM-DD HH:mm" (requested in GMT) -> ISO-8601 UTC "YYYY-MM-DDTHH:mm:00Z". */
export function gmtToIso(s: string): IsoUtc {
  return `${s.trim().replace(' ', 'T')}:00Z`;
}

/** Date -> "YYYYMMDD" using the UTC calendar day (matches time_zone=gmt requests). */
export function utcYmd(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}${m}${day}`;
}

const DAY_MS = 86_400_000;

/**
 * Split [from, to] into windows of at most `maxDays` UTC days each. NOAA caps observation
 * requests at 31 days; we chunk everything the same way so callers never think about it.
 */
export function chunkDateRange(from: Date, to: Date, maxDays = 31): Array<{ begin: string; end: string }> {
  const out: Array<{ begin: string; end: string }> = [];
  // Work on UTC midnights so chunk edges are whole calendar days.
  let cursor = Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate());
  const last = Date.UTC(to.getUTCFullYear(), to.getUTCMonth(), to.getUTCDate());
  while (cursor <= last) {
    const chunkEnd = Math.min(cursor + (maxDays - 1) * DAY_MS, last);
    out.push({ begin: utcYmd(new Date(cursor)), end: utcYmd(new Date(chunkEnd)) });
    cursor = chunkEnd + DAY_MS;
  }
  return out;
}

// ---------------------------------------------------------------------------
// NOAA datagetter
// ---------------------------------------------------------------------------

const DATAGETTER = 'https://api.tidesandcurrents.noaa.gov/api/prod/datagetter';
const MDAPI = 'https://api.tidesandcurrents.noaa.gov/mdapi/prod/webapi/stations';

// Cache lifetimes (seconds). Predictions are deterministic math, so cache long; observations
// update every 6 minutes, so cache short.
export const REVALIDATE_PREDICTIONS = 6 * 3600;
export const REVALIDATE_OBSERVATIONS = 6 * 60;
export const REVALIDATE_CURRENTS = 24 * 3600;
export const REVALIDATE_METADATA = 7 * 24 * 3600;

/**
 * Call the datagetter and return the parsed JSON, throwing if NOAA put an error in the body.
 * Always asks for GMT, English units, JSON, and identifies us via `application=`.
 */
async function datagetter(params: Record<string, string>, revalidate: number, tags: string[]): Promise<Record<string, unknown>> {
  const qs = new URLSearchParams({
    time_zone: 'gmt',
    units: 'english',
    format: 'json',
    application: 'verotides',
    ...params,
  });
  const json = await fetchJsonWithRetry<Record<string, unknown>>(`${DATAGETTER}?${qs}`, {
    revalidate,
    tags,
    source: 'NOAA',
  });
  // The NOAA quirk: errors arrive as HTTP 200 + {"error":{"message":"..."}}.
  const err = (json as { error?: { message?: string } }).error;
  if (err) {
    const msg = (err.message ?? 'unknown NOAA error').trim();
    // "No data was found" / "No Predictions data" are "nothing there", not "service broken".
    const kind: SourceErrorKind = /no .*data/i.test(msg) ? 'no-data' : 'api';
    throw new SourceError('NOAA', kind, `${params.product} ${params.station}: ${msg}`);
  }
  return json;
}

// ---- Tide predictions (hilo) ----

export interface HiLo {
  t: IsoUtc;
  /** Feet above MLLW (datum MLLW, as requested). Negative values are normal. */
  ftMllw: number;
  type: 'H' | 'L';
}

/**
 * High/low tide predictions for any station (harmonic or subordinate), datum MLLW.
 * Chunked over 31 days; results sorted and de-duplicated across chunk seams.
 * Note: subordinate stations can omit an extreme at the day edge, so callers should
 * pad their window by a day on each side and trim afterwards.
 */
export async function getHiLoPredictions(station: string, from: Date, to: Date): Promise<HiLo[]> {
  const all: HiLo[] = [];
  for (const c of chunkDateRange(from, to)) {
    const json = await datagetter(
      { product: 'predictions', station, datum: 'MLLW', interval: 'hilo', begin_date: c.begin, end_date: c.end },
      REVALIDATE_PREDICTIONS,
      ['noaa-predictions', station],
    );
    const rows = json.predictions as Array<{ t: string; v: string; type: string }> | undefined;
    if (!Array.isArray(rows)) throw new SourceError('NOAA', 'parse', `predictions ${station}: missing "predictions" array`);
    for (const r of rows) {
      const ft = Number.parseFloat(r.v);
      if (!Number.isFinite(ft) || (r.type !== 'H' && r.type !== 'L')) continue; // skip junk rows
      all.push({ t: gmtToIso(r.t), ftMllw: ft, type: r.type });
    }
  }
  return dedupeSorted(all, (x) => x.t);
}

// ---- 6-minute predictions (harmonic stations only, e.g. Trident Pier) ----

export interface TimedValue {
  t: IsoUtc;
  ft: number;
}

/** 6-minute astronomical predictions, feet above MLLW. Harmonic stations only. */
export async function getSixMinutePredictions(station: string, from: Date, to: Date): Promise<TimedValue[]> {
  const all: TimedValue[] = [];
  for (const c of chunkDateRange(from, to)) {
    const json = await datagetter(
      { product: 'predictions', station, datum: 'MLLW', interval: '6', begin_date: c.begin, end_date: c.end },
      REVALIDATE_PREDICTIONS,
      ['noaa-predictions', station],
    );
    const rows = json.predictions as Array<{ t: string; v: string }> | undefined;
    if (!Array.isArray(rows)) throw new SourceError('NOAA', 'parse', `predictions ${station}: missing "predictions" array`);
    for (const r of rows) {
      const ft = Number.parseFloat(r.v);
      if (Number.isFinite(ft)) all.push({ t: gmtToIso(r.t), ft });
    }
  }
  return dedupeSorted(all, (x) => x.t);
}

// ---- Observed water level (only Trident 8721604 / Lake Worth 8722670 exist regionally) ----

export interface ObservedLevel extends TimedValue {
  /** 'p' = preliminary, 'v' = verified. We label recent data as preliminary in the UI. */
  quality: string;
}

/** 6-minute observed water level, feet above MLLW. Chunked at 31 days. Preliminary unless q='v'. */
export async function getObservedWaterLevel(station: string, from: Date, to: Date): Promise<ObservedLevel[]> {
  const all: ObservedLevel[] = [];
  for (const c of chunkDateRange(from, to)) {
    const json = await datagetter(
      { product: 'water_level', station, datum: 'MLLW', begin_date: c.begin, end_date: c.end },
      REVALIDATE_OBSERVATIONS,
      ['noaa-observations', station],
    );
    const rows = json.data as Array<{ t: string; v: string; q?: string }> | undefined;
    if (!Array.isArray(rows)) throw new SourceError('NOAA', 'parse', `water_level ${station}: missing "data" array`);
    for (const r of rows) {
      const ft = Number.parseFloat(r.v); // empty string -> NaN -> skipped (gauge gap)
      if (Number.isFinite(ft)) all.push({ t: gmtToIso(r.t), ft, quality: r.q ?? '' });
    }
  }
  return dedupeSorted(all, (x) => x.t);
}

// ---- Current predictions (Fort Pierce Inlet) ----

export interface CurrentEvent {
  t: IsoUtc;
  /** Signed knots along the major axis. NOAA convention: negative = ebb, positive = flood. */
  velocityKt: number;
  /** NOAA's own label for the event (only present for MAX_SLACK). */
  type?: 'slack' | 'ebb' | 'flood';
  meanFloodDir: number | null; // degrees true, direction the flood flows TOWARD
  meanEbbDir: number | null; // degrees true, direction the ebb flows TOWARD
}

/**
 * Current predictions. `interval` is 'MAX_SLACK' (events only) or '6' (6-minute series).
 * IMPORTANT: currents_predictions needs `bin=1` for FPI0901 or NOAA replies with an error;
 * bin 1 is the 33 ft (near-surface-ish) bin per the metadata.
 * These are harmonic PREDICTIONS from a 2008-09 survey, not a live sensor.
 */
export async function getCurrentPredictions(
  station: string,
  from: Date,
  to: Date,
  interval: 'MAX_SLACK' | '6',
  bin = 1,
): Promise<CurrentEvent[]> {
  const all: CurrentEvent[] = [];
  for (const c of chunkDateRange(from, to)) {
    const json = await datagetter(
      { product: 'currents_predictions', station, bin: String(bin), interval, begin_date: c.begin, end_date: c.end },
      REVALIDATE_CURRENTS,
      ['noaa-currents', station],
    );
    const cp = (json.current_predictions as { cp?: Array<Record<string, unknown>> } | undefined)?.cp;
    if (!Array.isArray(cp)) throw new SourceError('NOAA', 'parse', `currents ${station}: missing current_predictions.cp`);
    for (const r of cp) {
      // NOTE: this product capitalises its keys (Time, Velocity_Major, Type), unlike the others.
      const v = Number(r.Velocity_Major);
      if (typeof r.Time !== 'string' || !Number.isFinite(v)) continue;
      const type = typeof r.Type === 'string' ? (r.Type.toLowerCase() as CurrentEvent['type']) : undefined;
      all.push({
        t: gmtToIso(r.Time),
        velocityKt: v,
        type,
        meanFloodDir: Number.isFinite(Number(r.meanFloodDir)) ? Number(r.meanFloodDir) : null,
        meanEbbDir: Number.isFinite(Number(r.meanEbbDir)) ? Number(r.meanEbbDir) : null,
      });
    }
  }
  return dedupeSorted(all, (x) => x.t);
}

// ---- Metadata: flood thresholds ----

export interface FloodThreshold {
  /** NOAA (NOS) minor-flood threshold converted to feet above MLLW. */
  minorMllwFt: number;
  /** Raw numbers so the check script can show its work. */
  nosMinorStationDatumFt: number;
  mllwStationDatumFt: number;
}

/**
 * Minor flood threshold in feet above MLLW, computed LIVE from mdapi.
 * mdapi publishes flood levels in feet above STATION DATUM, not MLLW, so we subtract the
 * station's MLLW (also expressed above station datum). Trident Pier: 23.69 - 18.00 = 5.69.
 * Comparing 23.69 straight to MLLW predictions would be off by 18 ft.
 */
export async function getFloodThreshold(station: string): Promise<FloodThreshold> {
  const opts: FetchOptions = { revalidate: REVALIDATE_METADATA, tags: ['noaa-metadata', station], source: 'NOAA mdapi' };
  const [flood, datums] = await Promise.all([
    fetchJsonWithRetry<{ nos_minor?: number | null }>(`${MDAPI}/${station}/floodlevels.json`, opts),
    fetchJsonWithRetry<{ datums?: Array<{ name: string; value: number }> }>(`${MDAPI}/${station}/datums.json?units=english`, opts),
  ]);
  const mllw = datums.datums?.find((d) => d.name === 'MLLW')?.value;
  const minor = flood.nos_minor;
  if (typeof minor !== 'number' || typeof mllw !== 'number') {
    throw new SourceError('NOAA mdapi', 'parse', `flood levels / MLLW datum missing for ${station}`);
  }
  return {
    minorMllwFt: Math.round((minor - mllw) * 100) / 100,
    nosMinorStationDatumFt: minor,
    mllwStationDatumFt: mllw,
  };
}

// ---------------------------------------------------------------------------
// Small utilities
// ---------------------------------------------------------------------------

/** Sort ascending by timestamp and drop duplicate timestamps (chunk seams can repeat a row). */
function dedupeSorted<T>(rows: T[], key: (x: T) => string): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const r of [...rows].sort((a, b) => key(a).localeCompare(key(b)))) {
    const k = key(r);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(r);
  }
  return out;
}
