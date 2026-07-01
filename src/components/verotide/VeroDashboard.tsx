'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

import LazyVesselSentry from './LazyVesselSentry';

const VisualSentry = dynamic(() => import('./VisualSentry'), {
  ssr: false,
  loading: () => (
    <div className="aspect-video w-full border border-primary/20 bg-black flex items-center justify-center font-mono text-primary text-[10px] animate-pulse">
      LOADING VISUAL FEED...
    </div>
  ),
});

import TideWidget from './TideWidget';
import BiteTimesWidget from './BiteTimesWidget';
import BeachSentryWidget from './BeachSentryWidget';
import StormSentry from './StormSentry';
interface BridgeEntry {
  name: string
  status: 'OPEN_CLEAR' | 'RESTRICTED' | 'CLOSED'
  color: 'green' | 'yellow' | 'red'
  desc: string
  source: 'fixed-span' | 'construction' | 'override'
  lastVerified: string
  sourceUrl: string
}

type AdSlot =
  | {
      id: string;
      category: string;
      icon: string;
      headline: string;
      body: string;
      cta: string;
      live?: false;
    }
  | {
      id: string;
      category: string;
      icon: string;
      name: string;
      tagline: string;
      description: string;
      cta: string;
      href: string;
      live: true;
    };

const AD_SLOTS: AdSlot[] = [
  {
    id: '01',
    category: 'STORM_SEASON_PARTNER',
    icon: '⚡',
    headline: 'Storm Season Sponsor',
    body: 'Target Vero Beach homeowners\npreparing for hurricane season',
    cta: 'Claim This Slot →',
  },
  {
    id: '02',
    category: 'MARINE_&_FISHING',
    icon: '🦞',
    name: "Hunter's Seafood",
    tagline: 'Fresh Catch · Vero Beach',
    description: 'Local seafood done right.\nFresh, local, and always worth it.',
    cta: 'Follow on Instagram →',
    href: 'https://www.instagram.com/huntersseafood',
    live: true,
  },
  {
    id: '03',
    category: 'COASTAL_LIFESTYLE',
    icon: '🏖️',
    headline: 'Coastal Lifestyle Partner',
    body: 'Connect with Vero Beach locals\n& high-intent coastal traffic',
    cta: 'Claim This Slot →',
  },
];

const AdSquare = ({ slot }: { slot: number }) => {
  const ad = AD_SLOTS[slot - 1];

  if (ad.live) {
    return (
      <div className="terminal-box p-6 flex flex-col gap-4 border-green-400/30 rounded-xl relative overflow-hidden bg-black min-h-[200px]">
        <div className="absolute top-0 right-0 bg-green-400 text-black text-[8px] font-black uppercase px-3 py-1 tracking-widest">
          LOCAL AD
        </div>
        <div className="border-b border-green-400/20 pb-2 flex items-center gap-3">
          <span className="h-1.5 w-1.5 rounded-full bg-green-400/80 animate-pulse"></span>
          <span className="font-black text-green-400/80 uppercase tracking-widest text-[10px]">{ad.category}</span>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center py-2">
          <div className="h-14 w-14 border-2 border-green-400/30 rounded-full flex items-center justify-center bg-green-400/5">
            <span className="text-2xl">{ad.icon}</span>
          </div>
          <div>
            <div className="text-sm font-black text-white uppercase tracking-widest mb-0.5">{ad.name}</div>
            <div className="text-[10px] text-green-400/70 font-mono uppercase tracking-widest mb-2">{ad.tagline}</div>
            <div className="text-[10px] text-white/30 font-mono uppercase leading-relaxed">
              {ad.description.split('\n').map((l, i) => <React.Fragment key={i}>{l}{i === 0 && <br />}</React.Fragment>)}
            </div>
          </div>
        </div>
        <a
          href={ad.href}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full text-center border-2 border-green-400/50 py-2.5 text-[10px] text-green-400 font-black uppercase tracking-widest hover:bg-green-400 hover:text-black transition-all rounded-lg"
        >
          {ad.cta}
        </a>
      </div>
    );
  }

  return (
    <div className="terminal-box p-6 flex flex-col gap-4 border-yellow-400/20 rounded-xl relative overflow-hidden bg-black min-h-[200px]">
      <div className="absolute top-0 right-0 bg-yellow-400 text-black text-[8px] font-black uppercase px-3 py-1 tracking-widest">
        SPONSORED
      </div>
      <div className="border-b border-yellow-400/20 pb-2 flex items-center gap-3">
        <span className="h-1.5 w-1.5 rounded-full bg-yellow-400/60 animate-pulse"></span>
        <span className="font-black text-yellow-400/80 uppercase tracking-widest text-[10px]">{ad.category}</span>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center py-4">
        <div className="h-14 w-14 border-2 border-yellow-400/25 rounded-full flex items-center justify-center bg-yellow-400/5">
          <span className="text-2xl">{ad.icon}</span>
        </div>
        <div>
          <div className="text-sm font-black text-white/80 uppercase tracking-widest mb-1">{ad.headline}</div>
          <div className="text-[10px] text-white/30 font-mono uppercase leading-relaxed">
            {ad.body.split('\n').map((l, i) => <React.Fragment key={i}>{l}{i === 0 && <br />}</React.Fragment>)}
          </div>
        </div>
      </div>
      <a
        href="mailto:ads@verotides.com"
        className="w-full text-center border-2 border-yellow-400/40 py-2.5 text-[10px] text-yellow-400 font-black uppercase tracking-widest hover:bg-yellow-400 hover:text-black transition-all rounded-lg"
      >
        {ad.cta}
      </a>
    </div>
  );
};

