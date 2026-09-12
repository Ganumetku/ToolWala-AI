'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { TextBoxInfo } from '@/types/pdf';
import { EditingSession } from '@/lib/tw-engine/editing/EditingSession';
import { runEditHistory, type OriginalRunSnapshot } from '@/lib/twpdf/editing/runEditHistory';
import { cssFontWeight } from '@/lib/twpdf/fonts/fontWeight';

const PAGE_MARGIN_PT = 18;

type OverlayRun = TextBoxInfo & { currentText?: string; currentWidth?: number };

type TextRunOverlayLayerProps = {
  pageId: string;
  pageIndex: number;
  pageNum: number;
  pageWidth: number;
  pageHeight: number;
  zoomScale: number;
  runs: OverlayRun[];
  enabled: boolean;
  fabricCanvas: {
    forEachObject: (cb: (o: any) => void) => void;
    requestRenderAll: () => void;
  } | null;
  saveCanvasState: (pageId: string, state: unknown) => void;
  getCanvasJson?: () => unknown;
  onObjectSelected: (pageId: string, activeObj: unknown) => void;
  onObjectCleared: () => void;
};

function measureTextWidth(text: string, font: string, letterSpacing: number): number {
  if (typeof document === 'undefined') return 0;
  const canvas = measureTextWidth.canvas || (measureTextWidth.canvas = document.createElement('canvas'));
  const ctx = canvas.getContext('2d');
  if (!ctx) return 0;
  ctx.font = font;
  const base = ctx.measureText(text || ' ').width;
  const extra = text.length > 1 ? letterSpacing * (text.length - 1) : 0;
  return base + extra;
}
measureTextWidth.canvas = null as HTMLCanvasElement | null;

function computeLetterSpacing(text: string, font: string, targetWidth: number): number {
  if (!text || text.length < 2) return 0;
  const natural = measureTextWidth(text, font, 0);
  const spacing = (targetWidth - natural) / (text.length - 1);
  if (!Number.isFinite(spacing)) return 0;
  return Math.max(-1.5, Math.min(4, spacing));
}

function findFabricObject(canvas: TextRunOverlayLayerProps['fabricCanvas'], runId: string): any | null {
  if (!canvas) return null;
  let matched: any = null;
  canvas.forEachObject((o: any) => {
    if (o.id === runId) matched = o;
  });
  return matched;
}

function applyToFabric(
  canvas: TextRunOverlayLayerProps['fabricCanvas'],
  runId: string,
  patch: { text?: string; width?: number }
): any | null {
  const matched = findFabricObject(canvas, runId);
  if (!matched) return null;
  if (patch.text !== undefined) matched.set({ text: patch.text });
  if (patch.width !== undefined) matched.set({ width: patch.width });
  matched.dirty = true;
  canvas?.requestRenderAll();
  return matched;
}

