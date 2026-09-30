import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const grid = searchParams.get('grid') || 'MLB/68,33';
  const url = `https://api.weather.gov/gridpoints/${grid}/forecast`;

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': '(verotides.com, foleys.assistant@pm.me)'
      },
      next: { revalidate: 3600 } // Cache for 1 hour
    });
    const data = await res.json();
    // NWS forecasts update roughly hourly and the upstream fetch above is cached for 1h, so a
    // 15-min CDN window (plus 1h SWR) is cheap and still fresh. Also shields api.weather.gov
    // from one request per visitor.
    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=3600' },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch weather data' }, { status: 500 });
  }
}
