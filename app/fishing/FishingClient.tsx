'use client';
import dynamic from 'next/dynamic';

const BiteTimesWidget = dynamic(() => import('@/components/verotide/BiteTimesWidget'), { ssr: false });

export default function FishingClient() {
  return <BiteTimesWidget />;
}
