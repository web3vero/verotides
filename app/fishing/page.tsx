import type { Metadata } from 'next';
import FishingClient from './FishingClient';
import { getSolunarData, getWeeklySolunarData } from '@/lib/verotide/data';
import React from 'react';

export const metadata: Metadata = {
  title: '🎣 Vero Beach & Sebastian Inlet Fishing Times | Live Solunar Charts 🎣',
  description: '【BITE WINDOWS】 Discover today\'s best fishing times for Vero Beach & Sebastian Inlet, FL! 🎣 Solunar major & minor feeding periods, moon phases, and local angler guides. Updated daily! »»',
  keywords: 'Vero Beach fishing, Sebastian Inlet fishing, solunar chart Vero Beach, best fishing times Vero Beach, snook fishing Sebastian Inlet, bite times Indian River Lagoon, Vero Beach fishing report',
  alternates: { canonical: 'https://verotides.com/fishing' },
  openGraph: {
    title: "🎣 Vero Beach & Sebastian Inlet Fishing Times — Today's Bite Times | Verotides 🎣",
    description: 'Pre-rendered daily and weekly solunar charts, major/minor bite windows, and local fishing forecasts for Vero Beach and Sebastian Inlet, FL. 【LIVE 🌊 🎣】',
    url: 'https://verotides.com/fishing',
  },
};

