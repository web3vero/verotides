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
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch weather data' }, { status: 500 });
  }
}
