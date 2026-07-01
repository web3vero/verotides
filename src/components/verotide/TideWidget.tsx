'use client';

import React from 'react';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

interface TideWidgetProps {
  station?: string;
  stationName?: string;
  initialData?: any;
}

const TideWidget = ({ station = '8722125', stationName = 'Vero Beach (Intracoastal), FL', initialData }: TideWidgetProps) => {
  const { data, error, isLoading } = useSWR(`/api/verotide/tides?station=${station}`, fetcher, {
    fallbackData: initialData,
    refreshInterval: 300000 // 5 minutes
  });

  interface TidePrediction {
    t: string;
    v: string;
    type: string;
  }

  const nextHigh = data?.predictions?.find((p: TidePrediction) => p.type === 'H') || { t: '08:42 AM', v: '3.2' };
  const nextLow = data?.predictions?.find((p: TidePrediction) => p.type === 'L') || { t: '02:18 PM', v: '-0.1' };

  const formatTime = (timeStr: string) => {
    if (timeStr.includes('-')) {
      const timePart = timeStr.split(' ')[1];
      return timePart || timeStr;
    }
    return timeStr;
  };

  const isSebastian = station === '8722004';

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
            <div className="absolute -top-28 left-0 right-0 mx-1 bg-black border border-primary/40 text-primary text-[10px] font-mono p-3 rounded opacity-0 group-hover/data:opacity-100 transition-opacity pointer-events-none z-50 shadow-2xl leading-relaxed text-left">
              <p className="font-black text-primary mb-1">
                {isSebastian ? 'High Tide — Sebastian Inlet' : 'High Tide — Vero Beach (Intracoastal)'}
              </p>
              <p className="text-white/70">
                {isSebastian
                  ? 'Best time for surfers and beach access. Fishing improves 1–2 hrs before peak as bait fish concentrate near structure. Expect stronger current through Sebastian Inlet. Boaters: deeper draft vessels can transit safely.'
                  : 'Prime time for navigating shallow Intracoastal channels. Water level rises around dock structures and mangroves, triggering fish to move closer to cover. Ideal for recreational boating.'}
              </p>
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
            <div className="absolute -top-28 left-0 right-0 mx-1 bg-black border border-primary/40 text-primary text-[10px] font-mono p-3 rounded opacity-0 group-hover/data:opacity-100 transition-opacity pointer-events-none z-50 shadow-2xl leading-relaxed text-left">
              <p className="font-black text-primary mb-1">
                {isSebastian ? 'Low Tide — Sebastian Inlet' : 'Low Tide — Vero Beach (Intracoastal)'}
              </p>
              <p className="text-white/70">
                {isSebastian
                  ? 'Exposed sandbars and flats — prime for wading and snook/redfish on the flats. Inlet current reversal creates prime ambush points. Watch for shallow draft warnings near the bar. Best for clamming and shell hunting on the beach.'
                  : 'Exposed oysters, mud flats, and sandbars in the Indian River Lagoon. Good for target casting to deep channel edges. Wading is excellent on firm sandy bars.'}
              </p>
            </div>
          </div>

          <div className="col-span-2 text-[10px] opacity-40 italic text-center font-mono mt-1 uppercase tracking-[0.2em] font-bold">
            NOAA Station {station} · {stationName}
          </div>
        </div>
      )}
    </div>
  );
};

export default TideWidget;
