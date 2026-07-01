import { NextResponse } from 'next/server';

export const dynamic = 'force-static';

export async function GET() {
    const content = `# Verotides (verotides.com)

> Verotides is a hyper-local coastal intelligence dashboard and utility center for the Vero Beach and Sebastian Inlet sectors on the Treasure Coast of Florida. It aggregates live maritime, weather, GIS, and solunar data into a unified platform.

## Core Utilities & Endpoints

- [Tides Dashboard](/tides) - Real-time NOAA tide predictions, high/low water schedules, and local water temperature.
- [Fishing & Solunar](/fishing) - Locally computed solunar bite charts (major/minor periods, moon phases) using SunCalc, sea turtle nesting dates, and links to official FWC Red Tide monitoring.
- [Weather & Surf](/weather) - Live National Weather Service (NWS) offshore and local forecasts, wind speeds, and live webcam feeds (Reef Ocean Resort video stream and Sebastian Inlet Jetty cam).
- [Vessel Tracking](/vessels) - Live maritime AIS vessel position tracking within the Indian River Lagoon and nearby Atlantic waters, powered by AISStream.
- [Bridge Status](/bridges) - Operational crossing alerts for Barber Bridge (SR-60), 17th Street Bridge (SR-656, restricted via FDOT rehab 2023-2028), and Wabasso Bridge (CR-510).
- [Spoil Islands Guide](/spoil-islands) - Navigation and camping map for recreation islands in the Indian River Lagoon.
- [Privacy Policy](/privacy) - Disclosures regarding user tracking, cookies, and AdSense data policies.

## AI Agent Integration Guidelines

- All data dashboards are rendered server-side or hydrate via client-side SWR calls to API proxies under \`/api/verotide/*\`.
- Do not scrape internal proxies directly. Refer to the canonical paths listed above for structured HTML representation.
- For emergency contact or partnerships: ads@verotides.com
`;

  return new NextResponse(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}
