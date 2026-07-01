import React from 'react';
import Link from 'next/link';
import DashboardShell from '@/components/verotide/DashboardShell';
import { getAllGuides } from '@/lib/verotide/guides';

export default function Home() {
  const guides = getAllGuides();

  return (
    <main className="min-h-screen flex flex-col bg-black overflow-x-hidden">
      {/* Global Header */}
      <header className="px-4 pt-5 pb-5 md:px-8 md:pt-8 md:pb-7 w-full flex flex-col md:flex-row justify-between items-start md:items-end border-b-2 border-primary/30 gap-3 md:gap-6">
        <div className="flex items-center gap-4 min-w-0">
          <img 
            src="/globe.svg" 
            alt="Verotides Logo" 
            className="h-16 w-16 md:h-20 md:w-20 drop-shadow-[0_0_15px_rgba(0,255,65,0.6)] flex-shrink-0" 
          />
          <div className="min-w-0">
            <h1 className="text-4xl md:text-6xl font-black glow-text tracking-tighter italic leading-none truncate">
              VEROTIDES<span className="flicker">.COM</span>
            </h1>
            <p className="text-[10px] md:text-xs opacity-60 font-mono tracking-tight md:tracking-[0.18em] mt-2 uppercase truncate">
              Coastal Intelligence &amp; Utilities — Vero Beach, FL
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <Link 
            href="/guides"
            className="px-4 md:px-6 py-2 md:py-3 border-2 border-primary hover:bg-primary hover:text-black text-primary font-black uppercase text-xs md:text-sm tracking-wider md:tracking-widest whitespace-nowrap transition-colors duration-200"
          >
            RESEARCH_ARCHIVE →
          </Link>
          <div className="px-4 md:px-6 py-2 md:py-3 border-2 border-primary bg-primary text-black font-black uppercase text-xs md:text-sm shadow-[0_0_20px_rgba(0,255,65,0.4)] tracking-wider md:tracking-widest whitespace-nowrap">
            VERO_UTILITY_HUB
          </div>
          <div className="h-2.5 w-2.5 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(0,255,65,1)] flex-shrink-0"></div>
        </div>
      </header>

      <DashboardShell />

      {/* Crawlable SEO / Authority Content Section for AdSense and Search Engines */}
      <section className="max-w-7xl mx-auto w-full px-5 py-12 md:px-8 border-t border-primary/20 bg-black text-zinc-300 font-sans">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-6">
            <h2 className="text-2xl font-bold text-primary tracking-tight font-mono uppercase">
              Vero Beach &amp; Sebastian Inlet Coastal Intelligence &amp; Utilities
            </h2>
            <p className="text-base leading-relaxed">
              Verotides.com serves as a specialized coastal telemetry dashboard monitoring key environmental and maritime metrics for Vero Beach and Sebastian Inlet, Florida. By consolidating real-time data from the National Oceanic and Atmospheric Administration (NOAA), the National Weather Service (NWS), and local county utilities, we provide a unified command interface for local boaters, anglers, and coastal residents.
            </p>
            <p className="text-base leading-relaxed">
              Our live data streams include tide heights and predictions from Sebastian Inlet, computed solunar bite windows for recreational fishing, wind velocities and wave heights from the Melbourne NWS grid, and live AIS vessel positioning along the Indian River Lagoon and nearshore waters. We aim to support safe maritime navigation and enhance local outdoor recreation.
            </p>

            <h3 className="text-lg font-bold text-primary font-mono uppercase pt-6 border-t border-primary/10">
              Vero Beach &amp; Sebastian Inlet Research Library
            </h3>
            <p className="text-sm text-zinc-400 mb-6">
              Our Research Archive provides in-depth, locally verified guides detailing the ecology, angling opportunities, and maritime safety standards of the Treasure Coast.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {guides.slice(0, 4).map((guide) => (
                <div key={guide.slug} className="p-5 border border-primary/10 bg-zinc-950/40 rounded-lg flex flex-col justify-between hover:border-primary/30 transition-colors">
                  <div>
                    <span className="text-[9px] font-mono text-primary/70 uppercase tracking-widest block mb-2">
                      {guide.category} · {guide.date}
                    </span>
                    <h4 className="font-bold text-white text-base mb-2 hover:text-primary transition-colors">
                      <Link href={`/guides/${guide.slug}`}>{guide.title}</Link>
                    </h4>
                    <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                      {guide.description}
                    </p>
                  </div>
                  <Link 
                    href={`/guides/${guide.slug}`} 
                    className="text-xs text-primary font-mono hover:underline uppercase tracking-wide inline-flex items-center gap-1 mt-2"
                  >
                    Read Guide →
                  </Link>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6 lg:border-l lg:border-primary/10 lg:pl-8">
            <h3 className="text-lg font-bold text-primary font-mono uppercase">
              Operational Nodes
            </h3>
            <ul className="space-y-4 text-sm font-mono">
              <li className="border-b border-primary/5 pb-4 last:border-0 last:pb-0">
                <strong className="text-white text-xs block uppercase mb-1">NOAA Sebastian Inlet Node</strong>
                <p className="text-zinc-400 font-sans text-xs leading-relaxed">
                  Monitors tidal height changes and provides predictions for navigating the Sebastian Inlet channel safely.
                </p>
              </li>
              <li className="border-b border-primary/5 pb-4 last:border-0 last:pb-0">
                <strong className="text-white text-xs block uppercase mb-1">NWS Melbourne Meteorological Grid</strong>
                <p className="text-zinc-400 font-sans text-xs leading-relaxed">
                  Aggregates wind direction, wave period, wave height, and local temperature indexes for Vero Beach shorelines.
                </p>
              </li>
              <li className="border-b border-primary/5 pb-4 last:border-0 last:pb-0">
                <strong className="text-white text-xs block uppercase mb-1">Solunar Bite Time Algorithms</strong>
                <p className="text-zinc-400 font-sans text-xs leading-relaxed">
                  Computes major and minor feeding peaks based on lunar and solar gravitational transit calculations.
                </p>
              </li>
              <li>
                <strong className="text-white text-xs block uppercase mb-1">Indian River County Utilities</strong>
                <p className="text-zinc-400 font-sans text-xs leading-relaxed">
                  Provides structured, address-based schedules for local garbage, recycling, and vegetative waste removal.
                </p>
              </li>
            </ul>
          </div>
        </div>
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
