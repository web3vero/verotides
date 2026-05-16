'use client';

import React from 'react';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

const BiteTimesWidget = () => {
  const { data, error, isLoading } = useSWR('/api/verotide/solunar', fetcher, {
    refreshInterval: 3600000 // 1 hour
  });

  const major = data?.major?.length > 0 ? `${data.major[0].start} - ${data.major[0].end}` : '06:30 AM - 08:30 AM';
  const minor = data?.minor?.length > 0 ? `${data.minor[0].start} - ${data.minor[0].end}` : '12:00 PM - 01:30 PM';
  const phase = data?.moon?.phase || 'WAXING_GIBBOUS (74%)';

  return (
    <div className="terminal-box p-4 flex flex-col gap-3 border-primary/20">
      <div className="border-b border-border pb-1 flex justify-between items-center">
        <span className="font-bold text-primary uppercase tracking-tighter text-xs flex items-center gap-2">
           🎣 Bite_Windows
        </span>
        <span className={`text-[10px] ${isLoading ? 'animate-pulse opacity-50' : 'opacity-50 italic font-mono'}`}>
          {isLoading ? 'CALC' : 'SYNCED'}
        </span>
      </div>
      
      {error ? (
        <div className="text-[10px] text-red-500 py-4 font-mono">LINK_ERROR: SOLUNAR_NODE_OFFLINE</div>
      ) : (
        <div className="grid grid-cols-1 gap-3 mt-1">
          <div className="p-3 border border-primary/20 bg-black/60 shadow-[inset_0_0_10px_rgba(0,255,65,0.05)] rounded-sm">
            <div className="text-[9px] text-primary/60 font-black uppercase mb-1">Major_Activity</div>
            <div className="text-xl font-black text-yellow-400 glow-text">{major}</div>
          </div>
          
          <div className="p-2 border border-primary/10 bg-black/40 rounded-sm flex justify-between items-center">
            <div className="text-[9px] text-primary/40 font-black uppercase">Minor_Activity</div>
            <div className="text-sm font-bold text-white/80">{minor}</div>
          </div>
          
          <div className="text-[10px] text-center font-mono uppercase bg-yellow-400/10 py-1.5 border border-yellow-400/20 rounded-sm">
            <span className="text-white/40">Lunar_Phase:</span> <span className="text-yellow-400 font-black">{phase}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default BiteTimesWidget;
