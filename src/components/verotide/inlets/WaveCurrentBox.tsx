import type { InletSnapshot } from '@/lib/verotide/lagoon-types';
import { INLETS_PAGE } from '@/lib/verotide/lagoon-copy';
import { oneDecimal } from './format';

// The wave-current interaction box. It reports ONE published-physics fact and nothing else:
// "is an opposing current, at its predicted speed, strong enough to steepen or block waves of
// the observed period?" It is deliberately NOT a rating. There is no colour scale, no score,
// and no advice; the wording stays neutral on purpose.

export default function WaveCurrentBox({ snapshot }: { snapshot: InletSnapshot }) {
  const wci = snapshot.waveCurrentInteraction;
  const { current, waves } = snapshot;
  const note = INLETS_PAGE.waveCurrentNote;

  // Build the one-line result. Three cases: no data, flagged, or not flagged.
  let result: string;
  if (!wci) {
    result = 'Unavailable. This needs a current prediction and a buoy wave direction, and one of them is missing right now.';
  } else if (wci.flagged) {
    result =
      'Yes. At the predicted speed, the opposing current is strong enough to steepen or block waves of this period.';
  } else {
    result = 'Not at this time.';
  }

  return (
    <section aria-labelledby="wci-h" className="terminal-box p-4 font-mono text-sm text-white/80 space-y-4">
      <h2 id="wci-h" className="text-xs font-black text-primary uppercase tracking-widest">
        &gt; {note.heading}
      </h2>

      {/* The single physics flag. Rendered as text so it reads the same without colour. */}
      <div className="border border-white/20 p-3">
        <p className="text-[11px] uppercase tracking-widest text-white/50">
          Is the opposing current strong enough to steepen or block waves of this period?
        </p>
        <p className="mt-1 text-base font-bold text-white">{result}</p>

        {wci && (
          <dl className="mt-3 space-y-1 text-xs">
            <div className="flex justify-between gap-3">
              <dt className="text-white/60">Waves arriving from the ebb side</dt>
              <dd className="font-bold text-white">{wci.opposing ? 'Yes' : 'No'}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-white/60">Wave period</dt>
              <dd className="font-bold text-white">
                {waves?.dominantPeriodS != null ? `${Math.round(waves.dominantPeriodS)} s` : 'unavailable'}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-white/60">Opposing current needed to block these waves</dt>
              <dd className="font-bold text-white">
                {wci.blockingCurrentKt !== null ? `about ${oneDecimal(wci.blockingCurrentKt)} kt` : 'unavailable'}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-white/60">Predicted current now</dt>
              <dd className="font-bold text-white">
                {current ? `${oneDecimal(current.speedKt)} kt, ${current.phase}` : 'unavailable'}
              </dd>
            </div>
          </dl>
        )}
        {wci && current && current.phase !== 'ebb' && (
          <p className="mt-2 text-xs text-white/60">
            Only an outgoing (ebb) current opposes waves from this side, so on flood or slack the comparison counts the current as zero.
          </p>
        )}
      </div>

      {/* Plain-language physics, from the shared copy file. */}
      {note.paragraphs.map((p) => (
        <p key={p} className="leading-relaxed">{p}</p>
      ))}

      <div>
        <h3 className="text-xs font-black text-white uppercase tracking-widest">{note.thresholdsHeading}</h3>
        <div className="mt-2 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <caption className="sr-only">{note.thresholdsHeading}</caption>
            <thead>
              <tr className="border-b border-white/30 text-white/60">
                <th scope="col" className="py-1 pr-4 font-normal">Wave period</th>
                <th scope="col" className="py-1 font-normal">Opposing current</th>
              </tr>
            </thead>
            <tbody>
              {note.thresholds.map((t) => (
                <tr key={t.periodSeconds} className="border-b border-white/10">
                  <td className="py-1 pr-4">{t.periodSeconds} s</td>
                  <td className="py-1">about {oneDecimal(t.opposingCurrentKnots)} kt</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="leading-relaxed">{note.plainEnglish}</p>
      <p className="text-xs text-white/60 leading-relaxed">{note.caveat}</p>
    </section>
  );
}
