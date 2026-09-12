"use client";

import Link from 'next/link';
import React from 'react';
import {
  FileText, Download, RefreshCw, ChevronLeft, Type, Shield, Undo2, Redo2,
  MousePointer, Image as ImageIcon, Paintbrush, Highlighter,
  Square, Circle, ArrowUpRight, CheckSquare, Edit3,
} from 'lucide-react';
import type { EditMode, ShapeType } from '@/types/pdf';
import { useTranslation } from '@/components/I18nContext';

export interface PDFToolbarProps {
  pdfFile: File | null;
  editMode: EditMode | string;
  setEditMode: React.Dispatch<React.SetStateAction<EditMode>>;
  getActiveCanvas: () => {
    discardActiveObject: () => void | { requestRenderAll: () => void };
    requestRenderAll?: () => void;
  } | null | undefined;
  handleAddText: () => void;
  imageUploadRef: React.RefObject<HTMLInputElement | null>;
  handleAddImage: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleAddShape: (shapeType: ShapeType) => void;
  setIsSigModalOpen: (open: boolean) => void;
  handleUndo: () => void;
  handleRedo: () => void;
  historyIndex: number;
  historyLength: number;
  handleReset: () => void;
  handleExportPDF: () => void | Promise<void>;
  isProcessing?: boolean;
  hasSelectableText?: boolean;
  onNoSelectableText?: () => void;
}

export function PDFToolbar({
  pdfFile,
  editMode,
  setEditMode,
  getActiveCanvas,
  handleAddText,
  imageUploadRef,
  handleAddImage,
  handleAddShape,
  setIsSigModalOpen,
  handleUndo,
  handleRedo,
  historyIndex,
  historyLength,
  handleReset,
  handleExportPDF,
  isProcessing,
  hasSelectableText = true,
  onNoSelectableText,
}: PDFToolbarProps) {
  const { localizeHref } = useTranslation();

  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800/80 px-6 flex items-center justify-between bg-white/90 dark:bg-slate-900/90 backdrop-blur-md z-30 select-none shadow-sm dark:shadow-none">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        <Link href={localizeHref('/tools/pdf-tools')} className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors">
          <ChevronLeft className="w-4 h-4" />
          PDF Tools
        </Link>
        <div className="h-5 w-px bg-slate-200 dark:bg-slate-800" />
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-500" />
          <span className="font-extrabold text-sm text-slate-800 dark:text-slate-200 truncate max-w-[200px] md:max-w-xs">
            {pdfFile ? pdfFile.name : "Professional PDF Editor"}
          </span>
        </div>
      </div>

      {/* Center Toolbar Tools (Only when PDF is uploaded) */}
      {pdfFile && (
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900/60 p-1.5 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-inner max-w-xl overflow-x-auto">
          <button
            onClick={() => {
              setEditMode('select');
              const canvas = getActiveCanvas();
              if (canvas) {
                const result = canvas.discardActiveObject();
                if (result && typeof result === 'object' && 'requestRenderAll' in result) {
                  (result as { requestRenderAll: () => void }).requestRenderAll();
                } else if (canvas.requestRenderAll) {
                  canvas.requestRenderAll();
                }
              }
            }}
            className={`p-2 rounded-xl transition-all ${editMode === 'select' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800'}`}
            title="Select / Pointer Tool"
            data-testid="edit-pdf-tool-select"
          >
            <MousePointer className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => {
              if (!hasSelectableText) {
                onNoSelectableText?.();
                setEditMode('text');
                return;
              }
              setEditMode('edit-text');
            }}
            className={`p-2 rounded-xl transition-all ${editMode === 'edit-text' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800'}`}
            title={
              hasSelectableText
                ? 'Select & Edit PDF Text'
                : 'No selectable text layer — use Add Text'
            }
            data-testid="edit-pdf-tool-edit-text"
          >
            <Edit3 className="w-4 h-4" />
          </button>

          <button
            onClick={() => setEditMode(editMode === 'text' ? 'select' : 'text')}
            className={`p-2 rounded-xl transition-all ${editMode === 'text' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800'}`}
            title="Add New Text Box"
            data-testid="edit-pdf-tool-add-text"
          >
            <Type className="w-4 h-4" />
          </button>

          <button
            onClick={() => imageUploadRef.current?.click()}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-all"
            title="Insert Image"
          >
            <ImageIcon className="w-4 h-4" />
            <input type="file" ref={imageUploadRef} onChange={handleAddImage} accept="image/*" className="hidden" />
          </button>

          <button
            onClick={() => setEditMode('draw')}
            className={`p-2 rounded-xl transition-all ${editMode === 'draw' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800'}`}
            title="Freehand Drawing Brush"
            data-testid="edit-pdf-tool-draw"
          >
            <Paintbrush className="w-4 h-4" />
          </button>

          <button
            onClick={() => setEditMode('highlight-free')}
            className={`p-2 rounded-xl transition-all ${editMode === 'highlight-free' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800'}`}
            title="Freehand Highlighter"
          >
            <Highlighter className="w-4 h-4" />
          </button>

          <button
            onClick={() => handleAddShape('highlight')}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-all"
            title="Highlight Box (Rectangle)"
          >
            <div className="relative">
              <Highlighter className="w-4 h-4 text-yellow-500" />
              <div className="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 bg-yellow-500 rounded-sm" />
            </div>
          </button>

          <div className="w-px h-5 bg-slate-200 dark:bg-slate-800 mx-1" />

          {/* Shapes triggers */}
          <button
            onClick={() => handleAddShape('rect')}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-all"
            title="Insert Rectangle Shape"
            data-testid="edit-pdf-tool-rect"
          >
            <Square className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleAddShape('circle')}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-all"
            title="Insert Circle Shape"
          >
            <Circle className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleAddShape('arrow')}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-all"
            title="Insert Arrow Line"
          >
            <ArrowUpRight className="w-4 h-4" />
          </button>

          <div className="w-px h-5 bg-slate-200 dark:bg-slate-800 mx-1" />

          <button
            onClick={() => setIsSigModalOpen(true)}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-all flex items-center gap-1 text-xs font-bold"
            title="Place digital signature"
          >
            <CheckSquare className="w-4 h-4 text-emerald-500" />
            Sign
          </button>
        </div>
      )}

      {/* Right Section actions */}
      <div className="flex items-center gap-3">
        {pdfFile ? (
          <>
            {/* History Undo / Redo */}
            <div className="flex items-center gap-0.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-0.5 mr-2">
              <button
                onClick={handleUndo}
                disabled={historyIndex <= 0}
                className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-20 transition-all"
                title="Undo last modification"
                data-testid="edit-pdf-undo"
              >
                <Undo2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleRedo}
                disabled={historyIndex >= historyLength - 1}
                className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-20 transition-all"
                title="Redo modification"
              >
                <Redo2 className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={handleReset}
              className="px-4 py-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 text-xs font-bold uppercase rounded-xl transition-all text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            >
              Close
            </button>
            
            <button
              onClick={handleExportPDF}
              disabled={isProcessing}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all active:scale-95 shadow-lg shadow-blue-500/20 disabled:opacity-40"
              data-testid="edit-pdf-export"
            >
              {isProcessing ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              Save Changes
            </button>
          </>
        ) : (
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-900/50">
            <Shield className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">Secure Client Processing</span>
          </div>
        )}
      </div>
    </header>
  );
}
