import { NextResponse } from 'next/server';

// ipcamlive player — embedded by Reef Ocean Resort (3450 Ocean Dr, Vero Beach)
// VisualSentry now embeds this directly; proxy kept as fallback reference only
const CAM_URL =
  'https://g1.ipcamlive.com/player/player.php?alias=66744cf161841' +
  '&disablezoombutton=1&disabletimelapseplayer=1&disablestorageplayer=1' +
  '&disabledownloadbutton=1&disablenavigation=1&disableuserpause=1';
const BASE = 'https://g1.ipcamlive.com';

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
