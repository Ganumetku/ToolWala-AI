'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { ZOOM_LEVELS } from '@/lib/twpdf/core';
import { exportPdf, downloadPdfBytes } from '@/lib/twpdf/export';
import { applyPdfEditsViaEngine } from '@/lib/pdf-engine/client';
import { collectOriginalTextEdits } from '@/lib/pdf-engine/collectEdits';
import {
  buildTextObject,
  buildShapeObject,
  buildImageObject,
  buildSignatureObject,
  buildHighlightFromTextBounds,
} from '@/lib/twpdf/editing/objectBuilders';
import type { TWPDFEditingEngine } from '@/lib/twpdf/editing/editingEngine';
import type { EditMode, PageDimensions, PageItem } from '@/types/pdf';
import type { TWPDFShapeKind } from '@/types/twpdf';

interface UsePdfEditorOptions {
  fabricLib: typeof import('fabric').fabric | null;
  pdfBytes: Uint8Array | null;
  pdfFile: File | null;
  pdfDocRef: React.MutableRefObject<unknown>;
  pageList: PageItem[];
  setPageList: React.Dispatch<React.SetStateAction<PageItem[]>>;
  pageDimensions: Record<number, PageDimensions>;
  canvasStates: Record<string, unknown>;
  canvasInstances: React.MutableRefObject<Record<string, unknown>>;
  activePageId: string | null;
  setActivePageId: React.Dispatch<React.SetStateAction<string | null>>;
  getActiveCanvas: () => unknown;
  setIsProcessing: (v: boolean) => void;
  setProcessingStatus: (v: string) => void;
  setError: (v: string | null) => void;
  setSuccess: (v: string | null) => void;
  resetDocument: () => void;
  resetHistory: () => void;
  setCanvasStates: React.Dispatch<React.SetStateAction<Record<string, unknown>>>;
  engine: TWPDFEditingEngine | null;
  onZoomScaleChange?: (scale: number) => void;
  onPageDuplicated?: (sourcePageId: string, newPageId: string, insertAfterIndex: number) => void;
  onPageDeleted?: (pageId: string) => void;
}

