import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat') || '27.6386';
  const lon = searchParams.get('lon') || '-80.3973';
  const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
  const tz = '-5'; // Eastern Time

  const url = `https://api.solunar.org/solunar/${lat},${lon},${date},${tz}`;

  try {
    const res = await fetch(url, {
      next: { revalidate: 3600 } // Cache for 1 hour
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch solunar data' }, { status: 500 });
  }
}
