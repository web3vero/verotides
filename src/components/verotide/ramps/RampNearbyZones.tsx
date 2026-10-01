// RampNearbyZones.tsx (server component)
// ---------------------------------------------------------------------------------------------
// Lists FWC-mapped manatee zones within ~1.5 miles of a ramp, linking to the zones page anchors.
// This says the zone is NEAR the ramp. It never says a zone is on anyone's route or applies to them.
// ---------------------------------------------------------------------------------------------

import Link from 'next/link';
import type { NearbyZone } from '@/lib/verotide/ramps';
import { NEARBY_ZONE_MILES } from '@/lib/verotide/ramps';
import { ZONES_NOTE } from '@/lib/verotide/ramps-copy';

export default function RampNearbyZones({ nearby, limit = 8 }: { nearby: NearbyZone[]; limit?: number }) {
  const shown = nearby.slice(0, limit);
  return (
    <section aria-labelledby="nearby-zones-h" className="terminal-box border border-primary/20 bg-black/60 rounded-xl p-4 font-mono mb-6">
      <h2 id="nearby-zones-h" className="text-xs font-black text-primary uppercase tracking-widest mb-3">
        &gt; Nearby manatee zones (within about {NEARBY_ZONE_MILES} miles)
      </h2>
      {shown.length === 0 ? (
        <p className="text-sm text-white/70">No FWC-mapped manatee zone was found within {NEARBY_ZONE_MILES} miles of this location.</p>
      ) : (
        <ul className="space-y-2 mb-3">
          {shown.map(({ zone, miles, typeLabel, href }) => (
            <li key={zone.id} className="text-sm text-white/80">
              <Link href={href} className="underline text-primary">
                {zone.name}
              </Link>
              <span className="text-white/60">
                {' '}
                - {typeLabel}, {miles === 0 ? 'location is inside the mapped area' : `about ${miles.toFixed(1)} mi away`}
              </span>
            </li>
          ))}
        </ul>
      )}
      {nearby.length > shown.length && (
        <p className="text-[11px] text-white/50 mb-2">
          {nearby.length - shown.length} more mapped {nearby.length - shown.length === 1 ? 'zone is' : 'zones are'} within range; see the{' '}
          <Link href="/manatee-zones" className="underline">manatee zones page</Link>.
        </p>
      )}
      <p className="text-[11px] text-white/60 leading-relaxed">{ZONES_NOTE}</p>
    </section>
  );
}
