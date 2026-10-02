import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { GoogleAnalytics } from '@next/third-parties/google';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import CookieSentry from '@/components/verotide/CookieSentry';
import SiteFooter from '@/components/verotide/SiteFooter';
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

// Shared plain-text title/description. The emoji and bracket glyphs that used to live here
// pushed titles past ~65 chars (Google truncates them) and read as spam in the SERP.
const SITE_TITLE = "Vero Beach Tides, Fishing & Bridge Status | Verotides";
const SITE_DESCRIPTION =
  "Live Vero Beach, FL tide predictions, solunar fishing times, marine weather, vessel tracking and bridge status for the Indian River Lagoon. Updated continuously.";

export const metadata: Metadata = {
  // metadataBase lets every page below use relative URLs (canonical: "./")
  metadataBase: new URL("https://verotides.com"),
  // Pages supply a short title; the template appends the brand. `default` is the homepage title.
  title: { default: SITE_TITLE, template: "%s | Verotides" },
  description: SITE_DESCRIPTION,
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
    // "./" resolves against metadataBase + the current route, so each page self-canonicalizes.
    // The old hardcoded "https://verotides.com" told Google every page (e.g. /guides) was the homepage.
    canonical: "./",
  },
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    // No hardcoded og:url here: it was inherited by every route and pointed them all at the homepage.
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
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: ["https://verotides.com/og_image.png"],
  },
  other: {
    "fediverse:creator": "@verotides@mastodon.social",
    "google-adsense-account": "ca-pub-9867142833785109",
  },
  verification: {
    google: "U7WI0-wA8XD_y2xKKtm4Ito0SeIiRT9AUKZBOL7MotE",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      { rel: "icon", url: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { rel: "icon", url: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
    ],
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
  // Sitewide structured data: only entities that are true for EVERY page.
  // Removed: LocalBusiness (no premises, made-up address), Dataset (invalid temporalCoverage,
  // license claim over NOAA/AIS data we don't own), WebPage/SiteNavigationElement (wrong per-route).
  // SearchAction removed too: nothing handles /?q=, so the sitelinks search box could never work.
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://verotides.com/#organization",
        "name": "Verotides",
        // Spelling variants people search for; helps Google tie them to this one entity.
        "alternateName": ["Vero Tides", "VeroTides", "verotides.com"],
        "url": "https://verotides.com",
        "logo": "https://verotides.com/twitter_pfp.png",
        "description": "Independent Vero Beach, FL information site: tide predictions, fishing times, marine weather, vessel tracking and bridge status.",
        "areaServed": { "@type": "City", "name": "Vero Beach" },
        // Only list profiles that are confirmed live; add Mastodon/YouTube/etc. here once verified.
        "sameAs": ["https://x.com/Vero_Tides"],
        "contactPoint": {
          "@type": "ContactPoint",
          "email": "ads@verotides.com",
          "contactType": "customer service"
        }
      },
      {
        "@type": "WebSite",
        "@id": "https://verotides.com/#website",
        "name": "Verotides",
        "url": "https://verotides.com",
        "description": "Live tide, fishing, weather, vessel and bridge data for Vero Beach, FL.",
        "inLanguage": "en-US",
        "publisher": { "@id": "https://verotides.com/#organization" }
      }
    ]
  };

  return (
    <html
      lang="en-US"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/* Core structured data — Organization + WebSite */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {/* Speculation Rules API — Chrome 109+: prerender on hover for instant page loads */}
        <script type="speculationrules" dangerouslySetInnerHTML={{ __html: JSON.stringify({
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
        {/* Server-rendered footer: gives every page a crawlable link to /guides and /privacy */}
        <SiteFooter />
        <CookieSentry />
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID || 'G-X2F05YL2PV'} />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
