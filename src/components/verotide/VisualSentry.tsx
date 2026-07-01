'use client';

import React, { useState } from 'react';

interface VisualSentryProps {
  nodeKey?: 'VERO_BEACH_SOUTH' | 'SEBASTIAN_INLET';
}

const VisualSentry = ({ nodeKey = 'VERO_BEACH_SOUTH' }: VisualSentryProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const isSebastian = nodeKey === 'SEBASTIAN_INLET';
  const camUrl = isSebastian
    ? 'https://www.video-monitoring.com/beachcams/sebastianinlet/'
    : 'https://g1.ipcamlive.com/player/player.php?alias=66744cf161841' +
      '&disablezoombutton=1&disabletimelapseplayer=1&disablestorageplayer=1' +
      '&disabledownloadbutton=1&disablenavigation=1&disableuserpause=1';

  return (
    <div className="terminal-box p-6 flex flex-col gap-4 border-primary/20 rounded-xl transition-all hover:border-primary/40 group relative">
      <div className="border-b border-border/40 pb-2 flex justify-between items-center">
        <span className="font-black text-primary tracking-[0.2em] flex items-center gap-3 uppercase text-sm italic">
          <span className={`h-2 w-2 rounded-full ${isSebastian ? 'bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-yellow-400 animate-ping shadow-[0_0_10px_rgba(250,204,21,1)]'}`}></span>
          {isSebastian ? 'VISUAL_NODE // SEBASTIAN_INLET' : 'VISUAL_NODE // OCEAN_DRIVE'}
        </span>
        <span className={`text-[10px] font-black uppercase px-3 py-0.5 rounded-full border ${isSebastian ? 'text-red-400 bg-red-400/10 border-red-400/20' : hasError ? 'text-red-500 border-red-500/20 bg-red-500/10' : isLoaded ? 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20' : 'text-primary/50 border-primary/10'}`}>
          {isSebastian ? 'Blocked' : hasError ? 'Offline' : isLoaded ? 'Live' : 'Connecting'}
        </span>
      </div>

      <div className="relative border-2 border-primary/30 bg-black aspect-video overflow-hidden rounded-lg group/recon shadow-[0_0_30px_rgba(0,0,0,1)] cursor-crosshair">
        {isSebastian ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-950/10 p-4 text-center">
            <div className="text-red-400 font-black text-xs uppercase tracking-widest mb-3 border border-red-400/40 px-4 py-2 bg-red-500/5">
              [ OPTICAL_LINK_RESTRICTED ]
            </div>
            <p className="text-[10px] text-white/70 font-mono mb-4 uppercase max-w-[280px] leading-relaxed">
              Direct video feeds for Sebastian Inlet Jetty are restricted from third-party embeds. Launch the official feed externally.
            </p>
            <a
              href={camUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-primary text-black font-black px-5 py-2.5 text-xs uppercase hover:bg-primary/80 transition-all rounded shadow-[0_0_15px_rgba(0,255,65,0.4)] tracking-widest"
            >
              Open Jetty Cam ↗
            </a>
          </div>
        ) : (
          <>
            {!isLoaded && !hasError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-black pointer-events-none">
                <div className="text-primary font-black text-sm tracking-[0.3em] uppercase bg-primary/10 px-6 py-2 border border-primary/20">
                  [ RECON_INIT ]
                </div>
                <div className="text-[10px] text-primary/40 mt-4 uppercase animate-pulse font-mono font-bold">
                  Syncing Optics — Reef Ocean Resort
                </div>
              </div>
            )}

            {hasError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-red-950/20 backdrop-blur-sm p-4 text-center">
                <div className="text-red-500 font-black text-xs uppercase tracking-widest mb-2 border border-red-500/50 px-4 py-1">
                  [ OPTICAL_LINK_REFUSED ]
                </div>
                <p className="text-[10px] text-white/60 font-mono mb-4 uppercase">
                  Stream unavailable. Access cam directly.
                </p>
                <a
                  href="http://reefoceanresort.com/reef-ocean-resort-new-beachcam/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-red-600 text-white font-black px-4 py-2 text-[10px] uppercase hover:bg-red-500 transition-colors"
                >
                  Open Live Cam ↗
                </a>
              </div>
            )}

            <iframe
              src={camUrl}
              className="absolute inset-0 w-full h-full border-0"
              allow="autoplay; fullscreen"
              allowFullScreen
              onLoad={() => setIsLoaded(true)}
              onError={() => setHasError(true)}
              title="Vero Beach Live Cam — Reef Ocean Resort"
            />
          </>
        )}

        {/* Scanline overlay */}
        <div className="absolute inset-0 pointer-events-none border-[1px] border-primary/10 mix-blend-overlay z-10" />
        <div className="absolute inset-0 pointer-events-none opacity-20 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.2)_50%)] bg-[length:100%_4px] z-20" />

        {/* Hover overlay */}
        {!isSebastian && (
          <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover/recon:opacity-100 transition-opacity flex items-center justify-center z-30 pointer-events-none">
            <div className="bg-black/90 border-2 border-primary p-4 text-center backdrop-blur-md">
              <div className="text-primary font-black text-xs uppercase tracking-widest mb-1">Reef Ocean Resort · Live</div>
              <div className="text-white font-mono text-[9px] uppercase tracking-tighter">3450 Ocean Drive · Vero Beach 32963</div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 mt-1">
        <div className="bg-black/60 border border-primary/20 p-3 rounded-md text-center">
          <div className="text-[10px] text-primary/60 font-black uppercase mb-1 tracking-widest">Source</div>
          <div className="text-[10px] font-black text-white/70 uppercase leading-tight">
            {isSebastian ? 'Sebastian Inlet\nState Park' : 'Reef Ocean Resort\n3450 Ocean Dr'}
          </div>
        </div>
        <a
          href={isSebastian ? camUrl : "http://reefoceanresort.com/reef-ocean-resort-new-beachcam/"}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-primary/10 border-2 border-primary/40 p-3 rounded-md text-center flex flex-col items-center justify-center hover:bg-primary transition-all group/source"
        >
          <div className="text-[10px] text-primary group-hover/source:text-black font-black uppercase tracking-widest mb-1">Full_Cam</div>
          <div className="text-xs font-black text-white group-hover/source:text-black uppercase leading-none">Open ↗</div>
        </a>
      </div>
    </div>
  );
};

export default VisualSentry;
