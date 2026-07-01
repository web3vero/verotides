import type { Metadata } from 'next';
import WeatherClient from './WeatherClient';

export const metadata: Metadata = {
  title: '🏖️ Vero Beach Beach Conditions | Wind, Waves & Ocean Report 🏖️',
  description: '【LIVE WEATHER】 Real-time wind speed, wave heights, water temperature, and UV index for Vero Beach, FL. NOAA & NWS reports updated every 10 minutes! »»',
  keywords: 'Vero Beach beach conditions, Vero Beach weather, ocean conditions Vero Beach, surf report Vero Beach, wind Vero Beach FL, wave height Atlantic Florida, NWS Vero Beach, beach report 32963',
  alternates: { canonical: 'https://verotides.com/weather' },
  openGraph: {
    title: '🏖️ Vero Beach Live Beach Conditions — Wind, Waves & Ocean | Verotides 🏖️',
    description: 'Real-time wind, waves, UV, and water temperature for Vero Beach, FL. NOAA & NWS reports updated every 10 minutes! 【LIVE】',
    url: 'https://verotides.com/weather',
  },
};

const schema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "Vero Beach Beach Conditions",
  "description": "Live wind, wave height, water temperature, UV index, and beach conditions for Vero Beach, FL from NOAA and NWS. Updated every 10 minutes.",
  "url": "https://verotides.com/weather",
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
        "name": "Beach Conditions",
        "item": "https://verotides.com/weather"
      }
    ]
  },
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
        Vero Beach Beach Conditions
      </h1>
      <p className="text-xs font-mono text-white/40 uppercase tracking-widest mb-8">
        Live NOAA · NWS · Wind · Waves · UV · Water temp · 32963 · Updated every 10 min
      </p>
      <WeatherClient />
    </main>
  );
}
