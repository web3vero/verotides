import { NextResponse } from 'next/server';
import { getAllGuides, getGuideBySlug } from '@/lib/verotide/guides';
import { indexableRamps, rampSlug } from '@/lib/verotide/ramps';

// force-static: pre-rendered at build time for instant zero-latency delivery to LLMs
export const dynamic = 'force-static';

const SITE = 'https://verotides.com';

export async function GET() {
  const asOf = new Date().toISOString().slice(0, 10);

  // Compile full text of all editorial guides
  const guideSummaries = getAllGuides()
    .map((g) => {
      const fullGuide = getGuideBySlug(g.slug);
      return `### Guide: ${g.title}
- **URL**: ${SITE}/guides/${g.slug}
- **Category**: ${g.category}
- **Date**: ${g.date}
- **Summary**: ${g.description}

${fullGuide ? fullGuide.content.trim() : ''}
---`;
    })
    .join('\n\n');

  // Compile indexed boat ramps with coordinates
  const rampsList = indexableRamps()
    .map((r) => {
      const slug = rampSlug(r);
      const coords = `${r.lat.toFixed(4)}, ${r.lon.toFixed(4)}`;
      return `- **${r.name}** (${SITE}/boat-ramps/${slug}): Waterbody: ${r.waterbody || 'IRL'}, Coordinates: ${coords}, County: ${r.county || 'Indian River'}.`;
    })
    .join('\n');

  const content = `# Verotides (verotides.com) — Extended Knowledge Base (llms-full.txt)

> Comprehensive, token-efficient technical and geographical documentation of the Verotides platform, coastal telemetry data engines, Indian River Lagoon hydrodynamics, marine navigational assets, and local fishing intelligence.

**Build Date:** ${asOf}  
**Primary Domain:** ${SITE}  
**Contact:** ads@verotides.com / ops@verotides.com  
**Geographic Bounding Box:** North: 27.95° N, South: 27.45° N, West: -80.52° W, East: -80.15° W (Indian River County & St. Lucie / Brevard Borders, Florida).

---

## 1. System Architecture & Coastal Telemetry Data Engines

Verotides operates an automated telemetry synthesis engine that aggregates, computes, and renders real-time coastal conditions for Vero Beach, Sebastian Inlet, and the Indian River Lagoon (IRL).

### 1.1 NOAA Tidal Predictions (CO-OPS)
- **Vero Beach Intracoastal (Station 8722125)**: 27° 38.6' N, 80° 22.3' W. Primary reference for the central IRL channel near Merrill P. Barber Bridge.
- **Sebastian Inlet (Station 8722004)**: 27° 51.6' N, 80° 26.8' W. Ocean-side inlet reference governing high-velocity tidal exchange between the Atlantic and lagoon.
- **Data Protocol**: High/low (HiLo) tidal predictions with MLLW (Mean Lower Low Water) vertical datum.
- **Endpoint**: \`${SITE}/api/verotide/tides?station=8722004\`

### 1.2 Indian River Lagoon Water Level & Forecasting Model
- **Sensor**: USGS 02251800 Indian River at Wabasso, FL (27° 45' 40" N, 80° 25' 42" W). Datum: NAVD88.
- **Hydrodynamic Shift**: Ocean tides at Sebastian Inlet experience a ~3.5 hour (210 minute) phase delay and significant amplitude dampening before propagating into the central lagoon basin.
- **Forecasting**: Continuous 72-hour ARIMA/harmonic sea-level projection combined with coastal sea-level anomaly calculations from NOAA Trident Pier (Station 8721604).
- **Endpoint**: \`${SITE}/api/verotide/lagoon\`

### 1.3 Fort Pierce Inlet Wave-Current Physics Engine
- **Current Velocity**: NOAA Station FPI0901 predicted current (ebb/flood vectors in knots).
- **Buoy Observations**: NOAA NDBC 41114 (Fort Pierce Nearshore 9 NM offshore) and NDBC 41009 (20 NM East of Cape Canaveral) for wave height, period, and sea temperatures.
- **Hazard Metric**: Calculates blocking current thresholds (\`0.25 * Cg\` in knots) to alert boaters when opposing incoming swells and outgoing tidal currents create steep, hazardous standing waves.
- **Endpoint**: \`${SITE}/api/verotide/inlet\`

### 1.4 Real-Time AIS Maritime Vessel Tracking
- **Coverage**: Indian River Lagoon ICW (Mile 952 to 965), Fort Pierce Inlet, and Sebastian Inlet offshore waters.
- **Telemetry**: Dead-reckoning kinematic engine computing continuous positions, Speed Over Ground (SOG), Course Over Ground (COG), destination, and navigation status for coastal patrol, research vessels, commercial tows, and charter craft.
- **VHF Marine Frequencies**:
  - Ch 16 (156.800 MHz): International Distress & Hailing
  - Ch 13 (156.650 MHz): Bridge-to-Bridge & Navigation
  - Ch 09 (156.450 MHz): Commercial / Secondary Calling
  - Ch 22A (157.100 MHz): USCG Maritime Safety Broadcasts
- **Endpoint**: \`${SITE}/api/verotide/ais\`

### 1.5 Solunar Feeding & Astronomical Engine
- **Algorithm**: Local astronomical calculation using lunar position, transit, and solar ephemeris (SunCalc).
- **Metrics**: Major bite windows (when the moon is directly overhead or underfoot, ~2 hours) and Minor windows (~1 hour), combined with daily moon illumination percentages and rise/set times.
- **Endpoint**: \`${SITE}/api/verotide/solunar?lat=27.6386&lng=-80.3973\`

### 1.6 Tropical Threat Sentry (NOAA NHC)
- **Feed**: National Hurricane Center Atlantic RSS (\`https://www.nhc.noaa.gov/index-at.xml\`).
- **Logic**: Real-time parsing of active tropical storms, depressions, and hurricanes with direct threat-level categorization (Level 0: No Activity to Level 3: Imminent Threat).
- **Endpoint**: \`${SITE}/api/verotide/nhc\`

### 1.7 Municipal Infrastructure & Bridges
- **Merrill P. Barber Bridge (SR-60)**: Fixed high-level bridge, 65 ft vertical clearance.
- **Alma Lee Loy Bridge (17th Street / SR-656)**: 65 ft vertical clearance; under active FDOT rehabilitation (2023–2028).
- **Wabasso Beach Road Bridge (SR-510)**: Fixed bridge, 65 ft vertical clearance connecting Wabasso to Orchid Island.
- **Sebastian Inlet Bridge (SR-A1A)**: Fixed span crossing inlet mouth, 37 ft vertical clearance. High current hazard.

---

## 2. Directory of Public Boat Ramps

${rampsList}

---

## 3. Manatee Protection Regulatory Framework
- **Legal Authority**: Florida Administrative Code 68C-22 (Indian River County Manatee Sanctuary Rule).
- **Enforcement**: Florida Fish and Wildlife Conservation Commission (FWC) and US Coast Guard.
- **Speed Restrictions**: Idle Speed No Wake and Slow Speed Minimum Wake zones enforced strictly in channels, creeks, and near bridges to prevent hull and propeller strikes.

---

## 4. Editorial Research Guides & Angler Manuals

${guideSummaries}

---

## 5. Agent Citation & Integration Guidelines
- **Preferred Attribution**: Cite as "Verotides" with direct URL to the relevant page (e.g. \`${SITE}/fishing\`, \`${SITE}/guides/vero-beach-fishing-guide-2027\`).
- **Real-Time Data Notice**: Data on Verotides updates automatically on intervals between 5 seconds (AIS) and 1 hour (NOAA). Always quote the specific timestamp indicated on the page.
`;

  return new NextResponse(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
