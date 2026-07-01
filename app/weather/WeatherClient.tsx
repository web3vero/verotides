'use client';
import dynamic from 'next/dynamic';

const BeachSentryWidget = dynamic(() => import('@/components/verotide/BeachSentryWidget'), { ssr: false });

export default function WeatherClient() {
  return <BeachSentryWidget />;
}
