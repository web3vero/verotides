import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getGuideBySlug, getAllGuides } from '@/lib/verotide/guides';
import AdSenseBlock from '@/components/verotide/AdSenseBlock';

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Generate metadata dynamically for SEO
export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);
  
  if (!guide) {
    return {
      title: "Page Not Found - Verotides",
      description: "This page does not exist."
    };
  }

  const imageUrl = guide.metadata.image 
    ? `https://verotides.com${guide.metadata.image}`
    : 'https://verotides.com/og_image.png';

  return {
    title: `🌊 ${guide.metadata.title} | Verotides Guides 🎣`,
    description: `${guide.metadata.description} Read the full article on verotides.com. 【GUIDE】`,
    alternates: {
      canonical: `https://verotides.com/guides/${slug}`,
    },
    openGraph: {
      title: `🌊 ${guide.metadata.title} | Verotides Guides 🎣`,
      description: guide.metadata.description,
      url: `https://verotides.com/guides/${slug}`,
      type: "article",
      publishedTime: guide.metadata.date,
      tags: guide.metadata.tags,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: guide.metadata.title,
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title: `🌊 ${guide.metadata.title} | Verotides Guides 🎣`,
      description: guide.metadata.description,
      images: [imageUrl],
    }
  };
}

// Pre-render articles statically at build time
export async function generateStaticParams() {
  const guides = getAllGuides();
  return guides.map((guide) => ({
    slug: guide.slug,
  }));
}

