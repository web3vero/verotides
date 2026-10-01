// Page copy for /manatee-zones ("Indian River County Manatee & Speed Zones").
//
// WHAT THIS FILE IS: plain strings and arrays, no React. Components import these constants so
// every claim the page makes lives in one reviewable place (same idea as lagoon-copy.ts).
//
// WHERE THE CLAIMS COME FROM: only from the regulatory research report
// (scratchpad/features/02-regulatory.md, "02") and the data notes (src/data/ATTRIBUTION.md).
// "02 s4" below means report 02, section 4, and so on.
//
// HARD RULES (do not loosen without re-reading 02 sections 0, 4 and 5):
//   - NO "in effect today" / "active now" wording and NO season logic computed from dates.
//     Season text is STATIC text copied from the rule, shown only where the rule supports it.
//   - The governing rule for Indian River County is 68C-22.007 F.A.C. (68C-22.006 is Brevard,
//     68C-22.008 is St. Lucie).
//   - Idle Speed and Slow Speed use the legal wording of 68C-22.002. "No wake" and "minimum
//     wake" are common boating phrases, NOT legal terms, and are never presented as definitions.
//   - No fine / penalty dollar amounts anywhere (unverified, 02 s6 Q7).
//   - FWC is credited exactly as in src/data/ATTRIBUTION.md.
//   - No claim that a point is legally inside or outside a zone, and none that "no zone drawn"
//     means "no restriction".

import type { ManateeZone } from '@/lib/verotide/geo-types';

// ---------------------------------------------------------------------------
// Shared shapes
// ---------------------------------------------------------------------------

export interface CopyLink {
  label: string;
  url: string;
}

export interface FaqItem {
  q: string;
  a: string;
  /** Source links shown under the answer. */
  cites: CopyLink[];
}

export interface GlossaryItem {
  term: string;
  definition: string;
  cite: CopyLink;
}

// ---------------------------------------------------------------------------
// Official links (all taken from report 02)
// ---------------------------------------------------------------------------

// flrules.org rule page. The title query string has spaces, so they are percent-encoded here.
const flrules = (rule: string) =>
  `https://www.flrules.org/gateway/RuleNo.asp?title=THE%20FLORIDA%20MANATEE%20SANCTUARY%20ACT&ID=${rule}`;

export const LINKS = {
  fwcZonesPage: { label: 'FWC manatee protection zones page', url: 'https://myfwc.com/wildlifehabitats/wildlife/manatee/protection-zones/' },
  fwcMapsPage: { label: 'FWC manatee data and maps page', url: 'https://myfwc.com/wildlifehabitats/wildlife/manatee/data-and-maps/' },
  fwcRulemaking: { label: 'FWC rulemaking page', url: 'https://myfwc.com/wildlifehabitats/wildlife/manatee/rulemaking/' },
  rule007: { label: 'Rule 68C-22.007 (Indian River County), Florida Administrative Code', url: flrules('68C-22.007') },
  rule002: { label: 'Rule 68C-22.002 (definitions), Florida Administrative Code', url: flrules('68C-22.002') },
  chapter: { label: 'Chapter 68C-22, Florida Administrative Code', url: 'https://www.flrules.org/gateway/ChapterHome.asp?Chapter=68C-22' },
  june2026Pdf: { label: 'FWC PDF of the June 2026 rule text', url: 'https://myfwc.com/media/zvhjpoed/indian-river-rule-june-2026.pdf' },
  viewing: { label: 'FWC manatee viewing guidelines', url: 'https://myfwc.com/education/wildlife/manatee/viewing-guidelines/' },
  statute379: { label: 'Section 379.2431, Florida Statutes', url: 'https://www.flsenate.gov/Laws/Statutes/2025/379.2431' },
  statute327: { label: 'Section 327.73, Florida Statutes', url: 'https://www.flsenate.gov/Laws/Statutes/2025/327.73' },
  wqcs: { label: 'WQCS: FWC to review manatee protection zones in Indian River County', url: 'https://www.wqcs.org/wqcs-news/2025-08-15/fwc-to-review-manatee-protection-zones-in-indian-river-county' },
  fwcLayer: { label: 'FWC State Manatee Protection Zones layer', url: 'https://gis.myfwc.com/hosting/rest/services/Open_Data/State_Manatee_Protection_Zones_in_Florida/MapServer/9' },
} satisfies Record<string, CopyLink>;

