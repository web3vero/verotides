'use client';

// LazyMap.tsx
// ---------------------------------------------------------------------------
// Public entry point for the interactive map: pages import { LazyMap } and pass LazyMapProps
// (see map-types.ts; the contract is unchanged).
//
// What this file does NOT contain: MapLibre. The real map lives in ../manatee/MapCanvas.tsx and is
// pulled in with next/dynamic, so maplibre-gl (about 200 KB gzipped, plus its CSS) stays out of
// the page's first JavaScript. The chunk loads only when
//   (a) the box scrolls within 200 px of the viewport AND the visitor has not asked their
//       browser to save data, or
//   (b) the visitor taps "Load interactive map".
//
// Until then the box shows a static SVG preview drawn from the same zone polygons. That SVG is
// part of the server-rendered HTML (client components are still rendered on the server once),
// so it needs no JavaScript, and the fixed height means the page never jumps when the map loads.

import dynamic from 'next/dynamic';
import { Component, useEffect, useId, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from 'react';
import type { LazyMapProps } from './map-types';
import { buildPreview } from '../manatee/preview';
import { ZonePreviewSvg } from '../manatee/ZoneGraphics';

// ssr:false because MapLibre needs WebGL and `window`. The loading box matches the final size.
const MapCanvas = dynamic(() => import('../manatee/MapCanvas'), {
  ssr: false,
  loading: () => (
    <div className="flex h-[420px] items-center justify-center font-mono text-[10px] uppercase tracking-widest text-primary/60">
      Loading map...
    </div>
  ),
});


// Why this exists: MapLibre needs WebGL2. In a browser without it (GPU disabled, locked-down or very
// old devices, some crawlers) the map constructor THROWS during a React effect, and an uncaught error
// there unmounts the whole page into the site's global error screen. The map is an enhancement, so
// it must never be able to take the page down. Two layers of protection:
//   1) webgl2Available() lets us skip loading the map at all when we can tell it cannot work;
//   2) MapErrorBoundary catches anything else that goes wrong inside the map subtree and swaps in
//      the static preview. The server-rendered zone tables below the map always remain.
function webgl2Available(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!canvas.getContext('webgl2');
  } catch {
    return false;
  }
}

class MapErrorBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: unknown) {
    // Keep a console trail for debugging without surfacing anything scary to the visitor.
    console.warn('Interactive map failed to start; showing static preview instead.', error);
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

export function LazyMap(props: LazyMapProps) {
  const { zones, ramps, height = 420, ariaLabel } = props;
  const boxRef = useRef<HTMLDivElement>(null);
  const afterId = useId(); // target for the "skip map" link
  const [active, setActive] = useState(false);
  // null on the server (we cannot test WebGL there); true/false in the browser. useSyncExternalStore
  // gives a different server vs client answer without a hydration warning and without setState-in-effect.
  const canRender = useSyncExternalStore<boolean | null>(
    () => () => {},
    webgl2Available,
    () => null
  );

  // Static preview geometry, computed once per data set.
  const preview = useMemo(() => buildPreview(zones, ramps), [zones, ramps]);

  // Auto-load on scroll-into-view, unless Data Saver is on (then wait for a tap).
  useEffect(() => {
    const el = boxRef.current;
    if (!el || active || canRender === false) return;
    // navigator.connection is not in the TS DOM lib everywhere, so read it defensively.
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    if (conn?.saveData) return;
    if (typeof IntersectionObserver === 'undefined') return; // no observer: tap button still works
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActive(true);
          io.disconnect();
        }
      },
      { rootMargin: '200px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [active, canRender]);

  return (
    <div ref={boxRef}>
      {/* Keyboard users can skip past the map (it has many tab stops once loaded). */}
      <a
        href={`#${afterId}`}
        className="sr-only focus:not-sr-only focus:inline-block focus:mb-2 focus:p-2 focus:bg-black focus:text-primary focus:underline text-xs font-mono"
      >
        Skip the map
      </a>

      {active && canRender !== false ? (
        // Once loaded, MapCanvas owns the box (controls + fixed-height map + details panel).
        // The boundary swaps in the static preview if the map throws for any reason.
        <MapErrorBoundary
          fallback={
            <div className="relative w-full overflow-hidden border border-primary/30 bg-black" style={{ height }}>
              <ZonePreviewSvg preview={preview} label={`Static preview. ${ariaLabel}`} />
              <p className="absolute inset-x-0 bottom-0 bg-black/90 p-3 text-center font-mono text-[10px] text-white/70">
                The interactive map could not start in this browser. The full list of zones is in the tables below.
              </p>
            </div>
          }
        >
          <MapCanvas {...props} />
        </MapErrorBoundary>
      ) : (
        // Placeholder: fixed height, same as the map, so nothing shifts when the map arrives.
        <div className="relative w-full overflow-hidden border border-primary/30 bg-black" style={{ height }}>
          <ZonePreviewSvg preview={preview} label={`Static preview. ${ariaLabel}`} />
          <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-1 bg-gradient-to-t from-black/90 to-transparent p-3">
            {canRender === false ? (
              <span className="text-center font-mono text-[10px] text-white/70">
                Interactive map needs WebGL2, which this browser does not provide. See the zone tables below.
              </span>
            ) : (
            <button
              type="button"
              onClick={() => setActive(true)}
              className="min-h-11 border border-primary bg-black px-4 text-[11px] font-black uppercase tracking-widest text-primary hover:bg-primary/10 focus-visible:outline-2 focus-visible:outline-primary"
            >
              Load interactive map
            </button>
            )}
            <span className="text-center font-mono text-[10px] text-white/60">Static preview. The map loads when you scroll to it or tap.</span>
          </div>
        </div>
      )}
      <span id={afterId} tabIndex={-1} />
    </div>
  );
}
