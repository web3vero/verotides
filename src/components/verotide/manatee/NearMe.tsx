'use client';

// NearMe.tsx
// ---------------------------------------------------------------------------
// "Zones near me": a button that asks the browser for the visitor's position and lists the
// nearest mapped zones.
//
// PRIVACY: geolocation is requested ONLY after the visitor taps the button. The position is used
// in this function and shown on screen; it is never sent anywhere, stored, or logged. The zone
// polygons are loaded on tap as a separate JS chunk (dynamic import of the same JSON the server
// uses), which is a plain static file fetch that carries no location.
//
// WORDING: results say "inside the mapped area" and give estimated distances to simplified
// shapes. They never claim a legal position or a speed limit for the visitor's spot.

import { useState } from 'react';
import { NEAR_ME } from '@/lib/verotide/manatee-copy';
import { asManateeZonesFile } from '@/lib/verotide/geo-types';
import { nearestZones, type NearZone } from './geo';
import { ZONE_TYPE_META, zoneAnchor } from './zone-display';

type State =
  | { phase: 'idle' }
  | { phase: 'working' }
  | { phase: 'error'; message: string }
  | { phase: 'done'; results: NearZone[] };

export default function NearMe() {
  const [state, setState] = useState<State>({ phase: 'idle' });

  const run = () => {
    if (!('geolocation' in navigator)) {
      setState({ phase: 'error', message: NEAR_ME.unsupported });
      return;
    }
    setState({ phase: 'working' });
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          // Loaded now (not at page load) so visitors who never tap never download it.
          const raw = (await import('@/data/manatee-zones.json')).default;
          const { zones } = asManateeZonesFile(raw);
          const results = nearestZones(zones, pos.coords.longitude, pos.coords.latitude, 5);
          // Nothing within 25 miles: the visitor is outside the area this map covers.
          const near = results.filter((r) => r.miles <= 25);
          setState({ phase: 'done', results: near });
        } catch {
          setState({ phase: 'error', message: NEAR_ME.failed });
        }
      },
      (err) => setState({ phase: 'error', message: err.code === err.PERMISSION_DENIED ? NEAR_ME.denied : NEAR_ME.failed }),
      // Cached positions up to 1 minute are fine; give a phone GPS up to 15 s.
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 60000 }
    );
  };

  return (
    <div>
      <button
        type="button"
        onClick={run}
        disabled={state.phase === 'working'}
        className="min-h-11 border border-primary bg-black px-4 text-[11px] font-black uppercase tracking-widest text-primary hover:bg-primary/10 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-primary"
      >
        {state.phase === 'working' ? NEAR_ME.working : NEAR_ME.button}
      </button>

      <div aria-live="polite" className="mt-3 font-mono text-xs text-white/80">
        {state.phase === 'error' && <p className="text-yellow-300">{state.message}</p>}
        {state.phase === 'done' && state.results.length === 0 && <p>{NEAR_ME.none}</p>}
        {state.phase === 'done' && state.results.length > 0 && (
          <>
            <ol className="space-y-2">
              {state.results.map(({ zone, miles, inside }) => (
                <li key={zone.id} className="border border-primary/20 bg-black/60 p-2">
                  <a href={`#${zoneAnchor(zone.id)}`} className="underline text-primary">{zone.name}</a>
                  <span className="block text-white/70">
                    {ZONE_TYPE_META[zone.zoneType].label} · {zone.county} County ·{' '}
                    {inside ? 'inside the mapped area (approximate)' : `about ${miles < 0.1 ? 'under 0.1' : miles.toFixed(1)} mi away`}
                  </span>
                </li>
              ))}
            </ol>
            <p className="mt-2 text-[11px] text-white/60">{NEAR_ME.caution}</p>
          </>
        )}
      </div>
    </div>
  );
}
