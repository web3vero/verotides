import type { Metadata } from 'next';
import Link from 'next/link';
import { getInletSnapshot } from '@/lib/verotide/inlet';
import {
  INLETS_PAGE,
  INLETS_FAQ_JSONLD,
  GLOSSARY,
  SOURCE_CREDITS,
  DATA_NOTES,
  INDEPENDENCE_NOTE,
} from '@/lib/verotide/lagoon-copy';
import { JsonLd, breadcrumbList, ORGANIZATION_ID } from '@/components/verotide/JsonLd';
import InletReadings from '@/components/verotide/inlets/InletReadings';
import InletCompass from '@/components/verotide/inlets/InletCompass';
import WaveCurrentBox from '@/components/verotide/inlets/WaveCurrentBox';
import { etTime } from '@/components/verotide/inlets/format';

// ISR: Next re-renders this server component at most every 5 minutes, so the data stays fresh
// without a fetch on every visit.
export const revalidate = 300;

const P = INLETS_PAGE;
const URL = 'https://verotides.com/inlets';

// NOAA's published mean ebb direction for Fort Pierce Inlet (degrees true, flowing toward).
// The same number appears in the glossary copy; used only to orient the compass graphic.
const EBB_TO_DEG = 77;

export const metadata: Metadata = {
  // absolute: the brand is already in the title, so skip the layout's "| Verotides" template.
  title: { absolute: P.metadata.title },
  description: P.metadata.description,
  alternates: { canonical: '/inlets' }, // relative; metadataBase in the layout makes it absolute
  openGraph: {
    title: P.metadata.title,
    description: P.metadata.description,
    url: '/inlets',
    siteName: 'Verotides',
    type: 'website',
    images: [{ url: '/og_image.png', width: 1200, height: 630, alt: 'Verotides Vero Beach coastal conditions' }],
  },
};

/** Section heading in the same terminal style used on the cam pages. */
function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="text-xs font-black text-primary uppercase tracking-widest">&gt; {children}</h2>;
}

