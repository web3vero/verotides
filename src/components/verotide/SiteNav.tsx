import Link from 'next/link';

// Core utility pages — kept crawlable via real <a href> links (SEO: prevents orphaned pages).
// Rendered site-wide from app/layout.tsx so every page links to its siblings, spreading link equity.
const NAV_LINKS = [
  { href: '/tides', label: 'Vero Beach Tides' },
  { href: '/fishing', label: 'Fishing & Bite Times' },
  { href: '/weather', label: 'Beach Conditions' },
  { href: '/vessels', label: 'Vessel Tracker' },
  { href: '/bridges', label: 'Bridge Status' },
  { href: '/spoil-islands', label: 'Spoil Islands' },
];

export default function SiteNav() {
  return (
    <nav aria-label="Primary" className="w-full border-b-2 border-primary/30 bg-black">
      <ul className="max-w-7xl mx-auto flex flex-wrap gap-x-1 gap-y-2 px-4 md:px-8 py-3 font-mono text-xs md:text-sm uppercase tracking-wider">
        {NAV_LINKS.map(({ href, label }) => (
          <li key={href}>
            <Link
              href={href}
              className="block px-3 md:px-4 py-2 text-primary/80 hover:text-black hover:bg-primary border border-transparent hover:border-primary transition-colors duration-200 whitespace-nowrap"
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
