'use client';

import { useState, useCallback, useRef, useMemo } from 'react';
import type { TWPDFDocument } from '@/types/twpdf';
import type { PageDimensions, PageItem, TextBoxInfo } from '@/types/pdf';
import {
  ObjectManager,
  SelectionManager,
  PageManager,
  createDocument,
  duplicatePageInDocument,
  removePageFromDocument,
  syncPageFromFabricState,
  syncAllPagesFromCanvasStates,
} from '@/lib/twpdf/dom';

export interface InitializeDocumentInput {
  fileName: string;
  pageList: PageItem[];
  pageDimensions: Record<number, PageDimensions>;
  originalTexts: Record<number, TextBoxInfo[]>;
}

export function useTWPdfDocument() {
  const [document, setDocument] = useState<TWPDFDocument | null>(null);
  const documentRef = useRef<TWPDFDocument | null>(null);
  const initKeyRef = useRef<string | null>(null);

  const updateDocument = useCallback((updater: (doc: TWPDFDocument) => TWPDFDocument) => {
    setDocument((prev) => {
      if (!prev) return prev;
      const next = updater(prev);
      documentRef.current = next;
      return next;
    });
  }, []);

  const objectManager = useMemo(
    () => new ObjectManager(updateDocument),
    [updateDocument]
  );

  const selectionManager = useMemo(
    () => new SelectionManager(updateDocument),
    [updateDocument]
  );

  const pageManager = useMemo(
    () => new PageManager(updateDocument),
    [updateDocument]
  );

  const initializeFromPdfLoad = useCallback((input: InitializeDocumentInput) => {
    const initKey = input.fileName;
    if (initKeyRef.current === initKey && documentRef.current) return;

    const pages = input.pageList.map((p) => ({
      id: p.id,
      originalPageNum: p.originalPageNum,
      width: input.pageDimensions[p.originalPageNum]?.width ?? 595,
      height: input.pageDimensions[p.originalPageNum]?.height ?? 842,
    }));

    const doc = createDocument({
      fileName: input.fileName,
      pages,
      originalTexts: input.originalTexts,
    });

    initKeyRef.current = initKey;
    documentRef.current = doc;
    setDocument(doc);
  }, []);

  const resetTWPdfDocument = useCallback(() => {
    initKeyRef.current = null;
    documentRef.current = null;
    setDocument(null);
  }, []);

  const syncFromFabricState = useCallback((pageId: string, fabricState: unknown) => {
    setDocument((prev) => {
      if (!prev) return prev;
      const next = syncPageFromFabricState(prev, pageId, fabricState);
      documentRef.current = next;
      return next;
    });
  }, []);

  const syncAllFromCanvasStates = useCallback((canvasStates: Record<string, unknown>) => {
    setDocument((prev) => {
      if (!prev) return prev;
      const next = syncAllPagesFromCanvasStates(prev, canvasStates);
      documentRef.current = next;
      return next;
    });
  }, []);

  const handleDuplicatePage = useCallback((sourcePageId: string, newPageId: string, insertAfterIndex: number) => {
    setDocument((prev) => {
      if (!prev) return prev;
      const next = duplicatePageInDocument(prev, sourcePageId, newPageId, insertAfterIndex);
      documentRef.current = next;
      return next;
    });
  }, []);

  const handleDeletePage = useCallback((pageId: string) => {
    setDocument((prev) => {
      if (!prev) return prev;
      const next = removePageFromDocument(prev, pageId);
      documentRef.current = next;
      return next;
    });
  }, []);

  const selectObject = useCallback(
    (pageId: string, objectId: string) => {
      selectionManager.select(pageId, objectId);
    },
    [selectionManager]
  );

  const clearSelection = useCallback(() => {
    selectionManager.clearSelection();
  }, [selectionManager]);

  const setCurrentPage = useCallback(
    (pageId: string) => {
      pageManager.setCurrentPage(pageId);
    },
    [pageManager]
  );

  const getDocument = useCallback(() => documentRef.current, []);

  return {
    document,
    getDocument,
    objectManager,
    selectionManager,
    pageManager,
    initializeFromPdfLoad,
    resetTWPdfDocument,
    syncFromFabricState,
    syncAllFromCanvasStates,
    handleDuplicatePage,
    handleDeletePage,
    selectObject,
    clearSelection,
    setCurrentPage,
  };
}
