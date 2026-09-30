import { NextResponse } from 'next/server';
import { getTidePredictions } from '@/lib/verotide/data';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const stationId = searchParams.get('station') || '8722125';
  const dateParam = searchParams.get('date') || 'today';

  try {
    const data = await getTidePredictions(stationId, dateParam);
    // Tide predictions come from a NOAA fetch that is itself revalidated every 300s, so let
    // Vercel's CDN serve this for 5 min (s-maxage) and then keep serving the stale copy for
    // up to 15 more min while it refreshes in the background (stale-while-revalidate).
    // Only success responses get this header; the 500 below is never cached.
    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=900' },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch tide data' }, { status: 500 });
  }
}
