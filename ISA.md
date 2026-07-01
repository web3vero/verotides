---
task: "Audit Verotides project state and identify gaps"
project: verotides
effort: E3
effort_source: classifier
phase: verify
progress: 38/38
mode: interactive
started: 2026-05-25T00:00:00Z
updated: 2026-05-25T00:00:00Z
---

## Problem

verotides.com launched 2026-05-16 as a terminal-aesthetic coastal intelligence hub for Vero Beach, FL. One week in, several widgets display hardcoded fallback values rather than live data, the local dev environment lacks `.env.local` (blocking Mapbox and AIS), the Google Analytics ID is a placeholder, and the Storm Sentry widget shows a hardcoded LEVEL_0 regardless of actual NHC Atlantic basin activity. The site looks live but multiple data sources are silent or mocked.

## Vision

Every tile on verotides.com either shows verified live data or clearly surfaces an error state — nothing is silently hardcoded. Mike can open the dev environment, run `bun dev`, and see the same live-data experience as production. The backlog is ranked so the highest-credibility gap gets fixed first.

## Out of Scope

This ISA covers audit and triage only — no implementation work. Building Storm Sentry's NHC RSS integration, wiring a real FDOT bridge API, or building expanded sub-page experiences are out of scope for this run; they belong in follow-on ISAs. Mobile layout and accessibility are not evaluated here.

## Constraints

- Read-only audit; no code changes in this ISA run.
- Secrets must never appear in committed files.
- Verification uses Read, Bash/curl, and Grep — no live browser screenshots required for this audit pass.
- All findings map back to either a specific file+line or an API endpoint.

## Goal

Produce a complete, prioritized assessment of the Verotides project: what is live and working, what is hardcoded or broken, what credentials are missing, what the sub-pages deliver, and what the ranked action list looks like for the next dev session.

## Criteria

### Data Layer — Widget Integrity
- [x] ISC-1: `/api/verotide/tides` response from NOAA contains predictions array with `type: H` and `type: L` fields
- [x] ISC-2: TideWidget renders Next_High and Next_Low from live API data (not always hitting the hardcoded fallback times `08:42 AM / 3.2 FT`)
- [x] ISC-3: `/api/verotide/weather` response from NWS contains `properties.periods[0].temperature` and `windSpeed`
- [x] ISC-4: BeachSentryWidget surface temp and wind velocity come from NWS live data
- [x] ISC-5: `/api/verotide/solunar` returns computed `majorPeriods` and `minorPeriods` arrays using `suncalc` (no external API dependency)
- [x] ISC-6: BiteTimesWidget fallback (`06:30 AM - 08:30 AM`) is only displayed when solunar API errors, not on every load
- [x] ISC-7: Storm Sentry widget reads LEVEL_0 from hardcoded JSX (confirmed: no NHC RSS fetch exists in codebase)
- [x] ISC-8: Red Tide status reads "CLEARED" from hardcoded JSX (confirmed: no FWC API call) — NOTE: `stations.ts` has orphaned `FWC_REGIONS` constant proving this was planned
- [x] ISC-9: Turtle nesting status reads "Active_Season" from hardcoded JSX (confirmed: not date-driven)
- [x] ISC-10: Hurricane Season Active banner is hardcoded and shows regardless of calendar date (Jun 1–Nov 30 not enforced at runtime)
- [x] ISC-11: Bridge Grid Barber (SR_60) status is hardcoded `OPEN_CLEAR` in VeroDashboard.tsx JSX array
- [x] ISC-12: Bridge Grid Wabasso (CR_510) status is hardcoded `OPEN_CLEAR` in VeroDashboard.tsx JSX array
- [x] ISC-13: IntelCrawler reads content from `src/data/verotide/node_intelligence.json` (static JSON, no live feed)
- [x] ISC-14: VisualSentry embeds ipcamlive.com directly via iframe (no cam-proxy route used in component)

### Environment and Credentials
- [x] ISC-15: `.env.local` file is absent from the Verotides project directory
- [x] ISC-16: `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` is not set — VesselSentry map will not initialize on local dev
- [x] ISC-17: `NEXT_PUBLIC_AIS_KEY` is not set — VesselSentry will show `KEY_ERR` state on local dev
- [x] ISC-18: `NEXT_PUBLIC_GA_ID` is absent — Google Analytics falls back to placeholder `G-XXXXXXXXXX` in layout.tsx
- [x] ISC-19: VesselSentry contains correct AIS bounding box format `[[lat,lng],[lat,lng]]` for AISStream subscription

