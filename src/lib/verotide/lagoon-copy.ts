// Page copy for /lagoon ("Indian River Lagoon Water Level, Vero Beach") and
// /inlets ("Fort Pierce Inlet Conditions").
//
// WHAT THIS FILE IS: plain strings and arrays only. No React, no logic beyond building the
// FAQ JSON-LD objects from the FAQ arrays. UI components import these constants and render
// them, so every claim the site makes lives in one reviewable place.
//
// WHERE THE NUMBERS COME FROM: only from the expert reports (scratchpad/tide/). Each block
// has a "Source:" comment naming the report and section it came from:
//   01 = 01-oceanographer.md      02 = 02-tidal-data.md
//   03 = 03-inlet-conditions.md   04 = 04-validation.md
//
// HONESTY RULES (do not loosen without re-reading 04 section 7, "What accuracy claims the
// site can honestly make"):
//   - Accuracy claims = lagoon tide TIMING, small swing, and anchored forecast error bands.
//   - Never claim absolute level to +-0.1 ft, storm/rain/king-tide skill, or any place but Wabasso.
//   - Lagoon data is USGS provisional, NAVD88. Never mixed with MLLW tide-table heights.
//   - Flood watch = reference-gauge (Trident Pier) heads-up. Vero tiers are NOT NOAA flood stages.
//   - Inlets: NOAA current is a PREDICTION, Sebastian is not covered, there is NO go/no-go score,
//     and nothing here ever says it is safe or unsafe to boat.
//   - Verotides is an independent information site; no business affiliation is implied anywhere.

// ---------------------------------------------------------------------------
// Shared shapes
// ---------------------------------------------------------------------------

export interface PageMetadataCopy {
  /** <= 60 characters (search-result title). */
  title: string;
  /** <= 155 characters (search-result description). */
  description: string;
}

/** A titled block of paragraphs, optionally followed by a bullet list. */
export interface CopySection {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
}

export interface FaqItem {
  q: string;
  a: string;
}

export interface GlossaryItem {
  term: string;
  definition: string;
}

export interface SourceCredit {
  /** Stable key, e.g. "usgs-02251800". */
  id: string;
  agency: string;
  /** Station / gauge / product identifier as the agency prints it. */
  identifier: string;
  /** What the site uses it for, in plain words. */
  use: string;
  /** Caveat the reader should know about this source. */
  caveat: string;
  url: string;
}

export interface DataNote {
  /** ISO date (YYYY-MM-DD) the note was written. */
  date: string;
  note: string;
}

/** Plain-object FAQPage JSON-LD (schema.org). Render with JSON.stringify in a script tag. */
export interface FaqJsonLd {
  '@context': 'https://schema.org';
  '@type': 'FAQPage';
  mainEntity: {
    '@type': 'Question';
    name: string;
    acceptedAnswer: { '@type': 'Answer'; text: string };
  }[];
}

/** Build FAQPage JSON-LD from an FAQ array. Answers are plain text, so they are already JSON-LD safe. */
function toFaqJsonLd(items: FaqItem[]): FaqJsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  };
}

// ---------------------------------------------------------------------------
// Site-wide independence statement (used by both pages' footers)
// ---------------------------------------------------------------------------

export const INDEPENDENCE_NOTE =
  'Verotides is an independent information site. It is not affiliated with, sponsored by, or endorsed by any business, agency, or organization mentioned on this page.';

// ---------------------------------------------------------------------------
// Glossary (shared by both pages; each page picks its own terms below)
// ---------------------------------------------------------------------------

export const GLOSSARY: Record<string, GlossaryItem> = {
  navd88: {
    term: 'NAVD88',
    // Source: 04 section 2 (datum alignment); 02 section 7 item 4 (NAVD88 is a land-elevation datum).
    definition:
      'North American Vertical Datum of 1988. A fixed, survey-based height reference that is also used for land and street elevations. Lagoon levels on this site are feet above or below NAVD88, so a reading of -0.7 ft means 0.7 ft below that reference line. It is not the same zero as the ocean tide predictions.',
  },
  mllw: {
    term: 'MLLW',
    // Source: 02 section 7 items 1 and 5 (MLLW is not sea level; epoch 1983-2001).
    definition:
      'Mean Lower Low Water. The zero line NOAA uses for its tide predictions, based on the average of the lower of each day\'s two low tides over a fixed multi-year period (NOAA\'s Vero Beach record uses 1983 to 2001). Zero MLLW is not sea level and not the ground. We do not mix MLLW heights with the lagoon\'s NAVD88 readings.',
  },
  subtidal: {
    term: 'Subtidal',
    // Source: 01 (subtidal band = slow changes, 40-h lowpass); 04 section 0 item 2.
    definition:
      'Water-level changes that unfold over days to months instead of hours, such as the Gulf Stream shifting, the seasonal rise of the ocean in fall, or a stretch of onshore wind. These slow changes move the lagoon far more than the twice-a-day tide does.',
  },
  windSetup: {
    term: 'Wind setup',
    // Source: 01 (wind setup discussed qualitatively); 04 section 7 (wind effect not claimed as physics).
    definition:
      'Steady wind pushing surface water toward one end of a body of water so the level rises downwind and falls upwind. It matters in a long, shallow lagoon. We do not model it on this site.',
  },
  ebbFlood: {
    term: 'Ebb and flood',
    // Source: 03 section 0 (FPI0901 meanEbbDir 77, meanFloodDir 260; negative = ebb).
    definition:
      'Ebb is water flowing out of an inlet toward the ocean. Flood is water flowing in from the ocean toward the lagoon. At Fort Pierce Inlet, NOAA lists the ebb as flowing toward about 77 degrees true (east-northeast) and the flood toward about 260 degrees (west-southwest).',
  },
  slack: {
    term: 'Slack',
    // Source: 02 section 2 item 10 (current leads height; flood max 10:28 vs ocean high 11:31).
    definition:
      'The short period when the current in an inlet is near zero as it turns from ebb to flood or the reverse. Slack water does not line up exactly with high or low tide. In NOAA\'s predictions for Fort Pierce Inlet, the current can turn before the tide height peaks: on one September day the predicted flood peaked about an hour before the nearby ocean high.',
  },
  kingTide: {
    term: 'King tide',
    // Source: 02 section 8 (king tide = predicted highs near the year's highest; perigean spring tides).
    definition:
      'An informal name for the highest astronomical tides of the year, which happen when the moon is close to Earth and lined up with the sun. A king tide is a prediction from orbits alone. It does not include wind, rain, or the extra ocean height that builds up each fall.',
  },
  significantWaveHeight: {
    term: 'Significant wave height',
    // Source: 03 section 0 (buoys report WVHT, shown as Hs). Definition is the standard NOAA/NDBC one.
    definition:
      'The average height of the tallest third of the waves over a short sampling period, as reported by a buoy. Individual waves are often taller than this number and many are shorter. It is measured where the buoy sits, which is offshore, not at the inlet mouth.',
  },
};

