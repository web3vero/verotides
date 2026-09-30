'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

// Click-to-load player for PUBLIC-DOMAIN image feeds only (the server page decides that via canEmbed()).
//
// Why a "facade"? Until the visitor clicks, we render only a static box with a button.
// No request is made to the source server, which keeps the page fast and avoids loading
// a large image (the radar GIF is ~1 MB) for people who never wanted it.
//
// Why a fixed aspect-ratio box? The box has its final size from the very first paint, so when
// the image arrives nothing moves (no Cumulative Layout Shift).
//
// We never copy the image: the <img> points at the source's own URL, so the visitor's browser
// downloads it straight from NOAA/NWS. Verotides stores and records nothing.

interface CamPlayerProps {
  name: string; // used for alt text / aria labels
  imageUrl: string; // the source image URL (public-domain feeds only)
  aspect: string; // CSS aspect-ratio, e.g. '1 / 1'
  refreshSeconds: number; // how often the source publishes a new frame
  operator: string; // shown in the facade and the offline message
  sourceUrl: string; // operator page, offered when the image is unavailable
}

type Status = 'idle' | 'loading' | 'ready' | 'offline';

// Adds a throwaway query parameter so the browser fetches a fresh copy instead of reusing its cache.
function withCacheBust(url: string, stamp: number): string {
  return `${url}${url.includes('?') ? '&' : '?'}_=${stamp}`;
}

export default function CamPlayer({ name, imageUrl, aspect, refreshSeconds, operator, sourceUrl }: CamPlayerProps) {
  const [status, setStatus] = useState<Status>('idle');
  // `stamp` of 0 means "use the plain URL"; any other value is a cache-buster from a refresh.
  const [stamp, setStamp] = useState(0);
  const [lastLoaded, setLastLoaded] = useState<Date | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  // Tracks whether the player is actually on screen. Auto-refresh only runs while it is.
  const [inView, setInView] = useState(true);

  // Watch the box with IntersectionObserver so we can pause refreshes when scrolled away.
  useEffect(() => {
    const el = boxRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const refresh = useCallback(() => {
    setStatus('loading');
    setStamp(Date.now());
  }, []);

  // Auto-refresh: only AFTER the visitor has interacted (status no longer 'idle'), only while the tab is
  // visible and the box is on screen, and never while the image is known to be offline.
  useEffect(() => {
    if (status === 'idle' || status === 'offline' || !inView) return;
    const id = window.setInterval(() => {
      if (document.visibilityState === 'visible') refresh();
    }, refreshSeconds * 1000);
    return () => window.clearInterval(id);
  }, [status, inView, refreshSeconds, refresh]);

  const src = stamp === 0 ? imageUrl : withCacheBust(imageUrl, stamp);

  return (
    <div className="font-mono">
      {/* Fixed-aspect box: reserves space so nothing shifts when the image loads. */}
      <div
        ref={boxRef}
        className="relative w-full overflow-hidden rounded-lg border border-primary/30 bg-black/70"
        style={{ aspectRatio: aspect }}
      >
        {status === 'idle' && (
          <button
            type="button"
            onClick={() => setStatus('loading')}
            className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-primary hover:bg-primary/10 transition-colors"
          >
            <span className="text-lg font-black uppercase tracking-widest">Load latest image</span>
            <span className="text-[10px] text-white/50 uppercase tracking-widest">From {operator}</span>
          </button>
        )}

        {status !== 'idle' && status !== 'offline' && (
          // Plain <img>: the source is a third-party host we deliberately do not proxy or optimize.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={src}
            src={src}
            alt={`${name}: latest image`}
            className={`absolute inset-0 h-full w-full object-contain transition-opacity ${
              status === 'ready' ? 'opacity-100' : 'opacity-40'
            }`}
            referrerPolicy="no-referrer"
            decoding="async"
            onLoad={() => {
              setStatus('ready');
              setLastLoaded(new Date());
            }}
            // A broken/blocked/404 image becomes a friendly message instead of a broken-image icon.
            onError={() => setStatus('offline')}
          />
        )}

        {status === 'loading' && (
          <span className="absolute left-2 top-2 rounded bg-black/70 px-2 py-1 text-[10px] uppercase tracking-widest text-white/70">
            Loading...
          </span>
        )}

        {status === 'offline' && (
          <div role="status" className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4 text-center">
            <span className="text-sm font-bold uppercase tracking-widest text-yellow-400">Camera currently offline</span>
            <span className="text-xs text-white/60">
              {operator} is not serving an image right now. This is common and usually temporary.
            </span>
            <a
              href={sourceUrl}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="text-xs text-primary underline"
            >
              Check the source page
            </a>
          </div>
        )}
      </div>

      {/* Controls + status line live OUTSIDE the image box so the box size never changes. */}
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[10px] uppercase tracking-widest text-white/50">
        <span aria-live="polite">
          {status === 'ready' && lastLoaded
            ? `Loaded ${lastLoaded.toLocaleTimeString('en-US', { timeZone: 'America/New_York' })} ET. Auto-refreshes about every ${Math.round(refreshSeconds / 60)} min while visible.`
            : status === 'idle'
              ? 'Nothing is loaded until you click.'
              : status === 'offline'
                ? 'Image unavailable.'
                : 'Fetching from source...'}
        </span>
        {status !== 'idle' && (
          <button
            type="button"
            onClick={refresh}
            className="border border-primary/40 px-3 py-1 text-primary hover:bg-primary hover:text-black transition-colors"
          >
            Refresh
          </button>
        )}
      </div>
    </div>
  );
}
