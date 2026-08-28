'use client';

import React from 'react';
import { AlertCircle, CheckCircle, RefreshCw, UploadCloud, Sparkles, X } from 'lucide-react';
import { toolArticles } from '@/data/toolArticles';
import ToolArticle from '@/components/ToolArticle';
import { ThumbnailPanel } from './ThumbnailPanel';
import { PDFSidebar } from './PDFSidebar';
import PDFPageWrapper from './PDFCanvas';
import type { PageDimensions, PageItem, SearchMatch, SelectedObjectInfo, TextBoxInfo } from '@/types/pdf';

export interface PDFWorkspaceProps {
  pdfFile: File | null;
  error: string | null;
  setError: (e: string | null) => void;
  success: string | null;
  setSuccess: (s: string | null) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onFileSelect: (file: File) => void;
  isProcessing: boolean;
  pdfBytes: Uint8Array | null;
  processingStatus: string;
  pageList: PageItem[];
  activePageId: string | null;
  thumbnailUrls: Record<number, string>;
  onPageClick: (pageId: string) => void;
  onDuplicatePage: (idx: number) => void;
  onDeletePage: (idx: number) => void;
  workspaceRef: React.RefObject<HTMLDivElement | null>;
  onWorkspaceScroll: () => void;
  editMode: string;
  pageDimensions: Record<number, PageDimensions>;
  zoomScale: number;
  pdfDoc: unknown;
  fabricLib: unknown;
  canvasStates: Record<string, unknown>;
  saveCanvasState: (pageId: string, state: unknown) => void;
  onFocusCanvas: (pageId: string, fbCanvas: unknown) => void;
  onObjectSelected: (pageId: string, activeObj: unknown) => void;
  onObjectCleared: () => void;
  onFabricModified?: (pageId: string, fabricObj: Record<string, unknown>) => void;
  onFabricAdded?: (pageId: string, fabricObj: Record<string, unknown>) => void;
  strokeColor: string;
  fillColor: string;
  strokeWidth: number;
  brushWidth: number;
  fontFamily: string;
  fontSize: number;
  originalTexts: Record<number, TextBoxInfo[]>;
  registerCanvasInstance: (pageId: string, canvas: unknown) => void;
  unregisterCanvasInstance: (pageId: string) => void;
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
  selectedObjectInfo: SelectedObjectInfo | null;
  handleHighlightSelectedText: () => void;
  changeSelectedProperty: (key: string, value: unknown) => void;
  adjustLayer: (action: 'front' | 'back' | 'forward' | 'backward') => void;
  handleDeleteSelected: () => void;
}