export default async function GuidePage({ params }: PageProps) {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);

  if (!guide) {
    notFound();
  }

  const allGuides = getAllGuides();
  const recentGuides = allGuides
    .filter((g) => g.slug !== slug)
    .slice(0, 3);

  const imageUrl = guide.metadata.image 
    ? `https://verotides.com${guide.metadata.image}`
    : 'https://verotides.com/og_image.png';

  const schema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": guide.metadata.title,
    "description": guide.metadata.description,
    "image": imageUrl,
    "datePublished": guide.metadata.date,
    "author": {
      "@type": "Organization",
      "name": "Verotides Coastal Intelligence",
      "url": "https://verotides.com"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Verotides",
      "logo": {
        "@type": "ImageObject",
        "url": "https://verotides.com/globe.svg"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://verotides.com/guides/${slug}`
    }
  };

  return (
    <main className="min-h-screen flex flex-col bg-black overflow-x-hidden">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
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
        {/* Navigation Breadcrumbs */}
        <div className="mb-6 flex flex-wrap gap-2 text-xs md:text-sm font-mono text-zinc-500 uppercase">
          <Link href="/" className="hover:text-primary transition-colors">CENTRAL_COMMAND</Link>
          <span>/</span>
          <Link href="/guides" className="hover:text-primary transition-colors">RESEARCH_ARCHIVE</Link>
          <span>/</span>
          <span className="text-primary/70">{slug.replace(/-/g, '_')}</span>
        </div>

        {/* Dynamic Sidebar / Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Article Content */}
          <article className="lg:col-span-8">
            {/* Featured Image */}
            {guide.metadata.image && (
              <div className="w-full relative border-2 border-primary/20 rounded-xl overflow-hidden mb-8 aspect-[21/9] bg-zinc-950 flex items-center justify-center">
                <img 
                  src={guide.metadata.image} 
                  alt={guide.metadata.title}
                  className="w-full h-full object-cover filter brightness-[0.85] contrast-[1.05] grayscale-[15%] transition-transform duration-500"
                />
                {/* CRT Screen scanline effect for images */}
                <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.15)_50%)] bg-[length:100%_4px] opacity-35 mix-blend-overlay z-10" />
              </div>
            )}

            {/* Header Panel */}
            <div className="terminal-box p-6 border-primary/20 rounded-xl mb-8 bg-zinc-950/20">
              <div className="flex flex-wrap gap-4 items-center justify-between border-b border-primary/10 pb-4 mb-4">
                <span className="text-xs font-mono text-primary font-bold uppercase tracking-widest bg-primary/10 px-3 py-1 rounded border border-primary/10">
                  {guide.metadata.category}
                </span>
                <div className="text-xs font-mono opacity-50 flex gap-4">
                  <span>PUBLISHED: {guide.metadata.date}</span>
                </div>
              </div>
              
              <h1 className="text-3xl md:text-5xl font-black text-zinc-100 leading-tight font-sans tracking-tight mb-6">
                {guide.metadata.title}
              </h1>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5">
                {guide.metadata.tags.map((tag) => (
                  <span 
                    key={tag}
                    className="text-[9px] font-mono px-2 py-0.5 border border-primary/15 bg-primary/5 text-primary/80 rounded"
                  >
                    #{tag.toLowerCase().replace(/\s+/g, '')}
                  </span>
                ))}
              </div>
            </div>

            {/* Render HTML Content */}
            <div 
              className="article-body px-1 py-2 text-zinc-300 font-sans text-lg leading-relaxed space-y-6"
              dangerouslySetInnerHTML={{ __html: guide.htmlContent }}
            />

            {/* In-Article Ad Slot */}
            <AdSenseBlock slot="8392182051" />
          </article>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-6">
            {/* CLAIM THIS SLOT SPONSOR CARD */}
            <div className="terminal-box p-6 border-green-400/20 rounded-xl bg-card/60 relative overflow-hidden flex flex-col gap-4">
              <div className="absolute top-0 right-0 bg-green-400/10 text-green-400 border-l border-b border-green-400/20 text-[8px] font-black uppercase px-3 py-1 tracking-widest">
                Sponsor Spot
              </div>
              <div className="border-b border-green-400/10 pb-2 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-green-400/80 animate-pulse"></span>
                <span className="font-bold text-green-400/80 uppercase tracking-widest text-[9px] font-mono">
                  COASTAL_LIFESTYLE
                </span>
              </div>
              <div className="flex flex-col items-center justify-center text-center py-4 gap-3">
                <div className="h-12 w-12 border-2 border-green-400/20 rounded-full flex items-center justify-center bg-green-400/5 text-xl">
                  🏖️
                </div>
                <div>
                  <h4 className="font-bold text-zinc-200 text-sm">Coastal Lifestyle Partner</h4>
                  <p className="text-[11px] text-zinc-400 mt-1 max-w-[200px] leading-relaxed">
                    Connect with Vero Beach boaters &amp; anglers on this guide.
                  </p>
                </div>
              </div>
              <a 
                href="mailto:ads@verotides.com?subject=Claim%20Coastal%20Lifestyle%20Ad%20Slot"
                className="block text-center w-full py-2.5 px-4 border border-green-400/30 bg-green-400/5 text-green-400 font-mono text-[10px] font-black uppercase rounded-lg hover:bg-green-400 hover:text-black hover:border-green-400 transition-all duration-200"
              >
                Claim This Slot --&gt;
              </a>
            </div>

            {/* RECENT GUIDES */}
            {recentGuides.length > 0 && (
              <div className="terminal-box p-6 border-primary/20 rounded-xl bg-card/40">
                <h3 className="font-mono text-xs font-bold text-primary border-b border-primary/10 pb-3 mb-4 uppercase tracking-widest">
                  Related Archive Entries
                </h3>
                <div className="space-y-4">
                  {recentGuides.map((rg) => (
                    <div key={rg.slug} className="group border-b border-primary/5 pb-3 last:border-0 last:pb-0">
                      <span className="text-[9px] font-mono opacity-40 block mb-1">
                        {rg.date} | {rg.category.toUpperCase()}
                      </span>
                      <Link 
                        href={`/guides/${rg.slug}`}
                        className="font-sans text-sm font-semibold text-zinc-300 group-hover:text-primary transition-colors line-clamp-2 leading-snug"
                      >
                        {rg.title}
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AD SENSE SIDEBAR AD */}
            <AdSenseBlock slot="7492182052" format="rectangle" />
          </aside>
        </div>
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
