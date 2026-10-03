'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import type { StyleSpecification } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { AisVessel } from '@/lib/verotide/ais-types';

interface VesselSentryProps {
  center?: [number, number];
  title?: string;
}

const DEFAULT_CENTER: [number, number] = [-80.3973, 27.6386];
const CARTO_DARK_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';

const BLANK_STYLE: StyleSpecification = {
  version: 8,
  sources: {},
  layers: [{ id: 'bg', type: 'background', paint: { 'background-color': '#050a12' } }],
};

const SECTORS = [
  { id: 'GRID_07', label: 'VERO BEACH', coords: [-80.3973, 27.6386] as [number, number], title: 'VERO_BEACH_SECTOR // GRID_07' },
  { id: 'GRID_08', label: 'SEBASTIAN INLET', coords: [-80.4472, 27.8603] as [number, number], title: 'SEBASTIAN_INLET // GRID_08' },
  { id: 'GRID_09', label: 'FORT PIERCE', coords: [-80.3015, 27.4725] as [number, number], title: 'FORT_PIERCE_CORRIDOR // GRID_09' },
];

const CATEGORY_COLORS: Record<string, { color: string; hex: string }> = {
  law_enforcement: { color: 'text-blue-400', hex: '#60a5fa' },
  research: { color: 'text-emerald-400', hex: '#34d399' },
  commercial: { color: 'text-amber-400', hex: '#fbbf24' },
  charter: { color: 'text-orange-400', hex: '#fb923c' },
  recreational: { color: 'text-purple-400', hex: '#c084fc' },
};

