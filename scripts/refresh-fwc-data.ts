/**
 * refresh-fwc-data.ts
 * ---------------------------------------------------------------------------
 * Rebuilds the two static GIS datasets used by verotides.com:
 *
 *   src/data/manatee-zones.json   FWC state manatee protection (speed) zones
 *   src/data/boat-ramps.json      FWC Florida boat ramp inventory
 *
 * Run:   bun scripts/refresh-fwc-data.ts            (fetch, write, validate)
 *        bun scripts/refresh-fwc-data.ts --dry-run  (fetch + validate, write nothing)
 *        bun scripts/refresh-fwc-data.ts --force    (allow big record-count drops)
 *
 * What it does, in order:
 *   1. Queries each ArcGIS REST layer with an envelope (bounding box) filter,
 *      asking the server for GeoJSON already reprojected to WGS84 (outSR=4326).
 *   2. Clips to our bbox (polygons are geometrically cut; points are filtered).
 *   3. Normalises the cryptic source fields into the typed shapes in
 *      src/lib/verotide/geo-types.ts, keeping the raw source values too.
 *   4. Simplifies polygon geometry (Douglas-Peucker), rounds coordinates to
 *      5 decimals (~1 m) and picks the gentlest tolerance that keeps the
 *      zones file under a size budget.
 *   5. Writes JSON with ONE FEATURE PER LINE and records sorted by their
 *      source ids, so `git diff` after a later refresh shows only real changes.
 *   6. Prints a validation summary (counts, missing data, ramps near towns).
 *
 * Nothing here invents data: if a layer is unreachable or returns nothing the
 * script exits non-zero and leaves the existing JSON untouched.
 */

import { mkdirSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type {
  BBox,
  BoatRamp,
  BoatRampsFile,
  DateWindow,
  ManateeZone,
  ManateeZonesFile,
  Position,
  RampKind,
  SourceLayerMeta,
  ZoneGeometry,
  ZoneSeason,
  ZoneType,
} from "../src/lib/verotide/geo-types";

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

/** Live FWC ArcGIS layers (verified 2026-09-30; both answer f=geojson). */
const ZONES_LAYER =
  "https://gis.myfwc.com/hosting/rest/services/Open_Data/State_Manatee_Protection_Zones_in_Florida/MapServer/9";
const RAMPS_LAYER =
  "https://gis.myfwc.com/mapping/rest/services/Open_Data/FWC_Florida_Boat_Ramp_Inventory/MapServer/4";

/**
 * Clip window [west, south, east, north] in degrees.
 *  - lon -80.65..-80.20 covers the Indian River County mainland edge
 *    (Blue Cypress / Fellsmere) out to the Atlantic coast and Fort Pierce Inlet.
 *  - lat 27.35..27.95 runs from the north edge of Port St. Lucie / Fort Pierce
 *    (south of the Fort Pierce inlet) to just past Sebastian Inlet and the
 *    Brevard County line (the Sebastian River zones straddle that line).
 */
const BBOX: BBox = [-80.65, 27.35, -80.2, 27.95];

/** Output files, resolved relative to this script so cwd does not matter. */
// (import.meta.url works in Bun and typechecks under plain tsc, unlike Bun-only import.meta.dir)
const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const ZONES_OUT = join(REPO_ROOT, "src/data/manatee-zones.json");
const RAMPS_OUT = join(REPO_ROOT, "src/data/boat-ramps.json");

/**
 * Size budget for the zones file. The brief says <300 KB for both files; ramps
 * come out around 40 KB, so zones get the remaining headroom.
 */
const ZONES_BYTE_BUDGET = 230_000;

/** Douglas-Peucker tolerances to try, gentlest first (degrees; 1e-5 deg ~ 1.1 m). */
const SIMPLIFY_LADDER = [0.00002, 0.00004, 0.00007, 0.0001, 0.00015, 0.0002, 0.0003];

const ATTRIBUTION_LINE =
  "Data: Florida Fish and Wildlife Conservation Commission (FWC). Reference only - not legal, survey or navigation data. See src/data/ATTRIBUTION.md.";

const argv = new Set(process.argv.slice(2));
const DRY_RUN = argv.has("--dry-run");
const FORCE = argv.has("--force");

// ---------------------------------------------------------------------------
// Tiny helpers
// ---------------------------------------------------------------------------

/** ArcGIS stores dates as epoch milliseconds; we keep only YYYY-MM-DD. */
function epochToDate(ms: unknown): string | null {
  return typeof ms === "number" && Number.isFinite(ms) ? new Date(ms).toISOString().slice(0, 10) : null;
}

/**
 * Trim a source string and turn the many spellings of "no data" into null so
 * the front end only has one empty value to think about.
 */
function clean(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  if (t === "" || /^(unknown|n\/a|na|none|null)$/i.test(t)) return null;
  return t;
}

/** Round to 5 decimal places (about 1.1 m of latitude). */
const r5 = (n: number): number => Math.round(n * 1e5) / 1e5;

function num(v: unknown): number | null {
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

/** "INDIAN RIVER" -> "Indian River"; the St. Lucie spellings collapse to one. */
function normCounty(raw: unknown): string {
  const s = String(raw ?? "").trim().toUpperCase();
  if (s === "ST LUCIE" || s === "SAINT LUCIE" || s === "ST. LUCIE") return "St. Lucie";
  return s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

/** fetch with a timeout and a couple of retries; layers occasionally hiccup. */
async function fetchJson(url: string, tries = 3): Promise<any> {
  let lastErr: unknown;
  for (let i = 1; i <= tries; i++) {
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": "verotides.com data refresh (contact: foleymon@gmail.com)" },
        signal: AbortSignal.timeout(60_000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      // ArcGIS reports many failures as HTTP 200 with an {error:{...}} body.
      if (json?.error) throw new Error(`ArcGIS error: ${JSON.stringify(json.error)}`);
      return json;
    } catch (e) {
      lastErr = e;
      console.warn(`  fetch attempt ${i}/${tries} failed: ${(e as Error).message}`);
      await new Promise((r) => setTimeout(r, 1500 * i));
    }
  }
  throw new Error(`Giving up on ${url}: ${(lastErr as Error)?.message}`);
}

/**
 * Pull every feature intersecting the bbox as GeoJSON, paging in case a layer
 * ever holds more rows than the server's per-request limit.
 */
async function queryLayer(layerUrl: string, bbox: BBox): Promise<any[]> {
  const out: any[] = [];
  const pageSize = 500;
  for (let offset = 0; ; offset += pageSize) {
    const params = new URLSearchParams({
      where: "1=1",
      geometry: bbox.join(","), // xmin,ymin,xmax,ymax
      geometryType: "esriGeometryEnvelope",
      inSR: "4326",
      spatialRel: "esriSpatialRelIntersects",
      outFields: "*",
      returnGeometry: "true",
      outSR: "4326", // ask the server to reproject to lon/lat for us
      orderByFields: "OBJECTID", // stable order is required for paging
      resultOffset: String(offset),
      resultRecordCount: String(pageSize),
      f: "geojson",
    });
    const page = await fetchJson(`${layerUrl}/query?${params}`);
    const feats: any[] = page.features ?? [];
    out.push(...feats);
    if (feats.length < pageSize) break;
  }
  return out;
}

// ---------------------------------------------------------------------------
// Geometry: clip + simplify
// ---------------------------------------------------------------------------

type Ring = Position[];

/**
 * Sutherland-Hodgman clip of one ring against the (convex, axis-aligned) bbox.
 * It walks the ring four times, once per bbox edge, keeping the part on the
 * inside of that edge and inserting intersection points where edges cross it.
 * Input and output rings are "closed" (last point == first).
 */
function clipRing(ring: Ring, [w, s, e, n]: BBox): Ring {
  // Work on an open ring (drop the duplicated closing vertex).
  let pts: Ring = ring.slice(0, -1);

  // Each edge is described by: is a point inside?, and where does a segment cross it?
  const edges: Array<{
    inside: (p: Position) => boolean;
    cross: (a: Position, b: Position) => Position;
  }> = [
    { inside: (p) => p[0] >= w, cross: (a, b) => [w, a[1] + ((b[1] - a[1]) * (w - a[0])) / (b[0] - a[0])] },
    { inside: (p) => p[0] <= e, cross: (a, b) => [e, a[1] + ((b[1] - a[1]) * (e - a[0])) / (b[0] - a[0])] },
    { inside: (p) => p[1] >= s, cross: (a, b) => [a[0] + ((b[0] - a[0]) * (s - a[1])) / (b[1] - a[1]), s] },
    { inside: (p) => p[1] <= n, cross: (a, b) => [a[0] + ((b[0] - a[0]) * (n - a[1])) / (b[1] - a[1]), n] },
  ];

  for (const edge of edges) {
    if (pts.length === 0) break;
    const next: Ring = [];
    for (let i = 0; i < pts.length; i++) {
      const cur = pts[i];
      const prev = pts[(i + pts.length - 1) % pts.length];
      const curIn = edge.inside(cur);
      const prevIn = edge.inside(prev);
      if (curIn) {
        if (!prevIn) next.push(edge.cross(prev, cur)); // entering: add crossing first
        next.push(cur);
      } else if (prevIn) {
        next.push(edge.cross(prev, cur)); // leaving: add the crossing only
      }
    }
    pts = next;
  }
  if (pts.length < 3) return [];
  return [...pts, pts[0]];
}

/** Absolute area of a ring in square degrees (shoelace formula). */
function ringArea(ring: Ring): number {
  let a = 0;
  for (let i = 0; i < ring.length - 1; i++) {
    a += ring[i][0] * ring[i + 1][1] - ring[i + 1][0] * ring[i][1];
  }
  return Math.abs(a) / 2;
}

/** Perpendicular distance from p to segment a-b (x scaled by cos(lat) so degrees are ~isotropic). */
const COS_LAT = Math.cos((27.65 * Math.PI) / 180);
function segDist(p: Position, a: Position, b: Position): number {
  const px = p[0] * COS_LAT, py = p[1];
  const ax = a[0] * COS_LAT, ay = a[1];
  const bx = b[0] * COS_LAT, by = b[1];
  const dx = bx - ax, dy = by - ay;
  const len2 = dx * dx + dy * dy;
  if (len2 === 0) return Math.hypot(px - ax, py - ay);
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / len2));
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

/** Douglas-Peucker on an OPEN polyline (iterative, so no recursion limits). */
function dpOpen(pts: Position[], tol: number): Position[] {
  if (pts.length <= 2) return pts;
  const keep = new Uint8Array(pts.length);
  keep[0] = keep[pts.length - 1] = 1;
  const stack: Array<[number, number]> = [[0, pts.length - 1]];
  while (stack.length) {
    const [lo, hi] = stack.pop()!;
    let maxD = 0, idx = -1;
    for (let i = lo + 1; i < hi; i++) {
      const d = segDist(pts[i], pts[lo], pts[hi]);
      if (d > maxD) { maxD = d; idx = i; }
    }
    if (idx !== -1 && maxD > tol) {
      keep[idx] = 1;
      stack.push([lo, idx], [idx, hi]);
    }
  }
  return pts.filter((_, i) => keep[i]);
}

/**
 * Simplify a CLOSED ring. Douglas-Peucker needs two fixed anchor points, but a
 * closed ring's first and last points are identical, so we anchor on the first
 * point and the point farthest from it, simplify each half, and rejoin.
 * Returns [] if the result collapses below a valid ring (4 points incl. closure).
 */
function simplifyRing(ring: Ring, tol: number): Ring {
  const open = ring.slice(0, -1);
  if (open.length < 3) return [];
  let far = 1, farD = -1;
  for (let i = 1; i < open.length; i++) {
    const d = Math.hypot((open[i][0] - open[0][0]) * COS_LAT, open[i][1] - open[0][1]);
    if (d > farD) { farD = d; far = i; }
  }
  const half1 = dpOpen(open.slice(0, far + 1), tol);
  const half2 = dpOpen([...open.slice(far), open[0]], tol);
  const merged = [...half1.slice(0, -1), ...half2.slice(0, -1)];

  // Round to 5 decimals and drop consecutive duplicates that rounding creates.
  const rounded: Ring = [];
  for (const p of merged) {
    const q: Position = [r5(p[0]), r5(p[1])];
    const last = rounded[rounded.length - 1];
    if (!last || last[0] !== q[0] || last[1] !== q[1]) rounded.push(q);
  }
  if (rounded.length < 3) return [];
  const closed: Ring = [...rounded, rounded[0]];
  return closed;
}

/** Everything that happens to one polygon (list of rings): clip, drop slivers, simplify. */
function processPolygon(rings: Ring[], bbox: BBox, tol: number): { rings: Ring[]; clipped: boolean } | null {
  let clipped = false;
  const out: Ring[] = [];
  rings.forEach((ring, i) => {
    const c = clipRing(ring, bbox);
    // "Clipped" = the clip changed the vertex count (a rough but reliable signal).
    if (c.length !== ring.length) clipped = true;
    if (c.length === 0) return;
    const s = simplifyRing(c, tol);
    // Ignore holes/outer rings smaller than ~1 m^2: they are noise after rounding.
    if (s.length >= 4 && ringArea(s) > 1e-10) out.push(s);
    else if (i === 0) out.length = 0; // outer ring collapsed -> whole polygon gone
  });
  // First ring must be the outer ring; if it vanished the polygon is empty.
  if (out.length === 0) return null;
  return { rings: out, clipped };
}

/** Clip + simplify a whole Polygon/MultiPolygon. Returns null if nothing is left. */
function processGeometry(
  geom: any,
  bbox: BBox,
  tol: number,
): { geometry: ZoneGeometry; clipped: boolean } | null {
  const polys: Ring[][] =
    geom?.type === "Polygon" ? [geom.coordinates] : geom?.type === "MultiPolygon" ? geom.coordinates : [];
  const kept: Ring[][] = [];
  let clipped = false;
  for (const p of polys) {
    const r = processPolygon(p, bbox, tol);
    if (r) {
      kept.push(r.rings);
      clipped = clipped || r.clipped;
    }
  }
  if (kept.length === 0) return null;
  const geometry: ZoneGeometry =
    kept.length === 1 ? { type: "Polygon", coordinates: kept[0] } : { type: "MultiPolygon", coordinates: kept };
  return { geometry, clipped };
}

/** Area-weighted centroid of the biggest outer ring; good enough for a label anchor. */
function centroidOf(geometry: ZoneGeometry): Position {
  const polys = geometry.type === "Polygon" ? [geometry.coordinates] : geometry.coordinates;
  let best = polys[0][0], bestA = -1;
  for (const p of polys) {
    const a = ringArea(p[0]);
    if (a > bestA) { bestA = a; best = p[0]; }
  }
  let cx = 0, cy = 0, a2 = 0;
  for (let i = 0; i < best.length - 1; i++) {
    const [x0, y0] = best[i], [x1, y1] = best[i + 1];
    const f = x0 * y1 - x1 * y0;
    a2 += f; cx += (x0 + x1) * f; cy += (y0 + y1) * f;
  }
  if (a2 === 0) return [r5(best[0][0]), r5(best[0][1])];
  return [r5(cx / (3 * a2)), r5(cy / (3 * a2))];
}

// ---------------------------------------------------------------------------
// Manatee zone normalisation
// ---------------------------------------------------------------------------

/** Most restrictive first; used to pick one `zoneType` for map colouring. */
const RESTRICTIVENESS: ZoneType[] = [
  "no-entry",
  "motorboats-prohibited",
  "idle-speed",
  "slow-speed",
  "max-25-mph",
  "max-30-mph",
  "unregulated",
  "unknown",
];

/**
 * Map FWC wording (from TEXT_68C) to our ZoneType. The source writes things
 * like "Idle Speed", "Slow Speed", "Max 30 MPH", "No Entry",
 * "Motorboats Prohibited", "Unregulated".
 */
function typeFromLabel(label: string): ZoneType {
  const s = label.toLowerCase();
  if (s.includes("no entry")) return "no-entry";
  if (s.includes("motorboats prohibited")) return "motorboats-prohibited";
  if (s.includes("idle")) return "idle-speed";
  if (s.includes("slow")) return "slow-speed";
  if (/\b25\s*mph/.test(s)) return "max-25-mph";
  if (/\b30\s*mph/.test(s)) return "max-30-mph";
  if (s.includes("unregulated")) return "unregulated";
  return "unknown";
}

/**
 * Fallback for when TEXT_68C cannot be parsed: translate the cryptic class
 * codes (ISAY = Idle Speed All Year, SSAY = Slow Speed All Year, NE, MP, UN,
 * "25 MPH", "30 MPH", and the seasonal short forms IS/SS/NE/MP/UN).
 */
function typeFromCode(code: string | null): ZoneType {
  if (!code) return "unknown";
  const c = code.trim().toUpperCase();
  if (c.startsWith("NE")) return "no-entry";
  if (c.startsWith("MP")) return "motorboats-prohibited";
  if (c.startsWith("IS")) return "idle-speed";
  if (c.startsWith("SS")) return "slow-speed";
  if (c.startsWith("25")) return "max-25-mph";
  if (c.startsWith("30")) return "max-30-mph";
  if (c.startsWith("UN")) return "unregulated";
  return "unknown";
}

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
const DAYS_IN_MONTH = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]; // Feb = 29 so Feb 29 stays valid

/** "NOV 15 - MAR 31" / "Nov 15 - March 31" -> window; "JAN 1 - DEC 31" / "All Year" -> null (all year). */
function parseWindow(text: string | null): DateWindow | null | undefined {
  if (!text) return undefined; // unknown
  if (/all year/i.test(text)) return null;
  const m = text.match(/([A-Za-z]{3})[a-z]*\.?\s+(\d{1,2})\s*(?:-|to|through)\s*([A-Za-z]{3})[a-z]*\.?\s+(\d{1,2})/i);
  if (!m) return undefined;
  const sm = MONTHS.indexOf(m[1].toUpperCase()) + 1;
  const em = MONTHS.indexOf(m[3].toUpperCase()) + 1;
  if (!sm || !em) return undefined;
  const w: DateWindow = { startMonth: sm, startDay: +m[2], endMonth: em, endDay: +m[4] };
  // Jan 1 - Dec 31 is just "all year" spelled out.
  if (w.startMonth === 1 && w.startDay === 1 && w.endMonth === 12 && w.endDay === 31) return null;
  return w;
}

/** The window covering everything NOT in `w` (for "Remainder of Year"). */
function complement(w: DateWindow): DateWindow {
  // Day after the window ends -> day before it starts.
  let sm = w.endMonth, sd = w.endDay + 1;
  if (sd > DAYS_IN_MONTH[sm - 1]) { sd = 1; sm = (sm % 12) + 1; }
  let em = w.startMonth, ed = w.startDay - 1;
  if (ed < 1) { em = ((em + 10) % 12) + 1; ed = DAYS_IN_MONTH[em - 1]; }
  return { startMonth: sm, startDay: sd, endMonth: em, endDay: ed };
}

/**
 * Build the seasons for a zone. The primary source is TEXT_68C, which reads
 * like "Slow Speed (Nov 1 - Apr 30), Unregulated (Remainder of Year)". We
 * prefer it over DATE2_68C because the source's second date field is
 * unreliable (e.g. "Slow Nov 1-Apr 30" paired with "Unregulated Mar 1-Oct 31"
 * overlaps by two months, while the text says "Remainder of Year").
 */
function buildSeasons(p: Record<string, any>): { seasons: ZoneSeason[]; note: string | null } {
  const text = clean(p.TEXT_68C);
  const class1 = clean(p.CLASS1_68C), class2 = clean(p.CLASS2_68C);
  const dates1 = clean(p.DATE1_68C), dates2 = clean(p.DATE2_68C);

  // Split "A (x), B (y)" into segments by finding "Label (period)" pairs.
  const segs = text ? [...text.matchAll(/([^(),]+?)\s*\(([^)]*)\)/g)] : [];
  const seasons: ZoneSeason[] = [];
  let note: string | null = null;

  if (segs.length > 0) {
    // First pass: segments that name their own window.
    const parsed = segs.map((m) => ({ label: m[1].trim(), period: m[2].trim() }));
    const firstExplicit = parsed.find((s) => !/remainder/i.test(s.period));
    const firstWin = firstExplicit ? parseWindow(firstExplicit.period) : undefined;
    for (const seg of parsed) {
      let window: DateWindow | null | undefined;
      if (/remainder/i.test(seg.period)) {
        // Complement of the explicit window; if we cannot compute one, bail to codes.
        window = firstWin ? complement(firstWin) : undefined;
      } else {
        window = parseWindow(seg.period);
      }
      if (window === undefined) { seasons.length = 0; break; }
      seasons.push({ type: typeFromLabel(seg.label), window, rawClass: seg.label, rawDates: seg.period });
    }
    // One seasonal segment with no counterpart (e.g. "Slow Speed (Nov 15 - Apr 15)"):
    // the zone has no manatee rule the rest of the year.
    if (seasons.length === 1 && seasons[0].window) {
      seasons.push({ type: "unregulated", window: complement(seasons[0].window), rawClass: null, rawDates: null });
      note = "Source lists a single seasonal rule; off-season assumed unregulated.";
    }
    // Flag source-data contradictions between the text and the DATE2 field.
    if (seasons.length === 2 && dates2 && seasons[1].window) {
      const w2 = parseWindow(dates2);
      if (w2 && JSON.stringify(w2) !== JSON.stringify(seasons[1].window)) {
        note = `Source DATE2_68C ("${dates2}") disagrees with TEXT_68C; used TEXT_68C ("${text}").`;
      }
    }
  }

  if (seasons.length === 0) {
    // Fallback: build straight from the class/date columns.
    const w1 = parseWindow(dates1);
    seasons.push({ type: typeFromCode(class1), window: w1 === undefined ? null : w1, rawClass: class1, rawDates: dates1 });
    if (class2 && class2 !== class1) {
      const w2 = parseWindow(dates2);
      seasons.push({ type: typeFromCode(class2), window: w2 === undefined ? null : w2, rawClass: class2, rawDates: dates2 });
    }
    note = "Seasons built from class/date columns because TEXT_68C could not be parsed.";
  }
  return { seasons, note };
}

