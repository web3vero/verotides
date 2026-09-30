import type { Metadata } from 'next';
import Link from 'next/link';
import { CAMS, CAM_CATEGORY_LABELS, canEmbed, type Cam, type CamCategory } from '@/lib/verotide/cams';
import { JsonLd, breadcrumbList, ORGANIZATION_ID } from '@/components/verotide/JsonLd';
import CamCredit from '@/components/verotide/CamCredit';

const TITLE = 'Vero Beach Cams: Satellite, Radar & Buoy Views | Verotides'; // <= 60 chars
const DESCRIPTION =
  'Treasure Coast satellite, radar and offshore buoy images plus credited links to Vero Beach and Sebastian Inlet webcams. Sources named, nothing recorded.'; // <= 155 chars

export const metadata: Metadata = {
  // absolute: skip the layout's "%s | Verotides" template because the brand is already in the title.
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: '/cams' }, // relative; metadataBase in the layout makes it absolute
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: '/cams',
    siteName: 'Verotides',
    type: 'website',
    // A child openGraph replaces the layout's whole openGraph object, so the image is repeated here.
    images: [{ url: '/og_image.png', width: 1200, height: 630, alt: 'Verotides Vero Beach coastal conditions' }],
  },
};

// Display order of the groups on the page.
const GROUP_ORDER: CamCategory[] = ['satellite', 'radar', 'buoy', 'camera'];

function CamCard({ cam }: { cam: Cam }) {
  const hasPage = cam.indexable && canEmbed(cam);
  return (
    <article className="border border-primary/20 bg-black/60 rounded-xl p-4 font-mono flex flex-col gap-3">
      <h3 className="text-sm font-black text-primary uppercase tracking-wider">{cam.name}</h3>
      <p className="text-xs text-white/70">
        {hasPage
          ? 'Public-domain image from NOAA or the National Weather Service, loaded on request on its own page.'
          : 'Third-party camera. We do not embed it; the operator hosts the video.'}
      </p>
      <CamCredit cam={cam} />
      {hasPage ? (
        <Link href={`/cams/${cam.slug}`} className="mt-auto inline-block border border-primary/40 px-3 py-2 text-xs uppercase tracking-widest text-primary hover:bg-primary hover:text-black transition-colors self-start">
          Open {cam.shortName} page
        </Link>
      ) : (
        <a
          href={cam.sourceUrl}
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="mt-auto inline-block border border-primary/40 px-3 py-2 text-xs uppercase tracking-widest text-primary hover:bg-primary hover:text-black transition-colors self-start"
        >
          Open live cam at {cam.operator}
        </a>
      )}
      {!hasPage && cam.notes && <p className="text-[10px] text-white/40">Note: {cam.notes}</p>}
    </article>
  );
}

export default function CamsHubPage() {
  // ItemList of the pages that really exist on our site (indexable entries only).
  const pages = CAMS.filter((c) => c.indexable);
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': 'https://verotides.com/cams#webpage',
        name: 'Vero Beach and Sebastian Inlet Cams',
        description: DESCRIPTION,
        url: 'https://verotides.com/cams',
        isPartOf: { '@type': 'WebSite', url: 'https://verotides.com' },
        publisher: { '@id': ORGANIZATION_ID },
        breadcrumb: breadcrumbList([{ name: 'Home', path: '/' }, { name: 'Cams' }]),
        mainEntity: {
          '@type': 'ItemList',
          itemListElement: pages.map((c, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: c.name,
            url: `https://verotides.com/cams/${c.slug}`,
          })),
        },
      },
    ],
  };

  return (
    <main className="min-h-screen bg-black p-4 md:p-8">
      <JsonLd data={schema} />
      <div className="max-w-5xl mx-auto">
        {/* Exactly one H1 on the page. */}
        <h1 className="text-3xl md:text-5xl font-black glow-text tracking-tighter italic mb-4 uppercase">
          Vero Beach &amp; Sebastian Inlet Cams
        </h1>
        <p className="text-sm font-mono text-white/70 leading-relaxed mb-6 max-w-3xl">
          Satellite, radar and offshore buoy images for the Treasure Coast, plus links to the local beach and inlet
          cameras run by other people. Each source is credited by name. The hub loads no video or third-party
          players; images only load when you open a page and ask for them.
        </p>

        {GROUP_ORDER.map((cat) => {
          const items = CAMS.filter((c) => c.category === cat);
          if (items.length === 0) return null;
          return (
            <section key={cat} className="mb-10" aria-labelledby={`g-${cat}`}>
              <h2 id={`g-${cat}`} className="text-xs font-black text-primary uppercase tracking-widest mb-3">
                &gt; {CAM_CATEGORY_LABELS[cat]}
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                {items.map((c) => (
                  <CamCard key={c.slug} cam={c} />
                ))}
              </div>
            </section>
          );
        })}

        <section className="border border-primary/20 bg-black/60 rounded-xl p-4 font-mono text-xs text-white/60 leading-relaxed">
          <h2 className="text-xs font-black text-primary uppercase tracking-widest mb-2">&gt; How we handle cams</h2>
          <p>
            Verotides does not record, clip, re-host or re-stream anyone else&apos;s camera. NOAA and National Weather
            Service images are US government work, so we show them directly from the agency&apos;s servers with
            credit. Cameras run by businesses, counties and districts are link-out only: we describe them, credit
            the operator and send you to their site. Video and images on those sites belong to their operators.
            Nothing here is a safety tool; check official flags, forecasts and warnings before going on or in the water.
          </p>
        </section>
      </div>
    </main>
  );
}