function RunOverlay({
  run,
  zoomScale,
  pageWidth,
  pageId,
  pageIndex,
  pageNum,
  fabricCanvas,
  saveCanvasState,
  getCanvasJson,
  onObjectSelected,
  onObjectCleared,
  sessionStartRef,
}: {
  run: OverlayRun;
  zoomScale: number;
  pageWidth: number;
  pageId: string;
  pageIndex: number;
  pageNum: number;
  fabricCanvas: TextRunOverlayLayerProps['fabricCanvas'];
  saveCanvasState: (pageId: string, state: unknown) => void;
  getCanvasJson?: () => unknown;
  onObjectSelected: (pageId: string, activeObj: unknown) => void;
  onObjectCleared: () => void;
  sessionStartRef: React.MutableRefObject<Record<string, OriginalRunSnapshot>>;
}) {
  const elRef = useRef<HTMLDivElement>(null);
  const [focused, setFocused] = useState(false);
  const [widthPt, setWidthPt] = useState(run.currentWidth ?? run.width);
  const [wrap, setWrap] = useState(false);
  const color = run.detectedColor || run.pdfObject?.color || '#000000';
  const weightCss = cssFontWeight(run.fontWeight);
  const fontCss = `${run.fontStyle || 'normal'} ${weightCss} ${run.fontSize * zoomScale}px ${run.fontFamily || 'Helvetica'}`;
  const letterSpacing = computeLetterSpacing(run.text, fontCss, run.width * zoomScale);
  const originY = ((run.baseline ?? run.y + run.fontSize * 0.8) - run.y) * zoomScale;
  const strokeSim = run.pdfObject?.renderMode === 1 || run.pdfObject?.renderMode === 2;

  useEffect(() => {
    if (!focused && elRef.current) {
      const fromFabric = findFabricObject(fabricCanvas, run.id);
      elRef.current.textContent = fromFabric?.text ?? run.currentText ?? run.text;
      if (fromFabric?.width) setWidthPt(fromFabric.width);
    }
  }, [focused, fabricCanvas, run.id, run.currentText, run.text]);

  const persist = () => {
    if (getCanvasJson) saveCanvasState(pageId, getCanvasJson());
  };

  return (
    <div
      ref={(node) => {
        elRef.current = node;
        if (node && !node.dataset.seeded) {
          node.textContent = run.currentText ?? run.text;
          node.dataset.seeded = '1';
        }
      }}
      contentEditable
      suppressContentEditableWarning
      role="textbox"
      spellCheck={false}
      data-run-id={run.id}
      data-original-text={run.text}
      data-font-weight={weightCss}
      className="absolute outline-none tw-pdf-text-run"
      style={{
        left: run.x * zoomScale,
        top: run.y * zoomScale,
        width: widthPt * zoomScale,
        minHeight: run.height * zoomScale,
        fontFamily: run.fontFamily || 'Helvetica',
        fontWeight: weightCss as React.CSSProperties['fontWeight'],
        fontStyle: (run.fontStyle || 'normal') as React.CSSProperties['fontStyle'],
        fontSize: `${run.fontSize * zoomScale}px`,
        color: focused ? color : 'transparent',
        caretColor: color,
        letterSpacing: `${letterSpacing}px`,
        lineHeight: `${Math.max(run.height, run.fontSize * 1.05) * zoomScale}px`,
        whiteSpace: wrap ? 'pre-wrap' : 'nowrap',
        overflow: wrap ? 'visible' : 'hidden',
        background: 'transparent',
        transform: run.angle ? `rotate(${run.angle}deg)` : undefined,
        transformOrigin: `0 ${originY}px`,
        pointerEvents: 'auto',
        zIndex: focused ? 21 : 20,
        WebkitTextStroke: strokeSim && focused ? `0.4px ${color}` : undefined,
        paintOrder: strokeSim ? 'stroke fill' : undefined,
      }}
      onFocus={() => {
        setFocused(true);
        const current = (elRef.current?.textContent || run.currentText || run.text).replace(/\n/g, ' ');
        if (!sessionStartRef.current[run.id]) {
          sessionStartRef.current[run.id] = {
            text: run.text,
            width: run.width,
            height: run.height,
            fontSize: run.fontSize,
            fontFamily: run.fontFamily,
            fill: run.detectedColor,
          };
        }
        EditingSession.getInstance().startSession(run.id, pageNum, current, { preferDomOverlay: true });
        const obj = applyToFabric(fabricCanvas, run.id, { text: current, width: widthPt });
        fabricCanvas?.requestRenderAll();
        if (obj) onObjectSelected(pageId, obj);
      }}
      onBlur={() => {
        const text = (elRef.current?.textContent || '').replace(/\n/g, ' ');
        const snapshot = sessionStartRef.current[run.id] || {
          text: run.text,
          width: run.width,
          height: run.height,
          fontSize: run.fontSize,
          fontFamily: run.fontFamily,
          fill: run.detectedColor,
        };
        if (text !== snapshot.text || Math.abs(widthPt - snapshot.width) > 0.5) {
          runEditHistory.commit({
            pageIndex,
            pageId,
            runId: run.id,
            originalRun: snapshot,
            newText: text,
            styleOverrides: { width: widthPt, whiteSpace: wrap ? 'pre-wrap' : 'nowrap' },
          });
        }
        applyToFabric(fabricCanvas, run.id, { text, width: widthPt });
        persist();
        EditingSession.getInstance().endSession();
        setFocused(false);
      }}
      onInput={() => {
        const text = (elRef.current?.textContent || '').replace(/\n/g, ' ');
        const maxWidth = Math.max(8, pageWidth - run.x - PAGE_MARGIN_PT);
        const measured =
          Math.max(run.width * 0.2, measureTextWidth(text || ' ', fontCss, letterSpacing) / zoomScale + 1.5);
        let nextWidth = measured;
        let nextWrap = false;
        if (nextWidth <= maxWidth) {
          nextWidth = Math.max(run.width, nextWidth);
          nextWrap = false;
        } else {
          nextWidth = maxWidth;
          nextWrap = true;
        }
        setWidthPt(nextWidth);
        setWrap(nextWrap);
        EditingSession.getInstance().setText(text);
        applyToFabric(fabricCanvas, run.id, { text, width: nextWidth });
        const snapshot = sessionStartRef.current[run.id];
        if (snapshot) {
          runEditHistory.commit({
            pageIndex,
            pageId,
            runId: run.id,
            originalRun: snapshot,
            newText: text,
            styleOverrides: { width: nextWidth, whiteSpace: nextWrap ? 'pre-wrap' : 'nowrap' },
          });
        }
      }}
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          elRef.current?.blur();
          onObjectCleared();
        }
      }}
    />
  );
}