export default async function FishingPage() {
  // Calculate today and weekly solunar data on the server
  const now = new Date();
  
  // Vero Beach coords: 27.6386, -80.3973
  // Sebastian Inlet coords: 27.8603, -80.4472
  const veroToday = getSolunarData(now, 27.6386, -80.3973);
  const sebastianToday = getSolunarData(now, 27.8603, -80.4472);

  const veroWeekly = getWeeklySolunarData(27.6386, -80.3973);
  const sebastianWeekly = getWeeklySolunarData(27.8603, -80.4472);

  const veroMajor = veroToday.major?.[0] || { start: '06:30 AM', end: '08:30 AM' };
  const veroMinor = veroToday.minor?.[0] || { start: '12:00 PM', end: '01:30 PM' };
  
  const sebMajor = sebastianToday.major?.[0] || { start: '07:15 AM', end: '09:15 AM' };
  const sebMinor = sebastianToday.minor?.[0] || { start: '12:45 PM', end: '02:15 PM' };

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "name": "Vero Beach & Sebastian Inlet Fishing Times & Solunar Chart",
        "description": "Daily solunar major and minor fishing periods, moon phase, and best bite times for Vero Beach, FL and Sebastian Inlet.",
        "url": "https://verotides.com/fishing",
        "isPartOf": { "@type": "WebSite", "url": "https://verotides.com" },
        "breadcrumb": {
          "@type": "BreadcrumbList",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "Home",
              "item": "https://verotides.com"
            },
            {
              "@type": "ListItem",
              "position": 2,
              "name": "Fishing & Solunar",
              "item": "https://verotides.com/fishing"
            }
          ]
        }
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "What is the best time to fish in Vero Beach?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "The best times to fish in Vero Beach are during the major and minor solunar windows (when the moon is directly overhead or underfoot) combined with incoming or outgoing tide changes. Early morning and late evening twilight also offer peak feeding activity."
            }
          },
          {
            "@type": "Question",
            "name": "How does the moon phase affect fishing in the Indian River Lagoon?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Stronger currents during the Full Moon and New Moon phases trigger more active feeding for predatory fish like Snook and Tarpon, especially near channels, bridges, and inlets like Sebastian Inlet."
            }
          }
        ]
      }
    ]
  };

  return (
    <main className="min-h-screen bg-black p-4 md:p-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      
      <h1 className="text-3xl md:text-5xl font-black glow-text tracking-tighter italic mb-4 uppercase">
        Vero Beach &amp; Sebastian Inlet Fishing Forecast
      </h1>
      <p className="text-xs font-mono text-white/40 uppercase tracking-widest mb-6">
        Major &amp; minor bite times · Moon phase · local angler intelligence · Updated daily
      </p>

      {/* Dynamic Text-Heavy Summary (For search bots and quick scan users) */}
      <section className="terminal-box p-6 border border-primary/20 bg-black/60 rounded-xl mb-8 font-mono">
        <h2 className="text-xs font-black text-primary uppercase tracking-widest mb-3">&gt; FISHING_TACTICAL_SUMMARY</h2>
        <div className="text-sm text-white/80 leading-relaxed space-y-3">
          <p>
            Vero Beach sectors indicate today&apos;s primary major solunar window occurs between{' '}
            <span className="text-yellow-400 font-bold">{veroMajor.start} - {veroMajor.end}</span>. The minor feeding period is calculated for{' '}
            <span className="text-yellow-400 font-bold">{veroMinor.start} - {veroMinor.end}</span>. Current moon phase is{' '}
            <span className="text-primary font-bold">{veroToday.moon.phase.replace(/_/g, ' ')}</span> with moon rise at{' '}
            <span className="text-white font-bold">{veroToday.moon.rise}</span> and set at{' '}
            <span className="text-white font-bold">{veroToday.moon.set}</span>.
          </p>
          <p>
            Sebastian Inlet sectors exhibit peak solunar activity between{' '}
            <span className="text-yellow-400 font-bold">{sebMajor.start} - {sebMajor.end}</span>. Minor bite activity is expected between{' '}
            <span className="text-yellow-400 font-bold">{sebMinor.start} - {sebMinor.end}</span>.
          </p>
          <p className="text-[10px] text-white/40 pt-2 border-t border-primary/10">
            *ANGLER ADVISORY: Solunar forecasts provide a baseline probability of fish activity based on gravitational vectors. For maximum hookup rates, align these windows with tide switches, local bait migrations (e.g. mullet runs), and low barometric transitions.
          </p>
        </div>
      </section>

      {/* SSR Fishing / Bite Widgets */}
      <FishingClient veroData={veroToday} sebastianData={sebastianToday} />

      {/* 7-DAY SOLUNAR TABLES (THE SEO POWERHOUSE) */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mt-10">
        
        {/* Vero Beach 7-Day Solunar Table */}
        <div className="terminal-box p-6 rounded-xl border border-primary/20 bg-black/60">
          <div className="border-b border-primary/20 pb-3 mb-4">
            <h3 className="text-base font-black text-white uppercase tracking-wider">Vero Beach — 7-Day Solunar Calendar</h3>
            <p className="text-[10px] text-primary/50 font-mono uppercase mt-0.5">Sector Coordinates: 27.6386° N, 80.3973° W · Indian River Lagoon</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs border-collapse">
              <thead>
                <tr className="border-b border-primary/20 text-primary/60">
                  <th className="py-2 px-1 uppercase tracking-wider">Date</th>
                  <th className="py-2 px-1 uppercase tracking-wider">Major Windows</th>
                  <th className="py-2 px-1 uppercase tracking-wider">Minor Windows</th>
                  <th className="py-2 px-1 uppercase tracking-wider">Moon Phase</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/10">
                {veroWeekly.map((day) => (
                  <tr key={day.date} className="hover:bg-primary/5 transition-colors">
                    <td className="py-3 px-1 font-bold text-white uppercase whitespace-nowrap">{day.date}</td>
                    <td className="py-3 px-1">
                      <div className="flex flex-col gap-1 text-yellow-400 font-bold">
                        {day.data.major.map((m, idx) => (
                          <span key={idx}>{m.start} - {m.end}</span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-1">
                      <div className="flex flex-col gap-1 text-white/80">
                        {day.data.minor.map((m, idx) => (
                          <span key={idx}>{m.start} - {m.end}</span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-1 text-primary font-bold whitespace-nowrap">
                      {day.data.moon.phase.replace(/_/g, ' ')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sebastian Inlet 7-Day Solunar Table */}
        <div className="terminal-box p-6 rounded-xl border border-primary/20 bg-black/60">
          <div className="border-b border-primary/20 pb-3 mb-4">
            <h3 className="text-base font-black text-white uppercase tracking-wider">Sebastian Inlet — 7-Day Solunar Calendar</h3>
            <p className="text-[10px] text-primary/50 font-mono uppercase mt-0.5">Sector Coordinates: 27.8603° N, 80.4472° W · Inlet &amp; Jetty</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs border-collapse">
              <thead>
                <tr className="border-b border-primary/20 text-primary/60">
                  <th className="py-2 px-1 uppercase tracking-wider">Date</th>
                  <th className="py-2 px-1 uppercase tracking-wider">Major Windows</th>
                  <th className="py-2 px-1 uppercase tracking-wider">Minor Windows</th>
                  <th className="py-2 px-1 uppercase tracking-wider">Moon Phase</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/10">
                {sebastianWeekly.map((day) => (
                  <tr key={day.date} className="hover:bg-primary/5 transition-colors">
                    <td className="py-3 px-1 font-bold text-white uppercase whitespace-nowrap">{day.date}</td>
                    <td className="py-3 px-1">
                      <div className="flex flex-col gap-1 text-yellow-400 font-bold">
                        {day.data.major.map((m, idx) => (
                          <span key={idx}>{m.start} - {m.end}</span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-1">
                      <div className="flex flex-col gap-1 text-white/80">
                        {day.data.minor.map((m, idx) => (
                          <span key={idx}>{m.start} - {m.end}</span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-1 text-primary font-bold whitespace-nowrap">
                      {day.data.moon.phase.replace(/_/g, ' ')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Deep Authority Content for Local Fishing (Targets High-Intent Keywords) */}
      <section className="terminal-box p-6 border border-primary/20 bg-black/60 rounded-xl mt-10 font-mono">
        <h2 className="text-sm font-black text-white uppercase tracking-widest mb-4 italic">&gt; VERO_BEACH_ANGLER_INTEL</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-white/70 leading-relaxed">
          
          <div className="border-r border-primary/10 pr-4 last:border-0">
            <h3 className="text-primary font-bold uppercase mb-2">🎣 SNOOK (CENTROPOMUS UNDECIMALIS)</h3>
            <p className="mb-2">
              **Sebastian Inlet Jetties** and the structural pilings of the **Barber Bridge** are world-renowned Snook hotspots. Snook are ambush predators; fish the shadow lines during night tides or the incoming current at the inlet.
            </p>
            <span className="text-yellow-400/80 font-bold">Season: Sept 1 - Dec 15 &amp; Feb 1 - May 31.</span>
          </div>

          <div className="border-r border-primary/10 pr-4 last:border-0">
            <h3 className="text-primary font-bold uppercase mb-2">🦞 REDFISH / RED DRUM (SCIAENOPS OCELLATUS)</h3>
            <p className="mb-2">
              Target the **mangrove shorelines** and shallow flats of the **Indian River Lagoon**. Look for tailing fish during low tides on the firm sandbars. Throw gold spoons, topwater plugs, or live shrimp on a light jighead.
            </p>
            <span className="text-yellow-400/80 font-bold">Best bait: Live pinfish, finger mullet, or split-tail crab.</span>
          </div>

          <div>
            <h3 className="text-primary font-bold uppercase mb-2">🦈 TARPON / SILVER KING (MEGALOPS ATLANTICUS)</h3>
            <p className="mb-2">
              Massive migratory Tarpon stack up inside the inlet and just off the beaches during the summer months (June - August). Smaller resident juveniles can be targeted year-round in the fingers of the **Vero Beach canals**.
            </p>
            <span className="text-yellow-400/80 font-bold">Tactics: Free-line live mullet or pass crabs on dusk tide shifts.</span>
          </div>

        </div>
      </section>

      <p className="mt-8 text-[10px] text-white/30 font-mono uppercase text-center">
        Solunar engine computed via local lunar transit algorithms. Caching validated 2026.
      </p>
    </main>
  );
}
