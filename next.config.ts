import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
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
