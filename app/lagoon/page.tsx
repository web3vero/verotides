import type { Metadata } from 'next';
import Link from 'next/link';
import { getLagoonSnapshot } from '@/lib/verotide/lagoon';
import { LAGOON_FAQ_JSONLD, LAGOON_PAGE } from '@/lib/verotide/lagoon-copy';
import { JsonLd, breadcrumbList, ORGANIZATION_ID } from '@/components/verotide/JsonLd';
import LagoonChart, { LagoonChartLegend } from '@/components/verotide/lagoon/LagoonChart';
import {
  AccuracyCard,
  AnomalyCard,
  ChartDataTable,
  CopyCard,
  DisclaimerBlock,
  ExtremesCard,
  FaqCard,
  FloodWatchCard,
  GlossaryCard,
  SourcesCard,
  StatusPanel,
} from '@/components/verotide/lagoon/LagoonSections';

// ISR: Next re-renders this server component at most every 5 minutes. USGS posts 15-minute
// values, so 5 minutes keeps the number fresh without hammering USGS/NOAA on every visit.
export const revalidate = 300;
// Allow up to 60 s: USGS can take several seconds per try (see usgs.ts), and the default 10-15 s would kill the render.
export const maxDuration = 60;

const TITLE = LAGOON_PAGE.metadata.title;
const DESCRIPTION = LAGOON_PAGE.metadata.description;
const URL = 'https://verotides.com/lagoon';

export const metadata: Metadata = {
  // absolute: skip the layout's "%s | Verotides" template; the brand is already in the copy title.
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: '/lagoon' }, // relative; metadataBase in the layout makes it absolute
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: '/lagoon',
    siteName: 'Verotides',
    type: 'website',
    // A child openGraph replaces the layout's whole openGraph object, so the image is repeated.
    images: [{ url: '/og_image.png', width: 1200, height: 630, alt: 'Verotides Vero Beach coastal conditions' }],
  },
};

export default async function LagoonPage() {
  // getLagoonSnapshot never throws for upstream trouble: it returns nulls plus `errors`.
  const snapshot = await getLagoonSnapshot();
  const showForecast = !!snapshot.observed && !snapshot.observed.stale && snapshot.forecast.length > 0;

  // Structured data. The Dataset describes the derived series this page really shows.
  // Deliberately NO license (the inputs are USGS/NOAA public data we do not relicense).
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${URL}#webpage`,
        name: LAGOON_PAGE.h1,
        description: DESCRIPTION,
        url: URL,
        isPartOf: { '@type': 'WebSite', url: 'https://verotides.com' },
        publisher: { '@id': ORGANIZATION_ID },
        breadcrumb: breadcrumbList([{ name: 'Home', path: '/' }, { name: 'Lagoon water level' }]),
      },
      {
        '@type': 'Dataset',
        '@id': `${URL}#dataset`,
        name: 'Indian River Lagoon water level at Wabasso (derived)',
        description:
          'Observed USGS water level at Indian River at Wabasso (feet, NAVD88, provisional) with a derived short-range forecast and predicted lagoon high and low times built from NOAA tide predictions.',
        url: URL,
        creator: { '@id': ORGANIZATION_ID },
        isBasedOn: [
          'https://waterdata.usgs.gov/monitoring-location/02251800/',
          'https://tidesandcurrents.noaa.gov/stationhome.html?id=8722105',
          'https://tidesandcurrents.noaa.gov/stationhome.html?id=8721604',
        ],
        isAccessibleForFree: true,
        variableMeasured: 'Lagoon water level (feet, NAVD88)',
        dateModified: snapshot.generatedAt,
        spatialCoverage: { '@type': 'Place', name: 'Indian River Lagoon at Wabasso, Florida' },
      },
    ],
  };

  return (
    <main className="min-h-screen bg-black p-4 md:p-8">
      <JsonLd data={schema} />
      <JsonLd data={{ '@context': 'https://schema.org', ...breadcrumbList([{ name: 'Home', path: '/' }, { name: 'Lagoon water level' }]) }} />
      {/* FAQPage markup: the same FAQ is rendered visibly in <FaqCard /> below, as Google requires. */}
      <JsonLd data={LAGOON_FAQ_JSONLD} />

      <div className="max-w-4xl mx-auto">
        <nav aria-label="Breadcrumb" className="text-[11px] font-mono text-white/50 mb-3">
          <Link href="/" className="underline">Home</Link> &gt; Lagoon water level
        </nav>

        {/* Exactly one H1 on the page. */}
        <h1 className="text-2xl md:text-5xl font-black glow-text tracking-tighter italic mb-4 uppercase">
          {LAGOON_PAGE.h1}
        </h1>

        <StatusPanel snapshot={snapshot} />

        <p className="text-sm font-mono text-white/70 leading-relaxed mb-6 max-w-3xl">{LAGOON_PAGE.intro}</p>

        {/* (2) Chart */}
        <section aria-labelledby="chart-h" className="terminal-box border border-primary/20 bg-black/60 rounded-xl p-4 font-mono mb-6">
          <h2 id="chart-h" className="text-xs font-black text-primary uppercase tracking-widest mb-3">
            &gt; Last 48 hours and next 72 hours
          </h2>
          <LagoonChart snapshot={snapshot} />
          <LagoonChartLegend showForecast={showForecast} />
          <p className="mt-2 text-[11px] text-white/50">{LAGOON_PAGE.howAccurate.plainEnglish}</p>
          <ChartDataTable snapshot={snapshot} />
        </section>

        <ExtremesCard snapshot={snapshot} />
        <AnomalyCard snapshot={snapshot} />
        <FloodWatchCard snapshot={snapshot} />

        <CopyCard id="what-h" section={LAGOON_PAGE.whatYoureLookingAt} />
        <CopyCard id="how-h" section={LAGOON_PAGE.howWeCalculate} />
        <AccuracyCard />
        <FaqCard />
        <GlossaryCard />
        <SourcesCard />
        <DisclaimerBlock />
      </div>
    
      {/* Internal links: connect related utilities so crawlers and boaters can move between them */}
      <nav aria-label="Related pages" className="mt-8 max-w-4xl font-mono text-xs text-white/70">
        <h2 className="text-sm font-black text-primary uppercase tracking-widest mb-2">Related</h2>
        <ul className="flex flex-col gap-1">
          <li><Link href="/boat-ramps" className="text-primary underline hover:text-white">Boat ramps in Indian River, St. Lucie and Brevard counties</Link></li>
          <li><Link href="/manatee-zones" className="text-primary underline hover:text-white">Manatee protection zones</Link></li>
          <li><Link href="/inlets" className="text-primary underline hover:text-white">Fort Pierce Inlet conditions</Link></li>
        </ul>
      </nav>
    </main>
  );
}
