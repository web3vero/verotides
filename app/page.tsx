'use client';

import React, { useState, useEffect } from 'react';
import VeroDashboard from '@/components/verotide/VeroDashboard';
import IntelCrawler from '@/components/verotide/IntelCrawler';

export default function Home() {
  return (
    <main className="min-h-screen p-0 md:p-0 flex flex-col bg-black">
      {/* Global Header - Edge-to-Edge */}
      <header className="p-4 md:p-8 w-full flex flex-col md:flex-row justify-between items-end border-b-2 border-primary/30 pb-6 gap-4">
        <div>
          <h1 className="text-5xl md:text-6xl font-black glow-text tracking-tighter italic leading-none">
            VEROTIDES<span className="flicker">.COM</span>
          </h1>
          <div className="text-xs md:text-sm opacity-60 font-mono tracking-[0.2em] mt-2 uppercase">
            CORE_COMMAND_INTERFACE // 32964_STRATEGY_ACTV
          </div>
        </div>
        
        <div className="flex gap-4 font-mono items-center">
          <div className="px-6 py-3 border-2 border-primary bg-primary text-black font-black uppercase text-sm shadow-[0_0_20px_rgba(0,255,65,0.5)] tracking-widest">
            [ VERO_UTILITY_HUB ]
          </div>
          <div className="h-3 w-3 rounded-full bg-primary animate-pulse ml-2 shadow-[0_0_10px_rgba(0,255,65,1)]"></div>
        </div>
      </header>

      {/* Intelligence Crawler - Full Screen Spacing */}
      <div className="w-full">
        <IntelCrawler />
      </div>

      {/* Main Content Area - 100% Space Usage */}
      <section className="flex-1 p-4 md:p-8 w-full overflow-x-hidden">
        <div className="animate-in fade-in duration-1000">
          <VeroDashboard />
        </div>
      </section>

      {/* Footer System Status - Edge-to-Edge */}
      <footer className="p-6 border-t border-border/20 flex flex-col md:flex-row justify-between text-xs md:text-sm opacity-40 font-mono gap-4 w-full bg-black/50">
        <div className="flex gap-6 flex-wrap">
          <span className="hover:opacity-100 transition-opacity cursor-help" title="Center Point: Vero Beach South Node">LAT: 27.6386° N</span>
          <span className="hover:opacity-100 transition-opacity cursor-help" title="Center Point: Vero Beach South Node">LONG: 80.3973° W</span>
          <span className="text-primary/60 font-black">NODE: VERO_BEACH_SOUTH</span>
        </div>
        <div className="flex gap-6 uppercase flex-wrap">
          <span className="hover:text-primary transition-colors cursor-help" title="GCM-256 AES Internal Stream">Connection: Encrypted_GCM</span>
          <span className="text-primary font-bold">Status: Operational</span>
          <span>© 2026 Verotides_Strategic</span>
        </div>
      </footer>
    </main>
  );
}
