import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getLagoonSnapshot } from '@/lib/verotide/lagoon';
import { JsonLd, breadcrumbList, ORGANIZATION_ID } from '@/components/verotide/JsonLd';
import { LazyMap } from '@/components/verotide/maps/LazyMap';
import RampLagoonBlock from '@/components/verotide/ramps/RampLagoonBlock';
import RampFacts from '@/components/verotide/ramps/RampFacts';
import RampNearbyZones from '@/components/verotide/ramps/RampNearbyZones';
import RampNotices from '@/components/verotide/ramps/RampNotices';
import {
  SITE_URL,
  buildRampNarrative,
  rampDescription,
  rampTitle,
  shortName,
} from '@/lib/verotide/ramps-copy';
import { getRamp, indexableRamps, isIndexable, nearbyZones, rampAnchorId, rampSlug } from '@/lib/verotide/ramps';

// Only ramps that pass the indexability gate are pre-rendered; every other slug is a 404.
export const dynamicParams = false;
// ISR: the lagoon context block is server-rendered, so refresh every 5 minutes.
export const revalidate = 300;
export const maxDuration = 60;

export function generateStaticParams() {
  return indexableRamps().map((r) => ({ slug: rampSlug(r) }));
}

// Next 16: params is a Promise and must be awaited.
type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const ramp = getRamp(slug);
  // Safety net: anything outside the gate must never be indexed even if the route is reached.
  if (!ramp || !isIndexable(ramp)) return { robots: { index: false, follow: false } };
  const title = rampTitle(ramp);
  const description = rampDescription(ramp, nearbyZones(ramp).length);
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: `/boat-ramps/${slug}` },
    openGraph: {
      title,
      description,
      url: `/boat-ramps/${slug}`,
      siteName: 'Verotides',
      type: 'website',
      images: [{ url: '/og_image.png', width: 1200, height: 630, alt: 'Verotides Vero Beach coastal conditions' }],
    },
  };
}

