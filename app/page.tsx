'use client';

import React, { useState } from 'react';
import VeroDashboard from '@/components/verotide/VeroDashboard';
import SearchEngine from '@/components/twaai/SearchEngine';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'hub' | 'search'>('hub');

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto flex flex-col gap-8">
      {/* Global Header */}
      <header className="flex flex-col md:flex-row justify-between items-end border-b-2 border-primary/30 pb-4 gap-4">
        <div>
          <h1 className="text-4xl font-black glow-text tracking-tighter italic">
            VEROTIDES<span className="flicker">.COM</span>
          </h1>
          <div className="text-[10px] opacity-60 font-mono tracking-widest mt-1">
            CORE_COMMAND_INTERFACE // MAD_LAB_LOGIC_V2.0
          </div>
        </div>
        
        <nav className="flex gap-2 font-mono">
          <button 
            onClick={() => setActiveTab('hub')}
            className={`px-4 py-2 border border-primary transition-all text-xs ${activeTab === 'hub' ? 'bg-primary text-black font-bold' : 'hover:bg-primary/20 text-primary'}`}
          >
            [ VERO_UTILITY_HUB ]
          </button>
          <button 
            onClick={() => setActiveTab('search')}
            className={`px-4 py-2 border border-primary transition-all text-xs ${activeTab === 'search' ? 'bg-primary text-black font-bold' : 'hover:bg-primary/20 text-primary'}`}
          >
            [ TWAAI_SEARCH_ENGINE ]
          </button>
        </nav>
      </header>

      {/* Main Content Area */}
      <section className="flex-1">
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
      <footer className="border-t border-border/20 pt-4 flex flex-col md:flex-row justify-between text-[10px] opacity-40 font-mono gap-2">
        <div className="flex gap-4">
          <span>LAT: 27.6386° N</span>
          <span>LONG: 80.3973° W</span>
          <span>NODE: PARROT_OS_WKH</span>
        </div>
        <div className="flex gap-4">
          <span>CONNECTION: ENCRYPTED_GCM</span>
          <span>UPTIME: 99.998%</span>
          <span>© 2026 VEROTIDES_STRATEGIC</span>
        </div>
      </footer>
    </main>
  );
}
