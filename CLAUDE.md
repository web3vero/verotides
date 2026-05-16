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
- Updated documentation (`GEMINI.md`, `README.md`, `MEMORY.md`).

## Handoff / Pending
- Connect GitHub repo to Vercel for deployment.
- Implement address-based GIS routing for the Trash Pickup widget.
- Wait for 3:30 PM user updates.

---
*Note: Always append new activity logs to this file.*