/** Expand the source's telegraphic abbreviations so names read like English. */
const ABBREV: Array<[RegExp, string]> = [
  [/\bRvr\b/g, "River"], [/\bCrk\b/g, "Creek"], [/\bCswy\b/g, "Causeway"], [/\bBrdg\b/g, "Bridge"],
  [/\bPnt\b/g, "Point"], [/\bCv\b/g, "Cove"], [/\bbtwn\b/gi, "between"], [/\bWtrs\b/g, "Waters"],
  [/\bwtrs\b/g, "waters"], [/\bchnl\b/g, "channel"], [/\bmrkr\b/g, "marker"], [/\bmrkd\b/g, "marked"],
  [/\bexcpt\b/g, "except"], [/\bdesg\b/g, "designated"], [/\bCnty\b/g, "County"], [/\bdev\b/gi, "development"],
  [/\bResd\b/g, "Residential"], [/\bassoc\b/g, "associated"], [/\bAv\b/g, "Avenue"], [/\bdscrb\b/g, "described"],
  [/\bdscrb\.?\b/g, "described"], [/\bSbstn\b/g, "Sebastian"], [/\bSt Sebastian\b/g, "St. Sebastian"],
  [/\bpnt\b/g, "point"], [/\bcrk\b/g, "creek"], [/\bcswy\b/g, "causeway"], [/\bbrdg\b/g, "bridge"], [/\brvr\b/g, "river"],
  [/\bRd\b/g, "Road"], [/\bLn\b/g, "Lane"], [/\bsystem\b/gi, "system"],
];