export function TextRunOverlayLayer({
  pageId,
  pageIndex,
  pageNum,
  pageWidth,
  zoomScale,
  runs,
  enabled,
  fabricCanvas,
  saveCanvasState,
  getCanvasJson,
  onObjectSelected,
  onObjectCleared,
}: TextRunOverlayLayerProps) {
  const layerRef = useRef<HTMLDivElement>(null);
  const [visibleIds, setVisibleIds] = useState<Set<string>>(() => new Set());
  const sessionStartRef = useRef<Record<string, OriginalRunSnapshot>>({});

  useEffect(() => {
    const root = layerRef.current;
    if (!root || !enabled) return;

    const update = () => {
      const layerBox = root.getBoundingClientRect();
      const viewTop = -120;
      const viewBottom = window.innerHeight + 120;
      const next = new Set<string>();
      const activeId = EditingSession.getInstance().getActiveObjectId();
      runs.forEach((run) => {
        const top = layerBox.top + run.y * zoomScale;
        const bottom = top + Math.max(run.height, 8) * zoomScale;
        if (bottom >= viewTop && top <= viewBottom) next.add(run.id);
      });
      if (activeId) next.add(activeId);
      setVisibleIds(next);
    };

    update();
    const scroller = root.closest('.overflow-auto') || window;
    scroller.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      scroller.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [runs, zoomScale, enabled]);

  if (!enabled) return null;

  const visibleRuns = visibleIds.size === 0 || runs.length < 400
    ? runs
    : runs.filter((r) => visibleIds.has(r.id));

  return (
    <div ref={layerRef} className="absolute inset-0 z-20 overflow-visible pointer-events-none">
      {visibleRuns.map((run) => (
        <RunOverlay
          key={run.id}
          run={run}
          zoomScale={zoomScale}
          pageWidth={pageWidth}
          pageId={pageId}
          pageIndex={pageIndex}
          pageNum={pageNum}
          fabricCanvas={fabricCanvas}
          saveCanvasState={saveCanvasState}
          getCanvasJson={getCanvasJson}
          onObjectSelected={onObjectSelected}
          onObjectCleared={onObjectCleared}
          sessionStartRef={sessionStartRef}
        />
      ))}
    </div>
  );
}
