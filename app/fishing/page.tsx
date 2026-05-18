import type { Metadata } from 'next';
import dynamic from 'next/dynamic';

export const metadata: Metadata = {
  title: 'Vero Beach Fishing Times | Solunar Chart & Best Bite Times Today',
  description: "Today's best fishing times for Vero Beach, FL. Solunar major and minor periods, moon phase, and solar transit for Indian River Lagoon and offshore fishing. Updated daily.",
  keywords: 'Vero Beach fishing, solunar chart Vero Beach, best fishing times Vero Beach, bite times Indian River, Florida offshore fishing, moon phase fishing Vero Beach, 32963 fishing forecast',
  alternates: { canonical: 'https://verotides.com/fishing' },
  openGraph: {
    title: "Vero Beach Fishing Times & Solunar Chart — Today's Bite Times | Verotides",
    description: 'Solunar major/minor periods and best bite times for Vero Beach, FL today.',
    url: 'https://verotides.com/fishing',
  },
};

const schema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "Vero Beach Fishing Times & Solunar Chart",
  "description": "Daily solunar major and minor fishing periods, moon phase, and best bite times for Vero Beach, FL and the Indian River Lagoon.",
  "url": "https://verotides.com/fishing",
  "isPartOf": { "@type": "WebSite", "url": "https://verotides.com" },
  "about": [
    { "@type": "Thing", "name": "Solunar fishing theory", "description": "Predictive model for fish activity based on sun and moon positions" },
    { "@type": "Thing", "name": "Recreational fishing", "description": "Fishing in Vero Beach, Indian River Lagoon, and Atlantic Ocean near Vero Beach Inlet" }
  ],
  "spatialCoverage": {
    "@type": "Place",
    "name": "Vero Beach, Florida — Indian River Lagoon",
    "geo": { "@type": "GeoCoordinates", "latitude": 27.6386, "longitude": -80.3973 }
  }
};

const BiteTimesWidget = dynamic(() => import('@/components/verotide/BiteTimesWidget'), { ssr: false });

export default function FishingPage() {
  return (
    <main className="min-h-screen bg-black p-4 md:p-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <h1 className="text-3xl md:text-5xl font-black glow-text tracking-tighter italic mb-6 uppercase">
        Vero Beach Fishing & Solunar
      </h1>
      <p className="text-xs font-mono text-white/40 uppercase tracking-widest mb-8">
        Major &amp; minor bite times · Moon phase · Indian River Lagoon · Updated daily
      </p>
      <BiteTimesWidget />
    </main>
  );
}
