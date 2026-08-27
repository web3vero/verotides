import { NextResponse } from 'next/server';
import { getTidePredictions } from '@/lib/verotide/data';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const stationId = searchParams.get('station') || '8722125';
  const dateParam = searchParams.get('date') || 'today';

  try {
    const data = await getTidePredictions(stationId, dateParam);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch tide data' }, { status: 500 });
  }
}
