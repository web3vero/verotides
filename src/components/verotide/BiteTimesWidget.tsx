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
        <span className="font-bold text-primary">🎣 BITE_WINDOWS</span>
        <span className={`text-[10px] ${isLoading ? 'animate-pulse opacity-50' : 'opacity-50 italic'}`}>
          {isLoading ? 'CALCULATING...' : 'SOLUNAR_CALC'}
        </span>
      </div>
      {error ? (
        <div className="text-[10px] text-red-500 py-4 font-mono">LINK_ERROR: SOLUNAR_NODE_OFFLINE</div>
      ) : (
        <div className="flex flex-col gap-2">
          <div className="bg-primary/10 p-2 border border-primary/20 rounded">
            <div className="text-[10px] opacity-50 uppercase">MAJOR_ACTIVITY:</div>
            <div className="font-bold">{major}</div>
          </div>
          <div className="bg-primary/5 p-2 border border-border/20 rounded opacity-70">
            <div className="text-[10px] opacity-50 uppercase">MINOR_ACTIVITY:</div>
            <div className="font-bold">{minor}</div>
          </div>
          <div className="text-[10px] mt-1 text-center opacity-60 uppercase">LUNAR_PHASE: {phase}</div>
        </div>
      )}
    </div>
  );
};

export default BiteTimesWidget;
