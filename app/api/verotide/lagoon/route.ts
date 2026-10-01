import { NextResponse } from 'next/server';
import { getLagoonSnapshot } from '@/lib/verotide/lagoon';

// GET /api/verotide/lagoon -> LagoonSnapshot JSON (see src/lib/verotide/lagoon-types.ts).
// getLagoonSnapshot never throws: partial failures are reported inside `errors`, so this
// route always answers 200 with whatever is trustworthy. The upstream fetches carry their own
// Next revalidate windows; the CDN header below adds a 5 min edge cache plus 15 min of
// stale-while-revalidate so a slow NOAA/USGS response never blocks a visitor.
export async function GET() {
  const snapshot = await getLagoonSnapshot();
  return NextResponse.json(snapshot, {
    headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=900' },
  });
}
