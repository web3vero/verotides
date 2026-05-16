'use client';

import React, { useState, useMemo } from 'react';
import entries from '@/data/twaai/entries.json';

const SearchEngine = () => {
  const [searchTerm, setSearchBar] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const folders = useMemo(() => {
    const set = new Set(entries.map(e => e.folder));
    return Array.from(set);
  }, []);

  const filteredEntries = useMemo(() => {
    return entries.filter(entry => {
      const matchesSearch = entry.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           entry.query.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFolder = selectedFolder ? entry.folder === selectedFolder : true;
      return matchesSearch && matchesFolder;
    });
  }, [searchTerm, selectedFolder]);

  return (
    <div className="p-4 terminal-box min-h-[600px] flex flex-col gap-4">
      <div className="flex justify-between items-center border-b border-border pb-2">
        <h1 className="text-2xl font-bold glow-text flicker tracking-widest text-primary">TWAAI_UNLOCKED</h1>
        <div className="text-xs text-yellow-400 font-black animate-pulse">SYSTEM_STATUS: HIGH_CONTRAST_ACTIVE</div>
      </div>

      <div className="flex gap-4 items-center">
        <div className="flex-1 relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-yellow-400 font-bold">{'>'}</span>
          <input 
            type="text" 
            placeholder="SEARCH_BY_KEYWORD_FOR_INTEL..." 
            className="w-full bg-black border-2 border-primary/40 p-3 pl-10 focus:outline-none focus:border-primary text-primary font-bold placeholder:opacity-30 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchBar(e.target.value)}
          />
        </div>
        <select 
          className="bg-black border-2 border-primary/40 p-3 text-primary font-bold focus:outline-none cursor-pointer"
          value={selectedFolder || ''}
          onChange={(e) => setSelectedFolder(e.target.value || null)}
        >
          <option value="">ALL_DOMAINS</option>
          {folders.map(f => <option key={f} value={f}>{f.toUpperCase()}</option>)}
        </select>
      </div>

      <div className="flex-1 overflow-auto border-2 border-primary/30 bg-black/80 shadow-[inset_0_0_20px_rgba(0,255,65,0.05)]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b-2 border-primary bg-primary text-black text-xs font-black italic">
              <th className="p-3 w-16">ID</th>
              <th className="p-3 w-24">FOLDER</th>
              <th className="p-3">QUERY_TITLE</th>
              <th className="p-3 w-20 text-center">STATUS</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {filteredEntries.map(entry => (
              <React.Fragment key={entry.id}>
                <tr 
                  className={`border-b border-primary/20 hover:bg-primary/20 cursor-pointer transition-all ${expandedId === entry.id ? 'bg-primary/10' : ''}`}
                  onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
                >
                  <td className="p-3 font-mono text-xs text-primary/60">{entry.id}</td>
                  <td className="p-3 text-xs font-bold text-primary/80 uppercase">{entry.folder}</td>
                  <td className={`p-3 font-bold ${expandedId === entry.id ? 'text-yellow-400' : 'text-white'}`}>{entry.title}</td>
                  <td className="p-3 text-center text-[10px] text-primary font-black uppercase tracking-tighter">{entry.status}</td>
                </tr>
                {expandedId === entry.id && (
                  <tr className="bg-black/90">
                    <td colSpan={4} className="p-6 border-b border-primary/40">
                      <div className="flex flex-col gap-6 animate-in slide-in-from-top-2 duration-300">
                        <div className="bg-yellow-400/10 border-l-4 border-yellow-400 p-4">
                          <div className="text-[10px] text-yellow-400 font-black mb-2 uppercase tracking-widest">TACTICAL_QUERY:</div>
                          <div className="text-sm text-white font-bold italic leading-relaxed">
                            "{entry.query}"
                          </div>
                        </div>
                        
                        <div className="bg-black border border-primary/30 p-5 rounded shadow-[0_0_15px_rgba(0,255,65,0.1)] relative overflow-hidden">
                           {/* Background scanline effect for detail box */}
                           <div className="absolute inset-0 pointer-events-none opacity-5 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]"></div>
                          
                          <div className="text-[10px] text-primary font-black mb-3 uppercase flex items-center gap-2">
                             <span className="h-1.5 w-1.5 bg-primary rounded-full animate-pulse"></span>
                             Intelligence_Context [Unredacted]:
                          </div>
                          <div className="text-xs text-primary/90 leading-relaxed font-mono whitespace-pre-wrap">
                            {entry.internal_context}
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                          <div className="text-[9px] text-white/30 font-mono flex gap-4 uppercase italic">
                             <span>Source: TWAAI_CORE_V1.4</span>
                             <span>Timestamp: 2026.05.16</span>
                          </div>
                          <button className="w-full sm:w-auto bg-primary text-black font-black px-6 py-2 text-[10px] hover:bg-white transition-all uppercase shadow-[0_0_15px_rgba(0,255,65,0.3)]">
                            Execute_Query_Link_Direct ↗
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="text-[10px] text-primary/40 font-mono flex justify-between uppercase">
        <div>Intel_Nodes_Cached: {entries.length}</div>
        <div>Device_Adaptation: High_Contrast_Mode_Enabled</div>
        <div>Node: VERO_BEACH_SOUTH</div>
      </div>
    </div>
  );
};

export default SearchEngine;
