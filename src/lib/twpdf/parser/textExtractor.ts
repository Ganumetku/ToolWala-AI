import { resolveRunFontStyle } from '@/lib/twpdf/fonts';
import type { TextBoxInfo } from '@/types/pdf';
import type { PDFTextObject } from '@/lib/tw-engine/types';
import { PDFDocument, PDFName, PDFRef } from 'pdf-lib';
import {
  computeRunViewportBox,
  explodeItemsOnWhitespace,
  fontMetricsForName,
  fontSizeFromTransform,
  groupAdjacentTextRuns,
  readCommonFontObject,
  type PdfTextItem,
} from './textRuns';
import { extractShowTextOps, matchRunColor } from './textColor';

export function detectTextColorFromCanvas(
  canvas: HTMLCanvasElement | null,
  box: { x: number; y: number; width: number; height: number },
  scale: number
): string {
  if (!canvas) return '#000000';
  try {
    const ctx = canvas.getContext('2d');
    if (!ctx) return '#000000';

    const x = box.x * scale;
    const y = box.y * scale;
    const w = box.width * scale;
    const h = box.height * scale;

    const pixelRatio = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
    const renderScale = Math.max(2.0, pixelRatio);

    const samplePoints: { r: number; g: number; b: number; L: number }[] = [];
    const steps = 6;
    for (let i = 1; i < steps; i++) {
      for (let j = 1; j < steps; j++) {
        const px = x + (w * i) / steps;
        const py = y + (h * j) / steps;

        const bitmapX = Math.floor(px * renderScale);
        const bitmapY = Math.floor(py * renderScale);

        if (bitmapX >= 0 && bitmapX < canvas.width && bitmapY >= 0 && bitmapY < canvas.height) {
          const imgData = ctx.getImageData(bitmapX, bitmapY, 1, 1).data;
          const r = imgData[0];
          const g = imgData[1];
          const b = imgData[2];
          const a = imgData[3];
          if (a > 0) {
            const L = 0.299 * r + 0.587 * g + 0.114 * b;
            samplePoints.push({ r, g, b, L });
          }
        }
      }
    }

    if (samplePoints.length === 0) return '#000000';

    const textPixels = samplePoints.filter((p) => p.L < 235);
    const pool = textPixels.length > 0 ? textPixels : samplePoints;
    pool.sort((a, b) => a.L - b.L);
    const mid = Math.floor(pool.length / 2);
    const median =
      pool.length % 2 === 1
        ? pool[mid]
        : {
            r: Math.round((pool[mid - 1].r + pool[mid].r) / 2),
            g: Math.round((pool[mid - 1].g + pool[mid].g) / 2),
            b: Math.round((pool[mid - 1].b + pool[mid].b) / 2),
          };

    const toHex = (c: number) => {
      const hex = c.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };
    return `#${toHex(median.r)}${toHex(median.g)}${toHex(median.b)}`;
  } catch (e) {
    console.error('Failed to detect text color from canvas', e);
    return '#000000';
  }
}

export function detectTextWeightFromCanvas(
  canvas: HTMLCanvasElement | null,
  box: { x: number; y: number; width: number; height: number },
  scale: number
): 'bold' | 'normal' {
  if (!canvas) return 'normal';
  try {
    const ctx = canvas.getContext('2d');
    if (!ctx) return 'normal';

    const x = box.x * scale;
    const y = box.y * scale;
    const w = box.width * scale;
    const h = box.height * scale;

    const pixelRatio = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
    const renderScale = Math.max(2.0, pixelRatio);

    let textPixelCount = 0;
    let totalPixelCount = 0;
    const steps = 10;

    for (let i = 1; i < steps; i++) {
      for (let j = 1; j < steps; j++) {
        const px = x + (w * i) / steps;
        const py = y + (h * j) / steps;

        const bitmapX = Math.floor(px * renderScale);
        const bitmapY = Math.floor(py * renderScale);

        if (bitmapX >= 0 && bitmapX < canvas.width && bitmapY >= 0 && bitmapY < canvas.height) {
          const imgData = ctx.getImageData(bitmapX, bitmapY, 1, 1).data;
          const r = imgData[0];
          const g = imgData[1];
          const b = imgData[2];
          const a = imgData[3];
          if (a > 0) {
            const L = 0.299 * r + 0.587 * g + 0.114 * b;
            if (L < 220) {
              textPixelCount++;
            }
            totalPixelCount++;
          }
        }
      }
    }

    if (totalPixelCount === 0) return 'normal';
    const density = textPixelCount / totalPixelCount;

    return density > 0.22 ? 'bold' : 'normal';
  } catch (e) {
    console.error('Failed to detect text weight from canvas', e);
    return 'normal';
  }
}

