'use client';

import React from 'react';
import VeroDashboard from '@/components/verotide/VeroDashboard';
import IntelCrawler from '@/components/verotide/IntelCrawler';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col bg-black overflow-x-hidden">
      {/* Global Header */}
      <header className="px-4 pt-5 pb-5 md:px-8 md:pt-8 md:pb-7 w-full flex flex-col md:flex-row justify-between items-start md:items-end border-b-2 border-primary/30 gap-3 md:gap-6">
        <div className="min-w-0">
          <h1 className="text-4xl md:text-6xl font-black glow-text tracking-tighter italic leading-none truncate">
            VEROTIDES<span className="flicker">.COM</span>
          </h1>
          <p className="text-[10px] md:text-xs opacity-60 font-mono tracking-tight md:tracking-[0.18em] mt-2 uppercase truncate">
            Coastal Intelligence &amp; Utilities — Vero Beach, FL
          </p>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="px-4 md:px-6 py-2 md:py-3 border-2 border-primary bg-primary text-black font-black uppercase text-xs md:text-sm shadow-[0_0_20px_rgba(0,255,65,0.4)] tracking-wider md:tracking-widest whitespace-nowrap">
            VERO_UTILITY_HUB
          </div>
          <div className="h-2.5 w-2.5 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(0,255,65,1)] flex-shrink-0"></div>
        </div>
      </header>

      {/* Intelligence Crawler */}
      <IntelCrawler />

      {/* Dashboard */}
      <section className="flex-1 overflow-x-hidden">
        <VeroDashboard />
      </section>

      {/* Footer */}
      <footer className="px-5 py-4 border-t border-border/20 flex flex-col sm:flex-row justify-between text-[10px] md:text-xs opacity-40 font-mono gap-2 w-full bg-black/50">
        <div className="flex gap-4 flex-wrap">
          <span title="Vero Beach South Node">LAT: 27.6386° N</span>
          <span title="Vero Beach South Node">LONG: 80.3973° W</span>
          <span className="text-primary/80 font-black">NODE: VERO_BEACH_SOUTH</span>
        </div>
        <div className="flex gap-4 uppercase flex-wrap">
          <span>Connection: Encrypted_GCM</span>
          <span className="text-primary font-bold">Status: Operational</span>
          <span>© 2026 Verotides</span>
        </div>
      </footer>
    </main>
  );
}
