import { CANVAS_JSON_PROPS } from '@/lib/twpdf/core';
import { isOriginalTextEdited } from '@/lib/twpdf/editor';
import { computeLocalMaskRect, ORIGINAL_TEXT_HIT_BG } from '@/lib/twpdf/parser/textMask';
import { dataUrlToUint8Array } from '@/lib/twpdf/utils';
import type { ExportContext } from '@/types/pdf';
import { containsDevanagari } from '@/lib/twpdf/fonts/fontMapping';
import { embedFontForText } from './embedFonts';
import { wrapText } from './textWrap';

function rotatedAabb(left: number, top: number, w: number, h: number, angleDeg: number) {
  if (Math.abs(angleDeg) < 0.5) return { x: left, y: top, width: w, height: h };
  const r = (angleDeg * Math.PI) / 180;
  const cos = Math.cos(r);
  const sin = Math.sin(r);
  const corners = [
    [0, 0],
    [w, 0],
    [w, h],
    [0, h],
  ].map(([dx, dy]) => [left + dx * cos - dy * sin, top + dx * sin + dy * cos]);
  const xs = corners.map((c) => c[0]);
  const ys = corners.map((c) => c[1]);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  return { x: minX, y: minY, width: Math.max(...xs) - minX, height: Math.max(...ys) - minY };
}

