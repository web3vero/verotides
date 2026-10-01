// Presentational server components for /lagoon. Each takes a slice of LagoonSnapshot (or a copy
// object from lagoon-copy.ts) and renders it in the site's "terminal card" style.
//
// RULE FOLLOWED THROUGHOUT: prose comes from lagoon-copy.ts (one reviewable place for claims);
// numbers come from the snapshot; when a number is missing we print "unavailable", never a guess.

import type { ReactNode } from 'react';
import type { LagoonSnapshot } from '@/lib/verotide/lagoon-types';
import {
  DATA_NOTES,
  GLOSSARY,
  LAGOON_PAGE,
  SOURCE_CREDITS,
  type CopySection,
} from '@/lib/verotide/lagoon-copy';
import { fmtFt, fmtSigned, fmtStamp, fmtTime } from './format';

// Shared card shell, same classes as CamConditions / cams hub so the page matches the site.
function Card({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section
      aria-labelledby={id}
      className="terminal-box border border-primary/20 bg-black/60 rounded-xl p-4 font-mono mb-6"
    >
      <h2 id={id} className="text-xs font-black text-primary uppercase tracking-widest mb-3">
        &gt; {title}
      </h2>
      {children}
    </section>
  );
}

const P = 'text-sm text-white/75 leading-relaxed mb-3';
const SMALL = 'text-[11px] text-white/50 leading-relaxed';

// ---------------------------------------------------------------------------------------
// (1) Live status headline
// ---------------------------------------------------------------------------------------

/** Builds the one-line status sentence from live data, or an honest "unavailable" line. */
export function statusHeadline(s: LagoonSnapshot): string {
  const obs = s.observed;
  if (!obs || !obs.latest) return 'Wabasso lagoon level is unavailable right now.';
  if (obs.stale) {
    return `Wabasso level is unavailable: the last USGS reading was ${fmtStamp(obs.latest.t)}, which is too old to show.`;
  }
  // The next predicted extreme tells us direction: heading to a high = rising, to a low = falling.
  const now = new Date(s.generatedAt).getTime(); // snapshot time, not Date.now(): keeps render pure
  const nextExtreme = s.extremes.find((e) => new Date(e.t).getTime() > now);
  const nextHigh = s.extremes.find((e) => e.type === 'H' && new Date(e.t).getTime() > now);
  const dir = nextExtreme ? (nextExtreme.type === 'H' ? 'rising' : 'falling') : null;
  return (
    `Wabasso is ${fmtFt(obs.latest.ft)} (NAVD88)` +
    (dir ? `, ${dir}` : '') +
    (nextHigh ? `; next lagoon high ~${fmtTime(nextHigh.t)} ET` : '') +
    '.'
  );
}

