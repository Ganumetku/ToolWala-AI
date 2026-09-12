export type MaskInsets = {
  left: number;
  top: number;
  right: number;
  bottom: number;
};

export type RunMaskAnalysis = {
  backgroundColor: string;
  insets: MaskInsets;
};

type Rgb = { r: number; g: number; b: number; L: number };

const INVISIBLE_BG = 'rgba(255, 255, 255, 0.001)';
const MASK_PAD_PX = 1;
const BORDER_INSET_PX = 1;

function luminance(r: number, g: number, b: number): number {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

function toHex(r: number, g: number, b: number): string {
  const h = (c: number) => Math.max(0, Math.min(255, Math.round(c))).toString(16).padStart(2, '0');
  return `#${h(r)}${h(g)}${h(b)}`;
}

function medianRgb(pixels: Rgb[]): Rgb {
  const mid = (arr: number[]) => {
    const s = [...arr].sort((a, b) => a - b);
    const m = Math.floor(s.length / 2);
    return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
  };
  return {
    r: mid(pixels.map((p) => p.r)),
    g: mid(pixels.map((p) => p.g)),
    b: mid(pixels.map((p) => p.b)),
    L: 0,
  };
}

function canvasRenderScale(): number {
  const pixelRatio = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
  return Math.max(2.0, pixelRatio);
}

function readPixel(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  x: number,
  y: number
): Rgb | null {
  if (x < 0 || y < 0 || x >= width || y >= height) return null;
  const i = (y * width + x) * 4;
  const a = data[i + 3];
  if (a === 0) return null;
  const r = data[i];
  const g = data[i + 1];
  const b = data[i + 2];
  return { r, g, b, L: luminance(r, g, b) };
}

/**
 * Sample the PDF.js bitmap in a halo just outside the run box (not inside glyphs),
 * drop ink/border pixels, and take the median remaining color.
 * Detects dark straight edges on each side and returns 1px insets for those sides.
 */
export function analyzeRunMask(
  canvas: HTMLCanvasElement | null,
  box: { x: number; y: number; width: number; height: number },
  scale: number
): RunMaskAnalysis {
  const fallback: RunMaskAnalysis = {
    backgroundColor: '#ffffff',
    insets: { left: 0, top: 0, right: 0, bottom: 0 },
  };
  if (!canvas) return fallback;
  const ctx = canvas.getContext('2d');
  if (!ctx || box.width <= 0 || box.height <= 0) return fallback;

  try {
    const renderScale = canvasRenderScale();
    const haloCss = 4;
    const cssLeft = box.x * scale;
    const cssTop = box.y * scale;
    const cssW = box.width * scale;
    const cssH = box.height * scale;

    const regionLeft = Math.floor((cssLeft - haloCss) * renderScale);
    const regionTop = Math.floor((cssTop - haloCss) * renderScale);
    const regionRight = Math.ceil((cssLeft + cssW + haloCss) * renderScale);
    const regionBottom = Math.ceil((cssTop + cssH + haloCss) * renderScale);

    const sx = Math.max(0, regionLeft);
    const sy = Math.max(0, regionTop);
    const sw = Math.min(canvas.width - sx, regionRight - sx);
    const sh = Math.min(canvas.height - sy, regionBottom - sy);
    if (sw <= 1 || sh <= 1) return fallback;

    const img = ctx.getImageData(sx, sy, sw, sh);
    const { data, width, height } = img;

    const boxL = Math.round(cssLeft * renderScale) - sx;
    const boxT = Math.round(cssTop * renderScale) - sy;
    const boxR = Math.round((cssLeft + cssW) * renderScale) - sx;
    const boxB = Math.round((cssTop + cssH) * renderScale) - sy;

    const haloPx = Math.max(2, Math.round(2 * renderScale));
    const step = Math.max(1, Math.round(renderScale));

    const outside: Rgb[] = [];
    const pushIfOutsideInk = (px: Rgb | null) => {
      if (!px) return;
      if (px.L < 55) return;
      outside.push(px);
    };

    for (let x = boxL; x <= boxR; x += step) {
      for (let d = 1; d <= haloPx; d++) {
        pushIfOutsideInk(readPixel(data, width, height, x, boxT - d));
        pushIfOutsideInk(readPixel(data, width, height, x, boxB + d));
      }
    }
    for (let y = boxT; y <= boxB; y += step) {
      for (let d = 1; d <= haloPx; d++) {
        pushIfOutsideInk(readPixel(data, width, height, boxL - d, y));
        pushIfOutsideInk(readPixel(data, width, height, boxR + d, y));
      }
    }

    const bg = outside.length > 0 ? medianRgb(outside) : { r: 255, g: 255, b: 255, L: 255 };
    bg.L = luminance(bg.r, bg.g, bg.b);

    const sampleStrip = (
      along: 'x' | 'y',
      start: number,
      end: number,
      fixed: number
    ): Rgb[] => {
      const pixels: Rgb[] = [];
      for (let p = start; p <= end; p += step) {
        const px = along === 'x' ? readPixel(data, width, height, p, fixed) : readPixel(data, width, height, fixed, p);
        if (px) pixels.push(px);
      }
      return pixels;
    };

    const sideIsBorder = (pixels: Rgb[]): boolean => {
      if (pixels.length < 4) return false;
      const dark = pixels.filter((p) => bg.L - p.L > 36 && p.L < 150);
      return dark.length / pixels.length >= 0.45;
    };

    const insets: MaskInsets = { left: 0, top: 0, right: 0, bottom: 0 };
    if (sideIsBorder(sampleStrip('y', boxT, boxB, boxL))) insets.left = BORDER_INSET_PX;
    if (sideIsBorder(sampleStrip('y', boxT, boxB, boxR))) insets.right = BORDER_INSET_PX;
    if (sideIsBorder(sampleStrip('x', boxL, boxR, boxT))) insets.top = BORDER_INSET_PX;
    if (sideIsBorder(sampleStrip('x', boxL, boxR, boxB))) insets.bottom = BORDER_INSET_PX;

    return { backgroundColor: toHex(bg.r, bg.g, bg.b), insets };
  } catch (e) {
    console.error('Failed to analyze run mask from canvas', e);
    return fallback;
  }
}

export function detectBackgroundColorFromCanvas(
  canvas: HTMLCanvasElement | null,
  box: { x: number; y: number; width: number; height: number },
  scale: number
): string {
  return analyzeRunMask(canvas, box, scale).backgroundColor;
}

export function computeLocalMaskRect(
  width: number,
  height: number,
  insets?: MaskInsets | null,
  pad = MASK_PAD_PX
): { x: number; y: number; width: number; height: number } {
  const left = insets?.left ?? 0;
  const top = insets?.top ?? 0;
  const right = insets?.right ?? 0;
  const bottom = insets?.bottom ?? 0;
  return {
    x: -pad + left,
    y: -pad + top,
    width: Math.max(1, width + pad * 2 - left - right),
    height: Math.max(1, height + pad * 2 - top - bottom),
  };
}

export function isHitTestBackground(color?: string | null): boolean {
  return !color || color === 'transparent' || color === INVISIBLE_BG;
}

export const ORIGINAL_TEXT_HIT_BG = INVISIBLE_BG;
