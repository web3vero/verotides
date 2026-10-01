// Shared data contract for the Lagoon Water Level + Inlet Conditions features.
//
// Why this file exists: the data layer (src/lib/verotide/lagoon.ts, inlet.ts) and the UI pages
// are built in parallel, so both sides code against these types instead of against each other.
//
// Honesty rules baked into the shapes (from the expert backtest, see docs in the repo's
// SEO notes): every number carries its datum/units, every live feed can be null/stale, and the
// snapshot carries human-readable `errors` so the UI can say "NOAA is unreachable" instead of
// silently showing an empty page.

/** ISO-8601 UTC timestamp, e.g. "2026-10-01T14:30:00Z". Convert to America/New_York only for display. */
export type IsoUtc = string;

// ---------------------------------------------------------------------------
// Lagoon water level (Indian River Lagoon at Wabasso)
// ---------------------------------------------------------------------------

export interface LagoonSample {
  t: IsoUtc;
  /** Feet, NAVD88 (USGS parameter 63160). Never mix with MLLW tide-table heights. */
  ft: number;
}

export interface LagoonObserved {
  /** USGS 02251800 Indian River at Wabasso. */
  siteNo: '02251800';
  datum: 'NAVD88';
  /** Last ~48 h, 15-minute values, provisional USGS data. */
  samples: LagoonSample[];
  latest: LagoonSample | null;
  /** True when `latest` is older than ~2 hours (gauge or API trouble). */
  stale: boolean;
}

/** A predicted lagoon high/low: the ocean high/low from NOAA shifted by the fitted lag. */
export interface LagoonExtreme {
  t: IsoUtc; // lagoon time (ocean time + lagMinutes)
  type: 'H' | 'L';
  oceanT: IsoUtc; // the NOAA ocean extreme it came from
  oceanFtMllw: number; // NOAA height at the ocean station, feet above MLLW
  lagMinutes: number; // 210 (3.5 h) by default; see lagoon.ts constants
}

/** One point of the anchored short-range forecast, with its uncertainty band. */
export interface ForecastPoint {
  t: IsoUtc;
  ft: number; // best estimate, feet NAVD88
  lo: number; // ft - band
  hi: number; // ft + band
}

/**
 * Coastal sea level vs NOAA's prediction at the nearest observed reference gauge
 * (Trident Pier 8721604). In fall the ocean runs ~0.5-1.5 ft above prediction, which is
 * the main reason lagoon and street flooding surprises people.
 */
export interface CoastalAnomaly {
  station: '8721604';
  /** Mean (observed - predicted) over the last 72 h, feet. null if too little data. */
  meanFt72h: number | null;
  latest: { t: IsoUtc; observedFt: number; predictedFt: number; anomalyFt: number } | null;
  stale: boolean;
}

export interface FloodWatchPeak {
  t: IsoUtc;
  predictedFtMllw: number; // NOAA predicted high at Trident Pier
  withAnomalyFtMllw: number; // predicted + current anomaly (clamped to >= 0 for the optimistic case)
  exceedsMinor: boolean; // withAnomalyFtMllw >= thresholdMllwFt
}

/** Reference-gauge flood watch. NOT a forecast for any specific Vero street. */
export interface FloodWatch {
  station: '8721604';
  /** NOAA minor-flood threshold at Trident Pier, feet above MLLW (23.69 ft station datum - 18.00). */
  thresholdMllwFt: number;
  nextPeaks: FloodWatchPeak[]; // next ~7 days of predicted highs
}

export interface LagoonSnapshot {
  generatedAt: IsoUtc;
  observed: LagoonObserved | null;
  extremes: LagoonExtreme[]; // next ~48 h
  forecast: ForecastPoint[]; // anchored on the latest observation, ~72 h, hourly
  anomaly: CoastalAnomaly | null;
  floodWatch: FloodWatch | null;
  /** Human-readable problems ("NOAA predictions unavailable"). Empty when everything worked. */
  errors: string[];
}

// ---------------------------------------------------------------------------
// Inlet conditions (Fort Pierce Inlet; Sebastian is an estimate-only phase 2)
// ---------------------------------------------------------------------------

export interface InletCurrent {
  t: IsoUtc;
  speedKt: number; // signed magnitude, always >= 0
  dirTrue: number; // degrees true the water is moving toward
  phase: 'ebb' | 'flood' | 'slack';
  /** NOAA FPI0901 bin 1: a PREDICTION, not a live sensor. */
  source: 'NOAA FPI0901 prediction';
}

export interface InletWaves {
  station: '41114' | '41113' | '41009' | '41068';
  t: IsoUtc;
  hsFt: number | null; // significant wave height
  dominantPeriodS: number | null;
  meanWaveDirDeg: number | null; // degrees the waves come FROM
}

export interface InletWind {
  station: string;
  t: IsoUtc;
  speedKt: number | null;
  dirFromDeg: number | null;
}

export interface InletSnapshot {
  inlet: 'fort-pierce';
  generatedAt: IsoUtc;
  current: InletCurrent | null;
  nextSlack: { t: IsoUtc; type: 'slack-before-ebb' | 'slack-before-flood' } | null;
  waves: InletWaves | null;
  wind: InletWind | null;
  /**
   * Published-physics flag ONLY: is an opposing current strong enough to block (steepen) waves
   * of the observed period? Derived from linear wave theory (current >= 1/4 deep-water group
   * velocity). This is NOT a go/no-go safety score: no composite rating is published.
   */
  waveCurrentInteraction: {
    opposing: boolean; // waves arriving from the same side the ebb flows toward
    blockingCurrentKt: number | null; // current speed at which these waves would block
    flagged: boolean; // opposing && current >= blockingCurrentKt
  } | null;
  errors: string[];
}
