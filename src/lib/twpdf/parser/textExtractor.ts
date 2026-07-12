import { mapPdfFontToLoadedFont, mapPdfFontToWebFont } from '@/lib/twpdf/fonts';
import type { TextBoxInfo } from '@/types/pdf';

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
    return '#0b2c8c';
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
  viewport: any
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
      } else {
        merged.push(current);
        current = { ...item };
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
        pdfFontName: item.fontName,
        ascent: fontStyleObj ? fontStyleObj.ascent : undefined,
        descent: fontStyleObj ? fontStyleObj.descent : undefined,
      };
    });
  } catch (e) {
    console.error(`Text extraction failed for page ${pageNum}`, e);
    return [];
  }
}
