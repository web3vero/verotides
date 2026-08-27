import { NextResponse } from 'next/server';

export async function GET() {
  // Note: aisstream.io requires WebSocket for live data,
  // but we can use their API for static/historic lookups if needed.
  // For the MVP, we'll provide instructions for the WebSocket handshake.
  
  return NextResponse.json({ 
    status: 'Operational',
    connection: 'wss://stream.aisstream.io/v0/stream',
    instructions: 'Client-side WebSocket connection required with API key.'
  });
}
