import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Vero Beach Bridge Status | Barber, 17th St & Wabasso Bridges',
  description: 'Live Vero Beach bridge status: Barber Bridge (SR-60), 17th Street Bridge (SR-656, major rehab 2023–2028 — one lane alternating), and Wabasso Bridge (CR-510). Real-time traffic and construction alerts for Indian River County.',
  keywords: 'Vero Beach bridges, Barber Bridge status, 17th Street Bridge Vero Beach, Wabasso Bridge CR-510, Indian River bridge traffic, Vero Beach barrier island crossing, SR-60 Vero Beach, FL-511 Indian River',
  alternates: { canonical: 'https://verotides.com/bridges' },
  openGraph: {
    title: 'Vero Beach Bridge Status — Barber, 17th St & Wabasso | Verotides',
    description: 'Live status for all Vero Beach barrier island bridge crossings. 17th St under major FDOT rehab through 2028.',
    url: 'https://verotides.com/bridges',
  },
};

const BRIDGES = [
  {
    name: 'Barber Bridge (SR-60)',
    status: 'OPEN — CLEAR',
    color: 'yellow' as const,
    desc: 'Fixed bridge — main artery connecting barrier island to mainland. 4 lanes, no lift delays. Fastest crossing. Connects to US-1 and I-95 corridor.',
    detail: 'No active construction. Unrestricted 4-lane travel. Best option for peak-hour crossings.',
    route: 'SR-60',
  },
  {
    name: '17th Street Bridge (SR-656)',
    status: 'RESTRICTED — MAJOR REHAB',
    color: 'red' as const,
    desc: 'FDOT major rehabilitation project 2023–2028. One lane alternating 24/7 with flagging. Expect 5–15 min delays during peak hours.',
    detail: 'Structural rehabilitation of bridge deck and pilings. Use Barber or Wabasso as alternate routes.',
    route: 'SR-656',
  },
  {
    name: 'Wabasso Bridge (CR-510)',
    status: 'OPEN — CLEAR',
    color: 'yellow' as const,
    desc: 'Northern barrier island crossing. 2 lanes, no active restrictions. Best alternate while 17th St is under construction.',
    detail: 'Connects US-1 at Wabasso. No construction. Recommended alternate route during 17th St rehab.',
    route: 'CR-510',
  },
];

const schema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "name": "Vero Beach Bridge Status",
      "description": "Live status for Barber Bridge (SR-60), 17th Street Bridge (SR-656), and Wabasso Bridge (CR-510) in Vero Beach, FL.",
      "url": "https://verotides.com/bridges",
      "isPartOf": { "@type": "WebSite", "url": "https://verotides.com" },
      "about": { "@type": "Thing", "name": "Bridge traffic and construction status, Indian River County, Florida" }
    },
    {
      "@type": "ItemList",
      "name": "Vero Beach Barrier Island Bridge Status",
      "itemListElement": BRIDGES.map((b, i) => ({
        "@type": "ListItem",
        "position": i + 1,
        "name": b.name,
        "description": b.desc
      }))
    },
    {
      "@type": "SpecialAnnouncement",
      "name": "17th Street Bridge (SR-656) Major Rehabilitation",
      "text": "FDOT is performing major structural rehabilitation of the 17th Street Bridge (SR-656) in Vero Beach. One lane alternating traffic with flagging, 24 hours a day, 7 days a week. Project runs 2023–2028. Use Barber Bridge (SR-60) or Wabasso Bridge (CR-510) as alternate routes.",
      "datePosted": "2023-01-01",
      "expires": "2028-12-31",
      "category": "https://www.wikidata.org/wiki/Q27209",
      "spatialCoverage": {
        "@type": "Place",
        "name": "17th Street Bridge, Vero Beach, FL",
        "geo": { "@type": "GeoCoordinates", "latitude": 27.6418, "longitude": -80.3852 }
      },
      "announcementLocation": { "@type": "GovernmentOffice", "name": "Florida Department of Transportation", "url": "https://www.fdot.gov" }
    }
  ]
};

export default function BridgesPage() {
  return (
    <main className="min-h-screen bg-black p-4 md:p-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <h1 className="text-3xl md:text-5xl font-black glow-text tracking-tighter italic mb-6 uppercase">
        Vero Beach Bridge Status
      </h1>
      <p className="text-xs font-mono text-white/40 uppercase tracking-widest mb-8">
        Barrier island crossings · Indian River County ·{' '}
        <a href="https://fl511.com/list/bridge" className="text-primary hover:text-white transition-colors" target="_blank" rel="noopener noreferrer">
          FL511 Live ↗
        </a>
      </p>
      <div className="flex flex-col gap-6">
        {BRIDGES.map((bridge) => (
          <div key={bridge.name} className="terminal-box p-6 rounded-xl border border-primary/20 bg-black/60">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <h2 className="text-lg font-black text-white uppercase tracking-widest">{bridge.name}</h2>
              <span className={`text-sm font-black uppercase px-4 py-1.5 border rounded-md w-fit ${
                bridge.color === 'red'
                  ? 'text-red-400 border-red-500/40 bg-red-500/10'
                  : 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10'
              }`}>
                {bridge.status}
              </span>
            </div>
            <p className="text-sm text-white/70 font-mono mb-2">{bridge.desc}</p>
            <p className="text-xs text-white/40 font-mono">{bridge.detail}</p>
          </div>
        ))}
      </div>
      <p className="mt-8 text-xs text-white/30 font-mono uppercase">
        Source: FDOT · FL511 · Indian River County · Last reviewed May 2026.{' '}
        Verify at <a href="https://fl511.com" className="text-primary" target="_blank" rel="noopener noreferrer">fl511.com</a>.
      </p>
    </main>
  );
}
