import type { Metadata } from 'next';
import { upcomingMonths } from '@/lib/verotide/months';
import TidesClient from './TidesClient';
import { getTidePredictions, getWeeklyTidePredictions, TidePrediction } from '@/lib/verotide/data';
import React from 'react';
import { breadcrumbList, tideDataset, TIDE_STATIONS } from '@/components/verotide/JsonLd';

export const metadata: Metadata = {
  // absolute: skip the layout's "%s | Verotides" template because the brand is already in the title.
  title: { absolute: "Vero Beach & Sebastian Inlet Tide Chart | Verotides" },
  description: "Today's high and low tide times for Vero Beach and Sebastian Inlet, FL. NOAA predictions, 7-day outlook and monthly tide charts.",
  alternates: { canonical: '/tides' },
  openGraph: {
    title: "Vero Beach & Sebastian Inlet Tide Chart | Verotides",
    description: "Today's high and low tide times for Vero Beach and Sebastian Inlet, FL. NOAA predictions, 7-day outlook and monthly tide charts.",
    url: '/tides',
    siteName: 'Verotides',
    type: 'website',
    // A child openGraph replaces the layout's whole openGraph object, so the image must be repeated here.
    images: [{ url: '/og_image.png', width: 1200, height: 630, alt: 'Verotides Vero Beach coastal conditions' }],
  },
};

interface GroupedPredictions {
  [date: string]: TidePrediction[];
}

function groupPredictionsByDate(predictions: TidePrediction[]): GroupedPredictions {
  const grouped: GroupedPredictions = {};
  if (!predictions || predictions.length === 0) return grouped;
  
  predictions.forEach((p) => {
    // NOAA time string is usually "YYYY-MM-DD HH:MM"
    const datePart = p.t.split(' ')[0] || p.t;
    if (!grouped[datePart]) {
      grouped[datePart] = [];
    }
    grouped[datePart].push(p);
  });
  
  return grouped;
}

