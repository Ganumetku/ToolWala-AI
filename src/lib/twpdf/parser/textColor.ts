type PdfjsOps = Record<string, number>;

export type ShowTextOp = {
  operatorType: string;
  operatorIndex: number;
  originalOperatorBytes: string;
  originalEncodedString: string;
  originalTextMatrix: number[];
  originalTextPosition: number[];
  fontResourceName: string;
  graphicsStateId?: string;
  fillColor: string;
  strokeColor?: string;
  renderMode?: number;
  lineWidth?: number;
};

type ColorState = {
  fill: string;
  stroke: string;
  renderMode: number;
  font: string;
  tm: number[];
  td: number[];
  gs: string;
  lineWidth: number;
};

function componentToByte(val: number): number {
  return Math.max(0, Math.min(255, val > 1 ? Math.round(val) : Math.round(val * 255)));
}

function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (c: number) => componentToByte(c).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function cmykToHex(c: number, m: number, y: number, k: number): string {
  const r = 1 - Math.min(1, c + k);
  const g = 1 - Math.min(1, m + k);
  const b = 1 - Math.min(1, y + k);
  return rgbToHex(r, g, b);
}

function colorFromComponents(args: unknown[] | undefined, fallback: string): string {
  if (!args || args.length === 0) return fallback;
  if (typeof args[0] === 'string' && /^#/.test(args[0])) return args[0] as string;
  const nums = args.filter((v): v is number => typeof v === 'number');
  if (nums.length === 1) return rgbToHex(nums[0], nums[0], nums[0]);
  if (nums.length === 3) return rgbToHex(nums[0], nums[1], nums[2]);
  if (nums.length >= 4) return cmykToHex(nums[0], nums[1], nums[2], nums[3]);
  return fallback;
}

function glyphsToString(glyphs: unknown): string {
  if (!Array.isArray(glyphs)) return '';
  return glyphs
    .map((g) => {
      if (typeof g === 'number') return '';
      if (!g || typeof g !== 'object') return '';
      const rec = g as { unicode?: string; fontChar?: string };
      return rec.unicode || rec.fontChar || '';
    })
    .join('');
}

function decodeShowText(
  fn: number,
  args: unknown[],
  resolved: PdfjsOps
): { operatorType: string; originalEncodedString: string; originalOperatorBytes: string } | null {
  if (fn === resolved.showText) {
    const str = glyphsToString(args[0]);
    return { operatorType: 'Tj', originalEncodedString: str, originalOperatorBytes: `(${str}) Tj` };
  }
  if (fn === resolved.showSpacedText || fn === (resolved as unknown as { showTextGlyphs?: number }).showTextGlyphs) {
    const elements = (args[0] as unknown[]) || [];
    const str = glyphsToString(elements);
    const parts = elements.map((el) => {
      if (typeof el === 'number') return String(el);
      const rec = el as { unicode?: string; fontChar?: string };
      return `(${rec?.unicode || rec?.fontChar || ''})`;
    });
    return { operatorType: 'TJ', originalEncodedString: str, originalOperatorBytes: `[ ${parts.join(' ')} ] TJ` };
  }
  if (fn === resolved.nextLineShowText) {
    const str = glyphsToString(args[0]);
    return { operatorType: "'", originalEncodedString: str, originalOperatorBytes: `(${str}) '` };
  }
  if (fn === resolved.nextLineSetSpacingShowText) {
    const str = glyphsToString(args[2]);
    return {
      operatorType: '"',
      originalEncodedString: str,
      originalOperatorBytes: `${args[0] || 0} ${args[1] || 0} (${str}) "`,
    };
  }
  return null;
}

function effectiveTextColor(state: ColorState): string {
  // 0 fill, 1 stroke, 2 fill+stroke, 3 invisible
  if (state.renderMode === 1) return state.stroke;
  if (state.renderMode === 3) return state.fill;
  return state.fill;
}

/**
 * Walk pdf.js operator list, tracking fill color (rg/g/k/sc/scn) through
 * q/Q, and attach the color in effect at each show-text operator.
 */
export async function extractShowTextOps(page: {
  getOperatorList: () => Promise<{ fnArray: number[]; argsArray: unknown[][] }>;
}): Promise<ShowTextOp[]> {
  const ops: ShowTextOp[] = [];
  try {
    const opList = await page.getOperatorList();
    const { fnArray, argsArray } = opList;
    const { OPS: resolved } = await import('pdfjs-dist');

    const initial: ColorState = {
      fill: '#000000',
      stroke: '#000000',
      renderMode: 0,
      font: '',
      tm: [1, 0, 0, 1, 0, 0],
      td: [0, 0],
      gs: '',
      lineWidth: 1,
    };
    const stack: ColorState[] = [];
    let current: ColorState = { ...initial, tm: [...initial.tm], td: [...initial.td] };

    for (let i = 0; i < fnArray.length; i++) {
      const fn = fnArray[i];
      const args = argsArray[i] || [];

      if (fn === resolved.save) {
        stack.push({ ...current, tm: [...current.tm], td: [...current.td] });
      } else if (fn === resolved.restore) {
        const prev = stack.pop();
        if (prev) current = prev;
      } else if (fn === resolved.setFont) {
        current.font = String(args[0] ?? '');
      } else if (fn === resolved.setTextMatrix) {
        current.tm = args as number[];
      } else if (fn === resolved.moveText || fn === resolved.setLeadingMoveText) {
        current.td = args as number[];
      } else if (fn === resolved.setGState) {
        current.gs = String(args[0] ?? '');
      } else if (fn === resolved.setTextRenderingMode) {
        current.renderMode = typeof args[0] === 'number' ? args[0] : 0;
      } else if (fn === resolved.setLineWidth) {
        current.lineWidth = typeof args[0] === 'number' ? args[0] : current.lineWidth;
      } else if (fn === resolved.setFillRGBColor || fn === resolved.setFillGray || fn === resolved.setFillCMYKColor) {
        current.fill = colorFromComponents(args, current.fill);
      } else if (fn === resolved.setStrokeRGBColor || fn === resolved.setStrokeGray || fn === resolved.setStrokeCMYKColor) {
        current.stroke = colorFromComponents(args, current.stroke);
      } else if (fn === resolved.setFillColor || fn === resolved.setFillColorN) {
        current.fill = colorFromComponents(args, current.fill);
      } else if (fn === resolved.setStrokeColor || fn === resolved.setStrokeColorN) {
        current.stroke = colorFromComponents(args, current.stroke);
      } else {
        const decoded = decodeShowText(fn, args, resolved);
        if (decoded) {
          ops.push({
            operatorType: decoded.operatorType,
            operatorIndex: i,
            originalOperatorBytes: decoded.originalOperatorBytes,
            originalEncodedString: decoded.originalEncodedString,
            originalTextMatrix: [...current.tm],
            originalTextPosition: [...current.td],
            fontResourceName: current.font,
            graphicsStateId: current.gs || undefined,
            fillColor: effectiveTextColor(current),
            strokeColor: current.stroke,
            renderMode: current.renderMode,
            lineWidth: current.lineWidth,
          });
        }
      }
    }
  } catch (e) {
    console.warn('Failed to parse page operator list for text color:', e);
  }
  return ops;
}

export function matchRunColor(runText: string, rawIndex: number, textOps: ShowTextOp[]): string | undefined {
  if (textOps.length === 0) return undefined;
  const byIndex = textOps[rawIndex];
  if (byIndex?.fillColor) return byIndex.fillColor;

  const needle = runText.replace(/\s+/g, '');
  if (!needle) return undefined;
  for (const op of textOps) {
    const hay = (op.originalEncodedString || '').replace(/\s+/g, '');
    if (hay && hay.includes(needle)) return op.fillColor;
  }
  return undefined;
}
