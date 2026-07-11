/**
 * GlyphAdvanceEngine caches and maps proportional glyph advances, left/right bearings
 * derived directly from PDF font dictionaries (W / Widths arrays).
 */
export class GlyphAdvanceEngine {
  private static glyphWidths: Map<string, Map<string, number>> = new Map();

  /**
   * Registers glyph width arrays from a parsed PDF Font Dictionary.
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
   * Resolves advance width for a character. Returns fallback default from FontMetrics if undefined.
   */
  static getGlyphAdvance(fontFamily: string, char: string, fallbackWidth = 500): number {
    const entry = this.glyphWidths.get(fontFamily);
    if (entry && entry.has(char)) {
      return entry.get(char)!;
    }
    return fallbackWidth;
  }
}