/**
 * Link to the rule section for a zone's citation. 68C-22.006 = Brevard, .007 = Indian River,
 * .008 = St. Lucie (ATTRIBUTION.md). Returns null for anything we do not recognise.
 */
export function ruleUrlForCitation(citation: string | null): string | null {
  const m = citation?.match(/^(68C-22\.00[678])/);
  return m ? flrules(m[1]) : null;
}

// ---------------------------------------------------------------------------
// Metadata + page headings
// ---------------------------------------------------------------------------

export const MANATEE_PAGE = {
  path: '/manatee-zones',

  metadata: {
    // <= 60 characters (search-result title). 42 here.
    title: 'Indian River Manatee Zones Map | Verotides',
    // <= 160 characters.
    description:
      'Map and list of manatee speed zones in Indian River County, FL: idle speed, slow speed, no entry. FWC data last edited May 2025. Rules changed in 2026.',
  },

  h1: 'Indian River County Manatee & Speed Zones',

  intro: [
    'Manatee protection zones are stretches of Florida water where boats have to slow down or stay out. This page maps the zones in Indian River County (Sebastian, Vero Beach and the lagoon between them), plus the neighboring zones near the St. Lucie and Brevard county lines that fall inside the same map window.',
    'Use it to get oriented before you launch. It is an informational map, not the rule: the posted signs on the water and the text of Rule 68C-22.007 control.',
  ],
} as const;

// ---------------------------------------------------------------------------
// Banners and disclaimers
// ---------------------------------------------------------------------------

export const UPDATE_BANNER = {
  heading: 'The rules changed in 2026. This map may not show the newest zones.',
  // {SOURCE_DATE} is replaced with the data's own sourceLastEdited date (never lastVerified).
  paragraphs: [
    'FWC adopted amendments to the Indian River County manatee zone rules in 2026 (approved May 13, 2026, adopted June 30, 2026; Rule 68C-22.007). FWC says new zones are not in effect on the water until regulatory markers are posted, so what is enforced where you are boating depends on which signs are up.',
    'The map data on this page was last edited by FWC on {SOURCE_DATE}, so it may not show the newest zones. We could not confirm the final adopted zone list or which new markers are in place. Check the official FWC sources below, then follow the signs.',
  ],
  linkIntro: 'Official sources',
  links: [
    LINKS.fwcZonesPage,
    LINKS.fwcMapsPage,
    LINKS.fwcRulemaking,
    LINKS.rule007,
    LINKS.june2026Pdf,
  ] as CopyLink[],
} as const;

// Source: 02 s4 (suggested text) plus 68C-22.007(3).
export const DISCLAIMER = {
  heading: 'Informational only',
  paragraphs: [
    'This map is an informational aid built from Florida Fish and Wildlife Conservation Commission (FWC) data. It may be incomplete or out of date, and zone rules in Indian River County were amended in 2026. Posted regulatory signs and markers on the water and the text of Rule 68C-22.007, Florida Administrative Code, control. This page is not legal advice. Local, state, and federal rules may also apply. Always obey posted signs.',
    'Rule 68C-22.007(3) says maps of the zones "are intended only as visual aids and do not have regulatory effect," and that if a map and the rule text conflict, the rule text prevails. Our shapes are also simplified (about 11 m), so boundaries are approximate. Not for navigation.',
  ],
  short: 'Informational only. Posted signs and the rule text control. Not legal advice, not for navigation.',
} as const;

export const INDEPENDENCE_NOTE =
  'Verotides is an independent information site. It is not affiliated with, sponsored by, or endorsed by FWC or any other agency, business, or organization mentioned on this page.';

// ---------------------------------------------------------------------------
// Static season text (NO date logic: see header)
// ---------------------------------------------------------------------------

