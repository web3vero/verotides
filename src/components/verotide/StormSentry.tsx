'use client';

import React from 'react';
import useSWR from 'swr';

interface NhcStormStatus {
  level: 0 | 1 | 2 | 3;
  stormCount: number;
  storms: Array<{ name: string; type: string; link?: string }>;
  lastUpdated: string;
  statusCode: 'NO_ACTIVITY' | 'TROPICAL_ACTIVITY' | 'HURRICANE_WATCH' | 'MAJOR_THREAT' | 'FEED_ERR';
}

const LEVEL_CONFIG = {
  0: { label: 'LEVEL_0', sublabel: 'No Tropical Activity\nDetected', color: 'text-primary', glow: 'shadow-[0_0_20px_rgba(0,255,65,0.4)]', border: 'border-red-500/40', bg: 'bg-red-950/10', bannerBg: 'bg-red-500/20 border-red-500/40 text-red-400' },
  1: { label: 'LEVEL_1', sublabel: 'Tropical Activity\nDetected', color: 'text-yellow-400', glow: 'shadow-[0_0_20px_rgba(250,204,21,0.5)]', border: 'border-yellow-500/60', bg: 'bg-yellow-950/20', bannerBg: 'bg-yellow-500/20 border-yellow-500/40 text-yellow-400' },
  2: { label: 'LEVEL_2', sublabel: 'Hurricane Watch\nAtlantic Basin', color: 'text-orange-400', glow: 'shadow-[0_0_20px_rgba(251,146,60,0.5)]', border: 'border-orange-500/60', bg: 'bg-orange-950/20', bannerBg: 'bg-orange-500/20 border-orange-500/40 text-orange-400' },
  3: { label: 'LEVEL_3', sublabel: 'Major Threat\nMonitor NHC Now', color: 'text-red-500', glow: 'shadow-[0_0_30px_rgba(239,68,68,0.7)]', border: 'border-red-500', bg: 'bg-red-950/40', bannerBg: 'bg-red-500/40 border-red-500 text-red-300 animate-pulse' },
} as const;

const fetcher = (url: string) => fetch(url).then(r => r.json());

const isHurricaneSeason = () => {
  const m = new Date().getMonth() + 1;
  return m >= 6 && m <= 11;
};

const StormSentry = () => {
  const { data, isLoading } = useSWR<NhcStormStatus>('/api/verotide/nhc', fetcher, {
    refreshInterval: 3600000,
    fallbackData: { level: 0, stormCount: 0, storms: [], lastUpdated: '', statusCode: 'NO_ACTIVITY' }
  });

  const level = data?.level ?? 0;
  const cfg = LEVEL_CONFIG[level];
  const inSeason = isHurricaneSeason();

  return (
    <div className={`terminal-box p-6 md:p-8 flex flex-col gap-4 ${cfg.bg} ${cfg.border} border-2 rounded-2xl group relative overflow-hidden transition-colors duration-700`}>
      <div className="border-b border-red-500/20 pb-2 flex justify-between items-center">
        <span className="font-black text-red-500 uppercase tracking-[0.2em] text-sm flex items-center gap-3 italic">
          <span className="animate-spin" style={{ animationDuration: '8s' }}>🌀</span> STORM_SENTRY
        </span>
        <div className="flex items-center gap-3">
          <span className={`text-[10px] font-black uppercase ${isLoading ? 'opacity-40 animate-pulse' : 'text-primary/60'}`}>
            {isLoading ? 'SYNCING' : data?.statusCode === 'FEED_ERR' ? 'FEED_ERR' : 'NHC_LIVE'}
          </span>
          <a href="https://www.nhc.noaa.gov/" target="_blank" rel="noopener noreferrer" className="text-[10px] opacity-70 hover:opacity-100 uppercase font-mono font-black text-red-400 transition-opacity">NHC ↗</a>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-3 py-4">
        <div className={`text-4xl md:text-5xl font-black uppercase animate-pulse tracking-tighter ${cfg.color} ${cfg.glow}`}>
          {cfg.label}
        </div>
        <div className={`text-xs uppercase font-mono text-center font-black tracking-widest leading-relaxed ${cfg.color} opacity-80`}>
          {cfg.sublabel.split('\n').map((l, i) => <React.Fragment key={i}>{l}{i === 0 && <br />}</React.Fragment>)}
        </div>

        {data && data.storms.length > 0 && (
          <div className="flex flex-col gap-1 mt-2 w-full">
            {data.storms.map(s => (
              <div key={s.name} className="flex justify-between items-center px-3 py-1.5 bg-black/60 border border-red-500/30 rounded text-[10px] font-mono font-black uppercase">
                <span className="text-white/70">{s.type}</span>
                {s.link ? (
                  <a
                    href={s.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-red-400 hover:text-red-300 hover:underline transition-colors"
                  >
                    {s.name} ↗
                  </a>
                ) : (
                  <span className="text-red-400">{s.name}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {inSeason ? (
        <div className={`text-[10px] border p-2.5 text-center uppercase font-black tracking-widest rounded-lg ${cfg.bannerBg}`}>
          {level >= 2
            ? `ACTIVE STORM IN BASIN — ${data?.stormCount ?? 0} SYSTEM${(data?.stormCount ?? 0) !== 1 ? 'S' : ''} — MONITOR NHC`
            : level === 1
            ? `TROPICAL ACTIVITY — ${data?.stormCount ?? 0} SYSTEM${(data?.stormCount ?? 0) !== 1 ? 'S' : ''} — MONITOR NHC`
            : 'Hurricane Season Active — Jun 1 – Nov 30'
          }
        </div>
      ) : (
        <div className="text-[10px] bg-primary/10 border border-primary/20 p-2.5 text-center text-primary/60 uppercase font-black tracking-widest rounded-lg">
          Off-Season — Next Season Jun 1
        </div>
      )}
    </div>
  );
};

export default StormSentry;
