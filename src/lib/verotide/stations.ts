// NOAA Tides & Currents stations relevant to Vero Beach.
// Every ID below was verified on 2026-09-30 against the NOAA CO-OPS metadata API
// (https://api.tidesandcurrents.noaa.gov/mdapi/prod/webapi/stations/<id>.json)
// AND a live predictions datagetter call. Do not change an ID without re-checking both.
export const STATIONS = {
  // 8722004 = "SEBASTIAN INLET, FL" (27.86N, -80.4483W) - the ocean-side gauge.
  veroOcean: '8722004',
  // 8722125 = "Vero Beach, FL" (27.6317N, -80.3717W) - Indian River Lagoon (Intracoastal) side.
  // (Previously mislabeled as Sebastian Inlet, and lagoon pointed at 8722206, which returns 404.)
  veroLagoon: '8722125',
  sebastianInlet: '8722004',   // Same gauge as veroOcean
  // 8722212 = "FORT PIERCE, SOUTH JETTY, FL" - valid; usable as a southern backup.
  fortPierce: '8722212',
};

export const WEATHER_GRIDS = {
  // Verified 2026-09-30 via api.weather.gov/points/27.6386,-80.3973 -> MLB 68,33 (zone FLZ154, Vero Beach).
  // The old 50,78 was a different part of Brevard County. (Currently unreferenced; kept correct for future use.)
  veroBeach: { office: 'MLB', x: 68, y: 33 },  // Melbourne NWS office
};

export const FWC_REGIONS = {
  indianRiver: 'IRC',
  redTideZone: 'east-central',
};
