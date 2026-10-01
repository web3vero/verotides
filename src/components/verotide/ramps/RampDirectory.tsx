// RampDirectory.tsx (server component)
// ---------------------------------------------------------------------------------------------
// Static, filter-free listing of every ramp grouped by county then waterbody. Rendered as plain
// HTML so search engines (and no-JS visitors) can read all of it. Each card has the anchor
// `ramp-<slug>`; ramps that earned a standalone page also link to it.
// ---------------------------------------------------------------------------------------------

import Link from 'next/link';
import type { RampGroup } from '@/lib/verotide/ramps';
import { isIndexable, rampAnchorId, rampSlug, nearbyZones } from '@/lib/verotide/ramps';
import { shortName } from '@/lib/verotide/ramps-copy';
import RampFacts from './RampFacts';

export default function RampDirectory({ groups }: { groups: RampGroup[] }) {
  return (
    <div className="space-y-10">
      {groups.map((g) => {
        const countyId = `county-${g.county.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
        return (
          <section key={g.county} aria-labelledby={countyId}>
            <h2 id={countyId} className="text-sm font-black text-primary uppercase tracking-widest mb-4 scroll-mt-4">
              &gt; {g.county} County ramps
            </h2>
            {g.waterbodies.map((w) => (
              <div key={w.waterbody} className="mb-6">
                <h3 className="text-xs font-bold text-white/70 uppercase tracking-widest mb-3">{w.waterbody}</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  {w.ramps.map((r) => {
                    const own = isIndexable(r);
                    const zones = nearbyZones(r).length;
                    return (
                      // tabIndex -1 lets the map island move focus here after a marker click.
                      <article
                        key={r.id}
                        id={rampAnchorId(r)}
                        tabIndex={-1}
                        className="terminal-box border border-primary/20 bg-black/60 rounded-xl p-4 scroll-mt-4 focus:outline focus:outline-2 focus:outline-primary"
                      >
                        <h4 className="text-sm font-black text-white mb-1 break-words">
                          {own ? (
                            <Link href={`/boat-ramps/${rampSlug(r)}`} className="underline text-primary">
                              {shortName(r.name)}
                            </Link>
                          ) : (
                            shortName(r.name)
                          )}
                        </h4>
                        <p className="text-[11px] font-mono text-white/50 mb-2">
                          {r.city ? `${r.city}, ` : ''}
                          {r.county} County
                          {r.operator ? ` | ${r.operator}` : ''}
                        </p>
                        <RampFacts ramp={r} compact />
                        <p className="mt-2 text-[11px] font-mono text-white/60">
                          {zones > 0 ? (
                            <>
                              {zones} FWC-mapped manatee {zones === 1 ? 'zone' : 'zones'} within 1.5 miles.{' '}
                              <Link href="/manatee-zones" className="underline">Zones map</Link>
                              {own && (
                                <>
                                  {' | '}
                                  <Link href={`/boat-ramps/${rampSlug(r)}`} className="underline">Full details</Link>
                                </>
                              )}
                            </>
                          ) : (
                            'No FWC-mapped manatee zone within 1.5 miles.'
                          )}
                        </p>
                      </article>
                    );
                  })}
                </div>
              </div>
            ))}
          </section>
        );
      })}
    </div>
  );
}
