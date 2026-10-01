// RampLagoonBlock.tsx (server component)
// ---------------------------------------------------------------------------------------------
// Shows the Wabasso lagoon reading as LAGOON-WIDE CONTEXT on the ramp pages.
//
// Honesty rules (do not loosen):
//   - It is labelled as lagoon-wide context from the Wabasso gauge, never as a ramp measurement.
//   - Nothing here says anything about depth at a ramp, launch suitability, safety or usability.
//   - If the observed reading is missing or stale, the numbers are HIDDEN and we say "unavailable".
//   - The page calls getLagoonSnapshot() ONCE and passes the result in, so this block never fetches.
//   - No forecast curve here; that stays on /lagoon.
// ---------------------------------------------------------------------------------------------

import Link from 'next/link';
import type { LagoonSnapshot } from '@/lib/verotide/lagoon-types';
import { LAGOON_CONTEXT } from '@/lib/verotide/ramps-copy';
import { fmtFt, fmtStamp, fmtTime, fmtDay } from '@/components/verotide/lagoon/format';

export default function RampLagoonBlock({ snapshot }: { snapshot: LagoonSnapshot }) {
  const obs = snapshot.observed;
  // Only show numbers when we have a fresh observation.
  const fresh = !!obs && !!obs.latest && !obs.stale;

  // Compare against the snapshot's own clock (not Date.now) so the render stays pure and consistent.
  const nowMs = new Date(snapshot.generatedAt).getTime();
  const upcoming = snapshot.extremes.filter((e) => new Date(e.t).getTime() > nowMs);
  const nextHigh = upcoming.find((e) => e.type === 'H');
  const nextLow = upcoming.find((e) => e.type === 'L');

  return (
    <section
      aria-labelledby="lagoon-context-h"
      className="terminal-box border border-primary/20 bg-black/60 rounded-xl p-4 font-mono mb-6"
    >
      <h2 id="lagoon-context-h" className="text-xs font-black text-primary uppercase tracking-widest mb-1">
        &gt; {LAGOON_CONTEXT.heading}
      </h2>
      <p className="text-[10px] font-black uppercase tracking-widest text-amber-300 mb-3">{LAGOON_CONTEXT.label}</p>

      {fresh && obs?.latest ? (
        <dl className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm mb-3">
          <div>
            <dt className="text-[10px] uppercase tracking-widest text-white/50">Wabasso lagoon level</dt>
            <dd className="text-white font-bold">{fmtFt(obs.latest.ft)} NAVD88</dd>
            <dd className="text-[11px] text-white/50">As of {fmtStamp(obs.latest.t)} (USGS, provisional)</dd>
          </div>
          <div>
            <dt className="text-[10px] uppercase tracking-widest text-white/50">Next lagoon high (est.)</dt>
            <dd className="text-white font-bold">
              {nextHigh ? `${fmtDay(nextHigh.t)}, ${fmtTime(nextHigh.t)} ET` : 'unavailable'}
            </dd>
          </div>
          <div>
            <dt className="text-[10px] uppercase tracking-widest text-white/50">Next lagoon low (est.)</dt>
            <dd className="text-white font-bold">
              {nextLow ? `${fmtDay(nextLow.t)}, ${fmtTime(nextLow.t)} ET` : 'unavailable'}
            </dd>
          </div>
        </dl>
      ) : (
        // Degraded state: text only, no numbers, with a visible label (not colour alone).
        <div role="status" className="border-2 border-amber-400/70 bg-amber-950/40 rounded-lg p-3 text-xs text-amber-100 mb-3">
          <p className="font-black uppercase tracking-widest mb-1">{LAGOON_CONTEXT.unavailable}</p>
          <p>{LAGOON_CONTEXT.unavailableDetail}</p>
        </div>
      )}

      <p className="text-[11px] text-white/60 leading-relaxed mb-2">
        Lagoon highs and lows run about 3.5 hours behind the ocean tide (approximate, roughly plus or minus 30 minutes).{' '}
        {LAGOON_CONTEXT.caveat}
      </p>
      <Link href="/lagoon" className="text-[11px] underline text-primary">
        {LAGOON_CONTEXT.seeLagoon}
      </Link>
    </section>
  );
}
