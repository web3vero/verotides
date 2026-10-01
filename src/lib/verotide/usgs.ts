// USGS Water Services client: Indian River at Wabasso (02251800), the only live lagoon-stage
// gauge between Sebastian and Fort Pierce.
//
// We read parameter 63160 = "Water-surface elevation above NAVD88, ft", 15-minute instantaneous
// values (IV). NAVD88 is a LAND-elevation datum, so these numbers must never be mixed with NOAA
// tide-table heights, which are MLLW. Data are USGS *provisional*.
//
// Known quirks (from the validation report): the service throws an occasional HTTP 503 (a retry
// fixes it), and adding `siteStatus=all` to the IV endpoint yields an empty 301, so we don't.

import type { IsoUtc, LagoonObserved, LagoonSample } from './lagoon-types';
import { SourceError, fetchJsonWithRetry } from './noaa';

export const WABASSO_SITE = '02251800' as const;
const PARAM_NAVD88_FT = '63160';

/** A reading older than this is flagged stale (gauge or API trouble). */
export const USGS_STALE_AFTER_MS = 2 * 3600_000;

/** USGS 15-minute data change slowly, so a 5-minute cache is plenty. */
const REVALIDATE_SECONDS = 300;

// Minimal shape of the WaterML-JSON we read; everything else is ignored.
interface UsgsIvResponse {
  value?: {
    timeSeries?: Array<{
      values?: Array<{ value?: Array<{ value: string; dateTime: string }> }>;
      variable?: { noDataValue?: number };
    }>;
  };
}

/**
 * Fetch the last 48 h of Wabasso water level.
 * Throws SourceError on failure; the caller (lagoon.ts) turns that into `errors[]` + `observed: null`.
 * Returns samples sorted oldest -> newest, with ISO-UTC timestamps.
 */
export async function getWabassoObserved(now: Date = new Date()): Promise<LagoonObserved> {
  const url =
    'https://waterservices.usgs.gov/nwis/iv/?format=json' +
    `&sites=${WABASSO_SITE}&parameterCd=${PARAM_NAVD88_FT}&period=PT48H`;

  // Two retries (3 tries) because the 503s are usually transient and USGS is our only lagoon gauge.
  const json = await fetchJsonWithRetry<UsgsIvResponse>(url, {
    revalidate: REVALIDATE_SECONDS,
    tags: ['usgs-wabasso'],
    retries: 2,
    source: 'USGS',
  });

  const series = json.value?.timeSeries?.[0];
  const rows = series?.values?.[0]?.value;
  if (!Array.isArray(rows)) {
    throw new SourceError('USGS', 'parse', 'no time series in response for Wabasso 02251800');
  }
  const noData = series?.variable?.noDataValue ?? -999999;

  const samples: LagoonSample[] = [];
  for (const r of rows) {
    const ft = Number.parseFloat(r.value);
    // USGS marks gaps with the sentinel -999999; also drop anything non-numeric.
    if (!Number.isFinite(ft) || ft === noData || ft <= -999) continue;
    const ms = Date.parse(r.dateTime); // dateTime carries a UTC offset, so Date.parse is exact
    if (!Number.isFinite(ms)) continue;
    samples.push({ t: new Date(ms).toISOString() as IsoUtc, ft });
  }
  samples.sort((a, b) => a.t.localeCompare(b.t));

  if (samples.length === 0) {
    throw new SourceError('USGS', 'no-data', 'Wabasso returned no usable samples in the last 48 h');
  }

  const latest = samples[samples.length - 1];
  const stale = now.getTime() - Date.parse(latest.t) > USGS_STALE_AFTER_MS;
  return { siteNo: WABASSO_SITE, datum: 'NAVD88', samples, latest, stale };
}
