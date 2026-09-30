import React from 'react';

// Shared JSON-LD helpers so every route builds structured data the same way.
//
// Why: several pages each hand-wrote their own BreadcrumbList and their own
// <script type="application/ld+json"> tag. Centralising both keeps the markup consistent
// and gives us one place to escape the JSON safely.

const SITE = 'https://verotides.com';

// The Organization node is declared once in app/layout.tsx with this @id; pages reference it
// instead of redefining it, so search engines resolve all pages to ONE publisher entity.
export const ORGANIZATION_ID = `${SITE}/#organization`;

export interface Crumb {
  name: string;
  // Path ("/tides") or absolute URL. Omit on the final crumb: Google allows the last item to
  // have no `item`, since it is the page you are already on.
  path?: string;
}

// Builds a schema.org BreadcrumbList object (no @context, so it can be nested in an @graph).
export function breadcrumbList(crumbs: Crumb[]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1, // positions are 1-based
      name: c.name,
      ...(c.path ? { item: c.path.startsWith('http') ? c.path : `${SITE}${c.path === '/' ? '' : c.path}` } : {}),
    })),
  };
}

// Renders any JSON-LD object as a script tag.
// Escaping "<" as < stops a stray "</script>" inside a string value from closing the tag
// early (a classic JSON-in-HTML injection vector). JSON parsers read < back as "<".
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  );
}

// Convenience: a standalone BreadcrumbList script (Home > ...rest).
export function BreadcrumbJsonLd({ trail }: { trail: Crumb[] }) {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        ...breadcrumbList([{ name: 'Home', path: '/' }, ...trail]),
      }}
    />
  );
}

// ---- Tide datasets (used by /tides and /tides/[month]) ----------------------------------------

export interface TideStation {
  key: 'vero' | 'sebastian'; // used to build a distinct @id per station
  id: string; // NOAA CO-OPS station id
  label: string; // human place name
  lat: number;
  lon: number;
}

export const TIDE_STATIONS: TideStation[] = [
  { key: 'vero', id: '8722125', label: 'Vero Beach (Intracoastal), Florida', lat: 27.6386, lon: -80.3973 },
  { key: 'sebastian', id: '8722004', label: 'Sebastian Inlet, Florida', lat: 27.8603, lon: -80.4472 },
];

// One schema.org Dataset per station.
//  - `pageUrl` is the page that shows the data; the fragment (#vero / #sebastian) makes each
//    Dataset's @id and url distinct, so the two stations are not merged into one entity.
//  - Deliberately NO `license`: the numbers are NOAA CO-OPS predictions and Verotides has no
//    right to relicense them. We cite NOAA as creator/source instead (isBasedOn).
//  - `coverage` must be a valid ISO 8601 interval ("2026-10-01/2026-10-31"); pass undefined to omit.
export function tideDataset(opts: {
  station: TideStation;
  pageUrl: string;
  name: string;
  description: string;
  coverage?: string;
  dateModified?: string;
}) {
  const { station, pageUrl, name, description, coverage, dateModified } = opts;
  return {
    '@type': 'Dataset',
    '@id': `${pageUrl}#${station.key}`,
    name,
    description,
    url: `${pageUrl}#${station.key}`,
    isBasedOn: `https://tidesandcurrents.noaa.gov/noaatidepredictions.html?id=${station.id}`,
    creator: { '@type': 'Organization', name: 'NOAA CO-OPS', url: 'https://tidesandcurrents.noaa.gov' },
    publisher: { '@id': ORGANIZATION_ID },
    isAccessibleForFree: true,
    variableMeasured: 'Predicted tide height (feet, MLLW datum) and high/low tide times',
    ...(coverage ? { temporalCoverage: coverage } : {}),
    ...(dateModified ? { dateModified } : {}),
    spatialCoverage: {
      '@type': 'Place',
      name: station.label,
      geo: { '@type': 'GeoCoordinates', latitude: station.lat, longitude: station.lon },
    },
  };
}
