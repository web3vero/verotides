// ramps-copy.ts
// ---------------------------------------------------------------------------------------------
// All reader-facing wording for /boat-ramps and /boat-ramps/[slug] lives here, in one reviewable
// place (same idea as lagoon-copy.ts). Components render these strings; they do not write claims.
//
// Claims policy for this file:
//   - Ramp facts come only from src/data/boat-ramps.json (FWC Boat Ramp Inventory). Where a field
//     is null we say nothing or say "not confirmed". We never guess.
//   - The lagoon gauge is context for the WHOLE lagoon. No sentence here says anything about water
//     depth at a ramp, whether a ramp is usable, safe, or suitable for a boat.
//   - Manatee zones are described as "mapped near" a ramp, never as "on your route".
//   - The only dated claim about the data is the FWC edit date, and we label it as that.
//
// This module is PURE (no imports of ramps.ts values) so ramps.ts can call buildRampNarrative()
// for the indexability gate without a circular dependency. Type-only imports are erased.
// ---------------------------------------------------------------------------------------------

import type { BoatRamp } from './geo-types';
import type { NearbyZone } from './ramps';

export const SITE_URL = 'https://verotides.com';

// ---- Small formatting helpers -----------------------------------------------------------------

export function countWords(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

/** "a, b and c" */
function joinList(items: string[]): string {
  if (items.length <= 1) return items.join('');
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
}

/** Name without any trailing parenthetical such as "(Call Ahead to Unlock Gate 772-...)". */
export function shortName(name: string): string {
  return name.replace(/\s*\([^)]*\)\s*/g, ' ').replace(/\s+/g, ' ').trim();
}

/** "Fort Pierce" etc. The source city is the mailing city, not always the ramp's own town. */
function cityOf(r: BoatRamp): string | null {
  return r.city && r.city.trim() ? r.city.trim() : null;
}

function kindPhrase(r: BoatRamp): string {
  switch (r.kind) {
    case 'boat-ramp':
      return 'boat ramp';
    case 'hand-launch':
      return 'hand-launch site for paddlecraft and other small boats';
    case 'marina-ramp':
      return 'boat ramp at a marina';
    case 'airboat-ramp':
      return 'airboat ramp';
    default:
      return 'access point';
  }
}

/** Fee sentence. FWC gives no units for most amounts, so we say so rather than guess. */
function feeSentence(r: BoatRamp): string | null {
  const f = r.fee;
  if (f.required === null) return 'The inventory does not say whether a fee applies, so ask the operator before you go.';
  if (f.required === false) return 'The inventory records no launch fee.';
  const collected = f.collection ? `, collected by ${f.collection.toLowerCase()}` : '';
  if (f.amount !== null && f.rate) return `The inventory records a fee of $${f.amount} ${f.rate}${collected}.`;
  if (f.amount !== null) {
    return `The inventory records a fee of $${f.amount}${collected}; it does not state the unit or period, so confirm the price with the operator.`;
  }
  return `The inventory records that a fee applies${collected} but gives no amount, so confirm the price with the operator.`;
}

function lanesSentence(r: BoatRamp): string | null {
  const { total, single, double } = r.lanes;
  if (total === null) return null;
  const parts: string[] = [];
  if (single) parts.push(`${single} single-wide`);
  if (double) parts.push(`${double} double-wide`);
  const lanes = `${total} launch ${total === 1 ? 'lane' : 'lanes'}`;
  return parts.length ? `It is listed with ${lanes} (${joinList(parts)}).` : `It is listed with ${lanes}.`;
}

function parkingSentence(r: BoatRamp): string | null {
  const v = r.parking.vehicleSpaces;
  const t = r.parking.trailerSpaces;
  if (v === null && t === null) return null;
  const bits: string[] = [];
  if (v !== null) bits.push(`${v} vehicle ${v === 1 ? 'space' : 'spaces'}`);
  if (t !== null) bits.push(`${t} vehicle-and-trailer ${t === 1 ? 'space' : 'spaces'}`);
  const surface = r.parking.surface ? ` The lot surface is recorded as ${r.parking.surface.toLowerCase()}.` : '';
  return `Parking is recorded as ${joinList(bits)}.${surface}`;
}