function expandNotes(notes: string | null): string | null {
  if (!notes) return null;
  let s = notes;
  for (const [re, rep] of ABBREV) s = s.replace(re, rep);
  // "...as described" is boilerplate pointing at the legal text; drop it from the label.
  s = s.replace(/[,;]?\s*(as described|as dscrb|as desg)\.?$/i, "").trim();
  return s.length ? s : null;
}

/**
 * Order matters: first matching pattern wins. Rules of thumb baked in below:
 *  - a description that STARTS with "ICW" is the channel itself;
 *  - specific named creeks/rivers beat the generic "Indian River" because many
 *    descriptions mention the river only as a reference line ("W of W shoreline
 *    of the Indian River");
 *  - canal/marina wording beats "Indian River" for the same reason.
 */
const WATERBODY_PATTERNS: Array<[RegExp, string]> = [
  [/^ICW/i, "Intracoastal Waterway"],
  [/Sebastian Inlet Channel/i, "Sebastian Inlet"],
  [/Sebastian River/i, "St. Sebastian River"],
  [/Crawford Creek/i, "Crawford Creek"],
  [/Johns Island/i, "Johns Island Creek"],
  [/Moore'?s Cr/i, "Moores Creek"],
  [/St\.? Lucie River/i, "St. Lucie River"],
  [/C-54/i, "C-54 Canal"],
  [/\bcanals?\b|\bmarina\b/i, "Canals / marinas"],
  [/Indian River/i, "Indian River Lagoon"],
  [/Round Island Cr/i, "Round Island Creek"],
  [/Sebastian Inlet/i, "Sebastian Inlet"],
  [/Fort Pierce Inlet|Ft Pierce Inlet/i, "Fort Pierce Inlet"],
  [/ICW/i, "Intracoastal Waterway"],
  [/\bcut\b|\bcove\b|creek|harbor/i, "Creeks / coves / cuts"],
];

function deriveWaterbody(text: string | null): string | null {
  if (!text) return null;
  for (const [re, name] of WATERBODY_PATTERNS) if (re.test(text)) return name;
  return null;
}

/** Human label per ZoneType, used when building a zone's display name. */
const TYPE_LABEL: Record<ZoneType, string> = {
  "no-entry": "No entry",
  "motorboats-prohibited": "Motorboats prohibited",
  "idle-speed": "Idle speed",
  "slow-speed": "Slow speed",
  "max-25-mph": "Max 25 mph",
  "max-30-mph": "Max 30 mph",
  unregulated: "Unregulated",
  unknown: "Unclassified",
};

function normaliseZone(f: any, geometry: ZoneGeometry, clipped: boolean): ManateeZone {
  const p = f.properties ?? {};
  const { seasons, note } = buildSeasons(p);

  // Most restrictive season wins for the single `zoneType` used in map colours.
  const zoneType = seasons
    .map((s) => s.type)
    .sort((a, b) => RESTRICTIVENESS.indexOf(a) - RESTRICTIVENESS.indexOf(b))[0];

  const notes = clean(p.NOTES_68C);
  const expanded = expandNotes(notes);
  const county = normCounty(p.COUNTY);
  const citation = clean(p.SECT_68C);
  // Names: the cleaned location text, or (for "as described") a citation-based fallback.
  const name =
    expanded && !/^as described$/i.test(expanded)
      ? expanded
      : `${TYPE_LABEL[zoneType]} zone, ${county} County (${citation ?? "see FAC 68C-22"})`;

  return {
    id: String(p.OBJECTID ?? f.id),
    name,
    county,
    waterbody: deriveWaterbody(expanded),
    zoneType,
    seasonal: seasons.length > 1 || seasons.some((s) => s.window !== null),
    seasons,
    raw: {
      masterClass: clean(p.MASTER_CL),
      class1: clean(p.CLASS1_68C),
      dates1: clean(p.DATE1_68C),
      class2: clean(p.CLASS2_68C),
      dates2: clean(p.DATE2_68C),
      text: clean(p.TEXT_68C),
      notes,
    },
    ruleCitation: citation,
    dataNote: note,
    clipped,
    sourceLastEdited: epochToDate(p.last_edited_date),
    centroid: centroidOf(geometry),
    geometry,
  };
}

// ---------------------------------------------------------------------------
// Boat ramp normalisation
// ---------------------------------------------------------------------------

function rampKind(rampType: string | null): RampKind {
  const t = (rampType ?? "").toLowerCase();
  if (t.includes("hand launch")) return "hand-launch";
  if (t.includes("airboat")) return "airboat-ramp";
  if (t.includes("within marina")) return "marina-ramp";
  if (t.includes("ramp")) return "boat-ramp";
  return "other";
}

/** Yes/No/Unknown -> true/false/null. */
function yesNo(v: unknown): boolean | null {
  const s = clean(v)?.toLowerCase();
  if (s === "yes") return true;
  if (s === "no") return false;
  return null;
}

/** Title-case a shouty city ("MELBOURNE BEACH" -> "Melbourne Beach"). */
function titleCase(s: string | null): string | null {
  return s ? s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()) : null;
}

