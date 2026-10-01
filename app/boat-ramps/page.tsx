import type { Metadata } from 'next';
import Link from 'next/link';
import { getLagoonSnapshot } from '@/lib/verotide/lagoon';
import { JsonLd, breadcrumbList, ORGANIZATION_ID } from '@/components/verotide/JsonLd';
import RampLagoonBlock from '@/components/verotide/ramps/RampLagoonBlock';
import RampDirectory from '@/components/verotide/ramps/RampDirectory';
import RampsMapIsland from '@/components/verotide/ramps/RampsMapIsland';
import RampNotices from '@/components/verotide/ramps/RampNotices';
import {
  RAMPS_PAGE,
  SITE_URL,
  ZONES_NOTE,
  buildRampsFaq,
  faqJsonLd,
  shortName,
} from '@/lib/verotide/ramps-copy';
import {
  getRamps,
  groupRamps,
  indexableRamps,
  isIndexable,
  rampAnchorId,
  rampIdToAnchor,
  rampSlug,
} from '@/lib/verotide/ramps';

// ISR: re-render at most every 5 minutes so the lagoon context block stays fresh.
export const revalidate = 300;
// getLagoonSnapshot can take several seconds when USGS is slow (same allowance as /lagoon).
export const maxDuration = 60;

const URL = `${SITE_URL}/boat-ramps`;

export const metadata: Metadata = {
  // absolute: the brand is already in the title, so skip the layout's "%s | Verotides" template.
  title: { absolute: RAMPS_PAGE.title },
  description: RAMPS_PAGE.description,
  alternates: { canonical: '/boat-ramps' }, // relative; metadataBase in the layout makes it absolute
  openGraph: {
    title: RAMPS_PAGE.title,
    description: RAMPS_PAGE.description,
    url: '/boat-ramps',
    siteName: 'Verotides',
    type: 'website',
    images: [{ url: '/og_image.png', width: 1200, height: 630, alt: 'Verotides Vero Beach coastal conditions' }],
  },
};

export default async function BoatRampsPage() {
  // ONE lagoon snapshot per render, shared with the context block. It never throws for upstream trouble.
  const snapshot = await getLagoonSnapshot();

  const ramps = getRamps();
  const groups = groupRamps(ramps);
  const faq = buildRampsFaq(ramps);
  const standalone = indexableRamps().length;

  // Structured data: WebPage + BreadcrumbList + ItemList of ramps + FAQPage (visible below).
  // Ramps with their own page link to it; the rest link to their anchor on this page.
  // Deliberately NO ParkingFacility and NO ratings.
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${URL}#webpage`,
        name: RAMPS_PAGE.h1,
        description: RAMPS_PAGE.description,
        url: URL,
        isPartOf: { '@type': 'WebSite', url: SITE_URL },
        publisher: { '@id': ORGANIZATION_ID },
        breadcrumb: breadcrumbList([{ name: 'Home', path: '/' }, { name: 'Boat ramps' }]),
        mainEntity: { '@id': `${URL}#ramps` },
      },
      {
        '@type': 'ItemList',
        '@id': `${URL}#ramps`,
        name: 'Public boat ramps and hand-launch sites in Indian River County and nearby',
        numberOfItems: ramps.length,
        itemListElement: ramps.map((r, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: shortName(r.name),
          url: isIndexable(r) ? `${URL}/${rampSlug(r)}` : `${URL}#${rampAnchorId(r)}`,
        })),
      },
      faqJsonLd(faq),
    ],
  };

  return (
    <main className="min-h-screen bg-black p-4 md:p-8">
      <JsonLd data={schema} />
      <JsonLd data={{ '@context': 'https://schema.org', ...breadcrumbList([{ name: 'Home', path: '/' }, { name: 'Boat ramps' }]) }} />

      <div className="max-w-4xl mx-auto">
        <nav aria-label="Breadcrumb" className="text-[11px] font-mono text-white/50 mb-3">
          <Link href="/" className="underline">Home</Link> &gt; Boat ramps
        </nav>

        {/* Exactly one H1 on the page. */}
        <h1 className="text-2xl md:text-5xl font-black glow-text tracking-tighter italic mb-4 uppercase">{RAMPS_PAGE.h1}</h1>

        <div className="font-mono text-sm text-white/70 leading-relaxed mb-6 max-w-3xl space-y-3">
          {RAMPS_PAGE.intro.map((p) => (
            <p key={p}>{p}</p>
          ))}
          <p className="text-[11px] text-white/50">
            {ramps.length} sites listed. {standalone} of them have their own detail page; the rest are fully described below.
            Jump to: {groups.map((g, i) => (
              <span key={g.county}>
                {i > 0 && ', '}
                <a href={`#county-${g.county.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`} className="underline">{g.county} County</a>
              </span>
            ))}.
          </p>
        </div>

        <RampLagoonBlock snapshot={snapshot} />

        <section aria-labelledby="map-h" className="mb-8">
          <h2 id="map-h" className="text-xs font-black text-primary uppercase tracking-widest mb-3">&gt; Map of ramps</h2>
          <RampsMapIsland ramps={ramps} anchors={rampIdToAnchor()} />
          <p className="mt-2 text-[11px] font-mono text-white/50">
            Informational map. Tap a marker to jump to that ramp below. Not for navigation.
          </p>
        </section>

        <RampDirectory groups={groups} />

        <p className="font-mono text-[11px] text-white/60 leading-relaxed my-8">
          {ZONES_NOTE} See the <Link href="/manatee-zones" className="underline text-primary">manatee zones page</Link>.
        </p>

        {/* Visible FAQ: matches the FAQPage markup above, as Google requires. */}
        <section aria-labelledby="faq-h" className="font-mono text-sm text-white/80 space-y-4 mb-8">
          <h2 id="faq-h" className="text-xs font-black text-primary uppercase tracking-widest">&gt; FAQ</h2>
          {faq.map((f) => (
            <div key={f.q}>
              <h3 className="font-bold text-white">{f.q}</h3>
              <p className="text-white/70">{f.a}</p>
            </div>
          ))}
        </section>

        <RampNotices />
      </div>
    </main>
  );
}
