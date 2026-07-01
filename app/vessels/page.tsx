import type { Metadata } from 'next';
import VesselsClient from './VesselsClient';

export const metadata: Metadata = {
  title: '🚢 Vero Beach Live Vessel Tracking | AIS Ship Map 🚢',
  description: '【LIVE SHIPS】 Track marine traffic near Vero Beach, FL & the Indian River Lagoon. Real-time AIS ship map, vessel positions, speed vectors, and port arrivals! »»',
  keywords: 'Vero Beach vessel tracking, AIS Vero Beach, ship tracking Indian River, live marine traffic Vero Beach, Vero Beach Inlet vessels, Florida maritime tracking, AIS map Indian River Lagoon',
  alternates: { canonical: 'https://verotides.com/vessels' },
  openGraph: {
    title: '🚢 Vero Beach Live Vessel Tracking | AIS Ship Map | Verotides 🚢',
    description: 'Real-time AIS ship tracking for Vero Beach, FL and the Indian River Lagoon. Live positions. 【LIVE】',
    url: 'https://verotides.com/vessels',
  },
};

const schema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "Vero Beach Live Vessel Tracking",
  "description": "Real-time AIS vessel positions for Vero Beach, FL — Indian River Lagoon, Vero Beach Inlet, and nearby Atlantic waters.",
  "url": "https://verotides.com/vessels",
  "isPartOf": { "@type": "WebSite", "url": "https://verotides.com" },
  "breadcrumb": {
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://verotides.com"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Vessel Tracking",
        "item": "https://verotides.com/vessels"
      }
    ]
  },
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