### Subpage Completeness
- [x] ISC-20: `/tides/page.tsx` exists with full metadata + JSON-LD and delegates to `TidesClient`
- [x] ISC-21: `/fishing/page.tsx` exists with full metadata + JSON-LD and delegates to `FishingClient`
- [x] ISC-22: `/weather/page.tsx` exists with full metadata + JSON-LD and delegates to `WeatherClient`
- [x] ISC-23: `/vessels/page.tsx` exists with full metadata + JSON-LD and delegates to `VesselsClient`
- [x] ISC-24: `/bridges/page.tsx` exists as fully SSR page with hardcoded bridge data and JSON-LD SpecialAnnouncement
- [x] ISC-25: All `*Client.tsx` wrappers are intentionally thin (8-line dynamic import pattern with `ssr: false`)
- [x] ISC-26: Sub-pages each surface the same single widget from the main dashboard (no expanded standalone experience)

### API Routes
- [x] ISC-27: `/api/verotide/tides/route.ts` includes `&interval=hilo` parameter in NOAA URL
- [x] ISC-28: `/api/verotide/solunar/route.ts` imports `suncalc` and has no external HTTP fetch
- [x] ISC-29: `/api/verotide/trash/route.ts` returns placeholder JSON with ESRI GIS note (non-functional, not user-facing)
- [x] ISC-30: `/api/verotide/cam-proxy/route.ts` exists but VisualSentry does NOT use it (direct ipcamlive embed instead) — dead code

### SEO / Analytics
- [x] ISC-31: `app/sitemap.ts` and `app/robots.ts` exist and compile
- [x] ISC-32: `app/layout.tsx` contains three JSON-LD schemas: WebSite, LocalBusiness, Dataset
- [x] ISC-33: `@vercel/analytics` and `@vercel/speed-insights` are wired in layout.tsx
- [x] ISC-34: `public/ai.txt` exists for LLM crawler context

### Build / Deploy
- [x] ISC-35: `package.json` specifies Next.js 16.2.6 and React 19.2.4
- [x] ISC-36: Git remote points to `web3vero/verotides`

### Anti-criteria
- [x] ISC-37: Anti: No private API keys, tokens, or personal data appear in any committed file — PASS (only `process.env.*` references in VesselSentry.tsx)
- [x] ISC-38: Anti: Storm Sentry does NOT silently claim live data — PASS (no LIVE badge on Storm Sentry, though the NHC link suggests live awareness)

## Features

| name | description | satisfies | depends_on | parallelizable |
|------|-------------|-----------|------------|----------------|
| data-integrity-audit | Verify each widget's live vs hardcoded data status | ISC-1 through ISC-14 | none | false |
| env-audit | Confirm env var state locally and identify what's missing | ISC-15 through ISC-19 | none | true |
| subpage-audit | Read all 5 sub-pages and client wrappers for completeness | ISC-20 through ISC-26 | none | true |
| api-route-audit | Inspect each API route for correctness and live status | ISC-27 through ISC-30 | data-integrity-audit | false |
| seo-analytics-audit | Verify SEO schemas, analytics wiring, and GA ID state | ISC-31 through ISC-34 | none | true |
| deploy-infra-audit | Confirm build config, git remote, Vercel linkage | ISC-35 through ISC-36 | none | true |
| security-check | Confirm no secrets in repo; Storm Sentry honesty check | ISC-37 through ISC-38 | env-audit | false |

## Test Strategy

