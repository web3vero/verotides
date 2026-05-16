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
        <h1 className="text-2xl font-bold glow-text flicker tracking-widest">TWAAI UNLOCKED</h1>
        <div className="text-xs opacity-70">SYSTEM STATUS: OPERATIONAL</div>
      </div>

      <div className="flex gap-4 items-center">
        <div className="flex-1 relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50">{'>'}</span>
          <input 
            type="text" 
            placeholder="SEARCH_BY_KEYWORD..." 
            className="w-full bg-black border border-border p-2 pl-8 focus:outline-none focus:ring-1 focus:ring-primary text-primary"
            value={searchTerm}
            onChange={(e) => setSearchBar(e.target.value)}
          />
        </div>
        <select 
          className="bg-black border border-border p-2 text-primary focus:outline-none"
          value={selectedFolder || ''}
          onChange={(e) => setSelectedFolder(e.target.value || null)}
        >
          <option value="">ALL_FOLDERS</option>
          {folders.map(f => <option key={f} value={f}>{f.toUpperCase()}</option>)}
        </select>
      </div>

      <div className="flex-1 overflow-auto border border-border bg-black/50">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-secondary/30 text-xs">
              <th className="p-2 w-16">ID</th>
              <th className="p-2 w-24">FOLDER</th>
              <th className="p-2">QUERY_TITLE</th>
              <th className="p-2 w-20 text-center">STATUS</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {filteredEntries.map(entry => (
              <React.Fragment key={entry.id}>
                <tr 
                  className={`border-b border-border/30 hover:bg-primary/10 cursor-pointer transition-colors ${expandedId === entry.id ? 'bg-primary/5' : ''}`}
                  onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
                >
                  <td className="p-2 font-mono text-xs opacity-70">{entry.id}</td>
                  <td className="p-2 opacity-80">{entry.folder}</td>
                  <td className="p-2 font-bold">{entry.title}</td>
                  <td className="p-2 text-center text-xs text-primary glow-text">{entry.status}</td>
                </tr>
                {expandedId === entry.id && (
                  <tr className="bg-black border-b border-border/50">
                    <td colSpan={4} className="p-4 bg-secondary/10">
                      <div className="flex flex-col gap-3">
                        <div>
                          <div className="text-xs opacity-50 mb-1">PROMPT_QUERY:</div>
                          <div className="italic text-primary/90 leading-relaxed pl-4 border-l-2 border-primary/20">
                            "{entry.query}"
                          </div>
                        </div>
                        <div className="bg-black/80 p-3 border border-border/30 rounded text-xs leading-relaxed">
                          <div className="text-[10px] opacity-40 mb-2 font-bold">INTERNAL_REASONING_ENGINE [ENCRYPTED]:</div>
                          <div className="opacity-80">
                            {entry.internal_context}
                          </div>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <div className="text-[10px] opacity-40 italic">SOURCE: TWAAI_DISTILLED_CORE_V1.4</div>
                          <button className="text-[10px] border border-primary px-2 py-1 hover:bg-primary hover:text-black transition-all">
                            ASK CLAUDE ABOUT THIS ↗
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
      
      <div className="text-[10px] opacity-30 flex justify-between">
        <div>ENTRIES_LOADED: {entries.length}</div>
        <div>ENCRYPTION: AES-256-GCM</div>
      </div>
    </div>
  );
};

export default SearchEngine;