const Tooltip = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`absolute z-50 pointer-events-none opacity-0 group-hover/tip:opacity-100 transition-opacity shadow-2xl ${className}`}>
    {children}
  </div>
);

const NODES = {
  VERO_BEACH_SOUTH: {
    station: '8722125',
    stationName: 'Vero Beach (Intracoastal), FL',
    grid: 'MLB/68,33',
    center: [-80.3973, 27.6386] as [number, number],
    radarTitle: 'VERO_BEACH_SECTOR // GRID_07',
  },
  SEBASTIAN_INLET: {
    station: '8722004',
    stationName: 'Sebastian Inlet, FL',
    grid: 'MLB/65,42',
    center: [-80.4472, 27.8603] as [number, number],
    radarTitle: 'SEBASTIAN_INLET_SECTOR // GRID_08',
  }
};

const FALLBACK_BRIDGES: BridgeEntry[] = [
  {
    name: 'BARBER (SR_60)',
    status: 'OPEN_CLEAR',
    color: 'yellow',
    desc: 'Fixed bridge — main artery to mainland via SR-60. 4 lanes, no restrictions. Connects to US-1 and I-95 corridor.',
    source: 'fixed-span',
    lastVerified: new Date().toISOString().split('T')[0],
    sourceUrl: 'https://verotides.com',
  },
  {
    name: '17TH_ST (SR_656)',
    status: 'RESTRICTED',
    color: 'red',
    desc: 'MAJOR REHAB 2023–2028 (Alma Lee Loy Bridge). One lane alternating 24/7 with flagging. Expect 5–15 min delays peak hours. Use Barber or Wabasso as alternates.',
    source: 'construction',
    lastVerified: new Date().toISOString().split('T')[0],
    sourceUrl: 'https://www.d4fdot.com/tcfdot/TC-Indian_Closures.asp',
  },
  {
    name: 'WABASSO (CR_510)',
    status: 'OPEN_CLEAR',
    color: 'yellow',
    desc: 'Fixed bridge — northern barrier island crossing via CR-510. 2 lanes, no restrictions. Best alternate while 17th St is under construction.',
    source: 'fixed-span',
    lastVerified: new Date().toISOString().split('T')[0],
    sourceUrl: 'https://verotides.com',
  },
  {
    name: 'SEBASTIAN (SR_A1A)',
    status: 'RESTRICTED',
    color: 'red',
    desc: 'LONG-TERM BRIDGE REPLACEMENT started June 1, 2026. Motorists should anticipate weekday lane closures with flaggers and travel delays. South parking lot closed.',
    source: 'construction',
    lastVerified: new Date().toISOString().split('T')[0],
    sourceUrl: 'https://verotides.com',
  },
]

