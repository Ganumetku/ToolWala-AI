'use client';

import { useRef, useCallback, useState, useEffect } from 'react';
import type { TWPDFDocument } from '@/types/twpdf';
import { TWPDFEditingEngine } from '@/lib/twpdf/editing/editingEngine';
import {
  refreshPageFromDocument,
  refreshAllPagesFromDocument,
} from '@/lib/twpdf/editing/renderer/fabricRenderer';
import { pageToFabricState } from '@/lib/twpdf/editing/renderer/domToFabric';

interface UseTWPdfEditingEngineOptions {
  getDocument: () => TWPDFDocument | null;
  setDocument: (doc: TWPDFDocument) => void;
  canvasInstances: React.MutableRefObject<Record<string, unknown>>;
  getZoomScale: () => number;
  setCanvasStates: React.Dispatch<React.SetStateAction<Record<string, unknown>>>;
}

export function useTWPdfEditingEngine({
  getDocument,
  setDocument,
  canvasInstances,
  getZoomScale,
  setCanvasStates,
}: UseTWPdfEditingEngineOptions) {
  const [, forceUpdate] = useState(0);
  const refreshCounter = useCallback(() => forceUpdate((n) => n + 1), []);

  const getDocumentRef = useRef(getDocument);
  const setDocumentRef = useRef(setDocument);
  const getZoomScaleRef = useRef(getZoomScale);
  const canvasInstancesRef = useRef(canvasInstances);
  const setCanvasStatesRef = useRef(setCanvasStates);

  useEffect(() => {
    getDocumentRef.current = getDocument;
    setDocumentRef.current = setDocument;
    getZoomScaleRef.current = getZoomScale;
    canvasInstancesRef.current = canvasInstances;
    setCanvasStatesRef.current = setCanvasStates;
  });

  const onDocumentChangeRef = useRef<
    ((doc: TWPDFDocument, affectedPageId?: string) => void) | null
  >(null);

  if (!onDocumentChangeRef.current) {
    onDocumentChangeRef.current = async (doc: TWPDFDocument, affectedPageId?: string) => {
      const scale = getZoomScaleRef.current();
      const instances = canvasInstancesRef.current.current;
      const setStates = setCanvasStatesRef.current;

      if (affectedPageId) {
        const state = await refreshPageFromDocument(affectedPageId, doc, instances, scale);
        if (state) {
          setStates((prev) => ({ ...prev, [affectedPageId]: state }));
        }
      } else {
        const states = await refreshAllPagesFromDocument(doc, instances, scale);
        setStates((prev) => ({ ...prev, ...states }));
      }
      refreshCounter();
    };
  }

  const engineRef = useRef<TWPDFEditingEngine | null>(null);
  if (!engineRef.current) {
    engineRef.current = new TWPDFEditingEngine(
      () => getDocumentRef.current(),
      (doc) => setDocumentRef.current(doc),
      (doc, pageId) => onDocumentChangeRef.current?.(doc, pageId)
    );
  }

  const engine = engineRef.current;

  const handleUndo = useCallback(async () => {
    const next = engine.undo();
    if (next) {
      const states = await refreshAllPagesFromDocument(
        next,
        canvasInstancesRef.current.current,
        getZoomScaleRef.current()
      );
      setCanvasStatesRef.current(states);
      refreshCounter();
    }
  }, [engine, refreshCounter]);

  const handleRedo = useCallback(async () => {
    const next = engine.redo();
    if (next) {
      const states = await refreshAllPagesFromDocument(
        next,
        canvasInstancesRef.current.current,
        getZoomScaleRef.current()
      );
      setCanvasStatesRef.current(states);
      refreshCounter();
    }
  }, [engine, refreshCounter]);

  const resetEngine = useCallback(() => {
    engine.resetHistory();
    refreshCounter();
  }, [engine, refreshCounter]);

  const syncPageToCanvasStates = useCallback(
    (pageId: string) => {
      const doc = getDocumentRef.current();
      if (!doc) return;
      const page = doc.pages.find((p) => p.id === pageId);
      if (!page) return;
      const state = pageToFabricState(page, getZoomScaleRef.current());
      setCanvasStatesRef.current((prev) => ({ ...prev, [pageId]: state }));
    },
    []
  );

  const syncAllCanvasStates = useCallback(async () => {
    const doc = getDocumentRef.current();
    if (!doc) return;
    const states = await refreshAllPagesFromDocument(
      doc,
      canvasInstancesRef.current.current,
      getZoomScaleRef.current()
    );
    setCanvasStatesRef.current(states);
    refreshCounter();
  }, [refreshCounter]);

  const handleFabricModified = useCallback(
    (pageId: string, fabricObj: Record<string, unknown>) => {
      engine.syncFabricModification(pageId, fabricObj);
    },
    [engine]
  );

  const handleFabricAdded = useCallback(
    (pageId: string, fabricObj: Record<string, unknown>) => {
      const doc = getDocumentRef.current();
      const objectId = fabricObj.id as string | undefined;
      if (doc && objectId && doc.pages.find((p) => p.id === pageId)?.objects.some((o) => o.id === objectId)) {
        return;
      }
      engine.createObjectFromFabric(pageId, fabricObj);
    },
    [engine]
  );

  const handleFabricRemoved = useCallback(
    (pageId: string, fabricObj: Record<string, unknown>) => {
      const objectId = fabricObj.id as string | undefined;
      if (!objectId) return;
      engine.deleteObject(pageId, objectId);
    },
    [engine]
  );

  const historyManager = engine.getHistory();

  return {
    engine,
    handleUndo,
    handleRedo,
    resetEngine,
    canUndo: engine.canUndo(),
    canRedo: engine.canRedo(),
    historyIndex: historyManager.length,
    historyLength: historyManager.length + historyManager.futureLength + 1,
    syncPageToCanvasStates,
    syncAllCanvasStates,
    handleFabricModified,
    handleFabricAdded,
    handleFabricRemoved,
  };
}
