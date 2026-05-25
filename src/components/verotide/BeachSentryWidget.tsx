'use client';

import React from 'react';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

const isTurtleNestingSeason = () => {
  const m = new Date().getMonth() + 1;
  return m >= 3 && m <= 10;
};

const BeachSentryWidget = () => {
  const { data, error, isLoading } = useSWR('/api/verotide/weather', fetcher, {
    refreshInterval: 600000 // 10 minutes
  });

  const temp = data?.properties?.periods?.[0]?.temperature || '79';
  const wind = data?.properties?.periods?.[0]?.windSpeed || '10 mph';
  const desc = data?.properties?.periods?.[0]?.shortForecast || 'SUNNY';
  const nestingActive = isTurtleNestingSeason();

  return (
    <div className="terminal-box p-6 flex flex-col gap-4 border-primary/20 rounded-xl transition-all hover:border-primary/40 group">
      <div className="border-b border-border/40 pb-2 flex justify-between items-center">
        <span className="font-black italic text-white/90 text-sm tracking-widest flex items-center gap-3">
          <span className="animate-pulse">🏖️</span> BEACH_SENTRY
        </span>
        <span className={`text-[10px] font-black ${isLoading ? 'animate-pulse opacity-50' : 'opacity-60 uppercase tracking-tighter'}`}>
          {isLoading ? 'OBSERVING' : 'ATMOS_LIVE'}
        </span>
      </div>
      
      {error ? (
        <div className="text-sm text-red-500 py-6 font-mono font-bold animate-pulse text-center">LINK_ERROR: ATMOSPHERIC_SENSOR_OFFLINE</div>
      ) : (
        <div className="grid grid-cols-2 gap-4 mt-2">
          <div className="p-5 border-2 border-primary/20 bg-black/80 shadow-[inset_0_0_20px_rgba(0,255,65,0.05)] rounded-lg flex flex-col items-center group/data relative cursor-help">
            <div className="text-[10px] text-primary/60 font-black uppercase mb-2 tracking-[0.2em]">Surface_Temp</div>
            <div className="text-4xl font-black text-yellow-400 glow-text leading-none">{temp}°F</div>
            
            {/* Hover Tooltip */}
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 bg-primary text-black text-[10px] font-black p-2 rounded opacity-0 group-hover/data:opacity-100 transition-opacity pointer-events-none z-50 shadow-2xl uppercase tracking-tighter text-center">
              Real-time atmospheric reading. Heat index recalibration active.
            </div>
          </div>
          
          <div className="p-5 border-2 border-primary/20 bg-black/80 shadow-[inset_0_0_20px_rgba(0,255,65,0.05)] rounded-lg flex flex-col items-center group/wind relative cursor-help">
            <div className="text-[10px] text-primary/60 font-black uppercase mb-2 tracking-[0.2em]">Wind_Velocity</div>
            <div className="text-2xl font-black text-yellow-400 leading-none">{wind}</div>

            {/* Hover Tooltip */}
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 bg-primary text-black text-[10px] font-black p-2 rounded opacity-0 group-hover/wind:opacity-100 transition-opacity pointer-events-none z-50 shadow-2xl uppercase tracking-tighter text-center">
              Surface wind vectors. Influencing coastal surf dynamics.
            </div>
          </div>
          
          <div className="p-3 border-2 border-primary/10 bg-black/60 rounded-md group/atmos relative cursor-help">
            <div className="text-[10px] text-primary/40 font-black uppercase mb-1 tracking-widest text-center">Atmosphere</div>
            <div className="text-xs font-black text-primary uppercase leading-tight text-center truncate">{desc}</div>

            {/* Hover Tooltip */}
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-48 bg-primary text-black text-[10px] font-black p-2 rounded opacity-0 group-hover/atmos:opacity-100 transition-opacity pointer-events-none z-50 shadow-2xl uppercase tracking-tighter text-center">
              NWS Local Forecast Synopsis. 96-hour grid update.
            </div>
          </div>
          
          <a
            href="https://myfwc.com/research/redtide/monitoring/"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 border-2 border-primary/10 bg-black/60 rounded-md group/redtide relative cursor-pointer hover:border-primary/30 transition-colors"
          >
            <div className="text-[10px] text-primary/40 font-black uppercase mb-1 tracking-widest text-center">Red_Tide</div>
            <div className="text-xs font-black text-yellow-400 uppercase text-center tracking-[0.2em]">CHECK_FWC ↗</div>

            {/* Hover Tooltip */}
            <div className="absolute -top-14 left-1/2 -translate-x-1/2 w-52 bg-primary text-black text-[10px] font-black p-2 rounded opacity-0 group-hover/redtide:opacity-100 transition-opacity pointer-events-none z-50 shadow-2xl uppercase tracking-tighter text-center">
              Click to view live FWC Red Tide monitoring for Indian River County and east-central Florida coast.
            </div>
          </a>
        </div>
      )}
      
      <div className="text-xs bg-yellow-400/10 p-3 border-l-4 border-yellow-400 mt-2 font-mono flex justify-between items-center shadow-lg rounded-r-md group/turtle relative cursor-help">
        <span className="text-white/80 font-black uppercase tracking-widest">🐢 Nesting_Status:</span>
        <span className={`font-black uppercase tracking-tighter ${nestingActive ? 'text-yellow-400 animate-pulse' : 'text-primary/50'}`}>
          {nestingActive ? 'Active_Season' : 'Off_Season'}
        </span>

        {/* Hover Tooltip */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-64 bg-primary text-black text-[10px] font-black p-2 rounded opacity-0 group-hover/turtle:opacity-100 transition-opacity pointer-events-none z-50 shadow-2xl uppercase tracking-tighter text-center">
          {nestingActive
            ? 'Sea Turtle nesting season Mar–Oct. Minimize beach illumination 9PM–7AM.'
            : 'Sea Turtle nesting season inactive. Next season begins March 1.'}
        </div>
      </div>
    </div>
  );
};

export default BeachSentryWidget;