const VeroDashboard = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeNode, setActiveNode] = useState<'VERO_BEACH_SOUTH' | 'SEBASTIAN_INLET'>('VERO_BEACH_SOUTH');
  const [bridges, setBridges] = useState<BridgeEntry[]>(FALLBACK_BRIDGES);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetch('/api/bridges')
      .then(r => r.json() as Promise<BridgeEntry[]>)
      .then(data => { if (Array.isArray(data) && data.length > 0) setBridges(data) })
      .catch(() => { /* keep fallback */ })
  }, []);


  const today = currentTime.toLocaleDateString('en-US', { weekday: 'long' });
  const isGarbageDay = ['Monday', 'Thursday'].includes(today);
  const isRecyclingDay = today === 'Wednesday';
  const isYardWasteDay = today === 'Thursday';

  const nodeConfig = NODES[activeNode];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-8 p-3 md:p-8 pb-8 w-full max-w-full">

      {/* Command Header */}
      <div className="col-span-full terminal-box p-5 md:p-8 flex flex-col xl:flex-row justify-between items-center gap-4 md:gap-6 border-b-4 border-primary/40 rounded-2xl bg-black/40 backdrop-blur-md overflow-hidden">
        <div className="text-center xl:text-left min-w-0 w-full xl:w-auto">
          <h2 className="text-2xl md:text-4xl font-black glow-text italic tracking-tighter uppercase mb-1 truncate">VERO_CENTRAL_COMMAND</h2>
          <div className="text-[10px] md:text-xs opacity-60 uppercase font-mono tracking-tight md:tracking-[0.25em] font-bold">IRC Coastal Grid · Sector 32963 · Indian River County</div>
        </div>
        <div className="text-center xl:text-right font-mono flex-shrink-0">
          <div className="text-4xl md:text-7xl text-yellow-400 font-black glow-text leading-none mb-1 tracking-tighter tabular-nums">
            {currentTime.toLocaleTimeString([], { hour12: true })}
          </div>
          <div className="text-xs md:text-sm opacity-70 font-black uppercase tracking-wide md:tracking-[0.3em] text-primary">
            {currentTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </div>
        </div>
      </div>

      {/* Node Switcher Toggle */}
      <div className="col-span-full flex flex-col sm:flex-row justify-between items-center gap-4 p-4 md:px-6 bg-black/55 border-2 border-primary/20 rounded-xl relative overflow-hidden">
        <div className="flex items-center gap-3">
          <span className="h-2 w-2 rounded-full bg-primary animate-ping"></span>
          <span className="font-mono text-xs uppercase font-black tracking-widest text-primary/80">GRID_NODE_SELECT:</span>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={() => setActiveNode('VERO_BEACH_SOUTH')}
            className={`flex-1 sm:flex-initial text-center border-2 px-5 py-2 text-xs font-black uppercase tracking-widest transition-all duration-300 rounded-lg ${
              activeNode === 'VERO_BEACH_SOUTH'
                ? 'bg-primary text-black border-primary shadow-[0_0_15px_rgba(0,255,65,0.4)]'
                : 'bg-black text-primary/70 border-primary/20 hover:border-primary/50 hover:text-primary'
            }`}
          >
            VERO_BEACH_SOUTH
          </button>
          <button
            onClick={() => setActiveNode('SEBASTIAN_INLET')}
            className={`flex-1 sm:flex-initial text-center border-2 px-5 py-2 text-xs font-black uppercase tracking-widest transition-all duration-300 rounded-lg ${
              activeNode === 'SEBASTIAN_INLET'
                ? 'bg-primary text-black border-primary shadow-[0_0_15px_rgba(0,255,65,0.4)]'
                : 'bg-black text-primary/70 border-primary/20 hover:border-primary/50 hover:text-primary'
            }`}
          >
            SEBASTIAN_INLET
          </button>
        </div>
      </div>

      {/* Row 2: Primary Data */}
      <TideWidget station={nodeConfig.station} stationName={nodeConfig.stationName} />
      <BiteTimesWidget lat={nodeConfig.center[1]} lon={nodeConfig.center[0]} />
      <VisualSentry nodeKey={activeNode} />

      {/* Row 3: Utility Data */}
      <BeachSentryWidget grid={nodeConfig.grid} />

      {/* Bridge Telemetry */}
      <div className="terminal-box p-6 flex flex-col gap-4 border-primary/20 rounded-xl group relative overflow-hidden">
        <div className="border-b border-border/40 pb-2 flex justify-between items-center">
          <span className="font-black text-white glow-text uppercase tracking-widest text-sm flex items-center gap-3 italic">
            🌉 BRIDGE_GRID
          </span>
          <a href="https://www.d4fdot.com/tcfdot/TC-Indian_Closures.asp" target="_blank" rel="noopener noreferrer" className="text-[10px] opacity-60 hover:opacity-100 uppercase font-mono font-black transition-opacity">FDOT_D4 ↗</a>
        </div>
        <div className="flex flex-col gap-3 mt-2">
          {bridges.map(bridge => (
            <div key={bridge.name} className="relative flex justify-between items-center p-4 bg-black/60 border-2 border-primary/10 rounded-lg group/tip cursor-help hover:border-primary/30 transition-colors">
              <span className="text-xs uppercase font-black text-primary/80 tracking-widest">{bridge.name}</span>
              <span className={`text-xs uppercase font-black px-3 py-1 border rounded-md ${
                bridge.color === 'red'
                  ? 'text-red-400 bg-red-500/10 border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.3)]'
                  : 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20 shadow-[0_0_10px_rgba(250,204,21,0.3)]'
              }`}>
                {bridge.status}
              </span>
              <Tooltip className="-top-16 left-0 right-0 mx-4 bg-black border border-primary/40 text-primary text-[10px] font-mono p-3 rounded leading-relaxed">
                {bridge.desc}
              </Tooltip>
            </div>
          ))}
        </div>
      </div>

      {/* Storm Sentry — live NHC feed */}
      <StormSentry />

      {/* Row 4: Vessel (2 col) + Ad */}
      <div className="md:col-span-2 xl:col-span-2">
        <LazyVesselSentry center={nodeConfig.center} title={nodeConfig.radarTitle} />
      </div>
      <AdSquare slot={1} />

      {/* Row 5: Ad squares */}
      <AdSquare slot={2} />
      <AdSquare slot={3} />

      {/* placeholder to keep grid balanced on xl */}
      <div className="hidden xl:block" />

      {/* ─────── TRASH & WASTE — Full-Width Bottom Section ─────── */}
      <div className="col-span-full terminal-box rounded-2xl overflow-hidden border-primary/30">

        {/* Section header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 px-6 py-4 border-b-2 border-primary/20 bg-black/60">
          <div className="flex items-center gap-3">
            <span className="text-lg">🚛</span>
            <div>
              <h3 className="font-black text-white glow-text uppercase tracking-widest text-sm">IRC Waste Management — 32963 / 32964</h3>
              <p className="text-[10px] text-primary/50 font-mono uppercase tracking-tight mt-0.5">Indian River County · Beachside Zone · Schedules below are standard for barrier island addresses</p>
            </div>
          </div>
          <a
            href="https://www.ircswd.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 bg-primary text-black font-black uppercase text-[10px] px-4 py-2 tracking-widest hover:bg-primary/80 transition-colors rounded"
          >
            Verify Your Address ↗
          </a>
        </div>

        {/* Schedule grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-primary/10">

          {/* Garbage */}
          <div className="group/tip relative p-5 cursor-help hover:bg-primary/5 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] text-primary/50 font-black uppercase tracking-widest">Household Garbage</span>
              {isGarbageDay && (
                <span className="text-[8px] bg-primary text-black font-black px-2 py-0.5 uppercase tracking-wider animate-pulse">TODAY</span>
              )}
            </div>
            <div className="text-2xl font-black text-yellow-400 uppercase italic tracking-tight leading-none mb-2">Mon &amp; Thu</div>
            <div className="text-[10px] text-white/40 font-mono uppercase">Place bins curbside by 7 AM</div>
            <Tooltip className="-top-28 left-2 right-2 bg-black border border-primary/40 text-[10px] font-mono p-3 rounded leading-relaxed">
              <p className="text-primary font-black mb-1">Household Garbage — Mon &amp; Thu</p>
              <p className="text-white/70">Bins must be at curb by 7:00 AM. Place 3 ft from obstacles. Max 4 bags or container weight 50 lbs. Cans, bottles, and food waste go in garbage. Holiday delays: service shifts to next business day.</p>
            </Tooltip>
          </div>

          {/* Recycling */}
          <div className="group/tip relative p-5 cursor-help hover:bg-primary/5 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] text-primary/50 font-black uppercase tracking-widest">Recycling</span>
              {isRecyclingDay && (
                <span className="text-[8px] bg-primary text-black font-black px-2 py-0.5 uppercase tracking-wider animate-pulse">TODAY</span>
              )}
            </div>
            <div className="text-2xl font-black text-yellow-400 uppercase italic tracking-tight leading-none mb-2">Wednesday</div>
            <div className="text-[10px] text-white/40 font-mono uppercase">Single-stream — blue bin</div>
            <Tooltip className="-top-36 left-2 right-2 bg-black border border-primary/40 text-[10px] font-mono p-3 rounded leading-relaxed">
              <p className="text-primary font-black mb-1">What Goes in the Blue Bin</p>
              <p className="text-white/70 mb-1">✓ Cardboard &amp; paper · ✓ Plastic bottles &amp; jugs (#1–7) · ✓ Glass bottles &amp; jars · ✓ Aluminum &amp; steel cans</p>
              <p className="text-red-400 font-black mb-0.5">Do NOT recycle:</p>
              <p className="text-white/70">✗ Plastic bags · ✗ Styrofoam · ✗ Food-soiled containers · ✗ Electronics · ✗ Clothing</p>
            </Tooltip>
          </div>

          {/* Yard Waste */}
          <div className="group/tip relative p-5 cursor-help hover:bg-primary/5 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] text-primary/50 font-black uppercase tracking-widest">Yard / Vegetative Waste</span>
              {isYardWasteDay && (
                <span className="text-[8px] bg-primary text-black font-black px-2 py-0.5 uppercase tracking-wider animate-pulse">TODAY</span>
              )}
            </div>
            <div className="text-2xl font-black text-yellow-400 uppercase italic tracking-tight leading-none mb-2">Thursday</div>
            <div className="text-[10px] text-white/40 font-mono uppercase">Bundles ≤ 4 ft · Cans or bags</div>
            <Tooltip className="-top-36 left-2 right-2 bg-black border border-primary/40 text-[10px] font-mono p-3 rounded leading-relaxed">
              <p className="text-primary font-black mb-1">Yard Waste Guidelines</p>
              <p className="text-white/70 mb-1">Grass clippings, leaves, palm fronds, branches. Bundles must be ≤ 4 ft long and ≤ 50 lbs. Tie bundles with twine — no wire. Place at curb separately from garbage. Mulched in bulk by IRC SWD.</p>
              <p className="text-white/50">Large tree debris: schedule special bulk pickup via ircswd.com.</p>
            </Tooltip>
          </div>

          {/* Bulk & Special */}
          <div className="group/tip relative p-5 cursor-help hover:bg-primary/5 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] text-primary/50 font-black uppercase tracking-widest">Bulk &amp; Special Items</span>
            </div>
            <div className="text-2xl font-black text-yellow-400 uppercase italic tracking-tight leading-none mb-2">By Request</div>
            <div className="text-[10px] text-white/40 font-mono uppercase">(772) 567-8000 · ircswd.com</div>
            <Tooltip className="-top-40 left-2 right-2 bg-black border border-primary/40 text-[10px] font-mono p-3 rounded leading-relaxed">
              <p className="text-primary font-black mb-1">Bulk &amp; Special Pickups</p>
              <p className="text-white/70 mb-1">Furniture, appliances, mattresses, and large items require a scheduled pickup. Call (772) 567-8000 or book at ircswd.com.</p>
              <p className="text-yellow-400 font-black mb-0.5">Hazardous Household Waste (HHW):</p>
              <p className="text-white/70">Paint, batteries, chemicals, electronics. Drop-off at IRC SWD Facility — check ircswd.com for hours. Do NOT put HHW in regular garbage.</p>
            </Tooltip>
          </div>
        </div>

        {/* Holiday note */}
        <div className="px-6 py-3 bg-yellow-400/5 border-t border-primary/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <p className="text-[10px] text-white/40 font-mono uppercase">
            ⚠ Holiday delays: when a federal holiday falls on a pickup day, service shifts to the following business day. Schedules vary by address — always verify at ircswd.com.
          </p>
          <a href="tel:+17725678000" className="text-[10px] text-primary font-black uppercase tracking-widest hover:text-white transition-colors whitespace-nowrap flex-shrink-0">
            📞 (772) 567-8000
          </a>
        </div>
      </div>

    </div>
  );
};

export default VeroDashboard;
