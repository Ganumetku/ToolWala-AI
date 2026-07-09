"use client";

import React, { useEffect, useCallback, useRef } from 'react';
import { RefreshCw } from 'lucide-react';
import SignatureModal from './SignatureModal';
import { PDFToolbar } from '@/components/pdf/PDFToolbar';
import { PDFWorkspace } from '@/components/pdf/PDFWorkspace';
import { usePdfDocument } from '@/hooks/usePdfDocument';
import { useHistory } from '@/hooks/useHistory';
import { useSelection } from '@/hooks/useSelection';
import { usePdfEditor } from '@/hooks/usePdfEditor';
import { useTWPdfDocument } from '@/hooks/useTWPdfDocument';

export default function EditPdfPage() {
  const canvasInstances = useRef<Record<string, unknown>>({});

  const doc = usePdfDocument();
  const twpdf = useTWPdfDocument();

  const {
    canvasStates,
    setCanvasStates,
    history,
    historyIndex,
    handleCanvasStateUpdate: historyCanvasStateUpdate,
    handleUndo: historyUndo,
    handleRedo: historyRedo,
    resetHistory,
  } = useHistory(canvasInstances);

  const selection = useSelection({
    pageList: doc.pageList,
    canvasStates,
    originalTexts: doc.originalTexts,
    canvasInstances,
    activePageId: doc.activePageId,
    fontSize: 16,
    fontFamily: 'Helvetica',
    handlePageThumbClick: doc.handlePageThumbClick,
    setSuccess: doc.setSuccess,
    setOriginalTexts: doc.setOriginalTexts,
    setCanvasStates,
  });

  const editor = usePdfEditor({
    fabricLib: doc.fabricLib,
    pdfBytes: doc.pdfBytes,
    pdfFile: doc.pdfFile,
    pdfDocRef: doc.pdfDocRef,
    pageList: doc.pageList,
    setPageList: doc.setPageList,
    pageDimensions: doc.pageDimensions,
    canvasStates,
    canvasInstances,
    activePageId: doc.activePageId,
    setActivePageId: doc.setActivePageId,
    getActiveCanvas: selection.getActiveCanvas,
    setIsProcessing: doc.setIsProcessing,
    setProcessingStatus: doc.setProcessingStatus,
    setError: doc.setError,
    setSuccess: doc.setSuccess,
    resetDocument: doc.resetDocument,
    resetHistory,
    setCanvasStates,
    handleUndo: historyUndo,
    handleRedo: historyRedo,
    handleDeleteSelected: selection.handleDeleteSelected,
    onPageDuplicated: twpdf.handleDuplicatePage,
    onPageDeleted: twpdf.handleDeletePage,
  });

  // Initialize TWPDF document model when PDF is loaded
  useEffect(() => {
    if (doc.pdfFile && doc.pageList.length > 0 && Object.keys(doc.pageDimensions).length > 0) {
      twpdf.initializeFromPdfLoad({
        fileName: doc.pdfFile.name,
        pageList: doc.pageList,
        pageDimensions: doc.pageDimensions,
        originalTexts: doc.originalTexts,
      });
    }
  }, [doc.pdfFile, doc.pageList.length, doc.pageDimensions, doc.originalTexts, twpdf.initializeFromPdfLoad]);

  // Sync current page into TWPDF page manager
  useEffect(() => {
    if (doc.activePageId) {
      twpdf.setCurrentPage(doc.activePageId);
    }
  }, [doc.activePageId, twpdf.setCurrentPage]);

  const handleCanvasStateUpdate = useCallback(
    (pageId: string, stateJSON: unknown) => {
      historyCanvasStateUpdate(pageId, stateJSON);
      twpdf.syncFromFabricState(pageId, stateJSON);
    },
    [historyCanvasStateUpdate, twpdf]
  );

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const prevStates = history[historyIndex - 1] as Record<string, unknown>;
      historyUndo();
      twpdf.syncAllFromCanvasStates(prevStates);
    }
  }, [historyIndex, history, historyUndo, twpdf]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextStates = history[historyIndex + 1] as Record<string, unknown>;
      historyRedo();
      twpdf.syncAllFromCanvasStates(nextStates);
    }
  }, [historyIndex, history, historyRedo, twpdf]);

  const handleLoadPdf = useCallback(
    (file: File) => {
      resetHistory();
      twpdf.resetTWPdfDocument();
      doc.loadPdfFile(file);
    },
    [doc, resetHistory, twpdf]
  );

  const handleReset = useCallback(() => {
    editor.handleReset();
    resetHistory();
    twpdf.resetTWPdfDocument();
  }, [editor, resetHistory, twpdf]);

  const handleObjectSelected = useCallback(
    (pageId: string, activeObj: unknown) => {
      selection.handleObjectSelected(pageId, activeObj);
      const objId = (activeObj as { id?: string })?.id;
      if (objId) {
        twpdf.selectObject(pageId, objId);
      }
    },
    [selection, twpdf]
  );

  const handleObjectCleared = useCallback(() => {
    selection.handleObjectCleared();
    twpdf.clearSelection();
  }, [selection, twpdf]);

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement).isContentEditable
      ) {
        return;
      }

      const isMac = typeof window !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modifierPressed = isMac ? e.metaKey : e.ctrlKey;

      if (modifierPressed && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }

      if (
        (modifierPressed && e.key.toLowerCase() === 'z' && e.shiftKey) ||
        (modifierPressed && e.key.toLowerCase() === 'y')
      ) {
        e.preventDefault();
        handleRedo();
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        const canvas = selection.getActiveCanvas();
        if (canvas && canvas.getActiveObject()) {
          e.preventDefault();
          selection.handleDeleteSelected();
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [handleUndo, handleRedo, selection]);

  const handleFocusCanvas = useCallback(
    (pageId: string, _fbCanvas: unknown) => {
      editor.handleFocusCanvas(pageId);
    },
    [editor]
  );

  if (!doc.isMounted || !doc.pdfjs || !doc.fabricLib) {
    return (
      <div className="bg-slate-950 min-h-screen flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="w-10 h-10 text-blue-500 animate-spin" />
          <p className="text-slate-400 font-bold font-sans">Initializing PDF Editor workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-950 min-h-screen text-slate-100 flex flex-col font-sans select-none overflow-hidden relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[400px] bg-blue-500/5 blur-[120px] pointer-events-none" />

      <PDFToolbar
        pdfFile={doc.pdfFile}
        editMode={editor.editMode}
        setEditMode={editor.setEditMode}
        getActiveCanvas={selection.getActiveCanvas}
        handleAddText={editor.handleAddText}
        imageUploadRef={editor.imageUploadRef}
        handleAddImage={editor.handleAddImage}
        handleAddShape={editor.handleAddShape}
        setIsSigModalOpen={editor.setIsSigModalOpen}
        handleUndo={handleUndo}
        handleRedo={handleRedo}
        historyIndex={historyIndex}
        historyLength={history.length}
        handleReset={handleReset}
        handleExportPDF={editor.handleExportPDF}
        isProcessing={doc.isProcessing}
      />

      <PDFWorkspace
        pdfFile={doc.pdfFile}
        error={doc.error}
        setError={doc.setError}
        success={doc.success}
        setSuccess={doc.setSuccess}
        fileInputRef={editor.fileInputRef}
        onFileSelect={handleLoadPdf}
        isProcessing={doc.isProcessing}
        pdfBytes={doc.pdfBytes}
        processingStatus={doc.processingStatus}
        pageList={doc.pageList}
        activePageId={doc.activePageId}
        thumbnailUrls={doc.thumbnailUrls}
        onPageClick={doc.handlePageThumbClick}
        onDuplicatePage={editor.handleDuplicatePage}
        onDeletePage={editor.handleDeletePage}
        workspaceRef={editor.workspaceRef}
        onWorkspaceScroll={editor.handleWorkspaceScroll}
        editMode={editor.editMode}
        pageDimensions={doc.pageDimensions}
        zoomScale={editor.zoomScale}
        pdfDoc={doc.pdfDocRef.current}
        fabricLib={doc.fabricLib}
        canvasStates={canvasStates}
        saveCanvasState={handleCanvasStateUpdate}
        onFocusCanvas={handleFocusCanvas}
        onObjectSelected={handleObjectSelected}
        onObjectCleared={handleObjectCleared}
        strokeColor={editor.strokeColor}
        fillColor={editor.fillColor}
        strokeWidth={editor.strokeWidth}
        brushWidth={editor.brushWidth}
        fontFamily={editor.fontFamily}
        fontSize={editor.fontSize}
        originalTexts={doc.originalTexts}
        registerCanvasInstance={editor.registerCanvasInstance}
        unregisterCanvasInstance={editor.unregisterCanvasInstance}
        activeSidebarTab={selection.activeSidebarTab}
        setActiveSidebarTab={selection.setActiveSidebarTab}
        searchQuery={selection.searchQuery}
        setSearchQuery={selection.setSearchQuery}
        replaceQuery={selection.replaceQuery}
        setReplaceQuery={selection.setReplaceQuery}
        debouncedSearchQuery={selection.debouncedSearchQuery}
        searchResults={selection.searchResults}
        currentMatchIndex={selection.currentMatchIndex}
        handlePrevMatch={selection.handlePrevMatch}
        handleNextMatch={selection.handleNextMatch}
        handleReplace={selection.handleReplace}
        handleReplaceAll={selection.handleReplaceAll}
        selectedObjectInfo={selection.selectedObjectInfo}
        handleHighlightSelectedText={editor.handleHighlightSelectedText}
        changeSelectedProperty={selection.changeSelectedProperty}
        adjustLayer={selection.adjustLayer}
        handleDeleteSelected={selection.handleDeleteSelected}
      />

      <SignatureModal
        isOpen={editor.isSigModalOpen}
        onClose={() => editor.setIsSigModalOpen(false)}
        onSave={editor.handleSaveSignature}
      />
    </div>
  );
}
