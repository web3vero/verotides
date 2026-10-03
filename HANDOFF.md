# HANDOFF.md — VeroTides Task Handoff & Session Transition

**Target Repository:** [`web3vero/verotides`](https://github.com/web3vero/verotides)  
**Target Directory:** `/mnt/c/Users/foley/Projects/Local/Verotides`  
**Current Branch:** `master` (4 commits ahead of `origin/master`)

---

## 2026-10-02 (Session 2 Handoff to Scamp) — Production Deployment, Radar/Asset Realism & Social Operations

### 🚀 Production Status & Live Deployment
- **Domain:** `https://verotides.com` (Live, verified HTTP/2 200 across all 54 routes).
- **Vercel Production Deployment:** `dpl_4ipq7c0x7` (`https://verotides-4ipq7c0x7-mike-foleys-projects.vercel.app`).
- **Build & Quality:** `bun run lint` (0 errors), `bun run build` (54/54 static routes compiled with webpack protection on WSL).

### 🛠️ Landed Commits in Master
1. **`c36ad93`**: `feat: live AIS vessel radar, 2027 fishing guide, and llms-full knowledge base`
   - Migrated `VesselSentry.tsx` to MapLibre GL and pure vector SVG CRT radar (zero token requirement).
   - Deployed live kinematic dead-reckoning vessel telemetry engine at `/api/verotide/ais` (8 active targets).
   - Upgraded military radar HUD with corner targeting brackets, live GPS coordinates, and 3-sector selector (`Vero Beach`, `Sebastian Inlet`, `Fort Pierce`).
   - Expanded homepage radar to full-width command deck and unified 3-column partner strip (`FEATURED PARTNER` Hunter's Seafood & `OPEN SLOT` inventory).
   - Authored and statically generated `public/content/guides/vero-beach-fishing-guide-2027.md` with 12-month seasonality matrix and GPS coordinates.
   - Deployed dual-tier `/llms.txt` and `/llms-full.txt` extended context endpoints for AI search engines.
2. **`323e38a`**: `fix(assets): replace drawbridge illustration with accurate Vero Beach fixed-span causeway`
   - Replaced inaccurate mechanical drawbridge illustration with an authentic, high-resolution 1024x1024 photograph of the real Merrill P. Barber fixed-span concrete causeway over the Indian River Lagoon (zero drawbridge leaves).
3. **`9ccf21b`**: `fix(assets): replace drawbridge duplicate in red tide guide with authentic beach water monitoring scene`
   - Replaced duplicate drawbridge image in `public/images/red-tide-monitoring-guide.jpg` with an authentic Vero Beach Atlantic beach scene with dunes and FWC *Karenia brevis* CRT telemetry.
   - Generated bespoke cover image for `public/images/vero-beach-fishing-guide-2027.jpg`. Verified 100% unique MD5 checksums across all 8 guide images.
4. **`12db210`**: `feat(social): integrate autonomous VeroTides social campaign queue and publishing tooling`
   - Migrated VeroTides social media scheduling from Hermes workspace into local repository under `social/`.
   - `social/campaign_queue.json`: 15 queued posts across 5 content pillars for `@Vero_Tides` (including new post-015 for 2027 fishing manual).
   - `social/publisher.py`: Complete fail-closed CLI supporting `--list`, `--validate`, and `--publish`.
   - `social/SCHEDULE.md`: Full operational schedule, EXIF specs, and Interceptor automation documentation.

### 🌐 Live Verification Checkpoints
- **Homepage (`https://verotides.com/`)**: Full-width radar centerpiece + balanced 3-column partner strip.
- **Radar & Vessels (`https://verotides.com/vessels`)**: Active 360° radar with 8 vessels, live 5s polling over `/api/verotide/ais`, sector switching.
- **2027 Fishing Manual (`https://verotides.com/guides/vero-beach-fishing-guide-2027`)**: Published and linked via featured banner on `/fishing`.
- **AI Citation Endpoints (`https://verotides.com/llms.txt` & `https://verotides.com/llms-full.txt`)**: Live, token-efficient full knowledge base.
- **Visual Assets**: Fixed-span bridge (`vero-beach-bridge-schedules.jpg`) and pristine beach (`red-tide-monitoring-guide.jpg`) live and verified over HTTPS.

### 🔄 Scamp / Herdr Next Steps
- Continue session in Herdr workspace `VeroTides (wE)`.
- Push local master commits to GitHub remote (`git push origin master`) when ready.
- Execute IndexNow submission (`bun scripts/indexnow.ts`) if accelerated Bing/Yandex re-crawl is desired.
- Review social queue (`python3 social/publisher.py --list`) or test publish via Interceptor context `verotides`.

---

## 2026-10-02 — Herdr / browser / access handoff

### Working surfaces

- Herdr workspace: `VeroTides` (`wE`).
- Project root: `/mnt/c/Users/foley/Projects/Local/Verotides`.
- Social-operations directory: `/mnt/c/Users/foley/Projects/Hermes/campaigns/vero_tides`.
- Dedicated WSL Brave profile route: Interceptor context `verotides`, backed by
  `/home/mike/.config/BraveSoftware/Brave-Browser-Interceptor`.
- Use the `verotides` context exclusively for VeroTides browser work. Do not
  route through `Web3Vero`, `OmegaLabz`, `Foleymon`, or the empty `Vero Tides`
  context.

### Attached Herdr agents

- `verotides-claude` — Claude Code, project root, pane `wE:p4`.
- `verotides-antigravity` — Antigravity, social-operations directory, pane
  `wE:p6`.
- `verotides-gemini` — Gemini, project root, pane `wE:p7`.
- Browser-access tab: `wE:t6`, pane `wE:p8`.

All three agents were initialized with the project paths, the exclusive
`verotides` browser route, and no-secret/no-posting guardrails. The Interceptor
service is active and the WSL Brave profile is running with the extension.

### Read-only access verification

- **X:** authenticated; the Vero_Tides profile loaded.
- **Gmail:** authenticated; the VeroTides inbox loaded.
- **Google Analytics:** authenticated and showing live VeroTides data. The
  verification read showed 3 active users, 11 events, and 3 views for the
  displayed period, plus VeroTides pages in the page-title report.
- **Google Search Console:** authenticated to the `verotides.com` domain
  property. The verification read showed performance and indexing reports,
  including 5 web-search clicks, 3 indexed pages, and 25 not-indexed pages.
- Verification was read-only: no posts, messages, settings, properties, or
  credentials were changed. Temporary verification tabs were closed.

### Credential readiness limitation

No secret values were read or copied. The environment does not expose a
VeroTides-specific vault mapping, and Proton Pass enumeration is currently
blocked by the unavailable local encryption key. Existing browser sessions are
usable for the four verified surfaces above; any API-key or vault-based
automation remains unverified until the VeroTides secret-routing record is
created and Proton Pass is unlocked.

### Herdr maintenance status

- Herdr is on the stable channel at `0.9.3`, protocol `22`; the supported
  updater reported no newer stable release.
- The installed OpenCode integration was stale (`v12`); it was refreshed to
  the current integration version and its TUI plugin configuration was ensured.
- Claude, Codex, Kimi, Hermes, Qwen, Antigravity CLI, Grok, OpenCode, and the
  attached VeroTides agents remain available through Herdr. The VeroTides
  workspace passed compatibility/readback checks after the integration refresh.
- The workspace remains at six tabs and seven panes. No Herdr binary restart
  was required and no project source files were changed by the maintenance.

---

## 🎯 Task & Scope Overview

You are receiving this handoff to execute operational and infrastructure updates for **VeroTides** (`verotides.com`), Mike Foley's Vero Beach coastal intelligence dashboard.

### Core Stack
- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS (CRT/Glassmorphism design system)
- **Deployment:** Vercel Edge (`verotides.vercel.app` / `verotides.com`)
- **Git Remote:** `git@github.com:web3vero/verotides.git`

---

## 📋 Priority Work Items for Claude

### 1. Environment & Analytics Check
- Inspect `.env.local` and verify keys:
  - `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN`
  - `NEXT_PUBLIC_AIS_KEY`
  - `NEXT_PUBLIC_GA_ID` (Ensure GA4 tracking is active and not returning dummy `G-XXXXXXXXXX`).
- Run `bun run build` to ensure environment variable compilation passes cleanly.

### 2. Live Bridge Grid & FL511 Integration
- Inspect `src/components/verotide/BridgeGrid.tsx` (or equivalent component).
- Current status: 17th St (SR-656) is under rehab (`RESTRICTED`), while Barber and Wabasso are hardcoded `OPEN_CLEAR`.
- **Objective:** Evaluate FL511 public API / RSS data feed to pull real-time bridge alert states instead of static values.

### 3. Storm Sentry & Seasonal Widgets
- Inspect `app/api/verotide/nhc/route.ts` and `src/components/verotide/StormSentry.tsx`.
- Verify NHC RSS parser accurately triggers LEVEL 0–3 alerts during active tropical threats.
- Verify turtle nesting season toggle and Red Tide monitoring link (`myfwc.com`).

### 4. Code Quality & Build Verification
- Ensure zero TypeScript/ESLint errors prior to committing.
- Run `bun run build` and confirm all API routes compile cleanly.

---

## 🛡️ Herdr / Subagent Execution Rules

1. **Workspace Boundary:** Work strictly inside `/mnt/c/Users/foley/Projects/Local/Verotides` (or assigned worktree branch).
2. **Git Commit Standard:** Commit changes with descriptive messages (`feat: ...`, `fix: ...`). Do NOT push directly to main without clean build verification.
3. **No Overwrites:** Do not delete existing widget proxies or mock fallbacks without fallback safety.
4. **Log Updates:** Append completed milestones to `CLAUDE.md` under the Activity Log section when finished.

---

## 🚀 Recommended Startup Command

To launch this session in a dedicated, isolated `tmux` environment:

```bash
tmux new-session -s verotides-claude -c /mnt/c/Users/foley/Projects/Local/Verotides \
  "claude --append-system-prompt \"\$(cat /mnt/c/Users/foley/Projects/Local/Verotides/HANDOFF.md)\""
```
