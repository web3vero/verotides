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
    <div className="w-full bg-primary/10 border-y border-primary/30 h-8 flex items-center overflow-hidden font-mono text-[10px]">
      <div className="flex-shrink-0 bg-primary text-black px-3 h-full flex items-center font-black italic tracking-tighter shadow-[5px_0_10px_rgba(0,255,65,0.3)] z-10">
        VERO_INTELLIGENCE_CRAWL
      </div>
      
      <div className="flex-1 px-4 relative">
        <div key={activeIntel} className="animate-in slide-in-from-right-full duration-1000 flex items-center gap-4">
           <span className="text-yellow-400 font-black">[{intelligence[activeIntel].sector}]</span>
           <span className="text-white glow-text uppercase tracking-tight font-bold">{intelligence[activeIntel].intel}</span>
           <span className="text-primary/40 text-[8px]">[ID: {intelligence[activeIntel].id}]</span>
        </div>
      </div>

      <div className="flex-shrink-0 px-3 opacity-40 italic text-primary/80 hidden sm:flex items-center gap-2">
        <span className="h-1 w-1 bg-primary rounded-full animate-ping"></span>
        {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} // NODE_07_SYNC
      </div>
    </div>
  );
};

export default IntelCrawler;
