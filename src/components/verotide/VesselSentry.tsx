'use client';

import React, { useState, useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const VERO_BBOX = [
  [27.4, -80.5], 
  [27.9, -80.1]  
];

interface VesselSentryProps {
  center?: [number, number];
  title?: string;
}

const VesselSentry = ({ center = [-80.3973, 27.6386], title = 'VERO_BEACH_SECTOR // GRID_07' }: VesselSentryProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const socket = useRef<WebSocket | null>(null);
  const markers = useRef<{ [mmsi: number]: mapboxgl.Marker }>({});
  const ghostMarkers = useRef<mapboxgl.Marker[]>([]);
  const beaconMarker = useRef<mapboxgl.Marker | null>(null);
  
  const [useLiveFeed] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState('CONNECTING');
  const [vesselCount, setVesselCount] = useState(0);

  useEffect(() => {
    if (map.current || !mapContainer.current) return;
    const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
    if (!token) return;
    mapboxgl.accessToken = token;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: center,
      zoom: 11,
      attributionControl: false
    });

    map.current.on('load', () => {
      if (!map.current) return;
      const beacon = document.createElement('div');
      beacon.className = 'h-4 w-4 bg-primary rounded-full animate-pulse shadow-[0_0_20px_rgba(0,255,65,1)]';
      beaconMarker.current = new mapboxgl.Marker(beacon).setLngLat(center).addTo(map.current);

      for (let i = 0; i < 4; i++) {
        const el = document.createElement('div');
        el.className = 'h-1.5 w-1.5 bg-primary/20 rotate-45 animate-pulse';
        const lat = VERO_BBOX[0][0] + Math.random() * (VERO_BBOX[1][0] - VERO_BBOX[0][0]);
        const lng = VERO_BBOX[0][1] + Math.random() * (VERO_BBOX[1][1] - VERO_BBOX[0][1]);
        const ghost = new mapboxgl.Marker(el).setLngLat([lng, lat]).addTo(map.current);
        ghostMarkers.current.push(ghost);
      }
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (map.current) {
      map.current.flyTo({ center, zoom: 11, duration: 2000 });
      if (beaconMarker.current) {
        beaconMarker.current.setLngLat(center);
      }
    }
  }, [center]);

  useEffect(() => {
    if (!useLiveFeed || !map.current) {
      if (socket.current) {
        socket.current.close();
        socket.current = null;
      }
      return;
    }

    const apiKey = process.env.NEXT_PUBLIC_AIS_KEY;
    if (!apiKey) {
      const timer1 = setTimeout(() => {
        setConnectionStatus('KEY_ERR');
      }, 0);
      return () => clearTimeout(timer1);
    }

    const timer2 = setTimeout(() => {
      setConnectionStatus('SYNCING');
    }, 0);
    socket.current = new WebSocket("wss://stream.aisstream.io/v0/stream");

    socket.current.onopen = () => {
      setConnectionStatus('ACTIVE');
      const subscription = {
        APIKey: apiKey,
        BoundingBoxes: [[VERO_BBOX[0], VERO_BBOX[1]]]
      };
      socket.current?.send(JSON.stringify(subscription));
    };

    socket.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.MessageType === "PositionReport") {
        if (ghostMarkers.current.length > 0) {
          ghostMarkers.current.forEach(m => m.remove());
          ghostMarkers.current = [];
        }

        const mmsi = data.MetaData.MMSI;
        const name = data.MetaData.ShipName || `ID_${mmsi}`;
        const lat = data.Message.PositionReport.Latitude;
        const lng = data.Message.PositionReport.Longitude;
        const sog = data.Message.PositionReport.Sog;
        const cog = data.Message.PositionReport.Cog || 0;

        if (markers.current[mmsi]) {
          markers.current[mmsi].setLngLat([lng, lat]);
        } else {
          const el = document.createElement('div');
          el.className = 'h-3 w-3 bg-yellow-400 rotate-45 shadow-[0_0_15px_rgba(250,204,21,1)] cursor-help group transition-all duration-1000 border border-black/50';
          el.style.transform = `rotate(${cog}deg)`;
          el.innerHTML = `<div class="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-3 bg-black border-2 border-primary p-3 text-[10px] text-primary whitespace-nowrap z-50 font-black uppercase shadow-2xl backdrop-blur-md">
            <div class="text-yellow-400 mb-1 border-b border-primary/20 pb-1">${name}</div>
            <div class="flex justify-between gap-4">
              <span>SPEED:</span>
              <span class="text-white">${sog} KT</span>
            </div>
            <div class="flex justify-between gap-4">
              <span>HEADING:</span>
              <span class="text-white">${cog}°</span>
            </div>
            <div class="mt-1 text-[8px] opacity-40 italic">MMSI: ${mmsi}</div>
          </div>`;
          
          markers.current[mmsi] = new mapboxgl.Marker(el)
            .setLngLat([lng, lat])
            .addTo(map.current!);
          
          setVesselCount(prev => prev + 1);
        }
      }
    };

    return () => {
      if (timer2) clearTimeout(timer2);
      socket.current?.close();
    };
  }, [useLiveFeed]);

  return (
    <div className="terminal-box p-6 flex flex-col gap-4 min-h-[550px] border-primary/20 rounded-xl group relative overflow-hidden">
      <div className="border-b border-border/40 pb-2 flex justify-between items-center z-20">
        <span className="font-black text-primary tracking-[0.3em] flex items-center gap-3 uppercase text-sm italic">
          <span className={`h-2 w-2 rounded-full ${useLiveFeed ? 'bg-primary animate-pulse shadow-[0_0_10px_rgba(0,255,65,0.5)]' : 'bg-red-500'}`}></span>
          COASTAL_RADAR // AIS_STREAM
        </span>
        <div className="bg-primary text-black px-3 py-0.5 text-xs font-black rounded-full shadow-lg flex items-center gap-2">
           <span className="animate-pulse">📡</span> ACTIVE_FLEET: {vesselCount}
        </div>
      </div>

      <div className="flex-1 bg-black border-2 border-primary/20 relative overflow-hidden group/map rounded-lg shadow-[inset_0_0_40px_rgba(0,0,0,1)]">
        <div ref={mapContainer} className="absolute inset-0 grayscale contrast-150 brightness-[0.4] sepia-[0.1]" />
        
        {/* Connection Status Overlay */}
        <div className="absolute top-6 left-6 z-10 transition-transform group-hover/map:scale-105">
          <div className="bg-black/90 border-2 border-primary/40 px-4 py-2 text-[10px] font-black font-mono text-primary shadow-2xl flex items-center gap-3 uppercase tracking-widest backdrop-blur-sm">
            <span className="h-2 w-2 bg-yellow-400 rounded-full animate-ping"></span>
            NETWORK_STATUS: {connectionStatus}
          </div>
        </div>

        {/* Scanline Effect */}
        <div className="absolute inset-0 pointer-events-none opacity-20 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_4px] z-20"></div>
        
        <div className="absolute bottom-6 right-6 text-[10px] font-black font-mono text-primary bg-black/80 p-3 border-2 border-primary/20 z-10 uppercase italic tracking-[0.2em] backdrop-blur-md">
          {title}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-1 z-20">
          <div className="bg-black/80 border-2 border-primary/20 p-3 rounded-lg text-center group/mode relative cursor-help">
             <div className="text-[10px] text-primary/60 font-black uppercase mb-1 tracking-widest">Radar_Mode</div>
             <div className="text-sm font-black text-yellow-400 uppercase italic leading-none">Scanning_Live</div>
             
             {/* Hover Tooltip */}
             <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 bg-primary text-black text-[10px] font-black p-2 rounded opacity-0 group-hover/mode:opacity-100 transition-opacity pointer-events-none z-50 shadow-2xl uppercase tracking-tighter">
                Direct AIS satellite relay. 5-second polling interval.
             </div>
          </div>
          <button 
            className="bg-primary/10 border-2 border-primary/40 p-3 rounded-lg text-center hover:bg-primary text-black transition-all font-black text-primary uppercase text-xs tracking-widest shadow-sm"
            onClick={() => {
               map.current?.flyTo({ center, zoom: 11, duration: 2000 });
            }}
          >
            RESET_GRID_VIEW
          </button>
      </div>
    </div>
  );
};

export default VesselSentry;
