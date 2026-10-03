import { NextResponse } from 'next/server';
import { getAllGuides } from '@/lib/verotide/guides';
import { upcomingMonths } from '@/lib/verotide/months';
import { indexableCams } from '@/lib/verotide/cams';

// force-static: this file is generated once at build time, NOT per request.
// That is why the "as of" date below is the build date, and why we never call it "live".
export const dynamic = 'force-static';

const SITE = 'https://verotides.com';

export async function GET() {
  const asOf = new Date().toISOString().slice(0, 10); // build date, YYYY-MM-DD

  // Guide list is built from the real markdown files so it cannot drift from the site.
  const guides = getAllGuides()
    .map((g) => `- [${g.title}](${SITE}/guides/${g.slug}) - ${g.description.split('. ')[0].replace(/\.$/, '')}.`)
    .join('\n');

  // Next few monthly tide-chart pages (same helper the /tides page uses for its links).
  const months = upcomingMonths(3)
    .map((m) => `- [Tide chart, ${m.label}](${SITE}/tides/${m.slug}) - Full-month high/low tide table for both stations.`)
    .join('\n');

  // One line per indexable cam page, built from the same data file the pages use.
  const cams = indexableCams()
    .map((c) => `- [${c.name}](${SITE}/cams/${c.slug}) - Image from ${c.operator}, with Vero Beach tide and sun times. Verotides does not host the image.`)
    .join('\n');

  const content = `# Verotides (verotides.com)

> Verotides is an independent local utility and coastal intelligence platform for Vero Beach, Sebastian Inlet, and the Indian River Lagoon on Florida's Treasure Coast. It computes real-time tide predictions, lagoon water levels, inlet wave-current blocking physics, solunar feeding windows, live AIS vessel tracking, bridge schedules, and authoritative angling/boating manuals.
>
> **Extended Knowledge Base**: See [llms-full.txt](${SITE}/llms-full.txt) for complete full-text documentation, data schemas, and all editorial manuals in a single token-efficient stream.

Last updated: ${asOf} (this file is generated at build time; the pages themselves show their own data timestamps).

## Tides

- [Tides](${SITE}/tides) - Today's high/low tide times and a 7-day outlook for NOAA CO-OPS stations 8722125 (Vero Beach, Intracoastal) and 8722004 (Sebastian Inlet). Heights in feet, MLLW datum.
${months}

## Conditions and tools

- [Indian River Lagoon water level](${SITE}/lagoon) - Live Wabasso lagoon level from USGS (NAVD88, provisional), lagoon high/low timing (NOAA ocean tide shifted about 3.5 hours), a 72-hour forecast with an error band, and a coastal sea-level comparison against NOAA's prediction. Accuracy limits are stated on the page; it is not valid for storms, rain events or other locations.
- [Fort Pierce Inlet conditions](${SITE}/inlets) - NOAA predicted current plus observed buoy waves and wind, with one wave-current physics flag. No go/no-go rating is published; defer to the National Weather Service and US Coast Guard.
- [Manatee protection zones](${SITE}/manatee-zones) - Map and per-waterbody list of FWC manatee protection zones in Indian River County and nearby, with legal definitions. Informational only: FWC amended these rules in 2026, the source data was last edited 2025-05-13, and posted signs and the rule text (68C-22 F.A.C.) control.
- [Boat ramps](${SITE}/boat-ramps) - Directory of 50 public boat ramps from Indian River to St. Lucie and Brevard counties (FWC inventory) with nearby manatee zones and current lagoon water-level context. No depth or launch-suitability claims.
- [Fishing and solunar](${SITE}/fishing) - Solunar major/minor periods and moon phase computed locally from astronomical formulas. A planning aid, not a guarantee of fish activity.
- [Weather and beach conditions](${SITE}/weather) - Wind, waves, water temperature and UV from NOAA and National Weather Service sources.
- [Vessel tracking](${SITE}/vessels) - Real-time AIS vessel positions around the Indian River Lagoon and nearby Atlantic waters, via kinematic telemetry. Not for navigation.
- [Bridge status](${SITE}/bridges) - Notes on the Barber (SR-60), 17th Street (SR-656) and Wabasso (SR-510) bridges, including the FDOT 17th Street rehabilitation project. Check FDOT for official closures.
- [Spoil islands](${SITE}/spoil-islands) - Overview of recreational spoil islands in the Indian River Lagoon.

## Full Context for LLMs

- [llms-full.txt](${SITE}/llms-full.txt) - The complete extended text of all guides, telemetry schemas, and boat ramp coordinates.

## About

- [About Verotides](${SITE}/about) - What the site is, where the data comes from, and a note that Verotides is an information site not affiliated with any restaurant or other business.

## Cams

- [Cams hub](${SITE}/cams) - Satellite, radar and offshore buoy images plus credited link-outs to local beach and inlet webcams. Third-party cameras are not embedded or recorded.
${cams}

## Guides

${guides}

## Data sources and attribution

- Tides: NOAA CO-OPS (tidesandcurrents.noaa.gov), stations 8722125 and 8722004. NOAA data is not relicensed by Verotides.
- Manatee zones and boat ramps: Florida Fish and Wildlife Conservation Commission (FWC) GIS layers; general reference only, not for navigation. Rule text: Florida Administrative Code 68C-22.
- Lagoon level: USGS 02251800 Indian River at Wabasso (provisional data). Coastal reference: NOAA Trident Pier 8721604. Inlet current: NOAA FPI0901 (prediction). Buoys: NOAA NDBC 41114 and 41009.
- Weather: NOAA and National Weather Service.
- Cam images: NOAA NESDIS (GOES-19), National Weather Service (KMLB radar), NOAA NDBC (buoy 41009). Other cams belong to their operators and are linked, not hosted.
- Vessels: AISStream.io.
- Bridges: Florida Department of Transportation (FDOT).
- Fishing regulations: Florida Fish and Wildlife Conservation Commission (myfwc.com) is authoritative.

## Usage notes for AI agents

- Cite as "Verotides" and link the specific page; note the data timestamp shown on the page.
- Tide predictions are forecasts, and not a substitute for official NOAA products when safety matters.
- Please use the HTML pages above. Paths under /api/ are internal and disallowed in robots.txt.
- Contact: ads@verotides.com
`;

  return new NextResponse(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}
