interface FontMetricsEntry {
  widths: any;
  firstChar: number;
  missingWidth: number;
  fontMatrix: number[] | null;
  unicodeToWidth: Map<number, number>;
}

/**
 * GlyphAdvanceEngine caches and maps proportional glyph advances, left/right bearings
 * derived directly from PDF font dictionaries (W / Widths arrays).
 */
export class GlyphAdvanceEngine {
  private static glyphWidths: Map<string, Map<string, number>> = new Map();
  private static registeredFonts: Map<string, FontMetricsEntry> = new Map();

  /**
   * Registers a PDF font with its dictionary metrics.
   */
  static registerFont(
    fontName: string,
    widths: any,
    firstChar: number,
    missingWidth: number,
    fontMatrix: number[] | null,
    toUnicode: any = null
  ): void {
    const key = fontName.toLowerCase();
    
    // Reverse toUnicode mappings to map unicode character codes directly to design widths
    const unicodeToWidth = new Map<number, number>();
    
    if (toUnicode && toUnicode.mappings) {
      for (const [charCodeStr, unicodeStr] of Object.entries(toUnicode.mappings)) {
        const charCode = parseInt(charCodeStr, 10);
        if (typeof unicodeStr === 'string' && unicodeStr.length > 0) {
          const unicodeCharCode = unicodeStr.charCodeAt(0);
          
          let w: number | undefined;
          if (widths) {
            if (Array.isArray(widths)) {
              const idx = charCode - firstChar;
              if (idx >= 0 && idx < widths.length) {
                w = widths[idx];
              }
            } else if (widths[charCode] !== undefined) {
              w = widths[charCode];
            }
          }
          if (w !== undefined) {
            unicodeToWidth.set(unicodeCharCode, w);
          }
        }
      }
    }

    this.registeredFonts.set(key, {
      widths,
      firstChar,
      missingWidth: missingWidth || 0,
      fontMatrix,
      unicodeToWidth,
    });
  }

  /**
   * Checks if a font is registered in the engine.
   */
  static hasFont(fontName: string): boolean {
    if (!fontName) return false;
    return this.registeredFonts.has(fontName.toLowerCase());
  }

  /**
   * Resolves the advance width (in design units scaled by fontSize) for a character.
   */
  static getAdvance(
    fontName: string,
    char: string | number,
    fontSize: number,
    fallbackWidth = 500
  ): number {
    const key = fontName.toLowerCase();
    const entry = this.registeredFonts.get(key);
    
    if (!entry) {
      // Fall back to standard scaling
      const baseAdv = this.getGlyphAdvance(fontName, typeof char === 'string' ? char : String.fromCharCode(char), fallbackWidth);
      return baseAdv * (fontSize / 1000);
    }

    const charCode = typeof char === 'string' ? char.charCodeAt(0) : char;

    let designWidth: number | undefined;

    // 1. Try reversed unicodeToWidth mapping first
    if (entry.unicodeToWidth.has(charCode)) {
      designWidth = entry.unicodeToWidth.get(charCode);
    }

    // 2. Try direct character code mapping
    if (designWidth === undefined && entry.widths) {
      if (Array.isArray(entry.widths)) {
        const idx = charCode - entry.firstChar;
        if (idx >= 0 && idx < entry.widths.length) {
          designWidth = entry.widths[idx];
        }
      } else if (entry.widths[charCode] !== undefined) {
        designWidth = entry.widths[charCode];
      }
    }

    // 3. Fall back to missingWidth
    if (designWidth === undefined || designWidth === null) {
      designWidth = entry.missingWidth || fallbackWidth;
    }

    const matrixScale = entry.fontMatrix && entry.fontMatrix[0] ? entry.fontMatrix[0] : 0.001;
    return designWidth * matrixScale * fontSize;
  }

  /**
   * Legacy method for registering simple character width maps.
   */
  static registerFontWidths(fontFamily: string, widthsMap: Record<string, number>): void {
    let entry = this.glyphWidths.get(fontFamily);
    if (!entry) {
      entry = new Map();
      this.glyphWidths.set(fontFamily, entry);
    }
    for (const [char, width] of Object.entries(widthsMap)) {
      entry.set(char, width);
    }
  }

  /**
   * Legacy method for fetching character advances.
   */
  static getGlyphAdvance(fontFamily: string, char: string, fallbackWidth = 500): number {
    const entry = this.glyphWidths.get(fontFamily);
    if (entry && entry.has(char)) {
      return entry.get(char)!;
    }
    return fallbackWidth;
  }
}
