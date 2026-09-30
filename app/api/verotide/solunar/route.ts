import { NextResponse } from 'next/server';
import { getSolunarData } from '@/lib/verotide/data';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = parseFloat(searchParams.get('lat') || '27.6386');
  const lon = parseFloat(searchParams.get('lon') || '-80.3973');
  const now = new Date();

  try {
    const data = getSolunarData(now, lat, lon);
    // Pure math (suncalc) but keyed on the current time, so keep the window short. 5 min is
    // imperceptible for lunar/solar positions and collapses repeat hits onto the CDN.
    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=900' },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to calculate solunar data' }, { status: 500 });
  }
}
