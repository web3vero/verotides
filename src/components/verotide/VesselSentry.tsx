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
  const ghostMarkers = useRef<mapboxgl.Marker[]>([]);
  
  const [useLiveFeed, setUseLiveFeed] = useState(true); // Autostart enabled
  const [connectionStatus, setConnectionStatus] = useState('INITIALIZING...');
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
      
      // Center Point Beacon
      const beacon = document.createElement('div');
      beacon.className = 'h-4 w-4 bg-primary rounded-full animate-pulse shadow-[0_0_15px_rgba(0,255,65,1)]';
      new mapboxgl.Marker(beacon).setLngLat(VERO_CENTER).addTo(map.current);

      // Create Ghost Traffic (Simulated markers) while loading
      for (let i = 0; i < 5; i++) {
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

    setConnectionStatus('SYNCING...');
    socket.current = new WebSocket("wss://stream.aisstream.io/v0/stream");

    socket.current.onopen = () => {
      setConnectionStatus('SECURE_LINK_ACTIVE');
      const subscription = {
        APIKey: apiKey,
        BoundingBoxes: [[VERO_BBOX[0], VERO_BBOX[1]]]
      };
      socket.current?.send(JSON.stringify(subscription));
    };

    socket.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.MessageType === "PositionReport") {
        // Clear ghost traffic on first real packet
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
          el.className = 'h-2 w-2 bg-yellow-400 rotate-45 shadow-[0_0_8px_rgba(250,204,21,0.9)] cursor-pointer group transition-all duration-1000';
          el.style.transform = `rotate(${cog}deg)`;
          el.innerHTML = `<div class="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-black border border-primary p-2 text-[8px] text-primary whitespace-nowrap z-20 font-black uppercase shadow-xl">${name}<br/>SPD: ${sog}KT</div>`;
          
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
    <div className="terminal-box p-4 flex flex-col gap-4 min-h-[500px] border-primary/30">
      <div className="border-b border-border pb-1 flex justify-between items-center">
        <span className="font-black text-primary tracking-widest flex items-center gap-2 uppercase text-xs italic">
          <span className={`h-2 w-2 rounded-full ${useLiveFeed ? 'bg-primary animate-pulse shadow-[0_0_10px_rgba(0,255,65,0.5)]' : 'bg-red-500'}`}></span>
          Coastal_Radar :: {useLiveFeed ? 'AIS_STREAM_SYNC' : 'RADAR_OFFLINE'}
        </span>
        <div className="flex gap-4 items-center">
           <div className="flex flex-col items-end">
              <span className="text-[9px] text-yellow-400 font-black uppercase">Fleet_Count: {vesselCount}</span>
              <span className="text-[8px] opacity-40 uppercase">Vero_Sector_07</span>
           </div>
        </div>
      </div>

      <div className="flex-1 bg-black border-2 border-primary/20 relative overflow-hidden group rounded-sm shadow-[inset_0_0_20px_rgba(0,0,0,1)]">
        <div ref={mapContainer} className="absolute inset-0 grayscale contrast-125 brightness-50 sepia-[.1]" />
        
        {/* Connection Status Overlay */}
        <div className="absolute top-4 left-4 z-10 animate-in fade-in duration-1000">
          <div className="bg-black/90 border-2 border-primary/40 px-3 py-1.5 text-[9px] font-black font-mono text-primary shadow-lg flex items-center gap-2">
            <span className="h-1.5 w-1.5 bg-yellow-400 rounded-full animate-ping"></span>
            INTEL_STATUS: {connectionStatus}
          </div>
        </div>

        {/* Scanline Mask for Radar Feel */}
        <div className="absolute inset-0 pointer-events-none opacity-20 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(0,255,65,0.03),rgba(0,0,0,0.02),rgba(0,255,65,0.03))] bg-[length:100%_4px,4px_100%] z-20"></div>
        
        <div className="absolute bottom-4 right-4 text-[9px] font-black font-mono text-primary bg-black/80 p-2 border border-primary/20 z-10 uppercase tracking-tighter italic">
          Vero_Beach :: 27.6386_N / 80.3973_W
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-auto">
        <button 
          onClick={() => {
            Object.values(markers.current).forEach(m => m.remove());
            markers.current = {};
            setVesselCount(0);
            setUseLiveFeed(!useLiveFeed);
          }}
          className={`text-[10px] border-2 py-2 transition-all uppercase font-black ${useLiveFeed ? 'bg-red-950/20 text-red-500 border-red-500/30 hover:bg-red-500 hover:text-black' : 'border-primary/40 text-primary hover:bg-primary/20'}`}
        >
          {useLiveFeed ? 'REBOOT_RADAR' : 'INITIALIZE_STREAM'}
        </button>
        <button 
          className="text-[10px] border-2 border-primary/40 py-2 hover:bg-primary/20 transition-all uppercase font-black text-primary/80"
          onClick={() => {
             map.current?.flyTo({ center: VERO_CENTER, zoom: 11, duration: 2000 });
          }}
        >
          RESET_VIEWPORT
        </button>
      </div>
    </div>
  );
};

export default VesselSentry;
