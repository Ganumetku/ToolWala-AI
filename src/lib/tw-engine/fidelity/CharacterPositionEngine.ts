import { GlyphAdvanceEngine } from './GlyphAdvanceEngine';
import { TextStateParams } from './TextMatrixCompiler';
import { FontMetricsRegistry } from '../text/FontMetrics';

export interface PositionedGlyph {
  char: string;
  x: number;
  y: number;
  width: number;
  height: number;
  advance: number;
}

/**
 * CharacterPositionEngine typesets character glyphs individually using explicit PDF widths.
 */
export class CharacterPositionEngine {
  /**
   * Compiles positioned glyphs for a text run using tracking and spacing rules.
   */
  static typesetText(
    text: string,
    fontFamily: string,
    fontSize: number,
    params: TextStateParams
  ): PositionedGlyph[] {
    const glyphs: PositionedGlyph[] = [];
    const metrics = FontMetricsRegistry.getMetrics(fontFamily);
    const scale = fontSize / metrics.unitsPerEm;

    let currentX = 0;
    const risePx = params.rise * scale;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const pdfAdv = GlyphAdvanceEngine.getGlyphAdvance(fontFamily, char, metrics.averageWidth);
      const advPx = pdfAdv * scale;

      // Tc: Character spacing
      const charSpacingPx = params.charSpacing * scale;

      // Tw: Word spacing (only for space characters)
      let wordSpacingPx = 0;
      if (char === ' ' || char === '\u00A0') {
        wordSpacingPx = params.wordSpacing * scale;
      }

      // Track bounding box coordinates
      const height = (metrics.ascent - metrics.descent) * scale;
      const width = advPx;
      const y = -metrics.ascent * scale - risePx;

      glyphs.push({
        char,
        x: currentX,
        y,
        width,
        height,
        advance: advPx + charSpacingPx + wordSpacingPx,
      });

      // Advance layout cursor
      currentX += advPx + charSpacingPx + wordSpacingPx;
    }

    return glyphs;
  }
}
