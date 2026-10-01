import type { Metadata } from 'next';
import Link from 'next/link';
import rawZones from '@/data/manatee-zones.json';
import { asManateeZonesFile } from '@/lib/verotide/geo-types';
import { FAQ_JSONLD, MANATEE_PAGE, MAP_SECTION, NEAR_ME } from '@/lib/verotide/manatee-copy';
import { JsonLd, breadcrumbList, ORGANIZATION_ID } from '@/components/verotide/JsonLd';
import { LazyMap } from '@/components/verotide/maps/LazyMap';
import NearMe from '@/components/verotide/manatee/NearMe';
import { zoneAnchor } from '@/components/verotide/manatee/zone-display';
import {
  CreditsBlock,
  DisclaimerBlock,
  FaqBlock,
  GlossaryBlock,
  UpdateBanner,
  ZoneLegend,
  ZoneTables,
} from '@/components/verotide/manatee/ManateeSections';

// The data is a static JSON file that only changes when someone re-runs the refresh script and
// redeploys, so a daily ISR refresh is plenty. Nothing on this page is computed from "now".
export const revalidate = 86400;

const TITLE = MANATEE_PAGE.metadata.title;
const DESCRIPTION = MANATEE_PAGE.metadata.description;
const URL = 'https://verotides.com/manatee-zones';

export const metadata: Metadata = {
  // absolute: skip the layout's "%s | Verotides" template; the brand is already in the title.
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: '/manatee-zones' }, // relative; metadataBase in the layout makes it absolute
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: '/manatee-zones',
    siteName: 'Verotides',
    type: 'website',
    // A child openGraph replaces the layout's whole openGraph object, so the image is repeated.
    images: [{ url: '/og_image.png', width: 1200, height: 630, alt: 'Verotides Vero Beach coastal conditions' }],
  },
};

export default function ManateeZonesPage() {
  // asManateeZonesFile re-attaches the precise literal types the JSON import widens away.
  const { meta, zones } = asManateeZonesFile(rawZones);
  // The date the update banner quotes is FWC's own last-edit date, NOT our fetch date.
  const sourceLastEdited = meta.sources[0]?.sourceLastEdited ?? null;

  const crumbs = [{ name: 'Home', path: '/' }, { name: 'Manatee zones' }];

  // Structured data: WebPage + ItemList of zones in one @graph; breadcrumb and FAQ as their own scripts.
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${URL}#webpage`,
        name: MANATEE_PAGE.h1,
        description: DESCRIPTION,
        url: URL,
        isPartOf: { '@type': 'WebSite', url: 'https://verotides.com' },
        publisher: { '@id': ORGANIZATION_ID },
        breadcrumb: breadcrumbList(crumbs),
        mainEntity: { '@id': `${URL}#zones` },
      },
      {
        '@type': 'ItemList',
        '@id': `${URL}#zones`,
        name: 'Manatee protection zones near Indian River County, Florida',
        numberOfItems: zones.length,
        itemListElement: zones.map((z, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: z.name,
          // Each zone has an anchor on the page (the table row id).
          url: `${URL}#${zoneAnchor(z.id)}`,
        })),
      },
    ],
  };

  return (
    <main className="min-h-screen bg-black p-4 md:p-8">
      <JsonLd data={schema} />
      <JsonLd data={{ '@context': 'https://schema.org', ...breadcrumbList(crumbs) }} />
      {/* FAQPage markup: the same FAQ is rendered visibly in <FaqBlock /> below, as Google requires. */}
      <JsonLd data={FAQ_JSONLD} />

      <div className="max-w-4xl mx-auto">
        <nav aria-label="Breadcrumb" className="text-[11px] font-mono text-white/50 mb-3">
          <Link href="/" className="underline">Home</Link> &gt; Manatee zones
        </nav>

        {/* Exactly one H1 on the page. */}
        <h1 className="text-2xl md:text-5xl font-black glow-text tracking-tighter italic mb-4 uppercase">
          {MANATEE_PAGE.h1}
        </h1>

        {MANATEE_PAGE.intro.map((p) => (
          <p key={p} className="text-sm font-mono text-white/70 leading-relaxed mb-3 max-w-3xl">{p}</p>
        ))}

        {/* The 2026 rule-change warning goes before the map so nobody reads the map without it. */}
        <div className="mt-4">
          <UpdateBanner sourceLastEdited={sourceLastEdited} />
        </div>

        <ZoneLegend zones={zones} />

        <section aria-labelledby="map-h" className="terminal-box border border-primary/20 bg-black/60 rounded-xl p-3 md:p-4 font-mono mb-6">
          <h2 id="map-h" className="text-xs font-black text-primary uppercase tracking-widest mb-2">&gt; {MAP_SECTION.heading}</h2>
          <p className="mb-3 text-[11px] text-white/60">{MAP_SECTION.caption}</p>
          <p className="mb-3 text-[11px]">
            <a href="#zone-tables" className="underline text-primary">{MAP_SECTION.skipMap}</a>
          </p>
          <LazyMap zones={zones} height={420} showChartToggle ariaLabel={MAP_SECTION.ariaLabel} />
          <p className="mt-2 text-[11px] text-white/50">{MAP_SECTION.baseMapCredit} Zones: FWC (myfwc.com).</p>
          <p className="mt-1 text-[11px] text-yellow-200/80">
            Informational only. Posted signs and the rule text control. Not legal advice, not for navigation.
          </p>
        </section>

        <section aria-labelledby="near-h" className="terminal-box border border-primary/20 bg-black/60 rounded-xl p-4 font-mono mb-6">
          <h2 id="near-h" className="text-xs font-black text-primary uppercase tracking-widest mb-2">&gt; {NEAR_ME.heading}</h2>
          <p className="mb-3 text-xs text-white/70">{NEAR_ME.intro}</p>
          <NearMe />
        </section>

        <ZoneTables zones={zones} />
        <GlossaryBlock />
        <FaqBlock />
        <DisclaimerBlock />
        <CreditsBlock meta={meta} />
      </div>
    </main>
  );
}
