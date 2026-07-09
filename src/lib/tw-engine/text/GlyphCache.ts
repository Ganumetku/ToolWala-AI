/**
 * GlyphCache stores character advance widths for proportional fonts
 * (Helvetica, Times-Roman) and fixed-width Courier.
 */
export class GlyphCache {
  private static cache: Map<string, Map<string, number>> = new Map();

  // Proportional widths for base characters in Helvetica (per 1000 EM units)
  private static helveticaWidths: Record<string, number> = {
    ' ': 278, '!': 278, '"': 355, '#': 556, '$': 556, '%': 889, '&': 667, '\'': 191,
    '(': 333, ')': 333, '*': 389, '+': 584, ',': 278, '-': 333, '.': 278, '/': 278,
    '0': 556, '1': 556, '2': 556, '3': 556, '4': 556, '5': 556, '6': 556, '7': 556,
    '8': 556, '9': 556, ':': 278, ';': 278, '<': 584, '=': 584, '>': 584, '?': 556,
    '@': 1015, 'A': 667, 'B': 667, 'C': 722, 'D': 722, 'E': 667, 'F': 611, 'G': 778,
    'H': 722, 'I': 278, 'J': 500, 'K': 667, 'L': 556, 'M': 833, 'N': 722, 'O': 778,
    'P': 667, 'Q': 778, 'R': 722, 'S': 667, 'T': 611, 'U': 722, 'V': 667, 'W': 944,
    'X': 667, 'Y': 667, 'Z': 611, '[': 278, '\\': 278, ']': 278, '^': 469, '_': 556,
    '`': 222, 'a': 556, 'b': 556, 'c': 500, 'd': 556, 'e': 556, 'f': 278, 'g': 556,
    'h': 556, 'i': 222, 'j': 222, 'k': 500, 'l': 222, 'm': 833, 'n': 556, 'o': 556,
    'p': 556, 'q': 556, 'r': 333, 's': 500, 't': 278, 'u': 556, 'v': 500, 'w': 722,
    'x': 500, 'y': 500, 'z': 500, '{': 334, '|': 260, '}': 334, '~': 584
  };

  // Proportional widths for base characters in Times-Roman (per 1000 EM units)
  private static timesWidths: Record<string, number> = {
    ' ': 250, '!': 333, '"': 408, '#': 500, '$': 500, '%': 833, '&': 778, '\'': 180,
    '(': 333, ')': 333, '*': 500, '+': 564, ',': 250, '-': 333, '.': 250, '/': 278,
    '0': 500, '1': 500, '2': 500, '3': 500, '4': 500, '5': 500, '6': 500, '7': 500,
    '8': 500, '9': 500, ':': 278, ';': 278, '<': 564, '=': 564, '>': 564, '?': 444,
    '@': 920, 'A': 722, 'B': 667, 'C': 667, 'D': 722, 'E': 611, 'F': 556, 'G': 722,
    'H': 722, 'I': 333, 'J': 389, 'K': 722, 'L': 611, 'M': 889, 'N': 722, 'O': 722,
    'P': 556, 'Q': 722, 'R': 667, 'S': 556, 'T': 611, 'U': 722, 'V': 722, 'W': 944,
    'X': 722, 'Y': 722, 'Z': 611, '[': 333, '\\': 278, ']': 333, '^': 469, '_': 500,
    '`': 333, 'a': 444, 'b': 500, 'c': 444, 'd': 500, 'e': 444, 'f': 333, 'g': 500,
    'h': 500, 'i': 278, 'j': 278, 'k': 500, 'l': 278, 'm': 778, 'n': 500, 'o': 500,
    'p': 500, 'q': 500, 'r': 333, 's': 389, 't': 278, 'u': 500, 'v': 500, 'w': 722,
    'x': 500, 'y': 500, 'z': 444, '{': 480, '|': 200, '}': 480, '~': 541
  };

  /**
   * Resolves the typographic width (design units) for a given character.
   */
  static getGlyphAdvance(fontName: string, char: string): number {
    const key = fontName.toLowerCase();

    // 1. Check custom dynamically-cached widths
    let fontCache = this.cache.get(key);
    if (fontCache && fontCache.has(char)) {
      return fontCache.get(char)!;
    }

    // 2. Resolve base fonts tables
    if (key.includes('courier') || key.includes('mono')) {
      return 600; // Monospaced Courier is always 600 units
    }

    if (key.includes('times') || key.includes('roman')) {
      return this.timesWidths[char] || 500; // default 500
    }

    // Helvetica and fallbacks
    return this.helveticaWidths[char] || 500; // default 500
  }

  /**
   * Registers a dynamically calculated or parsed glyph width override.
   */
  static setGlyphAdvance(fontName: string, char: string, width: number): void {
    const key = fontName.toLowerCase();
    let fontCache = this.cache.get(key);
    if (!fontCache) {
      fontCache = new Map();
      this.cache.set(key, fontCache);
    }
    fontCache.set(char, width);
  }
}
