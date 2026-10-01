// zone-display.ts
// ---------------------------------------------------------------------------
// Shared, framework-free display rules for manatee zones: colour + pattern per zone type,
// the STATIC season text, and the list of notes shown next to a zone.
//
// Used by the server-rendered legend/tables, the static SVG preview, and the MapLibre client
// chunk, so the three can never disagree about what a colour means.
//
// IMPORTANT: nothing in here looks at today's date. Season text is copied from the rule (see
// manatee-copy.ts header for why: the source DATE fields are wrong for some seasonal zones and
// the 2026 amendment may have changed others).

import type { ManateeZone, ZoneType } from '@/lib/verotide/geo-types';
import {
  CLIPPED_NOTE,
  PENDING_CHANGE_CITATIONS,
  PENDING_CHANGE_SUFFIX,
  SEASON_TEXT_ALL_YEAR,
  SEASON_TEXT_CHECK_SIGNS,
  SEASON_TEXT_IR_SLOW,
  SEASON_TEXT_OTHER_PREFIX,
  SEASON_TEXT_POWER_PLANT,
  cleanCitation,
} from '@/lib/verotide/manatee-copy';

/** Fill patterns. Colour is never the only signal: each type also has a pattern and a dash style. */
export type PatternKind = 'solid' | 'cross' | 'diag' | 'dots' | 'hlines' | 'vlines';

export interface ZoneTypeMeta {
  label: string;
  color: string;
  pattern: PatternKind;
  /** Outline dash array in multiples of line width ([] = solid line). */
  dash: number[];
  /** Order in the legend (strictest first). */
  order: number;
}

export const ZONE_TYPE_META: Record<ZoneType, ZoneTypeMeta> = {
  'no-entry': { label: 'No Entry', color: '#e11d48', pattern: 'solid', dash: [], order: 1 },
  'motorboats-prohibited': { label: 'Motorboats Prohibited', color: '#9333ea', pattern: 'cross', dash: [], order: 2 },
  'idle-speed': { label: 'Idle Speed', color: '#f97316', pattern: 'diag', dash: [3, 2], order: 3 },
  'slow-speed': { label: 'Slow Speed', color: '#eab308', pattern: 'dots', dash: [6, 2], order: 4 },
  'max-25-mph': { label: 'Max 25 mph', color: '#06b6d4', pattern: 'vlines', dash: [1, 2], order: 5 },
  'max-30-mph': { label: 'Max 30 mph', color: '#0f766e', pattern: 'hlines', dash: [1, 2], order: 6 },
  unregulated: { label: 'Unregulated', color: '#94a3b8', pattern: 'solid', dash: [1, 1], order: 7 },
  unknown: { label: 'Unknown', color: '#94a3b8', pattern: 'solid', dash: [1, 1], order: 8 },
};

export const ZONE_TYPES_IN_LEGEND_ORDER: ZoneType[] = (Object.keys(ZONE_TYPE_META) as ZoneType[])
  .filter((t) => t !== 'unregulated' && t !== 'unknown')
  .sort((a, b) => ZONE_TYPE_META[a].order - ZONE_TYPE_META[b].order);

/** True for the Indian River County seasonal slow-speed paragraphs, 68C-22.007(1)(c). */
const isIrSeasonalSlow = (z: ManateeZone) => !!z.ruleCitation?.startsWith('68C-22.007(1)(c)');
/** True for the Vero Beach power plant canal paragraph, 68C-22.007(1)(e). */
const isPowerPlant = (z: ManateeZone) => !!z.ruleCitation?.startsWith('68C-22.007(1)(e)');

/**
 * STATIC season text for the table and the detail panel. Returns a plain string; never a status.
 *  - Indian River seasonal zones use wording from the rule itself.
 *  - Other seasonal zones (St. Lucie, Brevard) repeat the FWC data's own dates, labelled as
 *    unchecked, because the research only verified Indian River County's rule.
 *  - Year-round zones just say "All year".
 */
export function seasonText(zone: ManateeZone): string {
  if (!zone.seasonal) return SEASON_TEXT_ALL_YEAR;
  if (isIrSeasonalSlow(zone)) return SEASON_TEXT_IR_SLOW;
  if (isPowerPlant(zone)) return SEASON_TEXT_POWER_PLANT;
  const parts = zone.seasons.map((s) => {
    const label = ZONE_TYPE_META[s.type]?.label ?? s.type;
    return s.rawDates ? `${label} ${s.rawDates}` : `${label} otherwise`;
  });
  return `${SEASON_TEXT_OTHER_PREFIX}${parts.join('; ')}. ${SEASON_TEXT_CHECK_SIGNS}`;
}

/** Caveats for a zone: data-quality note, 2026 rulemaking note, clipped-shape note. */
export function zoneNotes(zone: ManateeZone): string[] {
  const notes: string[] = [];
  // dataNote from the refresh script (e.g. "source dates contradict its text"). Kept verbatim.
  if (zone.dataNote) notes.push(zone.dataNote);
  const cite = cleanCitation(zone);
  if (cite && PENDING_CHANGE_CITATIONS[cite]) notes.push(PENDING_CHANGE_CITATIONS[cite] + PENDING_CHANGE_SUFFIX);
  if (zone.clipped) notes.push(CLIPPED_NOTE);
  return notes;
}

/** DOM id for a zone's table row; the map links to it. */
export const zoneAnchor = (id: string) => `zone-${id}`;
