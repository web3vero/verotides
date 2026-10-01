import { NextResponse } from 'next/server';
import { getInletSnapshot } from '@/lib/verotide/inlet';

// GET /api/verotide/inlet -> InletSnapshot JSON (Fort Pierce Inlet).
// Informational data only: no go/no-go score. Never throws; problems appear in `errors`.
// Buoy data changes every ~30 min, so 5 min at the edge + 10 min stale-while-revalidate.
export async function GET() {
  const snapshot = await getInletSnapshot();
  return NextResponse.json(snapshot, {
    headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' },
  });
}