// Indian River County seasonal slow-speed zones, rule 68C-22.007(1)(c): the rule text itself
// says "Slow Speed Nov 1 - Apr 30, Unregulated Remainder of Year" (02 s2, s5).
export const SEASON_TEXT_IR_SLOW =
  'Slow speed Nov 1 - Apr 30; the rule lists the remainder of the year as unregulated. Check posted signs.';

// Vero Beach power plant canal, 68C-22.007(1)(e): No Entry Nov 15 - Mar 31 in the pre-2026 rule
// text. The FWC layer also lists Idle Speed Apr 1 - Nov 14 but we found no rule text for it
// (02 s3 table, s7).
export const SEASON_TEXT_POWER_PLANT =
  'No entry Nov 15 - Mar 31, per the rule text before the 2026 amendment. FWC data also lists idle speed Apr 1 - Nov 14, which we could not match to rule text. Check posted signs.';

// Prefix for seasonal zones in St. Lucie / Brevard: dates come straight from the FWC data and
// were not checked against 68C-22.006 / .008 (02 only researched Indian River County).
export const SEASON_TEXT_OTHER_PREFIX = 'Seasonal per FWC data (not checked against the rule): ';
export const SEASON_TEXT_ALL_YEAR = 'All year';
export const SEASON_TEXT_CHECK_SIGNS = 'Check posted signs.';

/**
 * Zones whose rule paragraph FWC proposed to change in the 2026 rulemaking (02 s0 item 5).
 * Keyed by the citation the data gives. The FINAL adopted list could not be verified, so the
 * note says only that FWC's rulemaking affects the zone and tells the reader to check signs.
 */
export const PENDING_CHANGE_CITATIONS: Record<string, string> = {
  '68C-22.007(1)(a)1.': 'FWC proposed to change this zone in the 2026 rulemaking.',
  '68C-22.007(1)(b)6.': 'FWC proposed to extend this zone in the 2026 rulemaking.',
  '68C-22.007(1)(d)2.': 'FWC proposed to change the Sebastian Inlet channel zone in the 2026 rulemaking.',
  '68C-22.007(1)(e)': 'FWC proposed to change this zone in the 2026 rulemaking.',
};
export const PENDING_CHANGE_SUFFIX =
  ' We could not confirm the final wording or whether new markers are posted. Check the signs and the rule.';

export const CLIPPED_NOTE = 'Shape is cut off at the edge of this map window, so only part of the zone is drawn.';

// ---------------------------------------------------------------------------
// Legend / zone-type copy (labels live in zone-display.ts; meanings are here)
// ---------------------------------------------------------------------------

// Source: 02 s1 (exact 68C-22.002 definitions). Mirror text used for definitions: verify on flrules.
export const TYPE_MEANING = {
  'idle-speed':
    'Idle Speed. A vessel must proceed at a speed no greater than that which will maintain steerageway and headway.',
  'slow-speed':
    'Slow Speed. A vessel must be fully off plane and completely settled into the water, then proceed at a speed that is reasonable and prudent under the prevailing circumstances.',
  'no-entry':
    'No Entry. A controlled area that all vessels, and all persons (in vessels or swimming, diving, wading or fishing), are prohibited from entering.',
  'motorboats-prohibited':
    'Motorboats Prohibited. Vessels with any mechanical means of propulsion may not enter the marked area unless that propulsion is not in use.',
  'max-30-mph': 'Maximum 30 mph. A numeric speed cap written into the zone paragraph of the rule.',
  'max-25-mph': 'Maximum 25 mph. A numeric speed cap written into the zone paragraph of the rule.',
  unregulated: 'No manatee zone rule in this part of the year.',
  unknown: 'Zone type not recognised in the source data. Read the rule text.',
} as const;

export const LEGEND = {
  heading: 'Legend',
  intro: 'Each zone type has its own color and its own fill pattern, so you can tell them apart without relying on color. Where a zone changes with the season, the map shows its strictest rule; the table shows the season text.',
} as const;

// ---------------------------------------------------------------------------
// Map section
// ---------------------------------------------------------------------------

