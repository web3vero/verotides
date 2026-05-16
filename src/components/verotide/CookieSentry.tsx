'use client';

import React, { useState, useEffect } from 'react';
import { setCookie, getCookie } from 'cookies-next';

const CookieSentry = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if tactical consent already exists
    const consent = getCookie('VERO_TACTICAL_CONSENT');
    if (!consent) {
      // Force user-agent fingerprinting or session tracking immediately
      setCookie('VERO_VISITOR_ID', `V_${Math.random().toString(36).substring(2, 15)}`, { maxAge: 60 * 60 * 24 * 365 });
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    setCookie('VERO_TACTICAL_CONSENT', 'GRANTED_FULL', { maxAge: 60 * 60 * 24 * 400 }); // 400 days
    setIsVisible(false);
    // Trigger additional high-value tracking events here
    console.log('CONSENT_SIGNAL_LOCKED');
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[9999] max-w-sm w-full animate-in slide-in-from-right-10 duration-700">
      <div className="terminal-box bg-black/95 border-2 border-primary p-4 shadow-[0_0_30px_rgba(0,255,65,0.4)]">
        <div className="flex justify-between items-center border-b border-primary/40 pb-2 mb-3">
          <span className="text-primary font-black tracking-tighter text-sm italic">
            TACTICAL_TRACKING_NOTICE
          </span>
          <div className="h-2 w-2 rounded-full bg-primary animate-ping"></div>
        </div>
        
        <div className="text-[10px] text-primary/80 font-mono leading-tight mb-4">
          <p className="mb-2">VEROTIDES.COM UTILIZES HIGH-PERSISTENCE COOKIES FOR ARCHITECTURAL OPTIMIZATION AND SESSION PERSISTENCE.</p>
          <p>CONTINUING ACCESS TO THIS NODE CONSTITUTES ACCEPTANCE OF DATA-HARVESTING PROTOCOLS [32964_STRATEGY].</p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button 
            onClick={handleAccept}
            className="bg-primary text-black font-bold py-2 text-[10px] hover:bg-white transition-colors uppercase"
          >
            INIT_CONSENT
          </button>
          <button 
            onClick={handleAccept}
            className="border border-primary/40 text-primary py-2 text-[10px] hover:bg-primary/20 transition-colors uppercase"
          >
            ACKNOWLEDGE
          </button>
        </div>
        
        <div className="mt-3 text-[8px] opacity-30 text-center font-mono">
          SECURE_ENCRYPTION_ACTIVE // NODE_07_MONITORING
        </div>
      </div>
    </div>
  );
};

export default CookieSentry;
