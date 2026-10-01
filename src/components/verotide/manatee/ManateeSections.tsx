// ManateeSections.tsx
// ---------------------------------------------------------------------------
// Server-rendered blocks for /manatee-zones: update banner, disclaimer, legend, per-waterbody
// zone tables, glossary, FAQ and data credits. All text comes from manatee-copy.ts; all
// zone-specific values come from the FWC-derived JSON. No client JavaScript is needed for any
// of it, so the tables are crawlable and work with scripts off.

import type { ManateeZone, ManateeZonesFile } from '@/lib/verotide/geo-types';
import {
  CREDITS,
  DISCLAIMER,
  FAQ,
  GLOSSARY,
  INDEPENDENCE_NOTE,
  LEGEND,
  LINKS,
  TABLES,
  TYPE_MEANING,
  UPDATE_BANNER,
  cleanCitation,
  formatIsoDate,
  ruleUrlForCitation,
} from '@/lib/verotide/manatee-copy';
import { ZoneSwatch } from './ZoneGraphics';
import { ZONE_TYPES_IN_LEGEND_ORDER, ZONE_TYPE_META, seasonText, zoneAnchor, zoneNotes } from './zone-display';

const card = 'terminal-box border border-primary/20 bg-black/60 rounded-xl p-4 font-mono mb-6';
const h2 = 'text-xs font-black text-primary uppercase tracking-widest mb-3';
const link = 'underline text-primary hover:text-white';

