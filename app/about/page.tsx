import type { Metadata } from 'next';
import Link from 'next/link';
import { BreadcrumbJsonLd } from '@/components/verotide/JsonLd';

// Brand-disambiguation page. Google (and people) need one plain page that says what Verotides IS,
// so searches for the name resolve to an information site rather than getting confused with other
// Vero Beach businesses. Keep the wording factual; no restaurant keywords on purpose.
export const metadata: Metadata = {
  title: { absolute: 'About Verotides: Vero Beach Tides, Fishing & Bridge Status' },
  description:
    'Verotides is an independent information website with tide predictions, fishing times, marine weather, vessel tracking and bridge status for Vero Beach, FL.',
  alternates: { canonical: '/about' },
  openGraph: {
    title: 'About Verotides: Vero Beach Tides, Fishing & Bridge Status',
    description:
      'Verotides is an independent information website with tide predictions, fishing times, marine weather, vessel tracking and bridge status for Vero Beach, FL.',
    url: '/about',
    siteName: 'Verotides',
    type: 'website',
    images: [{ url: '/og_image.png', width: 1200, height: 630, alt: 'Verotides Vero Beach coastal conditions' }],
  },
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-black p-4 md:p-8 font-mono text-white/80 leading-relaxed text-sm">
      <BreadcrumbJsonLd trail={[{ name: 'About' }]} />
      <h1 className="text-3xl md:text-5xl font-black glow-text tracking-tighter italic mb-4 uppercase text-white">
        About Verotides
      </h1>

      <div className="flex flex-col gap-6 max-w-4xl">
        <section className="terminal-box p-6 rounded-xl border border-primary/20 bg-black/60">
          <h2 className="text-sm font-black text-primary uppercase tracking-widest mb-3">What this site is</h2>
          <p>
            Verotides (also written Vero Tides, at verotides.com) is an independent information website for
            Vero Beach, Sebastian and the Indian River Lagoon on Florida&apos;s Treasure Coast. It shows tide
            predictions, solunar fishing times, marine and beach weather, vessel traffic, bridge status and
            live imagery such as satellite, radar and offshore buoy views, all in one place.
          </p>
        </section>

        <section className="terminal-box p-6 rounded-xl border border-primary/20 bg-black/60">
          <h2 className="text-sm font-black text-primary uppercase tracking-widest mb-3">Not affiliated with any business</h2>
          <p>
            Verotides is a tide, fishing and conditions resource. It is not a restaurant, bar or hospitality
            business, and it is not affiliated with any business that has a similar name. It does not take
            reservations or orders.
          </p>
        </section>

        <section className="terminal-box p-6 rounded-xl border border-primary/20 bg-black/60">
          <h2 className="text-sm font-black text-primary uppercase tracking-widest mb-3">Where the data comes from</h2>
          <p className="mb-3">
            Tide predictions come from NOAA Tides &amp; Currents (CO-OPS). Forecasts, radar and alerts come from
            the National Weather Service. Satellite imagery is from NOAA/NESDIS (GOES-19), and the offshore buoy
            camera is from NOAA&apos;s National Data Buoy Center. Cameras run by other operators are linked to at
            their own sites, with credit. See the <Link href="/cams" className="text-primary underline">live views page</Link> for
            the full list and source credits.
          </p>
          <p>
            Conditions data is for general reference only. Do not use it as your only source for navigation or
            safety decisions. Always check official marine forecasts and local notices before heading out.
          </p>
        </section>

        <section className="terminal-box p-6 rounded-xl border border-primary/20 bg-black/60">
          <h2 className="text-sm font-black text-primary uppercase tracking-widest mb-3">Contact</h2>
          <p>
            Questions, corrections or data-source suggestions: ads@verotides.com. Also see our{' '}
            <Link href="/privacy" className="text-primary underline">privacy policy</Link>.
          </p>
        </section>
      </div>
    </main>
  );
}
