import { NextResponse } from 'next/server';

export interface NhcStormStatus {
  level: 0 | 1 | 2 | 3;
  stormCount: number;
  storms: Array<{ name: string; type: string; link?: string }>;
  lastUpdated: string;
  statusCode: 'NO_ACTIVITY' | 'TROPICAL_ACTIVITY' | 'HURRICANE_WATCH' | 'MAJOR_THREAT' | 'FEED_ERR';
}

const SEVERITY = { 'Hurricane': 3, 'Tropical Storm': 2, 'Tropical Depression': 1, 'Post-Tropical Cyclone': 0 } as const;
type StormType = keyof typeof SEVERITY;

function parseNhcRss(xml: string): NhcStormStatus {
  const itemBlocks = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)];

  const items = itemBlocks.map(m => {
    const raw = m[1];
    const titleMatch = raw.match(/<title>(?:<!\[CDATA\[)?\s*([\s\S]*?)\s*(?:\]\]>)?<\/title>/);
    const descMatch = raw.match(/<description>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/);
    const linkMatch = raw.match(/<link>(?:<!\[CDATA\[)?\s*([\s\S]*?)\s*(?:\]\]>)?<\/link>/);
    return {
      title: titleMatch?.[1]?.trim() ?? '',
      desc: descMatch?.[1]?.trim() ?? '',
      link: linkMatch?.[1]?.trim() ?? '',
    };
  });

  if (items.length === 0 || items.some(i => /no tropical cyclones/i.test(i.title))) {
    return { level: 0, stormCount: 0, storms: [], lastUpdated: new Date().toISOString(), statusCode: 'NO_ACTIVITY' };
  }

  const ADVISORY_RE = /Advisory|Intermediate|Discussion|Forecast/i;
  const STORM_TYPE_RE = /^(Hurricane|Tropical Storm|Tropical Depression|Post-Tropical Cyclone)\s+(\w+)/i;

  const stormMap = new Map<string, { type: StormType; link?: string }>();

  for (const item of items) {
    if (!ADVISORY_RE.test(item.title)) continue;
    const m = item.title.match(STORM_TYPE_RE);
    if (!m) continue;

    const rawType = m[1] as StormType;
    const name = m[2];
    const existing = stormMap.get(name);
    if (!existing || (SEVERITY[rawType] ?? 0) > (SEVERITY[existing.type] ?? 0)) {
      stormMap.set(name, { type: rawType, link: item.link || undefined });
    }
  }

  if (stormMap.size === 0) {
    return { level: 0, stormCount: 0, storms: [], lastUpdated: new Date().toISOString(), statusCode: 'NO_ACTIVITY' };
  }

  const storms = [...stormMap.entries()].map(([name, { type, link }]) => ({ name, type, link }));
  const hasHurricane = storms.some(s => s.type === 'Hurricane');
  const allDesc = items.map(i => i.desc).join(' ').toLowerCase();
  const floridaThreat = /florida|treasure coast|gulf of|vero|sebastian|fort pierce/i.test(allDesc);

  let level: NhcStormStatus['level'];
  let statusCode: NhcStormStatus['statusCode'];

  if (hasHurricane && floridaThreat) {
    level = 3; statusCode = 'MAJOR_THREAT';
  } else if (hasHurricane) {
    level = 2; statusCode = 'HURRICANE_WATCH';
  } else {
    level = 1; statusCode = 'TROPICAL_ACTIVITY';
  }

  return { level, stormCount: storms.length, storms, lastUpdated: new Date().toISOString(), statusCode };
}

export async function GET() {
  try {
    const res = await fetch('https://www.nhc.noaa.gov/index-at.xml', {
      headers: { 'User-Agent': '(verotides.com, ops@verotides.com)' },
      next: { revalidate: 3600 },
    });

    if (!res.ok) throw new Error(`NHC ${res.status}`);

    const xml = await res.text();
    return NextResponse.json(parseNhcRss(xml));
  } catch {
    return NextResponse.json({
      level: 0,
      stormCount: 0,
      storms: [],
      lastUpdated: new Date().toISOString(),
      statusCode: 'FEED_ERR',
    } satisfies NhcStormStatus);
  }
}
