import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const bbox = searchParams.get('bbox') || '-80.5,27.5,-80.0,27.8'; // Area around Vero
  
  // Note: aisstream.io requires WebSocket for live data, 
  // but we can use their API for static/historic lookups if needed.
  // For the MVP, we'll provide instructions for the WebSocket handshake.
  
  return NextResponse.json({ 
    status: 'Operational',
    connection: 'wss://stream.aisstream.io/v0/stream',
    instructions: 'Client-side WebSocket connection required with API key.'
  });
}
