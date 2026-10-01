// ramps.ts
// ---------------------------------------------------------------------------------------------
// Data helpers for /boat-ramps and /boat-ramps/[slug].
//
// Single source of truth: src/data/boat-ramps.json (FWC Boat Ramp Inventory) and
// src/data/manatee-zones.json (FWC State Manatee Protection Zones). Nothing here invents a fact;
// a missing field stays null and the UI prints "not confirmed".
//
// What lives here:
//   - stable slugs for each ramp (the source has ids but no slug)
//   - geometry: haversine distance and point-to-polygon distance (for "nearby manatee zones")
//   - the INDEXABILITY GATE (indexableRamps) that decides which ramps earn a standalone page
//
// The gate is deliberately strict. A ramp page that is only a restated spreadsheet row is thin
// content; so a ramp only gets its own URL when the data lets us write something specific,
// and when we can point the reader at nearby zone information. Everything else stays on the
// directory page under the anchor `ramp-<slug>`.
// ---------------------------------------------------------------------------------------------

import rampsRaw from '@/data/boat-ramps.json';
import zonesRaw from '@/data/manatee-zones.json';
import {
  asBoatRampsFile,
  asManateeZonesFile,
  type BoatRamp,
  type ManateeZone,
  type ZoneGeometry,
  type ZoneType,
} from './geo-types';
import { buildRampNarrative, countWords } from './ramps-copy';

const RAMPS_FILE = asBoatRampsFile(rampsRaw);
const ZONES_FILE = asManateeZonesFile(zonesRaw);

// ---- Tunables ---------------------------------------------------------------------------------

/** Zones within this distance (miles) are listed as "nearby". Informational, not a route claim. */
export const NEARBY_ZONE_MILES = 1.5;
/** Minimum verified, non-null structured facts for a standalone page. */
export const MIN_FACTS = 5;
/** Minimum words of data-specific prose for a standalone page. */
export const MIN_NARRATIVE_WORDS = 80;
/** Minimum nearby zones for a standalone page. */
export const MIN_NEARBY_ZONES = 1;
/** Data older than this (months) is not indexable. lastVerified is the FWC edit date. */
export const MAX_DATA_AGE_MONTHS = 12;
/**
 * Editorial scope for standalone pages. Our data-composed copy is necessarily similar in shape from
 * ramp to ramp, so we only give a ramp its own URL when it is the kind of place people search for
 * by name (a trailer-capable ramp) AND sits where Verotides' lagoon and zone context applies
 * (Indian River County). Hand-launch sites and neighbouring-county ramps stay on the directory,
 * which already carries every fact. This is what keeps the page count honest instead of publishing
 * ~40 near-identical pages.
 */
export const INDEXABLE_COUNTIES: readonly string[] = ['Indian River'];
export const INDEXABLE_KINDS: readonly string[] = ['boat-ramp', 'marina-ramp'];

// ---- Slugs ------------------------------------------------------------------------------------

