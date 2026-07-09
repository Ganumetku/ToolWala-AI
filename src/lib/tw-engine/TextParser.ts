import type { TWTextObject, TWTextState } from './types';

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
    viewport: any
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

      // Filter and sanitize items
      const validItems = rawItems
        .filter((item) => item && typeof item.str === 'string' && item.str.trim().length > 0)
        .map((item) => {
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
          };
        });

      if (validItems.length === 0) return [];

      // Merge adjacent characters or small chunks horizontally
      const merged: typeof validItems = [];
      let current = { ...validItems[0] };

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
        } else {
          merged.push(current);
          current = { ...item };
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
          operatorIndex: idx,
          transformationMatrix: [...item.transform],
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
