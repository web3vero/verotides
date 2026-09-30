import type { Metadata } from 'next';
import WeatherClient from './WeatherClient';
import { breadcrumbList } from '@/components/verotide/JsonLd';

export const metadata: Metadata = {
  // absolute: skip the layout's "%s | Verotides" template because the brand is already in the title.
  title: { absolute: "Vero Beach Surf & Beach Conditions Today | Verotides" },
  description: "Live Vero Beach beach conditions: wave height, wind, water temperature and UV index. NOAA and NWS data updated every 10 minutes.",
  alternates: { canonical: '/weather' },
  openGraph: {
    title: "Vero Beach Surf & Beach Conditions Today | Verotides",
    description: "Live Vero Beach beach conditions: wave height, wind, water temperature and UV index. NOAA and NWS data updated every 10 minutes.",
    url: '/weather',
    siteName: 'Verotides',
    type: 'website',
    // A child openGraph replaces the layout's whole openGraph object, so the image must be repeated here.
    images: [{ url: '/og_image.png', width: 1200, height: 630, alt: 'Verotides Vero Beach coastal conditions' }],
  },
};

const schema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "Vero Beach Beach Conditions",
  "description": "Live wind, wave height, water temperature, UV index, and beach conditions for Vero Beach, FL from NOAA and NWS. Updated every 10 minutes.",
  "url": "https://verotides.com/weather",
  "isPartOf": { "@type": "WebSite", "url": "https://verotides.com" },
  "breadcrumb": breadcrumbList([{ name: "Home", path: "/" }, { name: "Beach Conditions", path: "/weather" }]),
  "about": {
    "@type": "Thing",
    "name": "Beach and ocean conditions",
    "description": "Real-time coastal weather data for Vero Beach including wind, waves, UV, and water temperature"
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
  "provider": [
    { "@type": "Organization", "name": "NOAA", "url": "https://www.noaa.gov" },
    { "@type": "Organization", "name": "National Weather Service", "url": "https://www.weather.gov" }
  ]
};

export default function WeatherPage() {
  return (
    <main className="min-h-screen bg-black p-4 md:p-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <h1 className="text-3xl md:text-5xl font-black glow-text tracking-tighter italic mb-6 uppercase">
        Vero Beach Surf &amp; Beach Conditions Today
      </h1>
      <p className="text-xs font-mono text-white/40 uppercase tracking-widest mb-8">
        Live NOAA · NWS · Wind · Waves · UV · Water temp · 32963 · Updated every 10 min
      </p>
      <WeatherClient />
    </main>
  );
}
