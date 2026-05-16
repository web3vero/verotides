'use client';

import React, { useState, useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Vero Beach Coordinates
const VERO_CENTER: [number, number] = [-80.3973, 27.6386];

// Bounding box for Vero Beach Area [[lat, lon], [lat, long]]
const VERO_BBOX = [
  [27.4, -80.5], // Bottom Left
  [27.9, -80.1]  // Top Right
];

const VesselSentry = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const socket = useRef<WebSocket | null>(null);
  const markers = useRef<{ [mmsi: number]: mapboxgl.Marker }>({});
  
  const [useLiveFeed, setUseLiveFeed] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('STANDBY');
  const [vesselCount, setVesselCount] = useState(0);

  // Initialize Map
  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
    if (!token) return;

    mapboxgl.accessToken = token;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: VERO_CENTER,
      zoom: 11,
      attributionControl: false
    });

    map.current.on('load', () => {
      if (!map.current) return;
      
      const beacon = document.createElement('div');
      beacon.className = 'h-4 w-4 bg-primary rounded-full animate-pulse shadow-[0_0_15px_rgba(0,255,65,1)]';
      new mapboxgl.Marker(beacon).setLngLat(VERO_CENTER).addTo(map.current);
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Handle WebSocket Connection
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
      setConnectionStatus('KEY_MISSING');
      return;
    }

    setConnectionStatus('CONNECTING...');
    socket.current = new WebSocket("wss://stream.aisstream.io/v0/stream");

    socket.current.onopen = () => {
      setConnectionStatus('ENCRYPTED_LINK_ACTIVE');
      const subscription = {
        APIKey: apiKey,
        BoundingBoxes: [[VERO_BBOX[0], VERO_BBOX[1]]]
      };
      socket.current?.send(JSON.stringify(subscription));
    };

    socket.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.MessageType === "PositionReport") {
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
          el.className = 'h-2 w-2 bg-primary rotate-45 shadow-[0_0_5px_rgba(0,255,65,0.8)] cursor-pointer group';
          el.style.transform = `rotate(${cog}deg)`;
          el.innerHTML = `<div class="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-black border border-primary p-1 text-[8px] text-primary whitespace-nowrap z-20">${name}<br/>${sog}kt</div>`;
          
          markers.current[mmsi] = new mapboxgl.Marker(el)
            .setLngLat([lng, lat])
            .addTo(map.current!);
          
          setVesselCount(prev => prev + 1);
        }
      }
    };

    socket.current.onerror = (err) => {
      console.error('AIS_WS_ERROR', err);
      setConnectionStatus('LINK_ERROR');
    };

    socket.current.onclose = () => {
      setConnectionStatus('LINK_TERMINATED');
    };

    return () => {
      socket.current?.close();
    };
  }, [useLiveFeed]);

  return (
    <div className="terminal-box p-4 flex flex-col gap-4 min-h-[500px]">
      <div className="border-b border-border pb-1 flex justify-between items-center">
        <span className="font-bold text-primary tracking-widest flex items-center gap-2 uppercase">
          <span className={`h-2 w-2 rounded-full ${useLiveFeed ? 'bg-primary animate-pulse' : 'bg-yellow-500'}`}></span>
          Coastal_Radar :: {useLiveFeed ? 'AIS_LIVE' : 'IDLE'}
        </span>
        <div className="flex gap-2 items-center">
           <span className="text-[8px] opacity-50 uppercase">Fleet_Count: {vesselCount}</span>
           <span className="text-[10px] text-primary/60 italic">Vero_Coastline</span>
        </div>
      </div>

      <div className="flex-1 bg-black border border-primary/20 relative overflow-hidden group rounded-sm">
        <div ref={mapContainer} className="absolute inset-0 grayscale contrast-125 brightness-75" />
        
        {/* Connection Status Overlay */}
        <div className="absolute top-4 left-4 z-10">
          <div className="bg-black/80 border border-primary/40 px-2 py-1 text-[8px] font-mono text-primary">
            SYSTEM_STATUS: {connectionStatus}
          </div>
        </div>

        <div className="absolute inset-0 pointer-events-none border-[10px] border-black/10 rounded-inner shadow-inner"></div>
        
        <div className="absolute bottom-4 right-4 text-[8px] font-mono text-primary bg-black/80 p-1 border border-primary/20 z-10">
          NODE_07 :: 27.6386, -80.3973
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-auto">
        <button 
          onClick={() => {
            // Clear markers when toggling
            Object.values(markers.current).forEach(m => m.remove());
            markers.current = {};
            setVesselCount(0);
            setUseLiveFeed(!useLiveFeed);
          }}
          className={`text-[10px] border border-primary/40 py-1 transition-all uppercase font-bold ${useLiveFeed ? 'bg-red-950/20 text-red-500 border-red-500/50 hover:bg-red-500 hover:text-black' : 'hover:bg-primary/20 text-primary'}`}
        >
          {useLiveFeed ? 'TERMINATE_LINK' : 'INITIALIZE_AIS_STREAM'}
        </button>
        <button 
          className="text-[10px] border border-primary/40 py-1 hover:bg-primary/20 transition-all uppercase"
          onClick={() => {
             map.current?.flyTo({ center: VERO_CENTER, zoom: 11 });
          }}
        >
          RESET_VIEWPORT
        </button>
      </div>
    </div>
  );
};

export default VesselSentry;
