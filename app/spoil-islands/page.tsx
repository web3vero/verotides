import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '🏕️ Indian River Spoil Islands Camping Guide | Vero Beach 🏕️',
  description: '【CAMPING GUIDE】 Primitive recreation guide to the Indian River Lagoon spoil islands in Vero Beach & Sebastian, FL. Free camping maps, rules, and GPS coordinates! »»',
  keywords: 'Indian River Lagoon camping, spoil islands Vero Beach, kayak camping Florida, spoil island coordinates, IR2 island, IR13 island, Intracoastal camping, free island camping Florida',
  alternates: { canonical: 'https://verotides.com/spoil-islands' },
  openGraph: {
    title: '🏕️ Indian River Spoil Islands Camping & Recreation Guide | Verotides 🏕️',
    description: 'Free, primitive camping guide to the Indian River Lagoon spoil islands in Vero Beach and Sebastian, FL. Navigation tips, rules, and coordinates! 【FREE】',
    url: 'https://verotides.com/spoil-islands',
  },
};

const ISLANDS = [
  {
    id: 'IR 2',
    name: 'Wabasso Island',
    coordinates: '27.7533° N, -80.4281° W',
    amenities: 'Picnic tables, fire ring, beach landing',
    difficulty: 'Easy (Kayak friendly)',
    desc: 'Located just south of the Wabasso Causeway (CR-510) bridge on the east side of the Intracoastal Waterway. It features a wide sand spit for easy kayak/boat landings, picnic shelter, and fire rings.',
    strategy: 'Perfect for beginners and families. Launch from the Wabasso Causeway Park boat ramp for a short 10-minute paddle.'
  },
  {
    id: 'IR 3',
    name: 'Hook Island',
    coordinates: '27.7428° N, -80.4192° W',
    amenities: 'Cleared camping areas, grill, beach landing',
    difficulty: 'Moderate',
    desc: 'A hook-shaped spoil island offering excellent shelter from strong easterly winds. Features cleared sandy landing strips on the western side and nice shady hammock areas.',
    strategy: 'Highly popular for weekend day-trips. Clear approach from the west channel.'
  },
  {
    id: 'IR 4',
    name: 'Hole-in-the-Wall Island',
    coordinates: '27.7314° N, -80.4083° W',
    amenities: 'Fire rings, primitive cleared slots',
    difficulty: 'Moderate (Deep water approach)',
    desc: 'Tucked away with a deep channel approach on the western side. Offers highly secluded, shaded tent spots under maritime oaks and palm trees.',
    strategy: 'Best for motorboats due to deep water access on the west, but watch for strong tidal currents in the main cut.'
  },
  {
    id: 'IR 12',
    name: 'Barker Island',
    coordinates: '27.6521° N, -80.3695° W',
    amenities: 'Shell beach landing, cleared camp spots',
    difficulty: 'Easy',
    desc: 'Situated just south of the Barber Bridge (SR-60) in Vero Beach. It features a scenic shell and sand beach on the northwest side and high ground for pitching tents.',
    strategy: 'Extremely convenient location for Vero Beach locals. Launch from MacWilliam Park Boat Ramp for a quick boat/kayak crossing.'
  },
  {
    id: 'IR 13',
    name: 'Round Island North',
    coordinates: '27.5614° N, -80.3325° W',
    amenities: 'Fire rings, pavilions, clear beach landing',
    difficulty: 'Easy',
    desc: 'Located near the south boundary of Indian River County. Offers very clean, established camping spots with beautiful mangrove trails nearby and frequent manatee sightings.',
    strategy: 'Launch from Round Island Riverside Park. Excellent canoe/kayak trail navigation. Highly recommended for wildlife viewing.'
  }
];

const faqs = [
  {
    q: 'Do I need a permit or reservation to camp on the spoil islands?',
    a: 'No. Camping on designated recreation spoil islands in the Indian River Lagoon is 100% free and operates on a first-come, first-served basis. No permits, fees, or reservations are required.'
  },
  {
    q: 'How long can I stay on an island?',
    a: 'Most recreation islands in Indian River County have a maximum stay limit of 36 consecutive hours. These are intended for short, primitive camping trips.'
  },
  {
    q: 'Are there restrooms or fresh water on the islands?',
    a: 'No. These are primitive islands with no running water, toilets, trash cans, or electricity. You must practice strict Pack-In, Pack-Out logistics, including bringing all fresh water and packing out all human waste and garbage.'
  },
  {
    q: 'Can I camp on any spoil island in the lagoon?',
    a: 'No. Islands are strictly designated. You may only camp on islands labeled for "Recreation". Islands designated for "Conservation" or "Education" are protected nesting sanctuaries for birds and wildlife, and landing or camping on them is strictly prohibited.'
  }
];

