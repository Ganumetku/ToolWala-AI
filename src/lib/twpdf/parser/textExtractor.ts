import { mapPdfFontToLoadedFont, mapPdfFontToWebFont } from '@/lib/twpdf/fonts';
import type { TextBoxInfo } from '@/types/pdf';
import type { PDFTextObject } from '@/lib/tw-engine/types';
import { PDFDocument, PDFName, PDFRef } from 'pdf-lib';

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
    if (textPixels.length === 0) {
      return '#000000';
    }

    textPixels.sort((a, b) => a.L - b.L);
    const best = textPixels[0];

    const toHex = (c: number) => {
      const hex = c.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };
    return `#${toHex(best.r)}${toHex(best.g)}${toHex(best.b)}`;
  } catch (e) {
    console.error('Failed to detect text color from canvas', e);
    return '#000000';
  }
}

export function detectBackgroundColorFromCanvas(
  canvas: HTMLCanvasElement | null,
  box: { x: number; y: number; width: number; height: number },
  scale: number
): string {
  if (!canvas) return '#ffffff';
  try {
    const ctx = canvas.getContext('2d');
    if (!ctx) return '#ffffff';

    const x = box.x * scale;
    const y = box.y * scale;
    const w = box.width * scale;
    const h = box.height * scale;

    const pixelRatio = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
    const renderScale = Math.max(2.0, pixelRatio);

    const colorCounts: Record<string, number> = {};
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
            const roundedR = Math.round(r / 8) * 8;
            const roundedG = Math.round(g / 8) * 8;
            const roundedB = Math.round(b / 8) * 8;

            const toHex = (c: number) => {
              const hex = Math.min(255, Math.max(0, c)).toString(16);
              return hex.length === 1 ? '0' + hex : hex;
            };
            const hex = `#${toHex(roundedR)}${toHex(roundedG)}${toHex(roundedB)}`;
            colorCounts[hex] = (colorCounts[hex] || 0) + 1;
          }
        }
      }
    }

    const entries = Object.entries(colorCounts);
    if (entries.length === 0) return '#ffffff';

    entries.sort((a, b) => b[1] - a[1]);
    return entries[0][0];
  } catch (e) {
    console.error('Failed to detect background color from canvas', e);
    return '#ffffff';
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

    // Track graphics and text states from operatorList
    const textOps: any[] = [];
    const resolvedOPS = page.OPS || (page._transport && page._transport.messageHandler && page._transport.messageHandler.OPS) || {};
    try {
      const opList = await page.getOperatorList();
      const { fnArray, argsArray } = opList;

      let currentFont = '';
      let currentTm = [1, 0, 0, 1, 0, 0];
      let currentTd = [0, 0];
      let currentGs = '';

      for (let i = 0; i < fnArray.length; i++) {
        const fn = fnArray[i];
        const args = argsArray[i];

        if (fn === resolvedOPS.setFont) {
          currentFont = args[0];
        } else if (fn === resolvedOPS.setTextMatrix) {
          currentTm = args;
        } else if (fn === resolvedOPS.moveText || fn === resolvedOPS.moveTextWithLeading) {
          currentTd = args;
        } else if (fn === resolvedOPS.setGState) {
          currentGs = args[0];
        } else if (
          fn === resolvedOPS.showText ||
          fn === resolvedOPS.showTextGlyphs ||
          fn === resolvedOPS.nextLineShowText ||
          fn === resolvedOPS.nextLineSetSpacingShowText
        ) {
          let operatorType = 'Tj';
          if (fn === resolvedOPS.showTextGlyphs) operatorType = 'TJ';
          else if (fn === resolvedOPS.nextLineShowText) operatorType = "'";
          else if (fn === resolvedOPS.nextLineSetSpacingShowText) operatorType = '"';

          let originalEncodedString = '';
          let originalOperatorBytes = '';

          if (fn === resolvedOPS.showText) {
            const glyphs = args[0] || [];
            originalEncodedString = glyphs.map((g: any) => g.unicode || g.fontChar || '').join('');
            originalOperatorBytes = `(${originalEncodedString}) Tj`;
          } else if (fn === resolvedOPS.showTextGlyphs) {
            const elements = args[0] || [];
            originalEncodedString = elements
              .map((el: any) => {
                if (typeof el === 'number') return '';
                return el.unicode || el.fontChar || '';
              })
              .join('');
            const parts = elements.map((el: any) => {
              if (typeof el === 'number') return el.toString();
              return `(${el.unicode || el.fontChar || ''})`;
            });
            originalOperatorBytes = `[ ${parts.join(' ')} ] TJ`;
          } else if (fn === resolvedOPS.nextLineShowText) {
            const glyphs = args[0] || [];
            originalEncodedString = glyphs.map((g: any) => g.unicode || g.fontChar || '').join('');
            originalOperatorBytes = `(${originalEncodedString}) '`;
          } else if (fn === resolvedOPS.nextLineSetSpacingShowText) {
            const aw = args[0] || 0;
            const ac = args[1] || 0;
            const glyphs = args[2] || [];
            originalEncodedString = glyphs.map((g: any) => g.unicode || g.fontChar || '').join('');
            originalOperatorBytes = `${aw} ${ac} (${originalEncodedString}) "`;
          }

          textOps.push({
            operatorType,
            operatorIndex: i,
            originalOperatorBytes,
            originalEncodedString,
            originalTextMatrix: [...currentTm],
            originalTextPosition: [...currentTd],
            fontResourceName: currentFont,
            graphicsStateId: currentGs || undefined,
          });
        }
      }
    } catch (e) {
      console.warn('Failed to parse page operator list for metadata mapping in detectOriginalText:', e);
    }

    // Filter and sanitize items, preserving original index
    const rawItemsWithIndex = rawItems.map((item, index) => ({ item, index }));
    const validItems = rawItemsWithIndex
      .filter(({ item }) => item && typeof item.str === 'string' && item.str.trim().length > 0)
      .map(({ item, index }) => {
        const a = item.transform[0];
        const b = item.transform[1];
        const c = item.transform[2];
        const d = item.transform[3];
        const calculatedFontSize = Math.sqrt(c * c + d * d) || Math.sqrt(a * a + b * b) || 10;
        return {
          str: item.str,
          transform: item.transform,
          fontName: item.fontName || '',
          width: item.width || 0,
          height: item.height || calculatedFontSize || 10,
          rawIndex: index,
        };
      });

    if (validItems.length === 0) return [];

    const merged: Array<typeof validItems[0] & { rawIndices: number[] }> = [];
    let current = { ...validItems[0], rawIndices: [validItems[0].rawIndex] };

    for (let i = 1; i < validItems.length; i++) {
      const item = validItems[i];
      const currT = current.transform;
      const itemT = item.transform;

      const currA = currT[0];
      const currB = currT[1];
      const currC = currT[2];
      const currD = currT[3];
      const currFontSize =
        Math.sqrt(currC * currC + currD * currD) || Math.sqrt(currA * currA + currB * currB) || 12;

      const itemA = itemT[0];
      const itemB = itemT[1];
      const itemC = itemT[2];
      const itemD = itemT[3];
      const itemFontSize =
        Math.sqrt(itemC * itemC + itemD * itemD) || Math.sqrt(itemA * itemA + itemB * itemB) || 12;

      const sameLine = Math.abs(currT[5] - itemT[5]) < 2;
      const prevEndX = currT[4] + current.width;
      const distance = itemT[4] - prevEndX;
      const closeHorizontally = distance >= -3 && distance < currFontSize * 1.25;
      const sameFontSize = Math.abs(currFontSize - itemFontSize) < 1.5;

      if (sameLine && closeHorizontally && sameFontSize) {
        const hasSpace =
          distance > currFontSize * 0.15 && !current.str.endsWith(' ') && !item.str.startsWith(' ');
        current.str += (hasSpace ? ' ' : '') + item.str;
        current.width = itemT[4] - currT[4] + item.width;
        current.rawIndices.push(item.rawIndex);
      } else {
        merged.push(current);
        current = { ...item, rawIndices: [item.rawIndex] };
      }
    }
    merged.push(current);

    return merged.map((item, idx) => {
      const tx = item.transform[4];
      const ty = item.transform[5];
      const a = item.transform[0];
      const b = item.transform[1];
      const c = item.transform[2];
      const d = item.transform[3];
      const fontSizePdf = Math.sqrt(c * c + d * d) || Math.sqrt(a * a + b * b) || 12;
      const angle = Math.atan2(b, a) * (180 / Math.PI);
      const widthPdf = item.width;

      const [vx, vy] = viewport.convertToViewportPoint(tx, ty) as [number, number];
      const boxHeight = fontSizePdf;
      const boxWidth = widthPdf > 0 ? widthPdf : fontSizePdf * 0.55 * item.str.length;

      const fontStyleObj = textContent.styles ? textContent.styles[item.fontName] : null;
      const resolvedFontFamily = fontStyleObj ? fontStyleObj.fontFamily : '';

      const fName = (item.fontName || '').toLowerCase();
      const resFontFamily = (resolvedFontFamily || '').toLowerCase();

      const isBold =
        fName.includes('bold') ||
        fName.includes('black') ||
        fName.includes('heavy') ||
        fName.includes('semibold') ||
        fName.includes('medium') ||
        fName.includes('w700') ||
        fName.includes('w600') ||
        fName.includes('w-700') ||
        fName.includes('w-600') ||
        resFontFamily.includes('bold') ||
        resFontFamily.includes('black') ||
        resFontFamily.includes('heavy') ||
        resFontFamily.includes('semibold') ||
        resFontFamily.includes('medium') ||
        resFontFamily.includes('w700') ||
        resFontFamily.includes('w600') ||
        resFontFamily.includes('w-700') ||
        resFontFamily.includes('w-600');

      const isItalic =
        fName.includes('italic') ||
        fName.includes('oblique') ||
        resFontFamily.includes('italic') ||
        resFontFamily.includes('oblique');

      const webFontFamily = mapPdfFontToWebFont(item.fontName, resolvedFontFamily);
      const loadedFontFamily = mapPdfFontToLoadedFont(item.fontName, resolvedFontFamily);
      const activeFontFamily = loadedFontFamily
        ? `"${loadedFontFamily}", ${webFontFamily}, sans-serif`
        : resolvedFontFamily
          ? `"${resolvedFontFamily}", ${webFontFamily}, sans-serif`
          : `${webFontFamily}, sans-serif`;

      const rawFontName = item.fontName || '';
      const subsetMatch = rawFontName.match(/^([A-Z]{6})\+/);
      const subsetName = subsetMatch ? subsetMatch[1] : undefined;

      const firstRawIndex = item.rawIndices[0];
      const matchedOp = textOps[firstRawIndex];

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
        fontSize: fontSizePdf,
        color: '#000000',
        transformationMatrix: [...item.transform],
        boundingBox: { x: vx, y: vy - boxHeight, width: boxWidth, height: boxHeight * 1.15 },
        baseline: vy,
        ascent: fontStyleObj ? fontStyleObj.ascent : undefined,
        descent: fontStyleObj ? fontStyleObj.descent : undefined,
        glyphIds: [],
        glyphWidths: [],
        unicodeMapping: {},
        cidMapping: {},
        originalText: item.str,
        currentText: item.str,
        renderMode: 0,
        writingMode: 0,
        rotation: angle,
        graphicsStateId: matchedOp?.graphicsStateId,
      };

      return {
        id: `orig_${pageNum}_${idx}_${Date.now()}`,
        text: item.str,
        x: vx,
        y: vy - boxHeight,
        width: boxWidth,
        height: boxHeight * 1.15,
        fontSize: fontSizePdf,
        angle: angle,
        fontWeight: isBold ? 'bold' : 'normal',
        fontStyle: isItalic ? 'italic' : 'normal',
        fontFamily: activeFontFamily,
        originalPdfX: tx,
        originalPdfY: ty,
        originalPdfWidth: widthPdf > 0 ? widthPdf : fontSizePdf * 0.55 * item.str.length,
        originalPdfHeight: fontSizePdf,
        originalPdfFontSize: fontSizePdf,
        baseline: vy,
        pdfFontName: item.fontName,
        ascent: fontStyleObj ? fontStyleObj.ascent : undefined,
        descent: fontStyleObj ? fontStyleObj.descent : undefined,
        pdfObject,
      };
    });
  } catch (e) {
    console.error(`Text extraction failed for page ${pageNum}`, e);
    return [];
  }
}
