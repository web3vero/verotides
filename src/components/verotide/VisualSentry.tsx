'use client';

import React, { useEffect, useState } from 'react';

const VisualSentry = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Force a small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      const container = document.getElementById('sgWidget');
      if (container) {
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
    <div className="terminal-box p-4 flex flex-col gap-4">
      <div className="border-b border-border pb-1 flex justify-between items-center">
        <span className="font-bold text-primary tracking-widest flex items-center gap-2 uppercase">
          <span className="h-2 w-2 rounded-full bg-primary animate-pulse"></span>
          Visual_Sentry [Vero_Beach_Node]
        </span>
        <span className="text-[10px] opacity-50 italic">NODE: WABASSO_BEACH_CAM</span>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {/* Primary Active Feed: Wabasso Beach */}
        <div className="relative border-2 border-primary bg-black min-h-[400px] overflow-hidden rounded-sm group shadow-[0_0_20px_rgba(0,255,65,0.15)]">
          {/* High-Contrast Label Overlay */}
          <div className="absolute top-0 left-0 bg-primary text-black px-3 py-1 text-[10px] z-20 font-black tracking-tighter uppercase">
            LIVE_FEED :: WABASSO_BCH_AUTOSTART
          </div>

          {/* Autostart/Overlay Hint */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
             {!isLoaded && <div className="text-primary animate-flicker font-mono text-sm">[ INITIALIZING_OPTICS... ]</div>}
             <div className="text-[8px] text-primary/20 mt-4 uppercase">Direct_Stream_Inject_Active</div>
          </div>

          {/* Surf Guru Container */}
          <div id="sgWidget" className="w-full h-full flex items-center justify-center relative z-0">
             {/* The script will inject the iframe here */}
          </div>
          
          {/* Action Overlay */}
          <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
            <a 
              href="https://indianriver.gov/services/natural_resources/coastal_engineering/beach-cam.php" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-primary text-black px-4 py-2 text-[10px] font-black hover:bg-white transition-all font-mono uppercase shadow-lg"
            >
              Link_Direct_Source
            </a>
          </div>

          {/* Device Awareness: Glare reduction mask */}
          <div className="absolute inset-0 pointer-events-none border-[1px] border-primary/10 mix-blend-overlay"></div>
        </div>

        {/* Secondary Info Layer for Device/Location Context */}
        <div className="bg-primary/5 border border-primary/20 p-3 rounded flex justify-between items-center">
            <div className="flex gap-4">
                <div className="text-[10px]">
                    <div className="opacity-40 uppercase">Surf_Height:</div>
                    <div className="text-primary font-bold">2-3 FT [FAIR]</div>
                </div>
                <div className="text-[10px]">
                    <div className="opacity-40 uppercase">Visibility:</div>
                    <div className="text-primary font-bold">UNRESTRICTED</div>
                </div>
            </div>
            <div className="text-[10px] text-primary text-right italic uppercase">
                Vero_Node_Active
            </div>
        </div>
      </div>
    </div>
  );
};

export default VisualSentry;
