'use client';

import React from 'react';
import intelligence from '@/data/verotide/node_intelligence.json';

const IntelCrawler = () => {
  const tripled = [...intelligence, ...intelligence, ...intelligence];

  return (
    <div className="w-full bg-primary/10 border-y border-primary/30 overflow-hidden font-mono">
      {/* Label pill */}
      <div className="flex h-auto">
        <div className="flex-shrink-0 bg-primary text-black px-4 md:px-6 flex items-center font-black italic tracking-tighter shadow-[10px_0_20px_rgba(0,255,65,0.4)] z-20 text-[10px] md:text-sm self-stretch">
          <span className="hidden md:block">VERO_INTELLIGENCE_CRAWL</span>
          <span className="block md:hidden leading-tight text-center">VERO<br/>INTEL</span>
        </div>

        {/* Scrolling strip */}
        <div className="flex-1 relative overflow-hidden">
          <div className="animate-marquee whitespace-nowrap">
            {tripled.map((item, idx) => (
              <div
                key={`${item.id}-${idx}`}
                className="inline-flex flex-col md:flex-row md:items-center gap-0.5 md:gap-4 px-5 md:px-8 py-2.5 md:py-2 border-r border-primary/20 cursor-default group"
              >
                <span className="text-yellow-400 font-black text-[10px] md:text-sm tracking-widest group-hover:text-white transition-colors whitespace-nowrap">
                  [{item.sector}]
                </span>
                <span className="text-white glow-text uppercase font-bold text-xs md:text-sm whitespace-nowrap max-w-[220px] md:max-w-none truncate md:truncate-none">
                  {item.intel}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Live timestamp — desktop only */}
        <div className="flex-shrink-0 px-5 hidden lg:flex items-center gap-3 border-l border-primary/20 bg-black/40 z-20 font-black text-[10px] text-primary/70 tracking-tighter italic self-stretch">
          <span className="h-2 w-2 bg-primary rounded-full animate-ping flex-shrink-0"></span>
          <span className="whitespace-nowrap">32964_STREAM</span>
        </div>
      </div>
    </div>
  );
};

export default IntelCrawler;
