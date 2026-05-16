'use client';

import React, { useState, useEffect } from 'react';
import VesselSentry from './VesselSentry';
import VisualSentry from './VisualSentry';
import TideWidget from './TideWidget';
import BiteTimesWidget from './BiteTimesWidget';
import BeachSentryWidget from './BeachSentryWidget';

const VeroDashboard = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8 p-4 md:p-8 pb-20 w-full max-w-full">
      {/* Time & Location Header - Immersive Scale */}
      <div className="col-span-full terminal-box p-8 flex flex-col xl:flex-row justify-between items-center gap-6 border-b-4 border-primary/40 rounded-2xl bg-black/40 backdrop-blur-md">
        <div className="text-center xl:text-left">
          <h2 className="text-3xl md:text-4xl font-black glow-text italic tracking-tighter uppercase mb-2">VERO_CENTRAL_COMMAND</h2>
          <div className="text-xs md:text-sm opacity-60 uppercase font-mono tracking-[0.4em] font-bold">IRC_COASTAL_GRID // SECTOR_32963 // 32964_STRATEGY</div>
        </div>
        <div className="text-center xl:text-right font-mono">
          <div className="text-5xl md:text-7xl text-yellow-400 font-black glow-text leading-none mb-2 tracking-tighter">
            {currentTime.toLocaleTimeString([], { hour12: true })}
          </div>
          <div className="text-sm md:text-base opacity-70 font-black uppercase tracking-[0.5em] text-primary">
            {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </div>
        </div>
      </div>

      {/* Primary Recon Row */}
      <TideWidget />
      <BiteTimesWidget />
      <VisualSentry />

      {/* Utility Layer */}
      <BeachSentryWidget />

      {/* Trash Pickup Widget - Standardized & Upscaled */}
      <div className="terminal-box p-6 flex flex-col gap-4 border-primary/20 rounded-xl group relative overflow-hidden">
        <div className="border-b border-border/40 pb-2 flex justify-between items-center">
          <span className="font-black text-white glow-text uppercase tracking-widest text-sm flex items-center gap-3 italic">
             🚛 TRASH_ROUTING
          </span>
          <span className="text-[10px] opacity-60 uppercase font-mono font-black tracking-tighter">IRC_GIS_SYNC</span>
        </div>
        <div className="grid grid-cols-1 gap-4 mt-2">
          <div className="relative flex items-center justify-between bg-black/60 p-5 border-2 border-primary/20 rounded-lg group/pickup cursor-help">
            <div className="text-[10px] text-primary/60 font-black uppercase tracking-widest">Household_Pickup</div>
            <div className="text-2xl font-black text-yellow-400 uppercase italic leading-none">MON / THU</div>
            
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-56 bg-primary text-black text-[10px] font-black p-2 rounded opacity-0 group-hover/pickup:opacity-100 transition-opacity pointer-events-none z-50 shadow-2xl uppercase tracking-tighter text-center">
              Standard IRC Waste Management schedule for 32963 node.
            </div>
          </div>
          <div className="relative flex items-center justify-between bg-black/60 p-5 border-2 border-primary/20 rounded-lg group/recycle cursor-help">
            <div className="text-[10px] text-primary/60 font-black uppercase tracking-widest">Recycling_Cycle</div>
            <div className="text-2xl font-black text-yellow-400 uppercase italic leading-none">WEDNESDAY</div>

            <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-56 bg-primary text-black text-[10px] font-black p-2 rounded opacity-0 group-hover/recycle:opacity-100 transition-opacity pointer-events-none z-50 shadow-2xl uppercase tracking-tighter text-center">
              Single-stream recycling protocols active. Node: Beachside.
            </div>
          </div>
          <button className="w-full mt-2 bg-primary/10 border-2 border-primary/40 py-4 text-xs hover:bg-primary text-black transition-all uppercase font-black text-primary tracking-[0.2em] rounded-lg shadow-xl">
            ADDRESS_GIS_QUERY_INJECT ↗
          </button>
        </div>
      </div>

      {/* Bridge Telemetry - Standardized & Upscaled */}
      <div className="terminal-box p-6 flex flex-col gap-4 border-primary/20 rounded-xl group relative overflow-hidden">
        <div className="border-b border-border/40 pb-2 flex justify-between items-center">
          <span className="font-black text-white glow-text uppercase tracking-widest text-sm flex items-center gap-3 italic">
             🌉 BRIDGE_GRID
          </span>
          <span className="text-[10px] opacity-60 uppercase font-mono font-black">TELEMETRY_SYNC</span>
        </div>
        <div className="flex flex-col gap-3 mt-2">
          {[
            { name: 'BARBER (SR_60)', status: 'OPEN_CLEAR', desc: 'Main artery to mainland. Zero lift delay.' },
            { name: '17TH_ST (SR_656)', status: 'OPEN_CLEAR', desc: 'Southern node bridge. Optimal transit.' },
            { name: 'WABASSO (CR_510)', status: 'OPEN_CLEAR', desc: 'Northern tactical crossing. Clear.' }
          ].map(bridge => (
            <div key={bridge.name} className="relative flex justify-between items-center p-4 bg-black/60 border-2 border-primary/10 rounded-lg group/bridge cursor-help hover:border-primary/30 transition-colors">
              <span className="text-xs uppercase font-black text-primary/80 tracking-widest">{bridge.name}</span>
              <span className="text-xs text-yellow-400 uppercase font-black bg-yellow-400/10 px-3 py-1 border border-yellow-400/20 rounded-md shadow-[0_0_10px_rgba(250,204,21,0.3)]">
                {bridge.status}
              </span>

              {/* Hover Tooltip */}
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-64 bg-primary text-black text-[10px] font-black p-2 rounded opacity-0 group-hover/bridge:opacity-100 transition-opacity pointer-events-none z-50 shadow-2xl uppercase tracking-tighter text-center">
                {bridge.desc}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Storm Sentry - Upscaled Alert */}
      <div className="terminal-box p-8 flex flex-col gap-6 bg-red-950/10 border-red-500/40 rounded-2xl group relative overflow-hidden lg:col-span-1 xl:col-span-1">
        <div className="border-b border-red-500/20 pb-2 flex justify-between items-center">
          <span className="font-black text-red-500 uppercase tracking-[0.3em] text-sm flex items-center gap-4 italic">
             <span className="animate-spin duration-5000">🌀</span> STORM_SENTRY
          </span>
          <span className="text-[10px] opacity-70 italic uppercase font-mono font-black text-red-400">NHC_DIRECT_LINK</span>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center gap-4 py-6 cursor-help group/storm">
          <div className="text-4xl md:text-5xl font-black text-primary uppercase animate-pulse glow-text tracking-tighter">LEVEL_0</div>
          <div className="text-sm text-primary/80 uppercase font-mono text-center font-black tracking-widest">
            NO_TROPICAL_ACTIVITY_DETECTED
          </div>
          
          <div className="absolute inset-0 bg-red-500/5 opacity-0 group-hover/storm:opacity-100 transition-opacity pointer-events-none"></div>
          
          {/* Hover Tooltip */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 bg-red-600 text-white text-[10px] font-black p-4 rounded opacity-0 group-hover/storm:opacity-100 transition-opacity pointer-events-none z-50 shadow-2xl uppercase tracking-widest text-center border-2 border-white">
            Monitoring Atlantic basin via NHC satellite array. Zero threats within 500nm.
          </div>
        </div>
        <div className="text-xs bg-red-500/20 border-2 border-red-500/40 p-3 text-center text-red-400 uppercase font-black tracking-[0.4em] rounded-xl shadow-inner">
          HURRICANE_SEASON_ACTV
        </div>
      </div>

      {/* Vessel Tracking Layer - Full Span */}
      <div className="md:col-span-full xl:col-span-2">
        <VesselSentry />
      </div>
    </div>
  );
};

export default VeroDashboard;
