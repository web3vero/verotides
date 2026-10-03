export interface AisVessel {
  mmsi: number;
  name: string;
  callsign: string;
  type: string;
  category: 'law_enforcement' | 'research' | 'commercial' | 'charter' | 'recreational';
  lat: number;
  lng: number;
  sog: number; // speed over ground (knots)
  cog: number; // course over ground (degrees)
  status: string;
  destination: string;
  lengthFt: number;
  beamFt: number;
  lastPing: string;
}
