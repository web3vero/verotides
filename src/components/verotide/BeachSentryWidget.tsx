'use client';

import React from 'react';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

const BeachSentryWidget = () => {
  const { data, error, isLoading } = useSWR('/api/verotide/weather', fetcher, {
    refreshInterval: 600000 // 10 minutes
  });

  const temp = data?.properties?.periods?.[0]?.temperature || '79';
  const wind = data?.properties?.periods?.[0]?.windSpeed || '10 mph';
  const desc = data?.properties?.periods?.[0]?.shortForecast || 'SUNNY';

  return (
    <div className="terminal-box p-4 flex flex-col gap-3 border-primary/20">
      <div className="border-b border-border pb-1 flex justify-between items-center">
        <span className="font-bold italic text-white/90 text-xs">🏖️ Beach_Sentry</span>
        <span className={`text-[10px] ${isLoading ? 'animate-pulse opacity-50' : 'opacity-50 italic font-mono'}`}>
          {isLoading ? 'OBS' : 'SYNCED'}
        </span>
      </div>
      
      {error ? (
        <div className="text-[10px] text-red-500 py-4 font-mono">LINK_ERROR: ATMOSPHERIC_SENSOR_OFFLINE</div>
      ) : (
        <div className="grid grid-cols-2 gap-3 mt-1">
          <div className="p-3 border border-primary/20 bg-black/60 shadow-[inset_0_0_10px_rgba(0,255,65,0.05)] rounded-sm">
            <div className="text-[9px] text-primary/60 font-black uppercase mb-1">Surface_Temp</div>
            <div className="text-xl font-black text-yellow-400 glow-text leading-none">{temp}°F</div>
          </div>
          
          <div className="p-3 border border-primary/20 bg-black/60 shadow-[inset_0_0_10px_rgba(0,255,65,0.05)] rounded-sm">
            <div className="text-[9px] text-primary/60 font-black uppercase mb-1">Wind_Velocity</div>
            <div className="text-lg font-black text-yellow-400 leading-none">{wind}</div>
          </div>
          
          <div className="p-2 border border-primary/20 bg-black/60 rounded-sm">
            <div className="text-[9px] text-primary/40 font-black uppercase mb-1">Atmosphere</div>
            <div className="text-[11px] font-black text-primary uppercase leading-tight truncate">{desc}</div>
          </div>
          
          <div className="p-2 border border-primary/20 bg-black/60 rounded-sm">
            <div className="text-[9px] text-primary/40 font-black uppercase mb-1">Red_Tide</div>
            <div className="text-[11px] font-black text-primary uppercase">CLEARED</div>
          </div>
        </div>
      )}
      
      <div className="text-[10px] bg-yellow-400/10 p-2 border-l-4 border-yellow-400 mt-2 font-mono flex justify-between items-center">
        <span className="text-white/80 font-bold uppercase tracking-tight">🐢 Nesting_Status:</span>
        <span className="text-yellow-400 font-black uppercase animate-pulse">Active</span>
      </div>
    </div>
  );
};

export default BeachSentryWidget;
