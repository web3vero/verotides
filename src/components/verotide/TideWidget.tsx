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

  return (
    <div className="terminal-box p-4 flex flex-col gap-3">
      <div className="border-b border-border pb-1 flex justify-between items-center">
        <span className="font-bold text-white/90 uppercase tracking-tight">🌊 Tide_Dynamics</span>
        <span className={`text-[10px] font-black ${isLoading ? 'animate-pulse opacity-50' : 'bg-primary text-black px-2'}`}>
          {isLoading ? 'SYNCING...' : 'LIVE'}
        </span>
      </div>
      {error ? (
        <div className="text-[10px] text-red-500 py-4 font-mono">LINK_ERROR: TIDE_DATA_OFFLINE</div>
      ) : (
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-end border-b border-primary/10 py-2">
            <span className="text-xs font-bold opacity-60 uppercase">Next_High:</span>
            <span className="text-xl font-black text-yellow-400 glow-text">
              {nextHigh.t.split(' ')[1] || nextHigh.t} <span className="text-xs font-bold text-primary">({nextHigh.v}FT)</span>
            </span>
          </div>
          <div className="flex justify-between items-end border-b border-primary/10 py-2">
            <span className="text-xs font-bold opacity-60 uppercase">Next_Low:</span>
            <span className="text-xl font-black text-yellow-400 glow-text">
              {nextLow.t.split(' ')[1] || nextLow.t} <span className="text-xs font-bold text-primary">({nextLow.v}FT)</span>
            </span>
          </div>
          <div className="text-[9px] opacity-30 mt-2 italic text-center font-mono">STATION_ID: 8722125_SEBASTIAN</div>
        </div>
      )}
    </div>
  );
};

export default TideWidget;
