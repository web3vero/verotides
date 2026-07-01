import React from 'react';
import Link from 'next/link';
import { getAllGuides } from '@/lib/verotide/guides';

export const metadata = {
  title: "🌊 Verotides Coastal Guides | Vero Beach & Sebastian Inlet Info 🎣",
  description: "Access our rich library of Vero Beach coastal guides. Detailed articles on Spoil Island camping, Sebastian Inlet snook fishing, drawbridge schedules, reef GPS coordinates, and boating safety. 【LOCAL GUIDES】",
};

export default function GuidesPage() {
  const guides = getAllGuides();

  return (
    <main className="min-h-screen flex flex-col bg-black overflow-x-hidden">
      {/* Global Header */}
      <header className="px-4 pt-5 pb-5 md:px-8 md:pt-8 md:pb-7 w-full flex flex-col md:flex-row justify-between items-start md:items-end border-b-2 border-primary/30 gap-3 md:gap-6">
        <div className="flex items-center gap-4 min-w-0">
          <Link href="/" className="flex items-center gap-4 min-w-0 hover:opacity-95 transition-opacity">
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
          </Link>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="px-4 md:px-6 py-2 md:py-3 border-2 border-primary bg-primary text-black font-black uppercase text-xs md:text-sm shadow-[0_0_20px_rgba(0,255,65,0.4)] tracking-wider md:tracking-widest whitespace-nowrap">
            RESEARCH_ARCHIVE
          </div>
          <div className="h-2.5 w-2.5 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(0,255,65,1)] flex-shrink-0"></div>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 w-full max-w-7xl mx-auto px-4 py-8 md:px-8">
        {/* Navigation Breadcrumb / Return Link */}
        <div className="mb-8">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 font-mono text-xs md:text-sm text-primary hover:text-emerald-300 transition-colors uppercase"
          >
            <span>&lt;--</span> Return to Central Command Dashboard
          </Link>
        </div>

        {/* Section Heading */}
        <div className="terminal-box p-6 border-primary/20 rounded-xl mb-10 bg-black/40">
          <div className="border-b border-primary/10 pb-4 mb-4">
            <span className="text-[10px] md:text-xs font-mono text-primary/70 uppercase tracking-widest">
              DATABASE NODE: /PUBLIC/RESEARCH_ARCHIVE/
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-primary glow-text tracking-tight uppercase font-mono">
            Coastal Utilities &amp; Angler Guides
          </h2>
          <p className="mt-2 text-zinc-300 font-sans text-base leading-relaxed max-w-3xl">
            Welcome to the Verotides Coastal Guides repository. This archive contains comprehensive, locally researched articles
            designed for Vero Beach boaters, anglers, and coastal residents. Check out detailed drawbridge schedules, reef GPS coordinates,
            local conservation protocols, and tactics for Sebastian Inlet snook.
          </p>
        </div>

        {/* Guides Grid */}
        {guides.length === 0 ? (
          <div className="terminal-box p-12 text-center border-yellow-500/20 text-yellow-500/80 font-mono rounded-xl">
            <span className="block text-2xl mb-2">⚠️</span>
            NO ARCHIVE RECORDS FOUND. SYSTEM SYNCHRONIZATION PENDING...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {guides.map((guide) => (
              <article 
                key={guide.slug}
                className="terminal-box flex flex-col justify-between border-primary/15 hover:border-primary/45 rounded-xl bg-card transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,255,65,0.08)] hover:-translate-y-0.5 group overflow-hidden"
              >
                {guide.image && (
                  <div className="w-full h-44 relative overflow-hidden bg-zinc-950 border-b border-primary/10">
                    <img 
                      src={guide.image} 
                      alt={guide.title} 
                      className="w-full h-full object-cover filter brightness-[0.85] contrast-[1.05] grayscale-[10%] group-hover:scale-103 transition-transform duration-300"
                    />
                    {/* CRT Scanline overlay */}
                    <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.15)_50%)] bg-[length:100%_4px] opacity-25 mix-blend-overlay z-10" />
                  </div>
                )}
                <div className="p-6">
                  {/* Category & Date */}
                  <div className="flex justify-between items-center border-b border-primary/10 pb-3 mb-4">
                    <span className="text-[10px] font-mono text-primary/80 font-bold uppercase tracking-widest">
                      {guide.category}
                    </span>
                    <span className="text-[10px] font-mono opacity-50">
                      {guide.date}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold font-sans text-zinc-100 group-hover:text-primary transition-colors leading-snug mb-3">
                    {guide.title}
                  </h3>

                  {/* Description */}
                  <p className="text-zinc-400 font-sans text-sm leading-relaxed line-clamp-3 mb-4">
                    {guide.description}
                  </p>
                </div>

                <div className="px-6 pb-6 pt-0 mt-auto">
                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {guide.tags.map((tag) => (
                      <span 
                        key={tag}
                        className="text-[9px] font-mono px-2 py-0.5 border border-primary/10 bg-primary/5 text-primary/75 rounded"
                      >
                        #{tag.toLowerCase().replace(/\s+/g, '')}
                      </span>
                    ))}
                  </div>

                  {/* Read Link */}
                  <Link 
                    href={`/guides/${guide.slug}`}
                    className="block text-center w-full py-2.5 px-4 border border-primary/20 bg-primary/5 text-primary font-mono text-xs font-bold uppercase rounded-lg group-hover:bg-primary group-hover:text-black group-hover:border-primary transition-all duration-200"
                  >
                    Read Archive Entry --&gt;
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="px-5 py-4 border-t border-border/20 flex flex-col sm:flex-row justify-between text-[10px] md:text-xs opacity-40 font-mono gap-2 w-full bg-black/50">
        <div className="flex gap-4 flex-wrap">
          <span>LAT: 27.6386° N</span>
          <span>LONG: 80.3973° W</span>
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
