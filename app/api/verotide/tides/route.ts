import { NextResponse } from 'next/server';

export async function GET() {
  const stationId = '8722125'; // Sebastian Inlet
  const url = `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?product=predictions&station=${stationId}&datum=MLLW&time_zone=lst_ldt&units=english&format=json&date=today&interval=hilo`;

  try {
    const res = await fetch(url, {
      next: { revalidate: 300 } // Cache for 5 minutes
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch tide data' }, { status: 500 });
  }
}
