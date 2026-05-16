import { NextResponse } from 'next/server';

export async function GET() {
  const url = `https://api.weather.gov/gridpoints/MLB/50,78/forecast`;

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': '(verotides.com, foleys.assistant@pm.me)'
      },
      next: { revalidate: 3600 } // Cache for 1 hour
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch weather data' }, { status: 500 });
  }
}
