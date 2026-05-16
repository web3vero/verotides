'use client';

import React, { useState, useEffect } from 'react';
import VesselSentry from './VesselSentry';
import VisualSentry from './VisualSentry';
import TideWidget from './TideWidget';
import BiteTimesWidget from './BiteTimesWidget';
import BeachSentryWidget from './BeachSentryWidget';

const AdSquare = ({ slot }: { slot: number }) => (
  <div className="terminal-box p-6 flex flex-col gap-4 border-yellow-400/20 rounded-xl relative overflow-hidden bg-black min-h-[200px]">
    <div className="absolute top-0 right-0 bg-yellow-400 text-black text-[8px] font-black uppercase px-3 py-1 tracking-widest">
      SPONSORED
    </div>
    <div className="border-b border-yellow-400/20 pb-2 flex items-center gap-3">
      <span className="h-1.5 w-1.5 rounded-full bg-yellow-400/60 animate-pulse"></span>
      <span className="font-black text-yellow-400/80 uppercase tracking-widest text-[10px]">PARTNER_NODE_{slot.toString().padStart(2, '0')}</span>
    </div>
    <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center py-4">
      <div className="h-14 w-14 border-2 border-yellow-400/25 rounded-full flex items-center justify-center bg-yellow-400/5">
        <span className="text-yellow-400/50 text-2xl">📢</span>
      </div>
      <div>
        <div className="text-sm font-black text-white/80 uppercase tracking-widest mb-1">Your Ad Here</div>
        <div className="text-[10px] text-white/30 font-mono uppercase leading-relaxed">
          Reach Vero Beach locals &amp;<br />coastal visitors daily
        </div>
      </div>
    </div>
    <a
      href="mailto:ads@verotides.com"
      className="w-full text-center border-2 border-yellow-400/40 py-2.5 text-[10px] text-yellow-400 font-black uppercase tracking-widest hover:bg-yellow-400 hover:text-black transition-all rounded-lg"
    >
      Inquire About This Space ↗
    </a>
  </div>
);

const Tooltip = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`absolute z-50 pointer-events-none opacity-0 group-hover/tip:opacity-100 transition-opacity shadow-2xl ${className}`}>
    {children}
  </div>
);

const VeroDashboard = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const today = currentTime.toLocaleDateString('en-US', { weekday: 'long' });
  const isGarbageDay = ['Monday', 'Thursday'].includes(today);
  const isRecyclingDay = today === 'Wednesday';
  const isYardWasteDay = today === 'Thursday';

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

      {/* Row 2: Primary Data */}
      <TideWidget />
      <BiteTimesWidget />
      <VisualSentry />

      {/* Row 3: Utility Data */}
      <BeachSentryWidget />

      {/* Bridge Telemetry */}
      <div className="terminal-box p-6 flex flex-col gap-4 border-primary/20 rounded-xl group relative overflow-hidden">
        <div className="border-b border-border/40 pb-2 flex justify-between items-center">
          <span className="font-black text-white glow-text uppercase tracking-widest text-sm flex items-center gap-3 italic">
            🌉 BRIDGE_GRID
          </span>
          <a href="https://fl511.com/list/bridge" target="_blank" rel="noopener noreferrer" className="text-[10px] opacity-60 hover:opacity-100 uppercase font-mono font-black transition-opacity">FL511_LIVE ↗</a>
        </div>
        <div className="flex flex-col gap-3 mt-2">
          {[
            {
              name: 'BARBER (SR_60)',
              status: 'OPEN_CLEAR',
              color: 'yellow',
              desc: 'Fixed bridge — main artery connecting barrier island to mainland. 4 lanes. No lift delays. Fastest crossing. Connects to US-1 and I-95 corridor.'
            },
            {
              name: '17TH_ST (SR_656)',
              status: 'RESTRICTED',
              color: 'red',
              desc: 'MAJOR REHAB 2023–2028. One lane alternating 24/7 with flagging. Expect 5–15 min delays during peak hours. Use Barber or Wabasso as alternates.'
            },
            {
              name: 'WABASSO (CR_510)',
              status: 'OPEN_CLEAR',
              color: 'yellow',
              desc: 'Northern barrier island crossing. 2 lanes, no restrictions. Best alternate route while 17th St is under construction. Connects to US-1 at Wabasso.'
            }
          ].map(bridge => (
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

      {/* Storm Sentry */}
      <div className="terminal-box p-6 md:p-8 flex flex-col gap-4 bg-red-950/10 border-red-500/40 rounded-2xl group relative overflow-hidden">
        <div className="border-b border-red-500/20 pb-2 flex justify-between items-center">
          <span className="font-black text-red-500 uppercase tracking-[0.2em] text-sm flex items-center gap-3 italic">
            <span className="animate-spin" style={{ animationDuration: '8s' }}>🌀</span> STORM_SENTRY
          </span>
          <a href="https://www.nhc.noaa.gov/" target="_blank" rel="noopener noreferrer" className="text-[10px] opacity-70 hover:opacity-100 uppercase font-mono font-black text-red-400 transition-opacity">NHC ↗</a>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center gap-3 py-4 group/tip relative cursor-help">
          <div className="text-4xl md:text-5xl font-black text-primary uppercase animate-pulse glow-text tracking-tighter">LEVEL_0</div>
          <div className="text-xs text-primary/80 uppercase font-mono text-center font-black tracking-widest leading-relaxed">
            No Tropical Activity<br />Detected
          </div>
          <Tooltip className="bottom-0 left-2 right-2 bg-black border border-red-500/40 text-[10px] font-mono p-3 rounded leading-relaxed">
            <p className="text-red-400 font-black mb-1">Atlantic Basin Monitor</p>
            <p className="text-white/60">Vero Beach sits in a historically active hurricane corridor. Season runs June 1–Nov 30. Level 0 = no named storms in Atlantic basin. Check NHC for real-time updates and 5-day cone forecasts.</p>
          </Tooltip>
        </div>
        <div className="text-[10px] bg-red-500/20 border border-red-500/40 p-2.5 text-center text-red-400 uppercase font-black tracking-widest rounded-lg">
          Hurricane Season Active — Jun 1–Nov 30
        </div>
      </div>

      {/* Row 4: Vessel (2 col) + Ad */}
      <div className="md:col-span-2 xl:col-span-2">
        <VesselSentry />
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