/** The required disclaimer. Rendered at the top AND the bottom of the page, as an alert-style box. */
function Disclaimer() {
  return (
    <aside aria-label="Disclaimer" className="terminal-box p-4 font-mono text-sm text-white/90 leading-relaxed">
      <p className="text-xs font-black uppercase tracking-widest text-primary mb-2">Read this first</p>
      <p>{P.mandatoryDisclaimer}</p>
      <ul className="mt-3 flex flex-col gap-1 text-xs">
        {P.officialSources.map((s) => (
          <li key={s.url}>
            {/* Official sources the disclaimer points to. rel keeps the link honest and private. */}
            <a href={s.url} target="_blank" rel="noopener noreferrer" className="underline text-primary">
              {s.label}
            </a>
            <span className="text-white/60"> ({s.note})</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}

export default async function InletsPage() {
  // getInletSnapshot never throws: failures come back as nulls plus human-readable `errors`.
  const snapshot = await getInletSnapshot();

  // "Not claimed" bullets come from copy. The strings that spell out the banned safety words are
  // filtered out of the on-page list (the sentence about no rating is carried by the intro).
  const notClaimed = P.whatWeDontClaim.filter((s) => !/\b(un)?safe\b/i.test(s));

  // Structured data: WebPage + BreadcrumbList + FAQPage, tied together in one @graph.
  // The FAQ is rendered visibly below, which Google requires for FAQPage markup.
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${URL}#webpage`,
        name: P.h1,
        description: P.metadata.description,
        url: URL,
        dateModified: snapshot.generatedAt,
        isPartOf: { '@type': 'WebSite', url: 'https://verotides.com' },
        publisher: { '@id': ORGANIZATION_ID },
        breadcrumb: breadcrumbList([{ name: 'Home', path: '/' }, { name: 'Inlets' }]),
      },
      // INLETS_FAQ_JSONLD has its own @context; drop it so it nests cleanly inside our @graph.
      { '@type': 'FAQPage', mainEntity: INLETS_FAQ_JSONLD.mainEntity },
    ],
  };

  // Only the glossary terms, sources, and notes this page cares about.
  const glossary = P.glossaryKeys.map((k) => GLOSSARY[k]);
  const sources = P.sourceKeys.map((k) => SOURCE_CREDITS[k]);
  const notes = DATA_NOTES.filter((n) => /Fort Pierce|Sebastian|41114/.test(n.note));

  return (
    <main className="min-h-screen bg-black p-4 md:p-8">
      <JsonLd data={schema} />
      <div className="max-w-4xl mx-auto space-y-8">
        <nav aria-label="Breadcrumb" className="text-[10px] font-mono uppercase tracking-widest text-white/40">
          <Link href="/" className="hover:text-primary">Home</Link> / Inlets
        </nav>

        <header className="space-y-2">
          <h1 className="text-3xl md:text-5xl font-black glow-text tracking-tighter italic uppercase">{P.h1}</h1>
          <p className="text-xs font-mono text-white/60 uppercase tracking-widest">
            As of {etTime(snapshot.generatedAt)}. Refreshes about every 5 minutes.
          </p>
          <p className="font-mono text-sm text-white/80 leading-relaxed">{P.intro}</p>
        </header>

        {/* Disclaimer #1: before any data, so nobody reads a number without it. */}
        <Disclaimer />

        {/* Inputs grid: predicted current, buoy waves, buoy wind. */}
        <section aria-labelledby="inputs-h" className="space-y-3">
          <h2 id="inputs-h" className="text-xs font-black text-primary uppercase tracking-widest">&gt; Current inputs</h2>
          <InletReadings snapshot={snapshot} />
        </section>

        {/* Compass graphic + short explanation of how to read it. */}
        <section aria-labelledby="compass-h" className="terminal-box p-4 font-mono text-sm text-white/80">
          <h2 id="compass-h" className="text-xs font-black text-primary uppercase tracking-widest">&gt; Ebb direction and wave direction</h2>
          <div className="mt-3 grid gap-4 md:grid-cols-2 items-center">
            <InletCompass ebbToDeg={EBB_TO_DEG} waveFromDeg={snapshot.waves?.meanWaveDirDeg ?? null} />
            <p className="leading-relaxed">
              The ebb arrow shows where outgoing water flows toward (NOAA lists about 77 degrees true at Fort
              Pierce Inlet). The wave arrow shows the direction the buoy says waves are coming from. When the two
              arrows line up, waves are running straight into the outgoing current. The arrow positions describe
              direction only; they do not show strength or distance.
            </p>
          </div>
        </section>

        <WaveCurrentBox snapshot={snapshot} />

        {/* How to read this: what the numbers are and where they come from (copy file). */}
        <section className="font-mono text-sm text-white/80 leading-relaxed space-y-3">
          <H2>How to read this</H2>
          {P.whatYoureLookingAt.paragraphs.map((p) => <p key={p}>{p}</p>)}
          <h3 className="text-xs font-black text-white uppercase tracking-widest pt-2">{P.howWeCalculate.heading}</h3>
          {P.howWeCalculate.paragraphs.map((p) => <p key={p}>{p}</p>)}
          <ul className="list-disc pl-5 space-y-1">
            {P.howWeCalculate.bullets.map((b) => <li key={b}>{b}</li>)}
          </ul>
        </section>

        {/* Sebastian: explicit statement of what is NOT covered, and why. */}
        <section aria-labelledby="seb-h" className="font-mono text-sm text-white/80 leading-relaxed space-y-3">
          <h2 id="seb-h" className="text-xs font-black text-primary uppercase tracking-widest">&gt; Sebastian Inlet is not covered</h2>
          <p>
            This page covers Fort Pierce Inlet only. NOAA has no current-prediction station at Sebastian Inlet, and
            the direction of its channel has not been verified, so we do not show numbers for it rather than guess.
          </p>
        </section>

        <section className="font-mono text-sm text-white/80 leading-relaxed space-y-3">
          <H2>What this page does not claim</H2>
          <ul className="list-disc pl-5 space-y-1">
            {notClaimed.map((s) => <li key={s}>{s}</li>)}
          </ul>
        </section>

        {/* FAQ is visible text, which is why the FAQPage markup above is allowed. */}
        <section className="font-mono text-sm text-white/80 space-y-4">
          <H2>FAQ</H2>
          {P.faq.map((f) => (
            <div key={f.q}>
              <h3 className="font-bold text-white">{f.q}</h3>
              <p className="text-white/70 leading-relaxed">{f.a}</p>
            </div>
          ))}
        </section>

        <section className="font-mono text-sm text-white/80 space-y-3">
          <H2>Glossary</H2>
          <dl className="space-y-3">
            {glossary.map((g) => (
              <div key={g.term}>
                <dt className="font-bold text-white">{g.term}</dt>
                <dd className="text-white/70 leading-relaxed">{g.definition}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="font-mono text-xs text-white/70 space-y-3">
          <H2>Sources</H2>
          <ul className="space-y-3">
            {sources.map((s) => (
              <li key={s.id}>
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="underline text-primary">
                  {s.agency}: {s.identifier}
                </a>
                <p>{s.use}</p>
                <p className="text-white/50">{s.caveat}</p>
              </li>
            ))}
          </ul>
          {notes.length > 0 && (
            <ul className="list-disc pl-5 space-y-1 pt-2 text-white/50">
              {notes.map((n) => <li key={n.note}>{n.date}: {n.note}</li>)}
            </ul>
          )}
        </section>

        {/* Disclaimer #2: again at the bottom, then the independence note. */}
        <Disclaimer />
        <footer className="font-mono text-xs text-white/50 border-t border-primary/20 pt-4 space-y-2">
          {P.disclaimers.filter((d) => d !== INDEPENDENCE_NOTE).map((d) => <p key={d}>{d}</p>)}
          <p>{INDEPENDENCE_NOTE}</p>
        </footer>
      </div>
    </main>
  );
}
