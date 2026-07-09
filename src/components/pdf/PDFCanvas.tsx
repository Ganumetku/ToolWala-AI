"use client";

import React, { useRef, useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import {
  detectTextColorFromCanvas,
  detectBackgroundColorFromCanvas,
  detectTextWeightFromCanvas,
} from '@/lib/twpdf/parser';
import {
  isOriginalTextEdited,
  setupBrushes,
  applyObjectSnapping,
} from '@/lib/twpdf/editor';
import { CANVAS_JSON_PROPS } from '@/lib/twpdf/core';
import { hexToRgbaStr } from '@/lib/twpdf/utils';
import type { PageRendererProps, TextBoxInfo } from '@/types/pdf';

// -------------------------------------------------------------
// VIRTUALIZED PAGE CONTAINER WRAPPER USING INTERSECTION OBSERVER
// -------------------------------------------------------------
interface PageWrapperProps {
  pageId: string;
  pageNum: number;
  originalPageNum: number;
  width: number;
  height: number;
  zoomScale: number;
  editMode: string;
  pdfDoc: any;
  fabricLib: any;
  canvasState: any;
  saveCanvasState: (pageId: string, state: any) => void;
  onFocusCanvas: (pageId: string, fbCanvas: any) => void;
  onObjectSelected: (pageId: string, activeObj: any) => void;
  onObjectCleared: () => void;
  strokeColor: string;
  fillColor: string;
  strokeWidth: number;
  brushWidth: number;
  fontFamily: string;
  fontSize: number;
  originalTexts: Record<number, TextBoxInfo[]>;
  registerCanvasInstance?: (pageId: string, canvas: any) => void;
  unregisterCanvasInstance?: (pageId: string) => void;
}

const PDFPageWrapper = ({
  pageId,
  pageNum,
  originalPageNum,
  width,
  height,
  zoomScale,
  editMode,
  pdfDoc,
  fabricLib,
  canvasState,
  saveCanvasState,
  onFocusCanvas,
  onObjectSelected,
  onObjectCleared,
  strokeColor,
  fillColor,
  strokeWidth,
  brushWidth,
  fontFamily,
  fontSize,
  originalTexts,
  registerCanvasInstance,
  unregisterCanvasInstance
}: PageWrapperProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsIntersecting(entry.isIntersecting);
        });
      },
      {
        root: null, // viewport
        rootMargin: '800px', // Pre-render pages 800px before they scroll into view
        threshold: 0.01
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full bg-white relative rounded-2xl select-none">
      {isIntersecting ? (
        <PageRenderer
          pageId={pageId}
          pageNum={pageNum}
          originalPageNum={originalPageNum}
          width={width}
          height={height}
          zoomScale={zoomScale}
          editMode={editMode}
          pdfDoc={pdfDoc}
          fabricLib={fabricLib}
          canvasState={canvasState}
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
        />
      ) : (
        // skeleton placeholder
        <div className="absolute inset-0 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center select-none pointer-events-none">
          <div className="flex flex-col items-center gap-2">
            <RefreshCw className="w-6 h-6 text-slate-700 animate-spin" />
            <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Loading page {pageNum}...</span>
          </div>
        </div>
      )}
    </div>
  );
};

