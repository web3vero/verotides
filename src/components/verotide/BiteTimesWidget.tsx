'use client';

import React from 'react';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

interface BiteTimesWidgetProps {
  lat?: number;
  lon?: number;
  initialData?: unknown;
}

const BiteTimesWidget = ({ lat = 27.6386, lon = -80.3973, initialData }: BiteTimesWidgetProps) => {
  const { data, error, isLoading } = useSWR(`/api/verotide/solunar?lat=${lat}&lon=${lon}`, fetcher, {
    fallbackData: initialData,
    refreshInterval: 3600000 // 1 hour
  });

  const major = data?.major?.length > 0 ? `${data.major[0].start} - ${data.major[0].end}` : '06:30 AM - 08:30 AM';
  const minor = data?.minor?.length > 0 ? `${data.minor[0].start} - ${data.minor[0].end}` : '12:00 PM - 01:30 PM';
  const phase = data?.moon?.phase || 'WAXING_GIBBOUS (74%)';

  const isSebastian = lat > 27.75; // Sebastian Inlet is at ~27.86

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
            <div className="absolute -top-32 left-0 right-0 mx-1 bg-black border border-primary/40 text-[10px] font-mono p-3 rounded opacity-0 group-hover/data:opacity-100 transition-opacity pointer-events-none z-50 shadow-2xl leading-relaxed text-left">
              <p className="font-black text-primary mb-1">Major Solunar Window</p>
              <p className="text-white/70 mb-1">Peak feeding activity triggered by lunar overhead/underfoot transit. Fish metabolism and movement increases significantly.</p>
              <p className="text-yellow-400 font-black text-[9px]">
                {isSebastian ? 'Target species in Sebastian Inlet:' : 'Target species in Vero Beach:'}
              </p>
              <p className="text-white/60 text-[9px]">
                {isSebastian
                  ? 'Redfish (Red Drum) · Snook · Flounder · Spanish Mackerel · Bluefish · Pompano · Sheepshead · Sharks'
                  : 'Snook · Redfish (Red Drum) · Tarpon · Spanish Mackerel · Flounder · Pompano · Sheepshead'}
              </p>
            </div>
          </div>

          <div className="p-3 border-2 border-primary/10 bg-black/60 rounded-lg flex justify-between items-center group/minor relative cursor-help">
            <div className="text-[10px] text-primary/40 font-black uppercase tracking-widest">Minor_Activity</div>
            <div className="text-lg font-black text-white/90">{minor}</div>

            {/* Hover Tooltip */}
            <div className="absolute -top-20 left-0 right-0 mx-1 bg-black border border-primary/40 text-[10px] font-mono p-3 rounded opacity-0 group-hover/minor:opacity-100 transition-opacity pointer-events-none z-50 shadow-2xl leading-relaxed text-left">
              <p className="font-black text-primary mb-1">Minor Solunar Window</p>
              <p className="text-white/70">Triggered by moonrise or moonset. Less intense than major period but still worth fishing. Activity typically lasts 30–45 min. Layer with tide changes for best results.</p>
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
