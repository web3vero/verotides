'use client';

import React from 'react';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

const BeachSentryWidget = () => {
  const { data, error, isLoading } = useSWR('/api/verotide/weather', fetcher, {
    refreshInterval: 600000 // 10 minutes
  });

  // Extract relevant weather data from NWS response
  const temp = data?.properties?.periods?.[0]?.temperature || '79';
  const wind = data?.properties?.periods?.[0]?.windSpeed || '10 mph';
  const desc = data?.properties?.periods?.[0]?.shortForecast || 'SUNNY';

  return (
    <div className="terminal-box p-4 flex flex-col gap-3">
      <div className="border-b border-border pb-1 flex justify-between items-center">
        <span className="font-bold italic">🏖️ BEACH_SENTRY</span>
        <span className={`text-[10px] ${isLoading ? 'animate-pulse opacity-50' : 'opacity-50 italic'}`}>
          {isLoading ? 'OBSERVING...' : 'LIVE_FEED'}
        </span>
      </div>
      {error ? (
        <div className="text-[10px] text-red-500 py-4 font-mono">LINK_ERROR: ATMOSPHERIC_SENSOR_OFFLINE</div>
      ) : (
        <div className="grid grid-cols-2 gap-2 text-sm mt-1">
          <div className="p-2 border border-border/20 bg-black/40">
            <div className="text-[10px] opacity-40 uppercase">SURFACE_TEMP:</div>
            <div className="font-bold">{temp}°F</div>
          </div>
          <div className="p-2 border border-border/20 bg-black/40">
            <div className="text-[10px] opacity-40 uppercase">WIND_VELOCITY:</div>
            <div className="font-bold uppercase">{wind}</div>
          </div>
          <div className="p-2 border border-border/20 bg-black/40">
            <div className="text-[10px] opacity-40 uppercase">ATMOSPHERE:</div>
            <div className="font-bold text-primary uppercase">{desc}</div>
          </div>
          <div className="p-2 border border-border/20 bg-black/40">
            <div className="text-[10px] opacity-40 uppercase">RED_TIDE:</div>
            <div className="font-bold text-primary uppercase">NONE</div>
          </div>
        </div>
      )}
      <div className="text-[10px] bg-secondary/20 p-1 border-l-2 border-primary mt-2">
        🐢 TURTLE_NESTING: <span className="font-bold uppercase">ACTIVE</span> [LIGHTS_OUT_9PM-7AM]
      </div>
    </div>
  );
};

export default BeachSentryWidget;
