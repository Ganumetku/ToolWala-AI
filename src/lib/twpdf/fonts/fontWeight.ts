/**
 * Map PDF font names, descriptor flags, and CSS/Fabric weight strings
 * onto a numeric 100–900 weight and a Regular vs Bold embed file.
 */

export type FontWeightSignals = {
  fontName?: string;
  resolvedFontFamily?: string;
  fontObject?: Record<string, unknown> | null;
  renderMode?: number;
};

const LIGHT_RE = /\b(thin|hairline|ultralight|ultra-light|extralight|extra-light|light)\b/;
const REGULAR_RE = /\b(regular|book|roman|normal|text)\b/;
const MEDIUM_RE = /\b(medium)\b/;
const SEMIBOLD_RE = /\b(semibold|semi-bold|demibold|demi-bold|demi)\b/;
const BOLD_RE = /\b(bold|extrabold|extra-bold|ultrabold|ultra-bold)\b/;
const BLACK_RE = /\b(black|heavy|fat)\b/;

function blobFromSignals(signals: FontWeightSignals): string {
  const obj = signals.fontObject || {};
  const nested = (obj.data as Record<string, unknown> | undefined) || {};
  return [
    signals.fontName,
    signals.resolvedFontFamily,
    obj.name,
    obj.fallbackName,
    nested.name,
    nested.baseFont,
    nested.fontName,
  ]
    .filter((v) => typeof v === 'string' && v)
    .join(' ')
    .toLowerCase()
    .replace(/[_-]+/g, ' ');
}

function numericFromFontObject(fontObj: Record<string, unknown> | null | undefined): number | null {
  if (!fontObj) return null;
  const nested = (fontObj.data as Record<string, unknown> | undefined) || {};
  const candidates = [fontObj.fontWeight, fontObj.weight, nested.fontWeight, nested.weight, nested.fw];
  for (const c of candidates) {
    if (typeof c === 'number' && c >= 100 && c <= 1000) return Math.round(c);
    if (typeof c === 'string' && /^\d{3}$/.test(c)) return parseInt(c, 10);
  }
  return null;
}

function numericFromName(blob: string): number | null {
  const token = blob.match(/w-?(1\d{2}|[1-9]00)/);
  if (token) return parseInt(token[1], 10);
  if (BLACK_RE.test(blob) && !blob.includes('blackletter')) return 900;
  if (SEMIBOLD_RE.test(blob)) return 600;
  if (BOLD_RE.test(blob) || blob.includes('bold')) return 700;
  if (MEDIUM_RE.test(blob)) return 500;
  if (LIGHT_RE.test(blob)) return 300;
  if (REGULAR_RE.test(blob)) return 400;
  return null;
}

/**
 * CSS/Fabric weight → 100–900. Unknown values fall back to 400.
 */
export function numericFontWeight(weight: string | number | undefined | null): number {
  if (typeof weight === 'number' && Number.isFinite(weight)) {
    return Math.max(100, Math.min(900, Math.round(weight)));
  }
  const raw = String(weight || '').trim().toLowerCase();
  if (!raw || raw === 'normal' || raw === 'regular') return 400;
  if (raw === 'bold' || raw === 'bolder') return 700;
  if (raw === 'lighter') return 300;
  if (raw === 'medium') return 500;
  if (raw === 'semibold' || raw === 'semi-bold' || raw === 'demibold') return 600;
  if (raw === 'black' || raw === 'heavy') return 900;
  if (/^\d{2,3}$/.test(raw)) return Math.max(100, Math.min(900, parseInt(raw, 10)));
  return 400;
}

/** Medium and above use a heavier face (Bold file if Medium is missing). */
export function isHeavyFontWeight(weight: string | number | undefined | null): boolean {
  return numericFontWeight(weight) >= 500;
}

export function fabricFontWeight(weight: string | number | undefined | null): 'normal' | 'bold' {
  return isHeavyFontWeight(weight) ? 'bold' : 'normal';
}

export function cssFontWeight(weight: string | number | undefined | null): string {
  return String(numericFontWeight(weight));
}

export function resolveNumericFontWeight(signals: FontWeightSignals): number {
  const fromObj = numericFromFontObject(signals.fontObject);
  if (fromObj != null) return fromObj;

  const blob = blobFromSignals(signals);
  const fromName = numericFromName(blob);
  if (fromName != null) return fromName;

  const fontObj = signals.fontObject;
  if (fontObj) {
    if (fontObj.black === true) return 900;
    if (fontObj.bold === true) return 700;
    const flagsRaw = fontObj.flags ?? (fontObj.data as Record<string, unknown> | undefined)?.flags ?? 0;
    const flags = typeof flagsRaw === 'number' ? flagsRaw : 0;
    if (flags & (1 << 17)) return 700;
  }

  // Fill + stroke (Tr 2) or stroke-only (Tr 1) thickens a Regular face.
  if (signals.renderMode === 1 || signals.renderMode === 2) return 700;

  return 400;
}

export function closestBundledWeight(weight: number, available: number[]): number {
  if (available.length === 0) return 400;
  const sorted = [...available].sort((a, b) => a - b);
  if (isHeavyFontWeight(weight)) {
    const heavy = sorted.filter((n) => n >= 500);
    const pool = heavy.length ? heavy : [sorted[sorted.length - 1]];
    return pool.reduce((best, n) => (Math.abs(n - weight) < Math.abs(best - weight) ? n : best));
  }
  const light = sorted.filter((n) => n < 500);
  const pool = light.length ? light : [sorted[0]];
  return pool.reduce((best, n) => (Math.abs(n - weight) < Math.abs(best - weight) ? n : best));
}
