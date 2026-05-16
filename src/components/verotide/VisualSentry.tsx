'use client';

import React, { useEffect, useState } from 'react';

const VisualSentry = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      const container = document.getElementById('sgWidget');
      if (container) {
        container.innerHTML = '';
        const script = document.createElement('script');
        script.src = 'https://www.surfguru.com/widscript?widget=140';
        script.async = true;
        script.onload = () => setIsLoaded(true);
        container.appendChild(script);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="terminal-box p-3 flex flex-col gap-2">
      <div className="border-b border-border pb-1 flex justify-between items-center">
        <span className="font-bold text-primary tracking-widest flex items-center gap-2 uppercase text-[10px]">
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse"></span>
          Visual_Sentry [Wabasso]
        </span>
        <span className="text-[9px] text-yellow-400 font-black italic uppercase">Autostart_Active</span>
      </div>

      <div className="relative border-2 border-primary bg-black aspect-video overflow-hidden rounded-sm group shadow-[0_0_20px_rgba(0,255,65,0.15)]">
        {/* Simplified Overlay */}
        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/80">
            <div className="text-primary animate-flicker font-black text-xs uppercase">[ INITIALIZING_OPTICS ]</div>
          </div>
        )}

        {/* Surf Guru Container - Focused on just the video frame */}
        <div 
          id="sgWidget" 
          className="w-full h-full flex items-center justify-center relative z-0 scale-110 origin-center"
        >
           {/* The script will inject the iframe here */}
        </div>
        
        {/* Device Awareness: High-contrast glare reduction */}
        <div className="absolute inset-0 pointer-events-none border-[1px] border-primary/10 mix-blend-overlay"></div>
      </div>

      <div className="flex justify-between items-center px-1">
          <div className="text-[9px] text-primary/40 uppercase font-mono italic">Sector: 32963_North</div>
          <a 
            href="https://indianriver.gov/services/natural_resources/coastal_engineering/beach-cam.php" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-[9px] text-yellow-400 font-bold hover:text-white transition-all uppercase underline underline-offset-2"
          >
            Direct_Source
          </a>
      </div>
    </div>
  );
};

export default VisualSentry;
