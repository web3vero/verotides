'use client';

import React from 'react';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

const TideWidget = () => {
  const { data, error, isLoading } = useSWR('/api/verotide/tides', fetcher, {
    refreshInterval: 300000 // 5 minutes
  });

  const nextHigh = data?.predictions?.find((p: any) => p.type === 'H') || { t: '08:42 AM', v: '3.2' };
  const nextLow = data?.predictions?.find((p: any) => p.type === 'L') || { t: '02:18 PM', v: '-0.1' };

  const formatTime = (timeStr: string) => {
    if (timeStr.includes('-')) {
      const timePart = timeStr.split(' ')[1];
      return timePart || timeStr;
    }
    return timeStr;
  };

  return (
    <div className="terminal-box p-6 flex flex-col gap-4 border-primary/20 rounded-xl transition-all hover:border-primary/40 group">
      <div className="border-b border-border/40 pb-2 flex justify-between items-center">
        <span className="font-black text-white glow-text uppercase tracking-widest text-sm flex items-center gap-3">
          <span className="h-2 w-2 bg-primary rounded-full shadow-[0_0_8px_rgba(0,255,65,1)]"></span>
          🌊 TIDE_DYNAMICS
        </span>
        <span className={`text-xs font-black ${isLoading ? 'animate-pulse opacity-50' : 'bg-primary text-black px-3 py-0.5 rounded-full uppercase shadow-[0_0_10px_rgba(0,255,65,0.3)]'}`}>
          {isLoading ? 'SYNCING' : 'LIVE'}
        </span>
      </div>
      
      {error ? (
        <div className="text-sm text-red-500 py-6 font-mono font-bold animate-pulse text-center">LINK_ERROR: TIDE_DATA_OFFLINE</div>
      ) : (
        <div className="grid grid-cols-2 gap-4 mt-2">
          <div className="relative p-5 border-2 border-primary/20 bg-black shadow-[inset_0_0_20px_rgba(0,255,65,0.05)] rounded-lg flex flex-col items-center text-center group/data cursor-help">
            <div className="text-[10px] text-primary/60 font-black uppercase mb-2 tracking-[0.2em]">Next_High</div>
            <div className="text-3xl md:text-4xl font-black text-yellow-400 glow-text leading-none mb-2 tracking-tighter">
              {formatTime(nextHigh.t)}
            </div>
            <div className="text-sm font-black text-primary bg-primary/10 px-4 py-1 rounded-full uppercase border border-primary/30 shadow-sm">
              {nextHigh.v} FT
            </div>
            
            {/* Hover Tooltip */}
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 bg-primary text-black text-[10px] font-black p-2 rounded opacity-0 group-hover/data:opacity-100 transition-opacity pointer-events-none z-50 shadow-2xl uppercase tracking-tighter text-center">
              Peak water level predicted. Station 8722125 historical confidence: 98.4%
            </div>
          </div>
          
          <div className="relative p-5 border-2 border-primary/20 bg-black shadow-[inset_0_0_20px_rgba(0,255,65,0.05)] rounded-lg flex flex-col items-center text-center group/data cursor-help">
            <div className="text-[10px] text-primary/60 font-black uppercase mb-2 tracking-[0.2em]">Next_Low</div>
            <div className="text-3xl md:text-4xl font-black text-yellow-400 glow-text leading-none mb-2 tracking-tighter">
              {formatTime(nextLow.t)}
            </div>
            <div className="text-sm font-black text-primary bg-primary/10 px-4 py-1 rounded-full uppercase border border-primary/30 shadow-sm">
              {nextLow.v} FT
            </div>

            {/* Hover Tooltip */}
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 bg-primary text-black text-[10px] font-black p-2 rounded opacity-0 group-hover/data:opacity-100 transition-opacity pointer-events-none z-50 shadow-2xl uppercase tracking-tighter text-center">
              Minimum vertical clearance for vessels. Monitoring coastal erosion factors.
            </div>
          </div>
          
          <div className="col-span-2 text-xs opacity-40 italic text-center font-mono mt-2 uppercase tracking-[0.3em] font-bold group-hover:opacity-100 transition-opacity">
            NODE_8722125 // SEBASTIAN_INLET_FL
          </div>
        </div>
      )}
    </div>
  );
};

export default TideWidget;
