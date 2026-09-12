/**
 * Per-run PDF text extraction: group pdf.js getTextContent() items into
 * word/phrase-sized runs instead of full lines or paragraphs.
 */

export type PdfTextItem = {
  str: string;
  transform: number[];
  fontName: string;
  width: number;
  height: number;
  rawIndex: number;
};

export type GroupedTextRun = PdfTextItem & {
  rawIndices: number[];
  fontSize: number;
  angleRad: number;
};

export type FontEmMetrics = {
  /** Fraction of em above the baseline (typically ~0.8). */
  ascent: number;
  /** Fraction of em below the baseline, negative (typically ~-0.2). */
  descent: number;
};

const BASELINE_EPS_PT = 0.75;
const GAP_CHAR_WIDTH_FACTOR = 0.3;
const COLUMN_GAP_FONT_FACTOR = 0.8;
const OVERLAP_SLACK_FACTOR = 0.15;
const ANGLE_EPS_RAD = (1.5 * Math.PI) / 180;

export function fontSizeFromTransform(t: number[]): number {
  return Math.hypot(t[0], t[1]) || Math.hypot(t[2], t[3]) || 12;
}

export function angleFromTransform(t: number[]): number {
  return Math.atan2(t[1], t[0]);
}

export function normalizeEmMetrics(ascent?: number, descent?: number): FontEmMetrics {
  let a = ascent;
  let d = descent;
  if (typeof a === 'number' && Number.isFinite(a) && Math.abs(a) > 2) a = a / 1000;
  if (typeof d === 'number' && Number.isFinite(d) && Math.abs(d) > 2) d = d / 1000;
  if (typeof a !== 'number' || !Number.isFinite(a) || a <= 0) a = 0.8;
  if (typeof d !== 'number' || !Number.isFinite(d)) d = -0.2;
  if (d > 0) d = -d;
  return { ascent: a, descent: d };
}

export function readCommonFontObject(page: { commonObjs?: { get: (id: string) => unknown }; objs?: { get: (id: string) => unknown } } | null, fontName: string): Record<string, unknown> | null {
  if (!page || !fontName) return null;
  const tryGet = (store?: { get: (id: string) => unknown }) => {
    if (!store?.get) return null;
    try {
      const obj = store.get(fontName);
      if (obj && typeof obj === 'object') return obj as Record<string, unknown>;
    } catch {
      return null;
    }
    return null;
  };
  return tryGet(page.commonObjs) || tryGet(page.objs);
}

export function fontMetricsForName(
  page: { commonObjs?: { get: (id: string) => unknown }; objs?: { get: (id: string) => unknown } } | null,
  fontName: string,
  styles?: Record<string, { ascent?: number; descent?: number }>
): FontEmMetrics {
  const style = styles?.[fontName];
  let ascent = style?.ascent;
  let descent = style?.descent;
  const fontObj = readCommonFontObject(page, fontName);
  if (fontObj) {
    if (typeof fontObj.ascent === 'number') ascent = fontObj.ascent;
    if (typeof fontObj.descent === 'number') descent = fontObj.descent;
    const bbox = (fontObj.bbox || fontObj.fontBBox) as number[] | undefined;
    if (Array.isArray(bbox) && bbox.length >= 4) {
      if (ascent == null) ascent = bbox[3];
      if (descent == null) descent = bbox[1];
    }
  }
  return normalizeEmMetrics(ascent, descent);
}

function unitDirection(t: number[]): { ux: number; uy: number } {
  const scale = Math.hypot(t[0], t[1]) || 1;
  return { ux: t[0] / scale, uy: t[1] / scale };
}

function advanceTransform(t: number[], distance: number): number[] {
  const { ux, uy } = unitDirection(t);
  return [t[0], t[1], t[2], t[3], t[4] + ux * distance, t[5] + uy * distance];
}

function projectAlong(t: number[], x: number, y: number): { along: number; across: number } {
  const { ux, uy } = unitDirection(t);
  const dx = x - t[4];
  const dy = y - t[5];
  return {
    along: dx * ux + dy * uy,
    across: -dx * uy + dy * ux,
  };
}

function averageCharWidth(item: PdfTextItem): number {
  const units = Array.from(item.str).length || 1;
  if (item.width > 0) return item.width / units;
  return fontSizeFromTransform(item.transform) * 0.5;
}

/**
 * Split a pdf.js item on whitespace so a single Tj of a whole line
 * becomes word-sized seeds. Width is apportioned by Unicode scalar count.
 */
export function explodeItemOnWhitespace(item: PdfTextItem): PdfTextItem[] {
  const glyphs = Array.from(item.str);
  if (glyphs.length === 0) return [];
  if (!glyphs.some((ch) => /\s/.test(ch))) {
    return item.str.trim().length > 0 ? [item] : [];
  }

  const totalWidth = item.width > 0 ? item.width : fontSizeFromTransform(item.transform) * 0.55 * glyphs.length;
  const charW = totalWidth / glyphs.length;
  const pieces: PdfTextItem[] = [];
  let consumed = 0;
  let buf: string[] = [];
  let bufStart = 0;

  const flush = () => {
    if (buf.length === 0) return;
    const str = buf.join('');
    pieces.push({
      ...item,
      str,
      width: charW * buf.length,
      transform: advanceTransform(item.transform, bufStart),
    });
    buf = [];
  };

  for (const ch of glyphs) {
    if (/\s/.test(ch)) {
      flush();
      consumed += charW;
      bufStart = consumed;
    } else {
      if (buf.length === 0) bufStart = consumed;
      buf.push(ch);
      consumed += charW;
    }
  }
  flush();
  return pieces;
}

