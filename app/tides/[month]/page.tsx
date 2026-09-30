import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import { getTidePredictions, TidePrediction, formatNoaaDate } from '@/lib/verotide/data';
import React from 'react';
import Link from 'next/link';
import { JsonLd, breadcrumbList, tideDataset, TIDE_STATIONS, ORGANIZATION_ID } from '@/components/verotide/JsonLd';

type PageParams = Promise<{ month: string }>;

const MONTH_MAP: { [key: string]: number } = {
  january: 0, february: 1, march: 2, april: 3, may: 4, june: 5,
  july: 6, august: 7, september: 8, october: 9, november: 10, december: 11
};

interface ParsedMonth {
  monthName: string;
  monthIndex: number;
  year: number;
}

// Current calendar year as seen in Vero Beach (not the server's UTC clock).
function currentYearET(): number {
  return Number(
    new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', year: 'numeric' }).format(new Date())
  );
}

function parseMonthParam(param: string): ParsedMonth | null {
  const parts = param.toLowerCase().split('-');
  if (parts.length !== 2) return null;
  
  const monthName = parts[0];
  const yearStr = parts[1];
  
  const monthIndex = MONTH_MAP[monthName];
  const year = parseInt(yearStr);
  
  // Only serve a sensible window (last year .. two years ahead); anything else is a 404.
  // This stops crawlers from indexing endless empty/nonsense months like /tides/may-2039.
  // The strict /^\d{4}$/ check also rejects junk like "2026abc" that parseInt would accept.
  const nowYear = currentYearET();
  if (
    monthIndex === undefined ||
    !/^\d{4}$/.test(yearStr) ||
    year < nowYear - 1 ||
    year > nowYear + 2
  ) {
    return null;
  }
  
  return {
    monthName: monthName.charAt(0).toUpperCase() + monthName.slice(1),
    monthIndex,
    year
  };
}

export async function generateMetadata({ params }: { params: PageParams }): Promise<Metadata> {
  const resolvedParams = await params;
  const parsed = parseMonthParam(resolvedParams.month);

  if (!parsed) {
    return {
      title: 'Tide Chart Not Found',
      robots: { index: false },
    };
  }

  const { monthName, year } = parsed;
  // Always lowercase in the canonical, so /tides/December-2026 and /tides/december-2026 consolidate.
  const path = `/tides/${resolvedParams.month.toLowerCase()}`;
  // title.absolute skips the layout's "%s | Verotides" template so the brand is not doubled.
  const title = `Vero Beach Tide Chart ${monthName} ${year} | Verotides`;
  const description = `${monthName} ${year} high and low tide times and heights for Vero Beach and Sebastian Inlet, FL, from NOAA predictions.`;

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      siteName: 'Verotides',
      type: 'website',
      // A child openGraph replaces the layout's whole openGraph object, so the image is repeated here.
      images: [{ url: '/og_image.png', width: 1200, height: 630, alt: 'Verotides Vero Beach coastal conditions' }],
    },
  };
}

interface GroupedPredictions {
  [date: string]: TidePrediction[];
}

