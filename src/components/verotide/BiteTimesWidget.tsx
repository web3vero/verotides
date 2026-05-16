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
    <div className="terminal-box p-4 flex flex-col gap-3 border-primary/40">
      <div className="border-b border-border pb-1 flex justify-between items-center">
        <span className="font-bold text-primary uppercase tracking-tighter">🎣 Bite_Windows</span>
        <span className={`text-[10px] ${isLoading ? 'animate-pulse opacity-50' : 'opacity-50 italic font-mono'}`}>
          {isLoading ? 'CALCULATING...' : 'SOLUNAR_CALC'}
        </span>
      </div>
      {error ? (
        <div className="text-[10px] text-red-500 py-4 font-mono">LINK_ERROR: SOLUNAR_NODE_OFFLINE</div>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="bg-primary/5 p-3 border-l-4 border-yellow-400 rounded-sm">
            <div className="text-[9px] text-yellow-400 font-black mb-1 uppercase tracking-widest">Major_Activity:</div>
            <div className="text-lg font-black text-white glow-text">{major}</div>
          </div>
          <div className="bg-primary/5 p-3 border-l-4 border-primary/40 rounded-sm">
            <div className="text-[9px] text-primary/60 font-black mb-1 uppercase tracking-widest">Minor_Activity:</div>
            <div className="text-md font-bold text-white/80">{minor}</div>
          </div>
          <div className="text-[10px] mt-1 text-center font-mono uppercase bg-black/40 py-1 border border-primary/10">
            <span className="opacity-40">Phase:</span> <span className="text-yellow-400 font-bold">{phase}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default BiteTimesWidget;