const schema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "name": "Indian River Lagoon Spoil Islands Camping Guide",
      "description": "Primitive camping and recreation guide for the Intracoastal spoil islands of Vero Beach and Sebastian, FL.",
      "url": "https://verotides.com/spoil-islands",
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
            "name": "Spoil Islands",
            "item": "https://verotides.com/spoil-islands"
          }
        ]
      }
    },
    {
      "@type": "ItemList",
      "name": "Vero Beach & Sebastian Spoil Islands (Recreation)",
      "itemListElement": ISLANDS.map((island, i) => ({
        "@type": "ListItem",
        "position": i + 1,
        "name": `${island.id} — ${island.name}`,
        "description": island.desc
      }))
    },
    {
      "@type": "FAQPage",
      "mainEntity": faqs.map(faq => ({
        "@type": "Question",
        "name": faq.q,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": faq.a
        }
      }))
    }
  ]
};

export default function SpoilIslandsPage() {
  return (
    <main className="min-h-screen bg-black p-4 md:p-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      
      <h1 className="text-3xl md:text-5xl font-black glow-text tracking-tighter italic mb-4 uppercase">
        Lagoon Spoil Islands
      </h1>
      <p className="text-xs font-mono text-white/40 uppercase tracking-widest mb-8">
        Intracoastal Recreation Guide · Indian River County ·{' '}
        <a href="https://www.spoilislandproject.org" className="text-primary hover:text-white transition-colors" target="_blank" rel="noopener noreferrer">
          Spoil Island Project ↗
        </a>
      </p>

      {/* Overview Intro */}
      <section className="terminal-box p-6 rounded-xl border border-primary/20 bg-black/60 mb-8 font-mono">
        <h2 className="text-sm font-black text-primary uppercase tracking-widest mb-3">&gt; LAGOON_CAMPING_PROTOCOL</h2>
        <p className="text-sm text-white/80 leading-relaxed mb-4">
          The Indian River Lagoon contains dozens of man-made spoil islands created during the dredging of the Intracoastal Waterway. Recreation-designated islands are open for free, primitive camping on a first-come, first-served basis. 
        </p>
        <div className="border-t border-primary/10 pt-4 flex flex-col gap-2 text-xs text-white/60">
          <span className="text-red-400 font-bold">⚠️ CRITICAL: Strict PACK-IN, PACK-OUT rules apply. No fresh water, restrooms, or trash collection exist on the islands.</span>
          <span>🔥 FIRES: Permitted ONLY in established metal fire rings/grills. Bring your own firewood (do not harvest island foliage).</span>
        </div>
      </section>

      {/* Islands Directory */}
      <h2 className="text-lg font-black text-white uppercase tracking-widest mb-6">Recreation Islands Directory</h2>
      <div className="flex flex-col gap-6 mb-12">
        {ISLANDS.map((island) => (
          <div key={island.id} className="terminal-box p-6 rounded-xl border border-primary/20 bg-black/60">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <span className="text-xs font-black font-mono bg-primary text-black px-2 py-1 uppercase">{island.id}</span>
                <h3 className="text-lg font-black text-white uppercase tracking-wider">{island.name}</h3>
              </div>
              <span className="text-xs font-mono text-white/50">{island.coordinates}</span>
            </div>
            
            <p className="text-sm text-white/70 font-mono mb-4">{island.desc}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-primary/10 font-mono text-xs">
              <div>
                <span className="block text-white/40 uppercase mb-1">Amenities:</span>
                <span className="text-white/80">{island.amenities}</span>
              </div>
              <div>
                <span className="block text-white/40 uppercase mb-1">Launch Difficulty:</span>
                <span className="text-white/80">{island.difficulty}</span>
              </div>
              <div>
                <span className="block text-white/40 uppercase mb-1">Local Strategy:</span>
                <span className="text-primary/90">{island.strategy}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Camping FAQ */}
      <h2 className="text-lg font-black text-white uppercase tracking-widest mb-6">Camping FAQs</h2>
      <div className="flex flex-col gap-6 mb-8 font-mono">
        {faqs.map((faq, idx) => (
          <div key={idx} className="terminal-box p-6 rounded-xl border border-primary/10 bg-black/40">
            <h3 className="text-sm font-bold text-white uppercase tracking-wide mb-2">Q: {faq.q}</h3>
            <p className="text-xs text-white/60 leading-relaxed">A: {faq.a}</p>
          </div>
        ))}
      </div>

      <p className="text-[10px] text-white/30 font-mono uppercase">
        Source: Florida Spoil Island Project · IR Lagoon Aquatic Preserves · Last reviewed May 2026.
      </p>
    </main>
  );
}
