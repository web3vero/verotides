# VeroTides (@Vero_Tides) Social Operations & Publishing Architecture

## Overview
This directory houses the autonomous social media queue, validation safeguards, and publishing tooling for the **`@Vero_Tides`** coastal intelligence profile on X. Formerly maintained in the external Hermes workspace, this operational unit is now integrated directly into the `Verotides` project space.

---

## 1. Brand Identity & Creative Standards

- **Target Account**: `@Vero_Tides`
- **Primary Domain**: `https://verotides.com`
- **Core Aesthetic**: Retro-CRT / Cybernetic Coastal Telemetry / Vero Beach Defense-Grade Command Terminal.
- **Visual Assets**: Every post is paired with a verified 1024x1024 35mm film photograph featuring high-contrast Florida coastal environments (Indian River Lagoon, Atlantic beaches, Sebastian Inlet, Barber Bridge) coupled with vintage green-phosphor CRT telemetry monitors.
- **EXIF Specification**:
  - Target Coordinates: `27.6386° N, 80.3973° W` (Vero Beach South)
  - Copyright: `© 2026 Vero Tides (verotides.com) | Coastal Command`
  - Approved Domain: Only `verotides.com` URLs are permitted in post copy.

---

## 2. The 5 Core Content Pillars & Cadence

| Pillar | Focus | Target Cadence | Example Posts |
|---|---|---|---|
| **1. Tide Dynamics & Intracoastal Telemetry** | Daily high/low predictions, MLLW datums, Intracoastal currents. | Early Morning (06:30–07:30 EST) | `post-005`, `post-010` |
| **2. Vessel Radar & Maritime Command** | Live AIS tracking, inlet choke points, ICW barge and tug traffic. | Mid-day / Weekends | `post-001`, `post-006`, `post-011` |
| **3. Solunar Bite Windows & Fishing Dispatch** | Peak lunar transit feeding periods, major/minor windows, target species. | Pre-Dawn / Dusk | `post-002`, `post-007`, `post-012`, `post-015` |
| **4. Barrier Island 32963 Utility & Bridge Grid** | Barber, 17th St, Wabasso, Sebastian Bridge status + IRC trash schedules. | Morning Commute / Weekends | `post-003`, `post-008`, `post-013` |
| **5. Beach Sentry & Ecological Alerts** | Sea turtle nesting ordinances (Mar–Oct), FWC Red Tide monitoring, ocean surf. | Afternoon / Evening | `post-004`, `post-009`, `post-014` |

---

## 3. Operational CLI Tooling (`social/publisher.py`)

All publishing actions are fail-closed: they validate that the destination link is on `verotides.com`, verify that media exists on disk, type captions line-by-line via Interceptor browser automation, and assert composer DOM state before and after media upload.

### Inspect the Queue
```bash
python3 social/publisher.py --list
```

### Inspect a Specific Post
```bash
python3 social/publisher.py --show post-015
```

### Validate Entire Queue (Pre-Flight Test)
```bash
python3 social/publisher.py --validate
```

### Dry-Run a Post (Simulates payload check without opening browser)
```bash
python3 social/publisher.py --publish post-001 --dry-run
```

### Live Publish a Post via Interceptor (`verotides` context)
```bash
python3 social/publisher.py --publish post-001
```

---

## 4. Safety Guardrails & Rules
1. **Never Post Raw Text IDs**: Validates that post IDs (e.g. `post-001`) are never accidentally injected as copy.
2. **Approved Domain Requirement**: Fails closed if the text does not contain a valid `verotides.com` link.
3. **No External URL Injection**: Disallows self-referential `t.co` or `x.com` permalinks in post text.
4. **Browser Isolation**: Only routes through Interceptor context `verotides`. Never touches personal or non-VeroTides contexts.
