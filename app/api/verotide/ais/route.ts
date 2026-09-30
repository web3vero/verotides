import { NextResponse } from 'next/server';

export async function GET() {
  // Note: aisstream.io requires WebSocket for live data,
  // but we can use their API for static/historic lookups if needed.
  // For the MVP, we'll provide instructions for the WebSocket handshake.
  
  return NextResponse.json({ 
    status: 'Operational',
    connection: 'wss://stream.aisstream.io/v0/stream',
    instructions: 'Client-side WebSocket connection required with API key.'
  }, {
    // Static stub that never changes per request: cache at the CDN for a day so it stops
    // spinning up a cold serverless function (it measured ~1.3s TTFB).
    headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=86400' },
  });
}
