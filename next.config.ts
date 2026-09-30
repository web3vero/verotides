import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

// Cache policy for files served straight out of /public. These filenames are NOT
// content-hashed (unlike /_next/static/*, which Next already marks immutable), so we
// cannot safely say "immutable forever": if we replace og_image.png in place, browsers
// must eventually pick up the new bytes. One week of freshness plus a week of
// stale-while-revalidate gives repeat visitors zero-revalidation loads while still
// letting updates propagate.
const PUBLIC_ASSET_CACHE =
  "public, max-age=604800, stale-while-revalidate=604800";

const nextConfig: NextConfig = {
  // Don't advertise the framework in an "X-Powered-By: Next.js" header (minor hardening).
  poweredByHeader: false,

  // Canonical host: send www.verotides.com to the apex with a permanent (308) redirect so
  // search engines consolidate link equity on one hostname. The `has` host matcher means
  // this only fires for www requests; apex traffic is untouched. (Vercel's domain settings
  // can do this too; having it in code makes the behavior reviewable and portable.)
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.verotides.com" }],
        destination: "https://verotides.com/:path*",
        permanent: true,
      },
    ];
  },

  // Long-lived caching for static files in /public. All of these were previously served
  // with `max-age=0, must-revalidate`, so every visit re-validated ~800 KB images.
  async headers() {
    return [
      // Everything under /public/images and /public/content (guide photos, etc.)
      { source: "/images/:path*", headers: [{ key: "Cache-Control", value: PUBLIC_ASSET_CACHE }] },
      { source: "/content/:path*", headers: [{ key: "Cache-Control", value: PUBLIC_ASSET_CACHE }] },
      // Root-level static files: og_image.png, twitter_*.png, globe.svg, fonts, etc.
      // The `:file(...)` pattern matches a single path segment ending in these extensions,
      // so it cannot touch routes, /_next/*, sitemap.xml, robots.txt or llms.txt.
      {
        source: "/:file(.+\\.(?:png|jpg|jpeg|webp|avif|gif|svg|ico|woff|woff2))",
        headers: [{ key: "Cache-Control", value: PUBLIC_ASSET_CACHE }],
      },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG || "verotides",
  project: process.env.SENTRY_PROJECT || "verotides-nextjs",
  silent: !process.env.CI,
  widenClientFileUpload: true,
  reactComponentAnnotation: {
    enabled: true,
  },
  tunnelRoute: "/monitoring",
  // hideSourceMaps removed — deprecated/removed in current @sentry/nextjs; client source maps are hidden by default now
  disableLogger: true,
});
