'use client';

import React, { useState, useEffect } from 'react';

const CounterIntel = () => {
  const [intelNotice, setIntelIntelNotice] = useState<{ visible: boolean; x: number; y: number }>({ visible: false, x: 0, y: 0 });

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      setIntelIntelNotice({
        visible: true,
        x: e.clientX,
        y: e.clientY
      });

      // Auto-hide after 3 seconds
      setTimeout(() => {
        setIntelIntelNotice(prev => ({ ...prev, visible: false }));
      }, 3000);
    };

    window.addEventListener('contextmenu', handleContextMenu);
    return () => window.removeEventListener('contextmenu', handleContextMenu);
  }, []);

  if (!intelNotice.visible) return null;

  return (
    <div 
      className="fixed z-[10000] animate-in zoom-in-95 duration-200 pointer-events-none"
      style={{ top: intelNotice.y, left: intelNotice.x }}
    >
      <div className="bg-black/95 border-2 border-red-500 p-3 shadow-[0_0_20px_rgba(239,68,68,0.5)] max-w-[200px]">
        <div className="text-[10px] text-red-500 font-bold mb-1 uppercase tracking-tighter border-b border-red-500/30 pb-1">
          ⚠️ COUNTER_INTEL_ALERT
        </div>
        <div className="text-[9px] text-white font-mono leading-tight">
          RIGHT_CLICK_INTERCEPTED.<br/>
          WE KNOW WHAT YOU ARE TRYING TO DO ;)<br/>
          <span className="opacity-40 italic mt-2 block">[NODE_07_LOGGED]</span>
        </div>
      </div>
    </div>
  );
};

export default CounterIntel;
