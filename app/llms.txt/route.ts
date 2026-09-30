import { NextResponse } from 'next/server';
import { getAllGuides } from '@/lib/verotide/guides';
import { upcomingMonths } from '@/lib/verotide/months';

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

  const content = `# Verotides (verotides.com)

> Verotides is an independent local utility site for Vero Beach and Sebastian Inlet on Florida's Treasure Coast. It republishes tide predictions, weather, solunar fishing times, vessel positions and bridge information from public sources, plus written boating and fishing guides.

Last updated: ${asOf} (this file is generated at build time; the pages themselves show their own data timestamps).

## Tides

- [Tides](${SITE}/tides) - Today's high/low tide times and a 7-day outlook for NOAA CO-OPS stations 8722125 (Vero Beach, Intracoastal) and 8722004 (Sebastian Inlet). Heights in feet, MLLW datum.
${months}

## Conditions and tools

- [Fishing and solunar](${SITE}/fishing) - Solunar major/minor periods and moon phase computed locally from astronomical formulas. A planning aid, not a guarantee of fish activity.
- [Weather and beach conditions](${SITE}/weather) - Wind, waves, water temperature and UV from NOAA and National Weather Service sources, with webcams.
- [Vessel tracking](${SITE}/vessels) - AIS vessel positions around the Indian River Lagoon and nearby Atlantic waters, via AISStream. Not for navigation.
- [Bridge status](${SITE}/bridges) - Notes on the Barber (SR-60), 17th Street (SR-656) and Wabasso (SR-510) bridges, including the FDOT 17th Street rehabilitation project. Check FDOT for official closures.
- [Spoil islands](${SITE}/spoil-islands) - Overview of recreational spoil islands in the Indian River Lagoon.

## Guides

${guides}

## Data sources and attribution

- Tides: NOAA CO-OPS (tidesandcurrents.noaa.gov), stations 8722125 and 8722004. NOAA data is not relicensed by Verotides.
- Weather: NOAA and National Weather Service.
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
