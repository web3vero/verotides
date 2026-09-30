import type { Metadata } from 'next';
import VesselsClient from './VesselsClient';
import { breadcrumbList } from '@/components/verotide/JsonLd';

export const metadata: Metadata = {
  // absolute: skip the layout's "%s | Verotides" template because the brand is already in the title.
  title: { absolute: "Vero Beach Vessel Tracker: Live AIS Boat Map | Verotides" },
  description: "Live AIS map of boats and ships near Vero Beach, FL and the Indian River Lagoon. Vessel positions, speed and heading.",
  alternates: { canonical: '/vessels' },
  openGraph: {
    title: "Vero Beach Vessel Tracker: Live AIS Boat Map | Verotides",
    description: "Live AIS map of boats and ships near Vero Beach, FL and the Indian River Lagoon. Vessel positions, speed and heading.",
    url: '/vessels',
    siteName: 'Verotides',
    type: 'website',
    // A child openGraph replaces the layout's whole openGraph object, so the image must be repeated here.
    images: [{ url: '/og_image.png', width: 1200, height: 630, alt: 'Verotides Vero Beach coastal conditions' }],
  },
};

const schema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "Vero Beach Live Vessel Tracking",
  "description": "Real-time AIS vessel positions for Vero Beach, FL — Indian River Lagoon, Vero Beach Inlet, and nearby Atlantic waters.",
  "url": "https://verotides.com/vessels",
  "isPartOf": { "@type": "WebSite", "url": "https://verotides.com" },
  "breadcrumb": breadcrumbList([{ name: "Home", path: "/" }, { name: "Vessel Tracking", path: "/vessels" }]),
  "about": {
    "@type": "Thing",
    "name": "AIS maritime vessel tracking",
    "description": "Automatic Identification System real-time ship position data for the Vero Beach coastal area"
  },
  "spatialCoverage": {
    "@type": "Place",
    "name": "Vero Beach Inlet & Indian River Lagoon, Florida",
    "geo": {
      "@type": "GeoShape",
      "box": "27.4 -80.5 27.9 -80.1"
    }
  },
  "provider": { "@type": "Organization", "name": "AISStream.io", "url": "https://aisstream.io" }
};

export default function VesselsPage() {
  return (
    <main className="min-h-screen bg-black p-4 md:p-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <h1 className="text-3xl md:text-5xl font-black glow-text tracking-tighter italic mb-6 uppercase">
        Vero Beach Vessel Tracking
      </h1>
      <p className="text-xs font-mono text-white/40 uppercase tracking-widest mb-8">
        Live AIS · Indian River Lagoon · Vero Beach Inlet · Real-time maritime positions
      </p>
      <VesselsClient />
    </main>
  );
}
