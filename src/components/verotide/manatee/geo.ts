// geo.ts
// ---------------------------------------------------------------------------
// Tiny geometry helpers for the "zones near me" button. Pure functions, no dependencies.
//
// At county scale (about 40 miles across) a flat "equirectangular" approximation is accurate
// to a small fraction of a percent, so we avoid turf. The shapes themselves are simplified to
// ~11 m, so the answer is an estimate, never a legal determination.

import type { ManateeZone, Position } from '@/lib/verotide/geo-types';

const MILES_PER_DEG_LAT = 69.0;

/** Project [lon, lat] to local miles around a reference latitude (x east, y north). */
function toMiles(p: Position, lat0: number): [number, number] {
  const kx = MILES_PER_DEG_LAT * Math.cos((lat0 * Math.PI) / 180);
  return [p[0] * kx, p[1] * MILES_PER_DEG_LAT];
}

/** Ray-casting point-in-ring test (works in raw degrees; fine for a yes/no answer). */
function inRing(pt: Position, ring: Position[]): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if (yi > pt[1] !== yj > pt[1] && pt[0] < ((xj - xi) * (pt[1] - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

/** Distance in miles from a point to the nearest edge of a ring. */
function distToRing(pt: Position, ring: Position[]): number {
  const lat0 = pt[1];
  const [px, py] = toMiles(pt, lat0);
  let best = Infinity;
  for (let i = 0; i < ring.length - 1; i++) {
    const [ax, ay] = toMiles(ring[i], lat0);
    const [bx, by] = toMiles(ring[i + 1], lat0);
    const dx = bx - ax;
    const dy = by - ay;
    const len2 = dx * dx + dy * dy;
    // Projection of the point onto the segment, clamped to the segment ends.
    const t = len2 === 0 ? 0 : Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / len2));
    const d = Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
    if (d < best) best = d;
  }
  return best;
}

export interface NearZone {
  zone: ManateeZone;
  /** Miles to the nearest edge; 0 when the point is inside the drawn polygon. */
  miles: number;
  /** Position falls inside the drawn (simplified) shape. NOT a legal statement. */
  inside: boolean;
}

/** Normalise Polygon / MultiPolygon to a list of polygons (each = outer ring + holes). */
function polygonsOf(zone: ManateeZone): Position[][][] {
  return zone.geometry.type === 'Polygon' ? [zone.geometry.coordinates] : zone.geometry.coordinates;
}

/** Zones sorted by distance from [lon, lat]; the first `limit` entries. */
export function nearestZones(zones: ManateeZone[], lon: number, lat: number, limit = 5): NearZone[] {
  const pt: Position = [lon, lat];
  const out: NearZone[] = zones.map((zone) => {
    let inside = false;
    let miles = Infinity;
    for (const poly of polygonsOf(zone)) {
      const [outer, ...holes] = poly;
      if (inRing(pt, outer) && !holes.some((h) => inRing(pt, h))) inside = true;
      miles = Math.min(miles, distToRing(pt, outer));
      for (const h of holes) miles = Math.min(miles, distToRing(pt, h));
    }
    return { zone, miles: inside ? 0 : miles, inside };
  });
  return out.sort((a, b) => a.miles - b.miles).slice(0, limit);
}
