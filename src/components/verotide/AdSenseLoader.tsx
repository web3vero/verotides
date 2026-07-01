'use client';

import Script from 'next/script';

export default function AdSenseLoader() {
  // The AdSense code must be present on the homepage for ownership verification and review bots to crawl.
  // To avoid ads on specific paths/layouts, exclude them within the Google AdSense dashboard.
  return (
    <Script
      strategy="afterInteractive"
      src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9867142833785109"
      crossOrigin="anonymous"
    />
  );
}
