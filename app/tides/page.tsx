import type { Metadata } from 'next';
import TidesClient from './TidesClient';

export const metadata: Metadata = {
  title: 'Vero Beach Tide Chart | Live NOAA Tide Predictions 32963',
  description: 'Live tide predictions for Vero Beach, FL (32963). High and low tide times, heights, and NOAA tide chart for the Indian River Lagoon and Atlantic coast. Updated every 5 minutes.',
  keywords: 'Vero Beach tides, tide chart Vero Beach, Indian River tide times, 32963 tide predictions, NOAA Vero Beach, Florida tide chart, high tide low tide Vero Beach',
  alternates: { canonical: 'https://verotides.com/tides' },
  openGraph: {
    title: 'Vero Beach Tide Predictions — Live NOAA Chart | Verotides',
    description: 'Live NOAA tide chart for Vero Beach, FL. High/low tide times updated every 5 minutes.',
    url: 'https://verotides.com/tides',
  },
};

const schema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "Vero Beach Tide Chart",
  "description": "Live NOAA tide predictions for Vero Beach, FL (32963) — high and low tide times and heights for the Indian River Lagoon and Atlantic coast.",
  "url": "https://verotides.com/tides",
  "isPartOf": { "@type": "WebSite", "url": "https://verotides.com" },
  "about": {
    "@type": "Thing",
    "name": "Tidal data",
    "description": "NOAA tide gauge predictions for Vero Beach, Indian River County, Florida"
  },
  "spatialCoverage": {
    "@type": "Place",
    "name": "Vero Beach, Florida",
    "geo": { "@type": "GeoCoordinates", "latitude": 27.6386, "longitude": -80.3973 },
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Vero Beach",
      "addressRegion": "FL",
      "postalCode": "32963",
      "addressCountry": "US"
    }
  },
  "provider": { "@type": "Organization", "name": "NOAA", "url": "https://tidesandcurrents.noaa.gov" }
};

export default function TidesPage() {
  return (
    <main className="min-h-screen bg-black p-4 md:p-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <h1 className="text-3xl md:text-5xl font-black glow-text tracking-tighter italic mb-6 uppercase">
        Vero Beach Tide Chart
      </h1>
      <p className="text-xs font-mono text-white/40 uppercase tracking-widest mb-8">
        Live NOAA predictions · Indian River County · Sector 32963
      </p>
      <TidesClient />
    </main>
  );
}