export const MAP_SECTION = {
  heading: 'Zone map',
  ariaLabel: 'Map of manatee protection zones in Indian River County, Florida. The zone tables below list the same information.',
  caption:
    'Tap or click a zone for details. Pinch with two fingers to zoom on a phone. Everything on the map is also in the tables below, so the map is never the only way to find a zone.',
  baseMapCredit: 'Base map: OpenFreeMap, (c) OpenMapTiles, data (c) OpenStreetMap contributors.',
  chartCredit: 'Chart overlay: NOAA Office of Coast Survey display service. Not for navigation.',
  skipMap: 'Skip the map and go to the zone tables',
} as const;

export const NEAR_ME = {
  heading: 'Zones near me',
  intro:
    'Optional. Tap the button and your browser may ask for your location. The lookup runs on your device only: your position is not sent to Verotides or anyone else, and is not saved.',
  button: 'Use my location',
  working: 'Finding your position...',
  unsupported: 'This browser cannot share a location. Use the map or the tables below.',
  denied: 'Location was not shared. You can still use the map or the tables below.',
  failed: 'Could not get a position. You can still use the map or the tables below.',
  caution:
    'Distances are straight-line estimates to simplified shapes. "Inside the mapped area" does not tell you what rule applies at your exact spot, and a zone missing from this list does not mean there is no restriction. Obey posted signs.',
  none: 'No mapped zones within 25 miles of that position. This map only covers Indian River County and the area around it.',
} as const;

// ---------------------------------------------------------------------------
// Tables
// ---------------------------------------------------------------------------

export const TABLES = {
  heading: 'Zones by waterbody',
  intro:
    'Every zone in the map data, grouped by waterbody. The waterbody group is our best guess from the description text, because FWC does not give one. Zones with no waterbody in the description are listed under "Other areas". The county shows which rule chapter applies: 68C-22.006 Brevard, 68C-22.007 Indian River, 68C-22.008 St. Lucie.',
  columns: { zone: 'Zone', county: 'County', type: 'Type', season: 'Season', rule: 'Rule', notes: 'Notes' },
  otherGroup: 'Other areas (location is in the rule text)',
} as const;

// ---------------------------------------------------------------------------
// Glossary
// ---------------------------------------------------------------------------

export const GLOSSARY: GlossaryItem[] = [
  {
    term: 'Idle Speed',
    definition: 'A vessel must proceed at a speed no greater than that which will maintain steerageway and headway.',
    cite: { label: '68C-22.002(1) F.A.C.', url: LINKS.rule002.url },
  },
  {
    term: 'Slow Speed',
    definition:
      'A vessel must be fully off plane and completely settled into the water. The vessel must then proceed at a speed which is reasonable and prudent under the prevailing circumstances. The rule text we read does not give a specific mph for Slow Speed.',
    cite: { label: '68C-22.002(4) F.A.C.', url: LINKS.rule002.url },
  },
  {
    term: 'No Entry zone',
    definition:
      'A controlled area that all vessels and all persons, whether in vessels or swimming, diving, wading or fishing, are prohibited from entering. This is our short summary; read the full definition in the rule.',
    cite: { label: '68C-22.002(11) F.A.C.', url: LINKS.rule002.url },
  },
  {
    term: 'Motorboats Prohibited zone',
    definition:
      'All vessels equipped with any mechanical means of propulsion are prohibited from entering the marked area unless the mechanical means of propulsion is not in use.',
    cite: { label: '68C-22.002(3) F.A.C.', url: LINKS.rule002.url },
  },
  {
    term: 'Maximum 30 mph',
    definition:
      'A numeric speed cap. It is not a defined term; the number is written into the zone paragraph, for example the Intracoastal Waterway channel and waters within 100 feet of it in listed segments.',
    cite: { label: '68C-22.007(1)(d) F.A.C.', url: LINKS.rule007.url },
  },
  {
    term: 'Seasonal zone',
    definition:
      'A zone whose rule depends on the time of year. The rule does not define "seasonal"; the dates are written into each zone paragraph. This page shows those dates as plain text and does not calculate whether a zone applies today.',
    cite: { label: '68C-22.007(1) F.A.C.', url: LINKS.rule007.url },
  },
  {
    term: '"No wake" and "minimum wake"',
    definition:
      'Common boating phrases for idle speed and slow speed. They are not terms the rule defines, so this page uses the rule\'s own words, Idle Speed and Slow Speed.',
    cite: { label: '68C-22.002 F.A.C.', url: LINKS.rule002.url },
  },
];

