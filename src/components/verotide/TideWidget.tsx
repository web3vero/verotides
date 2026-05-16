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
        <span className="font-bold">🌊 TIDE_DYNAMICS</span>
        <span className={`text-[10px] ${isLoading ? 'animate-pulse opacity-50' : 'bg-primary text-black px-1'}`}>
          {isLoading ? 'SYNCING...' : 'LIVE'}
        </span>
      </div>
      {error ? (
        <div className="text-[10px] text-red-500 py-4 font-mono">LINK_ERROR: TIDE_DATA_OFFLINE</div>
      ) : (
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-end border-b border-border/20 py-2">
            <span className="text-sm">NEXT_HIGH:</span>
            <span className="text-lg font-bold">
              {nextHigh.t.split(' ')[1] || nextHigh.t} <span className="text-xs font-normal opacity-50">({nextHigh.v}ft)</span>
            </span>
          </div>
          <div className="flex justify-between items-end border-b border-border/20 py-2">
            <span className="text-sm">NEXT_LOW:</span>
            <span className="text-lg font-bold">
              {nextLow.t.split(' ')[1] || nextLow.t} <span className="text-xs font-normal opacity-50">({nextLow.v}ft)</span>
            </span>
          </div>
          <div className="text-[10px] opacity-40 mt-2 italic text-center">STATION: SEBASTIAN_INLET_8722125</div>
        </div>
      )}
    </div>
  );
};

export default TideWidget;
