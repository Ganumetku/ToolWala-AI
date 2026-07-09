'use client';

import {
  Search, X, ChevronLeft, ChevronRight, Settings,
} from 'lucide-react';
import { PropertyPanel } from './PropertyPanel';
import type { SearchMatch } from '@/types/pdf';

export interface PDFSidebarProps {
  activeSidebarTab: 'properties' | 'search';
  setActiveSidebarTab: (tab: 'properties' | 'search') => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  replaceQuery: string;
  setReplaceQuery: (q: string) => void;
  debouncedSearchQuery: string;
  searchResults: SearchMatch[];
  currentMatchIndex: number;
  handlePrevMatch: () => void;
  handleNextMatch: () => void;
  handleReplace: () => void;
  handleReplaceAll: () => void;
  selectedObjectInfo: Parameters<typeof PropertyPanel>[0]['selectedObjectInfo'];
  handleHighlightSelectedText: () => void;
  changeSelectedProperty: (key: string, value: unknown) => void;
  adjustLayer: (action: 'front' | 'back' | 'forward' | 'backward') => void;
  handleDeleteSelected: () => void;
}

export function PDFSidebar({
  activeSidebarTab,
  setActiveSidebarTab,
  searchQuery,
  setSearchQuery,
  replaceQuery,
  setReplaceQuery,
  debouncedSearchQuery,
  searchResults,
  currentMatchIndex,
  handlePrevMatch,
  handleNextMatch,
  handleReplace,
  handleReplaceAll,
  selectedObjectInfo,
  handleHighlightSelectedText,
  changeSelectedProperty,
  adjustLayer,
  handleDeleteSelected,
}: PDFSidebarProps) {
  return (
    <aside className="w-80 bg-slate-950 border-l border-slate-900 flex flex-col overflow-hidden select-none z-20">
      <div className="flex bg-slate-950 border-b border-slate-900 p-1.5 bg-slate-900/10">
        <button
          onClick={() => setActiveSidebarTab('properties')}
          className={`flex-1 py-2.5 text-center text-[10px] font-black uppercase tracking-widest transition-all rounded-xl ${
            activeSidebarTab === 'properties' ? 'bg-slate-900 text-white shadow border border-slate-800' : 'text-slate-500 hover:text-slate-350'
          }`}
        >
          Properties
        </button>
        <button
          onClick={() => setActiveSidebarTab('search')}
          className={`flex-1 py-2.5 text-center text-[10px] font-black uppercase tracking-widest transition-all rounded-xl ${
            activeSidebarTab === 'search' ? 'bg-slate-900 text-white shadow border border-slate-800' : 'text-slate-500 hover:text-slate-350'
          }`}
        >
          Search & Replace
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {activeSidebarTab === 'search' ? (
          <div className="p-5 space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Find Text</label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search text in PDF..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-650 outline-none focus:border-blue-500 transition-colors"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-600 absolute left-3 top-3.5" />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="absolute right-3 top-3 text-slate-600 hover:text-slate-400">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Replace With</label>
                <input
                  type="text"
                  value={replaceQuery}
                  onChange={(e) => setReplaceQuery(e.target.value)}
                  placeholder="Replacement text..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-650 outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            {debouncedSearchQuery && (
              <div className="space-y-4 pt-4 border-t border-slate-900">
                {searchResults.length > 0 ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-400">
                        {searchResults.length} {searchResults.length === 1 ? 'match' : 'matches'} found
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-slate-500 font-bold">
                          {currentMatchIndex + 1} of {searchResults.length}
                        </span>
                        <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5">
                          <button
                            onClick={handlePrevMatch}
                            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
                            title="Previous Match"
                          >
                            <ChevronLeft className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={handleNextMatch}
                            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
                            title="Next Match"
                          >
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <button
                        onClick={handleReplace}
                        className="py-2.5 bg-blue-600/10 hover:bg-blue-600/25 border border-blue-600/20 text-blue-400 text-xs font-bold uppercase rounded-xl transition-all"
                      >
                        Replace
                      </button>
                      <button
                        onClick={handleReplaceAll}
                        className="py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase rounded-xl transition-all shadow-md shadow-blue-500/10"
                      >
                        Replace All
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-xs font-bold text-slate-500">No matches found</p>
                  </div>
                )}
              </div>
            )}

            {!debouncedSearchQuery && (
              <div className="text-center py-8 space-y-3">
                <div className="bg-slate-900 w-10 h-10 rounded-full flex items-center justify-center mx-auto border border-slate-800 text-slate-600">
                  <Search className="w-4 h-4" />
                </div>
                <p className="text-[10px] font-medium text-slate-500 leading-normal px-2">
                  Find and replace words in original text boxes or custom annotations.
                </p>
              </div>
            )}
          </div>
        ) : (
          <PropertyPanel
            selectedObjectInfo={selectedObjectInfo}
            handleHighlightSelectedText={handleHighlightSelectedText}
            changeSelectedProperty={changeSelectedProperty}
            adjustLayer={adjustLayer}
            handleDeleteSelected={handleDeleteSelected}
          />
        )}
      </div>

      <div className="p-5 bg-slate-900/10 border-t border-slate-900 select-none">
        <h4 className="text-[9px] font-black uppercase tracking-wider text-slate-500 mb-2">Shortcuts</h4>
        <ul className="text-[10px] text-slate-600 space-y-1.5 leading-normal">
          <li>Double-click text boxes to edit text.</li>
          <li>Hold Space + Drag to pan page views.</li>
          <li>Press Delete key to remove selected items.</li>
        </ul>
      </div>
    </aside>
  );
}
