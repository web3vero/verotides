import type { Metadata, Viewport } from "next";
import Script from 'next/script';
import { Geist, Geist_Mono } from "next/font/google";
import { GoogleAnalytics } from '@next/third-parties/google';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import CookieSentry from '@/components/verotide/CookieSentry';
import CounterIntel from '@/components/verotide/CounterIntel';
import AdSenseLoader from '@/components/verotide/AdSenseLoader';
import SiteNav from '@/components/verotide/SiteNav';
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "🌊 Verotides | Live Vero Beach Tides, AIS Tracking & Weather 🎣",
  description: "Get real-time tides, live AIS vessel tracking, solunar fishing bite times, beach cams, and bridge alerts for Vero Beach, FL. Check the tide now! 【LIVE 🌊 🎣】",
  keywords: "Vero Beach, tides, AIS tracking, solunar, fishing, maritime intelligence, weather, Florida, Indian River Lagoon, 32963, bridge status, beach conditions",
  authors: [{ name: "Verotides", url: "https://verotides.com" }],
  creator: "Verotides",
  publisher: "Verotides",
  category: "coastal utilities, maritime, weather",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Verotides",
  },
  formatDetection: { telephone: false },
  alternates: {
    canonical: "https://verotides.com",
    types: {
      "application/opensearchdescription+xml": "https://verotides.com/opensearch.xml",
    },
  },
  openGraph: {
    title: "🌊 Verotides | Live Vero Beach Tides, AIS Tracking & Weather 🎣",
    description: "Get real-time tides, live AIS vessel tracking, solunar fishing bite times, beach cams, and bridge alerts for Vero Beach, FL. Check the tide now! 【LIVE 🌊 🎣】",
    url: "https://verotides.com",
    siteName: "Verotides",
    images: [
      {
        url: "https://verotides.com/og_image.png",
        width: 1200,
        height: 630,
        alt: "Verotides Coastal Intelligence Hub Terminal",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "🌊 Verotides | Live Vero Beach Tides & Coastal Utilities 🎣",
    description: "Real-time tides, live AIS vessel tracking, solunar charts, beach cams, and bridge alerts for Vero Beach, FL. 【LIVE】",
    images: ["https://verotides.com/og_image.png"],
  },
  other: {
    "fediverse:creator": "@verotides@mastodon.social",
    "google-adsense-account": "ca-pub-9867142833785109",
  },
  verification: {
    google: "U7WI0-wA8XD_y2xKKtm4Ito0SeIiRT9AUKZBOL7MotE",
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  // maximumScale/userScalable removed — blocking zoom violates WCAG 1.4.4 and is a mobile-index negative
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "Verotides",
      "url": "https://verotides.com",
      "description": "Live maritime, weather, tide, and utility data for Vero Beach, FL.",
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://verotides.com/?q={search_term_string}",
        "query-input": "required name=search_term_string"
      },
      "publisher": {
        "@type": "Organization",
        "name": "Verotides",
        "url": "https://verotides.com",
        "logo": {
          "@type": "ImageObject",
          "url": "https://verotides.com/globe.svg",
          "width": 512,
          "height": 512
        },
        "contactPoint": {
          "@type": "ContactPoint",
          "email": "ads@verotides.com",
          "contactType": "customer service"
        }
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "name": "Verotides",
      "description": "Hyper-local coastal intelligence dashboard for Vero Beach, FL. Live tides, AIS vessel tracking, solunar fishing charts, weather, and bridge status.",
      "url": "https://verotides.com",
      "areaServed": {
        "@type": "City",
        "name": "Vero Beach",
        "sameAs": "https://www.wikidata.org/wiki/Q503891"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": 27.6386,
        "longitude": -80.3973
      },
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Vero Beach",
        "addressRegion": "FL",
        "postalCode": "32963",
        "addressCountry": "US"
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "Dataset",
      "name": "Vero Beach Coastal Intelligence",
      "description": "Aggregated real-time dataset for Vero Beach, FL: NOAA tide predictions, NWS weather conditions, AIS maritime vessel positions, solunar fishing tables, and FDOT bridge status.",
      "url": "https://verotides.com",
      "spatialCoverage": {
        "@type": "Place",
        "geo": {
          "@type": "GeoShape",
          "box": "27.4 -80.5 27.9 -80.1"
        },
        "name": "Vero Beach, Indian River County, Florida"
      },
      "temporalCoverage": "2026/..",
      "license": "https://creativecommons.org/licenses/by/4.0/",
      "creator": {
        "@type": "Organization",
        "name": "Verotides"
      },
      "distribution": [
        { "@type": "DataDownload", "encodingFormat": "text/html", "contentUrl": "https://verotides.com" },
        { "@type": "DataDownload", "encodingFormat": "application/xml", "contentUrl": "https://verotides.com/sitemap.xml" }
      ]
    }
  ];

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/* Core structured data — WebSite + LocalBusiness + Dataset */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {/* Speakable schema — signals AI Overviews (SGE) and voice assistants which content to read */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": "Verotides — Vero Beach Coastal Intelligence",
          "speakable": {
            "@type": "SpeakableSpecification",
            "cssSelector": ["h1", "h2", "[data-speakable]"]
          },
          "url": "https://verotides.com"
        }) }} />
        {/* SiteNavigationElement — tells Google about all sections */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SiteNavigationElement",
          "name": ["Tides", "Fishing & Solunar", "Beach Conditions", "Vessel Tracking", "Bridge Status"],
          "url": [
            "https://verotides.com/tides",
            "https://verotides.com/fishing",
            "https://verotides.com/weather",
            "https://verotides.com/vessels",
            "https://verotides.com/bridges"
          ]
        }) }} />
        {/* Speculation Rules API — Chrome 109+: prerender on hover for instant page loads */}
        <script type="speculationrules" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "prerender": [{ "source": "list", "urls": ["/tides", "/fishing", "/weather", "/vessels", "/bridges"] }],
          "prefetch": [{ "source": "document", "eagerness": "moderate" }]
        }) }} />
        {/* Geo meta tags — used by local search engines and geo-targeted indexers */}
        <meta name="geo.region" content="US-FL" />
        <meta name="geo.placename" content="Vero Beach, Florida" />
        <meta name="geo.position" content="27.6386;-80.3973" />
        <meta name="ICBM" content="27.6386, -80.3973" />
        {/* Referrer policy — privacy-safe while preserving analytics */}
        <meta name="referrer" content="strict-origin-when-cross-origin" />
        <AdSenseLoader />
      </head>
      <body className="min-h-full flex flex-col bg-black overflow-x-hidden">
        <SiteNav />
        {children}
        <CookieSentry />
        <CounterIntel />
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID || 'G-X2F05YL2PV'} />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