// ===========================================================================
// /lagoon  --  Indian River Lagoon Water Level, Vero Beach
// ===========================================================================

export const LAGOON_PAGE = {
  path: '/lagoon',

  metadata: {
    // 43 chars + " | Verotides" stays under the 60-char limit.
    title: 'Indian River Lagoon Water Level, Vero Beach | Verotides',
    description:
      'Live USGS lagoon water level at Wabasso, lagoon tide timing about 3.5 hours after the ocean, and a short forecast with error bands. NAVD88, provisional.',
  } satisfies PageMetadataCopy,

  h1: 'Indian River Lagoon Water Level, Vero Beach',

  // Source: 04 sections 0 and 9 (public blurb draft); 01 (lagoon tide ~5 in peak to trough).
  intro:
    'The Indian River Lagoon barely has tides of its own. Near Wabasso, the daily rise and fall is only about a third of a foot, and it shows up roughly 3 to 3.5 hours after the ocean tide. This page shows the latest reading from the USGS gauge at Wabasso, when the lagoon\'s next high and low should arrive, and a short forecast with its error range drawn in. The level is dominated by slower things: the season, the wind, and rain.',

  // One short line the UI can print directly under the live number.
  liveReadingCaption:
    'Feet relative to NAVD88. USGS provisional data, gauge 02251800 at Wabasso. Not a navigation or safety product.',

  /** 'What you're looking at' explainer. */
  whatYoureLookingAt: {
    heading: 'What you\'re looking at',
    paragraphs: [
      // Source: 04 section 1 (USGS 02251800 is the only live lagoon-stage gauge in the Vero/Sebastian/Fort Pierce area).
      'The big number is the most recent reading from USGS gauge 02251800, Indian River at Wabasso. It is the only live lagoon water-level gauge in the Sebastian to Fort Pierce stretch, which is why everything on this page is about Wabasso and not about every dock and seawall along the lagoon.',
      // Source: 04 section 7 (tide timing and swing); 01 (gain 0.136, lag 3.25 h).
      'The curve is the lagoon\'s small tide. Highs and lows near Wabasso typically arrive about 3 to 3.5 hours after the ocean tide nearby, and the swing is only about 0.3 to 0.4 ft, roughly 15 percent of the ocean\'s range. The lagoon is connected to the ocean through narrow inlets, so most of the ocean\'s tide never makes it in.',
      // Source: 04 section 0 item 2 and section 7 (wind, rain, storms, fall season move level by more than the tide).
      'Most of what moves the lagoon is not the tide. Seasonal ocean height, wind, rain, and storms can change the level by a foot or more, and that can swamp the twice-a-day swing. So a reading that looks "high" may have little to do with where we are in the tide.',
      // Source: 04 section 2 (label NAVD88, provisional); 04 section 1 (approved through ~Nov 2025, provisional after).
      'Levels are feet relative to NAVD88, a fixed reference line, so negative numbers are normal. USGS marks recent data as provisional, meaning it has not been through final review and can be revised.',
    ],
  } satisfies CopySection,

  /** 'How we calculate it' methodology. */
  howWeCalculate: {
    heading: 'How we calculate it',
    paragraphs: [
      // Source: 04 section 3, 04 section 5.
      'The tide curve and short forecast are built in four steps from public data. Nothing here is a measurement at your location.',
    ],
    // Source for each step is the comment above it.
    bullets: [
      // 04 section 3: oracle choice immaterial; hilo only for subordinate stations; 02 section 5 cosine interpolation.
      'Start with NOAA\'s predicted high and low tides for the ocean near Vero. NOAA publishes only the highs and lows for this station, so we draw a smooth curve between them.',
      // 04 section 3: lag 3.5 h, CI about 3.0 to 4.0 h.
      'Delay that curve by about 3.5 hours. In last year\'s data the best fit was 3.5 hours, and anything from 3.0 to 4.0 hours fit nearly as well.',
      // 04 section 3: amplitude ratio 0.13 to 0.16.
      'Shrink it to the lagoon\'s size. The lagoon\'s tide is about 0.13 to 0.16 of the ocean\'s, which is why NOAA\'s own Vero Beach lagoon prediction runs a bit large for the Wabasso gauge.',
      // 04 section 5: anchor = trailing mean (obs - predicted) from live USGS gauge; edge 5 to 18 percent over anchored NOAA Vero.
      'Anchor it to the gauge. We add the recent average gap between what the Wabasso gauge read and what the tide curve said. That anchor, not any wind or pressure term, is what buys most of the accuracy, and it beats the same anchor applied to NOAA\'s Vero Beach prediction by only about 5 to 18 percent in error.',
      // 04 section 0 item 3 and section 8 item 3: hide level if USGS older than 2 h.
      'If the Wabasso reading is more than about 2 hours old, we hide the level number and show tide timing only.',
    ],
  } satisfies CopySection,

  /** Short blurb for an About / methodology anchor (plain text, ~90 words). */
  methodologyBlurb:
    'Lagoon tide timing comes from NOAA\'s ocean tide predictions near Vero, delayed about 3.5 hours and scaled down to the lagoon\'s roughly one-third-foot swing. The short forecast is anchored to the latest USGS reading at Wabasso (gauge 02251800, NAVD88, provisional data) and drawn with error bands. We tested this on 13 months of real data at Wabasso only, and we do not predict wind, rain, storm, or king-tide highs. Information only, not for navigation or safety decisions.',

  /** 'How accurate is it?' section. Source: 04 sections 4, 5, 6, 7 and 9. */
  howAccurate: {
    heading: 'How accurate is it?',
    intro:
      'We tested the method against the Wabasso gauge on 13 months of real data, September 2025 to September 2026. Here is what held up and what did not. These numbers describe Wabasso only.',
    claims: [
      // 04 section 4 timing table: within 30 min 71%, within 60 min 93%, n = 1525 of 1536 extrema.
      'Timing: lagoon highs and lows landed within 30 minutes of our estimate about 7 times in 10, and within 1 hour about 9 times in 10 (1,525 tides checked).',
      // 04 section 7.
      'Swing: the lagoon\'s daily rise and fall is about 0.3 to 0.4 ft, roughly 15 percent of the ocean tide range.',
      // 04 section 5 table + section 7: 1-6 h about 0.15 to 0.2 ft; 24 h about 0.25; 72 h about 0.35. RMS error.
      'Level, next 1 to 6 hours: typical (root-mean-square) error of about 0.15 to 0.2 ft when anchored to the latest Wabasso reading.',
      'Level, 24 hours out: typical error of about 0.25 ft.',
      'Level, 3 days out: typical error of about 0.35 ft.',
    ],
    // Plain-language reading of the above for the sentence under the chart.
    plainEnglish:
      'Put simply: the timing of the lagoon\'s highs and lows is the reliable part. The height is only good to a few inches in the next few hours and gets looser the further out you go.',
    limits: [
      // 04 section 7 NOT defensible; section 4 error distribution (19% and 37% within 0.1 ft).
      'Without a fresh gauge reading to anchor to, the level is far less reliable. In our test, only 19 to 37 percent of hours landed within 0.1 ft.',
      // 04 section 6 worst event: 2025-10-11, 1.4 to 1.64 ft under-predicted.
      'Fall can break any estimate. On October 11 to 12, 2025, an un-anchored version of this method came in 1.4 to 1.64 ft too low during a wet, high-ocean spell with only 9 to 17 mph wind.',
      // 04 section 7: these are hindcast numbers; revisit after 3 months of live logging.
      'These are backtest numbers, not a track record of live forecasts. We plan to revisit them after about 3 months of live logging and will update this page.',
    ],
  },

  /** Seasonal copy. Source: 02 section 4; 04 section 3 (seasonal table), section 7. Wording per rule (g). */
  fallSeason: {
    heading: 'Why the water runs higher in fall',
    paragraphs: [
      'NOAA\'s tide prediction typically reads low in September through November because seasonal sea-level rise (about 1 ft) is not in the harmonics. The harmonics are the repeating astronomical cycles that NOAA\'s predictions are built from, and NOAA\'s Vero Beach lagoon station does not include the yearly cycles (called Sa and Ssa) at all.',
      // 02 section 4: Trident monthly MSL Sep-Oct +0.8 to +1.2 ft above Jan-Aug.
      'At the nearest observed ocean gauge, Trident Pier, mean sea level in September and October runs about 0.8 to 1.2 ft above its January to August level. The lagoon follows the ocean on that slow timescale.',
      // 04 section 3 seasonal table + section 7 caveat; 01 monthly means.
      'At Wabasso, USGS daily means since 2010 average about -0.7 to -0.8 ft (NAVD88) from January through August, roughly -0.1 ft in September, about +0.15 ft in October, and near 0 ft in November. Fall is typically 0.6 to 1 ft higher than summer, but any given year can differ by 0.3 to 0.4 ft.',
    ],
  } satisfies CopySection,

  /**
   * Flood watch copy. Source: 02 sections 4 and 8; 04 section 7.
   * The watch is driven by the Trident Pier reference gauge, NOT by a lagoon gauge.
   */
  floodWatch: {
    heading: 'Flood watch: a heads-up from a reference gauge',
    paragraphs: [
      'The flood watch on this page is a heads-up based on Trident Pier, NOAA\'s nearest observed ocean gauge, about 85 miles north of Vero. NOAA does not publish an observed water level at Vero, Sebastian Inlet, or Fort Pierce, and NOAA does not publish flood stages for Vero Beach.',
      'We compare Trident\'s reading with NOAA\'s prediction for the same time. When the ocean is running above prediction, as it often does in fall, low spots near the lagoon can flood on days that look ordinary on a tide chart.',
      'The tiers below are Verotides estimates built from that ocean reading plus the predicted lagoon high. They are not NOAA flood stages and not a forecast for your street, seawall, or dock. Wind and rain can add more, and we cannot see them.',
    ],
    // Source: 02 section 8. Tiers are measured above the NOAA Vero lagoon station's mean higher high water (0.89 ft MLLW).
    tiers: [
      {
        label: 'Normal',
        rule: 'Estimated lagoon high is less than 0.5 ft above the usual high-water mark.',
        meaning: 'Below our estimated flooding level. Local wind and rain can still change things.',
      },
      {
        label: 'Higher than normal',
        rule: 'Estimated high is about 0.5 to 1.0 ft above the usual high-water mark.',
        meaning: 'Water is running higher than normal. Check local conditions near low docks and seawalls.',
      },
      {
        label: 'Sunny-day flooding possible in low spots',
        rule: 'Estimated high is about 1.0 ft or more above the usual high-water mark.',
        meaning: 'Low-lying streets, seawalls, and docks may see water even without rain. This is a Verotides estimate, not a NOAA flood stage.',
      },
    ],
    // Source: 02 section 8. Banner copy with no hard-coded dates; UI fills nothing in.
    kingTideBanner: {
      heading: 'King tide window',
      body: 'The highest astronomical tides of the year are in this window. When the ocean is also running above NOAA\'s prediction, low-lying streets and seawalls along the lagoon may see sunny-day flooding. Heights shown are NOAA predictions plus a regional estimate, and local wind and rain can add more.',
    },
    /** When observations are unavailable, say so. Never show "no flood risk". Source: 02 sections 6 and 8. */
    unavailableNote:
      'Live water-level check unavailable. We are not showing a flood watch right now, and that is not the same as no flooding risk.',
    /** Never promise absence of flooding. */
    belowThresholdWording: 'Below estimated flooding level',
  },

  /** 'What we don't claim' list. Source: 04 section 7 NOT defensible. */
  whatWeDontClaim: [
    'We do not claim the lagoon level is accurate to within 0.1 ft.',
    'We do not predict storm surge, wind-driven highs, rain or runoff, or king-tide highs. In October 2025 an un-anchored version missed by up to about 1.6 ft.',
    'We do not claim this applies anywhere but Wabasso. Vero, Sebastian, Fort Pierce, and the rest of the lagoon will differ, and we have no second gauge to check them against.',
    'We do not offer our wind and pressure terms as physics. In our tests they were statistical stand-ins, and once the forecast is anchored to the gauge they added nothing reliable.',
    'We do not say how much higher a given fall will be beyond this: fall is typically 0.6 to 1 ft higher than summer, and any year can differ by 0.3 to 0.4 ft.',
    'We do not publish NOAA flood stages for Vero Beach, because NOAA has none. Our flood tiers are our own estimates.',
  ],

  disclaimers: [
    'For information only. Do not use this page for navigation, boating decisions, or flood or safety decisions. For official warnings, follow the National Weather Service and local emergency management.',
    'Levels come from USGS provisional data, in feet relative to NAVD88, and may be revised or may be missing when the gauge or its data feed is down.',
    'Forecast values are estimates with error bands, tested on Wabasso only. They are not measurements at your location.',
    INDEPENDENCE_NOTE,
  ],

  /** 5 to 6 FAQs. Plain text only, safe to drop straight into FAQ JSON-LD. */
  faq: [
    {
      q: 'Does the Indian River Lagoon have tides?',
      // Source: 04 section 0 and 7; 01 (lagoon ~0.13 m peak to trough).
      a: 'Barely. Near Wabasso the lagoon\'s daily rise and fall is only about 0.3 to 0.4 ft, roughly 15 percent of the ocean\'s tide range, because the ocean water has to squeeze in through narrow inlets. Slower changes from the season, wind, and rain usually move the level more than the tide does.',
    },
    {
      q: 'Why does the lagoon\'s high tide come hours after the ocean\'s?',
      // Source: 04 section 3 and section 7.
      a: 'The inlets are narrow and the lagoon is long and shallow, so the ocean tide takes time to push water in and back out. Near Wabasso, highs and lows typically arrive about 3 to 3.5 hours after the nearby ocean tide. In our test, our timing estimate landed within 30 minutes about 7 times in 10 and within 1 hour about 9 times in 10.',
    },
    {
      q: 'What does NAVD88 mean, and why is the level often negative?',
      // Source: 04 section 2; 02 section 7.
      a: 'NAVD88 is a fixed survey reference for heights, also used for land elevations. The lagoon is often below that line, especially in winter and summer, so negative readings are normal. At Wabasso, USGS daily averages since 2010 run about -0.7 to -0.8 ft from January through August. We do not mix NAVD88 readings with NOAA\'s MLLW tide-prediction heights.',
    },
    {
      q: 'How accurate is the lagoon forecast?',
      // Source: 04 section 7 and section 9.
      a: 'Anchored to the latest Wabasso reading, typical error is about 0.15 to 0.2 ft over the next several hours, about 0.25 ft a day out, and about 0.35 ft three days out. That is based on a 13-month backtest at Wabasso only. Without a fresh gauge reading it is much looser, and we do not predict wind, rain, storm, or king-tide highs.',
    },
    {
      q: 'Why is the water higher in fall?',
      // Source: 02 section 4; 04 section 3 and section 7.
      a: 'The ocean along Florida\'s east coast runs about 0.8 to 1.2 ft higher in September and October than in January through August, and the lagoon follows. NOAA\'s prediction typically reads low in September through November because that seasonal sea-level rise (about 1 ft) is not in the harmonics. At Wabasso, fall is typically 0.6 to 1 ft higher than summer, though any year can differ by 0.3 to 0.4 ft.',
    },
    {
      q: 'Is the flood watch an official NOAA flood stage?',
      // Source: 02 sections 2.9 and 8; 04 section 7.
      a: 'No. NOAA publishes flood levels for a few gauges, such as Trident Pier, but none for Vero Beach. Our watch is a heads-up based on how far the ocean at Trident Pier, about 85 miles north, is running above NOAA\'s prediction. The tiers for Vero are Verotides estimates, not NOAA flood stages, and they do not account for local wind or rain.',
    },
  ] satisfies FaqItem[],

  glossaryKeys: ['navd88', 'mllw', 'subtidal', 'windSetup', 'kingTide'] as const,

  /** Which source-credit ids this page shows. Full entries are in SOURCE_CREDITS below. */
  sourceKeys: ['usgs-02251800', 'noaa-8722105', 'noaa-8721604', 'noaa-8722125'] as const,
};