function groupPredictionsByDate(predictions: TidePrediction[]): GroupedPredictions {
  const grouped: GroupedPredictions = {};
  if (!predictions || predictions.length === 0) return grouped;
  
  predictions.forEach((p) => {
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
  if (timeStr.includes(' ')) {
    const parts = timeStr.split(' ');
    const [hh, mm] = parts[1].split(':');
    let hour = parseInt(hh);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12;
    hour = hour ? hour : 12;
    return `${hour}:${mm} ${ampm}`;
  }
  return timeStr;
}

export default async function MonthlyTidesPage({ params }: { params: PageParams }) {
  const resolvedParams = await params;
  const parsed = parseMonthParam(resolvedParams.month);
  
  if (!parsed) {
    notFound();
  }

  // Mixed-case URLs (December-2026) permanently redirect to the lowercase form (308),
  // so there is only ever one indexable URL per month.
  const slug = resolvedParams.month.toLowerCase();
  if (resolvedParams.month !== slug) {
    permanentRedirect(`/tides/${slug}`);
  }

  const { monthName, monthIndex, year } = parsed;

  // Calculate start and end date for NOAA API
  const start = new Date(year, monthIndex, 1);
  const end = new Date(year, monthIndex + 1, 0); // Last day of the month
  
  const startStr = formatNoaaDate(start);
  const endStr = formatNoaaDate(end);
  const dateParam = `begin_date=${startStr}&end_date=${endStr}`;

  // Fetch monthly predictions concurrently
  const [veroData, sebastianData] = await Promise.all([
    getTidePredictions('8722125', dateParam),
    getTidePredictions('8722004', dateParam),
  ]);

  const groupedVero = groupPredictionsByDate(veroData?.predictions || []);
  const groupedSebastian = groupPredictionsByDate(sebastianData?.predictions || []);

  // ISO 8601 interval covering exactly this month, e.g. "2026-10-01/2026-10-31".
  const mm = String(monthIndex + 1).padStart(2, '0');
  const lastDay = String(end.getDate()).padStart(2, '0');
  const coverage = `${year}-${mm}-01/${year}-${mm}-${lastDay}`;
  const pageUrl = `https://verotides.com/tides/${slug}`;

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${pageUrl}#webpage`,
        "name": `Vero Beach & Sebastian Inlet Tide Chart: ${monthName} ${year}`,
        "description": `NOAA tide chart predictions for Vero Beach and Sebastian Inlet, FL in ${monthName} ${year}.`,
        "url": pageUrl,
        "isPartOf": { "@type": "WebSite", "@id": "https://verotides.com/#website" },
        "publisher": { "@id": ORGANIZATION_ID },
        "breadcrumb": breadcrumbList([
          { name: "Home", path: "/" },
          { name: "Tides", path: "/tides" },
          { name: `${monthName} ${year}`, path: pageUrl },
        ]),
      },
      // One Dataset per station; distinct @id/url; NOAA cited as source, no license claimed.
      ...TIDE_STATIONS.map((station) =>
        tideDataset({
          station,
          pageUrl,
          name: `${station.key === 'vero' ? 'Vero Beach' : 'Sebastian Inlet'} tide predictions for ${monthName} ${year}, NOAA station ${station.id}`,
          description: `High and low tide times and heights (feet, MLLW) for NOAA station ${station.id}, ${station.label}, for ${monthName} ${year}. Source: NOAA CO-OPS predictions.`,
          coverage,
        })
      ),
    ]
  };

  return (
    <main className="min-h-screen bg-black p-4 md:p-8">
      <JsonLd data={schema} />
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl md:text-5xl font-black glow-text tracking-tighter italic uppercase mb-1">
            Vero Beach &amp; Sebastian Inlet Tide Chart: {monthName} {year}
          </h1>
          <p className="text-xs font-mono text-white/40 uppercase tracking-widest">
            Monthly Tide Chart predictions · Vero Beach &amp; Sebastian Inlet
          </p>
        </div>
        <Link
          href="/tides"
          className="px-4 py-2 border-2 border-primary/40 hover:border-primary text-primary hover:text-black hover:bg-primary transition-all font-mono text-xs uppercase font-bold rounded-lg"
        >
          &lt; Back to Live Tides
        </Link>
      </div>

      <section className="terminal-box p-6 border border-primary/20 bg-black/60 rounded-xl mb-8 font-mono">
        <h2 className="text-xs font-black text-primary uppercase tracking-widest mb-3">&gt; MONTHLY_SECTOR_BRIEF</h2>
        <p className="text-sm text-white/80 leading-relaxed">
          This page displays pre-rendered tidal forecast arrays for the entire month of <span className="text-yellow-400 font-bold">{monthName} {year}</span>. 
          Use the calendars below to plan coastal activities, commercial navigation, jetty fishing transits, and kayak launches. 
          For live wind speed offsets and real-time storm gauges, refer to the central command dashboard.
        </p>
      </section>

      {/* Tables Side-by-Side */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        
        {/* Vero Beach Monthly */}
        <div className="terminal-box p-6 rounded-xl border border-primary/20 bg-black/60">
          <div className="border-b border-primary/20 pb-3 mb-4">
            <h3 className="text-base font-black text-white uppercase tracking-wider">Vero Beach (Intracoastal) — {monthName} {year}</h3>
            <p className="text-[10px] text-primary/50 font-mono uppercase mt-0.5">NOAA Station 8722125 · Full Month Predictions</p>
          </div>
          {Object.keys(groupedVero).length === 0 ? (
            <p className="text-xs text-red-500 font-mono">NO_DATA_AVAILABLE_FOR_SPECIFIED_RANGE</p>
          ) : (
            <div className="overflow-y-auto max-h-[700px] pr-2 scrollbar-thin">
              <table className="w-full text-left font-mono text-xs border-collapse">
                <thead>
                  <tr className="border-b border-primary/20 text-primary/60 sticky top-0 bg-black py-2">
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
                            <td className="py-2.5 px-1 font-bold text-white uppercase whitespace-nowrap" rowSpan={predictions.length}>
                              {formatDateLabel(dateStr)}
                            </td>
                          ) : null}
                          <td className="py-2.5 px-1">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                              p.type === 'H' ? 'bg-yellow-400/10 text-yellow-400 border border-yellow-400/20' : 'bg-primary/10 text-primary border border-primary/20'
                            }`}>
                              {p.type === 'H' ? 'HIGH' : 'LOW'}
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
          )}
        </div>

        {/* Sebastian Inlet Monthly */}
        <div className="terminal-box p-6 rounded-xl border border-primary/20 bg-black/60">
          <div className="border-b border-primary/20 pb-3 mb-4">
            <h3 className="text-base font-black text-white uppercase tracking-wider">Sebastian Inlet — {monthName} {year}</h3>
            <p className="text-[10px] text-primary/50 font-mono uppercase mt-0.5">NOAA Station 8722004 · Full Month Predictions</p>
          </div>
          {Object.keys(groupedSebastian).length === 0 ? (
            <p className="text-xs text-red-500 font-mono">NO_DATA_AVAILABLE_FOR_SPECIFIED_RANGE</p>
          ) : (
            <div className="overflow-y-auto max-h-[700px] pr-2 scrollbar-thin">
              <table className="w-full text-left font-mono text-xs border-collapse">
                <thead>
                  <tr className="border-b border-primary/20 text-primary/60 sticky top-0 bg-black py-2">
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
                            <td className="py-2.5 px-1 font-bold text-white uppercase whitespace-nowrap" rowSpan={predictions.length}>
                              {formatDateLabel(dateStr)}
                            </td>
                          ) : null}
                          <td className="py-2.5 px-1">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                              p.type === 'H' ? 'bg-yellow-400/10 text-yellow-400 border border-yellow-400/20' : 'bg-primary/10 text-primary border border-primary/20'
                            }`}>
                              {p.type === 'H' ? 'HIGH' : 'LOW'}
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
          )}
        </div>

      </div>

      <p className="mt-8 text-[10px] text-white/30 font-mono uppercase text-center">
        Data pre-generated from NOAA Tidal Preds. Caching &amp; validation rules active 2026.
      </p>
    </main>
  );
}
