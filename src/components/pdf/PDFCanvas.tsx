"use client";

import React, { useRef, useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import {
  detectTextColorFromCanvas,
  detectBackgroundColorFromCanvas,
} from '@/lib/twpdf/parser';
import {
  isOriginalTextEdited,
  setupBrushes,
  applyObjectSnapping,
} from '@/lib/twpdf/editor';
import { CANVAS_JSON_PROPS } from '@/lib/twpdf/core';
import { getIsRenderingFromEngine } from '@/lib/twpdf/editing/renderer/fabricRenderer';
import { hexToRgbaStr } from '@/lib/twpdf/utils';
import type { PageRendererProps, TextBoxInfo } from '@/types/pdf';
import { SelectionEngine } from '@/lib/tw-engine/editor/SelectionEngine';
import { TextLayout } from '@/lib/tw-engine/text/TextLayout';
import { RenderEngine } from '@/lib/tw-engine/editor/RenderEngine';
import { EditModeManager } from '@/lib/tw-engine/editing/EditModeManager';
import { EditingSession } from '@/lib/tw-engine/editing/EditingSession';
import { EditingValidator } from '@/lib/tw-engine/editing/EditingValidator';
import { FocusManager } from '@/lib/tw-engine/editing/FocusManager';
import { CursorManager } from '@/lib/tw-engine/editing/CursorManager';

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
  onFabricModified?: (pageId: string, fabricObj: Record<string, unknown>) => void;
  onFabricAdded?: (pageId: string, fabricObj: Record<string, unknown>) => void;
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
  unregisterCanvasInstance,
  onFabricModified,
  onFabricAdded
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
          onFabricModified={onFabricModified}
          onFabricAdded={onFabricAdded}
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
const getLocalPointer = (obj: any, pointer: { x: number; y: number }): { x: number; y: number } => {
  const dx = pointer.x - (obj.left || 0);
  const dy = pointer.y - (obj.top || 0);
  const angleRad = -((obj.angle || 0) * Math.PI) / 180;
  const rotatedX = dx * Math.cos(angleRad) - dy * Math.sin(angleRad);
  const rotatedY = dx * Math.sin(angleRad) + dy * Math.cos(angleRad);
  const scaleX = obj.scaleX || 1;
  const scaleY = obj.scaleY || 1;
  return {
    x: rotatedX / scaleX,
    y: rotatedY / scaleY
  };
};

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
  unregisterCanvasInstance,
  onFabricModified,
  onFabricAdded
}: PageRendererProps) => {
  const pdfCanvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasInstance = useRef<any>(null);
  const isLoadingFromPropRef = useRef(false);
  const lastCanvasStateRef = useRef<string>('');
  const [isBackgroundRendered, setIsBackgroundRendered] = useState(false);

  const editModeRef = useRef(editMode);
  useEffect(() => {
    editModeRef.current = editMode;
  }, [editMode]);

  // Blinking caret repaint trigger loop
  useEffect(() => {
    const interval = setInterval(() => {
      const fbCanvas = fabricCanvasInstance.current;
      if (fbCanvas) {
        const selection = SelectionEngine.getInstance();
        if (selection.getIsEditingText() && selection.getSelectedPageNumber() === pageNum) {
          fbCanvas.requestRenderAll();
        }
      }
    }, 250);

    return () => clearInterval(interval);
  }, [pageNum]);

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

    // Globally disable Fabric's native text painting to prevent duplicate text rendering
    if (fabricLib.Textbox) {
      fabricLib.Textbox.prototype._renderText = function(ctx: CanvasRenderingContext2D) {
        // Do nothing. Native RenderEngine handles visible text drawing during after:render.
      };
    }

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
    // Smart Snapping & Drag block validations
    fbCanvas.on('object:moving', (options: any) => {
      const obj = options.target;
      if (!obj) return;
      if (!EditingValidator.isDraggingPermitted()) {
        if (obj._left !== undefined && obj._top !== undefined) {
          obj.left = obj._left;
          obj.top = obj._top;
        }
        fbCanvas.requestRenderAll();
        return;
      }
      obj._left = obj.left;
      obj._top = obj.top;
      applyObjectSnapping(obj, width, height);
    });

    fbCanvas.on('object:scaling', (options: any) => {
      if (!EditingValidator.shouldRenderTransformControls()) {
        const obj = options.target;
        if (obj && obj._scaleX !== undefined) {
          obj.scaleX = obj._scaleX;
          obj.scaleY = obj._scaleY;
          fbCanvas.requestRenderAll();
        }
      } else {
        const obj = options.target;
        if (obj) {
          obj._scaleX = obj.scaleX;
          obj._scaleY = obj.scaleY;
        }
      }
    });

    fbCanvas.on('object:rotating', (options: any) => {
      if (!EditingValidator.shouldRenderTransformControls()) {
        const obj = options.target;
        if (obj && obj._angle !== undefined) {
          obj.angle = obj._angle;
          fbCanvas.requestRenderAll();
        }
      } else {
        const obj = options.target;
        if (obj) {
          obj._angle = obj.angle;
        }
      }
    });

    // Populate state from history or original texts
    if (canvasState) {
      isLoadingFromPropRef.current = true;
      const serialized = JSON.stringify(canvasState);
      const stateCopy = JSON.parse(serialized);
      stateCopy.viewportTransform = [zoomScale, 0, 0, zoomScale, 0, 0];
      fbCanvas.loadFromJSON(stateCopy, () => {
        fbCanvas.setZoom(zoomScale);
        fbCanvas.setDimensions({
          width: Math.round(width * zoomScale),
          height: Math.round(height * zoomScale)
        });
        fbCanvas.renderAll();
        lastCanvasStateRef.current = serialized;
        isLoadingFromPropRef.current = false;
      });
    } else {
      const textBoxesForPage = originalTexts[originalPageNum] || [];
      if (textBoxesForPage.length > 0) {
        textBoxesForPage.forEach((box: any) => {
          // Detect properties from background canvas
          const detectedColor = detectTextColorFromCanvas(pdfCanvasRef.current, box, zoomScale);
          const detectedBgColor = detectBackgroundColorFromCanvas(pdfCanvasRef.current, box, zoomScale);

          const isReplaced = box.replacedText !== undefined;
          const displayText = isReplaced ? box.replacedText : box.text;

          const activeWeight = box.fontWeight === 'bold' ? 'bold' : 'normal';

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
            fill: 'transparent',
            backgroundColor: isReplaced ? 'transparent' : 'rgba(255, 255, 255, 0.001)', // invisible but registers clicks perfectly
            isOriginalText: true,
            baseline: box.baseline || (box.y + box.fontSize * 0.8),
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
              detectedBgColor: detectedBgColor,
              ascent: box.ascent,
              descent: box.descent,
              pdfFontName: box.pdfFontName
            },
            selectable: true,
            editable: false,
            evented: true,
            hasControls: false,
            hasBorders: false,
            lockScalingY: true,
            borderColor: '#3b82f6',
            cornerColor: '#3b82f6',
            cornerSize: 8,
            transparentCorners: false,
            hasRotatingPoint: false,
            stroke: 'transparent',
            strokeWidth: 1
          });

          // Disable Fabric text rendering entirely for this textbox
          (textbox as any)._renderText = function(ctx: CanvasRenderingContext2D) {
            // Do nothing. Native RenderEngine handles visible text drawing during after:render.
          };

          // Hook editing events directly on the textbox to manage transparency
          textbox.on('editing:entered', () => {
            textbox.set({
              fill: 'transparent',
              backgroundColor: 'transparent', // Transparent background
              stroke: 'transparent'
            });
            fbCanvas.requestRenderAll();
          });

          textbox.on('editing:exited', () => {
            textbox.set({
              fill: 'transparent',
              backgroundColor: 'rgba(255, 255, 255, 0.001)',
              stroke: 'transparent'
            });
            fbCanvas.requestRenderAll();
          });

          fbCanvas.add(textbox);
        });
        fbCanvas.renderAll();
        // save initial state
        const state = fbCanvas.toJSON([...CANVAS_JSON_PROPS]);
        lastCanvasStateRef.current = JSON.stringify(state);
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
          const isEditing = EditingSession.getInstance().getActiveObjectId() === obj.id;
          if (isEdited || isEditing) {
            const orig = obj.originalTextData;
            const padX = 2;
            const padY = 2; // full coverage, no shrinking
            ctx.save();
            ctx.translate(orig.x, orig.y);
            if (orig.angle) {
              ctx.rotate((orig.angle * Math.PI) / 180);
            }
            ctx.fillStyle = orig.detectedBgColor || '#ffffff';
            ctx.fillRect(
              -padX,
              -padY,
              orig.width + padX * 2,
              orig.height + padY * 2
            );
            ctx.restore();
          }
        }
      });
      ctx.restore();
    });

    // Custom render loop hook to paint native text selection overlays
    const renderEngine = new RenderEngine(() => fbCanvas.requestRenderAll());
    fbCanvas.on('after:render', () => {
      const ctx = fbCanvas.getContext();
      ctx.save();
      const v = fbCanvas.viewportTransform;
      if (v) {
        ctx.transform(v[0], v[1], v[2], v[3], v[4], v[5]);
      }
      renderEngine.render(ctx, pageNum, fbCanvas.getObjects());
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
      if (obj && obj.isOriginalText && editModeRef.current === 'edit-text') {
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
      if (obj && obj.isOriginalText && editModeRef.current === 'edit-text') {
        if (obj.fill === 'transparent') {
          obj.set({
            stroke: 'transparent'
          });
          fbCanvas.requestRenderAll();
        }
      }
    });

    let isDragging = false;
    let dragStartLocal = { x: 0, y: 0 };
    let clickCount = 0;
    let lastClickTime = 0;

    fbCanvas.on('mouse:down', (e: any) => {
      onFocusCanvas(pageId, fbCanvas);

      // Initialize FocusManager
      FocusManager.getInstance();

      const obj = e.target;
      if (obj && obj.isOriginalText && editModeRef.current === 'edit-text') {
        const pointer = fbCanvas.getPointer(e.e);
        const local = getLocalPointer(obj, pointer);

        const now = Date.now();
        if (now - lastClickTime < 300) {
          clickCount++;
        } else {
          clickCount = 1;
        }
        lastClickTime = now;

        const selectionEngine = SelectionEngine.getInstance();
        selectionEngine.select(obj.id, pageNum);

        obj.set({ fill: 'transparent' });

        fbCanvas.forEachObject((o: any) => {
          if (o.isOriginalText && o.id !== obj.id && !isOriginalTextEdited(o)) {
            o.set({
              fill: 'transparent',
              backgroundColor: 'rgba(255, 255, 255, 0.001)',
              stroke: 'transparent'
            });
          }
        });

        const fontFamily = obj.fontFamily || 'Helvetica';
        const fontSize = obj.fontSize || 12;
        const fontStyle = obj.fontStyle || 'normal';
        const fontWeight = obj.fontWeight || 'normal';
        const cacheKey = `${obj.text}_${fontFamily}_${fontSize}_${fontStyle}_${fontWeight}`;
        if (!obj._cachedLayout || obj._cachedLayoutKey !== cacheKey) {
          obj._cachedLayout = new TextLayout(obj.text, fontFamily, fontSize);
          obj._cachedLayoutKey = cacheKey;
        }
        const layout = obj._cachedLayout;

        if (clickCount === 1) {
          selectionEngine.handleSingleClick(local.x, local.y, layout);
        } else if (clickCount === 2) {
          selectionEngine.handleDoubleClick(local.x, local.y, layout);
        } else if (clickCount >= 3) {
          selectionEngine.handleTripleClick(local.x, local.y, layout);
          clickCount = 0; // reset
        }

        // Start active text editing session
        EditingSession.getInstance().startSession(obj.id, pageNum, obj.text);
        EditingSession.getInstance().setSelection(
          selectionEngine.getSelectionStart(),
          selectionEngine.getSelectionEnd(),
          selectionEngine.getCaretIndex()
        );

        isDragging = true;
        dragStartLocal = local;

        fbCanvas.requestRenderAll();
        
        // Notify selection change
        onObjectSelected(pageId, obj);
      } else {
        const selectionEngine = SelectionEngine.getInstance();
        selectionEngine.deselect();
        EditingSession.getInstance().endSession();

        fbCanvas.forEachObject((o: any) => {
          if (o.isOriginalText && !isOriginalTextEdited(o)) {
            o.set({
              fill: 'transparent',
              backgroundColor: 'rgba(255, 255, 255, 0.001)',
              stroke: 'transparent'
            });
          }
        });
        fbCanvas.requestRenderAll();
        onObjectCleared();
      }
    });

    fbCanvas.on('mouse:move', (e: any) => {
      if (isDragging) {
        const obj = fbCanvas.getActiveObject();
        if (obj && obj.isOriginalText) {
          const pointer = fbCanvas.getPointer(e.e);
          const currentLocal = getLocalPointer(obj, pointer);

          const fontFamily = obj.fontFamily || 'Helvetica';
          const fontSize = obj.fontSize || 12;
          const fontStyle = obj.fontStyle || 'normal';
          const fontWeight = obj.fontWeight || 'normal';
          const cacheKey = `${obj.text}_${fontFamily}_${fontSize}_${fontStyle}_${fontWeight}`;
          if (!obj._cachedLayout || obj._cachedLayoutKey !== cacheKey) {
            obj._cachedLayout = new TextLayout(obj.text, fontFamily, fontSize);
            obj._cachedLayoutKey = cacheKey;
          }
          const layout = obj._cachedLayout;

          const selectionEngine = SelectionEngine.getInstance();
          selectionEngine.handleDragSelection(
            dragStartLocal.x,
            dragStartLocal.y,
            currentLocal.x,
            currentLocal.y,
            layout
          );
          
          EditingSession.getInstance().setSelection(
            selectionEngine.getSelectionStart(),
            selectionEngine.getSelectionEnd(),
            selectionEngine.getCaretIndex()
          );

          fbCanvas.requestRenderAll();
        }
      }
    });

    fbCanvas.on('mouse:up', () => {
      isDragging = false;
    });

    // Auto save JSON / route through editing engine
    const fabricObjToJson = (obj: any): Record<string, unknown> =>
      obj.toObject ? obj.toObject([...CANVAS_JSON_PROPS]) : obj;

    const handleBootstrapSave = () => {
      if (getIsRenderingFromEngine() || isLoadingFromPropRef.current) return;
      const state = fbCanvas.toJSON([...CANVAS_JSON_PROPS]);
      saveCanvasState(pageId, state);
    };

    const handleObjectModified = (e: any) => {
      if (getIsRenderingFromEngine() || isLoadingFromPropRef.current) return;
      const obj = e.target;
      if (obj && onFabricModified) {
        onFabricModified(pageId, fabricObjToJson(obj));
      } else {
        handleBootstrapSave();
      }
    };

    const handleObjectAdded = (e: any) => {
      const obj = e.target;
      if (obj) {
        obj._left = obj.left;
        obj._top = obj.top;
        obj._scaleX = obj.scaleX || 1;
        obj._scaleY = obj.scaleY || 1;
        obj._angle = obj.angle || 0;
      }

      if (getIsRenderingFromEngine() || isLoadingFromPropRef.current) return;
      if (obj && onFabricAdded) {
        onFabricAdded(pageId, fabricObjToJson(obj));
      } else {
        handleBootstrapSave();
      }
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
    };

    const handlePathCreated = (e: any) => {
      if (getIsRenderingFromEngine() || isLoadingFromPropRef.current) return;
      const path = e.path;
      if (path && onFabricAdded) {
        onFabricAdded(pageId, fabricObjToJson(path));
      } else {
        handleBootstrapSave();
      }
    };

    fbCanvas.on('object:added', handleObjectAdded);
    fbCanvas.on('object:modified', handleObjectModified);
    fbCanvas.on('object:removed', handleBootstrapSave);
    fbCanvas.on('path:created', handlePathCreated);
    fbCanvas.on('text:changed', handleTextChanged);
    fbCanvas.on('editing:exited', handleObjectModified);

    const sessionListener = {
      onSessionStart: (objId: string, pageNumStart: number) => {},
      onSessionUpdate: (text: string, caretIndex: number, selStart: number, selEnd: number) => {
        const activePage = EditingSession.getInstance().getActivePageNum();
        if (activePage !== pageNum) return;
        const objId = EditingSession.getInstance().getActiveObjectId();
        if (!objId) return;
        const obj = fbCanvas.getObjects().find((o: any) => o.id === objId);
        if (obj) {
          obj.set({ text });
          const origWidth = obj.originalTextData?.width || obj.width || 0;
          obj.set({ width: 9999 });
          let maxLineWidth = 0;
          const linesList = text.split('\n');
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
      },
      onSessionEnd: () => {
        handleBootstrapSave();
      }
    };

    EditingSession.getInstance().addListener(sessionListener);

    return () => {
      EditingSession.getInstance().removeListener(sessionListener);
      EditingSession.getInstance().endSession();
      fbCanvas.off('selection:created', handleSelection);
      fbCanvas.off('selection:updated', handleSelection);
      fbCanvas.off('object:added', handleObjectAdded);
      fbCanvas.off('object:modified', handleObjectModified);
      fbCanvas.off('object:removed', handleBootstrapSave);
      fbCanvas.off('path:created', handlePathCreated);
      fbCanvas.off('text:changed', handleTextChanged);
      fbCanvas.off('editing:exited', handleObjectModified);
      if (unregisterCanvasInstance) {
        unregisterCanvasInstance(pageId);
      }
      fbCanvas.dispose();
      fabricCanvasInstance.current = null;
    };
  }, [fabricLib, isBackgroundRendered, zoomScale]);

  // Reload canvas when engine-driven canvasState changes (undo/redo, toolbar actions)
  useEffect(() => {
    const fbCanvas = fabricCanvasInstance.current;
    if (!fbCanvas || !canvasState || getIsRenderingFromEngine()) return;

    const serialized = JSON.stringify(canvasState);
    if (serialized === lastCanvasStateRef.current) return;

    isLoadingFromPropRef.current = true;
    const stateCopy = JSON.parse(serialized);
    stateCopy.viewportTransform = [zoomScale, 0, 0, zoomScale, 0, 0];

    fbCanvas.loadFromJSON(stateCopy, () => {
      fbCanvas.setZoom(zoomScale);
      fbCanvas.setDimensions({
        width: Math.round(width * zoomScale),
        height: Math.round(height * zoomScale),
      });
      fbCanvas.renderAll();
      lastCanvasStateRef.current = serialized;
      isLoadingFromPropRef.current = false;
    });
  }, [canvasState, zoomScale, width, height]);

  // Sync mode changes to active canvas options
  useEffect(() => {
    const fbCanvas = fabricCanvasInstance.current;
    if (!fbCanvas) return;

    EditModeManager.getInstance().setTool(editMode as any);

    fbCanvas.isDrawingMode = false;
    fbCanvas.selection = editMode === 'select';

    fbCanvas.forEachObject((obj: any) => {
      if (obj.isOriginalText) {
        obj.selectable = editMode === 'edit-text' || editMode === 'select';
        obj.editable = false;
        if (editMode === 'edit-text') {
          obj.hasControls = false;
          obj.hasBorders = false;
          obj.hasRotatingPoint = false;
        } else {
          obj.hasControls = true;
          obj.hasBorders = true;
          obj.hasRotatingPoint = true;
        }
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
