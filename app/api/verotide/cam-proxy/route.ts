import { NextResponse } from 'next/server';

const CAM_URL = 'https://www.surfguru.com/widgets/beachcam?widget=140&autostart=true';
const BASE = 'https://www.surfguru.com';

export async function GET() {
  try {
    const res = await fetch(CAM_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/124.0 Safari/537.36',
        'Referer': 'https://verotides.com/',
      },
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      return new NextResponse(`Upstream error: ${res.status}`, { status: 502 });
    }

    let html = await res.text();

    // Rewrite root-relative paths to absolute surfguru URLs
    html = html
      .replace(/(href|src)="\/(?!\/)/g, `$1="${BASE}/`)
      .replace(/(href|src)='\/(?!\/)/g, `$1='${BASE}/`);

    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        // Strip embed-blocking headers — do NOT forward X-Frame-Options or CSP
        'Cache-Control': 'public, max-age=60',
      },
    });
  } catch {
    return new NextResponse('Proxy error', { status: 502 });
  }
}