export default async function RampPage({ params }: Props) {
  const { slug } = await params;
  const ramp = getRamp(slug);
  if (!ramp || !isIndexable(ramp)) notFound();

  // ONE lagoon snapshot for this render, shared with the context block.
  const snapshot = await getLagoonSnapshot();

  const url = `${SITE_URL}/boat-ramps/${slug}`;
  const name = shortName(ramp.name);
  const nearby = nearbyZones(ramp);
  const narrative = buildRampNarrative(ramp, nearby);
  // Only the closest few zones are passed to the map (polygons are large); the list shows the same set.
  const mapZones = nearby.slice(0, 8).map((n) => n.zone);

  // Other standalone ramp pages for internal linking (same county first by construction).
  const siblings = indexableRamps().filter((r) => r.id !== ramp.id).slice(0, 6);

  // Place markup: only fields the data actually has. NOT ParkingFacility, NOT LocalBusiness, no ratings.
  // isAccessibleForFree only when the source says no fee. Opening hours are free text, so we omit
  // openingHoursSpecification rather than mis-structure them.
  const place = {
    '@type': 'Place',
    '@id': `${url}#place`,
    name,
    url,
    geo: { '@type': 'GeoCoordinates', latitude: ramp.lat, longitude: ramp.lon },
    ...(ramp.address
      ? {
          address: {
            '@type': 'PostalAddress',
            streetAddress: ramp.address,
            ...(ramp.city ? { addressLocality: ramp.city } : {}),
            addressRegion: 'FL',
            ...(ramp.zip ? { postalCode: ramp.zip } : {}),
            addressCountry: 'US',
          },
        }
      : {}),
    ...(ramp.accessType?.includes('General Public') ? { publicAccess: true } : {}),
    ...(ramp.fee.required === false ? { isAccessibleForFree: true } : {}),
    ...(ramp.phone ? { telephone: ramp.phone } : {}),
  };

  const crumbs = [{ name: 'Home', path: '/' }, { name: 'Boat ramps', path: '/boat-ramps' }, { name }];
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${url}#webpage`,
        name,
        description: rampDescription(ramp, nearby.length),
        url,
        isPartOf: { '@type': 'WebSite', url: SITE_URL },
        publisher: { '@id': ORGANIZATION_ID },
        breadcrumb: breadcrumbList(crumbs),
        about: { '@id': `${url}#place` },
      },
      place,
    ],
  };

  return (
    <main className="min-h-screen bg-black p-4 md:p-8">
      <JsonLd data={schema} />
      <div className="max-w-4xl mx-auto">
        <nav aria-label="Breadcrumb" className="text-[11px] font-mono text-white/50 mb-3">
          <Link href="/" className="underline">Home</Link> &gt;{' '}
          <Link href="/boat-ramps" className="underline">Boat ramps</Link> &gt; {name}
        </nav>

        {/* Exactly one H1 on the page. */}
        <h1 className="text-2xl md:text-5xl font-black glow-text tracking-tighter italic mb-2 uppercase break-words">{name}</h1>
        <p className="text-[11px] font-mono text-white/50 mb-6 uppercase tracking-widest">
          {ramp.city ? `${ramp.city}, ` : ''}{ramp.county} County{ramp.waterbody ? ` | ${ramp.waterbody}` : ''}
        </p>

        {/* Prose composed from the ramp's own data fields (see buildRampNarrative). */}
        <section aria-labelledby="about-h" className="font-mono text-sm text-white/80 leading-relaxed space-y-3 mb-6">
          <h2 id="about-h" className="text-xs font-black text-primary uppercase tracking-widest">&gt; About this ramp</h2>
          {narrative.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </section>

        <section aria-labelledby="facts-h" className="terminal-box border border-primary/20 bg-black/60 rounded-xl p-4 mb-6">
          <h2 id="facts-h" className="text-xs font-black text-primary uppercase tracking-widest mb-3 font-mono">&gt; Facts from the FWC inventory</h2>
          <RampFacts ramp={ramp} />
          <p className="mt-3 text-[11px] font-mono text-white/50">
            Blank fields are shown as &quot;not confirmed&quot;.{' '}
            {ramp.url && (
              <a href={ramp.url} rel="noopener noreferrer nofollow" className="underline">Operator page</a>
            )}
            {ramp.url ? ' | ' : ''}
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${ramp.lat},${ramp.lon}`}
              rel="noopener noreferrer nofollow"
              className="underline"
            >
              Open the recorded point in Maps
            </a>
          </p>
        </section>

        <RampLagoonBlock snapshot={snapshot} />

        <RampNearbyZones nearby={nearby} />

        <section aria-labelledby="map-h" className="mb-8">
          <h2 id="map-h" className="text-xs font-black text-primary uppercase tracking-widest mb-3 font-mono">&gt; Map</h2>
          <LazyMap
            ramps={[ramp]}
            zones={mapZones}
            focus={{ lat: ramp.lat, lon: ramp.lon, zoom: 13 }}
            height={360}
            ariaLabel={`Map showing ${name} and nearby manatee zones`}
          />
          <p className="mt-2 text-[11px] font-mono text-white/50">Informational map. Not for navigation.</p>
        </section>

        <section aria-labelledby="more-h" className="font-mono text-sm mb-8">
          <h2 id="more-h" className="text-xs font-black text-primary uppercase tracking-widest mb-3">&gt; More ramps</h2>
          <ul className="space-y-1">
            {siblings.map((r) => (
              <li key={r.id}>
                <Link href={`/boat-ramps/${rampSlug(r)}`} className="underline text-white/80">{shortName(r.name)}</Link>
              </li>
            ))}
            <li>
              <Link href={`/boat-ramps#${rampAnchorId(ramp)}`} className="underline text-primary">All boat ramps, with the full directory</Link>
            </li>
            <li>
              <Link href="/manatee-zones" className="underline text-primary">Manatee zones map</Link>
            </li>
          </ul>
        </section>

        <RampNotices />
      </div>
    </main>
  );
}
