import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CAMS, canEmbed, getCam, indexableCams } from '@/lib/verotide/cams';
import { JsonLd, breadcrumbList, ORGANIZATION_ID } from '@/components/verotide/JsonLd';
import CamPlayer from '@/components/verotide/CamPlayer';
import CamConditions from '@/components/verotide/CamConditions';
import CamCredit from '@/components/verotide/CamCredit';

// Only pre-render pages for indexable cams. Any other slug is a 404 (dynamicParams = false).
export const dynamicParams = false;
// ISR: the conditions strip is server-rendered, so refresh the page every 5 minutes.
export const revalidate = 300;

export function generateStaticParams() {
  return indexableCams().map((c) => ({ slug: c.slug }));
}

// Next 16: params is a Promise and must be awaited.
type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const cam = getCam(slug);
  if (!cam || !cam.content) return { robots: { index: false, follow: false } };
  const { metaTitle, metaDescription } = cam.content;
  return {
    title: { absolute: metaTitle }, // brand already in the title, skip the layout template
    description: metaDescription,
    alternates: { canonical: `/cams/${cam.slug}` },
    // Safety net: a non-indexable cam must never be indexed, even if someone reaches the route.
    robots: cam.indexable ? undefined : { index: false, follow: false },
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      url: `/cams/${cam.slug}`,
      siteName: 'Verotides',
      type: 'website',
      images: [{ url: '/og_image.png', width: 1200, height: 630, alt: 'Verotides Vero Beach coastal conditions' }],
    },
  };
}

export default async function CamPage({ params }: Props) {
  const { slug } = await params;
  const cam = getCam(slug);
  // Not found, not indexable, no written content, or not embeddable under the licensing rules -> 404.
  // (Link-out cams have no watch page at all.)
  if (!cam || !cam.indexable || !cam.content || !canEmbed(cam)) notFound();
  const c = cam.content;
  const url = `https://verotides.com/cams/${cam.slug}`;

  // Structured data: WebPage + Place + BreadcrumbList + FAQPage (the FAQ is visible below).
  // Deliberately NO VideoObject: this is a third-party still/loop, not footage we own.
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${url}#webpage`,
        name: cam.name,
        description: c.metaDescription,
        url,
        isPartOf: { '@type': 'WebSite', url: 'https://verotides.com' },
        publisher: { '@id': ORGANIZATION_ID },
        breadcrumb: breadcrumbList([
          { name: 'Home', path: '/' },
          { name: 'Cams', path: '/cams' },
          { name: cam.shortName },
        ]),
        about: { '@id': `${url}#place` },
      },
      {
        '@type': 'Place',
        '@id': `${url}#place`,
        name: cam.name,
        geo: { '@type': 'GeoCoordinates', latitude: cam.lat, longitude: cam.lon },
      },
      {
        '@type': 'FAQPage',
        mainEntity: c.faq.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      },
    ],
  };

  // Up to three sibling watch pages for internal linking.
  const others = CAMS.filter((o) => o.indexable && o.slug !== cam.slug);

  return (
    <main className="min-h-screen bg-black p-4 md:p-8">
      <JsonLd data={schema} />
      <div className="max-w-4xl mx-auto space-y-8">
        <nav aria-label="Breadcrumb" className="text-[10px] font-mono uppercase tracking-widest text-white/40">
          <Link href="/" className="hover:text-primary">Home</Link> /{' '}
          <Link href="/cams" className="hover:text-primary">Cams</Link> / {cam.shortName}
        </nav>

        <header>
          <h1 className="text-3xl md:text-5xl font-black glow-text tracking-tighter italic uppercase">{cam.name}</h1>
          <p className="mt-2 text-xs font-mono text-white/50 uppercase tracking-widest">
            Still image or loop from {cam.operator}, refreshed about every {Math.round((cam.refreshSeconds ?? 300) / 60)} minutes
          </p>
        </header>

        {/* Player: facade + fixed aspect box (client component). Only rendered because canEmbed() passed. */}
        <section aria-label="Image viewer" className="space-y-2">
          <CamPlayer
            name={cam.name}
            imageUrl={cam.imageUrl!}
            aspect={cam.aspect ?? '16 / 9'}
            refreshSeconds={cam.refreshSeconds ?? 300}
            operator={cam.operator}
            sourceUrl={cam.sourceUrl}
          />
          <CamCredit cam={cam} />
        </section>

        <CamConditions />

        <section className="font-mono text-sm text-white/80 leading-relaxed space-y-3">
          <h2 className="text-xs font-black text-primary uppercase tracking-widest">&gt; What you&apos;re looking at</h2>
          {c.lookingAt.map((p, i) => <p key={i}>{p}</p>)}
        </section>

        <section className="font-mono text-sm text-white/80 leading-relaxed space-y-3">
          <h2 className="text-xs font-black text-primary uppercase tracking-widest">&gt; How to read it</h2>
          {c.howToRead.map((p, i) => <p key={i}>{p}</p>)}
        </section>

        <section className="font-mono text-sm text-white/80 leading-relaxed space-y-3">
          <h2 className="text-xs font-black text-primary uppercase tracking-widest">&gt; Local notes</h2>
          {c.localNotes.map((p, i) => <p key={i}>{p}</p>)}
        </section>

        {/* FAQ is visible text, which is why FAQPage markup above is allowed. */}
        <section className="font-mono text-sm text-white/80 space-y-4">
          <h2 className="text-xs font-black text-primary uppercase tracking-widest">&gt; FAQ</h2>
          {c.faq.map((f) => (
            <div key={f.q}>
              <h3 className="font-bold text-white">{f.q}</h3>
              <p className="text-white/70">{f.a}</p>
            </div>
          ))}
        </section>

        <section className="font-mono text-xs text-white/60 border-t border-primary/20 pt-4 space-y-2">
          <h2 className="text-xs font-black text-primary uppercase tracking-widest">&gt; Source</h2>
          <p>
            {cam.creditLine}{' '}
            <a href={cam.sourceUrl} target="_blank" rel="noopener noreferrer nofollow" className="text-primary underline">
              {cam.operator}
            </a>
            . Last checked by Verotides on {cam.verified}.
          </p>
          <p>
            More: <Link href="/cams" className="text-primary underline">all cams</Link>
            {others.map((o) => (
              <span key={o.slug}> · <Link href={`/cams/${o.slug}`} className="text-primary underline">{o.shortName}</Link></span>
            ))}
            {' '}· <Link href="/tides" className="text-primary underline">tides</Link> ·{' '}
            <Link href="/weather" className="text-primary underline">beach conditions</Link>
          </p>
        </section>
      </div>
    </main>
  );
}
