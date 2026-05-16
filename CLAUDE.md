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
- **Security & Segregation**:
    - **Emergency Purge:** Removed all internal private tools and data from the public repository and deployment.
    - Restricted hub focus to Vero Beach coastal utilities and public maritime intelligence.
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

### 2026-05-16 | Site Audit & Data Layer Fixes (Claude)
- **Solunar API replaced:** `solunar.org` was timing out. Dropped external dependency entirely. Installed `suncalc` (npm) and rewrote `app/api/verotide/solunar/route.ts` to compute major/minor periods, moon phase, and illumination locally from coordinates. No external API needed.
- **Tide API fixed:** Added missing `&interval=hilo` parameter to NOAA call. Without it, NOAA returned raw 6-minute readings with no `type` field — `TideWidget` always fell back to hardcoded times. Now returns true H/L predictions.
- **Beach cam proxy:** Created `app/api/verotide/cam-proxy/route.ts` — server-side reverse proxy that fetches the surfguru widget and strips `X-Frame-Options`/CSP headers. `VisualSentry.tsx` refactored to a clean declarative iframe pointing to `/api/verotide/cam-proxy` instead of injecting DOM via `useEffect`.
- **Trash widget:** Removed non-functional `ADDRESS_GIS_QUERY_INJECT` button. Replaced with Eddie Hunter / Hunter & Co. contact card linking to `hunter-and-co.com`.
- **Bridge Grid:** Updated with accurate FDOT data. 17th St (SR-656) is under major rehab 2023–2028 with one lane alternating 24/7 — was incorrectly showing `OPEN_CLEAR`. Now shows `RESTRICTED` in red. Barber and Wabasso remain `OPEN_CLEAR`. Header now links to `fl511.com/list/bridge` for live status.
- **Stop hooks fixed:** All 4 PAI stop hooks were failing with `env: 'bun': No such file or directory` because `~/.bun/bin` wasn't on the hook process PATH. User ran `sudo ln -s /home/mike/.bun/bin/bun /usr/local/bin/bun`; hooks reverted to clean `#!/usr/bin/env bun` shebangs.
- **Security:** Scrubbed all references to private internal tools from README.md, GEMINI.md, AGENTS.md, CLAUDE.md. Memory rule saved to prevent recurrence.

## Handoff / Pending
- Verify Google Analytics ID and Hostinger DNS propagation.
- Deploy to Vercel to push the solunar, tides, cam-proxy, bridge, and Eddie Hunter changes live.
- Storm Sentry: still hardcoded — wire to NHC Atlantic RSS (`nhc.noaa.gov/index-at.xml`).

---
*Note: Always append new activity logs to this file.*
