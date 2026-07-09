'use client';

import { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import type { TWPDFDocument } from '@/types/twpdf';
import { TWPDFEditingEngine } from '@/lib/twpdf/editing/editingEngine';
import { documentToCanvasStates, fabricPropertyToTwpdfPatch } from '@/lib/twpdf/editing/renderer/domToFabric';
import {
  refreshAllPagesFromDocument,
  getIsRenderingFromEngine,
} from '@/lib/twpdf/editing/renderer/fabricRenderer';

interface UseTWPdfEditingOptions {
  document: TWPDFDocument | null;
  getDocument: () => TWPDFDocument | null;
  setDocument: (doc: TWPDFDocument) => void;
  canvasInstances: React.MutableRefObject<Record<string, unknown>>;
  zoomScale: number;
  activePageId: string | null;
  selectedObjectId: string | null;
}

export function useTWPdfEditing({
  document,
  getDocument,
  setDocument,
  canvasInstances,
  zoomScale,
  activePageId,
  selectedObjectId,
}: UseTWPdfEditingOptions) {
  const [canvasStates, setCanvasStates] = useState<Record<string, unknown>>({});
  const [historyTick, setHistoryTick] = useState(0);
  const onDocumentChangeRef = useRef<(doc: TWPDFDocument) => void>(() => {});

  const refreshFromDocument = useCallback(
    async (doc: TWPDFDocument) => {
      const states = documentToCanvasStates(doc, zoomScale);
      setCanvasStates(states);

      const refreshed = await refreshAllPagesFromDocument(doc, canvasInstances.current, zoomScale);
      setCanvasStates(refreshed);
    },
    [zoomScale, canvasInstances]
  );

  const onDocumentChange = useCallback(
    (doc: TWPDFDocument) => {
      void refreshFromDocument(doc);
      setHistoryTick((v) => v + 1);
    },
    [refreshFromDocument]
  );

  onDocumentChangeRef.current = onDocumentChange;

  const engine = useMemo(
    () =>
      new TWPDFEditingEngine(getDocument, setDocument, (doc) => {
        onDocumentChangeRef.current(doc);
      }),
    [getDocument, setDocument]
  );

  useEffect(() => {
    if (document) {
      const states = documentToCanvasStates(document, zoomScale);
      setCanvasStates(states);
    }
  }, [document, zoomScale]);

  const handleCanvasStateUpdate = useCallback(
    (pageId: string, stateJSON: unknown) => {
      if (getIsRenderingFromEngine()) return;
      engine.syncPageFromFabric(pageId, stateJSON);
    },
    [engine]
  );

  const undo = useCallback(() => {
    const result = engine.undo();
    if (result) void refreshFromDocument(result);
    setHistoryTick((v) => v + 1);
  }, [engine, refreshFromDocument]);

  const redo = useCallback(() => {
    const result = engine.redo();
    if (result) void refreshFromDocument(result);
    setHistoryTick((v) => v + 1);
  }, [engine, refreshFromDocument]);

  const resetEditing = useCallback(() => {
    engine.resetHistory();
    setCanvasStates({});
    setHistoryTick(0);
  }, [engine]);

  const copySelection = useCallback(() => {
    if (!activePageId || !selectedObjectId) return false;
    return engine.copy(activePageId, selectedObjectId);
  }, [engine, activePageId, selectedObjectId]);

  const cutSelection = useCallback(() => {
    if (!activePageId || !selectedObjectId) return;
    engine.cut(activePageId, selectedObjectId);
  }, [engine, activePageId, selectedObjectId]);

  const pasteSelection = useCallback(() => {
    const pageId = activePageId ?? getDocument()?.currentPageId;
    if (!pageId) return;
    engine.paste(pageId);
  }, [engine, activePageId, getDocument]);

  const deleteSelected = useCallback(() => {
    if (!activePageId || !selectedObjectId) return;
    engine.deleteObject(activePageId, selectedObjectId);
  }, [engine, activePageId, selectedObjectId]);

  const updateSelectedProperty = useCallback(
    (key: string, value: unknown, objectType?: string) => {
      if (!activePageId || !selectedObjectId) return;
      const twpdfType = objectType === 'textbox' || objectType === 'i-text' ? 'text' : 'shape';
      const patch = fabricPropertyToTwpdfPatch(key, value, { type: twpdfType } as Parameters<
        typeof fabricPropertyToTwpdfPatch
      >[2]);
      engine.updateObject(activePageId, selectedObjectId, patch);
    },
    [engine, activePageId, selectedObjectId]
  );

  const adjustSelectedLayer = useCallback(
    (action: 'front' | 'back' | 'forward' | 'backward') => {
      if (!activePageId || !selectedObjectId) return;
      switch (action) {
        case 'front':
          engine.bringToFront(activePageId, selectedObjectId);
          break;
        case 'back':
          engine.sendToBack(activePageId, selectedObjectId);
          break;
        case 'forward':
          engine.bringForward(activePageId, selectedObjectId);
          break;
        case 'backward':
          engine.sendBackward(activePageId, selectedObjectId);
          break;
      }
    },
    [engine, activePageId, selectedObjectId]
  );

  const historyLength = engine.getHistoryLength();
  const futureLength = engine.getHistory().futureLength;

  return {
    engine,
    canvasStates,
    setCanvasStates,
    handleCanvasStateUpdate,
    undo,
    redo,
    canUndo: engine.canUndo(),
    canRedo: engine.canRedo(),
    historyIndex: historyLength,
    historyLength: historyLength + futureLength + 1,
    historyTick,
    resetEditing,
    copySelection,
    cutSelection,
    pasteSelection,
    deleteSelected,
    updateSelectedProperty,
    adjustSelectedLayer,
    refreshFromDocument,
  };
}
