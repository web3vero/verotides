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
      <div className="col-span-full terminal-box p-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-xl font-bold glow-text">VERO BEACH UTILITY HUB</h2>
          <div className="text-xs opacity-70">INDIAN RIVER COUNTY, FLORIDA [32960]</div>
        </div>
        <div className="text-right font-mono">
          <div className="text-2xl text-primary font-black shadow-primary/20">{currentTime.toLocaleTimeString()}</div>
          <div className="text-xs opacity-50">{currentTime.toLocaleDateString()}</div>
        </div>
      </div>

      {/* Visual Intelligence Layer - Promoted and Resized */}
      <div className="md:col-span-2 lg:col-span-2">
        <VisualSentry />
      </div>

      {/* Tide Widget */}
      <TideWidget />

      {/* Bite Times Widget */}
      <BiteTimesWidget />

      {/* Trash Pickup Widget (Static for now) */}
      <div className="terminal-box p-4 flex flex-col gap-3">
        <div className="border-b border-border pb-1 flex justify-between items-center">
          <span className="font-bold text-white/90">🚛 TRASH_ROUTING</span>
          <span className="text-[10px] opacity-50 uppercase">IRC_GIS_PORTAL</span>
        </div>
        <div className="flex flex-col gap-3 mt-1">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 border border-border/40 flex items-center justify-center text-xl bg-black shadow-[inset_0_0_5px_rgba(0,255,65,0.2)]">🗑️</div>
            <div>
              <div className="text-xs opacity-50 uppercase">HOUSEHOLD_PICKUP:</div>
              <div className="font-bold uppercase text-yellow-400">MON / THU</div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 border border-border/40 flex items-center justify-center text-xl bg-black shadow-[inset_0_0_5px_rgba(0,255,65,0.2)]">♻️</div>
            <div>
              <div className="text-xs opacity-50 uppercase">RECYCLING_CYCLE:</div>
              <div className="font-bold uppercase text-yellow-400">WED [WEEKLY]</div>
            </div>
          </div>
          <button className="text-[10px] border border-primary/40 p-2 hover:bg-primary/10 transition-colors uppercase font-bold text-primary">
            ENTER_ADDRESS_FOR_GIS_QUERY
          </button>
        </div>
      </div>

      {/* Beach Conditions Widget */}
      <BeachSentryWidget />

      {/* Bridge Status (Placeholder) */}
      <div className="terminal-box p-4 flex flex-col gap-3">
        <div className="border-b border-border pb-1 flex justify-between items-center">
          <span className="font-bold italic text-white/70">🌉 BRIDGE_TELEMETRY</span>
        </div>
        <div className="flex flex-col gap-2 mt-1">
          <div className="flex justify-between items-center p-2 bg-black border border-border/20">
            <span className="text-xs uppercase">BARBER_BRIDGE (SR_60)</span>
            <span className="text-[10px] text-primary uppercase font-bold bg-primary/10 px-1">CLEAR / OPEN</span>
          </div>
          <div className="flex justify-between items-center p-2 bg-black border border-border/20">
            <span className="text-xs uppercase">17TH_ST_BRIDGE (SR_656)</span>
            <span className="text-[10px] text-primary uppercase font-bold bg-primary/10 px-1">CLEAR / OPEN</span>
          </div>
          <div className="flex justify-between items-center p-2 bg-black border border-border/20">
            <span className="text-xs uppercase">WABASSO_BRIDGE (CR_510)</span>
            <span className="text-[10px] text-primary uppercase font-bold bg-primary/10 px-1">CLEAR / OPEN</span>
          </div>
        </div>
      </div>

      {/* Hurricane / Storm Tracker Placeholder */}
      <div className="terminal-box p-4 flex flex-col gap-3 bg-red-950/10 border-red-900/50">
        <div className="border-b border-red-900/50 pb-1 flex justify-between items-center">
          <span className="font-bold text-red-500 uppercase">🌀 STORM_SENTRY</span>
          <span className="text-[10px] opacity-50 italic uppercase">NHC_LIVE_FEED</span>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center gap-2 py-4">
          <div className="text-2xl opacity-80">✅</div>
          <div className="text-sm font-bold text-primary uppercase">NO_ACTIVE_CYCLONES</div>
          <div className="text-[10px] opacity-40 uppercase text-center">Vero Beach Area: Level_0_Threat</div>
        </div>
        <div className="text-[10px] border border-red-900/30 p-1 text-center opacity-50 uppercase">
          SEASON: JUN_01 - NOV_30
        </div>
      </div>

      {/* Vessel Tracking Layer */}
      <div className="md:col-span-full lg:col-span-1">
        <VesselSentry />
      </div>
    </div>
  );
};

export default VeroDashboard;