function surfaceSentence(r: BoatRamp): string | null {
  const bits: string[] = [];
  if (r.rampSurface) bits.push(`a ramp surface described as "${r.rampSurface}"`);
  if (r.rampCondition) bits.push(`a condition rating of "${r.rampCondition}"`);
  if (r.dockType) bits.push(`a dock entry of "${r.dockType}"`);
  if (!bits.length) return null;
  return `FWC records ${joinList(bits)}.`;
}

function amenitySentence(r: BoatRamp): string | null {
  const parts: string[] = [];
  if (r.restroom.type) {
    const acc = r.restroom.accessible === true ? ' (marked accessible)' : '';
    parts.push(`restroom: ${r.restroom.type.toLowerCase()}${acc}`);
  }
  if (r.amenities) {
    const list = r.amenities.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
    if (list.length) parts.push(`other amenities: ${joinList(list)}`);
  }
  if (r.accessibilityLevel) parts.push(`accessibility level: ${r.accessibilityLevel.toLowerCase()}`);
  if (!parts.length) return null;
  return `On the facilities side the inventory lists ${parts.join('; ')}.`;
}

function milesText(mi: number): string {
  if (mi === 0) return 'at or inside the edge of';
  if (mi < 0.05) return 'less than 0.1 mile from';
  return `about ${mi.toFixed(1)} ${mi.toFixed(1) === '1.0' ? 'mile' : 'miles'} from`;
}

function zoneSentence(r: BoatRamp, nearby: NearbyZone[]): string | null {
  if (!nearby.length) return null;
  const first = nearby[0];
  const rest = nearby.length - 1;
  const more = rest > 0 ? ` ${rest} more mapped ${rest === 1 ? 'zone sits' : 'zones sit'} within 1.5 miles.` : '';
  const zname = first.zone.name.replace(/\s+/g, ' ');
  return (
    `The closest FWC-mapped manatee zone to this ramp's recorded location is "${zname}", listed as ${first.typeLabel.toLowerCase()}, ` +
    `${milesText(first.miles)} the point.${more} Distances are straight-line and approximate, and say nothing about which way a boat will travel.`
  );
}

/**
 * The data-specific prose for one ramp page: a handful of sentences, each present only when the
 * source has the matching field, so two ramps with different data read differently. Returned as an
 * array of paragraphs. The indexability gate counts the words in this output (>= 80), so a ramp
 * with thin data cannot qualify by padding: boilerplate (disclaimers, credits) is NOT counted.
 */
export function buildRampNarrative(r: BoatRamp, nearby: NearbyZone[]): string[] {
  const out: string[] = [];

  // Paragraph 1: what and who.
  const city = cityOf(r);
  const where = [r.waterbody ? `on ${r.waterbody}` : null, city ? `near ${city}, ${r.county} County` : `in ${r.county} County`]
    .filter(Boolean)
    .join(' ');
  const who = r.operator ? `, operated by ${r.operator}${r.partner ? ` with ${r.partner}` : ''}` : '';
  const addr = r.address ? ` The address in the inventory is ${r.address}${r.zip ? `, ${r.zip}` : ''}.` : '';
  out.push(`${shortName(r.name)} is a ${kindPhrase(r)} ${where}${who}.${addr}`);

  // Paragraph 2: the physical facts.
  const p2 = [lanesSentence(r), surfaceSentence(r), parkingSentence(r)].filter(Boolean);
  if (p2.length) out.push(p2.join(' '));

  // Paragraph 3: money, hours, amenities.
  const hours = r.hours ? `Posted hours in the inventory read "${r.hours}".` : null;
  const p3 = [feeSentence(r), hours, amenitySentence(r)].filter(Boolean);
  if (p3.length) out.push(p3.join(' '));

  // Paragraph 4: source remarks verbatim (these are the most ramp-specific text we have).
  const remarks = [r.statusComments, r.operationalComments].filter((s): s is string => !!s && !!s.trim());
  if (remarks.length) {
    out.push(`The source adds this remark${remarks.length > 1 ? 's' : ''}: ${remarks.map((s) => `"${s.trim()}"`).join(' ')}`);
  }

  // Paragraph 5: nearby zones.
  const z = zoneSentence(r, nearby);
  if (z) out.push(z);

  return out;
}

