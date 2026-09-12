import { NOTO_SANS_DEVANAGARI_FAMILY, NOTO_SANS_FAMILY } from './bundledFonts';
import { fabricFontWeight, resolveNumericFontWeight } from './fontWeight';

export type FontFlagsInfo = {
  bold: boolean;
  italic: boolean;
  serif: boolean;
  monospace: boolean;
};

export type ResolvedRunFont = {
  cssFamily: string;
  webFont: string;
  fontWeight: 'normal' | 'bold';
  fontStyle: 'normal' | 'italic';
};

const DEVANAGARI_RE = /[\u0900-\u097F]/;
const NON_LATIN_RE = /[^\u0000-\u024F\u1E00-\u1EFF\s]/u;

export function containsDevanagari(text: string): boolean {
  return DEVANAGARI_RE.test(text || '');
}

export function containsNonLatin(text: string): boolean {
  return NON_LATIN_RE.test(text || '');
}

/**
 * PDF FontDescriptor Flags are 1-based: bit 1 FixedPitch, 2 Serif, 6 Italic, 18 Bold.
 */
export function flagsFromFontObject(fontObj: Record<string, unknown> | null | undefined): FontFlagsInfo {
  const nested = fontObj?.data as Record<string, unknown> | undefined;
  const flagsRaw = fontObj?.flags ?? nested?.flags ?? 0;
  const flags = typeof flagsRaw === 'number' ? flagsRaw : 0;

  const fixedPitch = (flags & (1 << 0)) !== 0;
  const serif = (flags & (1 << 1)) !== 0;
  const italicBit = (flags & (1 << 5)) !== 0;

  const italicAngle = typeof fontObj?.italicAngle === 'number' ? fontObj.italicAngle : 0;
  const name = `${fontObj?.name || ''} ${fontObj?.fallbackName || ''}`.toLowerCase();

  const italic =
    italicBit ||
    italicAngle !== 0 ||
    fontObj?.italic === true ||
    name.includes('italic') ||
    name.includes('oblique');

  const bold = resolveNumericFontWeight({ fontObject: fontObj }) >= 500;

  const monospace =
    fixedPitch ||
    name.includes('courier') ||
    name.includes('mono') ||
    name.includes('consolas');

  return { bold, italic, serif: serif && !monospace, monospace };
}

function nameLooksSerif(name: string): boolean {
  return (
    name.includes('times') ||
    name.includes('georgia') ||
    name.includes('cambria') ||
    name.includes('garamond') ||
    name.includes('minion') ||
    name.includes('palatino') ||
    (name.includes('serif') && !name.includes('sans'))
  );
}

function nameLooksMono(name: string): boolean {
  return name.includes('courier') || name.includes('mono') || name.includes('consolas');
}

export function mapPdfFontToWebFont(
  fontName: string,
  resolvedFontFamily?: string,
  options?: { text?: string; fontObject?: Record<string, unknown> | null }
): string {
  if (options?.text && containsDevanagari(options.text)) {
    return NOTO_SANS_DEVANAGARI_FAMILY;
  }
  if (options?.text && containsNonLatin(options.text)) {
    return NOTO_SANS_FAMILY;
  }

  const flags = flagsFromFontObject(options?.fontObject || null);
  const name = `${fontName || ''} ${resolvedFontFamily || ''}`.toLowerCase();

  if (flags.monospace || nameLooksMono(name)) return 'Courier New';
  if (flags.serif || nameLooksSerif(name)) return 'Times New Roman';
  return 'Arial';
}

export function mapPdfFontToLoadedFont(fontName: string, resolvedFontFamily?: string): string {
  if (!fontName) return '';

  const match = fontName.match(/^g_d(\d+)_f(\d+)$/);
  if (match) {
    const docId = match[1];
    const fontId = parseInt(match[2], 10);
    const loadedFontFamily = `g_d${docId}_sf${fontId + 1}`;

    if (typeof document !== 'undefined' && document.fonts) {
      let isLoaded = false;
      document.fonts.forEach((f) => {
        if (f.family === loadedFontFamily) {
          isLoaded = true;
        }
      });
      if (isLoaded) {
        return loadedFontFamily;
      }
    }

    return loadedFontFamily;
  }

  if (
    resolvedFontFamily &&
    !['sans-serif', 'serif', 'monospace', 'cursive', 'fantasy'].includes(
      resolvedFontFamily.toLowerCase()
    )
  ) {
    return resolvedFontFamily;
  }

  return '';
}

export function resolveRunFontStyle(opts: {
  pdfFontName: string;
  resolvedFontFamily?: string;
  text: string;
  fontObject?: Record<string, unknown> | null;
  renderMode?: number;
}): ResolvedRunFont {
  const flags = flagsFromFontObject(opts.fontObject || null);
  const numeric = resolveNumericFontWeight({
    fontName: opts.pdfFontName,
    resolvedFontFamily: opts.resolvedFontFamily,
    fontObject: opts.fontObject,
    renderMode: opts.renderMode,
  });
  const name = `${opts.pdfFontName || ''} ${opts.resolvedFontFamily || ''} ${opts.fontObject?.name || ''}`.toLowerCase();
  const nameItalic = name.includes('italic') || name.includes('oblique');

  const webFont = mapPdfFontToWebFont(opts.pdfFontName, opts.resolvedFontFamily, {
    text: opts.text,
    fontObject: opts.fontObject,
  });
  const loaded = mapPdfFontToLoadedFont(opts.pdfFontName, opts.resolvedFontFamily);

  const generic =
    webFont === 'Courier New' ? 'monospace' : webFont === 'Times New Roman' ? 'serif' : 'sans-serif';

  const preferDevanagari = containsDevanagari(opts.text);
  const heavy = numeric >= 500;
  const stack = (
    preferDevanagari
      ? [NOTO_SANS_DEVANAGARI_FAMILY, NOTO_SANS_FAMILY, loaded, webFont, generic]
      : heavy
        ? [webFont, NOTO_SANS_FAMILY, loaded, NOTO_SANS_DEVANAGARI_FAMILY, generic]
        : [loaded, webFont, NOTO_SANS_DEVANAGARI_FAMILY, NOTO_SANS_FAMILY, generic]
  )
    .filter(Boolean)
    .filter((v, i, arr) => arr.indexOf(v) === i)
    .map((family) => (family === generic ? family : `"${family}"`));

  return {
    cssFamily: stack.join(', '),
    webFont,
    fontWeight: fabricFontWeight(numeric),
    fontStyle: flags.italic || nameItalic ? 'italic' : 'normal',
  };
}
