import { NextResponse } from 'next/server';
import { getSolunarData } from '@/lib/verotide/data';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = parseFloat(searchParams.get('lat') || '27.6386');
  const lon = parseFloat(searchParams.get('lon') || '-80.3973');
  const now = new Date();

  try {
    const data = getSolunarData(now, lat, lon);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to calculate solunar data' }, { status: 500 });
  }
}
