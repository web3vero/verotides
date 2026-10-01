// ZoneGraphics.tsx
// ---------------------------------------------------------------------------
// SVG building blocks shared by the legend (server) and the static map preview (rendered in
// the LazyMap client component, which is still server-rendered into the first HTML).
// No hooks and no 'use client', so it works in both places.

import type { ZoneType } from '@/lib/verotide/geo-types';
import { ZONE_TYPE_META, type PatternKind } from './zone-display';
import type { PreviewData } from './preview';

/** Inner SVG shapes of one 8x8 pattern tile. */
function PatternTile({ kind, color }: { kind: PatternKind; color: string }) {
  switch (kind) {
    case 'solid':
      return <rect width="8" height="8" fill={color} fillOpacity="0.55" />;
    case 'cross':
      return (
        <>
          <rect width="8" height="8" fill={color} fillOpacity="0.2" />
          <path d="M-1 9L9 -1M-1 -1L9 9" stroke={color} strokeWidth="1.2" />
        </>
      );
    case 'diag':
      return (
        <>
          <rect width="8" height="8" fill={color} fillOpacity="0.2" />
          <path d="M-1 9L9 -1" stroke={color} strokeWidth="1.6" />
        </>
      );
    case 'dots':
      return (
        <>
          <rect width="8" height="8" fill={color} fillOpacity="0.18" />
          <circle cx="4" cy="4" r="1.6" fill={color} />
        </>
      );
    case 'hlines':
      return (
        <>
          <rect width="8" height="8" fill={color} fillOpacity="0.2" />
          <path d="M0 4H8" stroke={color} strokeWidth="1.6" />
        </>
      );
    case 'vlines':
      return (
        <>
          <rect width="8" height="8" fill={color} fillOpacity="0.2" />
          <path d="M4 0V8" stroke={color} strokeWidth="1.6" />
        </>
      );
  }
}

/** <defs> with one pattern per zone type. `prefix` keeps ids unique when several SVGs share a page. */
export function ZonePatternDefs({ prefix }: { prefix: string }) {
  return (
    <defs>
      {(Object.keys(ZONE_TYPE_META) as ZoneType[]).map((t) => (
        <pattern key={t} id={`${prefix}-${t}`} width="8" height="8" patternUnits="userSpaceOnUse">
          <PatternTile kind={ZONE_TYPE_META[t].pattern} color={ZONE_TYPE_META[t].color} />
        </pattern>
      ))}
    </defs>
  );
}

/** Small swatch (pattern + outline) for the legend and table type column. Decorative: text sits beside it. */
export function ZoneSwatch({ type, prefix = 'sw' }: { type: ZoneType; prefix?: string }) {
  const m = ZONE_TYPE_META[type];
  return (
    <svg width="28" height="18" viewBox="0 0 28 18" aria-hidden="true" focusable="false" className="shrink-0">
      <ZonePatternDefs prefix={`${prefix}-${type}`} />
      <rect
        x="1"
        y="1"
        width="26"
        height="16"
        rx="2"
        fill={`url(#${prefix}-${type}-${type})`}
        stroke={m.color}
        strokeWidth="2"
        strokeDasharray={m.dash.length ? m.dash.map((d) => d * 2).join(' ') : undefined}
      />
    </svg>
  );
}

/** Static picture of the zones (and optional ramp dots) from precomputed preview paths. */
export function ZonePreviewSvg({ preview, label }: { preview: PreviewData; label: string }) {
  return (
    <svg
      viewBox={`0 0 ${preview.width} ${preview.height}`}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={label}
      className="h-full w-full"
    >
      <rect width={preview.width} height={preview.height} fill="#0b1a2b" />
      <ZonePatternDefs prefix="pv" />
      {/* Draw milder zones first so strict ones (no entry) end up on top. */}
      {[...preview.paths]
        .sort((a, b) => ZONE_TYPE_META[b.zoneType].order - ZONE_TYPE_META[a.zoneType].order)
        .map((p) => {
          const m = ZONE_TYPE_META[p.zoneType];
          return (
            <path
              key={p.id}
              d={p.d}
              fill={`url(#pv-${p.zoneType})`}
              stroke={m.color}
              strokeWidth="1.2"
              strokeDasharray={m.dash.length ? m.dash.map((d) => d * 1.5).join(' ') : undefined}
              fillRule="evenodd"
            />
          );
        })}
      {preview.ramps.map((r) => (
        <circle key={r.id} cx={r.x} cy={r.y} r="3" fill="#00ff41" stroke="#000" strokeWidth="1" />
      ))}
    </svg>
  );
}

