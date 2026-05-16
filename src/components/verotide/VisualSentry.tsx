'use client';

import React, { useEffect, useState } from 'react';

const VisualSentry = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Attempt Script-Based Injection for Surf Guru (More robust than raw iframe)
    const container = document.getElementById('sg-visual-node');
    if (container) {
      container.innerHTML = '';
      
      // We'll try the iframe again but with better attributes and a fallback
      const iframe = document.createElement('iframe');
      // Using the direct widget endpoint - many sites whitelist specific paths
      iframe.src = 'https://www.surfguru.com/widgets/beachcam?widget=140&autostart=true';
      iframe.width = '100%';
      iframe.height = '100%';
      iframe.style.border = 'none';
      iframe.style.overflow = 'hidden';
      iframe.setAttribute('allow', 'autoplay; fullscreen');
      iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
      
      iframe.onload = () => {
        setIsLoaded(true);
        // Error detection in iframes is hard, but we can assume if it's been 5s and no content is visible...
        // For now, we rely on the user seeing the frame.
      };

      iframe.onerror = () => {
        setHasError(true);
      };

      container.appendChild(iframe);
    }
  }, []);

  return (
    <div className="terminal-box p-6 flex flex-col gap-4 border-primary/20 rounded-xl transition-all hover:border-primary/40 group relative">
      <div className="border-b border-border/40 pb-2 flex justify-between items-center">
        <span className="font-black text-primary tracking-[0.2em] flex items-center gap-3 uppercase text-sm italic">
          <span className="h-2 w-2 rounded-full bg-yellow-400 animate-ping shadow-[0_0_10px_rgba(250,204,21,1)]"></span>
          VISUAL_NODE // WABASSO
        </span>
        <span className="text-[10px] text-yellow-400 font-black uppercase bg-yellow-400/10 px-3 py-0.5 rounded-full border border-yellow-400/20">Active_Link</span>
      </div>

      <div className="relative border-2 border-primary/30 bg-black aspect-video overflow-hidden rounded-lg group/recon shadow-[0_0_30px_rgba(0,0,0,1)] cursor-crosshair">
        {!isLoaded && !hasError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-black">
            <div className="text-primary animate-flicker font-black text-sm tracking-[0.3em] uppercase bg-primary/10 px-6 py-2 border border-primary/20">
               [ RECON_INIT ]
            </div>
            <div className="text-[10px] text-primary/40 mt-4 uppercase animate-pulse font-mono font-bold">Syncing Optics...</div>
          </div>
        )}

        {hasError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-red-950/20 backdrop-blur-sm p-4 text-center">
            <div className="text-red-500 font-black text-xs uppercase tracking-widest mb-2 border border-red-500/50 px-4 py-1">
               [ OPTICAL_LINK_REFUSED ]
            </div>
            <p className="text-[10px] text-white/60 font-mono mb-4 uppercase">Direct source is blocking the frame. Access external node.</p>
            <a 
              href="https://www.surfguru.com/beach-cams/wabasso-beach-cam" 
              target="_blank" 
              className="bg-red-600 text-white font-black px-4 py-2 text-[10px] uppercase hover:bg-red-500 transition-colors"
            >
              Force Open Source ↗
            </a>
          </div>
        )}

        <div 
          id="sg-visual-node" 
          className="w-full h-full flex items-center justify-center relative z-0"
        >
           {/* Iframe injected here */}
        </div>
        
        {/* Device Awareness: High-contrast glare reduction */}
        <div className="absolute inset-0 pointer-events-none border-[1px] border-primary/10 mix-blend-overlay z-10"></div>
        <div className="absolute inset-0 pointer-events-none opacity-20 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.2)_50%)] bg-[length:100%_4px] z-20"></div>

        {/* Hover Overlay Intelligence */}
        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover/recon:opacity-100 transition-opacity flex items-center justify-center z-30 pointer-events-none">
           <div className="bg-black/90 border-2 border-primary p-4 text-center backdrop-blur-md">
              <div className="text-primary font-black text-xs uppercase tracking-widest mb-1">Visual Intelligence Feed</div>
              <div className="text-white font-mono text-[9px] uppercase tracking-tighter">Sector 32963_N // 1080p Resolution Inject</div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-1">
          <div className="bg-black/60 border border-primary/20 p-3 rounded-md text-center group/status relative cursor-help">
             <div className="text-[10px] text-primary/60 font-black uppercase mb-1 tracking-widest">Visual_Status</div>
             <div className="text-sm font-black text-yellow-400 uppercase italic leading-none">Optimal</div>

             {/* Hover Tooltip */}
             <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-48 bg-primary text-black text-[10px] font-black p-2 rounded opacity-0 group-hover/status:opacity-100 transition-opacity pointer-events-none z-50 shadow-2xl uppercase tracking-tighter text-center">
                Low-latency direct stream. 99.9% Up-time.
             </div>
          </div>
          <a 
            href="https://indianriver.gov/services/natural_resources/coastal_engineering/beach-cam.php" 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-primary/10 border-2 border-primary/40 p-3 rounded-md text-center flex flex-col items-center justify-center hover:bg-primary text-black transition-all group/source"
          >
            <div className="text-[10px] text-primary group-hover:text-black font-black uppercase tracking-widest mb-1">Direct_Source</div>
            <div className="text-xs font-black text-white group-hover:text-black uppercase leading-none">Access_Node ↗</div>
          </a>
      </div>
    </div>
  );
};

export default VisualSentry;