/** FAQPage JSON-LD for /lagoon, built from the FAQ array so the two can never disagree. */
export const LAGOON_FAQ_JSONLD: FaqJsonLd = toFaqJsonLd(LAGOON_PAGE.faq);

// ===========================================================================
// /inlets  --  Fort Pierce Inlet Conditions
// ===========================================================================

export const INLETS_PAGE = {
  path: '/inlets',

  metadata: {
    title: 'Fort Pierce Inlet Conditions | Verotides',
    description:
      'Predicted ebb and flood current at Fort Pierce Inlet, nearby buoy waves and wind, and what waves against a current do. Information only, no safety rating.',
  } satisfies PageMetadataCopy,

  h1: 'Fort Pierce Inlet Conditions',

  // Source: 03 sections 0, 1, 6.
  intro:
    'Fort Pierce Inlet is where the ocean and the Indian River Lagoon trade water, and the conditions there depend on the current, the waves, and the wind together. This page puts the three side by side: NOAA\'s predicted current, the latest wave and wind readings from nearby buoys, and a plain explanation of why waves behave differently against an outgoing current. It does not rate conditions or tell you whether to go out. For that, use the National Weather Service marine forecast and the Coast Guard.',

  /** One short line the UI prints under the current reading. */
  currentCaption:
    'Predicted, not measured. NOAA current prediction for Fort Pierce Inlet Entrance (station FPI0901).',

  whatYoureLookingAt: {
    heading: 'What you\'re looking at',
    paragraphs: [
      // Source: 03 section 0 (FPI0901 predictions only; real-time product returns "No data").
      'The current is NOAA\'s prediction for Fort Pierce Inlet Entrance (station FPI0901), not a live reading. NOAA has no working current sensor reporting there, so the number comes from tidal harmonics fitted to a 2008 to 2009 survey. It is good for when the current turns and roughly how strong it runs. It cannot see wind, rain runoff, or storm effects.',
      // Source: 03 section 0 (NDBC 41114/41113 wave-only; 41009 wind + waves; no nearshore inlet anemometer).
      'The wave and wind readings come from offshore buoys run by the National Data Buoy Center. They describe the open water where the buoy floats, not the inlet mouth, the shoal, or the ebb current itself, so the water at the inlet can look quite different from the buoy numbers.',
      // Source: 03 section 4 (period readings noisy: DPD flipped 3/13/3/9 s in 2 h while APD steady 3.3-3.9 s).
      'Wave period (the seconds between crests) can jump around in buoy data. On one recent afternoon the reported dominant period flipped between 3, 13, 3, and 9 seconds in two hours while the average period held steady between 3.3 and 3.9 seconds. We show period with that in mind.',
      // Source: 03 section 0 (Sebastian: no NOAA current-prediction station).
      'This page covers Fort Pierce Inlet only. Sebastian Inlet is not covered, because NOAA has no current-prediction station there and we do not want to guess a number for it.',
    ],
  } satisfies CopySection,

  howWeCalculate: {
    heading: 'How we calculate it',
    paragraphs: [
      // Source: 03 section 0 and section 5 (degradation policy).
      'We do not calculate a rating. Each number is shown as published, with its source and time, so you can see what is fresh and what is not.',
    ],
    bullets: [
      // 03 section 0 / 02 section 2 item 10: FPI0901 bin 1, MAX_SLACK or 60-minute interval; negative = ebb.
      'Current: NOAA\'s predicted speed and direction for station FPI0901 (depth bin 1). Predicted ebb is shown as flowing out toward the ocean and flood as flowing in. Current changes with depth, and the prediction is for one depth level only.',
      // 03 section 0: waves from NDBC 41114 primary; fallbacks.
      'Waves: height, period, and direction from the nearest National Data Buoy Center buoy with wave data (station 41114, Fort Pierce, first). If it is missing, a farther buoy is used and labeled as farther away.',
      // 03 section 0: 41009 wind + waves; 41114 wind missing.
      'Wind: from buoy 41009 off Cape Canaveral, which reports wind and waves. The Fort Pierce buoy does not report wind. There is no wind sensor at the inlet itself.',
      // 03 section 5: stale thresholds (waves 3 h, wind 6 h).
      'Freshness: if wave data is more than 3 hours old or wind data is more than 6 hours old, we mark that reading stale and show its timestamp.',
      // 03 section 0: NWS marine products.
      'Forecasts: we link to the National Weather Service Melbourne marine and surf zone forecasts, which cover waves, winds, and rip current risk. We do not write our own.',
    ],
  } satisfies CopySection,

  /**
   * Wave-current note. Source: 03 section 1 item 1.
   * Published physics (Longuet-Higgins and Stewart; US Army Corps of Engineers Coastal Engineering Manual).
   * Simple physics only: not a rating, not a prediction for the inlet mouth.
   */
  waveCurrentNote: {
    heading: 'Why waves against a current matter',
    paragraphs: [
      'When waves run into an opposing current, they get shorter and steeper. At Fort Pierce Inlet the ebb flows out toward the east-northeast, so waves coming in from the east and northeast are pushing against it. When the current flows with the waves, as on the flood, the effect is the opposite: waves flatten out.',
      'Wave physics gives a published threshold. When an opposing current reaches one quarter of the waves\' deep-water group speed (the speed at which a train of waves carries its energy), waves can no longer move forward against it and they stand up and break. Shorter-period waves reach that threshold at a lower current speed.',
    ],
    // Source: 03 section 1 item 1 ("My arithmetic: blocking opposing speed is 1.1 kt at T=3 s ... 3.4 kt at 9 s").
    thresholdsHeading: 'Opposing current speed at which that threshold is reached',
    thresholds: [
      { periodSeconds: 3, opposingCurrentKnots: 1.1 },
      { periodSeconds: 5, opposingCurrentKnots: 1.9 },
      { periodSeconds: 9, opposingCurrentKnots: 3.4 },
    ],
    caveat:
      'These figures assume deep water, so they are a rough guide to how sensitive short waves are, not a prediction of what the water will do at the inlet mouth, where it is shallow and the shape of the bottom matters too. Buoy numbers are not measured at the inlet. We do not turn this into a score.',
    plainEnglish:
      'In plain terms: short, choppy waves of 3 to 5 seconds are affected by a current of 1 to 2 knots, while longer waves of 9 seconds take over 3 knots. Predicted ebb at Fort Pierce Inlet is typically in the 2 to 3 knot range.',
  },

  /** 'What we don't claim' list. Source: 03 sections 0, 4, 5, 6. */
  whatWeDontClaim: [
    'We do not give a rating, a score, or a go or no-go call. Nothing on this page says it is safe or unsafe to boat, fish, swim, or surf.',
    'We do not measure the current. It is a NOAA prediction from a past survey, not a live sensor reading.',
    'We do not cover Sebastian Inlet. NOAA has no current-prediction station there.',
    'We do not claim the buoy readings match conditions at the inlet mouth, the shoal, or in the ebb current.',
    'We do not predict how waves will behave in the inlet. The wave-current note is general physics, not a forecast.',
    'We do not replace the National Weather Service, the US Coast Guard, or local inlet postings. If they have a warning or advisory out, follow it.',
  ],

  /**
   * Required disclaimer. Source: 03 section 6 ("Mandatory text visible near rating, not collapsed").
   * Show it near the data, not folded away.
   */
  mandatoryDisclaimer:
    'Informational only. These numbers come from predictions and buoys that can be late, missing, or unrepresentative of the inlet mouth. This page is not a safety assessment and is not advice to enter or avoid the water. Conditions at inlets can change in minutes and can be deadly. Check the National Weather Service Melbourne marine and surf zone forecasts and local Coast Guard broadcasts (Station Fort Pierce, VHF channel 16), and follow their warnings. If you boat at Sebastian Inlet, also check Sebastian Inlet District postings. In an emergency call 911 or hail the Coast Guard on VHF channel 16.',

  disclaimers: [
    'For information only. Do not use this page for navigation or for any decision about going out on the water.',
    'The current shown is a NOAA prediction, not a measurement. It is based on a 2008 to 2009 survey and does not account for wind, rain, or storms.',
    'Buoy waves and wind are offshore readings that may be late, missing, or very different from conditions at the inlet.',
    INDEPENDENCE_NOTE,
  ],

  /** Where to look instead. Source: 03 sections 0 and 6. */
  officialSources: [
    {
      label: 'National Weather Service Melbourne: marine and surf zone forecasts',
      note: 'Waves, winds, small craft advisories, rip current risk.',
      url: 'https://www.weather.gov/mlb/',
    },
    {
      label: 'US Coast Guard Station Fort Pierce',
      note: 'Local broadcasts on VHF channel 16. In an emergency, call 911 or hail on VHF channel 16.',
      url: 'https://www.uscg.mil/',
    },
  ],

  faq: [
    {
      q: 'Is the Fort Pierce Inlet current measured live?',
      // Source: 03 section 0; 02 section 2 item 10.
      a: 'No. The current is a NOAA prediction for Fort Pierce Inlet Entrance (station FPI0901), built from a 2008 to 2009 survey. NOAA\'s real-time current feed returns no data for that station. The prediction is good for when the current turns and roughly how strong it runs, but it does not include wind, rain runoff, or storm effects.',
    },
    {
      q: 'Why is Sebastian Inlet not on this page?',
      // Source: 03 section 0 (searched all 4,430 stations 27.0 to 28.5N; none for Sebastian).
      a: 'NOAA does not publish current predictions for Sebastian Inlet. We searched the NOAA station list for the area and found none, and we do not want to show an invented number for an inlet known for strong currents. This page covers Fort Pierce Inlet only.',
    },
    {
      q: 'Is there a rating or go or no-go score?',
      // Source: 03 section 6 policy; Mike's rule: never safe/unsafe.
      a: 'No. We show the current, the waves, and the wind, each with its source and time, and we leave the decision to you and to the official forecasts. Nothing here says it is safe or unsafe to boat. Check the National Weather Service marine forecast and local Coast Guard broadcasts before you go.',
    },
    {
      q: 'What are ebb, flood, and slack?',
      // Source: 03 section 0 (meanEbbDir 77, meanFloodDir 260); 02 section 2 item 10 (current leads height).
      a: 'Ebb is water flowing out of the inlet to the ocean, and flood is water flowing in. At Fort Pierce Inlet, NOAA lists the ebb as flowing toward about 77 degrees true (east-northeast) and the flood toward about 260 degrees (west-southwest). Slack is the brief pause when the current turns. Slack does not line up exactly with high or low tide: NOAA\'s predicted current can turn before the tide height peaks.',
    },
    {
      q: 'Why does the page talk about waves against a current?',
      // Source: 03 section 1 item 1.
      a: 'Because it changes the waves. An opposing current makes waves shorter and steeper. Published wave physics says waves are blocked when the opposing current reaches one quarter of their deep-water group speed. That works out to about 1.1 knots for 3-second waves, about 1.9 knots for 5-second waves, and about 3.4 knots for 9-second waves. These numbers assume deep water, so they are a rough guide, not a prediction for the inlet mouth.',
    },
    {
      q: 'Where do the wave and wind numbers come from, and how close are they to the inlet?',
      // Source: 03 section 0 and section 4.
      a: 'Waves come from National Data Buoy Center buoy 41114 (Fort Pierce) when it is reporting. Wind comes from buoy 41009 off Cape Canaveral, because the Fort Pierce buoy does not report wind. These buoys are offshore, so they describe open water, not the inlet mouth, the shoal, or the ebb current. Readings can also be late or missing, and we mark stale data with its timestamp.',
    },
  ] satisfies FaqItem[],

  glossaryKeys: ['ebbFlood', 'slack', 'significantWaveHeight'] as const,

  sourceKeys: ['noaa-fpi0901', 'ndbc-41114', 'ndbc-41009', 'nws-mlb'] as const,
};

