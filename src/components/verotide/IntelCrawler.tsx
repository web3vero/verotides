'use client';

import React, { useState, useEffect } from 'react';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

const IntelCrawler = () => {
  // Simulating high-fidelity local intelligence feeds
  const [activeIntel, setActiveIntel] = useState(0);
  
  const INTEL_FEEDS = [
    { source: 'IRC_NEWS', intel: 'COASTAL ENGINEERING COMPLETED AT WABASSO SECTOR 3.' },
    { source: 'VERO_POLICE', intel: 'TRAFFIC FLOW STABILIZED ON SR_60 BARBER BRIDGE.' },
    { source: 'FWC_WATCH', intel: 'NO RED TIDE OBSERVED IN INDIAN RIVER LAGOON NODE.' },
    { source: 'LOCAL_INTEL', intel: 'SUNDAY FARMERS MARKET ACTIVE AT OCEAN DRIVE [32963].' },
    { source: 'WEATHER_OPS', intel: 'HIGH UV INDEX DETECTED. GLARE REDUCTION OPTICS RECOMMENDED.' },
    { source: 'MARITIME_OPS', intel: 'DEEP WATER DREDGING OPERATIONS COMMENCING NEAR INLET.' },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIntel(prev => (prev + 1) % INTEL_FEEDS.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full bg-primary/10 border-y border-primary/30 h-8 flex items-center overflow-hidden font-mono text-[10px]">
      <div className="flex-shrink-0 bg-primary text-black px-3 h-full flex items-center font-black italic tracking-tighter">
        VERO_INTELLIGENCE_CRAWL
      </div>
      
      <div className="flex-1 px-4 relative">
        <div key={activeIntel} className="animate-in slide-in-from-right-full duration-1000 flex items-center gap-4">
           <span className="text-primary font-bold">[{INTEL_FEEDS[activeIntel].source}]</span>
           <span className="text-white glow-text uppercase tracking-tight">{INTEL_FEEDS[activeIntel].intel}</span>
        </div>
      </div>

      <div className="flex-shrink-0 px-3 opacity-40 italic">
        {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} // 32964_SYNC
      </div>
    </div>
  );
};

export default IntelCrawler;