function normaliseRamp(f: any): BoatRamp | null {
  const p = f.properties ?? {};
  // Prefer the real point geometry; fall back to the Latitude/Longitude attributes.
  const coords = f.geometry?.type === "Point" ? f.geometry.coordinates : null;
  const lon = coords ? coords[0] : num(p.Longitude);
  const lat = coords ? coords[1] : num(p.Latitude);
  if (lat === null || lon === null || !p.RampID) return null;

  const status = clean(p.Status);
  const rampType = clean(p.RampType);
  // Fee amount of exactly 0 with "No" fee is noise; keep real amounts only.
  const feeAmount = num(p.FeeAmount);

  return {
    id: String(p.RampID),
    name: String(p.RampName ?? "").trim(),
    county: normCounty(p.County),
    city: titleCase(clean(p.City)),
    address: clean(p.Street1),
    zip: clean(p.ZipCode),
    waterbody: clean(p.WaterBodyName),
    waterType: clean(p.WaterType),
    lat: r5(lat),
    lon: r5(lon),
    kind: rampKind(rampType),
    rampType,
    accessType: clean(p.AccessType),
    lanes: { single: num(p.SingleLanes), double: num(p.DoubleLanes), total: num(p.TotalLanes) },
    fee: {
      required: yesNo(p.isFeeRequired),
      amount: feeAmount && feeAmount > 0 ? Math.round(feeAmount * 100) / 100 : null,
      collection: clean(p.FeeCollectionType),
      rate: clean(p.Rate) && clean(p.Rate) !== "0" ? clean(p.Rate) : null,
    },
    parking: {
      vehicleSpaces: num(p.Vehicle),
      trailerSpaces: num(p.Trailer),
      accessibleVehicleSpaces: num(p.AccessibleVehicle),
      accessibleTrailerSpaces: num(p.AccessibleTrailer),
      surface: clean(p.ParkingSurface),
      condition: clean(p.ParkingCondition),
    },
    restroom: { type: clean(p.RestroomType), accessible: yesNo(p.isRestroomAccessible) },
    accessibilityLevel: clean(p.AccessibilityLevel),
    rampSurface: clean(p.RampSurface),
    rampCondition: clean(p.RampCondition),
    dockType: clean(p.DockType),
    hours: clean(p.Hours),
    amenities: clean(p.Amenities),
    status,
    open: status === "Open for Business",
    statusComments: clean(p.RampStatusComments),
    // FWC copies the same text into both comment fields; drop the duplicate.
    operationalComments:
      clean(p.OperationalComments) && clean(p.OperationalComments) !== clean(p.RampStatusComments)
        ? clean(p.OperationalComments)
        : null,
    operator: clean(p.PrimaryAdminEntity),
    partner: clean(p.PartnerAdminEntity),
    phone: clean(p.ContactPhone),
    url: clean(p.URL),
    source: { objectId: Number(p.OBJECTID ?? f.id) },
    lastVerified: epochToDate(p.last_edited_date),
  };
}

