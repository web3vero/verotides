'use client';

import React, { useEffect } from 'react';

const VisualSentry = () => {
  useEffect(() => {
    // Dynamically load Surf Guru widget script
    const script = document.createElement('script');
    script.src = 'https://www.surfguru.com/widscript?widget=140';
    script.async = true;
    
    // Append to the specific container instead of head to help with React lifecycle
    const container = document.getElementById('sgWidget');
    if (container) {
      container.appendChild(script);
    }

    return () => {
      // Cleanup script if component unmounts
      if (container && container.contains(script)) {
        container.removeChild(script);
      }
    };
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
        <div className="relative border border-primary/40 bg-black min-h-[300px] overflow-hidden rounded-sm group">
          {/* Label Overlay */}
          <div className="absolute top-2 left-2 bg-black/80 border border-primary/60 px-2 py-1 text-[8px] text-primary z-20 font-bold tracking-tighter">
            LIVE_FEED :: WABASSO_BCH_140
          </div>

          {/* Surf Guru Container */}
          <div id="sgWidget" className="w-full h-full flex items-center justify-center">
             <div className="text-[10px] opacity-30 animate-pulse font-mono">INITIALIZING_OPTICS...</div>
          </div>
          
          {/* Action Overlay */}
          <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
            <a 
              href="https://indianriver.gov/services/natural_resources/coastal_engineering/beach-cam.php" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-black border border-primary px-3 py-1 text-[8px] hover:bg-primary hover:text-black transition-all font-mono"
            >
              SOURCE: IRC_GOV
            </a>
          </div>

          {/* CRT Overlay Effects */}
          <div className="absolute inset-0 pointer-events-none border-[10px] border-black/20 mix-blend-overlay"></div>
        </div>

        {/* Secondary Feeds (Offline/Encrypted as per "only cam in use" directive) */}
        <div className="grid grid-cols-2 gap-4 opacity-40">
          <div className="border border-primary/10 bg-black aspect-video flex flex-col items-center justify-center relative">
            <div className="text-[10px] text-primary/40 font-mono italic">SEBASTIAN_INLET</div>
            <div className="text-[8px] border border-primary/20 px-1 mt-1 text-red-900">ENCRYPTED</div>
          </div>
          <div className="border border-primary/10 bg-black aspect-video flex flex-col items-center justify-center relative">
            <div className="text-[10px] text-primary/40 font-mono italic">REEF_RESORT</div>
            <div className="text-[8px] border border-primary/20 px-1 mt-1 text-red-900">ENCRYPTED</div>
          </div>
        </div>
      </div>

      <div className="text-[10px] opacity-40 border-t border-border/20 pt-2 italic leading-tight">
        TACTICAL_NOTE: Wabasso Beach Cam is maintained by IRC Natural Resources. 
        Turtle Nesting Protocol [LIGHTS_OUT] remains in effect for Node_07.
      </div>
    </div>
  );
};

export default VisualSentry;
