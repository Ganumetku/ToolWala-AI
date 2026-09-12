import type { PDFDocument, PDFFont } from 'pdf-lib';
import { StandardFonts } from 'pdf-lib';
import { containsDevanagari, containsNonLatin } from '@/lib/twpdf/fonts/fontMapping';
import { closestBundledWeight, isHeavyFontWeight, numericFontWeight } from '@/lib/twpdf/fonts/fontWeight';
import { BUNDLED_EDITOR_FONTS, NOTO_SANS_DEVANAGARI_FAMILY, NOTO_SANS_FAMILY } from '@/lib/twpdf/fonts/bundledFonts';

const fontFileCache = new Map<string, ArrayBuffer>();

export async function loadBundledFontBytes(url: string): Promise<ArrayBuffer> {
  const cached = fontFileCache.get(url);
  if (cached) return cached;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to load bundled font ${url}`);
  }
  const buf = await res.arrayBuffer();
  fontFileCache.set(url, buf);
  return buf;
}

function pickNotoUrl(family: 'sans' | 'devanagari', weight: string | number | undefined, italic: boolean): string {
  const matchFamily = family === 'devanagari' ? NOTO_SANS_DEVANAGARI_FAMILY : NOTO_SANS_FAMILY;
  const available = [
    ...new Set(
      BUNDLED_EDITOR_FONTS.filter((f) => f.family === matchFamily).map((f) => parseInt(f.weight, 10))
    ),
  ];
  const wantedWeight = String(closestBundledWeight(numericFontWeight(weight), available));
  const wantedStyle = family === 'sans' && italic && !isHeavyFontWeight(weight) ? 'italic' : 'normal';
  const found = BUNDLED_EDITOR_FONTS.find(
    (f) => f.family === matchFamily && f.weight === wantedWeight && f.style === wantedStyle
  );
  if (found) return found.url;
  const fallback = BUNDLED_EDITOR_FONTS.find((f) => f.family === matchFamily && f.weight === wantedWeight);
  return fallback?.url || BUNDLED_EDITOR_FONTS[0].url;
}

export type EmbeddableTextStyle = {
  fontFamily?: string;
  fontWeight?: string;
  fontStyle?: string;
  text?: string;
};

export async function embedFontForText(
  doc: PDFDocument,
  style: EmbeddableTextStyle,
  cache: Map<string, PDFFont>
): Promise<PDFFont> {
  const text = style.text || '';
  const family = (style.fontFamily || '').toLowerCase();
  const bold = isHeavyFontWeight(style.fontWeight);
  const italic = style.fontStyle === 'italic';
  const needsNoto =
    containsDevanagari(text) ||
    containsNonLatin(text) ||
    family.includes('noto');

  if (needsNoto) {
    const kind: 'sans' | 'devanagari' = containsDevanagari(text) ? 'devanagari' : 'sans';
    const url = pickNotoUrl(kind, style.fontWeight, italic);
    const cacheKey = `noto:${url}`;
    const hit = cache.get(cacheKey);
    if (hit) return hit;
    const bytes = await loadBundledFontBytes(url);
    const font = await doc.embedFont(new Uint8Array(bytes), { subset: true });
    cache.set(cacheKey, font);
    return font;
  }

  let standard = StandardFonts.Helvetica;
  if (family.includes('times') || family.includes('georgia') || (family.includes('serif') && !family.includes('sans'))) {
    if (bold && italic) standard = StandardFonts.TimesRomanBoldItalic;
    else if (bold) standard = StandardFonts.TimesRomanBold;
    else if (italic) standard = StandardFonts.TimesRomanItalic;
    else standard = StandardFonts.TimesRoman;
  } else if (family.includes('courier') || family.includes('mono')) {
    if (bold && italic) standard = StandardFonts.CourierBoldOblique;
    else if (bold) standard = StandardFonts.CourierBold;
    else if (italic) standard = StandardFonts.CourierOblique;
    else standard = StandardFonts.Courier;
  } else if (bold && italic) standard = StandardFonts.HelveticaBoldOblique;
  else if (bold) standard = StandardFonts.HelveticaBold;
  else if (italic) standard = StandardFonts.HelveticaOblique;

  const cacheKey = `std:${standard}`;
  const hit = cache.get(cacheKey);
  if (hit) return hit;
  const font = await doc.embedFont(standard);
  cache.set(cacheKey, font);
  return font;
}