const insideBBox = (lon: number, lat: number, [w, s, e, n]: BBox) => lon >= w && lon <= e && lat >= s && lat <= n;

// ---------------------------------------------------------------------------
// Output: one record per line for clean git diffs
// ---------------------------------------------------------------------------

function serialise(meta: unknown, key: "zones" | "ramps", records: unknown[]): string {
  const lines = records.map((r) => "    " + JSON.stringify(r));
  return `{\n  "meta": ${JSON.stringify(meta, null, 2).replace(/\n/g, "\n  ")},\n  "${key}": [\n${lines.join(",\n")}\n  ]\n}\n`;
}

const countBy = <T>(arr: T[], key: (t: T) => string): Record<string, number> => {
  const o: Record<string, number> = {};
  for (const a of arr) o[key(a)] = (o[key(a)] ?? 0) + 1;
  return Object.fromEntries(Object.entries(o).sort(([a], [b]) => a.localeCompare(b)));
};

const newest = (dates: Array<string | null>): string | null =>
  dates.filter((d): d is string => !!d).sort().pop() ?? null;

/** Refuse to overwrite a file if the new record count collapsed (a sign of a broken fetch). */
function guardCount(path: string, key: "zones" | "ramps", newCount: number) {
  if (FORCE || !existsSync(path)) return;
  try {
    const prev = JSON.parse(readFileSync(path, "utf8"))[key]?.length ?? 0;
    if (prev > 0 && newCount < prev * 0.5) {
      throw new Error(`${key}: new count ${newCount} is under half of previous ${prev}. Re-run with --force if intended.`);
    }
  } catch (e) {
    if ((e as Error).message.includes("Re-run")) throw e;
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const fetchedAt = new Date().toISOString();
  console.log(`FWC data refresh ${fetchedAt}${DRY_RUN ? " (dry run)" : ""}`);
  console.log(`bbox [W,S,E,N] = ${BBOX.join(", ")}\n`);

  // ---- Zones ----
  console.log("Fetching manatee zones ...");
  const rawZones = await queryLayer(ZONES_LAYER, BBOX);
  console.log(`  server returned ${rawZones.length} features`);
  if (rawZones.length === 0) throw new Error("Zones layer returned 0 features; refusing to continue.");

  // Try tolerances from gentle to aggressive until the file fits the byte budget.
  let zones: ManateeZone[] = [];
  let usedTol = SIMPLIFY_LADDER[0];
  let zonesJson = "";
  const zonesMetaBase = (tol: number, list: ManateeZone[]) => ({
    fetchedAt,
    generatedBy: "scripts/refresh-fwc-data.ts",
    bbox: BBOX,
    simplifyToleranceDeg: tol,
    sources: [
      {
        name: "State Manatee Protection Zones in Florida",
        layerUrl: ZONES_LAYER,
        publisher: "Florida Fish and Wildlife Conservation Commission (FWC), Imperiled Species Management Section",
        fetchedCount: rawZones.length,
        keptCount: list.length,
        sourceLastEdited: newest(list.map((z) => z.sourceLastEdited)),
        licenseNote:
          "Acknowledge FWC as the data source. General reference only; Florida Administrative Code 68C-22 prevails over this dataset. FWC not liable for misuse.",
      } satisfies SourceLayerMeta,
    ],
    counts: {
      total: list.length,
      ...Object.fromEntries(Object.entries(countBy(list, (z) => z.county)).map(([k, v]) => [`county:${k}`, v])),
      ...Object.fromEntries(Object.entries(countBy(list, (z) => z.zoneType)).map(([k, v]) => [`type:${k}`, v])),
      seasonal: list.filter((z) => z.seasonal).length,
    },
    attribution: ATTRIBUTION_LINE,
  });

  for (const tol of SIMPLIFY_LADDER) {
    const built: ManateeZone[] = [];
    for (const f of rawZones) {
      const g = processGeometry(f.geometry, BBOX, tol);
      if (!g) continue; // nothing of this polygon survives inside the bbox
      built.push(normaliseZone(f, g.geometry, g.clipped));
    }
    built.sort((a, b) => Number(a.id) - Number(b.id)); // stable source-id order
    const json = serialise(zonesMetaBase(tol, built), "zones", built);
    zones = built; usedTol = tol; zonesJson = json;
    console.log(`  tolerance ${tol} deg -> ${(Buffer.byteLength(json) / 1024).toFixed(1)} KB`);
    if (Buffer.byteLength(json) <= ZONES_BYTE_BUDGET) break;
  }

  // ---- Ramps ----
  console.log("\nFetching boat ramps ...");
  const rawRamps = await queryLayer(RAMPS_LAYER, BBOX);
  console.log(`  server returned ${rawRamps.length} features`);
  if (rawRamps.length === 0) throw new Error("Ramps layer returned 0 features; refusing to continue.");

  const ramps: BoatRamp[] = [];
  const skipped: string[] = [];
  for (const f of rawRamps) {
    const r = normaliseRamp(f);
    if (!r) { skipped.push(String(f.properties?.RampID ?? f.id)); continue; }
    // The server envelope test is already spatial, but re-check: the clip is OURS to guarantee.
    if (!insideBBox(r.lon, r.lat, BBOX)) continue;
    ramps.push(r);
  }
  ramps.sort((a, b) => a.id.localeCompare(b.id));

  const rampsMeta = {
    fetchedAt,
    generatedBy: "scripts/refresh-fwc-data.ts",
    bbox: BBOX,
    sources: [
      {
        name: "FWC Florida Boat Ramp Inventory",
        layerUrl: RAMPS_LAYER,
        publisher: "Florida Fish and Wildlife Conservation Commission (FWC), Fish and Wildlife Research Institute",
        fetchedCount: rawRamps.length,
        keptCount: ramps.length,
        sourceLastEdited: newest(ramps.map((r) => r.lastVerified)),
        licenseNote:
          "Acknowledge FWC-FWRI as the data source. Not legal documents, not a survey, not for navigation. Funded by USFWS Sport Fish Restoration grant.",
      } satisfies SourceLayerMeta,
    ],
    counts: {
      total: ramps.length,
      ...Object.fromEntries(Object.entries(countBy(ramps, (r) => r.county)).map(([k, v]) => [`county:${k}`, v])),
      ...Object.fromEntries(Object.entries(countBy(ramps, (r) => r.kind)).map(([k, v]) => [`kind:${k}`, v])),
      open: ramps.filter((r) => r.open).length,
    },
    attribution: ATTRIBUTION_LINE,
  };
  const rampsJson = serialise(rampsMeta, "ramps", ramps);

  // ---- Write ----
  const total = Buffer.byteLength(zonesJson) + Buffer.byteLength(rampsJson);
  if (!DRY_RUN) {
    guardCount(ZONES_OUT, "zones", zones.length);
    guardCount(RAMPS_OUT, "ramps", ramps.length);
    mkdirSync(dirname(ZONES_OUT), { recursive: true });
    writeFileSync(ZONES_OUT, zonesJson);
    writeFileSync(RAMPS_OUT, rampsJson);
    console.log(`\nWrote ${ZONES_OUT}\nWrote ${RAMPS_OUT}`);
  }

  // ---- Validation summary ----
  console.log("\n================ VALIDATION SUMMARY ================");
  console.log(`zones: ${zones.length} (tolerance ${usedTol} deg)  ramps: ${ramps.length}`);
  console.log(`size: zones ${(Buffer.byteLength(zonesJson) / 1024).toFixed(1)} KB + ramps ${(Buffer.byteLength(rampsJson) / 1024).toFixed(1)} KB = ${(total / 1024).toFixed(1)} KB (budget 300 KB) ${total < 300_000 ? "OK" : "OVER BUDGET"}`);
  console.log("zones by county:", countBy(zones, (z) => z.county));
  console.log("zones by zoneType:", countBy(zones, (z) => z.zoneType));
  console.log("zones seasonal:", zones.filter((z) => z.seasonal).length, "| clipped at bbox:", zones.filter((z) => z.clipped).length);
  console.log("ramps by county:", countBy(ramps, (r) => r.county));
  console.log("ramps by kind:", countBy(ramps, (r) => r.kind));
  console.log("ramps by status:", countBy(ramps, (r) => r.status ?? "(none)"));

  const problems: string[] = [];
  for (const z of zones) {
    if (z.zoneType === "unknown") problems.push(`zone ${z.id}: unrecognised zone type (${z.raw.text})`);
    if (!z.raw.notes) problems.push(`zone ${z.id}: no description text (name is a fallback)`);
    if (z.dataNote) problems.push(`zone ${z.id}: ${z.dataNote}`);
    if (!z.geometry.coordinates.length) problems.push(`zone ${z.id}: empty geometry`);
  }
  const droppedZones = rawZones.filter((f) => !zones.some((z) => z.id === String(f.properties?.OBJECTID)));
  for (const f of droppedZones) problems.push(`zone ${f.properties?.OBJECTID}: dropped (no geometry left inside bbox)`);
  for (const r of ramps) {
    if (!r.name) problems.push(`ramp ${r.id}: missing name`);
    if (!r.status) problems.push(`ramp ${r.id}: missing status`);
  }
  for (const id of skipped) problems.push(`ramp ${id}: skipped (missing id/coordinates)`);
  console.log(`\nProblems / notes (${problems.length}):`);
  for (const p of problems) console.log("  - " + p);

  // bbox sanity: every output coordinate must sit inside the window (tiny float slack).
  let outside = 0;
  const check = (p: Position) => { if (!insideBBox(p[0], p[1], [BBOX[0] - 1e-5, BBOX[1] - 1e-5, BBOX[2] + 1e-5, BBOX[3] + 1e-5])) outside++; };
  for (const z of zones) {
    const polys = z.geometry.type === "Polygon" ? [z.geometry.coordinates] : z.geometry.coordinates;
    polys.forEach((rings) => rings.forEach((ring) => ring.forEach(check)));
  }
  for (const r of ramps) check([r.lon, r.lat]);
  console.log(`\nbbox sanity: ${outside === 0 ? "all coordinates inside bbox" : outside + " coordinates OUTSIDE bbox"}`);

  // Ramps near the three places the site cares about (rough circles).
  const towns: Array<[string, number, number, number]> = [
    ["Vero Beach", 27.6386, -80.3973, 0.12],
    ["Sebastian", 27.8164, -80.4706, 0.08],
    ["Fort Pierce", 27.4467, -80.3256, 0.08],
  ];
  for (const [label, lat, lon, rad] of towns) {
    const near = ramps.filter((r) => Math.hypot((r.lat - lat), (r.lon - lon) * COS_LAT) <= rad);
    console.log(`ramps near ${label} (${near.length}):`);
    for (const r of near) console.log(`    ${r.id}  ${r.name}  [${r.kind}, lanes ${r.lanes.total ?? "-"}, ${r.open ? "open" : r.status}]`);
  }
}

main().catch((e) => {
  console.error("\nREFRESH FAILED:", (e as Error).message);
  process.exit(1);
});
