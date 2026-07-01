'use client';

import { useRef, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

const VesselSentry = dynamic(() => import('./VesselSentry'), { ssr: false });

interface Props {
  center?: [number, number];
  title?: string;
}

export default function LazyVesselSentry({ center, title }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [triggered, setTriggered] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTriggered(true);
          observer.disconnect();
        }
      },
      { rootMargin: '300px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="h-[300px] w-full">
      {triggered ? (
        <VesselSentry center={center} title={title} />
      ) : (
        <div className="h-[300px] w-full border border-primary/20 bg-black flex items-center justify-center font-mono text-primary/40 text-[10px] tracking-widest uppercase animate-pulse">
          VESSEL RADAR — STANDBY
        </div>
      )}
    </div>
  );
}
