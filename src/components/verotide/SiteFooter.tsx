import Link from 'next/link';

// Slim, server-rendered footer (no 'use client', zero JS). Its job is crawlability:
// when it is rendered from app/layout.tsx, EVERY page gets real <a href> links to
// /guides and /privacy (which were previously only reachable from a few pages), plus the
// main utility sections. That removes "orphan page" risk and spreads internal link equity.
const FOOTER_LINKS = [
  { href: '/tides', label: 'Tides' },
  { href: '/cams', label: 'Cams' },
  { href: '/bridges', label: 'Bridges' },
  { href: '/guides', label: 'Guides' },
  { href: '/about', label: 'About' },
  { href: '/privacy', label: 'Privacy' },
];

export default function SiteFooter() {
  return (
    <footer className="w-full border-t border-primary/20 bg-black px-4 md:px-8 py-4 font-mono text-[10px] md:text-xs">
      <nav aria-label="Footer" className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
        <ul className="flex flex-wrap gap-x-5 gap-y-2 uppercase tracking-wider">
          {FOOTER_LINKS.map(({ href, label }) => (
            <li key={href}>
              <Link href={href} className="text-primary/80 hover:text-primary hover:underline">
                {label}
              </Link>
            </li>
          ))}
        </ul>
        <span className="opacity-50">&copy; {new Date().getFullYear()} Verotides &middot; Vero Beach, FL</span>
      </nav>
    </footer>
  );
}
