'use client';

import { useState, useRef, useCallback } from 'react';
import { ZOOM_LEVELS } from '@/lib/twpdf/core';
import { createTextbox, createShape, insertObjectOnCanvas } from '@/lib/twpdf/editor';
import { exportPdf, downloadPdfBytes } from '@/lib/twpdf/export';
import { hexToRgbaStr } from '@/lib/twpdf/utils';
import type { EditMode, PageDimensions, PageItem, ShapeType, TextBoxInfo } from '@/types/pdf';

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
  handleUndo: () => void;
  handleRedo: () => void;
  handleDeleteSelected: () => void;
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
  handleUndo,
  handleRedo,
  handleDeleteSelected,
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

  const handleZoomOut = useCallback(() => {
    setZoomIndex((prev) => (prev > 0 ? prev - 1 : prev));
  }, []);

  const handleZoomIn = useCallback(() => {
    setZoomIndex((prev) => (prev < ZOOM_LEVELS.length - 1 ? prev + 1 : prev));
  }, []);

  const insertObjectOnActiveCanvas = useCallback(
    (obj: { set: (props: { left: number; top: number }) => void }) => {
      const canvas = getActiveCanvas() as Parameters<typeof insertObjectOnCanvas>[0] | null;
      if (!canvas) return;
      insertObjectOnCanvas(canvas, obj, zoomScale);
    },
    [getActiveCanvas, zoomScale]
  );

  const handleAddText = useCallback(() => {
    if (!fabricLib) return;
    const text = createTextbox({
      fabricLib: fabricLib as Parameters<typeof createTextbox>[0]['fabricLib'],
      fontSize,
      fontFamily,
      strokeColor,
      fillColor,
      strokeWidth,
    });
    insertObjectOnActiveCanvas(text as { set: (props: { left: number; top: number }) => void });
    setEditMode('select');
  }, [fabricLib, fontSize, fontFamily, strokeColor, fillColor, strokeWidth, insertObjectOnActiveCanvas]);

  const handleAddImage = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!fabricLib || !e.target.files?.[0]) return;
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          (fabricLib.Image as any).fromURL(
            event.target.result as string,
            (img: any) => {
              const maxDim = 150;
              if (img.width > maxDim || img.height > maxDim) {
                img.scaleToWidth(maxDim);
              }
              img.set({
                borderColor: '#3b82f6',
                cornerColor: '#3b82f6',
                cornerSize: 8,
                transparentCorners: false,
              });
              insertObjectOnActiveCanvas(img);
            }
          );
        }
      };
      reader.readAsDataURL(file);
      if (imageUploadRef.current) imageUploadRef.current.value = '';
      setEditMode('select');
    },
    [fabricLib, insertObjectOnActiveCanvas]
  );

  const handleAddShape = useCallback(
    (shapeType: ShapeType) => {
      if (!fabricLib) return;
      const shape = createShape(shapeType, {
        fabricLib: fabricLib as Parameters<typeof createShape>[1]['fabricLib'],
        fontSize,
        fontFamily,
        strokeColor,
        fillColor,
        strokeWidth,
      });
      if (shape) {
        insertObjectOnActiveCanvas(shape as { set: (props: { left: number; top: number }) => void });
        setEditMode('select');
      }
    },
    [fabricLib, fontSize, fontFamily, strokeColor, fillColor, strokeWidth, insertObjectOnActiveCanvas]
  );

  const handleSaveSignature = useCallback(
    (sigUrl: string) => {
      if (!fabricLib) return;
      (fabricLib.Image as any).fromURL(
        sigUrl,
        (img: any) => {
          img.scaleToWidth(180);
          img.set({
            borderColor: '#3b82f6',
            cornerColor: '#3b82f6',
            cornerSize: 8,
            transparentCorners: false,
          });
          insertObjectOnActiveCanvas(img);
        }
      );
    },
    [fabricLib, insertObjectOnActiveCanvas]
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
      add: (obj: unknown) => void;
      discardActiveObject: () => void;
      setActiveObject: (obj: unknown) => void;
      requestRenderAll: () => void;
      fire: (event: string) => void;
    } | null;
    if (!canvas || !fabricLib) return;
    const activeObj = canvas.getActiveObject();
    if (!activeObj) return;

    const highlightBox = new fabricLib.Rect({
      left: activeObj.left,
      top: activeObj.top,
      width: activeObj.width * (activeObj.scaleX || 1),
      height: activeObj.height * (activeObj.scaleY || 1),
      angle: activeObj.angle || 0,
      fill: hexToRgbaStr(strokeColor || '#fbbf24', 0.4),
      stroke: 'transparent',
      strokeWidth: 0,
      isHighlight: true,
      borderColor: '#3b82f6',
      cornerColor: '#3b82f6',
      cornerSize: 8,
      transparentCorners: false,
    } as any);

    canvas.add(highlightBox);
    (highlightBox as { sendToBack: () => void }).sendToBack();
    canvas.discardActiveObject();
    canvas.setActiveObject(highlightBox);
    canvas.requestRenderAll();
    canvas.fire('object:modified');

    setSuccess('Selected text highlighted.');
    setTimeout(() => setSuccess(null), 3000);
  }, [getActiveCanvas, fabricLib, strokeColor, setSuccess]);

  const handleDuplicatePage = useCallback(
    (idx: number) => {
      setPageList((prev) => {
        const duplicated = [...prev];
        const sourcePage = duplicated[idx];
        const newPageItem = {
          id: `page_${sourcePage.originalPageNum}_dup_${Date.now()}`,
          originalPageNum: sourcePage.originalPageNum,
        };

        const sourceState = canvasStates[sourcePage.id];
        if (sourceState) {
          setCanvasStates((prevStates) => ({
            ...prevStates,
            [newPageItem.id]: JSON.parse(JSON.stringify(sourceState)),
          }));
        }

        duplicated.splice(idx + 1, 0, newPageItem);
        onPageDuplicated?.(sourcePage.id, newPageItem.id, idx);
        return duplicated;
      });
      setSuccess('Page duplicated successfully!');
      setTimeout(() => setSuccess(null), 3000);
    },
    [setPageList, canvasStates, setCanvasStates, setSuccess, onPageDuplicated]
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
    setProcessingStatus('Starting high-resolution flattening export...');
    setError(null);
    setSuccess(null);

    try {
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

      setSuccess('PDF flattened and exported successfully!');
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
    handleUndo,
    handleRedo,
    handleDeleteSelected,
  };
}
