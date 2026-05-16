# Verotides.com | Operations Log for Claude

## Project Overview
- **Primary Domain:** verotides.com
- **Identity:** Mike Foley's "Mad Lab" command center.
- **Stack:** Next.js 14, Tailwind CSS, Vercel.

## Activity Log

### 2026-05-16 | Project Launch (Nova Sparks)
- Scaffolded Next.js app in `/home/mike/Projects/Verotides`.
- Configured project identifier as `verotides`.
- Established plural domain focus (`verotides.com`).
- Implemented **TWAAI UNLOCKED**:
    - Created `src/data/twaai/entries.json` with 64 entries across 8 domains.
    - Built `SearchEngine.tsx` component with terminal/CRT aesthetic.
- Implemented **Visual Sentry Upgrade**:
    - Hard-wired the **Wabasso Beach Cam** using the official Surf Guru widget (140) via dynamic script injection.
    - Optimized the feed grid to focus on the primary active node while labeling secondary nodes as 'ENCRYPTED/OFFLINE' per user directive.
    - Retained high-contrast CRT styling for the live stream container.
- Implemented **Live AIS Integration**:
    - Secured `aisstream.io` API key and stored in `.env.local`.
    - Upgraded `VesselSentry.tsx` with real-time WebSocket stream for Vero Beach area.
    - Optimized marker rendering and connection state handling.
- Refactored **Dashboard Architecture**:
    - Decoupled widgets into standalone components (`TideWidget`, `BiteTimesWidget`, `BeachSentryWidget`).
    - Integrated `useSWR` for reactive, cached, and auto-refreshing data streams.
    - Connected widgets to API proxies for NOAA, NWS, and Solunar data.
- Installed dependencies: `lucide-react`, `mapbox-gl`, `swr`.
- **SEO & Monetization Upgrade**:
    - Installed `@next/third-parties/google`, `@vercel/analytics`, and `@vercel/speed-insights`.
    - Injected `JSON-LD` structured data into `app/layout.tsx`.
    - Generated dynamic `sitemap.ts` and `robots.ts` for Google indexing.
    - Created `public/ai.txt` to provide context for LLM crawlers.
    - **Aggressive Cookie Campaign:** 
        - Built `CookieSentry.tsx` to enforce session persistence and high-value user tracking.
        - Integrated `cookies-next` for 400-day tactical consent storage and visitor fingerprinting.
        - Enabled Vercel Speed Insights and Core Web Vitals for performance-based ad-tiering prep.
    - **Counter-Intelligence:** 
        - Built `CounterIntel.tsx` to intercept right-click events and display a humorous terminal warning ("WE KNOW WHAT YOU ARE TRYING TO DO ;)").
- **Deployment & Infrastructure**:
    - Pushed source code to GitHub: `web3vero/verotides`.
    - Deployed to Vercel: `verotides.vercel.app`.
    - Linked domain `verotides.com` in Vercel. 
    - **Hostinger DNS Repoint (Success):** Successfully updated A and CNAME records via API using new key (`lfh3...9b1`). Domain is now pointing to Vercel edge.

## Handoff / Pending
- Verify Google Analytics ID and Hostinger DNS propagation.


---
*Note: Always append new activity logs to this file.*