// ---- Page-level copy --------------------------------------------------------------------------

export const CREDIT_LINE =
  'Manatee protection zone and boat ramp data: Florida Fish and Wildlife Conservation Commission (FWC). Reference only. Not legal, survey or navigation data.';

export const NOT_FOR_NAVIGATION =
  'Not for navigation. The FWC data behind this page states that it is not to be used for navigation, is not a survey, and is not a legal document.';

export const DATA_DATE_NOTE =
  'The "last edited" date shown with each ramp is the date FWC last edited that record in its database. It is not the date anyone visited or re-surveyed the ramp.';

export const ZONES_NOTE =
  'Manatee zone boundaries here are informational and simplified. Indian River County zone rules were amended in 2026 and the FWC map layer we use may lag those changes, so posted signs and markers on the water and Florida Administrative Code 68C-22 control. Being near a zone does not mean a zone applies to your route.';

export const LAGOON_CONTEXT = {
  label: 'LAGOON-WIDE CONTEXT (Wabasso gauge)',
  heading: 'Lagoon water level context',
  caveat:
    'This is one USGS gauge (Indian River at Wabasso) describing the lagoon as a whole. It does not tell you the water depth at any ramp, whether a ramp can be launched from, or whether conditions are safe. We do not measure anything at ramps. Lagoon high and low times are estimates built from the NOAA ocean prediction shifted by about 3.5 hours (roughly plus or minus 30 minutes).',
  unavailable: 'Lagoon reading unavailable right now.',
  unavailableDetail: 'The Wabasso gauge reading is missing or too old to show, so we are not displaying any lagoon numbers.',
  seeLagoon: 'Full lagoon page with chart and forecast',
} as const;

export const RAMPS_PAGE = {
  title: 'Boat Ramps in Indian River County: Lanes & Fees | Verotides',
  h1: 'Public Boat Ramps in Indian River County and Nearby',
  description:
    'Static directory of public boat ramps and hand-launch sites in Indian River, St. Lucie and Brevard counties: lanes, fees, hours, parking, and nearby manatee zones from FWC data.',
  intro: [
    'This directory lists every public boat ramp, marina ramp and hand-launch site in the FWC Florida Boat Ramp Inventory for Indian River County and the neighbouring St. Lucie and Brevard shorelines. Each entry shows what the inventory records: launch lanes, fees, hours, parking, restrooms and the operator.',
    'Blank fields are shown as "not confirmed" rather than guessed. Verotides is an independent information site, not the operator of any ramp, so call the operator before you tow a boat anywhere.',
  ],
} as const;

/** Title for a ramp page: keep to 60 characters by trying progressively shorter forms. */
export function rampTitle(r: BoatRamp): string {
  const name = shortName(r.name);
  const city = cityOf(r);
  const candidates = [
    city ? `${name}, ${city} FL: Lanes, Fees & Zones` : `${name}: Lanes, Fees & Zones`,
    city ? `${name}, ${city} FL: Lanes & Fees` : `${name}: Lanes & Fees`,
    `${name}: Lanes & Fees`,
    name,
  ];
  const fit = candidates.find((c) => c.length <= 60);
  return fit ?? `${name.slice(0, 57).trimEnd()}...`;
}

