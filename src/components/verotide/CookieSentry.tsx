'use client';

import React, { useState } from 'react';
import { setCookie, getCookie } from 'cookies-next';

const CookieSentry = () => {
  const [isVisible, setIsVisible] = useState(
    () => typeof window !== 'undefined' && !getCookie('VERO_TACTICAL_CONSENT')
  );

  const handleAccept = () => {
    setCookie('VERO_TACTICAL_CONSENT', 'GRANTED_FULL', { maxAge: 60 * 60 * 24 * 400 });
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 z-[9999] max-w-md w-full animate-in fade-in slide-in-from-bottom-10 duration-700">
      <div className="terminal-box bg-black/95 border-2 border-primary p-5 shadow-[0_0_40px_rgba(0,255,65,0.2)] rounded-lg">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary">
             <span className="text-primary text-xl">🌐</span>
          </div>
          <div>
            <h3 className="text-primary font-bold text-sm tracking-tight uppercase">Command Center Optimization</h3>
            <p className="text-[9px] text-primary/60 font-mono italic uppercase">Session Persistence Protocol</p>
          </div>
        </div>
        
        <div className="text-xs text-white/90 font-mono leading-relaxed mb-6">
          <p>We use cookies to synchronize your hyper-local settings and maritime intelligence feeds. By entering the hub, you acknowledge our high-persistence session tracking designed for Vero Beach coastal operations.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button 
            onClick={handleAccept}
            className="flex-1 bg-primary text-black font-black py-3 text-xs hover:bg-white transition-all uppercase rounded shadow-[0_0_10px_rgba(0,255,65,0.5)] active:scale-95"
          >
            Enter Command Center
          </button>
          <button 
            onClick={handleAccept}
            className="px-6 border border-primary/40 text-primary/80 py-3 text-[10px] hover:bg-primary/10 transition-all uppercase rounded font-bold"
          >
            Acknowledge
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieSentry;