export function explodeItemsOnWhitespace(items: PdfTextItem[]): PdfTextItem[] {
  return items.flatMap(explodeItemOnWhitespace);
}

function canMergeRuns(current: GroupedTextRun, next: PdfTextItem): boolean {
  if (current.fontName !== next.fontName) return false;

  const currAngle = current.angleRad;
  const nextAngle = angleFromTransform(next.transform);
  let dAngle = Math.abs(currAngle - nextAngle);
  dAngle = Math.min(dAngle, Math.abs(dAngle - 2 * Math.PI));
  if (dAngle > ANGLE_EPS_RAD) return false;

  const currSize = current.fontSize;
  const nextSize = fontSizeFromTransform(next.transform);
  if (Math.abs(currSize - nextSize) > 0.5) return false;

  const local = projectAlong(current.transform, next.transform[4], next.transform[5]);
  if (Math.abs(local.across) > BASELINE_EPS_PT) return false;

  const gap = local.along - current.width;
  if (gap >= currSize * COLUMN_GAP_FONT_FACTOR) return false;
  const charW = averageCharWidth(current);
  const maxGap = charW * GAP_CHAR_WIDTH_FACTOR;
  const minGap = -charW * OVERLAP_SLACK_FACTOR;
  return gap >= minGap && gap < maxGap;
}

export function documentHasSelectableText(
  texts: Record<number, Array<{ text?: string }>>
): boolean {
  return Object.values(texts).some((runs) => runs.some((r) => (r.text || '').trim().length > 0));
}

export function groupAdjacentTextRuns(items: PdfTextItem[]): GroupedTextRun[] {
  if (items.length === 0) return [];

  const grouped: GroupedTextRun[] = [];
  let current: GroupedTextRun = {
    ...items[0],
    transform: [...items[0].transform],
    rawIndices: [items[0].rawIndex],
    fontSize: fontSizeFromTransform(items[0].transform),
    angleRad: angleFromTransform(items[0].transform),
  };

  for (let i = 1; i < items.length; i++) {
    const item = items[i];
    if (canMergeRuns(current, item)) {
      const local = projectAlong(current.transform, item.transform[4], item.transform[5]);
      current.str += item.str;
      current.width = local.along + item.width;
      current.rawIndices.push(item.rawIndex);
    } else {
      grouped.push(current);
      current = {
        ...item,
        transform: [...item.transform],
        rawIndices: [item.rawIndex],
        fontSize: fontSizeFromTransform(item.transform),
        angleRad: angleFromTransform(item.transform),
      };
    }
  }
  grouped.push(current);
  return grouped;
}

export type ViewportRunBox = {
  x: number;
  y: number;
  width: number;
  height: number;
  baseline: number;
  fontSize: number;
  angleDeg: number;
  originalPdfX: number;
  originalPdfY: number;
  originalPdfWidth: number;
  originalPdfHeight: number;
  originalPdfFontSize: number;
};

export function computeRunViewportBox(
  run: { transform: number[]; width: number; str: string; fontSize: number; angleRad: number },
  viewport: { convertToViewportPoint: (x: number, y: number) => [number, number] | number[] },
  metrics: FontEmMetrics
): ViewportRunBox {
  const t = run.transform;
  const fontSizePdf = run.fontSize || fontSizeFromTransform(t);
  const tx = t[4];
  const ty = t[5];
  const widthPdf = run.width > 0 ? run.width : fontSizePdf * 0.55 * Math.max(Array.from(run.str).length, 1);

  const origin = viewport.convertToViewportPoint(tx, ty) as [number, number];
  const [vx, vy] = origin;
  const { ux, uy } = unitDirection(t);
  const end = viewport.convertToViewportPoint(tx + ux * widthPdf, ty + uy * widthPdf) as [number, number];
  const boxWidth = Math.hypot(end[0] - vx, end[1] - vy);

  const [ax, ay] = viewport.convertToViewportPoint(tx + t[0], ty + t[1]) as [number, number];
  const fontSizeViewport = Math.hypot(ax - vx, ay - vy) || fontSizePdf;

  const boxHeight = fontSizeViewport * (metrics.ascent - metrics.descent);
  const ascentPx = fontSizeViewport * metrics.ascent;

  return {
    x: vx,
    y: vy - ascentPx,
    width: boxWidth,
    height: boxHeight,
    baseline: vy,
    fontSize: fontSizeViewport,
    angleDeg: (run.angleRad * 180) / Math.PI,
    originalPdfX: tx,
    originalPdfY: ty,
    originalPdfWidth: widthPdf,
    originalPdfHeight: fontSizePdf * (metrics.ascent - metrics.descent),
    originalPdfFontSize: fontSizePdf,
  };
}
