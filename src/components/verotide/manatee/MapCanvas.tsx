'use client';

// MapCanvas.tsx
// ---------------------------------------------------------------------------
// The real MapLibre GL map. This file (and the ~200 KB maplibre-gl library + CSS it imports)
// is only ever loaded through next/dynamic from LazyMap.tsx, AFTER the visitor scrolls near
// the map or taps "Load interactive map". Nothing here runs on the server.
//
// Base map: OpenFreeMap "liberty" vector style (free, no key). If that style fails to load we
// swap to a plain dark background so the zone shapes still work.
// Optional overlay: NOAA nautical chart (WMS raster), OFF by default, behind a toggle.

import 'maplibre-gl/dist/maplibre-gl.css';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  AttributionControl,
  Map as MapLibreMap,
  NavigationControl,
  type GeoJSONSourceSpecification,
  type StyleSpecification,
} from 'maplibre-gl';
import type { LazyMapProps } from '../maps/map-types';
import type { ZoneType } from '@/lib/verotide/geo-types';
import { MAP_SECTION } from '@/lib/verotide/manatee-copy';
import { TYPE_MEANING } from '@/lib/verotide/manatee-copy';
import { ZONE_TYPE_META, seasonText, zoneAnchor, zoneNotes, type PatternKind } from './zone-display';

// Verified 2026-09-30: returns 200 and a vector style whose tiles come from tiles.openfreemap.org/planet.
const STYLE_URL = 'https://tiles.openfreemap.org/styles/liberty';

// Verified 2026-09-30: GetMap in EPSG:3857 returns a chart PNG. Layers 0-12 are NOAA's scale bands.
const NOAA_WMS =
  'https://gis.charttools.noaa.gov/arcgis/rest/services/MCS/NOAAChartDisplay/MapServer/exts/MaritimeChartService/WMSServer';
const NOAA_TILES =
  `${NOAA_WMS}?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&FORMAT=image/png&TRANSPARENT=true` +
  `&LAYERS=0,1,2,3,4,5,6,7,8,9,10,11,12&STYLES=&CRS=EPSG:3857&WIDTH=256&HEIGHT=256&BBOX={bbox-epsg-3857}`;

// Used if the OpenFreeMap style cannot load: a flat dark background, no network needed.
const BLANK_STYLE: StyleSpecification = {
  version: 8,
  sources: {},
  layers: [{ id: 'bg', type: 'background', paint: { 'background-color': '#0b1a2b' } }],
};

const DEFAULT_FOCUS = { lat: 27.65, lon: -80.4, zoom: 9.5 };

// Which fill-pattern image each zone type uses (names registered in addPatterns()).
const patternName = (t: string) => `pat-${t}`;

/** Draw one 16x16 pattern tile on a canvas and return its pixels (drawn at 2x pixel ratio = 8 css px). */
function makePattern(kind: PatternKind, color: string): ImageData {
  const size = 16;
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  const g = c.getContext('2d')!;
  g.strokeStyle = color;
  g.fillStyle = color;
  g.lineWidth = 3;
  // Background tint first (alpha), then the pattern strokes on top.
  g.globalAlpha = kind === 'solid' ? 0.55 : 0.2;
  g.fillRect(0, 0, size, size);
  g.globalAlpha = 1;
  g.beginPath();
  if (kind === 'diag' || kind === 'cross') {
    g.moveTo(-2, size + 2); g.lineTo(size + 2, -2);
  }
  if (kind === 'cross') {
    g.moveTo(-2, -2); g.lineTo(size + 2, size + 2);
  }
  if (kind === 'hlines') { g.moveTo(0, size / 2); g.lineTo(size, size / 2); }
  if (kind === 'vlines') { g.moveTo(size / 2, 0); g.lineTo(size / 2, size); }
  g.stroke();
  if (kind === 'dots') {
    g.beginPath();
    g.arc(size / 2, size / 2, 3, 0, Math.PI * 2);
    g.fill();
  }
  return g.getImageData(0, 0, size, size);
}

type Selected = { kind: 'zone' | 'ramp'; id: string } | null;

