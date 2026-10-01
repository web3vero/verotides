// Shared props contract for the interactive map used by /manatee-zones and /boat-ramps.
// Two agents build against this file in parallel: the map implementation (LazyMap.tsx) and the
// pages that render it. Change it only together with both sides.

import type { BoatRamp, ManateeZone } from '@/lib/verotide/geo-types';

export interface MapFocus {
  lat: number;
  lon: number;
  zoom: number;
}

export interface LazyMapProps {
  /** Manatee zone polygons to draw (omit on a ramps-only map). */
  zones?: ManateeZone[];
  /** Boat ramp points to draw (omit on a zones-only map). */
  ramps?: BoatRamp[];
  /** Initial camera. Defaults to Indian River County (~27.65, -80.40, zoom 9.5). */
  focus?: MapFocus;
  /** Fixed pixel height of the map box (prevents layout shift). Default 420. */
  height?: number;
  /** Offer the opt-in NOAA nautical chart overlay toggle (off by default). */
  showChartToggle?: boolean;
  /** Called with the id of the clicked zone/ramp so the page can scroll to its anchor. */
  onSelect?: (kind: 'zone' | 'ramp', id: string) => void;
  /** Accessible name for the map region. */
  ariaLabel: string;
}