export async function exportPdf(context: ExportContext): Promise<Uint8Array> {
  const {
    pdfBytes,
    pageList,
    pageDimensions,
    canvasStates,
    canvasInstances,
    fabricLib,
    zoomScale,
    onStatus,
  } = context;

  const { PDFDocument, rgb, degrees } = await import('pdf-lib');
  const fontkitMod = await import('@pdf-lib/fontkit');
  const fontkit = (fontkitMod as { default?: unknown }).default ?? fontkitMod;

  const newDoc = await PDFDocument.create();
  newDoc.registerFontkit(fontkit);
  const originalPdfDoc = await PDFDocument.load(pdfBytes);
  const fontCache = new Map<string, Awaited<ReturnType<typeof embedFontForText>>>();

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
    width?: number;
    height?: number;
    scaleX?: number;
    scaleY?: number;
    angle?: number;
    type?: string;
    backgroundColor?: string;
    fontSize?: number;
    fontFamily?: string;
    fontWeight?: string;
    fontStyle?: string;
    fill?: string;
    lineHeight?: number;
    opacity?: number;
    originalTextData?: {
      text: string;
      x: number;
      y: number;
      width: number;
      height: number;
      fontSize: number;
      angle?: number;
      fontFamily?: string;
      detectedColor?: string;
      detectedBgColor?: string;
      baseline?: number;
      maskInsets?: { left: number; top: number; right: number; bottom: number };
      pdfObject?: { renderMode?: number };
    };
    set: (props: Record<string, unknown>) => void;
    baseline?: number;
  };

  const parseColorToRgb = (colorStr: string) => {
    if (!colorStr || colorStr === 'transparent') return rgb(0, 0, 0);

    const rgbMatch = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (rgbMatch) {
      return rgb(
        parseInt(rgbMatch[1], 10) / 255,
        parseInt(rgbMatch[2], 10) / 255,
        parseInt(rgbMatch[3], 10) / 255
      );
    }

    let cleanHex = colorStr.trim().replace('#', '');
    if (cleanHex.length === 3) {
      cleanHex = cleanHex.split('').map((c) => c + c).join('');
    }
    if (cleanHex.length === 6) {
      return rgb(
        parseInt(cleanHex.substring(0, 2), 16) / 255,
        parseInt(cleanHex.substring(2, 4), 16) / 255,
        parseInt(cleanHex.substring(4, 6), 16) / 255
      );
    }

    return rgb(0, 0, 0);
  };

  const isInkObject = (obj: FabricObject) => {
    if (obj.isOriginalText) return false;
    const t = obj.type || '';
    return t !== 'textbox' && t !== 'i-text' && t !== 'text';
  };

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

    const [copiedPage] = await newDoc.copyPages(originalPdfDoc, [pageItem.originalPageNum - 1]);
    const addedPage = newDoc.addPage(copiedPage);

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
      const fabricObjects: FabricObject[] = [];
      activeCanvas.forEachObject((obj) => fabricObjects.push(obj));

      const hasInk = fabricObjects.some(isInkObject);
      if (hasInk) {
        const originalOpacities = new Map<FabricObject, number>();
        fabricObjects.forEach((obj) => {
          if (obj.isOriginalText || obj.type === 'textbox' || obj.type === 'i-text') {
            originalOpacities.set(obj, obj.opacity ?? 1);
            obj.set({ opacity: 0 });
          }
        });
        activeCanvas.renderAll();

        const overlayDataUrl = activeCanvas.toDataURL({
          format: 'png',
          multiplier: 2.0 / zoomScale,
        });

        fabricObjects.forEach((obj) => {
          if (originalOpacities.has(obj)) {
            obj.set({ opacity: originalOpacities.get(obj) });
          }
        });
        activeCanvas.renderAll();

        const overlayImgBytes = dataUrlToUint8Array(overlayDataUrl);
        const embeddedPng = await newDoc.embedPng(overlayImgBytes);
        addedPage.drawImage(embeddedPng, {
          x: 0,
          y: 0,
          width,
          height,
        });
      }

      for (const obj of fabricObjects) {
        if (obj.type !== 'textbox' && obj.type !== 'i-text') continue;

        const isOriginal = obj.isOriginalText;
        const isEdited = isOriginalTextEdited(obj);
        const isDeleted = obj.isDeletedOriginal || obj.opacity === 0;
        const scaleY = obj.scaleY || 1;
        const orig = obj.originalTextData;
        const maskW = orig?.width ?? (obj.width || 0) * (obj.scaleX || 1);
        const maskH = orig?.height ?? (obj.height || 0) * scaleY;
        const maskLeft = orig?.x ?? obj.left ?? 0;
        const maskTop = orig?.y ?? obj.top ?? 0;
        const rect = computeLocalMaskRect(maskW, maskH, orig?.maskInsets);
        const sampledBg = orig?.detectedBgColor;
        const hasOpaqueFabricBg =
          obj.backgroundColor &&
          obj.backgroundColor !== 'transparent' &&
          obj.backgroundColor !== ORIGINAL_TEXT_HIT_BG;
        const angle = obj.angle || orig?.angle || 0;

        if (isDeleted || isEdited || (hasOpaqueFabricBg && !isOriginal)) {
          const bgColorStr = sampledBg || (hasOpaqueFabricBg ? obj.backgroundColor : undefined);
          if (bgColorStr && bgColorStr !== 'transparent' && bgColorStr !== ORIGINAL_TEXT_HIT_BG) {
            const box = rotatedAabb(maskLeft + rect.x, maskTop + rect.y, rect.width, rect.height, angle);
            addedPage.drawRectangle({
              x: box.x,
              y: height - box.y - box.height,
              width: box.width,
              height: box.height,
              color: parseColorToRgb(bgColorStr),
            });
          }
        }

        if (!isDeleted && (!isOriginal || isEdited)) {
          const fillStr =
            obj.fill && obj.fill !== 'transparent'
              ? obj.fill
              : orig?.detectedColor || '#000000';
          const fontSize = (obj.fontSize || orig?.fontSize || 12) * scaleY;
          const pdfX = isOriginal ? maskLeft : obj.left || 0;
          const yBaseline = obj.baseline
            ? height - obj.baseline
            : orig?.baseline
              ? height - orig.baseline
              : height - (obj.top || 0) - fontSize * 0.2;

          const font = await embedFontForText(
            newDoc,
            {
              fontFamily: obj.fontFamily || orig?.fontFamily,
              fontWeight: obj.fontWeight,
              fontStyle: obj.fontStyle,
              text: obj.text || '',
            },
            fontCache
          );

            const lineHeight = (obj.lineHeight || 1.15) * fontSize;
            const strokeSim =
              orig?.pdfObject?.renderMode === 1 || orig?.pdfObject?.renderMode === 2;
            const paint = (
              usedFont: typeof font,
              linesToDraw: string[],
              x: number
            ) => {
              linesToDraw.forEach((line, lineIdx) => {
                addedPage.drawText(line, {
                  x,
                  y: yBaseline - lineIdx * lineHeight,
                  size: fontSize,
                  font: usedFont,
                  color: parseColorToRgb(fillStr),
                  rotate: angle ? degrees(angle) : undefined,
                });
              });
            };
            try {
              const maxWidth = Math.max(8, (obj.width || orig?.width || maskW) * (obj.scaleX || 1));
              const shouldWrap = Math.abs(angle) < 4;
              const lines = shouldWrap
                ? wrapText(obj.text || '', maxWidth, font, fontSize)
                : [obj.text || ''];
              paint(font, lines, pdfX);
              if (strokeSim) paint(font, lines, pdfX + Math.max(0.2, fontSize * 0.03));
            } catch {
              const fallback = await embedFontForText(
                newDoc,
                {
                  fontFamily: containsDevanagari(obj.text || '') ? 'Noto Sans Devanagari' : 'Noto Sans',
                  fontWeight: obj.fontWeight,
                  fontStyle: obj.fontStyle,
                  text: obj.text || ' ',
                },
                fontCache
              );
              const maxWidth = Math.max(8, (obj.width || orig?.width || maskW) * (obj.scaleX || 1));
              const lines = wrapText(obj.text || '', maxWidth, fallback, fontSize);
              paint(fallback, lines, pdfX);
              if (strokeSim) paint(fallback, lines, pdfX + Math.max(0.2, fontSize * 0.03));
            }
        }
      }

      if (tempFabricCanvas) {
        tempFabricCanvas.dispose();
      } else {
        activeCanvas.requestRenderAll();
      }
    }
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
