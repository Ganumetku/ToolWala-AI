import { CANVAS_JSON_PROPS } from '@/lib/twpdf/core';
import type { TWPDFDocument, TWPDFPage } from '@/types/twpdf';
import { pageToFabricState } from './domToFabric';

let isRenderingFromEngine = false;

export function getIsRenderingFromEngine(): boolean {
  return isRenderingFromEngine;
}

export function renderPageToCanvas(
  page: TWPDFPage,
  canvas: {
    loadFromJSON: (state: unknown, cb: () => void) => void;
    setZoom: (z: number) => void;
    setDimensions: (dims: { width: number; height: number }) => void;
    renderAll: () => void;
    toJSON: (props: string[]) => unknown;
    getObjects?: () => Array<{ id?: string }>;
    setActiveObject?: (obj: unknown) => void;
  },
  zoomScale: number,
  pageWidth: number,
  pageHeight: number,
  selectedObjectId?: string | null
): Promise<unknown> {
  return new Promise((resolve) => {
    isRenderingFromEngine = true;
    const state = pageToFabricState(page, zoomScale);

    canvas.loadFromJSON(state, () => {
      canvas.setZoom(zoomScale);
      canvas.setDimensions({
        width: Math.round(pageWidth * zoomScale),
        height: Math.round(pageHeight * zoomScale),
      });

      if (selectedObjectId && canvas.getObjects && canvas.setActiveObject) {
        const active = canvas.getObjects().find((o) => o.id === selectedObjectId);
        if (active) canvas.setActiveObject(active);
      }

      canvas.renderAll();
      const json = canvas.toJSON([...CANVAS_JSON_PROPS]);
      isRenderingFromEngine = false;
      resolve(json);
    });
  });
}

export async function refreshPageFromDocument(
  pageId: string,
  document: TWPDFDocument,
  canvasInstances: Record<string, unknown>,
  zoomScale: number
): Promise<unknown | null> {
  const page = document.pages.find((p) => p.id === pageId);
  const canvas = canvasInstances[pageId] as Parameters<typeof renderPageToCanvas>[1] | undefined;
  if (!page || !canvas) return null;

  const selectedId =
    document.selectedObjectId && document.currentPageId === pageId
      ? document.selectedObjectId
      : null;

  return renderPageToCanvas(page, canvas, zoomScale, page.width, page.height, selectedId);
}

export async function refreshAllPagesFromDocument(
  document: TWPDFDocument,
  canvasInstances: Record<string, unknown>,
  zoomScale: number
): Promise<Record<string, unknown>> {
  const states: Record<string, unknown> = {};

  for (const page of document.pages) {
    const canvas = canvasInstances[page.id];
    if (canvas) {
      const state = await refreshPageFromDocument(page.id, document, canvasInstances, zoomScale);
      if (state) states[page.id] = state;
    } else {
      states[page.id] = pageToFabricState(page, zoomScale);
    }
  }

  return states;
}