/** Meta description (~150 chars) built from real fields only. */
export function rampDescription(r: BoatRamp, nearbyCount: number): string {
  const bits: string[] = [];
  if (r.lanes.total !== null) bits.push(`${r.lanes.total} ${r.lanes.total === 1 ? 'lane' : 'lanes'}`);
  if (r.fee.required === false) bits.push('no fee recorded');
  else if (r.fee.required === true) bits.push('fee recorded');
  if (r.parking.trailerSpaces !== null) bits.push(`${r.parking.trailerSpaces} trailer spaces`);
  if (r.hours) bits.push(`hours: ${r.hours}`);
  const zones = nearbyCount ? ` ${nearbyCount} FWC manatee ${nearbyCount === 1 ? 'zone' : 'zones'} mapped within 1.5 miles.` : '';
  const text = `${shortName(r.name)} (${r.county} County): ${bits.join(', ')}. FWC inventory data.${zones}`;
  return text.length > 158 ? `${text.slice(0, 155).trimEnd()}...` : text;
}

// ---- FAQ (every answer computed from, or restating, the data) ---------------------------------

export interface FaqItem {
  q: string;
  a: string;
}

export function buildRampsFaq(ramps: BoatRamp[]): FaqItem[] {
  const total = ramps.length;
  const fee = ramps.filter((r) => r.fee.required === true).length;
  const free = ramps.filter((r) => r.fee.required === false).length;
  const unknownFee = total - fee - free;

  // Three biggest Indian River County ramps by recorded lane count.
  const top = ramps
    .filter((r) => r.county === 'Indian River' && r.lanes.total !== null && r.kind !== 'hand-launch')
    .sort((a, b) => (b.lanes.total ?? 0) - (a.lanes.total ?? 0) || a.name.localeCompare(b.name))
    .slice(0, 3)
    .map((r) => `${shortName(r.name)} (${r.lanes.total})`);

  return [
    {
      q: 'Do these boat ramps charge a fee?',
      a: `In this inventory, ${free} of ${total} sites are recorded as having no launch fee, ${fee} record a fee, and ${unknownFee} do not say. Where FWC gives an amount we show it with the unit FWC gives, but for several the unit or period is not stated. Confirm the price with the operator.`,
    },
    {
      q: 'Which Indian River County ramps list the most launch lanes?',
      a: top.length
        ? `By recorded lane count, the largest listed in Indian River County are ${joinList(top)}. Lane counts are as recorded by FWC and may not match what is open on a given day.`
        : 'Lane counts are shown on each ramp entry where FWC records them.',
    },
    {
      q: 'Does the lagoon water level tell me if I can launch?',
      a: 'No. The lagoon reading comes from one USGS gauge at Wabasso and describes the lagoon as a whole. Lagoon tides are much smaller than ocean tides, and we do not measure water depth, launch conditions or safety at any ramp. Use it as general context only and check with the operator and your own judgement.',
    },
    {
      q: 'What are the manatee zones listed near each ramp?',
      a: 'For ramps with their own page we list FWC-mapped manatee protection zones within about 1.5 miles of the ramp location, measured in a straight line. This is informational. It does not say a zone is on your route. Indian River County zone rules were amended in 2026 and the map data may lag, so follow posted signs and markers.',
    },
    {
      q: 'How current is the ramp information?',
      a: 'The data comes from the FWC Florida Boat Ramp Inventory, which was first compiled in 2009 and has been maintained by FWC since. The "last edited" date we show is the date FWC edited the record in its database, not a site visit. Status such as "Temporarily closed" is shown exactly as the source reports it, with that date.',
    },
    {
      q: 'Can I use this directory for navigation?',
      a: 'No. FWC states these data are not to be used for navigation, are not a survey and are not a legal document. Use official nautical charts and posted signs on the water.',
    },
  ];
}

export function faqJsonLd(items: FaqItem[]) {
  return {
    '@type': 'FAQPage',
    mainEntity: items.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
}