/** FAQPage JSON-LD for /inlets. */
export const INLETS_FAQ_JSONLD: FaqJsonLd = toFaqJsonLd(INLETS_PAGE.faq);

// ---------------------------------------------------------------------------
// Source credits (both pages pick entries via sourceKeys)
// ---------------------------------------------------------------------------

export const SOURCE_CREDITS: Record<string, SourceCredit> = {
  'usgs-02251800': {
    id: 'usgs-02251800',
    agency: 'US Geological Survey (USGS)',
    identifier: '02251800, Indian River at Wabasso, FL',
    // Source: 04 section 1 (15-min IV, param 63160 NAVD88; approved through ~Nov 2025, provisional after).
    use: 'Live lagoon water level, 15-minute readings, feet relative to NAVD88 (parameter 63160).',
    caveat:
      'Provisional data: recent values are unreviewed and can be revised. It is the only live lagoon-level gauge in the Sebastian to Fort Pierce stretch.',
    url: 'https://waterdata.usgs.gov/monitoring-location/02251800/',
  },
  'noaa-8722105': {
    id: 'noaa-8722105',
    agency: 'NOAA Center for Operational Oceanographic Products and Services (CO-OPS)',
    identifier: '8722105, Vero Beach (ocean) tide predictions',
    // Source: 02 section 1 (subordinate station, hilo only; reference 8723178 Miami Beach).
    use: 'Predicted ocean high and low tides near Vero, which we delay and shrink to estimate the lagoon tide.',
    caveat:
      'A subordinate station: NOAA publishes only highs and lows, derived from offsets to a reference station at Miami Beach. Predictions are astronomical and do not include wind, rain, or the seasonal rise.',
    url: 'https://tidesandcurrents.noaa.gov/stationhome.html?id=8722105',
  },
  'noaa-8722125': {
    id: 'noaa-8722125',
    agency: 'NOAA CO-OPS',
    identifier: '8722125, Vero Beach (lagoon) tide predictions',
    // Source: 02 section 1 and section 4 (no Sa/Ssa); 04 section 2 (amplitude too large for Wabasso).
    use: 'NOAA\'s own lagoon-side Vero Beach prediction, used as a comparison.',
    caveat:
      'Prediction only, with no observed water level and no Sa/Ssa seasonal terms. Its tide size runs larger than what the Wabasso gauge shows.',
    url: 'https://tidesandcurrents.noaa.gov/stationhome.html?id=8722125',
  },
  'noaa-8721604': {
    id: 'noaa-8721604',
    agency: 'NOAA CO-OPS',
    identifier: '8721604, Trident Pier (Port Canaveral)',
    // Source: 02 section 2 item 8 and section 8; 04 section 1 (about 85 mi north).
    use: 'Nearest observed ocean water level, 6-minute readings. Reference gauge for the flood watch.',
    caveat:
      'About 85 miles north of Vero. It shows how far the ocean runs above NOAA\'s prediction, not the lagoon level. Recent readings are preliminary.',
    url: 'https://tidesandcurrents.noaa.gov/stationhome.html?id=8721604',
  },
  'noaa-fpi0901': {
    id: 'noaa-fpi0901',
    agency: 'NOAA CO-OPS',
    identifier: 'FPI0901, Fort Pierce Inlet Entrance current predictions',
    // Source: 03 section 0; 02 section 2 item 10 (survey 2008-09).
    use: 'Predicted ebb, flood, and slack times and speeds at Fort Pierce Inlet.',
    caveat:
      'A prediction from a 2008 to 2009 survey, not a live reading. NOAA has no real-time current data for this station. It does not include wind, rain, or storm effects.',
    url: 'https://tidesandcurrents.noaa.gov/noaacurrents/predictions?id=FPI0901',
  },
  'ndbc-41114': {
    id: 'ndbc-41114',
    agency: 'National Data Buoy Center (NDBC)',
    identifier: '41114, Fort Pierce buoy',
    // Source: 03 section 0 (wave height, periods, direction; wind missing).
    use: 'Wave height, period, and direction near Fort Pierce.',
    caveat:
      'Offshore reading, not at the inlet mouth. Does not report wind. Period values can jump between reports.',
    url: 'https://www.ndbc.noaa.gov/station_page.php?station=41114',
  },
  'ndbc-41009': {
    id: 'ndbc-41009',
    agency: 'National Data Buoy Center (NDBC)',
    identifier: '41009, Cape Canaveral buoy',
    // Source: 03 section 0 (wind + waves; ~20 nm).
    use: 'Offshore wind and waves, used when the Fort Pierce buoy has no wind.',
    caveat: 'Located off Cape Canaveral, well north of Fort Pierce. It does not describe wind at the inlet.',
    url: 'https://www.ndbc.noaa.gov/station_page.php?station=41009',
  },
  'nws-mlb': {
    id: 'nws-mlb',
    agency: 'National Weather Service, Melbourne, FL',
    identifier: 'Coastal Waters Forecast and Surf Zone Forecast',
    // Source: 03 section 0 (CWF, SRF, alerts); section 6 (defer to NWS).
    use: 'Official marine and surf zone forecasts and advisories. We link to them and do not repeat them.',
    caveat: 'If the National Weather Service has an advisory or warning out, it takes priority over anything on this site.',
    url: 'https://www.weather.gov/mlb/',
  },
};

