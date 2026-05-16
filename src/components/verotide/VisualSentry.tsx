'use client';

import React, { useEffect, useState } from 'react';

const VisualSentry = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Robust injection for Surf Guru iframe autostart
    const container = document.getElementById('sg-visual-node');
    if (container) {
      container.innerHTML = '';
      const iframe = document.createElement('iframe');
      // Directly pointing to the widget frame source for faster load and better autostart probability
      iframe.src = 'https://www.surfguru.com/widgets/beachcam?widget=140&autostart=true';
      iframe.width = '100%';
      iframe.height = '100%';
      iframe.style.border = 'none';
      iframe.style.overflow = 'hidden';
      iframe.setAttribute('allow', 'autoplay; fullscreen');
      iframe.onload = () => setIsLoaded(true);
      container.appendChild(iframe);
    }
  }, []);

  return (
    <div className="terminal-box p-3 flex flex-col gap-2 border-primary/20">
      <div className="border-b border-border pb-1 flex justify-between items-center">
        <span className="font-black text-primary tracking-widest flex items-center gap-2 uppercase text-[9px] italic">
          <span className="h-1.5 w-1.5 rounded-full bg-yellow-400 animate-ping"></span>
          Visual_Node :: WABASSO_SENTRY
        </span>
        <span className="text-[8px] text-primary/40 font-mono uppercase">Direct_Link_V1.4</span>
      </div>

      <div className="relative border border-primary/30 bg-black aspect-video overflow-hidden rounded-sm group shadow-[0_0_15px_rgba(0,0,0,1)]">
        {/* Initialization Overlay */}
        {!isLoaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-black">
            <div className="text-primary animate-flicker font-black text-[10px] tracking-widest uppercase">
               [ SYNCING_VISUAL_GRID ]
            </div>
            <div className="w-24 h-0.5 bg-primary/20 mt-2 overflow-hidden">
               <div className="h-full bg-primary animate-pulse w-full"></div>
            </div>
          </div>
        )}

        {/* Surf Guru Direct Iframe */}
        <div 
          id="sg-visual-node" 
          className="w-full h-full flex items-center justify-center relative z-0"
        >
           {/* Iframe injected here */}
        </div>
        
        {/* CRT Scanline Mask */}
        <div className="absolute inset-0 pointer-events-none opacity-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_2px] z-20"></div>
      </div>

      <div className="flex justify-between items-center px-1">
          <div className="text-[8px] text-primary/30 uppercase font-mono tracking-tighter">Sector: 32963_N // Optics: Active</div>
          <div className="flex gap-2">
             <span className="text-[8px] text-yellow-400 font-black animate-pulse uppercase">Autostart_Init</span>
          </div>
      </div>
    </div>
  );
};

export default VisualSentry;