export function StatusPanel({ snapshot }: { snapshot: LagoonSnapshot }) {
  const obs = snapshot.observed;
  const degraded = snapshot.errors.length > 0 || !obs || obs.stale || !obs.latest;
  return (
    <div className="mb-6">
      {/* The live number. aria-live so screen readers hear it if the page is refreshed in place. */}
      <p className="text-lg md:text-2xl font-black text-white leading-snug" aria-live="polite">
        {statusHeadline(snapshot)}
      </p>
      <p className="mt-1 text-xs text-white/60 font-mono">
        {obs?.latest ? `As of ${fmtStamp(obs.latest.t)} (USGS reading). ` : ''}
        Page generated {fmtStamp(snapshot.generatedAt)}.
      </p>
      <p className={`mt-1 ${SMALL}`}>{LAGOON_PAGE.liveReadingCaption}</p>

      {/* Visible degraded state: text + border + icon-free label, so colour is not the only cue. */}
      {degraded && (
        <div role="status" className="mt-3 border-2 border-amber-400/70 bg-amber-950/40 rounded-lg p-3 text-xs font-mono text-amber-100">
          <p className="font-black uppercase tracking-widest mb-1">Data notice</p>
          {obs?.stale && <p>The USGS gauge reading is more than about 2 hours old, so we are not showing a level or forecast.</p>}
          {!obs && <p>The USGS Wabasso reading is unavailable.</p>}
          {snapshot.errors.length > 0 && (
            <ul className="list-disc pl-4 mt-1">
              {snapshot.errors.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------------------
// (3) Next lagoon highs and lows
// ---------------------------------------------------------------------------------------

export function ExtremesCard({ snapshot }: { snapshot: LagoonSnapshot }) {
  const now = new Date(snapshot.generatedAt).getTime(); // snapshot time, not Date.now(): keeps render pure
  const upcoming = snapshot.extremes.filter((e) => new Date(e.t).getTime() > now);
  return (
    <Card id="extremes-h" title="Next lagoon highs and lows (ET)">
      {upcoming.length === 0 ? (
        <p className={P}>Lagoon high and low times are unavailable right now (NOAA predictions could not be loaded).</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <caption className="sr-only">Predicted lagoon highs and lows at Wabasso, Eastern time</caption>
            <thead className="text-[10px] uppercase tracking-widest text-white/50">
              <tr>
                <th scope="col" className="py-1 pr-3">Type</th>
                <th scope="col" className="py-1 pr-3">Lagoon time</th>
                <th scope="col" className="py-1">Ocean tide it follows</th>
              </tr>
            </thead>
            <tbody className="text-white/90">
              {upcoming.map((e) => (
                <tr key={e.t} className="border-t border-white/10">
                  {/* Word + letter, not just a colour, tells high from low. */}
                  <th scope="row" className="py-1.5 pr-3 font-black">{e.type === 'H' ? 'High' : 'Low'}</th>
                  <td className="py-1.5 pr-3 whitespace-nowrap">{fmtStamp(e.t)}</td>
                  <td className="py-1.5 text-white/60 whitespace-nowrap">
                    {fmtTime(e.oceanT)} ET ({e.oceanFtMllw.toFixed(2)} ft MLLW)
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {/* Wording below is the copy file's own timing claim (04-validation, section 4). */}
      <p className={`mt-3 ${SMALL}`}>
        Lagoon times are NOAA&apos;s ocean tide shifted about 3.5 hours. In our backtest the timing landed within 30
        minutes about 71% of the time and within 60 minutes about 93% of the time (Wabasso only). Ocean heights are
        MLLW and are not comparable to the NAVD88 lagoon level.
      </p>
    </Card>
  );
}

// ---------------------------------------------------------------------------------------
// (4) Ocean vs NOAA prediction
// ---------------------------------------------------------------------------------------

export function AnomalyCard({ snapshot }: { snapshot: LagoonSnapshot }) {
  const a = snapshot.anomaly;
  const mean = a?.meanFt72h ?? null;
  const fall = LAGOON_PAGE.fallSeason;
  return (
    <Card id="anomaly-h" title="Ocean vs NOAA prediction">
      {!a || (mean === null && !a.latest) ? (
        <p className={P}>Ocean-versus-prediction check is unavailable right now (Trident Pier data could not be loaded).</p>
      ) : (
        <>
          <dl className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <dt className="text-[10px] uppercase tracking-widest text-white/40">72-hour average</dt>
              <dd className="text-2xl font-black text-white">{mean !== null ? fmtSigned(mean) : 'unavailable'}</dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase tracking-widest text-white/40">Latest reading</dt>
              <dd className="text-2xl font-black text-white">{a.latest && !a.stale ? fmtSigned(a.latest.anomalyFt) : 'unavailable'}</dd>
              {a.latest && !a.stale && <dd className={SMALL}>at {fmtStamp(a.latest.t)}</dd>}
            </div>
          </dl>
          {mean !== null && (
            <p className={P}>
              Over the last 72 hours the ocean at Trident Pier has run {Math.abs(mean).toFixed(2)} ft{' '}
              {mean >= 0 ? 'above' : 'below'} NOAA&apos;s tide prediction. Observed minus predicted, feet.
            </p>
          )}
        </>
      )}
      {/* Plain-language fall explanation straight from the copy file. */}
      <h3 className="text-xs font-black text-white uppercase tracking-wider mb-2">{fall.heading}</h3>
      {fall.paragraphs.slice(0, 2).map((p) => (
        <p key={p} className={P}>{p}</p>
      ))}
      <p className={SMALL}>
        Reference gauge: NOAA 8721604 Trident Pier, about 85 miles north of Vero. It shows the ocean, not the lagoon.
      </p>
    </Card>
  );
}

// ---------------------------------------------------------------------------------------
// (5) Flood watch
// ---------------------------------------------------------------------------------------

export function FloodWatchCard({ snapshot }: { snapshot: LagoonSnapshot }) {
  const fw = snapshot.floodWatch;
  const copy = LAGOON_PAGE.floodWatch;
  const exceeding = fw ? fw.nextPeaks.filter((p) => p.exceedsMinor) : [];
  return (
    <Card id="flood-h" title="Flood watch: reference-gauge heads-up">
      <p className={P}>{copy.paragraphs[0]}</p>
      {!fw ? (
        <p role="status" className="text-sm text-amber-200 border border-amber-400/60 rounded p-2 mb-3">
          {copy.unavailableNote}
        </p>
      ) : (
        <>
          {/* Clear yes/no state in words. */}
          <p className="text-sm font-black text-white mb-1">
            {exceeding.length > 0
              ? `${exceeding.length} of the next ${fw.nextPeaks.length} predicted highs reach or pass the minor-flood threshold at Trident Pier.`
              : `None of the next ${fw.nextPeaks.length} predicted highs reach the minor-flood threshold at Trident Pier.`}
          </p>
          <p className={`mb-3 ${SMALL}`}>
            Threshold: {fw.thresholdMllwFt.toFixed(2)} ft above MLLW at Trident Pier. &quot;With ocean anomaly&quot; adds
            the current ocean-versus-prediction gap to NOAA&apos;s predicted high.
          </p>
          <div className="overflow-x-auto mb-3">
            <table className="w-full text-sm text-left">
              <caption className="sr-only">Next predicted highs at Trident Pier compared with the minor-flood threshold</caption>
              <thead className="text-[10px] uppercase tracking-widest text-white/50">
                <tr>
                  <th scope="col" className="py-1 pr-3">High (ET)</th>
                  <th scope="col" className="py-1 pr-3">Predicted</th>
                  <th scope="col" className="py-1 pr-3">With anomaly</th>
                  <th scope="col" className="py-1">Status</th>
                </tr>
              </thead>
              <tbody className="text-white/90">
                {fw.nextPeaks.map((p) => (
                  <tr key={p.t} className="border-t border-white/10">
                    <th scope="row" className="py-1.5 pr-3 font-normal whitespace-nowrap">{fmtStamp(p.t)}</th>
                    <td className="py-1.5 pr-3 whitespace-nowrap">{p.predictedFtMllw.toFixed(2)} ft</td>
                    <td className="py-1.5 pr-3 whitespace-nowrap">{p.withAnomalyFtMllw.toFixed(2)} ft</td>
                    <td className={`py-1.5 ${p.exceedsMinor ? 'font-black text-amber-200' : ''}`}>
                      {p.exceedsMinor ? '▲ Reaches threshold' : copy.belowThresholdWording}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
      <p className={P}>{copy.paragraphs[1]}</p>
      <p className={SMALL}>{copy.paragraphs[2]}</p>
    </Card>
  );
}

// ---------------------------------------------------------------------------------------
// (2b) Data table fallback for the chart
// ---------------------------------------------------------------------------------------

export function ChartDataTable({ snapshot }: { snapshot: LagoonSnapshot }) {
  const samples = snapshot.observed?.samples ?? [];
  // Thin the rows: every 12th 15-minute sample = every 3 hours; forecast is hourly so every 3rd.
  const obsRows = samples.filter((_, i) => i % 12 === 0 || i === samples.length - 1);
  const showForecast = !!snapshot.observed && !snapshot.observed.stale;
  const fcRows = showForecast ? snapshot.forecast.filter((_, i) => i % 3 === 0) : [];
  return (
    <details className="mt-3 text-xs text-white/70">
      <summary className="cursor-pointer text-primary uppercase tracking-widest">View chart data as a table</summary>
      <div className="mt-2 overflow-x-auto">
        <table className="w-full text-left">
          <caption className="text-left text-white/60 mb-1">
            Observed (every 3 hours) and forecast (every 3 hours). Feet, NAVD88. Times Eastern.
          </caption>
          <thead className="text-[10px] uppercase tracking-widest text-white/50">
            <tr>
              <th scope="col" className="py-1 pr-3">Time (ET)</th>
              <th scope="col" className="py-1 pr-3">Kind</th>
              <th scope="col" className="py-1 pr-3">Level (ft)</th>
              <th scope="col" className="py-1">Range (ft)</th>
            </tr>
          </thead>
          <tbody>
            {obsRows.map((s) => (
              <tr key={`o${s.t}`} className="border-t border-white/10">
                <td className="py-1 pr-3 whitespace-nowrap">{fmtStamp(s.t)}</td>
                <td className="py-1 pr-3">Observed</td>
                <td className="py-1 pr-3">{s.ft.toFixed(2)}</td>
                <td className="py-1">n/a</td>
              </tr>
            ))}
            {fcRows.map((f) => (
              <tr key={`f${f.t}`} className="border-t border-white/10">
                <td className="py-1 pr-3 whitespace-nowrap">{fmtStamp(f.t)}</td>
                <td className="py-1 pr-3">Forecast</td>
                <td className="py-1 pr-3">{f.ft.toFixed(2)}</td>
                <td className="py-1">{f.lo.toFixed(2)} to {f.hi.toFixed(2)}</td>
              </tr>
            ))}
            {obsRows.length + fcRows.length === 0 && (
              <tr><td colSpan={4} className="py-2">No data available.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </details>
  );
}

// ---------------------------------------------------------------------------------------
// (6)-(8) Copy-driven sections
// ---------------------------------------------------------------------------------------

/** Generic renderer for a CopySection (heading + paragraphs + optional bullets). */
export function CopyCard({ id, section }: { id: string; section: CopySection }) {
  return (
    <Card id={id} title={section.heading}>
      {section.paragraphs.map((p) => (
        <p key={p} className={P}>{p}</p>
      ))}
      {section.bullets && (
        <ol className="list-decimal pl-5 space-y-2 text-sm text-white/75 leading-relaxed">
          {section.bullets.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ol>
      )}
    </Card>
  );
}

export function AccuracyCard() {
  const a = LAGOON_PAGE.howAccurate;
  return (
    <Card id="accuracy-h" title={a.heading}>
      <p className={P}>{a.intro}</p>
      <ul className="list-disc pl-5 space-y-1 text-sm text-white/75 leading-relaxed mb-3">
        {a.claims.map((c) => (
          <li key={c}>{c}</li>
        ))}
      </ul>
      <p className="text-sm text-white font-bold mb-3">{a.plainEnglish}</p>
      <h3 className="text-xs font-black text-white uppercase tracking-wider mb-2">Limits</h3>
      <ul className="list-disc pl-5 space-y-1 text-sm text-white/75 leading-relaxed mb-3">
        {a.limits.map((l) => (
          <li key={l}>{l}</li>
        ))}
      </ul>
      <h3 className="text-xs font-black text-white uppercase tracking-wider mb-2">What we do not claim</h3>
      <ul className="list-disc pl-5 space-y-1 text-sm text-white/75 leading-relaxed">
        {LAGOON_PAGE.whatWeDontClaim.map((l) => (
          <li key={l}>{l}</li>
        ))}
      </ul>
    </Card>
  );
}

/** Visible FAQ. Must stay in sync with the FAQPage JSON-LD, which is built from the same array. */
export function FaqCard() {
  return (
    <Card id="faq-h" title="Frequently asked questions">
      <div className="space-y-4">
        {LAGOON_PAGE.faq.map((f) => (
          <div key={f.q}>
            <h3 className="text-sm font-black text-white mb-1">{f.q}</h3>
            <p className="text-sm text-white/75 leading-relaxed">{f.a}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

export function GlossaryCard() {
  return (
    <Card id="glossary-h" title="Glossary">
      <dl className="space-y-3">
        {LAGOON_PAGE.glossaryKeys.map((k) => {
          const g = GLOSSARY[k];
          return g ? (
            <div key={k}>
              <dt className="text-sm font-black text-white">{g.term}</dt>
              <dd className="text-sm text-white/75 leading-relaxed">{g.definition}</dd>
            </div>
          ) : null;
        })}
      </dl>
    </Card>
  );
}

export function SourcesCard() {
  return (
    <Card id="sources-h" title="Data sources and credits">
      <ul className="space-y-3">
        {LAGOON_PAGE.sourceKeys.map((k) => {
          const s = SOURCE_CREDITS[k];
          return s ? (
            <li key={k} className="text-sm text-white/75 leading-relaxed">
              <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-primary underline font-bold">
                {s.agency}: {s.identifier}
              </a>
              <br />
              {s.use} <span className="text-white/50">{s.caveat}</span>
            </li>
          ) : null;
        })}
      </ul>
      <h3 className="text-xs font-black text-white uppercase tracking-wider mt-4 mb-2">Data notes</h3>
      <ul className="space-y-1">
        {DATA_NOTES.filter((n) => n.note.length > 0)
          .slice(0, 4)
          .map((n) => (
            <li key={n.note} className={SMALL}>
              {n.date}: {n.note}
            </li>
          ))}
      </ul>
    </Card>
  );
}

export function DisclaimerBlock() {
  return (
    <div className="font-mono text-[11px] text-white/50 leading-relaxed space-y-1 mb-8">
      {LAGOON_PAGE.disclaimers.map((d) => (
        <p key={d}>{d}</p>
      ))}
    </div>
  );
}
