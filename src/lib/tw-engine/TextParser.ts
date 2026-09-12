import type { TWTextObject, TWTextState, PDFTextObject } from './types';
import { PDFName, PDFRef } from 'pdf-lib';
import { fabricFontWeight, resolveNumericFontWeight } from '@/lib/twpdf/fonts/fontWeight';

/**
 * TextParser parses raw text content elements from a PDFJS page
 * and groups/merges adjacent characters into coherent block text objects,
 * mapping baseline offsets and affine transform matrices.
 */
export class TextParser {
  /**
   * Extracts text items from a PDFJS page and compiles them into TWTextObject items.
   */
  static async parsePageText(
    page: any,
    pageNum: number,
    viewport: any,
    pdfLibDoc?: any,
    pdfjs?: any
  ): Promise<TWTextObject[]> {
    try {
      const textContent = await page.getTextContent();
      if (!textContent || textContent.items.length === 0) return [];

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

      if (pdfLibDoc) {
        try {
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
          console.warn('pdf-lib failed to extract contents ref:', e);
        }
      }

      // Track graphics and text states from operatorList
      const textOps: any[] = [];
      let resolvedOPS = (pdfjs && pdfjs.OPS) || {};
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
        console.warn('Failed to parse page operator list for metadata mapping:', e);
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

      // Merge adjacent characters or small chunks horizontally
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
        const currFontSize = Math.sqrt(currC * currC + currD * currD) || Math.sqrt(currA * currA + currB * currB) || 12;

        const itemA = itemT[0];
        const itemB = itemT[1];
        const itemC = itemT[2];
        const itemD = itemT[3];
        const itemFontSize = Math.sqrt(itemC * itemC + itemD * itemD) || Math.sqrt(itemA * itemA + itemB * itemB) || 12;

        const sameLine = Math.abs(currT[5] - itemT[5]) < 2.0;
        const prevEndX = currT[4] + current.width;
        const distance = itemT[4] - prevEndX;
        const closeHorizontally = distance >= -3 && distance < currFontSize * 1.5;
        const sameFontSize = Math.abs(currFontSize - itemFontSize) < 2.0;
        const sameFont = current.fontName === item.fontName;

        if (sameLine && closeHorizontally && sameFontSize && sameFont) {
          const hasSpace = distance > currFontSize * 0.18 && !current.str.endsWith(' ') && !item.str.startsWith(' ');
          current.str += (hasSpace ? ' ' : '') + item.str;
          current.width = itemT[4] - currT[4] + item.width;
          current.rawIndices.push(item.rawIndex);
        } else {
          merged.push(current);
          current = { ...item, rawIndices: [item.rawIndex] };
        }
      }
      merged.push(current);

      // Map merged items to TWTextObject schema
      return merged.map((item, idx) => {
        const tx = item.transform[4];
        const ty = item.transform[5];
        const a = item.transform[0];
        const b = item.transform[1];
        const c = item.transform[2];
        const d = item.transform[3];

        const fontSize = Math.sqrt(c * c + d * d) || Math.sqrt(a * a + b * b) || 12;
        const rotation = Math.atan2(b, a) * (180 / Math.PI);
        const width = item.width > 0 ? item.width : fontSize * 0.55 * item.str.length;
        const height = item.height || fontSize;

        const [vx, vy] = viewport.convertToViewportPoint(tx, ty) as [number, number];

        // x and y in screen/viewport coordinate boundaries
        const x = vx;
        const y = vy - height;

        const fontStyleObj = textContent.styles ? textContent.styles[item.fontName] : null;
        const fontName = fontStyleObj ? fontStyleObj.fontFamily : item.fontName || 'Helvetica';

        const fName = (item.fontName || '').toLowerCase();
        const resFontFamily = (fontName || '').toLowerCase();
        const isItalic =
          fName.includes('italic') ||
          fName.includes('oblique') ||
          resFontFamily.includes('italic') ||
          resFontFamily.includes('oblique');

        const numericWeight = resolveNumericFontWeight({
          fontName: item.fontName,
          resolvedFontFamily: fontName,
        });
        const fontWeight = fabricFontWeight(numericWeight);
        const fontStyle = isItalic ? 'italic' : 'normal';

        const ascent = fontStyleObj ? fontStyleObj.ascent : undefined;
        const descent = fontStyleObj ? fontStyleObj.descent : undefined;
        const pdfFontName = item.fontName;
        const originalBBox = { x, y, width, height };

        const originalTextData = {
          text: item.str,
          x,
          y,
          width,
          height,
          fontSize,
          fontWeight,
          fontStyle,
          fontFamily: fontName,
          baseline: vy,
          ascent,
          descent,
          pdfFontName,
        };

        const textState: TWTextState = {
          text: item.str,
          fontName,
          fontSize,
          fontColor: '#000000',
          transformMatrix: [...item.transform],
          x,
          y,
          width,
          height,
          rotation,
          opacity: 1.0,
          fontWeight,
          fontStyle,
          baseline: vy,
          ascent,
          descent,
          pdfFontName,
          originalBBox,
          originalTextData,
        };

        const rawFontClean = item.fontName || '';
        const subsetMatch = rawFontClean.match(/^([A-Z]{6})\+/);
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
          fontName,
          subsetName,
          fontSize,
          color: '#000000',
          transformationMatrix: [...item.transform],
          boundingBox: { x, y, width, height },
          baseline: vy,
          ascent,
          descent,
          glyphIds: [],
          glyphWidths: [],
          unicodeMapping: {},
          cidMapping: {},
          originalText: item.str,
          currentText: item.str,
          renderMode: 0,
          writingMode: 0,
          rotation,
          graphicsStateId: matchedOp?.graphicsStateId,
        };

        return {
          id: `tw_text_${pageNum}_${idx}_${Date.now()}`,
          page: pageNum,
          type: 'text',
          zIndex: 0, // Assigned by PageParser
          
          x,
          y,
          width,
          height,
          rotation,
          opacity: 1.0,
          
          visible: true,
          locked: false,
          deleted: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          
          pageIndex: pageNum - 1,
          operatorIndex: pdfObject.operatorIndex,
          transformationMatrix: [...item.transform],
          pdfObject,
          isDirty: false,

          text: item.str,
          fontName,
          fontSize,
          fontColor: '#000000',
          baseline: vy,
          boundingBox: {
            x,
            y,
            width,
            height,
          },

          fontWeight,
          fontStyle,
          ascent,
          descent,
          pdfFontName,
          originalBBox,
          originalTextData,

          originalState: { ...textState },
          currentState: { ...textState },
        };
      });
    } catch (e) {
      console.error(`TextParser failed on page ${pageNum}`, e);
      return [];
    }
  }
}
