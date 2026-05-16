'use client';

import React from 'react';
import intelligence from '@/data/verotide/node_intelligence.json';

const IntelCrawler = () => {
  // Triple the items to ensure the loop is seamless across ultra-wide displays
  const doubledIntel = [...intelligence, ...intelligence, ...intelligence];

  return (
    <div className="w-full bg-primary/10 border-y border-primary/30 h-12 md:h-10 flex items-center overflow-hidden font-mono">
      <div className="flex-shrink-0 bg-primary text-black px-4 md:px-6 h-full flex items-center font-black italic tracking-tighter shadow-[10px_0_20px_rgba(0,255,65,0.4)] z-20 text-xs md:text-sm">
        VERO_INTELLIGENCE_CRAWL
      </div>
      
      <div className="flex-1 relative overflow-hidden z-10 h-full flex items-center">
        <div className="animate-marquee whitespace-nowrap py-2">
          {doubledIntel.map((item, idx) => (
            <div key={`${item.id}-${idx}`} className="inline-flex items-center gap-4 px-8 border-r border-primary/20 group cursor-default">
               <span className="text-yellow-400 font-black text-xs md:text-sm tracking-widest group-hover:text-white transition-colors">
                 [{item.sector}]
               </span>
               <span className="text-white glow-text uppercase tracking-tight font-bold text-xs md:text-base">
                 {item.intel}
               </span>
               <span className="text-primary/40 text-[9px] md:text-[10px] font-mono group-hover:text-primary/80 transition-colors">
                 // NODE_SYNC_{item.id}
               </span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-shrink-0 px-4 md:px-6 opacity-60 italic text-primary/90 hidden lg:flex items-center gap-3 border-l border-primary/20 h-full bg-black/40 z-20 font-black text-xs tracking-tighter">
        <span className="h-2 w-2 bg-primary rounded-full animate-ping"></span>
        <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} // 32964_STREAM</span>
      </div>
    </div>
  );
};

export default IntelCrawler;