// ---------------------------------------------------------------------------
// FAQ (visible on the page AND emitted as FAQPage JSON-LD from this same array)
// ---------------------------------------------------------------------------

export const FAQ: FaqItem[] = [
  {
    q: 'What is a manatee protection zone?',
    a: 'It is a restriction on vessel speed or access that FWC sets under the Florida Manatee Sanctuary Act (section 379.2431(2), Florida Statutes). The zones are written into Chapter 68C-22 of the Florida Administrative Code, and each county has its own rule: 68C-22.007 covers Indian River County.',
    cites: [LINKS.fwcZonesPage, LINKS.statute379, LINKS.chapter],
  },
  {
    q: 'Can this page tell me which zones are in effect today?',
    a: 'No. We deliberately do not show an "in effect now" status. The FWC data behind this map was last edited on May 13, 2025, before the 2026 amendments, and FWC says new zones do not take effect on the water until regulatory markers are posted. Seasonal dates in the source data are also unreliable for some zones. Follow the posted signs.',
    cites: [LINKS.fwcRulemaking, LINKS.fwcLayer],
  },
  {
    q: 'What does Idle Speed mean?',
    a: 'Under the rule, a vessel must proceed at a speed no greater than that which will maintain steerageway and headway.',
    cites: [LINKS.rule002],
  },
  {
    q: 'What does Slow Speed mean?',
    a: 'Under the rule, the vessel must be fully off plane and completely settled into the water, and then proceed at a speed that is reasonable and prudent under the prevailing circumstances. The rule text we read gives no specific mph number for Slow Speed.',
    cites: [LINKS.rule002],
  },
  {
    q: 'Do seasonal zones apply all year?',
    a: 'No. Under Rule 68C-22.007(1)(c), three Indian River County zones are Slow Speed from Nov 1 to Apr 30 and listed as unregulated for the remainder of the year. The Vero Beach power plant canal was No Entry from Nov 15 to Mar 31 in the rule text before the 2026 amendment, which may have changed that zone. Always check the posted signs.',
    cites: [LINKS.rule007, LINKS.june2026Pdf],
  },
  {
    q: 'Is this map legally binding?',
    a: 'No. Rule 68C-22.007(3) says maps of the zones are intended only as visual aids and do not have regulatory effect, and that if a map and the rule text conflict, the rule text prevails. FWC advises boaters to abide by the regulations as posted on the water.',
    cites: [LINKS.rule007, LINKS.fwcMapsPage],
  },
  {
    q: 'When do new zones start applying?',
    a: 'FWC states that new zones will not go into effect on the water until regulatory markers are posted. We could not verify which of the 2026 changes have markers up, so look for the signs where you are boating.',
    cites: [LINKS.fwcRulemaking],
  },
  {
    q: 'Are the Indian River County rules changing?',
    a: 'Yes. FWC reviewed the county\'s zones for the first time since 1992. The Commissioners approved amendments on May 13, 2026 and FWC adopted them on June 30, 2026. They take effect on the water once markers are posted.',
    cites: [LINKS.wqcs, LINKS.fwcRulemaking, LINKS.rule007],
  },
  {
    q: 'If no zone is drawn where I am, does that mean there is no restriction?',
    a: 'No. Some parts of the rule are listed as unregulated and have no shape on the map, but state, federal and local rules can still apply, and this map may be out of date. A blank area is not a promise.',
    cites: [LINKS.fwcLayer, LINKS.rule007],
  },
  {
    q: 'Can commercial fishermen go faster?',
    a: 'Rule 68C-22.007(2) provides a limited exemption for commercial fishermen and guides who hold a permit, with conditions that include a speed limit and no use on weekends or holidays. Read the rule or ask FWC before relying on it.',
    cites: [LINKS.rule007],
  },
  {
    q: 'What about the Sebastian Inlet channel?',
    a: 'Rule 68C-22.007(1)(d)2. has a 30 mph maximum zone for the inlet channel "contingent upon dredging and marking of said channel." FWC\'s 2026 rulemaking also proposed changes to how the inlet zone is described, and this map may not show them. Check the signs at the inlet.',
    cites: [LINKS.rule007, LINKS.june2026Pdf],
  },
  {
    q: 'What happens if I break a manatee zone rule?',
    a: 'Penalties are set by Florida law, not by this site, and they differ by type of zone and violation. We do not list amounts here. See the statutes and FWC for current penalties.',
    cites: [LINKS.statute379, LINKS.statute327],
  },
  {
    q: 'Who do I call to report a violation or an injured manatee?',
    a: 'Call the FWC Wildlife Alert hotline at 1-888-404-3922 (1-888-404-FWCC), or dial *FWC from a cell phone.',
    cites: [LINKS.viewing],
  },
  {
    q: 'Can I touch or feed manatees?',
    a: 'No. FWC\'s viewing guidelines say to look but not touch, and not to feed manatees or give them water. Touching, chasing or otherwise interfering with them can count as harassment.',
    cites: [LINKS.viewing],
  },
];

