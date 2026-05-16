'use client';

import React, { useEffect, useState } from 'react';

const VisualSentry = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Force a small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      const container = document.getElementById('sgWidget');
      if (container) {
        // Clear any existing children to prevent double-loading
        container.innerHTML = '';
        const script = document.createElement('script');
        script.src = 'https://www.surfguru.com/widscript?widget=140';
        script.async = true;
        script.onload = () => {
          setIsLoaded(true);
          // High-level hack: Surf Guru widget injects an iframe. 
          // We can try to force it to expand but cross-origin limits apply.
        };
        container.appendChild(script);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="terminal-box p-4 flex flex-col gap-4">
      <div className="border-b border-border pb-1 flex justify-between items-center">
        <span className="font-bold text-primary tracking-widest flex items-center gap-2 uppercase">
          <span className="h-2 w-2 rounded-full bg-primary animate-pulse"></span>
          Visual_Sentry [Vero_Beach_Node]
        </span>
        <span className="text-[10px] text-yellow-400 font-black italic uppercase">STATUS: ACTIVE_FEED</span>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {/* Primary Active Feed: Wabasso Beach - Increased size for desktop recon */}
        <div className="relative border-4 border-primary bg-black min-h-[500px] overflow-hidden rounded-sm group shadow-[0_0_30px_rgba(0,255,65,0.2)]">
          {/* High-Contrast Label Overlay */}
          <div className="absolute top-0 left-0 bg-primary text-black px-4 py-2 text-xs z-20 font-black tracking-tighter uppercase shadow-md">
            LIVE_FEED :: WABASSO_BCH_AUTOSTART
          </div>

          {/* Autostart/Overlay Hint */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
             {!isLoaded && (
               <div className="flex flex-col items-center gap-4">
                 <div className="text-primary animate-flicker font-black text-xl tracking-widest uppercase bg-black/60 px-4 py-2 border border-primary">
                    [ INITIALIZING_OPTICS ]
                 </div>
                 <div className="text-[10px] text-yellow-400 font-mono animate-pulse uppercase">
                    Bypassing_Encryption...
                 </div>
               </div>
             )}
          </div>

          {/* Surf Guru Container - We use a large min-height to force the layout */}
          <div id="sgWidget" className="w-full h-full min-h-[500px] flex items-center justify-center relative z-0">
             {/* The script will inject the iframe here */}
          </div>
          
          {/* Action Overlay */}
          <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity z-20">
            <a 
              href="https://indianriver.gov/services/natural_resources/coastal_engineering/beach-cam.php" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-yellow-400 text-black px-6 py-3 text-xs font-black hover:bg-white transition-all font-mono uppercase shadow-[0_0_20px_rgba(250,204,21,0.4)]"
            >
              Link_Direct_Source_Node
            </a>
          </div>

          {/* Device Awareness: High-contrast glare reduction */}
          <div className="absolute inset-0 pointer-events-none border-[1px] border-primary/20 mix-blend-overlay"></div>
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/40 to-transparent"></div>
        </div>

        {/* Tactical Info Layer for Mobile/Outdoor Visibility */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-primary/10 border border-primary/40 p-2 rounded text-center">
                <div className="text-[8px] opacity-60 uppercase font-bold">Surf_Height</div>
                <div className="text-sm font-black text-yellow-400">2-3 FT</div>
            </div>
            <div className="bg-primary/10 border border-primary/40 p-2 rounded text-center">
                <div className="text-[8px] opacity-60 uppercase font-bold">Water_Temp</div>
                <div className="text-sm font-black text-primary">79°F</div>
            </div>
            <div className="bg-primary/10 border border-primary/40 p-2 rounded text-center">
                <div className="text-[8px] opacity-60 uppercase font-bold">Visibility</div>
                <div className="text-sm font-black text-primary">HIGH</div>
            </div>
            <div className="bg-primary/10 border border-primary/40 p-2 rounded text-center">
                <div className="text-[8px] opacity-60 uppercase font-bold">Tide_Phase</div>
                <div className="text-sm font-black text-yellow-400">FLOOD</div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default VisualSentry;