// -------------------------------------------------------------
// DETAILED CANVAS LAYER & INTERACTION MANAGER
// -------------------------------------------------------------
const PageRenderer = ({
  pageId,
  pageNum,
  originalPageNum,
  width,
  height,
  zoomScale,
  editMode,
  pdfDoc,
  fabricLib,
  canvasState,
  saveCanvasState,
  onFocusCanvas,
  onObjectSelected,
  onObjectCleared,
  strokeColor,
  fillColor,
  strokeWidth,
  brushWidth,
  fontFamily,
  fontSize,
  originalTexts,
  registerCanvasInstance,
  unregisterCanvasInstance
}: PageRendererProps) => {
  const pdfCanvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasInstance = useRef<any>(null);
  const [isBackgroundRendered, setIsBackgroundRendered] = useState(false);



  // 1. PDF.js background rendering
  useEffect(() => {
    let active = true;
    const renderPageBackground = async () => {
      if (!pdfDoc || !pdfCanvasRef.current) return;
      try {
        const page = await pdfDoc.getPage(originalPageNum);
        
        if (!active || !pdfCanvasRef.current) return;
        const canvas = pdfCanvasRef.current;
        const pixelRatio = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
        const renderScale = Math.max(2.0, pixelRatio);

        // Render PDF directly to a high-res viewport instead of stretching with canvas transform
        const highResViewport = page.getViewport({ scale: zoomScale * renderScale });

        canvas.width = highResViewport.width;
        canvas.height = highResViewport.height;
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          await page.render({
            canvasContext: ctx,
            viewport: highResViewport
          }).promise;
          setIsBackgroundRendered(true);
        }
      } catch (e) {
        console.error(`PDF.js page ${originalPageNum} rendering failed`, e);
      }
    };

    renderPageBackground();
    return () => {
      active = false;
    };
  }, [pdfDoc, originalPageNum, zoomScale]);

  // 2. Fabric.js setup and overlays
  useEffect(() => {
    if (!fabricLib || !fabricCanvasRef.current || !isBackgroundRendered) return;

    // Enforce high-DPI scaling explicitly on the client to override Next.js/SSR defaults of 1
    const pixelRatio = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
    fabricLib.devicePixelRatio = pixelRatio;

    const fbWidth = Math.round(width * zoomScale);
    const fbHeight = Math.round(height * zoomScale);

    // Create Fabric Canvas
    const fbCanvas = new fabricLib.Canvas(fabricCanvasRef.current, {
      width: fbWidth,
      height: fbHeight,
      backgroundColor: 'transparent',
      selection: editMode === 'select',
      enableRetinaScaling: true,
      imageSmoothingEnabled: true
    });

    fabricCanvasInstance.current = fbCanvas;
    if (typeof window !== 'undefined') {
      (window as any).fabricCanvas = fbCanvas;
    }
    if (registerCanvasInstance) {
      registerCanvasInstance(pageId, fbCanvas);
    }

    // Apply zoom
    fbCanvas.setZoom(zoomScale);
    fbCanvas.setDimensions({
      width: fbWidth,
      height: fbHeight
    });

    // Smart Snapping implementation
    fbCanvas.on('object:moving', (options: any) => {
      const obj = options.target;
      if (!obj) return;
      applyObjectSnapping(obj, width, height);
    });

    // Populate state from history or original texts
    if (canvasState) {
      const stateCopy = JSON.parse(JSON.stringify(canvasState));
      stateCopy.viewportTransform = [zoomScale, 0, 0, zoomScale, 0, 0];
      fbCanvas.loadFromJSON(stateCopy, () => {
        fbCanvas.setZoom(zoomScale);
        fbCanvas.setDimensions({
          width: Math.round(width * zoomScale),
          height: Math.round(height * zoomScale)
        });
        fbCanvas.renderAll();
      });
    } else {
      const textBoxesForPage = originalTexts[originalPageNum] || [];
      if (textBoxesForPage.length > 0) {
        textBoxesForPage.forEach((box: any) => {
          // Detect properties from background canvas
          const detectedColor = detectTextColorFromCanvas(pdfCanvasRef.current, box, zoomScale);
          const detectedBgColor = detectBackgroundColorFromCanvas(pdfCanvasRef.current, box, zoomScale);
          const detectedWeight = detectTextWeightFromCanvas(pdfCanvasRef.current, box, zoomScale);

          const isReplaced = box.replacedText !== undefined;
          const displayText = isReplaced ? box.replacedText : box.text;

          const activeWeight = (box.fontWeight === 'bold' || detectedWeight === 'bold') ? 'bold' : 'normal';

          const textbox = new fabricLib.Textbox(displayText, {
            id: box.id,
            left: box.x,
            top: box.y,
            width: box.width,
            height: box.height,
            fontSize: box.fontSize,
            angle: box.angle || 0,
            fontWeight: activeWeight,
            fontStyle: box.fontStyle || 'normal',
            fontFamily: box.fontFamily || 'Helvetica',
            padding: 0,
            lineHeight: 1.0,
            fill: isReplaced ? (box.replacedColor || detectedColor) : 'transparent',
            backgroundColor: isReplaced ? 'transparent' : 'rgba(255, 255, 255, 0.001)', // invisible but registers clicks perfectly
            isOriginalText: true,
            originalTextData: {
              text: box.text,
              x: box.x,
              y: box.y,
              width: box.width,
              height: box.height,
              fontSize: box.fontSize,
              angle: box.angle || 0,
              fontWeight: activeWeight,
              fontStyle: box.fontStyle || 'normal',
              fontFamily: box.fontFamily || 'Helvetica',
              detectedColor: detectedColor,
              detectedBgColor: detectedBgColor
            },
            selectable: true,
            editable: true,
            evented: true,
            hasControls: true,
            lockScalingY: true,
            borderColor: '#3b82f6',
            cornerColor: '#3b82f6',
            cornerSize: 8,
            transparentCorners: false,
            hasRotatingPoint: true,
            stroke: 'transparent',
            strokeWidth: 1
          });

          // Hook editing events directly on the textbox to manage fill transparency
          textbox.on('editing:entered', () => {
            const detectedColor = textbox.originalTextData?.detectedColor || '#0b2c8c';
            textbox.set({
              fill: textbox.fill === 'transparent' ? detectedColor : textbox.fill,
              backgroundColor: 'transparent', // Transparent background
              stroke: 'transparent'
            });
            fbCanvas.requestRenderAll();
          });

          textbox.on('editing:exited', () => {
            if (!isOriginalTextEdited(textbox)) {
              textbox.set({
                fill: 'transparent',
                backgroundColor: 'rgba(255, 255, 255, 0.001)',
                stroke: 'transparent'
              });
              fbCanvas.requestRenderAll();
            }
          });

          fbCanvas.add(textbox);
        });
        fbCanvas.renderAll();
        // save initial state
        const state = fbCanvas.toJSON([...CANVAS_JSON_PROPS]);
        saveCanvasState(pageId, state);
      }
    }

    // Custom render loop hook to paint whiteout masks underneath textboxes on screen
    fbCanvas.on('before:render', () => {
      const ctx = fbCanvas.getContext();
      ctx.save();
      const v = fbCanvas.viewportTransform;
      if (v) {
        ctx.transform(v[0], v[1], v[2], v[3], v[4], v[5]);
      }
      
      fbCanvas.forEachObject((obj: any) => {
        if (obj.isOriginalText) {
          const isEdited = isOriginalTextEdited(obj);
          const isEditing = obj.isEditing;
          if (isEdited || isEditing) {
            const orig = obj.originalTextData;
            const padX = 2;
            const padY = 2; // full coverage, no shrinking
            ctx.fillStyle = orig.detectedBgColor || '#ffffff';
            ctx.fillRect(
              orig.x - padX,
              orig.y - padY,
              orig.width + padX * 2,
              orig.height + padY * 2
            );
          }
        }
      });
      ctx.restore();
    });

    // Brush Setup
    setupBrushes(fbCanvas, editMode, strokeColor, brushWidth);

    // Event hooks selection
    const handleSelection = () => {
      const activeObj = fbCanvas.getActiveObject();
      if (activeObj) {
        onObjectSelected(pageId, activeObj);
      } else {
        onObjectCleared();
      }
    };

    fbCanvas.on('selection:created', handleSelection);
    fbCanvas.on('selection:updated', handleSelection);
    fbCanvas.on('selection:cleared', () => {
      fbCanvas.forEachObject((obj: any) => {
        if (obj.isOriginalText) {
          if (!isOriginalTextEdited(obj)) {
            obj.set({
              fill: 'transparent',
              backgroundColor: 'rgba(255, 255, 255, 0.001)',
              stroke: 'transparent'
            });
          }
        }
      });
      fbCanvas.requestRenderAll();
      onObjectCleared();
    });

    // Handled via object-level editing:entered and editing:exited listeners

    // Hover bounding box outlines for guides
    fbCanvas.on('mouse:over', (e: any) => {
      const obj = e.target;
      if (obj && obj.isOriginalText && editMode === 'edit-text') {
        // Only show dashed border if transparent/unedited
        if (obj.fill === 'transparent') {
          obj.set({
            stroke: '#3b82f6',
            strokeDashArray: [4, 4],
            strokeWidth: 1.5
          });
          fbCanvas.requestRenderAll();
        }
      }
    });

    fbCanvas.on('mouse:out', (e: any) => {
      const obj = e.target;
      if (obj && obj.isOriginalText && editMode === 'edit-text') {
        if (obj.fill === 'transparent') {
          obj.set({
            stroke: 'transparent'
          });
          fbCanvas.requestRenderAll();
        }
      }
    });

    // MouseDown focus
    fbCanvas.on('mouse:down', () => {
      onFocusCanvas(pageId, fbCanvas);
    });

    // Auto save JSON
    const handleSaveState = () => {
      const state = fbCanvas.toJSON([...CANVAS_JSON_PROPS]);
      saveCanvasState(pageId, state);
    };

    const handleTextChanged = (e: any) => {
      const obj = e.target;
      if (obj && obj.isOriginalText && (obj.type === 'textbox' || obj.type === 'i-text')) {
        const origWidth = obj.originalTextData?.width || obj.width || 0;
        obj.set({ width: 9999 });
        let maxLineWidth = 0;
        const linesList = obj.text.split('\n');
        for (let i = 0; i < linesList.length; i++) {
          const lineWidth = obj.measureLine(i).width || 0;
          if (lineWidth > maxLineWidth) {
            maxLineWidth = lineWidth;
          }
        }
        const newWidth = Math.max(origWidth, maxLineWidth + 10);
        obj.set({ width: newWidth });
        fbCanvas.requestRenderAll();
      }
      handleSaveState();
    };

    fbCanvas.on('object:added', handleSaveState);
    fbCanvas.on('object:modified', handleSaveState);
    fbCanvas.on('object:removed', handleSaveState);
    fbCanvas.on('path:created', handleSaveState);
    fbCanvas.on('text:changed', handleTextChanged);
    fbCanvas.on('editing:exited', handleSaveState);

    return () => {
      fbCanvas.off('selection:created', handleSelection);
      fbCanvas.off('selection:updated', handleSelection);
      fbCanvas.off('object:added', handleSaveState);
      fbCanvas.off('object:modified', handleSaveState);
      fbCanvas.off('object:removed', handleSaveState);
      fbCanvas.off('path:created', handleSaveState);
      fbCanvas.off('text:changed', handleTextChanged);
      fbCanvas.off('editing:exited', handleSaveState);
      if (unregisterCanvasInstance) {
        unregisterCanvasInstance(pageId);
      }
      fbCanvas.dispose();
      fabricCanvasInstance.current = null;
    };
  }, [fabricLib, isBackgroundRendered, zoomScale]);

  // Sync mode changes to active canvas options
  useEffect(() => {
    const fbCanvas = fabricCanvasInstance.current;
    if (!fbCanvas) return;

    fbCanvas.isDrawingMode = false;
    fbCanvas.selection = editMode === 'select';

    fbCanvas.forEachObject((obj: any) => {
      if (obj.isOriginalText) {
        obj.selectable = editMode === 'edit-text' || editMode === 'select';
        obj.editable = editMode === 'edit-text';
      } else {
        obj.selectable = editMode === 'select';
      }
    });

    if (editMode === 'draw' || editMode === 'highlight-free') {
      fbCanvas.isDrawingMode = true;
      setupBrushes(fbCanvas, editMode, strokeColor, brushWidth);
    }

    fbCanvas.requestRenderAll();
  }, [editMode]);

  // Brush changes
  useEffect(() => {
    const fbCanvas = fabricCanvasInstance.current;
    if (fbCanvas) setupBrushes(fbCanvas, editMode, strokeColor, brushWidth);
  }, [strokeColor, brushWidth]);

  return (
    <div className="absolute inset-0 w-full h-full select-none rounded-2xl">
      <canvas ref={pdfCanvasRef} className="absolute inset-0 w-full h-full pointer-events-none rounded-2xl bg-white" />
      <div className="absolute inset-0 z-10 rounded-2xl">
        <canvas ref={fabricCanvasRef} />
      </div>
    </div>
  );
};

export { PDFPageWrapper };
export default PDFPageWrapper;