function checkWebGL(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    return Boolean(
      window.WebGLRenderingContext &&
        (canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch {
    return false;
  }
}

const VesselSentry = ({
  center = DEFAULT_CENTER,
  title = 'VERO_BEACH_SECTOR // GRID_07',
}: VesselSentryProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstance = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markersRef = useRef<{ [mmsi: number]: any }>({});
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const beaconMarkerRef = useRef<any>(null);

  const [canUseGL, setCanUseGL] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'SYNCING' | 'ACTIVE_FEED' | 'OFFLINE'>('SYNCING');
  const [fleet, setFleet] = useState<AisVessel[]>([]);
  const [selectedMmsi, setSelectedMmsi] = useState<number | null>(null);
  const [lastSync, setLastSync] = useState<string>('');
  const [userCenterOverride, setUserCenterOverride] = useState<[number, number] | null>(null);
  const [activeSectorTitle, setActiveSectorTitle] = useState(title);

  const activeCenter: [number, number] = userCenterOverride || center;

  // 1. Detect WebGL on client mount
  useEffect(() => {
    const glAvailable = checkWebGL();
    const t = setTimeout(() => {
      setCanUseGL(glAvailable);
    }, 0);

    if (glAvailable && mapContainer.current && !mapInstance.current) {
      import('maplibre-gl')
        .then(({ Map: MapLibreMap, Marker: MapLibreMarker }) => {
          try {
            const map = new MapLibreMap({
              container: mapContainer.current!,
              style: CARTO_DARK_STYLE,
              center: activeCenter,
              zoom: 11,
              attributionControl: false,
            });

            map.on('error', () => {
              try {
                map.setStyle(BLANK_STYLE);
              } catch {
                // ignore style error
              }
            });

            map.on('load', () => {
              const beacon = document.createElement('div');
              beacon.className =
                'h-4 w-4 bg-primary rounded-full animate-pulse shadow-[0_0_20px_rgba(0,255,65,1)] pointer-events-none';
              beaconMarkerRef.current = new MapLibreMarker({ element: beacon })
                .setLngLat(activeCenter)
                .addTo(map);
            });

            mapInstance.current = map;
          } catch {
            setCanUseGL(false);
          }
        })
        .catch(() => {
          setCanUseGL(false);
        });
    }

    return () => {
      clearTimeout(t);
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update center when props change (by value)
  useEffect(() => {
    if (mapInstance.current) {
      mapInstance.current.flyTo({ center: activeCenter, zoom: 11, duration: 1500 });
      if (beaconMarkerRef.current) {
        beaconMarkerRef.current.setLngLat(activeCenter);
      }
    }
  }, [activeCenter]);

  // 2. Fetch and synchronize live AIS fleet telemetry
  useEffect(() => {
    let isMounted = true;

    async function fetchFleet() {
      try {
        const res = await fetch('/api/verotide/ais');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        if (!isMounted) return;

        const vessels: AisVessel[] = data.vessels || [];
        setFleet(vessels);
        setConnectionStatus('ACTIVE_FEED');
        setLastSync(new Date().toLocaleTimeString('en-US', { hour12: false }));

        // If WebGL is active, update MapLibre markers
        if (canUseGL && mapInstance.current) {
          import('maplibre-gl').then(({ Marker: MapLibreMarker }) => {
            const activeMmsis = new Set<number>();

            vessels.forEach((v) => {
              activeMmsis.add(v.mmsi);
              const lngLat: [number, number] = [v.lng, v.lat];

              if (markersRef.current[v.mmsi]) {
                markersRef.current[v.mmsi].setLngLat(lngLat);
                const el = markersRef.current[v.mmsi].getElement();
                const chevron = el.querySelector('.vessel-heading-chevron') as HTMLElement;
                if (chevron) {
                  chevron.style.transform = `rotate(${v.cog}deg)`;
                }
              } else {
                const el = document.createElement('div');
                el.className = 'group relative cursor-pointer';

                el.innerHTML = `
                  <div class="relative flex items-center justify-center">
                    <div class="absolute h-6 w-6 rounded-full bg-primary/20 animate-ping pointer-events-none"></div>
                    <div class="vessel-heading-chevron h-4 w-4 bg-yellow-400 rotate-45 border border-black shadow-[0_0_12px_rgba(250,204,21,1)] transition-transform duration-700" style="transform: rotate(${v.cog}deg)"></div>
                  </div>
                  <div class="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-3 bg-black/95 border-2 border-primary p-3 text-[10px] text-primary whitespace-nowrap z-50 font-mono font-black uppercase shadow-2xl backdrop-blur-md rounded-md pointer-events-none">
                    <div class="text-yellow-400 text-xs mb-1 border-b border-primary/30 pb-1">${v.name}</div>
                    <div class="text-[9px] text-white/70 mb-1">${v.type} // CALL: ${v.callsign}</div>
                    <div class="grid grid-cols-2 gap-x-4 gap-y-0.5 text-white/90">
                      <span>SPEED: <b class="text-primary">${v.sog} KT</b></span>
                      <span>HEADING: <b class="text-primary">${v.cog}°</b></span>
                      <span>STATUS: <b class="text-white/60">${v.status.replace(/_/g, ' ')}</b></span>
                      <span>DEST: <b class="text-yellow-400">${v.destination}</b></span>
                    </div>
                    <div class="mt-1.5 pt-1 border-t border-primary/20 text-[8px] text-white/40">MMSI: ${v.mmsi} · LENGTH: ${v.lengthFt}FT</div>
                  </div>
                `;

                el.addEventListener('click', () => {
                  setSelectedMmsi(v.mmsi);
                  mapInstance.current?.flyTo({ center: lngLat, zoom: 12.5, duration: 1200 });
                });

                markersRef.current[v.mmsi] = new MapLibreMarker({ element: el })
                  .setLngLat(lngLat)
                  .addTo(mapInstance.current);
              }
            });

            Object.keys(markersRef.current).forEach((key) => {
              const numKey = Number(key);
              if (!activeMmsis.has(numKey)) {
                markersRef.current[numKey].remove();
                delete markersRef.current[numKey];
              }
            });
          });
        }
      } catch (err) {
        if (isMounted) {
          console.warn('AIS feed polling notice:', err);
          setConnectionStatus('OFFLINE');
        }
      }
    }

    fetchFleet();
    const interval = setInterval(fetchFleet, 5000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [canUseGL]);

  const focusVessel = (v: AisVessel) => {
    setSelectedMmsi(v.mmsi);
    setUserCenterOverride([v.lng, v.lat]);
    if (canUseGL && mapInstance.current) {
      mapInstance.current.flyTo({ center: [v.lng, v.lat], zoom: 12.5, duration: 1500 });
    }
  };

  const selectSector = (sector: typeof SECTORS[0]) => {
    setSelectedMmsi(null);
    setUserCenterOverride(sector.coords);
    setActiveSectorTitle(sector.title);
    if (canUseGL && mapInstance.current) {
      mapInstance.current.flyTo({ center: sector.coords, zoom: 11, duration: 1500 });
    }
  };

  const selectedVessel = useMemo(() => {
    return fleet.find((v) => v.mmsi === selectedMmsi);
  }, [fleet, selectedMmsi]);

  // Projected SVG coordinates for tactical fallback mode
  const projectedTargets = useMemo(() => {
    const cx = 400;
    const cy = 250;
    const radius = 210;
    const degScale = radius / 0.22; // ~0.22 deg view radius

    return fleet.map((v) => {
      const dx = (v.lng - activeCenter[0]) * Math.cos((activeCenter[1] * Math.PI) / 180);
      const dy = v.lat - activeCenter[1];
      const vx = cx + dx * degScale;
      const vy = cy - dy * degScale;
      const distFromCenter = Math.hypot(vx - cx, vy - cy);
      const inView = distFromCenter < radius - 6;

      return {
        ...v,
        vx,
        vy,
        inView,
      };
    });
  }, [fleet, activeCenter]);

  return (
    <div className="terminal-box p-4 md:p-6 flex flex-col gap-4 border-primary/40 rounded-2xl group relative overflow-hidden bg-black/90 shadow-[0_0_50px_rgba(0,0,0,0.8)]">
      {/* HUD Header */}
      <div className="border-b border-primary/25 pb-3.5 flex flex-wrap justify-between items-center gap-3 z-20">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center">
            <span className="h-3 w-3 rounded-full bg-primary animate-ping opacity-75"></span>
            <span className="absolute h-2 w-2 rounded-full bg-primary shadow-[0_0_10px_rgba(0,255,65,1)]"></span>
          </div>
          <div>
            <div className="font-black text-primary tracking-[0.25em] uppercase text-sm italic font-mono flex items-center gap-2">
              MARITIME_CIC // RADAR_NETWORK
            </div>
            <div className="text-[9px] font-mono text-white/40 tracking-wider">
              INDIAN RIVER COUNTY · 360° SENTRY TELEMETRY
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {lastSync && (
            <span className="hidden sm:inline text-[9px] font-mono text-white/50 uppercase tracking-widest bg-black/60 px-2 py-1 rounded border border-white/10">
              PING: <b className="text-white/80">{lastSync}</b>
            </span>
          )}
          <div className="bg-primary/15 border border-primary/60 text-primary px-3 py-1 text-xs font-black font-mono rounded-full flex items-center gap-2 shadow-[0_0_15px_rgba(0,255,65,0.25)]">
            <span className="animate-spin text-sm" style={{ animationDuration: '6s' }}>📡</span> FLEET: {fleet.length} TARGETS
          </div>
        </div>
      </div>

      {/* Radar Canvas / WebGL Display */}
      <div className="relative h-[440px] md:h-[520px] w-full bg-[#020508] border-2 border-primary/40 rounded-xl overflow-hidden shadow-[inset_0_0_80px_rgba(0,0,0,1)] flex items-center justify-center">
        {canUseGL ? (
          <div ref={mapContainer} className="absolute inset-0 grayscale contrast-125 brightness-[0.55] sepia-[0.15]" />
        ) : (
          /* Pure Hardware-Accelerated Vector SVG CRT Radar Display */
          <div className="relative w-full h-full flex items-center justify-center bg-[#02060c]">
            <svg viewBox="0 0 800 500" className="w-full h-full select-none">
              <defs>
                <radialGradient id="radarSweepGrad" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#00ff41" stopOpacity="0.45" />
                  <stop offset="70%" stopColor="#00ff41" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#00ff41" stopOpacity="0" />
                </radialGradient>
                <clipPath id="radarClip">
                  <circle cx="400" cy="250" r="210" />
                </clipPath>
              </defs>

              {/* Main Radar Screen Aperture */}
              <circle cx="400" cy="250" r="210" fill="#030810" stroke="#00ff41" strokeWidth="2" strokeOpacity="0.6" />

              <g clipPath="url(#radarClip)">
                {/* Concentric Range Rings (3, 6, 9, 12 Nautical Miles) */}
                <circle cx="400" cy="250" r="52" fill="none" stroke="#00ff41" strokeWidth="1" strokeOpacity="0.2" />
                <circle cx="400" cy="250" r="105" fill="none" stroke="#00ff41" strokeWidth="1" strokeOpacity="0.2" />
                <circle cx="400" cy="250" r="157" fill="none" stroke="#00ff41" strokeWidth="1" strokeOpacity="0.2" />
                <circle cx="400" cy="250" r="210" fill="none" stroke="#00ff41" strokeWidth="1.5" strokeOpacity="0.3" strokeDasharray="4 4" />

                {/* Reticle Axes */}
                <line x1="190" y1="250" x2="610" y2="250" stroke="#00ff41" strokeWidth="1" strokeOpacity="0.25" />
                <line x1="400" y1="40" x2="400" y2="460" stroke="#00ff41" strokeWidth="1" strokeOpacity="0.25" />

                {/* Range Labels */}
                <text x="408" y="200" fill="#00ff41" fillOpacity="0.4" fontSize="8" fontFamily="monospace">3 NM</text>
                <text x="408" y="148" fill="#00ff41" fillOpacity="0.4" fontSize="8" fontFamily="monospace">6 NM</text>
                <text x="408" y="96" fill="#00ff41" fillOpacity="0.4" fontSize="8" fontFamily="monospace">9 NM</text>

                {/* Coastal Schematic Channels */}
                <path
                  d="M 310 40 L 330 170 L 340 330 L 360 460"
                  fill="none"
                  stroke="#00ff41"
                  strokeWidth="1.5"
                  strokeOpacity="0.35"
                  strokeDasharray="4 4"
                />
                <path
                  d="M 370 40 L 385 180 L 398 330 L 418 460"
                  fill="none"
                  stroke="#00ff41"
                  strokeWidth="1.5"
                  strokeOpacity="0.35"
                  strokeDasharray="4 4"
                />
                <text x="315" y="70" fill="#00ff41" fillOpacity="0.3" fontSize="8" fontFamily="monospace">MAINLAND</text>
                <text x="430" y="70" fill="#00ff41" fillOpacity="0.3" fontSize="8" fontFamily="monospace">ATLANTIC OCEAN</text>

                {/* Rotating Phosphor Sweep Line */}
                <g className="origin-center animate-[spin_4.5s_linear_infinite]" style={{ transformOrigin: '400px 250px' }}>
                  <path d="M 400 250 L 400 40 A 210 210 0 0 0 320 56 Z" fill="url(#radarSweepGrad)" />
                  <line x1="400" y1="250" x2="400" y2="40" stroke="#00ff41" strokeWidth="2" strokeOpacity="0.9" />
                </g>

                {/* Center Base Station Beacon */}
                <circle cx="400" cy="250" r="4" fill="#00ff41" className="animate-pulse" />
                <circle cx="400" cy="250" r="12" fill="none" stroke="#00ff41" strokeWidth="1" strokeOpacity="0.5" className="animate-ping" />

                {/* Projected Vessel Targets */}
                {projectedTargets.map((v) => {
                  if (!v.inView) return null;
                  const isSelected = selectedMmsi === v.mmsi;
                  const hex = isSelected ? '#facc15' : CATEGORY_COLORS[v.category]?.hex || '#00ff41';

                  return (
                    <g
                      key={v.mmsi}
                      transform={`translate(${v.vx}, ${v.vy})`}
                      className="cursor-pointer"
                      onClick={() => focusVessel(v)}
                    >
                      {isSelected && (
                        <rect x="-10" y="-10" width="20" height="20" fill="none" stroke="#facc15" strokeWidth="1.5" className="animate-pulse" />
                      )}
                      <circle cx="0" cy="0" r={isSelected ? 4.5 : 3.5} fill={hex} />
                      <line
                        x1="0"
                        y1="0"
                        x2={Math.cos(((v.cog - 90) * Math.PI) / 180) * 14}
                        y2={Math.sin(((v.cog - 90) * Math.PI) / 180) * 14}
                        stroke={hex}
                        strokeWidth="1.5"
                      />
                      <text
                        x="7"
                        y="-4"
                        fill={isSelected ? '#facc15' : '#ffffff'}
                        fillOpacity={isSelected ? 1 : 0.85}
                        fontSize="8"
                        fontFamily="monospace"
                        fontWeight="bold"
                      >
                        {v.name.split(' ')[0]} [{v.sog}kt]
                      </text>
                    </g>
                  );
                })}
              </g>

              {/* Compass Bearings */}
              <text x="400" y="30" textAnchor="middle" fill="#00ff41" fontSize="10" fontFamily="monospace" fontWeight="bold">000° N</text>
              <text x="635" y="254" textAnchor="start" fill="#00ff41" fontSize="10" fontFamily="monospace" fontWeight="bold">090° E</text>
              <text x="400" y="480" textAnchor="middle" fill="#00ff41" fontSize="10" fontFamily="monospace" fontWeight="bold">180° S</text>
              <text x="165" y="254" textAnchor="end" fill="#00ff41" fontSize="10" fontFamily="monospace" fontWeight="bold">270° W</text>
            </svg>
          </div>
        )}

        {/* Top-Left: System Link & Engine Status */}
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5 select-none">
          <div className="bg-black/90 border border-primary/50 px-3 py-1.5 text-[10px] font-black font-mono text-primary shadow-2xl flex items-center gap-2.5 uppercase tracking-widest backdrop-blur-md rounded">
            <span className={`h-2 w-2 rounded-full ${connectionStatus === 'ACTIVE_FEED' ? 'bg-primary animate-pulse' : 'bg-yellow-400 animate-ping'}`}></span>
            LINK: {connectionStatus}
          </div>
          <div className="bg-black/85 border border-primary/20 px-2.5 py-0.5 text-[8px] font-mono text-white/50 uppercase tracking-widest rounded w-fit backdrop-blur-sm">
            SURFACE: {canUseGL ? 'MAPLIBRE_VECTOR' : 'TACTICAL_CRT_RADAR'}
          </div>
        </div>

        {/* Selected Vessel Telemetry HUD */}
        {selectedVessel && (
          <div className="absolute top-4 right-4 z-20 bg-black/95 border-2 border-yellow-400/80 p-3 rounded-lg shadow-2xl backdrop-blur-md font-mono text-[10px] max-w-[240px]">
            <div className="text-yellow-400 font-black truncate uppercase mb-1 border-b border-yellow-400/30 pb-1 flex items-center justify-between">
              <span>🎯 {selectedVessel.name}</span>
              <span className="text-[8px] text-white/50">{selectedVessel.sog} KT</span>
            </div>
            <div className="space-y-0.5 text-white/80">
              <div className="flex justify-between">
                <span className="text-white/40">HEADING:</span> <b className="text-primary">{selectedVessel.cog}° COG</b>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40">STATUS:</span> <b className="text-white/70">{selectedVessel.status.replace(/_/g, ' ')}</b>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40">DEST:</span> <b className="text-yellow-400 truncate">{selectedVessel.destination}</b>
              </div>
              <div className="flex justify-between border-t border-white/10 pt-1 text-[8px]">
                <span className="text-white/40">CALL: {selectedVessel.callsign}</span>
                <span className="text-white/40">MMSI: {selectedVessel.mmsi}</span>
              </div>
            </div>
          </div>
        )}

        {/* World-Class Military Tactical Sector HUD (Bottom-Right) */}
        <div className="absolute bottom-4 right-4 z-10 font-mono select-none">
          <div className="relative bg-black/95 border border-primary/60 p-2.5 shadow-[0_0_30px_rgba(0,0,0,0.9)] backdrop-blur-md rounded-lg flex flex-col gap-1.5 min-w-[220px]">
            {/* Corner Tactical Brackets */}
            <div className="absolute -top-1 -left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-primary pointer-events-none"></div>
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-primary pointer-events-none"></div>
            <div className="absolute -bottom-1 -left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-primary pointer-events-none"></div>
            <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-primary pointer-events-none"></div>

            {/* Header: Sector ID & Tag */}
            <div className="flex items-center justify-between border-b border-primary/30 pb-1">
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-ping"></span>
                <span className="text-[10px] font-black text-primary uppercase tracking-[0.16em]">
                  {activeSectorTitle}
                </span>
              </div>
              <span className="text-[8px] bg-primary/20 text-primary border border-primary/40 px-1.5 py-0.5 rounded font-black tracking-widest">
                VERIFIED
              </span>
            </div>

            {/* Precision Coordinate Telemetry */}
            <div className="grid grid-cols-2 gap-2 text-[9px] text-white/80 pt-0.5">
              <div className="bg-primary/5 p-1 rounded border border-primary/10">
                <span className="text-white/40 block text-[7px] uppercase tracking-widest">LATITUDE</span>
                <span className="text-primary font-black">{activeCenter[1].toFixed(4)}° N</span>
              </div>
              <div className="bg-primary/5 p-1 rounded border border-primary/10">
                <span className="text-white/40 block text-[7px] uppercase tracking-widest">LONGITUDE</span>
                <span className="text-primary font-black">{Math.abs(activeCenter[0]).toFixed(4)}° W</span>
              </div>
            </div>

            {/* Sub-Telemetry Footnote */}
            <div className="flex justify-between items-center pt-1 border-t border-primary/15 text-[8px] text-white/50 uppercase tracking-wider">
              <span>DATUM: <b className="text-white/80">WGS84</b></span>
              <span>GRID: <b className="text-yellow-400">IRC-COASTAL</b></span>
              <span>FOV: <b className="text-primary">18 NM</b></span>
            </div>
          </div>
        </div>

        {/* Scanlines Effect */}
        <div className="absolute inset-0 pointer-events-none opacity-20 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,255,65,0.2)_50%)] bg-[length:100%_4px] z-20"></div>
      </div>

      {/* World-Class Sector Switcher & Tactical Controls */}
      <div className="flex flex-col gap-3.5 z-20">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {SECTORS.map((s) => {
            const isActive = activeSectorTitle === s.title;
            return (
              <button
                key={s.id}
                onClick={() => selectSector(s)}
                className={`p-2.5 rounded-lg border text-left font-mono transition-all flex items-center justify-between ${
                  isActive
                    ? 'border-primary bg-primary/20 text-white shadow-[0_0_15px_rgba(0,255,65,0.3)]'
                    : 'border-primary/25 bg-black/60 hover:border-primary/60 text-white/70 hover:bg-primary/10'
                }`}
              >
                <div className="flex flex-col">
                  <span className="text-[8px] text-primary/70 uppercase tracking-widest font-bold">
                    SECTOR // {s.id}
                  </span>
                  <span className="text-xs font-black uppercase tracking-wider text-white">
                    {s.label}
                  </span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded font-black tracking-widest ${
                  isActive ? 'bg-primary text-black' : 'border border-primary/30 text-primary/70'
                }`}>
                  {isActive ? 'ACTIVE' : 'SELECT'}
                </span>
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-black/80 border border-primary/20 p-2.5 rounded-lg font-mono">
            <div className="text-[9px] text-primary/60 uppercase tracking-widest">Radar Mode</div>
            <div className="text-xs font-black text-yellow-400 uppercase italic">Continuous 360°</div>
          </div>
          <div className="bg-black/80 border border-primary/20 p-2.5 rounded-lg font-mono">
            <div className="text-[9px] text-primary/60 uppercase tracking-widest">Active Grid</div>
            <div className="text-xs font-black text-white/90 uppercase">{activeSectorTitle.split('//')[1]?.trim() || 'GRID_07'}</div>
          </div>
          <div className="bg-black/80 border border-primary/20 p-2.5 rounded-lg font-mono">
            <div className="text-[9px] text-primary/60 uppercase tracking-widest">Telemetry Engine</div>
            <div className="text-xs font-black text-primary uppercase">KINEMATICS 5s</div>
          </div>
          <button
            className="bg-primary/10 border border-primary/40 p-2.5 rounded-lg text-center hover:bg-primary hover:text-black transition-all font-mono font-black text-primary uppercase text-xs tracking-widest shadow-sm flex items-center justify-center gap-1.5"
            onClick={() => {
              setSelectedMmsi(null);
              setUserCenterOverride(null);
              setActiveSectorTitle(title);
              if (canUseGL && mapInstance.current) {
                mapInstance.current.flyTo({ center, zoom: 11, duration: 1500 });
              }
            }}
          >
            ↺ RESET GRID
          </button>
        </div>

        {/* Live Active Fleet Roster */}
        {fleet.length > 0 && (
          <div className="border border-primary/25 rounded-xl bg-black/60 p-3.5 font-mono shadow-lg">
            <div className="flex justify-between items-center mb-2 px-1">
              <span className="text-xs font-black text-primary uppercase tracking-widest flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse"></span>
                &gt; ACTIVE_COASTAL_TARGETS ({fleet.length})
              </span>
              <span className="text-[9px] text-white/40 uppercase">TAP TO LOCK RETICLE</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[190px] overflow-y-auto pr-1">
              {fleet.map((v) => {
                const isSelected = selectedMmsi === v.mmsi;

                return (
                  <button
                    key={v.mmsi}
                    onClick={() => focusVessel(v)}
                    className={`flex items-center justify-between p-2 rounded-lg border text-left transition-all ${
                      isSelected
                        ? 'border-yellow-400 bg-yellow-400/10 text-white shadow-[0_0_12px_rgba(250,204,21,0.25)]'
                        : 'border-primary/20 bg-black/40 hover:border-primary/50 text-white/80'
                    }`}
                  >
                    <div className="flex flex-col min-w-0 pr-2">
                      <div className="text-xs font-black truncate uppercase text-primary">
                        {v.name}
                      </div>
                      <div className="text-[10px] text-white/50 truncate uppercase">
                        {v.type} · {v.destination}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <div className="text-xs font-black text-yellow-400">{v.sog} KT</div>
                        <div className="text-[9px] text-white/40">{v.cog}° HDG</div>
                      </div>
                      <span className="text-[10px] text-primary/70 border border-primary/30 px-1.5 py-0.5 rounded">
                        LOCK
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VesselSentry;
