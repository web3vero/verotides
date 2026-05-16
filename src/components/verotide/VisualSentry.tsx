'use client';

import React, { useEffect, useState } from 'react';

const VisualSentry = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const container = document.getElementById('sg-visual-node');
    if (container) {
      container.innerHTML = '';
      const iframe = document.createElement('iframe');
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
    <div className="terminal-box p-4 flex flex-col gap-3 border-primary/20">
      <div className="border-b border-border pb-1 flex justify-between items-center">
        <span className="font-black text-primary tracking-widest flex items-center gap-2 uppercase text-[10px] italic">
          <span className="h-1.5 w-1.5 rounded-full bg-yellow-400 animate-ping"></span>
          Visual_Node :: WABASSO
        </span>
        <span className="text-[9px] text-yellow-400 font-black uppercase">Active_Link</span>
      </div>

      <div className="relative border-2 border-primary/30 bg-black aspect-video overflow-hidden rounded-sm group shadow-[inset_0_0_20px_rgba(0,0,0,1)]">
        {!isLoaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-black">
            <div className="text-primary animate-flicker font-black text-xs tracking-widest uppercase bg-primary/10 px-3 py-1 border border-primary/20">
               [ RECON_INIT ]
            </div>
          </div>
        )}

        <div 
          id="sg-visual-node" 
          className="w-full h-full flex items-center justify-center relative z-0"
        >
           {/* Iframe injected here */}
        </div>
        
        {/* Device Awareness: High-contrast glare reduction */}
        <div className="absolute inset-0 pointer-events-none border-[1px] border-primary/10 mix-blend-overlay"></div>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-1">
          <div className="bg-black/60 border border-primary/20 p-2 rounded-sm text-center">
             <div className="text-[8px] text-primary/60 font-black uppercase mb-1">Visual_Status</div>
             <div className="text-[10px] font-black text-yellow-400 uppercase italic leading-none">Optimal</div>
          </div>
          <a 
            href="https://indianriver.gov/services/natural_resources/coastal_engineering/beach-cam.php" 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-primary/10 border border-primary/40 p-2 rounded-sm text-center flex flex-col items-center justify-center hover:bg-primary/20 transition-all"
          >
            <div className="text-[8px] text-primary/60 font-black uppercase">Direct_Source</div>
            <div className="text-[10px] font-black text-primary uppercase leading-none">Access_Node ↗</div>
          </a>
      </div>
    </div>
  );
};

export default VisualSentry;