// ---------------------------------------------------------------------------
// Data notes (changelog style, newest first)
// ---------------------------------------------------------------------------

export const DATA_NOTES: DataNote[] = [
  {
    date: '2026-09-30',
    // Source: 04 section 0 and section 1.
    note: 'Lagoon method tested on 395 days of hourly data (September 1, 2025 to September 30, 2026) at USGS 02251800, Wabasso. USGS data is approved through about November 2025 and provisional after that.',
  },
  {
    date: '2026-09-30',
    // Source: 04 section 7.
    note: 'Accuracy numbers on the lagoon page are backtest results. We plan to revisit them after about 3 months of live logging and update the page.',
  },
  {
    date: '2026-09-30',
    // Source: 04 section 1.
    note: 'No second lagoon gauge is available to check other locations. The USGS site at Fort Pierce on the Intracoastal Waterway (272814080194100) exists but returns no readings, and the other USGS stations near the lagoon measure freshwater creeks and canals.',
  },
  {
    date: '2026-09-30',
    // Source: 04 section 1; 02 section 2 item 8.
    note: 'NOAA has no observed water-level gauge at Vero, Sebastian Inlet, or Fort Pierce. The nearest are Trident Pier (about 85 miles north) and Lake Worth Pier (about 85 miles south). The flood watch uses Trident Pier.',
  },
  {
    date: '2026-09-30',
    // Source: 02 section 4 (obs +0.53 ft vs prediction at 20:00 EDT; 72-h mean +0.93 ft).
    note: 'On the evening of September 30, 2026, Trident Pier ran about 0.5 ft above NOAA\'s prediction, and about 0.9 ft above on its 72-hour average. That is the kind of fall ocean rise the flood watch looks for.',
  },
  {
    date: '2026-09-30',
    // Source: 02 section 4 (Trident predicted peaks 5.21 ft MLLW 2026-10-28; minor threshold 5.69 ft MLLW; +0.9 ft anomaly => about 6.1).
    note: 'The highest astronomical tides at Trident Pier over the next two months are predicted around October 27 to 29 and November 25 to 26, with a peak of 5.21 ft above MLLW on October 28. That is below Trident\'s NOAA minor flood threshold of 5.69 ft, but adding the recent ocean excess of about 0.9 ft would put it near 6.1 ft.',
  },
  {
    date: '2026-09-30',
    // Source: 04 section 6 (worst event 2025-10-11 to 12, 1.4 to 1.64 ft under-predicted).
    note: 'Worst miss in the backtest: October 11 to 12, 2025, when an un-anchored version came in 1.4 to 1.64 ft too low during a wet, high-ocean spell with only 9 to 17 mph wind. This is why we do not claim skill for rain or fall high-water events.',
  },
  {
    date: '2026-09-30',
    // Source: 02 section 1 (Vero harcon "no Sa/Ssa"); 02 section 7 item 5 (epoch 1983-2001).
    note: 'NOAA\'s Vero Beach lagoon prediction (8722125) does not include the yearly sea-level cycles (Sa and Ssa), and NOAA\'s tidal datums for this area use a 1983 to 2001 reference period.',
  },
  {
    date: '2026-09-30',
    // Source: 03 section 0 (FPI0901 real-time returns "No data"; bin param required); 02 section 2 item 10 (survey 2008-09).
    note: 'Fort Pierce Inlet current is a NOAA prediction (station FPI0901) from a 2008 to 2009 survey. NOAA\'s real-time current feed has no data for that station.',
  },
  {
    date: '2026-09-30',
    // Source: 03 section 0 (searched all 4,430 stations, 27.0 to 28.5 N).
    note: 'Sebastian Inlet: no NOAA current-prediction station exists. We searched NOAA\'s list of 4,430 stations between 27.0 and 28.5 degrees north and found none, so Sebastian is not covered.',
  },
  {
    date: '2026-09-30',
    // Source: 03 section 4 (41114 DPD flipped 3/13/3/9 s in 2 h while APD steady 3.3 to 3.9 s).
    note: 'Buoy 41114 reported a wave period that flipped between 3, 13, 3, and 9 seconds within two hours while its average period held at 3.3 to 3.9 seconds. Period readings can be noisy, so we show them with that caution.',
  },
  {
    date: '2026-09-30',
    // Source: 03 section 0 (41114 and 41113 wind = MM, wave-only).
    note: 'Buoy 41114 reports waves but no wind. Wind on the inlets page comes from buoy 41009 off Cape Canaveral.',
  },
];
