import { CANVAS_JSON_PROPS } from '@/lib/twpdf/core';
import { isOriginalTextEdited } from '@/lib/twpdf/editor';
import { dataUrlToUint8Array } from '@/lib/twpdf/utils';
import type { ExportContext } from '@/types/pdf';
import { RenderEngine } from '@/lib/tw-engine/editor/RenderEngine';

export async function exportPdf(context: ExportContext): Promise<Uint8Array> {
  const {
    pdfBytes,
    pageList,
    pageDimensions,
    canvasStates,
    canvasInstances,
    pdfDoc,
    fabricLib,
    zoomScale,
    onStatus,
  } = context;

  const { PDFDocument } = await import('pdf-lib');
  const newDoc = await PDFDocument.create();
  const originalPdfDoc = await PDFDocument.load(pdfBytes);
  const doc = pdfDoc as {
    getPage: (n: number) => Promise<{
      getViewport: (opts: { scale: number }) => { width: number; height: number };
      render: (opts: {
        canvasContext: CanvasRenderingContext2D;
        viewport: { width: number; height: number };
      }) => { promise: Promise<void> };
    }>;
  };
  const fabric = fabricLib as {
    Canvas: new (el: HTMLCanvasElement, opts: Record<string, unknown>) => FabricCanvas;
  };

  type FabricCanvas = {
    discardActiveObject: () => void;
    requestRenderAll: () => void;
    toJSON: (props: string[]) => { objects?: unknown[] };
    loadFromJSON: (state: unknown, cb: () => void) => void;
    renderAll: () => void;
    forEachObject: (cb: (obj: FabricObject) => void) => void;
    toDataURL: (opts: { format: string; multiplier: number }) => string;
    dispose: () => void;
  };

  type FabricObject = {
    isOriginalText?: boolean;
    isDeletedOriginal?: boolean;
    text?: string;
    left?: number;
    top?: number;
    fontSize?: number;
    fontFamily?: string;
    fontWeight?: string;
    fontStyle?: string;
    fill?: string;
    originalTextData?: {
      text: string;
      x: number;
      y: number;
      width: number;
      height: number;
      fontSize: number;
      detectedColor?: string;
      detectedBgColor?: string;
    };
    set: (props: Record<string, unknown>) => void;
  };

  const renderScale = 2.0;

  for (let idx = 0; idx < pageList.length; idx++) {
    const pageItem = pageList[idx];
    onStatus?.(`Flattening page ${idx + 1} of ${pageList.length}...`);

    const dimensions = pageDimensions[pageItem.originalPageNum] || { width: 595, height: 842 };
    const width = dimensions.width;
    const height = dimensions.height;

    const liveCanvas = canvasInstances[pageItem.id] as FabricCanvas | undefined;
    let state = canvasStates[pageItem.id] as { objects?: FabricObject[] } | undefined;
    if (liveCanvas) {
      liveCanvas.discardActiveObject();
      liveCanvas.requestRenderAll();
      state = liveCanvas.toJSON([...CANVAS_JSON_PROPS]) as { objects?: FabricObject[] };
    }

    let hasChanges = false;
    if (state) {
      const objects = state.objects || [];
      for (const obj of objects) {
        if (obj.isOriginalText) {
          if (isOriginalTextEdited(obj)) {
            hasChanges = true;
            break;
          }
        } else {
          hasChanges = true;
          break;
        }
      }
    }

    if (!hasChanges) {
      const [copiedPage] = await newDoc.copyPages(originalPdfDoc, [pageItem.originalPageNum - 1]);
      newDoc.addPage(copiedPage);
      continue;
    }

    const page = await doc.getPage(pageItem.originalPageNum);

    const tempPdfCanvas = document.createElement('canvas');
    tempPdfCanvas.width = width * renderScale;
    tempPdfCanvas.height = height * renderScale;
    const tempPdfCtx = tempPdfCanvas.getContext('2d');

    if (tempPdfCtx) {
      tempPdfCtx.fillStyle = '#ffffff';
      tempPdfCtx.fillRect(0, 0, tempPdfCanvas.width, tempPdfCanvas.height);

      const viewport = page.getViewport({ scale: renderScale });
      await page.render({
        canvasContext: tempPdfCtx,
        viewport: viewport,
      }).promise;
    }

    let activeCanvas = liveCanvas;
    let tempFabricCanvas: FabricCanvas | null = null;

    if (!activeCanvas && state) {
      const canvasEl = document.createElement('canvas');
      canvasEl.width = width * zoomScale;
      canvasEl.height = height * zoomScale;
      activeCanvas = new fabric.Canvas(canvasEl, {
        width: width * zoomScale,
        height: height * zoomScale,
        backgroundColor: 'transparent',
      });

      await new Promise<void>((resolve) => {
        activeCanvas!.loadFromJSON(state, () => {
          activeCanvas!.renderAll();
          resolve();
        });
      });
      tempFabricCanvas = activeCanvas;
    }

    if (activeCanvas) {
      activeCanvas.forEachObject((obj) => {
        if (obj.isOriginalText) {
          if (obj.isDeletedOriginal) {
            obj.set({ opacity: 0 });
          } else if (isOriginalTextEdited(obj)) {
            obj.set({
              fill:
                obj.fill === 'transparent'
                  ? obj.originalTextData?.detectedColor || '#000000'
                  : obj.fill,
              backgroundColor: 'transparent',
              stroke: 'transparent',
            });
          } else {
            obj.set({
              fill: 'transparent',
              backgroundColor: 'transparent',
              stroke: 'transparent',
            });
          }
        }
      });
      if (!tempFabricCanvas) {
        activeCanvas.requestRenderAll();
      }

      activeCanvas.forEachObject((obj) => {
        if (obj.isOriginalText) {
          if (isOriginalTextEdited(obj)) {
            const orig = obj.originalTextData!;
            const padX = 2;
            const padY = 2;
            if (tempPdfCtx) {
              tempPdfCtx.fillStyle = orig.detectedBgColor || '#ffffff';
              tempPdfCtx.fillRect(
                (orig.x - padX) * renderScale,
                (orig.y - padY) * renderScale,
                (orig.width + padX * 2) * renderScale,
                (orig.height + padY * 2) * renderScale
              );
            }
          }
        }
      });

      const fabricObjects: any[] = [];
      activeCanvas.forEachObject((obj) => fabricObjects.push(obj));

      // Hide all text boxes from Fabric export canvas to prevent empty/broken text overlays
      const originalOpacities = new Map<any, number>();
      fabricObjects.forEach((obj) => {
        if (obj.isOriginalText || obj.type === 'textbox' || obj.type === 'i-text') {
          originalOpacities.set(obj, obj.opacity ?? 1);
          obj.set({ opacity: 0 });
        }
      });
      activeCanvas.renderAll();

      const multiplier = renderScale / zoomScale;
      const overlayDataUrl = activeCanvas.toDataURL({
        format: 'png',
        multiplier: multiplier,
      });

      // Restore opacities on active canvas
      fabricObjects.forEach((obj) => {
        if (originalOpacities.has(obj)) {
          obj.set({ opacity: originalOpacities.get(obj) });
        }
      });
      activeCanvas.renderAll();

      if (tempPdfCtx) {
        const overlayImg = await new Promise<HTMLImageElement>((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = () => reject(new Error('Failed to load overlay image'));
          img.src = overlayDataUrl;
        });
        tempPdfCtx.drawImage(overlayImg, 0, 0);

        // Render all text boxes directly onto the high-resolution PDF canvas context using unified RenderEngine
        RenderEngine.renderObjects(tempPdfCtx, fabricObjects, renderScale);
      }

      activeCanvas.forEachObject((obj) => {
        if (
          obj.isOriginalText &&
          !obj.isDeletedOriginal &&
          obj.text === obj.originalTextData?.text
        ) {
          obj.set({
            fill: 'transparent',
            backgroundColor: 'rgba(255, 255, 255, 0.001)',
            stroke: 'transparent',
          });
        }
      });

      if (tempFabricCanvas) {
        tempFabricCanvas.dispose();
      } else {
        activeCanvas.requestRenderAll();
      }
    }

    const imgData = tempPdfCanvas.toDataURL('image/jpeg', 0.95);
    const imgBytes = dataUrlToUint8Array(imgData);
    const embeddedImage = await newDoc.embedJpg(imgBytes);

    const newPage = newDoc.addPage([width, height]);
    newPage.drawImage(embeddedImage, {
      x: 0,
      y: 0,
      width,
      height,
    });
  }

  onStatus?.('Saving final file...');
  return newDoc.save();
}

export function downloadPdfBytes(bytes: Uint8Array, fileName: string): void {
  const blob = new Blob([bytes as BlobPart], { type: 'application/pdf' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  link.click();
}
