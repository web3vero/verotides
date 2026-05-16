'use client';

import React, { useState, useEffect } from 'react';
import VeroDashboard from '@/components/verotide/VeroDashboard';
import SearchEngine from '@/components/twaai/SearchEngine';
import IntelCrawler from '@/components/verotide/IntelCrawler';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'hub' | 'search'>('hub');

  return (
    <main className="min-h-screen p-0 md:p-0 flex flex-col">
      {/* Global Header */}
      <header className="p-4 md:p-8 max-w-7xl mx-auto w-full flex flex-col md:flex-row justify-between items-end border-b-2 border-primary/30 pb-4 gap-4">
        <div>
          <h1 className="text-4xl font-black glow-text tracking-tighter italic">
            VEROTIDES<span className="flicker">.COM</span>
          </h1>
          <div className="text-[10px] opacity-60 font-mono tracking-widest mt-1 uppercase">
            CORE_COMMAND_INTERFACE // 32964_STRATEGY_ACTV
          </div>
        </div>
        
        <nav className="flex gap-2 font-mono">
          <button 
            onClick={() => setActiveTab('hub')}
            className={`px-4 py-2 border-2 transition-all text-xs font-black uppercase ${activeTab === 'hub' ? 'bg-primary text-black border-primary shadow-[0_0_15px_rgba(0,255,65,0.4)]' : 'border-primary/20 hover:bg-primary/10 text-primary/60'}`}
          >
            [ Vero_Hub ]
          </button>
          <button 
            onClick={() => setActiveTab('search')}
            className={`px-4 py-2 border-2 transition-all text-xs font-black uppercase ${activeTab === 'search' ? 'bg-primary text-black border-primary shadow-[0_0_15px_rgba(0,255,65,0.4)]' : 'border-primary/20 hover:bg-primary/10 text-primary/60'}`}
          >
            [ TWAAI_Engine ]
          </button>
        </nav>
      </header>

      {/* Intelligence Crawler Integration */}
      <div className="w-full">
        <IntelCrawler />
      </div>

      {/* Main Content Area */}
      <section className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
        {activeTab === 'hub' ? (
          <div className="animate-in fade-in duration-500">
            <VeroDashboard />
          </div>
        ) : (
          <div className="animate-in slide-in-from-bottom-4 duration-500">
            <SearchEngine />
          </div>
        ) }
      </section>

      {/* Footer System Status */}
      <footer className="p-4 border-t border-border/20 flex flex-col md:flex-row justify-between text-[10px] opacity-40 font-mono gap-2 max-w-7xl mx-auto w-full">
        <div className="flex gap-4">
          <span>LAT: 27.6386° N</span>
          <span>LONG: 80.3973° W</span>
          <span>NODE: VERO_BEACH_SOUTH</span>
        </div>
        <div className="flex gap-4 uppercase">
          <span>Connection: Encrypted_GCM</span>
          <span>Status: Operational</span>
          <span>© 2026 Verotides_Strategic</span>
        </div>
      </footer>
    </main>
  );
}
