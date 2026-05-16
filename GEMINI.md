# Verotides | Strategic Project Hub

## Core Mandates
- **Primary Domain:** `verotides.com` (Confirmed).
- **Identity:** Centralized command for Mike Foley's "Mad Lab" operations.
- **Workflow:** Research -> Strategy -> Execution.
- **Claude Continuity:** ALWAYS append notes to `CLAUDE.md` summarizing the work done in each session for persistent context.
- **Security:** Strict protection of .env and .git resources.

## Project Scope
- [x] Incorporate research from Claude share link 2b75e8d0-92ed-4797-b777-4ec2ed5a2cd4
- [x] Configure `verotides.com` infrastructure (scaffolded).
- [x] Initialize Vero Beach Utility Hub.
- [x] Tide API proxy — live and fixed (`&interval=hilo` added)
- [x] Weather API proxy — live (NWS returning real data)
- [x] Solunar — replaced dead solunar.org with local `suncalc` computation, no external dependency
- [x] VisualSentry beach cam — server-side cam proxy at `/api/verotide/cam-proxy` strips X-Frame-Options
- [x] Bridge Grid — updated with real FDOT data; 17th St flagged RESTRICTED (rehab 2023–2028); links to fl511.com
- [x] Trash widget GIS button — removed; replaced with Eddie Hunter / Hunter & Co. contact card
- [ ] Storm Sentry — still hardcoded LEVEL_0, wire to NHC Atlantic RSS feed
- [ ] Deploy current changes to Vercel

## Engineering Standards
- Prioritize local Ollama models for processing.
- Explicit composition and delegation.
- No "just-in-case" logic.

## Site Review — 2026-05-16 (Claude)

Full review of live `verotides.com` deployment. APIs hit directly. Interceptor not available on Scout (Linux); used WebFetch + direct API curl.

### What's Working
- **Weather (BeachSentryWidget)** — NWS `/api/verotide/weather` returning real NWS grid data for MLB/50,78. Live.
- **AIS/VesselSentry** — WebSocket to aisstream.io connects fine client-side. Ghost markers show until real vessels appear. Working as designed.
- **IntelCrawler ticker** — Content tripled intentionally for seamless marquee loop. Fine.
- **UI/Aesthetic** — Terminal CRT look is sharp and consistent. Typography, glow effects, scanlines all render well. Strong identity.
- **SEO infra** — sitemap, robots, JSON-LD, analytics all deployed.

### Bugs Fixed This Session
- **Tide API missing `&interval=hilo`** — `app/api/verotide/tides/route.ts` was calling NOAA without the hilo interval parameter. NOAA returned raw 6-minute readings with no `type` field, so `TideWidget.tsx` never found an H or L entry and always fell back to hardcoded `08:42 AM / 3.2 FT`. Fixed — added `&interval=hilo` to the URL. Now returns proper high/low predictions with type flags.

### Active Bugs (Not Yet Fixed)
- **Solunar API broken** — `solunar.org` returns an error from the Vercel edge. The free endpoint may have changed or requires auth. `BiteTimesWidget` always shows hardcoded fallbacks. Needs a replacement: consider `fishing-forecast.com` API or calculate solunar times directly from lunar ephemeris (there are small JS libs for this).
- **VisualSentry beach cam** — surfguru.com blocks iframe embeds via X-Frame-Options. The `isLoaded` state never truly confirms content and `hasError` only fires on `onerror` which iframes rarely trigger for CORS blocks. Users likely see a blank/loading frame. Options: (1) link directly rather than embed, (2) find an IRC or county beach cam that allows embedding, (3) embed a YouTube live stream of a Vero Beach cam if one exists.
- **Storm Sentry** — Fully hardcoded (`LEVEL_0 / NO_TROPICAL_ACTIVITY_DETECTED`). Not pulling from NHC. Should consume NHC's Atlantic RSS (`https://www.nhc.noaa.gov/index-at.xml`) and parse active named storms. Low effort, high credibility.
- **Bridge Grid** — All three bridges hardcoded `OPEN_CLEAR`. FDOT has a 511 API (`fl511.com`) for real-time traffic/bridge status. Worth wiring if an endpoint exists for IRC bridges.
- **ADDRESS_GIS_QUERY_INJECT button** — Renders in the Trash Routing widget but does nothing. Either implement the IRC GIS address lookup or replace with a direct link to the IRC GIS portal.

### UX Notes
- The hover tooltips are a nice touch but appear above the card on some small elements — can clip off-screen at top. Consider flipping them below when the card is near the top of the viewport.
- `NETWORK_STATUS: INIT` on the AIS map is expected on first load before WebSocket connects — could show `CONNECTING` briefly rather than `INIT` to feel more alive.
- The copyright `© 2026 Verotides_Strategic` is correct (it is 2026). The WebFetch reviewer flagged it as wrong but it's not.
- Mobile: grid collapses correctly to single column. IntelCrawler ticker adapts well.