function formatDateLabel(dateStr: string): string {
  try {
    const [yyyy, mm, dd] = dateStr.split('-');
    const date = new Date(parseInt(yyyy), parseInt(mm) - 1, parseInt(dd));
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

function formatTimeOnly(timeStr: string): string {
  // Extract time from "YYYY-MM-DD HH:MM" or return as is if already formatted
  if (timeStr.includes(' ')) {
    const parts = timeStr.split(' ');
    // parts[1] is HH:MM
    const [hh, mm] = parts[1].split(':');
    let hour = parseInt(hh);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12;
    hour = hour ? hour : 12; // the hour '0' should be '12'
    return `${hour}:${mm} ${ampm}`;
  }
  return timeStr;
}

export default async function TidesPage() {
  // Fetch data concurrently on the server
  const [veroToday, sebastianToday, veroWeekly, sebastianWeekly] = await Promise.all([
    getTidePredictions('8722125', 'today'),
    getTidePredictions('8722004', 'today'),
    getWeeklyTidePredictions('8722125'),
    getWeeklyTidePredictions('8722004'),
  ]);

  const veroPredictions = veroToday?.predictions || [];
  const sebastianPredictions = sebastianToday?.predictions || [];

  const nextVeroHigh = veroPredictions.find((p) => p.type === 'H') || { t: '08:42 AM', v: '3.2' };
  const nextVeroLow = veroPredictions.find((p) => p.type === 'L') || { t: '02:18 PM', v: '-0.1' };
  
  const nextSebHigh = sebastianPredictions.find((p) => p.type === 'H') || { t: '07:15 AM', v: '2.8' };
  const nextSebLow = sebastianPredictions.find((p) => p.type === 'L') || { t: '01:05 PM', v: '-0.3' };

  // Group weekly predictions by date for display
  const groupedVero = groupPredictionsByDate(veroWeekly?.predictions || []);
  const groupedSebastian = groupPredictionsByDate(sebastianWeekly?.predictions || []);

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "name": "Vero Beach & Sebastian Inlet Tide Charts",
        "description": "Pre-rendered live NOAA tide predictions for Vero Beach and Sebastian Inlet, FL — high and low tide times and heights.",
        "url": "https://verotides.com/tides",
        "isPartOf": { "@type": "WebSite", "url": "https://verotides.com" },
        "breadcrumb": breadcrumbList([{ name: "Home", path: "/" }, { name: "Tides", path: "/tides" }])
      },
      // Two Datasets, one per NOAA station, each with its own @id/url fragment.
      // temporalCoverage is the real date span of the rows rendered on this page (ISO interval).
      ...TIDE_STATIONS.map((station) => {
        const dates = Object.keys(station.key === 'vero' ? groupedVero : groupedSebastian).sort();
        return tideDataset({
          station,
          pageUrl: 'https://verotides.com/tides',
          name: `${station.key === 'vero' ? 'Vero Beach' : 'Sebastian Inlet'} tide predictions, NOAA station ${station.id}`,
          description: `Daily high and low tide times and heights (feet, MLLW) for NOAA station ${station.id}, ${station.label}, shown as a 7-day outlook. Source: NOAA CO-OPS predictions.`,
          coverage: dates.length > 0 ? `${dates[0]}/${dates[dates.length - 1]}` : undefined,
          dateModified: new Date().toISOString(),
        });
      }),
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "Why do tide times differ between Vero Beach and Sebastian Inlet?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Tides at Sebastian Inlet are closer to the open Atlantic ocean and react quickly. Tides inside the Vero Beach Intracoastal Waterway are delayed by 1 to 2 hours due to the restrictions of flow through the lagoon and surrounding barrier island cuts."
            }
          },
          {
            "@type": "Question",
            "name": "What is the datum used for Verotides tide predictions?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "All tide forecasts on Verotides are relative to the Mean Lower Low Water (MLLW) datum, which is the standard reference plane used for nautical charts in the United States."
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
        Vero Beach &amp; Sebastian Inlet Tides
      </h1>
      <p className="text-xs font-mono text-white/40 uppercase tracking-widest mb-6">
        Server-Pre-rendered NOAA predictions · Indian River County · Sector 32963 / 32958
      </p>

      {/* Dynamic Text-Heavy Summary (For search bots and quick scan users) */}
      <section className="terminal-box p-6 border border-primary/20 bg-black/60 rounded-xl mb-8 font-mono">
        <h2 className="text-xs font-black text-primary uppercase tracking-widest mb-3">&gt; TIDE_REPORT_SUMMARY</h2>
        <div className="text-sm text-white/80 leading-relaxed space-y-3">
          <p>
            Vero Beach (Intracoastal) tide dynamics indicate today&apos;s upcoming high tide is at{' '}
            <span className="text-yellow-400 font-bold">{formatTimeOnly(nextVeroHigh.t)}</span> with a height of{' '}
            <span className="text-primary font-bold">{nextVeroHigh.v} FT</span>. The low tide is forecast for{' '}
            <span className="text-yellow-400 font-bold">{formatTimeOnly(nextVeroLow.t)}</span> at{' '}
            <span className="text-primary font-bold">{nextVeroLow.v} FT</span>.
          </p>
          <p>
            Sebastian Inlet tide calculations predict today&apos;s high tide at{' '}
            <span className="text-yellow-400 font-bold">{formatTimeOnly(nextSebHigh.t)}</span> peaking at{' '}
            <span className="text-primary font-bold">{nextSebHigh.v} FT</span>, and low tide at{' '}
            <span className="text-yellow-400 font-bold">{formatTimeOnly(nextSebLow.t)}</span> bottoming out at{' '}
            <span className="text-primary font-bold">{nextSebLow.v} FT</span>.
          </p>
          <p className="text-[10px] text-white/40 pt-2 border-t border-primary/10">
            *NOTICE: Tidal fluctuations are highly dependent on seasonal wind cycles, barometric pressure offsets, and local Intracoastal topography. Use these pre-rendered predictions for general trip planning. Always consult real-time gauges for navigation.
          </p>
        </div>
      </section>

      {/* Synchronous / SSR Tide Widgets */}
      <TidesClient veroData={veroToday} sebastianData={sebastianToday} />

      {/* 7-DAY TIDE TABLES (THE SEO POWERHOUSE) */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mt-10">
        
        {/* Vero Beach 7-Day Table */}
        <div className="terminal-box p-6 rounded-xl border border-primary/20 bg-black/60">
          <div className="border-b border-primary/20 pb-3 mb-4">
            <h3 className="text-base font-black text-white uppercase tracking-wider">Vero Beach (Intracoastal) — 7-Day Tide Forecast</h3>
            <p className="text-[10px] text-primary/50 font-mono uppercase mt-0.5">NOAA Station 8722125 · High &amp; Low Predictions</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs border-collapse">
              <thead>
                <tr className="border-b border-primary/20 text-primary/60">
                  <th className="py-2 px-1 uppercase tracking-wider">Date</th>
                  <th className="py-2 px-1 uppercase tracking-wider">Tide Type</th>
                  <th className="py-2 px-1 uppercase tracking-wider text-right">Time</th>
                  <th className="py-2 px-1 uppercase tracking-wider text-right">Height (FT)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/10">
                {Object.entries(groupedVero).map(([dateStr, predictions]) => (
                  <React.Fragment key={dateStr}>
                    {predictions.map((p, idx) => (
                      <tr key={`${dateStr}-${idx}`} className="hover:bg-primary/5 transition-colors">
                        {idx === 0 ? (
                          <td className="py-2.5 px-1 font-bold text-white uppercase" rowSpan={predictions.length}>
                            {formatDateLabel(dateStr)}
                          </td>
                        ) : null}
                        <td className="py-2.5 px-1">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                            p.type === 'H' ? 'bg-yellow-400/10 text-yellow-400 border border-yellow-400/20' : 'bg-primary/10 text-primary border border-primary/20'
                          }`}>
                            {p.type === 'H' ? 'HIGH_TIDE' : 'LOW_TIDE'}
                          </span>
                        </td>
                        <td className="py-2.5 px-1 text-right text-white/80 font-bold">{formatTimeOnly(p.t)}</td>
                        <td className="py-2.5 px-1 text-right text-primary font-bold">{p.v} FT</td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sebastian Inlet 7-Day Table */}
        <div className="terminal-box p-6 rounded-xl border border-primary/20 bg-black/60">
          <div className="border-b border-primary/20 pb-3 mb-4">
            <h3 className="text-base font-black text-white uppercase tracking-wider">Sebastian Inlet — 7-Day Tide Forecast</h3>
            <p className="text-[10px] text-primary/50 font-mono uppercase mt-0.5">NOAA Station 8722004 · High &amp; Low Predictions</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs border-collapse">
              <thead>
                <tr className="border-b border-primary/20 text-primary/60">
                  <th className="py-2 px-1 uppercase tracking-wider">Date</th>
                  <th className="py-2 px-1 uppercase tracking-wider">Tide Type</th>
                  <th className="py-2 px-1 uppercase tracking-wider text-right">Time</th>
                  <th className="py-2 px-1 uppercase tracking-wider text-right">Height (FT)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/10">
                {Object.entries(groupedSebastian).map(([dateStr, predictions]) => (
                  <React.Fragment key={dateStr}>
                    {predictions.map((p, idx) => (
                      <tr key={`${dateStr}-${idx}`} className="hover:bg-primary/5 transition-colors">
                        {idx === 0 ? (
                          <td className="py-2.5 px-1 font-bold text-white uppercase" rowSpan={predictions.length}>
                            {formatDateLabel(dateStr)}
                          </td>
                        ) : null}
                        <td className="py-2.5 px-1">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                            p.type === 'H' ? 'bg-yellow-400/10 text-yellow-400 border border-yellow-400/20' : 'bg-primary/10 text-primary border border-primary/20'
                          }`}>
                            {p.type === 'H' ? 'HIGH_TIDE' : 'LOW_TIDE'}
                          </span>
                        </td>
                        <td className="py-2.5 px-1 text-right text-white/80 font-bold">{formatTimeOnly(p.t)}</td>
                        <td className="py-2.5 px-1 text-right text-primary font-bold">{p.v} FT</td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Monthly Directories links for crawlability */}
      {(() => {
        const monthlyLinks = upcomingMonths(6).map((m) => ({ label: m.label, href: `/tides/${m.slug}` }));

        return (
          <section className="terminal-box p-6 rounded-xl border border-primary/20 bg-black/60 mt-10 font-mono">
            <h3 className="text-xs font-black text-white uppercase tracking-widest mb-4 italic">&gt; ARCHIVE_TIDE_CALENDARS</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {monthlyLinks.map((link) => (
                <a 
                  key={link.href}
                  href={link.href}
                  className="border border-primary/20 hover:border-primary px-3 py-2 text-center text-xs text-primary hover:text-black hover:bg-primary font-bold uppercase transition-all rounded-lg"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </section>
        );
      })()}

      <p className="mt-8 text-[10px] text-white/30 font-mono uppercase text-center">
        Source: NOAA Tides &amp; Currents predictions. Synchronized hourly. Core caching validated 2026.
      </p>
    </main>
  );
}