export async function detectOriginalText(
  page: any,
  pageNum: number,
  viewport: any,
  pdfBytes?: Uint8Array
): Promise<TextBoxInfo[]> {
  try {
    const textContent = await page.getTextContent();
    if (textContent.items.length === 0) return [];

    const rawItems = textContent.items as Array<{
      str: string;
      transform: number[];
      fontName?: string;
      width?: number;
      height?: number;
    }>;

    // Extract object numbers
    let objectNumber = page.ref?.num;
    let generationNumber = page.ref?.gen;
    let contentStreamObject: number | undefined;
    let contentStreamGeneration: number | undefined;

    if (pdfBytes) {
      try {
        const pdfLibDoc = await PDFDocument.load(pdfBytes);
        const pdfLibPages = pdfLibDoc.getPages();
        const pdfLibPage = pdfLibPages[pageNum - 1];
        if (pdfLibPage) {
          const contentsRef = pdfLibPage.node.get(PDFName.of('Contents'));
          if (contentsRef instanceof PDFRef) {
            contentStreamObject = contentsRef.objectNumber;
            contentStreamGeneration = contentsRef.generationNumber;
          } else if (contentsRef && typeof contentsRef === 'object') {
            if (typeof (contentsRef as any).get === 'function') {
              const firstRef = (contentsRef as any).get(0);
              if (firstRef instanceof PDFRef) {
                contentStreamObject = firstRef.objectNumber;
                contentStreamGeneration = firstRef.generationNumber;
              }
            }
          }
        }
      } catch (e) {
        console.warn('pdf-lib failed to extract contents ref in detectOriginalText:', e);
      }
    }

    const textOps = await extractShowTextOps(page);

    const validItems: PdfTextItem[] = [];
    rawItems.forEach((item, index) => {
      if (!item || typeof item.str !== 'string' || item.str.trim().length === 0) return;
      const fontSize = fontSizeFromTransform(item.transform);
      validItems.push({
        str: item.str,
        transform: item.transform,
        fontName: item.fontName || '',
        width: item.width || 0,
        height: item.height || fontSize || 10,
        rawIndex: index,
      });
    });

    if (validItems.length === 0) return [];

    const wordItems = explodeItemsOnWhitespace(validItems);
    const merged = groupAdjacentTextRuns(wordItems);
    const styles = (textContent.styles || {}) as Record<string, { fontFamily?: string; ascent?: number; descent?: number }>;
    const metricsCache = new Map<string, { ascent: number; descent: number }>();

    return merged.map((item, idx) => {
      let metrics = metricsCache.get(item.fontName);
      if (!metrics) {
        metrics = fontMetricsForName(page, item.fontName, styles);
        metricsCache.set(item.fontName, metrics);
      }

      const box = computeRunViewportBox(item, viewport, metrics);
      const fontStyleObj = styles[item.fontName] || null;
      const resolvedFontFamily = fontStyleObj ? fontStyleObj.fontFamily : '';
      const fontObject = readCommonFontObject(page, item.fontName);
      const rawFontName = item.fontName || '';
      const subsetMatch = rawFontName.match(/^([A-Z]{6})\+/);
      const subsetName = subsetMatch ? subsetMatch[1] : undefined;
      const firstRawIndex = item.rawIndices[0];
      const matchedOp =
        textOps.find((op) => (op.originalEncodedString || '').includes(item.str)) ||
        textOps[firstRawIndex];
      const runColor = matchRunColor(item.str, firstRawIndex, textOps) || matchedOp?.fillColor || '#000000';
      const renderMode = matchedOp?.renderMode ?? 0;
      const runFont = resolveRunFontStyle({
        pdfFontName: item.fontName,
        resolvedFontFamily,
        text: item.str,
        fontObject,
        renderMode,
      });

      const pdfObject: PDFTextObject = {
        objectNumber,
        generationNumber,
        pageNumber: pageNum,
        contentStreamObject,
        contentStreamGeneration,
        operatorType: matchedOp?.operatorType || 'Tj',
        operatorIndex: matchedOp?.operatorIndex !== undefined ? matchedOp.operatorIndex : idx,
        originalOperatorBytes: matchedOp?.originalOperatorBytes,
        originalEncodedString: matchedOp?.originalEncodedString || item.str,
        originalTextMatrix: matchedOp?.originalTextMatrix || [...item.transform],
        originalTextPosition: matchedOp?.originalTextPosition || [item.transform[4], item.transform[5]],
        fontResourceName: matchedOp?.fontResourceName || item.fontName,
        fontResource: item.fontName,
        fontName: resolvedFontFamily || item.fontName || 'Helvetica',
        subsetName,
        fontSize: box.fontSize,
        color: runColor,
        transformationMatrix: [...item.transform],
        boundingBox: { x: box.x, y: box.y, width: box.width, height: box.height },
        baseline: box.baseline,
        ascent: metrics.ascent,
        descent: metrics.descent,
        glyphIds: [],
        glyphWidths: [],
        unicodeMapping: {},
        cidMapping: {},
        originalText: item.str,
        currentText: item.str,
        renderMode,
        writingMode: 0,
        rotation: box.angleDeg,
        graphicsStateId: matchedOp?.graphicsStateId,
      };

      const runId = `orig_${pageNum}_${idx}`;
      return {
        id: runId,
        runId,
        text: item.str,
        x: box.x,
        y: box.y,
        width: box.width,
        height: box.height,
        fontSize: box.fontSize,
        angle: box.angleDeg,
        fontWeight: runFont.fontWeight,
        fontStyle: runFont.fontStyle,
        fontFamily: runFont.cssFamily,
        originalPdfX: box.originalPdfX,
        originalPdfY: box.originalPdfY,
        originalPdfWidth: box.originalPdfWidth,
        originalPdfHeight: box.originalPdfHeight,
        originalPdfFontSize: box.originalPdfFontSize,
        baseline: box.baseline,
        pdfFontName: item.fontName,
        ascent: metrics.ascent,
        descent: metrics.descent,
        detectedColor: runColor,
        pdfObject,
      };
    });
  } catch (e) {
    console.error(`Text extraction failed for page ${pageNum}`, e);
    return [];
  }
}
