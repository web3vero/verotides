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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 p-2 md:p-4 pb-12">
      {/* Time & Location Header - Mobile Optimized Height */}
      <div className="col-span-full terminal-box p-4 flex flex-col md:flex-row justify-between items-center gap-4 border-b-2 border-primary/40 rounded-lg">
        <div className="text-center md:text-left">
          <h2 className="text-lg md:text-xl font-black glow-text italic tracking-tighter uppercase">Vero_Utility_Node</h2>
          <div className="text-[10px] opacity-60 uppercase font-mono tracking-widest">IRC_COASTAL_GRID // 32964_STRATEGY</div>
        </div>
        <div className="text-center md:text-right font-mono">
          <div className="text-3xl md:text-4xl text-yellow-400 font-black glow-text leading-none mb-1">
            {currentTime.toLocaleTimeString([], { hour12: true })}
          </div>
          <div className="text-[10px] opacity-50 font-black uppercase tracking-widest">
            {currentTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </div>
        </div>
      </div>

      {/* Primary Recon Row */}
      <TideWidget />
      <BiteTimesWidget />
      <VisualSentry />

      {/* Utility Layer */}
      <BeachSentryWidget />

      {/* Trash Pickup Widget - Standardized Design */}
      <div className="terminal-box p-4 flex flex-col gap-3 border-primary/20">
        <div className="border-b border-border pb-1 flex justify-between items-center">
          <span className="font-bold text-white/90 uppercase tracking-widest text-xs flex items-center gap-2">
             🚛 Trash_Routing
          </span>
          <span className="text-[9px] opacity-40 uppercase font-mono">GIS_SYNC</span>
        </div>
        <div className="grid grid-cols-1 gap-2 mt-1">
          <div className="flex items-center justify-between bg-black/60 p-3 border border-primary/20 rounded-sm">
            <div className="text-[9px] text-primary/60 font-black uppercase">Household_Pickup</div>
            <div className="text-lg font-black text-yellow-400 uppercase italic leading-none">MON / THU</div>
          </div>
          <div className="flex items-center justify-between bg-black/60 p-3 border border-primary/20 rounded-sm">
            <div className="text-[9px] text-primary/60 font-black uppercase">Recycling_Cycle</div>
            <div className="text-lg font-black text-yellow-400 uppercase italic leading-none">WED</div>
          </div>
          <button className="w-full mt-1 bg-primary/10 border border-primary/40 py-2.5 text-[10px] hover:bg-primary/20 transition-all uppercase font-black text-primary tracking-widest rounded shadow-sm">
            ENTER_ADDRESS_GIS_QUERY ↗
          </button>
        </div>
      </div>

      {/* Bridge Telemetry - Standardized Design */}
      <div className="terminal-box p-4 flex flex-col gap-3 border-primary/20">
        <div className="border-b border-border pb-1 flex justify-between items-center">
          <span className="font-bold text-white/80 uppercase tracking-widest text-xs flex items-center gap-2">
             🌉 Bridge_Grid
          </span>
          <span className="text-[9px] opacity-40 uppercase font-mono">LIVE_SENSORS</span>
        </div>
        <div className="flex flex-col gap-2 mt-1">
          {[
            { name: 'Barber (SR_60)', status: 'CLEAR' },
            { name: '17TH_ST (SR_656)', status: 'CLEAR' },
            { name: 'Wabasso (CR_510)', status: 'CLEAR' }
          ].map(bridge => (
            <div key={bridge.name} className="flex justify-between items-center p-2.5 bg-black/60 border border-primary/10 rounded-sm">
              <span className="text-[10px] uppercase font-black text-primary/70">{bridge.name}</span>
              <span className="text-[10px] text-yellow-400 uppercase font-black bg-yellow-400/10 px-2 py-0.5 border border-yellow-400/20 rounded-sm shadow-[0_0_5px_rgba(250,204,21,0.2)]">
                {bridge.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Storm Sentry - Extreme Visibility */}
      <div className="terminal-box p-4 flex flex-col gap-3 bg-red-950/10 border-red-500/30 lg:col-span-1">
        <div className="border-b border-red-500/20 pb-1 flex justify-between items-center">
          <span className="font-black text-red-500 uppercase tracking-tighter text-xs flex items-center gap-2">
             🌀 Storm_Sentry
          </span>
          <span className="text-[9px] opacity-50 italic uppercase font-mono">NHC_SYNC</span>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center gap-2 py-4">
          <div className="text-2xl font-black text-primary uppercase animate-pulse glow-text">LEVEL_0_THREAT</div>
          <div className="text-[10px] text-primary/60 uppercase font-mono text-center font-bold">Grid_Monitoring_Active</div>
        </div>
        <div className="text-[9px] bg-red-500/10 border border-red-500/20 p-1.5 text-center text-red-500/80 uppercase font-black tracking-widest rounded-sm">
          SEASON: JUN_01 - NOV_30
        </div>
      </div>

      {/* Vessel Tracking Layer - Full Span on Mobile */}
      <div className="md:col-span-full lg:col-span-2">
        <VesselSentry />
      </div>
    </div>
  );
};

export default VeroDashboard;
