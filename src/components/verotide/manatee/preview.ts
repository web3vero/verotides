// preview.ts
// ---------------------------------------------------------------------------
// Builds the data for the static SVG preview that sits in the map box before the interactive
// map loads. It is generated from the SAME zone polygons the map draws, so the preview is a
// faithful picture, shows up without JavaScript, and reserves the exact box (no layout shift).

import type { BoatRamp, ManateeZone, Position } from '@/lib/verotide/geo-types';

/** Window the preview shows: [west, south, east, north]. Matches the data's clip window. */
export const PREVIEW_BBOX: [number, number, number, number] = [-80.65, 27.35, -80.2, 27.95];

export interface PreviewPath {
  id: string;
  zoneType: ManateeZone['zoneType'];
  d: string;
}

export interface PreviewData {
  width: number;
  height: number;
  paths: PreviewPath[];
  ramps: { id: string; x: number; y: number }[];
}

// Scale: 1 viewBox unit = 1/1000 degree of latitude (~110 m). Coordinates are rounded to one
// decimal, so path text stays small while shapes remain visually exact at preview size.
const K = 1000;

export function buildPreview(zones: ManateeZone[] = [], ramps: BoatRamp[] = []): PreviewData {
  const [w, s, e, n] = PREVIEW_BBOX;
  const lat0 = (s + n) / 2;
  const kx = K * Math.cos((lat0 * Math.PI) / 180); // shrink longitude so shapes are not stretched
  const x = (lon: number) => Math.round((lon - w) * kx * 10) / 10;
  const y = (lat: number) => Math.round((n - lat) * K * 10) / 10;

  // One ring -> "M x y L x y ... Z", dropping points that round onto the previous point.
  const ring = (r: Position[]) => {
    let d = '';
    let lx = NaN;
    let ly = NaN;
    for (const [lon, lat] of r) {
      const px = x(lon);
      const py = y(lat);
      if (px === lx && py === ly) continue;
      d += `${d ? 'L' : 'M'}${px} ${py}`;
      lx = px;
      ly = py;
    }
    return d + 'Z';
  };

  const paths: PreviewPath[] = zones.map((z) => {
    const polys = z.geometry.type === 'Polygon' ? [z.geometry.coordinates] : z.geometry.coordinates;
    return { id: z.id, zoneType: z.zoneType, d: polys.map((p) => p.map(ring).join('')).join('') };
  });

  return {
    width: Math.round((e - w) * kx),
    height: Math.round((n - s) * K),
    paths,
    ramps: ramps.map((r) => ({ id: r.id, x: x(r.lon), y: y(r.lat) })),
  };
}