| isc | type | check | threshold | tool |
|-----|------|-------|-----------|------|
| ISC-1 | API | curl /api/verotide/tides and grep for `"type":"H"` | present | Bash curl + grep |
| ISC-2 | code | Read TideWidget.tsx, confirm fallback only on `error` branch | fallback guarded | Read |
| ISC-3 | API | curl /api/verotide/weather, grep `temperature` | present | Bash curl + grep |
| ISC-4 | code | Read BeachSentryWidget.tsx, confirm fallback on error only | fallback guarded | Read |
| ISC-5 | code | Read solunar/route.ts, confirm `import suncalc` and no `fetch()` to external URL | suncalc imported, no external fetch | Read + Grep |
| ISC-6 | code | Read BiteTimesWidget.tsx, confirm fallback in error branch | fallback guarded | Read |
| ISC-7 | code | Grep codebase for NHC RSS fetch (`nhc.noaa.gov`) | NOT found | Grep |
| ISC-8 | code | Grep for FWC API call or dynamic red tide value | NOT found | Grep |
| ISC-9 | code | Read BeachSentryWidget.tsx, find `CLEARED` as hardcoded string | hardcoded present | Read |
| ISC-10 | code | Read VeroDashboard.tsx, find hurricane season banner as static JSX | hardcoded present | Read |
| ISC-11 | code | Read VeroDashboard.tsx bridge array, find `Barber` with `OPEN_CLEAR` | hardcoded | Read |
| ISC-12 | code | Read VeroDashboard.tsx bridge array, find `Wabasso` with `OPEN_CLEAR` | hardcoded | Read |
| ISC-13 | code | Read IntelCrawler.tsx, confirm import from local JSON | local import | Read |
| ISC-14 | code | Read VisualSentry.tsx, confirm direct ipcamlive URL not cam-proxy | direct URL | Read |
| ISC-15 | filesystem | `ls .env.local` in Verotides dir | MISSING | Bash |
| ISC-16 | env | Grep .env.local for MAPBOX token | absent (file missing) | Bash |
| ISC-17 | env | Grep .env.local for AIS_KEY | absent (file missing) | Bash |
| ISC-18 | code | Grep layout.tsx for GA placeholder `G-XXXXXXXXXX` | present | Grep |
| ISC-19 | code | Read VesselSentry.tsx, confirm VERO_BBOX format | [[lat,lng],[lat,lng]] | Read |
| ISC-20 | filesystem | Read app/tides/page.tsx, confirm metadata + TidesClient | full | Read |
| ISC-21 | filesystem | Read app/fishing/page.tsx, confirm metadata + FishingClient | full | Read |
| ISC-22 | filesystem | Read app/weather/page.tsx, confirm metadata + WeatherClient | full | Read |
| ISC-23 | filesystem | Read app/vessels/page.tsx, confirm metadata + VesselsClient | full | Read |
| ISC-24 | filesystem | Read app/bridges/page.tsx, confirm SSR + hardcoded data | SSR, full | Read |
| ISC-25 | code | Read any *Client.tsx, confirm ~8 lines, dynamic import pattern | thin wrapper | Read |
| ISC-26 | code | Read any *Client.tsx, confirm single-widget import, no expanded UI | single widget | Read |
| ISC-27 | code | Grep tides/route.ts for `interval=hilo` | present | Grep |
| ISC-28 | code | Read solunar/route.ts, confirm no fetch() to external URL | no external fetch | Read |
| ISC-29 | code | Read trash/route.ts, confirm placeholder response | placeholder | Read |
| ISC-30 | code | Read VisualSentry.tsx, confirm src= direct ipcamlive, not /api/verotide/cam-proxy | direct | Read |
| ISC-31 | filesystem | `ls app/sitemap.ts app/robots.ts` | both present | Bash |
| ISC-32 | code | Read layout.tsx, grep for WebSite, LocalBusiness, Dataset JSON-LD types | all three | Grep |
| ISC-33 | code | Read layout.tsx, grep for Analytics and SpeedInsights imports | present | Grep |
| ISC-34 | filesystem | `ls public/ai.txt` | present | Bash |
| ISC-35 | code | Read package.json, grep next version | 16.2.6 | Read |
| ISC-36 | code | `git remote -v` | web3vero/verotides | Bash |
| ISC-37 | security | `grep -r "MAPBOX\|AIS_KEY\|VERCEL_TOKEN" --include="*.ts" --include="*.tsx" --exclude-dir=".git"` | NOT found | Grep |
| ISC-38 | code | Read Storm Sentry JSX in VeroDashboard.tsx, confirm LEVEL_0 is hardcoded text | hardcoded, no fake-live indicator | Read |
