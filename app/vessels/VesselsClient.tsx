'use client';
import dynamic from 'next/dynamic';

const VesselSentry = dynamic(() => import('@/components/verotide/VesselSentry'), { ssr: false });

export default function VesselsClient() {
  return <VesselSentry />;
}
