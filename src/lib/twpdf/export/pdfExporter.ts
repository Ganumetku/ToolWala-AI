import { CANVAS_JSON_PROPS } from '@/lib/twpdf/core';
import { isOriginalTextEdited } from '@/lib/twpdf/editor';
import { dataUrlToUint8Array } from '@/lib/twpdf/utils';
import type { ExportContext } from '@/types/pdf';

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

  const { PDFDocument, rgb, StandardFonts } = await import('pdf-lib');
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
    baseline?: number;
  };

  const renderScale = 2.0;

  // Helper to parse hex or rgb to pdf-lib rgb format
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

  // Helper to map font family to standard PDF PostScript font
  const resolveStandardFontName = (obj: FabricObject) => {
    const family = (obj.fontFamily || '').toLowerCase();
    const isBold = obj.fontWeight === 'bold';
    const isItalic = obj.fontStyle === 'italic';

    if (family.includes('times') || family.includes('serif') || family.includes('georgia')) {
      if (isBold && isItalic) return StandardFonts.TimesRomanBoldItalic;
      if (isBold) return StandardFonts.TimesRomanBold;
      if (isItalic) return StandardFonts.TimesRomanItalic;
      return StandardFonts.TimesRoman;
    }
    if (family.includes('courier') || family.includes('mono')) {
      if (isBold && isItalic) return StandardFonts.CourierBoldOblique;
      if (isBold) return StandardFonts.CourierBold;
      if (isItalic) return StandardFonts.CourierOblique;
      return StandardFonts.Courier;
    }
    if (isBold && isItalic) return StandardFonts.HelveticaBoldOblique;
    if (isBold) return StandardFonts.HelveticaBold;
    if (isItalic) return StandardFonts.HelveticaOblique;
    return StandardFonts.Helvetica;
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

    // Load original vector PDF page content natively to preserve pure vector quality
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
      const fabricObjects: any[] = [];
      activeCanvas.forEachObject((obj) => fabricObjects.push(obj));

      // 1. Hide all text boxes from Fabric canvas to render only drawings/signatures in transparent PNG overlay
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

      // Restore original opacities
      fabricObjects.forEach((obj) => {
        if (originalOpacities.has(obj)) {
          obj.set({ opacity: originalOpacities.get(obj) });
        }
      });
      activeCanvas.renderAll();

      // 2. Draw transparent drawings/shapes overlay onto page natively
      const overlayImgBytes = dataUrlToUint8Array(overlayDataUrl);
      const embeddedPng = await newDoc.embedPng(overlayImgBytes);
      addedPage.drawImage(embeddedPng, {
        x: 0,
        y: 0,
        width,
        height,
      });

      // 3. Process all text boxes natively using pdf-lib vectors
      for (const obj of fabricObjects) {
        if (obj.type === 'textbox' || obj.type === 'i-text') {
          const isOriginal = obj.isOriginalText;
          const isEdited = isOriginalTextEdited(obj);
          const isDeleted = obj.isDeletedOriginal || obj.opacity === 0;

          const scaleX = obj.scaleX || 1;
          const scaleY = obj.scaleY || 1;
          const objWidth = (obj.width || 0) * scaleX;
          const objHeight = (obj.height || 0) * scaleY;

          // Coordinate inversion: Top-Left (Fabric) to Bottom-Left (PDF points)
          const pdfX = obj.left || 0;
          const pdfY = height - (obj.top || 0) - objHeight;

          // Draw solid white or custom background covers to whiteout original text underneath
          const hasBgColor = obj.backgroundColor && obj.backgroundColor !== 'transparent' && obj.backgroundColor !== 'rgba(255, 255, 255, 0.001)';

          if (isDeleted || isEdited || hasBgColor) {
            const bgColorStr = hasBgColor
              ? obj.backgroundColor
              : (obj.originalTextData?.detectedBgColor || '#ffffff');

            if (bgColorStr && bgColorStr !== 'transparent' && bgColorStr !== 'rgba(255, 255, 255, 0.001)') {
              const bgRgb = parseColorToRgb(bgColorStr);
              addedPage.drawRectangle({
                x: pdfX - 1.5,
                y: pdfY - 1.5,
                width: objWidth + 3.0,
                height: objHeight + 3.0,
                color: bgRgb,
              });
            }
          }

          // If not deleted, draw new/modified text natively
          if (!isDeleted && (!isOriginal || isEdited)) {
            const standardFontName = resolveStandardFontName(obj);
            const embeddedFont = await newDoc.embedFont(standardFontName);
            const fontSize = (obj.fontSize || 12) * scaleY;
            const textColor = parseColorToRgb(obj.fill || '#000000');

            // Align baseline precisely: Y-coordinate in pdf-lib is the typographic baseline of the text.
            const yBaseline = obj.baseline ? (height - obj.baseline) : (pdfY + (objHeight * 0.15));

            addedPage.drawText(obj.text || '', {
              x: pdfX,
              y: yBaseline,
              size: fontSize,
              font: embeddedFont,
              color: textColor,
              lineHeight: (obj.lineHeight || 1.0) * fontSize,
            });
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