/** "Sebastian Inlet State Park - Coconut Point Boat Ramp" -> "sebastian-inlet-state-park-coconut-point-boat-ramp". */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/\([^)]*\)/g, ' ') // drop parentheticals such as "(Call Ahead to Unlock Gate ...)"
    .replace(/&/g, ' and ')
    .replace(/['’]/g, '') // "Fisherman's" -> "fishermans"
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
    .replace(/-+$/g, '');
}

/**
 * Build slugs once. If two ramps slugify to the same text (the inventory has several rows per
 * park), the later ones get the lowercase source id appended so URLs stay stable and unique.
 */
const SLUG_BY_ID = new Map<string, string>();
const RAMP_BY_SLUG = new Map<string, BoatRamp>();
(() => {
  // Sort by id first so collision winners do not depend on file order.
  for (const r of [...RAMPS_FILE.ramps].sort((a, b) => a.id.localeCompare(b.id))) {
    let slug = slugify(r.name) || r.id.toLowerCase();
    if (RAMP_BY_SLUG.has(slug)) slug = `${slug}-${r.id.toLowerCase()}`;
    SLUG_BY_ID.set(r.id, slug);
    RAMP_BY_SLUG.set(slug, r);
  }
})();

export function rampSlug(ramp: BoatRamp): string {
  return SLUG_BY_ID.get(ramp.id) ?? ramp.id.toLowerCase();
}

/** Anchor id used on the directory page for every ramp (indexable or not). */
export function rampAnchorId(ramp: BoatRamp): string {
  return `ramp-${rampSlug(ramp)}`;
}

export function getRamp(slug: string): BoatRamp | undefined {
  return RAMP_BY_SLUG.get(slug);
}

/** Map-click support: LazyMap reports the ramp id; the page needs the anchor id. */
export function rampIdToAnchor(): Record<string, string> {
  const out: Record<string, string> = {};
  for (const r of RAMPS_FILE.ramps) out[r.id] = rampAnchorId(r);
  return out;
}

// ---- Collections ------------------------------------------------------------------------------

const COUNTY_ORDER = ['Indian River', 'St. Lucie', 'Brevard'];

/** All ramps, ordered county (Indian River first) -> waterbody -> name. */
export function getRamps(): BoatRamp[] {
  const rank = (c: string) => {
    const i = COUNTY_ORDER.indexOf(c);
    return i === -1 ? COUNTY_ORDER.length : i;
  };
  return [...RAMPS_FILE.ramps].sort(
    (a, b) =>
      rank(a.county) - rank(b.county) ||
      (a.waterbody ?? '').localeCompare(b.waterbody ?? '') ||
      a.name.localeCompare(b.name),
  );
}

export interface RampGroup {
  county: string;
  waterbodies: { waterbody: string; ramps: BoatRamp[] }[];
}

/** County -> waterbody grouping for the directory. Null waterbody becomes "Waterbody not stated". */
export function groupRamps(ramps: BoatRamp[] = getRamps()): RampGroup[] {
  const groups: RampGroup[] = [];
  for (const r of ramps) {
    let g = groups.find((x) => x.county === r.county);
    if (!g) groups.push((g = { county: r.county, waterbodies: [] }));
    const wb = r.waterbody ?? 'Waterbody not stated';
    let w = g.waterbodies.find((x) => x.waterbody === wb);
    if (!w) g.waterbodies.push((w = { waterbody: wb, ramps: [] }));
    w.ramps.push(r);
  }
  return groups;
}

export function getRampsMeta() {
  return RAMPS_FILE.meta;
}

export function getZoneById(id: string): ManateeZone | undefined {
  return ZONES_FILE.zones.find((z) => z.id === id);
}

// ---- Geometry ---------------------------------------------------------------------------------

const EARTH_RADIUS_MI = 3958.7613;
const toRad = (d: number) => (d * Math.PI) / 180;

/** Great-circle distance in miles between two lat/lon points (haversine). */
export function haversineMiles(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_MI * Math.asin(Math.min(1, Math.sqrt(a)));
}

type Ring = [number, number][]; // [lon, lat]

/** Ray-casting point-in-ring test in raw lon/lat (fine at this scale). */
function inRing(lon: number, lat: number, ring: Ring): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if (yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

/** Inside the outer ring and outside every hole. */
function inPolygon(lon: number, lat: number, rings: Ring[]): boolean {
  if (rings.length === 0 || !inRing(lon, lat, rings[0])) return false;
  for (let k = 1; k < rings.length; k++) if (inRing(lon, lat, rings[k])) return false;
  return true;
}

/**
 * Shortest distance (miles) from a point to a line segment. We project to a local flat plane
 * (x east, y north, in miles) around the point; at a couple of miles the error is negligible,
 * and it keeps the math simple. Haversine would be needed only for long distances.
 */
function pointToSegmentMiles(lat: number, lon: number, a: [number, number], b: [number, number]): number {
  const milesPerDegLat = (Math.PI / 180) * EARTH_RADIUS_MI;
  const milesPerDegLon = milesPerDegLat * Math.cos(toRad(lat));
  // Segment endpoints relative to the point (the point is the origin).
  const ax = (a[0] - lon) * milesPerDegLon;
  const ay = (a[1] - lat) * milesPerDegLat;
  const bx = (b[0] - lon) * milesPerDegLon;
  const by = (b[1] - lat) * milesPerDegLat;
  const dx = bx - ax;
  const dy = by - ay;
  const len2 = dx * dx + dy * dy;
  // t = how far along the segment the closest point is, clamped to [0,1].
  const t = len2 === 0 ? 0 : Math.max(0, Math.min(1, -(ax * dx + ay * dy) / len2));
  return Math.hypot(ax + t * dx, ay + t * dy);
}

function polygonsOf(g: ZoneGeometry): Ring[][] {
  return g.type === 'Polygon' ? [g.coordinates as Ring[]] : (g.coordinates as Ring[][]);
}

/**
 * Distance in miles from a point to a zone polygon: 0 if the point is inside, else the distance
 * to the nearest edge. (The "point-to-polygon distance helper".)
 */
export function pointToPolygonMiles(lat: number, lon: number, geometry: ZoneGeometry): number {
  let best = Infinity;
  for (const rings of polygonsOf(geometry)) {
    if (inPolygon(lon, lat, rings)) return 0;
    for (const ring of rings) {
      for (let i = 0; i < ring.length - 1; i++) {
        best = Math.min(best, pointToSegmentMiles(lat, lon, ring[i], ring[i + 1]));
      }
    }
  }
  return best;
}

// ---- Nearby manatee zones ---------------------------------------------------------------------

export interface NearbyZone {
  zone: ManateeZone;
  /** Miles from the ramp point to the nearest edge of the zone polygon (0 = point inside). */
  miles: number;
  /** Plain-English zone type label, e.g. "Idle speed". */
  typeLabel: string;
  /** Anchor on the zones page. */
  href: string;
}

const TYPE_LABEL: Record<ZoneType, string> = {
  'no-entry': 'No entry',
  'motorboats-prohibited': 'Motorboats prohibited',
  'idle-speed': 'Idle speed',
  'slow-speed': 'Slow speed',
  'max-25-mph': '25 mph maximum',
  'max-30-mph': '30 mph maximum',
  unregulated: 'Unregulated',
  unknown: 'Rule type not recognised',
};

/** Link target on the zones page. The zones page anchors rows as `zone-<id>`. */
export function zoneHref(zone: ManateeZone): string {
  return `/manatee-zones#zone-${zone.id}`;
}

export function zoneTypeLabel(zone: ManateeZone): string {
  // Seasonal zones carry two rules; show the headline type and flag the seasonality.
  const base = TYPE_LABEL[zone.zoneType] ?? TYPE_LABEL.unknown;
  return zone.seasonal ? `${base} (seasonal rules)` : base;
}

const nearbyCache = new Map<string, NearbyZone[]>();

/**
 * Manatee zones within `maxMiles` of the ramp point, closest first. Zones whose only rule is
 * "unregulated" are skipped (they are not a restriction). This says only that a mapped zone is
 * NEAR the ramp. It does not say a zone is on anyone's route.
 */
export function nearbyZones(ramp: BoatRamp, maxMiles: number = NEARBY_ZONE_MILES): NearbyZone[] {
  const key = `${ramp.id}:${maxMiles}`;
  const hit = nearbyCache.get(key);
  if (hit) return hit;
  const out: NearbyZone[] = [];
  for (const zone of ZONES_FILE.zones) {
    if (zone.zoneType === 'unregulated') continue;
    const miles = pointToPolygonMiles(ramp.lat, ramp.lon, zone.geometry);
    if (miles <= maxMiles) out.push({ zone, miles, typeLabel: zoneTypeLabel(zone), href: zoneHref(zone) });
  }
  out.sort((a, b) => a.miles - b.miles);
  nearbyCache.set(key, out);
  return out;
}

// ---- Verified facts ---------------------------------------------------------------------------

/**
 * The structured facts we count toward the gate: each is a non-null value taken straight from the
 * inventory. "No toilet" and "no dock" still count as facts (the source says so); a blank does not.
 */
export function verifiedFacts(r: BoatRamp): string[] {
  const facts: [string, unknown][] = [
    ['lanes', r.lanes.total],
    ['fee', r.fee.required],
    ['hours', r.hours],
    ['vehicleParking', r.parking.vehicleSpaces],
    ['trailerParking', r.parking.trailerSpaces],
    ['amenities', r.amenities],
    ['address', r.address],
    ['operator', r.operator],
    ['dock', r.dockType],
    ['surface', r.rampSurface],
    ['restroom', r.restroom.type],
    ['accessibility', r.accessibilityLevel],
    ['phone', r.phone],
  ];
  return facts.filter(([, v]) => v !== null && v !== undefined && v !== '').map(([k]) => k);
}

// ---- Indexability gate ------------------------------------------------------------------------

export interface GateResult {
  ok: boolean;
  facts: number;
  words: number;
  nearby: number;
  reasons: string[];
}

function monthsSince(iso: string | null): number {
  if (!iso) return Infinity;
  const then = new Date(`${iso}T00:00:00Z`).getTime();
  return (Date.now() - then) / (1000 * 60 * 60 * 24 * 30.44);
}

const gateCache = new Map<string, GateResult>();

/**
 * Evaluate every condition for a standalone page. All must hold:
 *   (a) >= MIN_FACTS verified structured facts,
 *   (b) >= MIN_NARRATIVE_WORDS words of data-specific prose (see buildRampNarrative),
 *   (c) >= MIN_NEARBY_ZONES mapped manatee zones within NEARBY_ZONE_MILES to link,
 *   (d) the source reports it as open (a closed ramp would be a page about nothing),
 *   (e) the record was edited within MAX_DATA_AGE_MONTHS,
 *   (f) editorial scope: INDEXABLE_COUNTIES and INDEXABLE_KINDS (see above).
 */
export function evaluateRamp(ramp: BoatRamp): GateResult {
  const hit = gateCache.get(ramp.id);
  if (hit) return hit;
  const facts = verifiedFacts(ramp).length;
  const nearby = nearbyZones(ramp);
  const words = countWords(buildRampNarrative(ramp, nearby).join(' '));
  const reasons: string[] = [];
  if (facts < MIN_FACTS) reasons.push(`only ${facts} verified facts`);
  if (words < MIN_NARRATIVE_WORDS) reasons.push(`only ${words} words of specific copy`);
  if (nearby.length < MIN_NEARBY_ZONES) reasons.push('no mapped manatee zone within range');
  if (!INDEXABLE_COUNTIES.includes(ramp.county)) reasons.push(`outside scope (${ramp.county} County)`);
  if (!INDEXABLE_KINDS.includes(ramp.kind)) reasons.push(`kind "${ramp.kind}" stays on the directory`);
  if (!ramp.open) reasons.push(`source status: ${ramp.status ?? 'unknown'}`);
  if (monthsSince(ramp.lastVerified) > MAX_DATA_AGE_MONTHS) reasons.push('record older than 12 months');
  const result = { ok: reasons.length === 0, facts, words, nearby: nearby.length, reasons };
  gateCache.set(ramp.id, result);
  return result;
}

export function isIndexable(ramp: BoatRamp): boolean {
  return evaluateRamp(ramp).ok;
}

/**
 * Ramps that get a standalone /boat-ramps/<slug> page. Used by generateStaticParams, the page's
 * notFound() check, and (by the sitemap owner) the sitemap, so the three can never disagree.
 */
export function indexableRamps(): BoatRamp[] {
  return getRamps().filter(isIndexable);
}

/** Latest record edit date among indexable ramps (YYYY-MM-DD), for sitemap lastmod. */
export function rampsLastModified(): string | null {
  const dates = indexableRamps()
    .map((r) => r.lastVerified)
    .filter((d): d is string => !!d)
    .sort();
  return dates.length ? dates[dates.length - 1] : null;
}