export function usePdfEditor({
  fabricLib,
  pdfBytes,
  pdfFile,
  pdfDocRef,
  pageList,
  setPageList,
  pageDimensions,
  canvasStates,
  canvasInstances,
  activePageId,
  setActivePageId,
  getActiveCanvas,
  setIsProcessing,
  setProcessingStatus,
  setError,
  setSuccess,
  resetDocument,
  resetHistory,
  setCanvasStates,
  engine,
  onZoomScaleChange,
  onPageDuplicated,
  onPageDeleted,
}: UsePdfEditorOptions) {
  const workspaceRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageUploadRef = useRef<HTMLInputElement>(null);

  const [editMode, setEditMode] = useState<EditMode>('select');
  const [zoomIndex, setZoomIndex] = useState<number>(2);
  const [strokeColor, setStrokeColor] = useState<string>('#3b82f6');
  const [fillColor, setFillColor] = useState<string>('transparent');
  const [strokeWidth, setStrokeWidth] = useState<number>(3);
  const [brushWidth, setBrushWidth] = useState<number>(5);
  const [fontFamily, setFontFamily] = useState<string>('Helvetica');
  const [fontSize, setFontSize] = useState<number>(16);
  const [isSigModalOpen, setIsSigModalOpen] = useState(false);

  const zoomScale = ZOOM_LEVELS[zoomIndex];

  useEffect(() => {
    onZoomScaleChange?.(zoomScale);
  }, [zoomScale, onZoomScaleChange]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).setEditMode = setEditMode;
      (window as any).__twPdfE2e = {
        countInkObjects: () => {
          let n = 0;
          Object.values(canvasInstances.current).forEach((canvas) => {
            const c = canvas as { forEachObject?: (cb: (o: { isOriginalText?: boolean; type?: string }) => void) => void };
            c.forEachObject?.((o) => {
              const t = o.type || '';
              if (!o.isOriginalText && t !== 'textbox' && t !== 'i-text' && t !== 'text') n += 1;
            });
          });
          return n;
        },
      };
    }
    return () => {
      if (typeof window !== 'undefined') {
        delete (window as any).setEditMode;
        delete (window as any).__twPdfE2e;
      }
    };
  }, [setEditMode, canvasInstances]);

  const handleZoomOut = useCallback(() => {
    setZoomIndex((prev) => (prev > 0 ? prev - 1 : prev));
  }, []);

  const handleZoomIn = useCallback(() => {
    setZoomIndex((prev) => (prev < ZOOM_LEVELS.length - 1 ? prev + 1 : prev));
  }, []);

  const getActivePageId = useCallback(() => {
    return activePageId || pageList[0]?.id || null;
  }, [activePageId, pageList]);

  const getCanvasCenter = useCallback(() => {
    const canvas = getActiveCanvas() as {
      getCenter: () => { left: number; top: number };
    } | null;
    if (!canvas) return { centerX: 100, centerY: 100 };
    const center = canvas.getCenter();
    return { centerX: center.left / zoomScale, centerY: center.top / zoomScale };
  }, [getActiveCanvas, zoomScale]);

  const handleAddText = useCallback(() => {
    const pageId = getActivePageId();
    if (!engine || !pageId) return;
    const ctx = getCanvasCenter();
    const textObj = buildTextObject({ fontSize, fontFamily, strokeColor }, ctx);
    engine.createObject(pageId, textObj);
    setEditMode('select');
  }, [engine, getActivePageId, getCanvasCenter, fontSize, fontFamily, strokeColor]);

  const handleAddImage = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!fabricLib || !engine || !e.target.files?.[0]) return;
      const pageId = getActivePageId();
      if (!pageId) return;

      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (!event.target?.result) return;
        const src = event.target.result as string;
        (fabricLib.Image as any).fromURL(src, (img: any) => {
          const maxDim = 150;
          let scaleX = 1;
          let scaleY = 1;
          if (img.width > maxDim || img.height > maxDim) {
            const scale = maxDim / Math.max(img.width, img.height);
            scaleX = scale;
            scaleY = scale;
          }
          const ctx = getCanvasCenter();
          const imageObj = buildImageObject(
            src,
            { width: img.width, height: img.height, scaleX, scaleY },
            ctx
          );
          engine.createObject(pageId, imageObj);
        });
      };
      reader.readAsDataURL(file);
      if (imageUploadRef.current) imageUploadRef.current.value = '';
      setEditMode('select');
    },
    [fabricLib, engine, getActivePageId, getCanvasCenter]
  );

  const SHAPE_MAP: Record<string, TWPDFShapeKind> = {
    rect: 'rectangle',
    circle: 'circle',
    line: 'line',
    arrow: 'arrow',
  };

  const handleAddShape = useCallback(
    (shapeType: import('@/types/pdf').ShapeType) => {
      const pageId = getActivePageId();
      if (!engine || !pageId) return;
      const shapeKind = SHAPE_MAP[shapeType];
      if (!shapeKind) return;
      const ctx = getCanvasCenter();
      const shapeObj = buildShapeObject(shapeKind, { strokeColor, fillColor, strokeWidth }, ctx);
      engine.createObject(pageId, shapeObj);
      setEditMode('select');
    },
    [engine, getActivePageId, getCanvasCenter, strokeColor, fillColor, strokeWidth]
  );

  const handleSaveSignature = useCallback(
    (sigUrl: string) => {
      if (!fabricLib || !engine) return;
      const pageId = getActivePageId();
      if (!pageId) return;

      (fabricLib.Image as any).fromURL(sigUrl, (img: any) => {
        const scaleX = 180 / img.width;
        const ctx = getCanvasCenter();
        const sigObj = buildSignatureObject(sigUrl, { width: img.width, height: img.height, scaleX }, ctx);
        engine.createObject(pageId, sigObj);
      });
    },
    [fabricLib, engine, getActivePageId, getCanvasCenter]
  );

  const handleHighlightSelectedText = useCallback(() => {
    const canvas = getActiveCanvas() as {
      getActiveObject: () => {
        left: number;
        top: number;
        width: number;
        height: number;
        scaleX?: number;
        scaleY?: number;
        angle?: number;
      } | null;
    } | null;
    const pageId = getActivePageId();
    if (!canvas || !engine || !pageId) return;
    const activeObj = canvas.getActiveObject();
    if (!activeObj) return;

    const highlightObj = buildHighlightFromTextBounds(
      {
        left: activeObj.left,
        top: activeObj.top,
        width: activeObj.width * (activeObj.scaleX || 1),
        height: activeObj.height * (activeObj.scaleY || 1),
        angle: activeObj.angle || 0,
      },
      strokeColor
    );
    engine.createObject(pageId, highlightObj);

    setSuccess('Selected text highlighted.');
    setTimeout(() => setSuccess(null), 3000);
  }, [getActiveCanvas, engine, getActivePageId, strokeColor, setSuccess]);

  const handleDuplicatePage = useCallback(
    (idx: number) => {
      setPageList((prev) => {
        const duplicated = [...prev];
        const sourcePage = duplicated[idx];
        const newPageItem = {
          id: `page_${sourcePage.originalPageNum}_dup_${Date.now()}`,
          originalPageNum: sourcePage.originalPageNum,
        };

        duplicated.splice(idx + 1, 0, newPageItem);
        onPageDuplicated?.(sourcePage.id, newPageItem.id, idx);
        return duplicated;
      });
      setSuccess('Page duplicated successfully!');
      setTimeout(() => setSuccess(null), 3000);
    },
    [setPageList, setSuccess, onPageDuplicated]
  );

  const handleDeletePage = useCallback(
    (idx: number) => {
      if (pageList.length <= 1) {
        setError('Cannot delete the only page in the document.');
        setTimeout(() => setError(null), 3500);
        return;
      }

      setPageList((prev) => {
        const deletedPageId = prev[idx].id;
        const updated = prev.filter((_, i) => i !== idx);
        if (activePageId === prev[idx].id) {
          setActivePageId(updated[Math.max(0, idx - 1)].id);
        }
        onPageDeleted?.(deletedPageId);
        return updated;
      });
      setSuccess('Page deleted from workspace.');
      setTimeout(() => setSuccess(null), 3000);
    },
    [pageList.length, activePageId, setPageList, setActivePageId, setError, setSuccess, onPageDeleted]
  );

  const handleExportPDF = useCallback(async () => {
    if (!pdfBytes || pageList.length === 0 || !fabricLib) return;

    setIsProcessing(true);
    setProcessingStatus('Compiling vector PDF (unedited pages copied as-is)...');
    setError(null);
    setSuccess(null);

    try {
      const { edits, hasNonTextMarkup } = collectOriginalTextEdits({
        pageList,
        canvasStates,
        canvasInstances: canvasInstances.current,
      });

      if (pdfFile && edits.length > 0 && !hasNonTextMarkup) {
        try {
          setProcessingStatus('Rewriting text with original PDF fonts...');
          const blob = await applyPdfEditsViaEngine(pdfFile, edits);
          const finalBytes = new Uint8Array(await blob.arrayBuffer());
          downloadPdfBytes(finalBytes, `edited_${pdfFile.name || 'document.pdf'}`);
          setSuccess('PDF saved — original font operators rewritten.');
          setTimeout(() => setSuccess(null), 4000);
          return;
        } catch (engineErr) {
          console.warn('PDF engine unavailable, using browser export', engineErr);
          setProcessingStatus('Engine offline — compiling in the browser...');
        }
      }

      const finalBytes = await exportPdf({
        pdfBytes,
        pageList,
        pageDimensions,
        canvasStates,
        canvasInstances: canvasInstances.current,
        pdfDoc: pdfDocRef.current,
        fabricLib,
        zoomScale,
        fileName: pdfFile?.name,
        onStatus: setProcessingStatus,
      });

      downloadPdfBytes(finalBytes, `edited_${pdfFile?.name || 'document.pdf'}`);

      setSuccess('PDF exported successfully!');
      setTimeout(() => setSuccess(null), 4000);
    } catch (err) {
      console.error(err);
      setError('Failed to export PDF file. Error compiling pages.');
    } finally {
      setIsProcessing(false);
    }
  }, [
    pdfBytes,
    pageList,
    fabricLib,
    pageDimensions,
    canvasStates,
    pdfDocRef,
    zoomScale,
    pdfFile,
    setIsProcessing,
    setProcessingStatus,
    setError,
    setSuccess,
  ]);

  const handleReset = useCallback(() => {
    resetDocument();
    resetHistory();
    setZoomIndex(2);
  }, [resetDocument, resetHistory]);

  const handleWorkspaceScroll = useCallback(() => {
    if (!workspaceRef.current || pageList.length === 0) return;
    const scrollContainer = workspaceRef.current;
    const containerTop = scrollContainer.getBoundingClientRect().top;
    const containerHeight = scrollContainer.clientHeight;
    const containerCenter = containerTop + containerHeight / 2;

    let closestPageId = activePageId;
    let minDistance = Infinity;

    pageList.forEach((item) => {
      const el = document.getElementById(`page-wrapper-${item.id}`);
      if (el) {
        const rect = el.getBoundingClientRect();
        const pageCenter = rect.top + rect.height / 2;
        const distance = Math.abs(pageCenter - containerCenter);
        if (distance < minDistance) {
          minDistance = distance;
          closestPageId = item.id;
        }
      }
    });

    if (closestPageId && closestPageId !== activePageId) {
      setActivePageId(closestPageId);
    }
  }, [pageList, activePageId, setActivePageId]);

  const handleFocusCanvas = useCallback(
    (pageId: string) => {
      setActivePageId(pageId);
      Object.entries(canvasInstances.current).forEach(([id, canvas]) => {
        if (id !== pageId && canvas) {
          (canvas as { discardActiveObject: () => void; requestRenderAll: () => void }).discardActiveObject();
          (canvas as { requestRenderAll: () => void }).requestRenderAll();
        }
      });
    },
    [setActivePageId]
  );

  const registerCanvasInstance = useCallback((pageId: string, canvas: unknown) => {
    canvasInstances.current[pageId] = canvas;
  }, []);

  const unregisterCanvasInstance = useCallback((pageId: string) => {
    delete canvasInstances.current[pageId];
  }, []);

  return {
    workspaceRef,
    fileInputRef,
    imageUploadRef,
    editMode,
    setEditMode,
    zoomIndex,
    zoomScale,
    strokeColor,
    setStrokeColor,
    fillColor,
    setFillColor,
    strokeWidth,
    setStrokeWidth,
    brushWidth,
    setBrushWidth,
    fontFamily,
    setFontFamily,
    fontSize,
    setFontSize,
    isSigModalOpen,
    setIsSigModalOpen,
    handleZoomOut,
    handleZoomIn,
    handleAddText,
    handleAddImage,
    handleAddShape,
    handleSaveSignature,
    handleHighlightSelectedText,
    handleDuplicatePage,
    handleDeletePage,
    handleExportPDF,
    handleReset,
    handleWorkspaceScroll,
    handleFocusCanvas,
    registerCanvasInstance,
    unregisterCanvasInstance,
  };
}
