import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { GoogleAnalytics } from '@next/third-parties/google';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
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
  title: "Verotides | Coastal Intelligence & Utilities",
  description: "Live maritime, weather, and utility data for Vero Beach, FL. A Mad Lab project.",
  keywords: "Vero Beach, tides, AIS tracking, solunar, fishing, maritime intelligence, weather, Florida",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Verotides",
    "url": "https://verotides.com",
    "description": "Live maritime, weather, and utility data for Vero Beach, FL.",
    "publisher": {
      "@type": "Organization",
      "name": "Verotides Strategic",
      "logo": {
        "@type": "ImageObject",
        "url": "https://verotides.com/globe.svg"
      }
    }
  };

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        {children}
        {/* Placeholder GA Measurement ID. Update in production .env */}
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID || 'G-XXXXXXXXXX'} />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
