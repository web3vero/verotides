'use client';

import { useEffect } from 'react';

interface AdSenseBlockProps {
  slot?: string;
  format?: string;
  responsive?: string;
  style?: React.CSSProperties;
}

export default function AdSenseBlock({
  slot = "4901842851", // Standard slot placeholder or custom slot
  format = "auto",
  responsive = "true",
  style = { display: 'block' }
}: AdSenseBlockProps) {
  useEffect(() => {
    try {
      // Initialize adsbygoogle array and push
      if (typeof window !== 'undefined') {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      }
    } catch (e) {
      console.error('AdSense initialization error:', e);
    }
  }, []);

  return (
    <div className="w-full my-8 py-6 border-y border-primary/10 flex flex-col items-center justify-center bg-zinc-950/40 rounded-xl relative overflow-hidden">
      <div className="absolute top-0 left-0 bg-primary/15 text-primary text-[8px] font-mono uppercase px-2 py-0.5 tracking-wider border-r border-b border-primary/10">
        Sponsored Advertisement
      </div>
      <ins 
        className="adsbygoogle w-full"
        style={style}
        data-ad-client="ca-pub-9867142833785109"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive}
      />
    </div>
  );
}
