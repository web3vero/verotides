import { NextResponse } from 'next/server';
import type { AisVessel } from '@/lib/verotide/ais-types';

export type { AisVessel };

interface Waypoint {
  lat: number;
  lng: number;
}

interface VesselProfile {
  mmsi: number;
  name: string;
  callsign: string;
  type: string;
  category: AisVessel['category'];
  speedKt: number;
  status: string;
  destination: string;
  lengthFt: number;
  beamFt: number;
  waypoints: Waypoint[];
  cycleMinutes: number;
  offsetPhase: number; // 0..1 phase offset
}

// Haversine distance in meters
function getDistanceMeters(p1: Waypoint, p2: Waypoint): number {
  const R = 6371000;
  const dLat = (p2.lat - p1.lat) * (Math.PI / 180);
  const dLng = (p2.lng - p1.lng) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(p1.lat * (Math.PI / 180)) * Math.cos(p2.lat * (Math.PI / 180)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Initial bearing from p1 to p2 in degrees 0..360
function getBearing(p1: Waypoint, p2: Waypoint): number {
  const lat1 = p1.lat * (Math.PI / 180);
  const lat2 = p2.lat * (Math.PI / 180);
  const dLng = (p2.lng - p1.lng) * (Math.PI / 180);
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  const deg = (Math.atan2(y, x) * 180) / Math.PI;
  return Math.round((deg + 360) % 360);
}

// Real nautical corridors in Indian River County & Atlantic coast
const FLEET_PROFILES: VesselProfile[] = [
  {
    mmsi: 368001000,
    name: 'USCG CUTTER GANNET (WPB-87334)',
    callsign: 'NAQC',
    type: 'USCG Coastal Patrol',
    category: 'law_enforcement',
    speedKt: 13.5,
    status: 'UNDERWAY_USING_ENGINE',
    destination: 'PATROL_SECTOR_MIAMI',
    lengthFt: 87,
    beamFt: 19,
    cycleMinutes: 45,
    offsetPhase: 0.15,
    waypoints: [
      { lat: 27.892, lng: -80.221 },
      { lat: 27.765, lng: -80.245 },
      { lat: 27.638, lng: -80.272 },
      { lat: 27.512, lng: -80.298 },
      { lat: 27.638, lng: -80.272 },
      { lat: 27.765, lng: -80.245 },
    ],
  },
  {
    mmsi: 367451290,
    name: 'R/V SUNKEEPER',
    callsign: 'WDJ2024',
    type: 'HBOI Research Vessel',
    category: 'research',
    speedKt: 6.2,
    status: 'ENGAGED_IN_SURVEY',
    destination: 'HBOI_ESTUARY_LAB',
    lengthFt: 65,
    beamFt: 18,
    cycleMinutes: 35,
    offsetPhase: 0.42,
    waypoints: [
      { lat: 27.535, lng: -80.355 },
      { lat: 27.592, lng: -80.362 },
      { lat: 27.641, lng: -80.371 },
      { lat: 27.685, lng: -80.385 },
      { lat: 27.641, lng: -80.371 },
      { lat: 27.592, lng: -80.362 },
    ],
  },
  {
    mmsi: 367990123,
    name: 'VERO HARBOR PILOT // VERO-1',
    callsign: 'VERO1',
    type: 'Harbor Pilot / Escort',
    category: 'law_enforcement',
    speedKt: 8.4,
    status: 'UNDERWAY_USING_ENGINE',
    destination: 'VERO_MARINA_DOCK',
    lengthFt: 42,
    beamFt: 13,
    cycleMinutes: 20,
    offsetPhase: 0.05,
    waypoints: [
      { lat: 27.652, lng: -80.364 },
      { lat: 27.640, lng: -80.369 },
      { lat: 27.625, lng: -80.374 },
      { lat: 27.640, lng: -80.369 },
    ],
  },
  {
    mmsi: 366912340,
    name: 'INTRACOASTAL TUG INTREPID',
    callsign: 'WDF4421',
    type: 'Commercial Tow / Tug',
    category: 'commercial',
    speedKt: 6.8,
    status: 'RESTRICTED_MANEUVERABILITY',
    destination: 'JACKSONVILLE_FL',
    lengthFt: 110,
    beamFt: 32,
    cycleMinutes: 60,
    offsetPhase: 0.65,
    waypoints: [
      { lat: 27.520, lng: -80.348 },
      { lat: 27.605, lng: -80.365 },
      { lat: 27.710, lng: -80.392 },
      { lat: 27.830, lng: -80.442 },
      { lat: 27.710, lng: -80.392 },
      { lat: 27.605, lng: -80.365 },
    ],
  },
  {
    mmsi: 367123987,
    name: 'SEBASTIAN CHARTER // REEL TIME',
    callsign: 'WDH8822',
    type: 'Sport Charter 48ft',
    category: 'charter',
    speedKt: 17.2,
    status: 'UNDERWAY_USING_ENGINE',
    destination: 'SEBASTIAN_REEF_RIDGE',
    lengthFt: 48,
    beamFt: 16,
    cycleMinutes: 30,
    offsetPhase: 0.28,
    waypoints: [
      { lat: 27.859, lng: -80.452 },
      { lat: 27.863, lng: -80.435 },
      { lat: 27.871, lng: -80.380 },
      { lat: 27.885, lng: -80.310 },
      { lat: 27.871, lng: -80.380 },
      { lat: 27.863, lng: -80.435 },
    ],
  },
  {
    mmsi: 368994321,
    name: 'PELICAN ISLAND SURVEY // FWC-22',
    callsign: 'FWC22',
    type: 'FWC Marine Resource',
    category: 'law_enforcement',
    speedKt: 5.4,
    status: 'UNDERWAY_USING_ENGINE',
    destination: 'PELICAN_ISLAND_SANCTUARY',
    lengthFt: 31,
    beamFt: 10,
    cycleMinutes: 28,
    offsetPhase: 0.81,
    waypoints: [
      { lat: 27.820, lng: -80.428 },
      { lat: 27.805, lng: -80.421 },
      { lat: 27.785, lng: -80.412 },
      { lat: 27.805, lng: -80.421 },
    ],
  },
  {
    mmsi: 366778899,
    name: 'ACOE DREDGE OSPREY',
    callsign: 'WDE9911',
    type: 'Hydraulic Dredge',
    category: 'commercial',
    speedKt: 1.1,
    status: 'ENGAGED_IN_DREDGING',
    destination: 'INLET_SAND_TRAP_BYPASS',
    lengthFt: 140,
    beamFt: 36,
    cycleMinutes: 50,
    offsetPhase: 0.5,
    waypoints: [
      { lat: 27.861, lng: -80.449 },
      { lat: 27.862, lng: -80.446 },
      { lat: 27.861, lng: -80.449 },
    ],
  },
  {
    mmsi: 367882211,
    name: 'S/V HORIZON BOUND',
    callsign: 'WDJ7714',
    type: 'Cruising Sloop 42ft',
    category: 'recreational',
    speedKt: 6.4,
    status: 'UNDERWAY_USING_ENGINE',
    destination: 'KEY_WEST_FL',
    lengthFt: 42,
    beamFt: 14,
    cycleMinutes: 40,
    offsetPhase: 0.33,
    waypoints: [
      { lat: 27.675, lng: -80.378 },
      { lat: 27.645, lng: -80.370 },
      { lat: 27.618, lng: -80.364 },
      { lat: 27.575, lng: -80.358 },
      { lat: 27.618, lng: -80.364 },
      { lat: 27.645, lng: -80.370 },
    ],
  },
];

function interpolateVessel(profile: VesselProfile, nowMs: number): AisVessel {
  const cycleMs = profile.cycleMinutes * 60 * 1000;
  const elapsed = (nowMs % cycleMs) / cycleMs; // 0..1
  const phase = (elapsed + profile.offsetPhase) % 1;

  const pts = profile.waypoints;
  if (pts.length < 2) {
    const pt = pts[0] || { lat: 27.6386, lng: -80.3973 };
    return {
      mmsi: profile.mmsi,
      name: profile.name,
      callsign: profile.callsign,
      type: profile.type,
      category: profile.category,
      lat: pt.lat,
      lng: pt.lng,
      sog: profile.speedKt,
      cog: 0,
      status: profile.status,
      destination: profile.destination,
      lengthFt: profile.lengthFt,
      beamFt: profile.beamFt,
      lastPing: new Date(nowMs).toISOString(),
    };
  }

  // Calculate cumulative segment distances
  const distances: number[] = [];
  let totalDist = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    const d = getDistanceMeters(pts[i], pts[i + 1]);
    distances.push(d);
    totalDist += d;
  }

  const targetDist = phase * totalDist;
  let accumulated = 0;
  let segIdx = 0;
  let segFraction = 0;

  for (let i = 0; i < distances.length; i++) {
    const nextAcc = accumulated + distances[i];
    if (targetDist <= nextAcc || i === distances.length - 1) {
      segIdx = i;
      segFraction = distances[i] > 0 ? (targetDist - accumulated) / distances[i] : 0;
      break;
    }
    accumulated = nextAcc;
  }

  const p1 = pts[segIdx];
  const p2 = pts[segIdx + 1] || p1;

  const lat = p1.lat + (p2.lat - p1.lat) * segFraction;
  const lng = p1.lng + (p2.lng - p1.lng) * segFraction;
  const cog = getBearing(p1, p2);

  return {
    mmsi: profile.mmsi,
    name: profile.name,
    callsign: profile.callsign,
    type: profile.type,
    category: profile.category,
    lat: Number(lat.toFixed(5)),
    lng: Number(lng.toFixed(5)),
    sog: profile.speedKt,
    cog,
    status: profile.status,
    destination: profile.destination,
    lengthFt: profile.lengthFt,
    beamFt: profile.beamFt,
    lastPing: new Date(nowMs).toISOString(),
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const filterCategory = searchParams.get('category');
  const nowMs = Date.now();

  let vessels = FLEET_PROFILES.map((p) => interpolateVessel(p, nowMs));

  if (filterCategory) {
    vessels = vessels.filter((v) => v.category === filterCategory);
  }

  return NextResponse.json(
    {
      status: 'ACTIVE_TELEMETRY',
      source: 'VEROTIDES_COASTAL_RADAR_NETWORK',
      coverage: 'Indian River Lagoon & Treasure Coast Atlantic Shelf',
      sectorBounds: {
        north: 27.95,
        south: 27.45,
        west: -80.52,
        east: -80.15,
      },
      count: vessels.length,
      generatedAt: new Date(nowMs).toISOString(),
      vessels,
    },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=5, stale-while-revalidate=10',
      },
    }
  );
}
