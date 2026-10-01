import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  // absolute: skip the layout's "%s | Verotides" template because the brand is already in the title.
  title: { absolute: "Vero Beach Bridge Status: Barber, 17th St & Wabasso | Verotides" },
  description: "Current status and closures for the Barber, 17th Street and Wabasso bridges in Vero Beach, FL, plus detour and drawbridge information.",
  alternates: { canonical: '/bridges' },
  openGraph: {
    title: "Vero Beach Bridge Status: Barber, 17th St & Wabasso | Verotides",
    description: "Current status and closures for the Barber, 17th Street and Wabasso bridges in Vero Beach, FL, plus detour and drawbridge information.",
    url: '/bridges',
    siteName: 'Verotides',
    type: 'website',
    // A child openGraph replaces the layout's whole openGraph object, so the image must be repeated here.
    images: [{ url: '/og_image.png', width: 1200, height: 630, alt: 'Verotides Vero Beach coastal conditions' }],
  },
};

// Date this page's facts were last checked against FDOT / local reporting.
// Update BOTH constants together whenever the content is re-verified.
const LAST_VERIFIED_ISO = '2026-09-30';
const LAST_VERIFIED_LABEL = 'September 30, 2026';

// Facts below were verified on LAST_VERIFIED_ISO:
//  - 17th St (SR-656, Alma Lee Loy Bridge): FDOT District 4 rehab began 2023-09-05. The original
//    estimate was summer 2028, but FDOT later said completion "by fall 2026"
//    (https://veronews.com/2025/10/17/span-tastic-17th-st-bridge-repair-completion-date-moved-up-again/).
//    As of Aug 1, 2026 it was ~98% complete, with single-lane closures "as needed" until finished
//    (http://veronews.com/2026/08/13/is-repair-work-on-17th-street-bridge-actually-dare-we-ask-almost-done/).
//    We could not find an FDOT notice that it is fully finished, so we say "final work", not "complete".
//  - Wabasso Bridge carries SR-510 (https://en.wikipedia.org/wiki/Wabasso_Bridge); only the county road
//    west of US-1 is signed CR-510.
//  - All three bridges are fixed spans with ~65 ft clearance (no drawbridge openings).
const BRIDGES = [
  {
    name: 'Barber Bridge (SR-60)',
    status: 'OPEN — CLEAR',
    color: 'yellow' as const,
    desc: 'Fixed high-level bridge (about 65 ft clearance) and the main barrier-island crossing. No lift delays. Connects to US-1 and the I-95 corridor.',
    detail: 'No known construction or restrictions at last check. Best option for peak-hour crossings.',
    route: 'SR-60',
  },
  {
    name: '17th Street Bridge (SR-656)',
    status: 'CAUTION — FINAL REPAIR WORK',
    color: 'red' as const,
    desc: 'FDOT east-end rehabilitation (started September 2023, originally estimated for 2028) was about 98% complete as of August 1, 2026, with completion expected by the end of summer/fall 2026. Expect single-lane closures as needed, often at night, until it wraps up.',
    detail: 'Fixed bridge with about 65 ft clearance (no drawbridge openings). Use the Barber or Wabasso bridges if you need a guaranteed open route, and check FL511 for current closures.',
    route: 'SR-656',
  },
  {
    name: 'Wabasso Bridge (SR-510)',
    status: 'OPEN — CLEAR',
    color: 'yellow' as const,
    desc: 'Northern barrier island crossing on SR-510 (Wabasso Causeway). Fixed two-lane bridge, about 65 ft clearance. No known restrictions at last check.',
    detail: 'Connects US-1 at Wabasso to the barrier island. A good alternate while 17th Street work continues.',
    route: 'SR-510',
  },
];

// JSON-LD. The previous SpecialAnnouncement block was removed: Google only supports that type for
// COVID-19 announcements, and the stale 2023-2028 dates were wrong. A WebPage with dateModified plus
// an ItemList (no per-bridge "live status" claims) is valid, accurate markup.
const schema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "name": "Vero Beach Bridge Status",
      "description": "Status notes for the Barber Bridge (SR-60), 17th Street Bridge (SR-656), and Wabasso Bridge (SR-510) in Vero Beach, FL, sourced from FDOT and local reporting.",
      "url": "https://verotides.com/bridges",
      "dateModified": LAST_VERIFIED_ISO,
      "isPartOf": { "@type": "WebSite", "url": "https://verotides.com" },
      "breadcrumb": {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://verotides.com" },
          { "@type": "ListItem", "position": 2, "name": "Bridge Status", "item": "https://verotides.com/bridges" }
        ]
      },
      "about": { "@type": "Thing", "name": "Bridge traffic and construction status, Indian River County, Florida" }
    },
    {
      "@type": "ItemList",
      "name": "Vero Beach Barrier Island Bridges",
      "itemListElement": BRIDGES.map((b, i) => ({
        "@type": "ListItem",
        "position": i + 1,
        "name": b.name,
        "description": b.desc
      }))
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
      {/* Visible freshness line: matches dateModified in the JSON-LD above. */}
      <p className="mt-8 text-xs text-white/30 font-mono uppercase">
        Last verified: <time dateTime={LAST_VERIFIED_ISO}>{LAST_VERIFIED_LABEL}</time>. Sources:{' '}
        <a href="https://www.d4fdot.com/" className="text-primary" target="_blank" rel="noopener noreferrer">FDOT District 4</a>
        {' · '}
        <a href="http://veronews.com/2026/08/13/is-repair-work-on-17th-street-bridge-actually-dare-we-ask-almost-done/" className="text-primary" target="_blank" rel="noopener noreferrer">Vero News (Aug. 13, 2026)</a>
        {' · '}FL511. Conditions change; verify live closures at{' '}
        <a href="https://fl511.com" className="text-primary" target="_blank" rel="noopener noreferrer">fl511.com</a>.
      </p>
    
      {/* Internal links: connect related utilities so crawlers and boaters can move between them */}
      <nav aria-label="Related pages" className="mt-8 max-w-4xl font-mono text-xs text-white/70">
        <h2 className="text-sm font-black text-primary uppercase tracking-widest mb-2">Related</h2>
        <ul className="flex flex-col gap-1">
          <li><Link href="/manatee-zones" className="text-primary underline hover:text-white">Manatee protection zones near the bridges</Link></li>
          <li><Link href="/boat-ramps" className="text-primary underline hover:text-white">Public boat ramps</Link></li>
          <li><Link href="/lagoon" className="text-primary underline hover:text-white">Indian River Lagoon water level</Link></li>
        </ul>
      </nav>
    </main>
  );
}