export default function MapCanvas({
  zones,
  ramps,
  focus,
  height = 420,
  showChartToggle,
  onSelect,
  ariaLabel,
}: LazyMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  // Keep the latest onSelect in a ref so changing it never rebuilds the whole map.
  const onSelectRef = useRef(onSelect);
  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  const [mapReady, setMapReady] = useState(false);
  const [basemapFailed, setBasemapFailed] = useState(false);
  const [chartOn, setChartOn] = useState(false);
  const [selected, setSelected] = useState<Selected>(null);

  const f = focus ?? DEFAULT_FOCUS;

  // Select a feature: update the panel, notify the page, and highlight the outline.
  const select = useCallback((kind: 'zone' | 'ramp', id: string) => {
    setSelected({ kind, id });
    onSelectRef.current?.(kind, id);
  }, []);

  // ---- Create the map once (and rebuild only if the data/focus props change) ------------------
  useEffect(() => {
    if (!containerRef.current) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const map = new MapLibreMap({
      container: containerRef.current,
      style: STYLE_URL,
      center: [f.lon, f.lat],
      zoom: f.zoom,
      attributionControl: false, // added below so we control placement
      cooperativeGestures: true, // two-finger pan on phones so the map does not trap page scroll
      // Keyboard handler is on by default: Tab to the map, then arrow keys pan and +/- zoom.
    });
    mapRef.current = map;
    map.addControl(new NavigationControl({ showCompass: false }), 'top-right');
    map.addControl(new AttributionControl({ compact: true }), 'bottom-right');

    // Build GeoJSON for the zone and ramp layers from the props.
    const zoneData: GeoJSONSourceSpecification['data'] = {
      type: 'FeatureCollection',
      features: (zones ?? []).map((z) => ({
        type: 'Feature' as const,
        properties: { id: z.id, name: z.name, zoneType: z.zoneType, county: z.county },
        geometry: z.geometry,
      })),
    };
    const rampData: GeoJSONSourceSpecification['data'] = {
      type: 'FeatureCollection',
      features: (ramps ?? []).map((r) => ({
        type: 'Feature' as const,
        properties: { id: r.id, name: r.name },
        geometry: { type: 'Point' as const, coordinates: [r.lon, r.lat] },
      })),
    };

    let styleLoaded = false;
    let usedFallback = false;

    // (Re)build every custom layer. Runs on each 'style.load' because setStyle() wipes layers/images.
    const addLayers = () => {
      styleLoaded = true;
      if (map.getSource('zones')) return; // already added for this style

      // Pattern images for fill-pattern (one per zone type).
      (Object.keys(ZONE_TYPE_META) as ZoneType[]).forEach((t) => {
        if (!map.hasImage(patternName(t))) {
          map.addImage(patternName(t), makePattern(ZONE_TYPE_META[t].pattern, ZONE_TYPE_META[t].color), { pixelRatio: 2 });
        }
      });

      // NOAA chart overlay: added hidden. A hidden raster layer requests no tiles.
      map.addSource('noaa-chart', {
        type: 'raster',
        tiles: [NOAA_TILES],
        tileSize: 256,
        attribution: 'NOAA Office of Coast Survey (not for navigation)',
      });
      map.addLayer({ id: 'noaa-chart', type: 'raster', source: 'noaa-chart', layout: { visibility: 'none' }, paint: { 'raster-opacity': 0.85 } });

      if ((zones ?? []).length) {
        map.addSource('zones', { type: 'geojson', data: zoneData });
        // Fill: pattern chosen by zoneType (data-driven match expression).
        const patternMatch: unknown[] = ['match', ['get', 'zoneType']];
        (Object.keys(ZONE_TYPE_META) as ZoneType[]).forEach((t) => patternMatch.push(t, patternName(t)));
        patternMatch.push(patternName('unknown'));
        map.addLayer({
          id: 'zones-fill',
          type: 'fill',
          source: 'zones',
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          paint: { 'fill-pattern': patternMatch as any, 'fill-opacity': 0.9 },
        });
        // Outlines: one layer per dash style because line-dasharray cannot be data-driven.
        (Object.keys(ZONE_TYPE_META) as ZoneType[]).forEach((t) => {
          const m = ZONE_TYPE_META[t];
          map.addLayer({
            id: `zones-line-${t}`,
            type: 'line',
            source: 'zones',
            filter: ['==', ['get', 'zoneType'], t],
            paint: {
              'line-color': m.color,
              'line-width': t === 'no-entry' || t === 'motorboats-prohibited' ? 2.5 : 1.8,
              ...(m.dash.length ? { 'line-dasharray': m.dash } : {}),
            },
          });
        });
        // Selected zone: thick black halo + white line so it stands out on any pattern.
        map.addLayer({ id: 'zones-selected-halo', type: 'line', source: 'zones', filter: ['==', ['get', 'id'], ''], paint: { 'line-color': '#000', 'line-width': 6 } });
        map.addLayer({ id: 'zones-selected', type: 'line', source: 'zones', filter: ['==', ['get', 'id'], ''], paint: { 'line-color': '#fff', 'line-width': 3 } });
      }

      if ((ramps ?? []).length) {
        map.addSource('ramps', { type: 'geojson', data: rampData });
        map.addLayer({
          id: 'ramps',
          type: 'circle',
          source: 'ramps',
          paint: { 'circle-radius': 6, 'circle-color': '#00ff41', 'circle-stroke-color': '#000', 'circle-stroke-width': 2 },
        });
      }
      setMapReady(true);
    };
    map.on('style.load', addLayers);

    // If the base style fails before it ever loads, fall back to a blank background once.
    map.on('error', () => {
      if (!styleLoaded && !usedFallback) {
        usedFallback = true;
        setBasemapFailed(true);
        map.setStyle(BLANK_STYLE);
      }
    });

    // Click handlers. Features overlap (seasonal / nested zones): take the first hit.
    map.on('click', 'zones-fill', (e) => {
      const id = e.features?.[0]?.properties?.id;
      if (id) select('zone', String(id));
    });
    map.on('click', 'ramps', (e) => {
      const id = e.features?.[0]?.properties?.id;
      if (id) select('ramp', String(id));
    });
    ['zones-fill', 'ramps'].forEach((layer) => {
      map.on('mouseenter', layer, () => (map.getCanvas().style.cursor = 'pointer'));
      map.on('mouseleave', layer, () => (map.getCanvas().style.cursor = ''));
    });
    // Remember motion preference for later flyTo calls.
    map.getContainer().dataset.reduceMotion = reduceMotion ? '1' : '0';

    return () => {
      // Free the WebGL context and listeners when the component unmounts.
      map.remove();
      mapRef.current = null;
      setMapReady(false);
    };
  }, [zones, ramps, f.lat, f.lon, f.zoom, select]);

  // ---- Chart overlay toggle ---------------------------------------------------------------
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady || !map.getLayer('noaa-chart')) return;
    // Put the chart under the zones so zones stay readable.
    if (map.getLayer('zones-fill')) map.moveLayer('noaa-chart', 'zones-fill');
    map.setLayoutProperty('noaa-chart', 'visibility', chartOn ? 'visible' : 'none');
  }, [chartOn, mapReady]);

  // ---- Highlight the selected zone's outline ------------------------------------------------
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady || !map.getLayer('zones-selected')) return;
    const id = selected?.kind === 'zone' ? selected.id : '';
    map.setFilter('zones-selected', ['==', ['get', 'id'], id]);
    map.setFilter('zones-selected-halo', ['==', ['get', 'id'], id]);
  }, [selected, mapReady]);

  // Keyboard path to a zone: pick it in the list and the map flies there.
  const pickFromList = (id: string) => {
    const z = (zones ?? []).find((x) => x.id === id);
    if (!z) return;
    select('zone', id);
    const map = mapRef.current;
    if (!map) return;
    const reduce = map.getContainer().dataset.reduceMotion === '1';
    const opts = { center: z.centroid as [number, number], zoom: Math.max(map.getZoom(), 12.5) };
    if (reduce) map.jumpTo(opts);
    else map.flyTo({ ...opts, duration: 900 });
  };

  const resetView = () => {
    const map = mapRef.current;
    if (!map) return;
    const reduce = map.getContainer().dataset.reduceMotion === '1';
    const opts = { center: [f.lon, f.lat] as [number, number], zoom: f.zoom };
    if (reduce) map.jumpTo(opts);
    else map.flyTo({ ...opts, duration: 700 });
  };

  const selZone = selected?.kind === 'zone' ? (zones ?? []).find((z) => z.id === selected.id) : undefined;
  const selRamp = selected?.kind === 'ramp' ? (ramps ?? []).find((r) => r.id === selected.id) : undefined;

  const btn = 'min-h-11 px-3 text-[11px] font-black uppercase tracking-widest border border-primary/40 text-primary bg-black/70 hover:bg-primary/10 focus-visible:outline-2 focus-visible:outline-primary';

  return (
    <div>
      {/* Controls row: all real buttons/selects, so keyboard and screen-reader users can use them. */}
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <button type="button" className={btn} onClick={resetView}>Reset view</button>
        {showChartToggle && (
          <button type="button" className={btn} aria-pressed={chartOn} onClick={() => setChartOn((v) => !v)}>
            NOAA chart overlay: {chartOn ? 'on' : 'off'}
          </button>
        )}
        {(zones ?? []).length > 0 && (
          <label className="flex items-center gap-2 text-[11px] font-mono text-white/70 min-w-0 w-full sm:w-auto">
            <span className="shrink-0">Go to zone</span>
            <select
              className="min-h-11 min-w-0 max-w-full flex-1 bg-black border border-primary/40 text-white/90 text-[11px] px-2"
              value={selZone?.id ?? ''}
              onChange={(e) => e.target.value && pickFromList(e.target.value)}
            >
              <option value="">Choose a zone...</option>
              {(zones ?? []).map((z) => (
                <option key={z.id} value={z.id}>
                  {z.name} ({z.county}, {ZONE_TYPE_META[z.zoneType].label})
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      {/* The map itself: fixed height, so there is no layout shift while it loads. */}
      <div
        ref={containerRef}
        role="region"
        aria-label={ariaLabel}
        style={{ height }}
        className="w-full border border-primary/30 bg-black"
      />

      {basemapFailed && (
        <p className="mt-2 text-[11px] font-mono text-yellow-300">
          The base map could not load, so zones are shown on a plain background. The tables below still list every zone.
        </p>
      )}
      {chartOn && <p className="mt-2 text-[11px] font-mono text-white/60">{MAP_SECTION.chartCredit}</p>}

      {/* Details for the selected zone or ramp. aria-live so a screen reader hears the change. */}
      <div aria-live="polite" className="mt-3">
        {selZone && (
          <div className="border border-primary/30 bg-black/70 p-3 font-mono text-xs text-white/80">
            <p className="font-black text-white text-sm">{selZone.name}</p>
            <p className="mt-1">
              {ZONE_TYPE_META[selZone.zoneType].label} · {selZone.county} County
              {selZone.ruleCitation ? ` · ${selZone.ruleCitation.split(' ')[0]} F.A.C.` : ''}
            </p>
            <p className="mt-1 text-white/60">{TYPE_MEANING[selZone.zoneType]}</p>
            <p className="mt-1">Season: {seasonText(selZone)}</p>
            {zoneNotes(selZone).map((n) => (
              <p key={n} className="mt-1 text-yellow-200/90">{n}</p>
            ))}
            <p className="mt-2">
              <a className="underline text-primary" href={`#${zoneAnchor(selZone.id)}`}>Jump to this zone in the table</a>
            </p>
          </div>
        )}
        {selRamp && (
          <div className="border border-primary/30 bg-black/70 p-3 font-mono text-xs text-white/80">
            <p className="font-black text-white text-sm">{selRamp.name}</p>
            <p className="mt-1">{selRamp.waterbody ?? selRamp.county}</p>
            <p className="mt-2">
              <a className="underline text-primary" href={`#ramp-${selRamp.id}`}>Jump to this ramp in the list</a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