/** FAQPage JSON-LD built from FAQ so the visible text and the markup cannot disagree. */
export const FAQ_JSONLD = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ.map((item) => ({
    '@type': 'Question',
    name: item.q,
    acceptedAnswer: { '@type': 'Answer', text: item.a },
  })),
};

// ---------------------------------------------------------------------------
// Data credits (required wording lives in src/data/ATTRIBUTION.md)
// ---------------------------------------------------------------------------

export const CREDITS = {
  heading: 'Data credits',
  // EXACT line from ATTRIBUTION.md. Do not reword.
  requiredLine:
    'Manatee protection zone and boat ramp data: Florida Fish and Wildlife Conservation Commission (FWC). Reference only. Not legal, survey or navigation data.',
  shortForm: 'Data: FWC (myfwc.com)',
  transformations:
    'We clipped the data to this map window, simplified the polygons (roughly 11 m), normalized the zone types, and guessed the waterbody from the description text. The shapes are approximate and are not the legal boundaries.',
  mapCredits:
    'Base map: OpenFreeMap, (c) OpenMapTiles, data (c) OpenStreetMap contributors. The optional chart overlay is the NOAA Office of Coast Survey chart display service, which is not for navigation.',
} as const;

// ---------------------------------------------------------------------------
// Helpers shared by components
// ---------------------------------------------------------------------------

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

/** "2025-05-13" -> "May 13, 2025". Pure string work, so no timezone can shift the day. */
export function formatIsoDate(iso: string | null | undefined): string {
  const m = iso?.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return 'an unknown date';
  return `${MONTHS[Number(m[2]) - 1]} ${Number(m[3])}, ${m[1]}`;
}

/** Strip the data's occasional garbled double citation ("68C-22.007(1)(e) (1)(a)8.") to the first token. */
export function cleanCitation(zone: ManateeZone): string | null {
  return zone.ruleCitation ? zone.ruleCitation.split(' ')[0] : null;
}

// ---------------------------------------------------------------------------
// REFUSED / NOT INCLUDED (so the next editor knows these were left out on purpose)
// ---------------------------------------------------------------------------
//   - Any "in effect today" / "active now" badge, or season math from DATE fields (02 s5).
//   - Any fine or penalty dollar amount, including the $100 default and federal $50,000 figure (02 s6 Q7, Q9: unverified).
//   - A computed speed limit for the visitor's GPS position, or "you are legally inside zone X".
//   - Claims about the final 2026 zone list, the exact Sebastian River idle change, or the Vero Beach
//     power plant becoming Idle Speed all year: the report could not reconcile the proposal with the PDF (02 s0, s7).
//   - "No wake" / "minimum wake" as legal terms.
//   - A claim that FWC endorses this site, or that the data is "live" from FWC.
