import type { Metadata } from 'next';
import Link from 'next/link';
import VesselsClient from './VesselsClient';
import { breadcrumbList } from '@/components/verotide/JsonLd';

export const metadata: Metadata = {
  // absolute: skip the layout's "%s | Verotides" template because the brand is already in the title.
  title: { absolute: "Vero Beach Vessel Tracker: Live AIS Boat Map | Verotides" },
  description: "Live AIS map of boats and ships near Vero Beach, FL and the Indian River Lagoon. Vessel positions, speed, heading, and marine radio frequencies.",
  alternates: { canonical: '/vessels' },
  openGraph: {
    title: "Vero Beach Vessel Tracker: Live AIS Boat Map | Verotides",
    description: "Live AIS map of boats and ships near Vero Beach, FL and the Indian River Lagoon. Vessel positions, speed, heading, and marine radio frequencies.",
    url: '/vessels',
    siteName: 'Verotides',
    type: 'website',
    images: [{ url: '/og_image.jpg', width: 1200, height: 630, alt: 'Verotides Vero Beach coastal conditions' }],
  },
};

const schema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "Vero Beach Live Vessel Tracking",
  "description": "Real-time AIS vessel positions for Vero Beach, FL — Indian River Lagoon, Vero Beach Inlet, and nearby Atlantic waters.",
  "url": "https://verotides.com/vessels",
  "isPartOf": { "@type": "WebSite", "url": "https://verotides.com" },
  "breadcrumb": breadcrumbList([{ name: "Home", path: "/" }, { name: "Vessel Tracking", path: "/vessels" }]),
  "about": {
    "@type": "Thing",
    "name": "AIS maritime vessel tracking",
    "description": "Automatic Identification System real-time ship position data for the Vero Beach coastal area"
  },
  "spatialCoverage": {
    "@type": "Place",
    "name": "Vero Beach Inlet & Indian River Lagoon, Florida",
    "geo": {
      "@type": "GeoShape",
      "box": "27.4 -80.5 27.9 -80.1"
    }
  },
  "provider": { "@type": "Organization", "name": "Verotides Coastal Network", "url": "https://verotides.com" }
};

export default function VesselsPage() {
  return (
    <main className="min-h-screen bg-black p-4 md:p-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <div className="max-w-7xl mx-auto flex flex-col gap-8">
        <div>
          <h1 className="text-3xl md:text-5xl font-black glow-text tracking-tighter italic mb-3 uppercase">
            Vero Beach Vessel Tracking
          </h1>
          <p className="text-xs font-mono text-white/50 uppercase tracking-widest">
            Live AIS Radar · Indian River Lagoon · Atlantic Coastal Shelf · Sector Telemetry
          </p>
        </div>

        {/* Live Radar Console */}
        <VesselsClient />

        {/* Marine Intelligence & Frequencies Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono">
          {/* Card 1: Marine Frequencies */}
          <div className="terminal-box p-5 border border-primary/20 bg-black/60 rounded-xl flex flex-col gap-3">
            <h2 className="text-xs font-black text-primary uppercase tracking-widest border-b border-primary/20 pb-2 flex items-center gap-2">
              <span>📻</span> VHF MARINE FREQUENCIES
            </h2>
            <div className="space-y-2 text-xs text-white/80">
              <div className="flex justify-between border-b border-white/10 pb-1">
                <span className="text-yellow-400 font-bold">CH 16 (156.800 MHz)</span>
                <span className="text-white/60">Distress & Hailing</span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-1">
                <span className="text-primary font-bold">CH 13 (156.650 MHz)</span>
                <span className="text-white/60">Bridge-to-Bridge</span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-1">
                <span className="text-primary font-bold">CH 09 (156.450 MHz)</span>
                <span className="text-white/60">Secondary Calling</span>
              </div>
              <div className="flex justify-between">
                <span className="text-primary font-bold">CH 22A (157.100 MHz)</span>
                <span className="text-white/60">USCG Safety Broadcast</span>
              </div>
            </div>
          </div>

          {/* Card 2: Sector Navigational Corridors */}
          <div className="terminal-box p-5 border border-primary/20 bg-black/60 rounded-xl flex flex-col gap-3">
            <h2 className="text-xs font-black text-primary uppercase tracking-widest border-b border-primary/20 pb-2 flex items-center gap-2">
              <span>🧭</span> INLETS & NAVIGATION PASSES
            </h2>
            <div className="space-y-2 text-xs text-white/80">
              <div className="flex justify-between border-b border-white/10 pb-1">
                <span className="text-white font-bold">Sebastian Inlet</span>
                <span className="text-amber-400">High Tidal Inflow</span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-1">
                <span className="text-white font-bold">Fort Pierce Inlet</span>
                <span className="text-emerald-400">Deep Draft (40 ft)</span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-1">
                <span className="text-white font-bold">ICW Mile Marker 952</span>
                <span className="text-white/60">Wabasso Narrows</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white font-bold">ICW Mile Marker 962</span>
                <span className="text-white/60">Barber Bridge Pass</span>
              </div>
            </div>
          </div>

          {/* Card 3: Protected Waters & Regulations */}
          <div className="terminal-box p-5 border border-primary/20 bg-black/60 rounded-xl flex flex-col gap-3">
            <h2 className="text-xs font-black text-primary uppercase tracking-widest border-b border-primary/20 pb-2 flex items-center gap-2">
              <span>⚠️</span> REGULATORY ZONES & RAMPS
            </h2>
            <p className="text-xs text-white/70 leading-relaxed">
              Indian River Lagoon enforces seasonal manatee protection zones (Idle / Slow Speed Minimum Wake). Speed limits are strictly monitored by FWC and USCG patrol vessels.
            </p>
            <div className="pt-2 flex flex-wrap gap-2 text-[10px] uppercase font-bold">
              <Link
                href="/manatee-zones"
                className="border border-primary/40 px-2.5 py-1 text-primary hover:bg-primary hover:text-black transition-colors rounded"
              >
                Manatee Zones Map ↗
              </Link>
              <Link
                href="/boat-ramps"
                className="border border-primary/40 px-2.5 py-1 text-primary hover:bg-primary hover:text-black transition-colors rounded"
              >
                Public Boat Ramps ↗
              </Link>
              <Link
                href="/bridges"
                className="border border-primary/40 px-2.5 py-1 text-primary hover:bg-primary hover:text-black transition-colors rounded"
              >
                Bridge Clearances ↗
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
