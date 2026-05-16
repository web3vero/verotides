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
    <div className="terminal-box p-6 flex flex-col gap-4 border-primary/20 rounded-xl transition-all hover:border-primary/40 group">
      <div className="border-b border-border/40 pb-2 flex justify-between items-center">
        <span className="font-black text-primary uppercase tracking-widest text-sm flex items-center gap-3 italic">
           🎣 BITE_WINDOWS
        </span>
        <span className={`text-xs font-mono font-black ${isLoading ? 'animate-pulse opacity-50' : 'opacity-60 uppercase tracking-tighter'}`}>
          {isLoading ? 'CALCULATING' : 'SOLUNAR_SYNC'}
        </span>
      </div>
      
      {error ? (
        <div className="text-sm text-red-500 py-6 font-mono font-bold animate-pulse text-center">LINK_ERROR: SOLUNAR_NODE_OFFLINE</div>
      ) : (
        <div className="grid grid-cols-1 gap-4 mt-2">
          <div className="relative p-5 border-2 border-primary/20 bg-black shadow-[inset_0_0_20px_rgba(0,255,65,0.05)] rounded-lg group/data cursor-help">
            <div className="text-[10px] text-yellow-400 font-black mb-2 uppercase tracking-[0.2em]">Major_Activity</div>
            <div className="text-2xl md:text-3xl font-black text-white glow-text tracking-tighter leading-none">{major}</div>
            
            {/* Hover Tooltip */}
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-56 bg-primary text-black text-[10px] font-black p-2 rounded opacity-0 group-hover/data:opacity-100 transition-opacity pointer-events-none z-50 shadow-2xl uppercase tracking-tighter text-center">
              Optimal feeding window based on lunar transit. Maximize coastal deployment.
            </div>
          </div>
          
          <div className="p-3 border-2 border-primary/10 bg-black/60 rounded-lg flex justify-between items-center group/minor relative cursor-help">
            <div className="text-[10px] text-primary/40 font-black uppercase tracking-widest">Minor_Activity</div>
            <div className="text-lg font-black text-white/90">{minor}</div>

            {/* Hover Tooltip */}
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-48 bg-primary text-black text-[10px] font-black p-2 rounded opacity-0 group-hover/minor:opacity-100 transition-opacity pointer-events-none z-50 shadow-2xl uppercase tracking-tighter text-center">
              Secondary activity spike. Baseline engagement expected.
            </div>
          </div>
          
          <div className="text-xs text-center font-mono uppercase bg-yellow-400/10 py-2 border-2 border-yellow-400/20 rounded-md shadow-sm">
            <span className="text-white/40 font-bold tracking-widest">LUNAR_PHASE:</span> <span className="text-yellow-400 font-black ml-2 glow-text-yellow">{phase}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default BiteTimesWidget;
