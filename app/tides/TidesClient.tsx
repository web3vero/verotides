'use client';
import dynamic from 'next/dynamic';

const TideWidget = dynamic(() => import('@/components/verotide/TideWidget'), { ssr: false });

export default function TidesClient() {
  return <TideWidget />;
}