/** The 2026 rule-change banner. `sourceLastEdited` is the FWC layer's own last-edit date. */
export function UpdateBanner({ sourceLastEdited }: { sourceLastEdited: string | null }) {
  const date = formatIsoDate(sourceLastEdited);
  return (
    <section aria-labelledby="update-h" className="mb-6 rounded-xl border-2 border-yellow-400 bg-yellow-400/10 p-4 font-mono">
      <h2 id="update-h" className="text-sm font-black uppercase tracking-wide text-yellow-300 mb-2">
        {UPDATE_BANNER.heading}
      </h2>
      {UPDATE_BANNER.paragraphs.map((p) => (
        <p key={p} className="mb-2 text-sm leading-relaxed text-white/90">
          {p.replace('{SOURCE_DATE}', date)}
        </p>
      ))}
      <p className="mt-3 text-[11px] font-black uppercase tracking-widest text-yellow-300">{UPDATE_BANNER.linkIntro}</p>
      <ul className="mt-1 space-y-1 text-xs">
        {UPDATE_BANNER.links.map((l) => (
          <li key={l.url}>
            <a href={l.url} className={link} rel="noopener noreferrer" target="_blank">{l.label}</a>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function DisclaimerBlock() {
  return (
    <section aria-labelledby="disclaimer-h" className={card}>
      <h2 id="disclaimer-h" className={h2}>&gt; {DISCLAIMER.heading}</h2>
      {DISCLAIMER.paragraphs.map((p) => (
        <p key={p} className="mb-2 text-xs leading-relaxed text-white/75">{p}</p>
      ))}
      <p className="text-xs leading-relaxed text-white/75">{INDEPENDENCE_NOTE}</p>
    </section>
  );
}

/** Legend: swatch (colour + pattern + outline style) and plain meaning, with a count per type. */
export function ZoneLegend({ zones }: { zones: ManateeZone[] }) {
  return (
    <section aria-labelledby="legend-h" className={card}>
      <h2 id="legend-h" className={h2}>&gt; {LEGEND.heading}</h2>
      <p className="mb-3 text-xs text-white/70">{LEGEND.intro}</p>
      <ul className="space-y-3">
        {ZONE_TYPES_IN_LEGEND_ORDER.map((t) => {
          const count = zones.filter((z) => z.zoneType === t).length;
          return (
            <li key={t} className="flex items-start gap-3 text-xs">
              <ZoneSwatch type={t} />
              <span className="min-w-0 text-white/80">
                <strong className="text-white">{ZONE_TYPE_META[t].label}</strong> ({count} {count === 1 ? 'zone' : 'zones'}).{' '}
                {TYPE_MEANING[t]}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

// ---- Tables ------------------------------------------------------------------------------

/** Group zones by derived waterbody. Groups with Indian River zones come first, then A-Z. */
function groupByWaterbody(zones: ManateeZone[]) {
  const groups = new Map<string, ManateeZone[]>();
  for (const z of zones) {
    const key = z.waterbody ?? TABLES.otherGroup;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(z);
  }
  const hasIr = (zs: ManateeZone[]) => zs.some((z) => z.county === 'Indian River');
  return [...groups.entries()].sort(([an, az], [bn, bz]) => {
    if (an === TABLES.otherGroup) return 1; // "Other" always last
    if (bn === TABLES.otherGroup) return -1;
    return Number(hasIr(bz)) - Number(hasIr(az)) || an.localeCompare(bn);
  });
}

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export function ZoneTables({ zones }: { zones: ManateeZone[] }) {
  const groups = groupByWaterbody(zones);
  const c = TABLES.columns;
  return (
    <section id="zone-tables" aria-labelledby="tables-h" className="scroll-mt-4 mb-6">
      <h2 id="tables-h" className="text-lg font-black text-primary uppercase tracking-widest mb-2">{TABLES.heading}</h2>
      <p className="mb-4 text-xs leading-relaxed text-white/70">{TABLES.intro}</p>
      <ul className="mb-4 flex flex-wrap gap-x-4 gap-y-1 text-xs">
        {groups.map(([name]) => (
          <li key={name}><a className={link} href={`#wb-${slug(name)}`}>{name}</a></li>
        ))}
      </ul>

      {groups.map(([name, list]) => (
        <section key={name} id={`wb-${slug(name)}`} aria-labelledby={`wbh-${slug(name)}`} className="scroll-mt-4 mb-6">
          <h3 id={`wbh-${slug(name)}`} className="mb-2 text-sm font-black text-white uppercase tracking-wide">{name}</h3>
          {/* The wrapper scrolls sideways on a phone if needed; tabIndex lets keyboard users scroll it. */}
          <div className="overflow-x-auto border border-primary/20" tabIndex={0} role="region" aria-label={`${name} zones table`}>
            <table className="w-full min-w-[640px] border-collapse text-left text-xs font-mono">
              <caption className="sr-only">Manatee protection zones: {name}</caption>
              <thead className="bg-primary/10 text-primary">
                <tr>
                  <th scope="col" className="p-2">{c.zone}</th>
                  <th scope="col" className="p-2">{c.county}</th>
                  <th scope="col" className="p-2">{c.type}</th>
                  <th scope="col" className="p-2">{c.season}</th>
                  <th scope="col" className="p-2">{c.rule}</th>
                  <th scope="col" className="p-2">{c.notes}</th>
                </tr>
              </thead>
              <tbody>
                {list.map((z) => {
                  const cite = cleanCitation(z);
                  const url = ruleUrlForCitation(cite);
                  const notes = zoneNotes(z);
                  return (
                    // id = anchor the map links to; scroll-mt keeps the row clear of the top edge.
                    <tr key={z.id} id={zoneAnchor(z.id)} className="scroll-mt-4 border-t border-primary/10 align-top target:bg-primary/10">
                      <th scope="row" className="p-2 font-normal text-white">{z.name}</th>
                      <td className="p-2 text-white/80">{z.county}</td>
                      <td className="p-2 text-white/90">
                        <span className="flex items-center gap-2">
                          <ZoneSwatch type={z.zoneType} prefix={`t${z.id}`} />
                          <span>{ZONE_TYPE_META[z.zoneType].label}</span>
                        </span>
                      </td>
                      <td className="p-2 text-white/80">{seasonText(z)}</td>
                      <td className="p-2 text-white/80">
                        {cite ? (url ? <a className={link} href={url} rel="noopener noreferrer" target="_blank">{cite} F.A.C.</a> : `${cite} F.A.C.`) : 'See rule text'}
                      </td>
                      <td className="p-2 text-white/70">
                        {notes.length ? notes.map((n) => <span key={n} className="mb-1 block">{n}</span>) : <span aria-label="none">-</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </section>
  );
}

// ---- Glossary / FAQ / credits -------------------------------------------------------------

export function GlossaryBlock() {
  return (
    <section aria-labelledby="glossary-h" className={card}>
      <h2 id="glossary-h" className={h2}>&gt; Glossary</h2>
      <dl className="space-y-3 text-xs">
        {GLOSSARY.map((g) => (
          <div key={g.term}>
            <dt className="font-black text-white">{g.term}</dt>
            <dd className="mt-1 text-white/75">
              {g.definition}{' '}
              <a className={link} href={g.cite.url} rel="noopener noreferrer" target="_blank">{g.cite.label}</a>
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export function FaqBlock() {
  return (
    <section aria-labelledby="faq-h" className={card}>
      <h2 id="faq-h" className={h2}>&gt; Frequently asked questions</h2>
      <div className="space-y-4 text-xs">
        {FAQ.map((f) => (
          <div key={f.q}>
            <h3 className="font-black text-white">{f.q}</h3>
            <p className="mt-1 leading-relaxed text-white/75">{f.a}</p>
            <p className="mt-1 text-[11px] text-white/50">
              Sources:{' '}
              {f.cites.map((c, i) => (
                <span key={c.url}>
                  {i > 0 && '; '}
                  <a className={link} href={c.url} rel="noopener noreferrer" target="_blank">{c.label}</a>
                </span>
              ))}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function CreditsBlock({ meta }: { meta: ManateeZonesFile['meta'] }) {
  const src = meta.sources[0];
  return (
    <section aria-labelledby="credits-h" className={card}>
      <h2 id="credits-h" className={h2}>&gt; {CREDITS.heading}</h2>
      <p className="mb-2 text-xs leading-relaxed text-white/80">{CREDITS.requiredLine}</p>
      <p className="mb-2 text-xs text-white/60">{CREDITS.shortForm}</p>
      <ul className="space-y-1 text-xs text-white/70">
        <li>
          Source layer:{' '}
          <a className={link} href={src.layerUrl} rel="noopener noreferrer" target="_blank">{src.name}</a>, {src.publisher}.
        </li>
        <li>Source last edited by FWC: {formatIsoDate(src.sourceLastEdited)}.</li>
        <li>Our copy of the data was pulled on {formatIsoDate(meta.fetchedAt)}.</li>
        <li>{CREDITS.transformations}</li>
        <li>{CREDITS.mapCredits}</li>
        <li>
          Rule text: <a className={link} href={LINKS.chapter.url} rel="noopener noreferrer" target="_blank">{LINKS.chapter.label}</a>.
        </li>
      </ul>
    </section>
  );
}
