'use client';

import React from 'react';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

const TideWidget = () => {
  const { data, error, isLoading } = useSWR('/api/verotide/tides', fetcher, {
    refreshInterval: 300000 // 5 minutes
  });

  // Extract predictions or use placeholders
  const nextHigh = data?.predictions?.find((p: any) => p.type === 'H') || { t: '08:42 AM', v: '3.2' };
  const nextLow = data?.predictions?.find((p: any) => p.type === 'L') || { t: '02:18 PM', v: '-0.1' };

  // Helper to ensure we get the full time string without accidental truncation
  const formatTime = (timeStr: string) => {
    // If the format is "YYYY-MM-DD HH:MM", we just want "HH:MM"
    // If it's already "HH:MM AM/PM", keep it.
    if (timeStr.includes('-')) {
      const timePart = timeStr.split(' ')[1];
      return timePart || timeStr;
    }
    return timeStr;
  };

  return (
    <div className="terminal-box p-4 flex flex-col gap-3 border-primary/20 rounded-lg">
      <div className="border-b border-border pb-1 flex justify-between items-center">
        <span className="font-bold text-white/90 uppercase tracking-tight text-xs flex items-center gap-2">
          <span className="h-1.5 w-1.5 bg-primary rounded-full"></span>
          🌊 Tide_Dynamics
        </span>
        <span className={`text-[9px] font-black ${isLoading ? 'animate-pulse opacity-50' : 'bg-primary text-black px-2 rounded-sm uppercase'}`}>
          {isLoading ? 'SYNC' : 'LIVE'}
        </span>
      </div>
      
      {error ? (
        <div className="text-[10px] text-red-500 py-4 font-mono">LINK_ERROR: TIDE_DATA_OFFLINE</div>
      ) : (
        <div className="grid grid-cols-2 gap-3 mt-1">
          <div className="p-3 border border-primary/20 bg-black/80 shadow-[inset_0_0_15px_rgba(0,255,65,0.05)] rounded-md flex flex-col items-center text-center">
            <div className="text-[8px] text-primary/60 font-black uppercase mb-1 tracking-widest">Next_High</div>
            <div className="text-xl font-black text-yellow-400 glow-text leading-tight mb-1">
              {formatTime(nextHigh.t)}
            </div>
            <div className="text-[11px] font-black text-primary/90 bg-primary/10 px-2 rounded-full uppercase tracking-tighter">
              {nextHigh.v} FT
            </div>
          </div>
          
          <div className="p-3 border border-primary/20 bg-black/80 shadow-[inset_0_0_15px_rgba(0,255,65,0.05)] rounded-md flex flex-col items-center text-center">
            <div className="text-[8px] text-primary/60 font-black uppercase mb-1 tracking-widest">Next_Low</div>
            <div className="text-xl font-black text-yellow-400 glow-text leading-tight mb-1">
              {formatTime(nextLow.t)}
            </div>
            <div className="text-[11px] font-black text-primary/90 bg-primary/10 px-2 rounded-full uppercase tracking-tighter">
              {nextLow.v} FT
            </div>
          </div>
          
          <div className="col-span-2 text-[9px] opacity-40 italic text-center font-mono mt-1 uppercase tracking-widest">
            NODE_8722125 // SEBASTIAN_INLET
          </div>
        </div>
      )}
    </div>
  );
};

export default TideWidget;