export function PDFWorkspace({
  pdfFile,
  error,
  setError,
  success,
  setSuccess,
  fileInputRef,
  onFileSelect,
  isProcessing,
  pdfBytes,
  processingStatus,
  pageList,
  activePageId,
  thumbnailUrls,
  onPageClick,
  onDuplicatePage,
  onDeletePage,
  workspaceRef,
  onWorkspaceScroll,
  editMode,
  pageDimensions,
  zoomScale,
  pdfDoc,
  fabricLib,
  canvasStates,
  saveCanvasState,
  onFocusCanvas,
  onObjectSelected,
  onObjectCleared,
  onFabricModified,
  onFabricAdded,
  strokeColor,
  fillColor,
  strokeWidth,
  brushWidth,
  fontFamily,
  fontSize,
  originalTexts,
  registerCanvasInstance,
  unregisterCanvasInstance,
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
}: PDFWorkspaceProps) {
  if (!pdfFile) {
    return (
      <>
        <div className="flex-1 flex flex-col items-center justify-start p-8 overflow-y-auto pt-16 bg-grid-pattern relative">
          <div className="max-w-2xl w-full text-center space-y-8 animate-in fade-in duration-300">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900/40 text-blue-600 dark:text-blue-400 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">
                <Sparkles className="w-3.5 h-3.5" />
                Next-Gen PDF Workspace
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight text-gradient">
                Professional PDF Editor
              </h1>
              <p className="text-slate-600 dark:text-slate-400 text-sm font-medium leading-relaxed">
                Rebuild, annotate, and format documents fully client-side. Edit original text blocks, draw vector vectors, add images, and sign securely.
              </p>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 p-5 rounded-2xl flex items-start gap-4 border border-red-200 dark:border-red-900/50 text-left">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            <div
              onDragOver={(e) => e.preventDefault()}
              onDragLeave={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files?.[0];
                if (file && file.type === 'application/pdf') onFileSelect(file);
              }}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-blue-500/50 bg-white/80 dark:bg-slate-900/40 hover:bg-slate-50 dark:hover:bg-slate-900/60 rounded-3xl p-16 text-center cursor-pointer transition-all duration-300 shadow-xl group relative glow-hover overflow-hidden"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) onFileSelect(file);
                }}
                accept="application/pdf"
                className="hidden"
              />

              <UploadCloud className="w-12 h-12 text-slate-400 dark:text-slate-600 group-hover:text-blue-500 mx-auto mb-4 transition-colors" />
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-1">Upload PDF Document</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">or drag and drop your document here</p>

              <button className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-3 rounded-2xl text-xs uppercase tracking-widest shadow-md transition-all active:scale-95">
                Select File
              </button>
            </div>
          </div>

          {toolArticles['edit-pdf'] && (
            <div className="w-full mt-20">
              <ToolArticle {...toolArticles['edit-pdf']} />
            </div>
          )}
        </div>

        {isProcessing && !pdfBytes && (
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-50 flex flex-col items-center justify-center select-none">
            <div className="max-w-md w-full text-center space-y-4 p-8">
              <RefreshCw className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
              <h3 className="text-lg font-bold text-white uppercase tracking-wider">{processingStatus || 'Initializing file...'}</h3>
              <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full w-2/3 animate-pulse" />
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="flex-1 flex overflow-hidden">
      <ThumbnailPanel
        pageList={pageList}
        activePageId={activePageId}
        thumbnailUrls={thumbnailUrls}
        onPageClick={onPageClick}
        onDuplicatePage={onDuplicatePage}
        onDeletePage={onDeletePage}
      />

      <main
        ref={workspaceRef}
        onScroll={onWorkspaceScroll}
        className={`flex-1 overflow-auto p-12 flex flex-col items-center justify-start custom-scrollbar bg-slate-100 dark:bg-slate-950 bg-grid-pattern ${editMode === 'pan' ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'}`}
      >
        <div className="max-w-4xl w-full space-y-4 mb-6 select-none">
          {error && (
            <div className="bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 px-5 py-4 rounded-2xl flex items-center gap-3 border border-red-200 dark:border-red-900/40 animate-fade-in shadow-lg">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-xs font-bold leading-normal">{error}</p>
              <button onClick={() => setError(null)} className="ml-auto text-red-400/50 hover:text-red-400 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          {success && (
            <div className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 px-5 py-4 rounded-2xl flex items-center gap-3 border border-emerald-200 dark:border-emerald-900/40 animate-fade-in shadow-lg">
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-xs font-bold leading-normal">{success}</p>
              <button onClick={() => setSuccess(null)} className="ml-auto text-emerald-600 dark:text-emerald-400 hover:opacity-75 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-10 items-center justify-start pb-20">
          {pageList.map((item, idx) => {
            const dimensions = pageDimensions[item.originalPageNum] || { width: 595, height: 842 };
            const w = dimensions.width * zoomScale;
            const h = dimensions.height * zoomScale;
            const isActive = item.id === activePageId;

            return (
              <div
                key={item.id}
                id={`page-wrapper-${item.id}`}
                className={`relative rounded-2xl border transition-all ${
                  isActive
                    ? 'border-blue-500 shadow-2xl shadow-blue-500/10 ring-2 ring-blue-500/20'
                    : 'border-slate-200 dark:border-slate-800/80 shadow-xl'
                }`}
                style={{ width: `${w}px`, height: `${h}px` }}
              >
                <PDFPageWrapper
                  pageId={item.id}
                  pageNum={idx + 1}
                  originalPageNum={item.originalPageNum}
                  width={dimensions.width}
                  height={dimensions.height}
                  zoomScale={zoomScale}
                  editMode={editMode}
                  pdfDoc={pdfDoc}
                  fabricLib={fabricLib}
                  canvasState={canvasStates[item.id]}
                  saveCanvasState={saveCanvasState}
                  onFocusCanvas={onFocusCanvas}
                  onObjectSelected={onObjectSelected}
                  onObjectCleared={onObjectCleared}
                  strokeColor={strokeColor}
                  fillColor={fillColor}
                  strokeWidth={strokeWidth}
                  brushWidth={brushWidth}
                  fontFamily={fontFamily}
                  fontSize={fontSize}
                  originalTexts={originalTexts}
                  registerCanvasInstance={registerCanvasInstance}
                  unregisterCanvasInstance={unregisterCanvasInstance}
                  onFabricModified={onFabricModified}
                  onFabricAdded={onFabricAdded}
                />

                <div className="absolute top-2 -left-16 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[9px] font-black tracking-widest uppercase text-slate-600 dark:text-slate-400 px-3 py-1.5 rounded-full select-none shadow">
                  P. {idx + 1}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <PDFSidebar
        activeSidebarTab={activeSidebarTab}
        setActiveSidebarTab={setActiveSidebarTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        replaceQuery={replaceQuery}
        setReplaceQuery={setReplaceQuery}
        debouncedSearchQuery={debouncedSearchQuery}
        searchResults={searchResults}
        currentMatchIndex={currentMatchIndex}
        handlePrevMatch={handlePrevMatch}
        handleNextMatch={handleNextMatch}
        handleReplace={handleReplace}
        handleReplaceAll={handleReplaceAll}
        selectedObjectInfo={selectedObjectInfo}
        handleHighlightSelectedText={handleHighlightSelectedText}
        changeSelectedProperty={changeSelectedProperty}
        adjustLayer={adjustLayer}
        handleDeleteSelected={handleDeleteSelected}
      />
    </div>
  );
}
