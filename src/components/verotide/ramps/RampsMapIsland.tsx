'use client';

// RampsMapIsland.tsx (tiny client wrapper)
// ---------------------------------------------------------------------------------------------
// Why this exists: the directory page is a server component, but handling a map click (scroll to
// the matching ramp card) needs a function, and functions cannot be passed from server to client
// components. So this wrapper owns the onSelect handler and renders the shared LazyMap.
// ---------------------------------------------------------------------------------------------

import { useCallback } from 'react';
import { LazyMap } from '@/components/verotide/maps/LazyMap';
import type { BoatRamp } from '@/lib/verotide/geo-types';

interface Props {
  ramps: BoatRamp[];
  /** ramp id -> DOM id of its card (e.g. "ramp-oslo-road-public-boat-ramp"). */
  anchors: Record<string, string>;
}

export default function RampsMapIsland({ ramps, anchors }: Props) {
  const onSelect = useCallback(
    (kind: 'zone' | 'ramp', id: string) => {
      if (kind !== 'ramp') return;
      const anchor = anchors[id];
      const el = anchor ? document.getElementById(anchor) : null;
      if (!el) return;
      // Respect reduced-motion: jump instead of smooth-scrolling.
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
      // Move keyboard/screen-reader focus to the card and keep the URL shareable.
      el.focus({ preventScroll: true });
      window.history.replaceState(null, '', `#${anchor}`);
    },
    [anchors],
  );

  return (
    <LazyMap
      ramps={ramps}
      // Centred on Indian River County; the zoom shows the county with a little of its neighbours.
      focus={{ lat: 27.68, lon: -80.42, zoom: 9.3 }}
      height={420}
      onSelect={onSelect}
      ariaLabel="Map of public boat ramps in Indian River County and nearby"
    />
  );
}
