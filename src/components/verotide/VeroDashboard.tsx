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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
      {/* Time & Location Header */}
      <div className="col-span-full terminal-box p-4 flex flex-col md:flex-row justify-between items-center gap-4 border-b-2 border-primary">
        <div>
          <h2 className="text-xl font-black glow-text italic tracking-tighter">VERO_BEACH_UTILITY_HUB</h2>
          <div className="text-[10px] opacity-60 uppercase font-mono">Indian River County, FL // Area_Node_32960</div>
        </div>
        <div className="text-right font-mono">
          <div className="text-3xl text-yellow-400 font-black glow-text">{currentTime.toLocaleTimeString()}</div>
          <div className="text-xs opacity-50 font-bold uppercase">{currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
        </div>
      </div>

      {/* Primary Intelligence Row */}
      <TideWidget />
      <BiteTimesWidget />
      <VisualSentry />

      {/* Secondary Utilities */}
      <BeachSentryWidget />

      {/* Trash Pickup Widget */}
      <div className="terminal-box p-4 flex flex-col gap-3 border-primary/20">
        <div className="border-b border-border pb-1 flex justify-between items-center">
          <span className="font-bold text-white/90 uppercase tracking-widest text-xs">🚛 Trash_Routing</span>
          <span className="text-[9px] opacity-40 uppercase">IRC_GIS_SYNC</span>
        </div>
        <div className="flex flex-col gap-3 mt-1">
          <div className="flex items-center justify-between bg-black/40 p-2 border border-primary/10">
            <div className="text-[10px] opacity-50 uppercase font-bold">Household_Pickup:</div>
            <div className="font-black text-yellow-400 uppercase italic">Mon / Thu</div>
          </div>
          <div className="flex items-center justify-between bg-black/40 p-2 border border-primary/10">
            <div className="text-[10px] opacity-50 uppercase font-bold">Recycling_Cycle:</div>
            <div className="font-black text-yellow-400 uppercase italic">Wed [Weekly]</div>
          </div>
          <button className="text-[10px] border border-yellow-400/40 p-2 hover:bg-yellow-400/10 transition-colors uppercase font-black text-yellow-400 shadow-[inset_0_0_10px_rgba(250,204,21,0.1)]">
            Query_Address_GIS ↗
          </button>
        </div>
      </div>

      {/* Bridge Status */}
      <div className="terminal-box p-4 flex flex-col gap-3 border-primary/20">
        <div className="border-b border-border pb-1 flex justify-between items-center">
          <span className="font-bold text-white/70 uppercase tracking-widest text-xs">🌉 Bridge_Telemetry</span>
          <span className="text-[9px] opacity-40 uppercase font-mono">Live_Sensors</span>
        </div>
        <div className="flex flex-col gap-2 mt-1">
          <div className="flex justify-between items-center p-2 bg-black/40 border border-primary/10">
            <span className="text-[10px] uppercase font-bold opacity-60">Barber_Bridge (SR_60)</span>
            <span className="text-[10px] text-primary uppercase font-black bg-primary/10 px-2 border border-primary/20">Clear</span>
          </div>
          <div className="flex justify-between items-center p-2 bg-black/40 border border-primary/10">
            <span className="text-[10px] uppercase font-bold opacity-60">17th_ST_Bridge (SR_656)</span>
            <span className="text-[10px] text-primary uppercase font-black bg-primary/10 px-2 border border-primary/20">Clear</span>
          </div>
          <div className="flex justify-between items-center p-2 bg-black/40 border border-primary/10">
            <span className="text-[10px] uppercase font-bold opacity-60">Wabasso_Bridge (CR_510)</span>
            <span className="text-[10px] text-primary uppercase font-black bg-primary/10 px-2 border border-primary/20">Clear</span>
          </div>
        </div>
      </div>

      {/* Hurricane / Storm Tracker */}
      <div className="terminal-box p-4 flex flex-col gap-3 bg-red-950/5 border-red-900/30 lg:col-span-1">
        <div className="border-b border-red-900/40 pb-1 flex justify-between items-center">
          <span className="font-black text-red-500 uppercase tracking-tighter text-xs">🌀 Storm_Sentry</span>
          <span className="text-[9px] opacity-50 italic uppercase font-mono">NHC_Active</span>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center gap-2 py-4">
          <div className="text-xl font-black text-primary uppercase animate-pulse">Low_Threat_Level</div>
          <div className="text-[9px] opacity-40 uppercase font-mono text-center">Coastal Monitoring Active [Node_07]</div>
        </div>
        <div className="text-[9px] border border-red-900/20 p-1 text-center opacity-30 uppercase font-mono">
          Season: Jun_01 - Nov_30
        </div>
      </div>

      {/* Vessel Tracking Layer - High Visibility */}
      <div className="md:col-span-2 lg:col-span-2">
        <VesselSentry />
      </div>
    </div>
  );
};

export default VeroDashboard;
