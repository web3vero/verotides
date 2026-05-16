'use client';

import React, { useState, useEffect } from 'react';
import intelligence from '@/data/verotide/node_intelligence.json';

const IntelCrawler = () => {
  const [activeIntel, setActiveIntel] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIntel(prev => (prev + 1) % intelligence.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full bg-primary/10 border-y border-primary/30 h-10 md:h-8 flex items-center overflow-hidden font-mono text-[10px]">
      <div className="flex-shrink-0 bg-primary text-black px-2 md:px-3 h-full flex items-center font-black italic tracking-tighter shadow-[5px_0_10px_rgba(0,255,65,0.3)] z-10 text-[9px] md:text-[10px]">
        VERO_INTEL
      </div>
      
      <div className="flex-1 px-2 md:px-4 relative overflow-hidden">
        <div key={activeIntel} className="animate-in slide-in-from-right-full duration-1000 flex items-center gap-2 md:gap-4 whitespace-nowrap">
           <span className="text-yellow-400 font-black flex-shrink-0">[{intelligence[activeIntel].sector}]</span>
           <span className="text-white glow-text uppercase tracking-tight font-bold truncate">
             {intelligence[activeIntel].intel}
           </span>
        </div>
      </div>

      <div className="flex-shrink-0 px-2 md:px-3 opacity-40 italic text-primary/80 hidden xs:flex items-center gap-1 md:gap-2 border-l border-primary/20 h-full">
        <span className="h-1 w-1 bg-primary rounded-full animate-ping"></span>
        <span className="text-[8px] md:text-[9px]">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
      </div>
    </div>
  );
};

export default IntelCrawler;
