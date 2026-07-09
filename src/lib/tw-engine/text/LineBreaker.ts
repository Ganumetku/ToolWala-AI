import { GlyphCache } from './GlyphCache';
import { FontMetricsRegistry } from './FontMetrics';
import { Kerning } from './Kerning';

/**
 * LineBreaker splits text blocks into wrapped lines based on width constraints.
 */
export class LineBreaker {
  /**
   * Splits a text string into an array of lines based on constraints.
   */
  static splitLines(
    text: string,
    fontName: string,
    fontSize: number,
    maxWidth: number,
    autoWrap = true,
    letterSpacing = 0
  ): string[] {
    if (!text) return [''];

    // 1. Split first by hard carriage line-breaks
    const paragraphs = text.split('\n');
    if (!autoWrap || maxWidth <= 0) {
      return paragraphs;
    }

    const lines: string[] = [];
    const metrics = FontMetricsRegistry.getMetrics(fontName);
    const scale = fontSize / metrics.unitsPerEm;

    for (const paragraph of paragraphs) {
      if (paragraph.trim() === '') {
        lines.push('');
        continue;
      }

      // Split paragraph into words
      const words = paragraph.split(/(\s+)/); // Capture whitespaces to preserve them
      let currentLine = '';
      let currentLineWidth = 0;

      for (const word of words) {
        if (word === '') continue;

        // Calculate width of the word in screen coordinates (pixels)
        const wordWidth = this.measureStringWidth(
          word,
          fontName,
          fontSize,
          scale,
          letterSpacing
        );

        // Check if adding this word triggers wrapping limits
        if (currentLine !== '' && currentLineWidth + wordWidth > maxWidth) {
          lines.push(currentLine);
          // If the wrapped word starts with whitespace, strip it
          currentLine = word.startsWith(' ') && word.trim() === '' ? '' : word;
          currentLineWidth = wordWidth;
        } else {
          currentLine += word;
          currentLineWidth += wordWidth;
        }
      }

      if (currentLine !== '') {
        lines.push(currentLine);
      }
    }

    return lines;
  }

  /**
   * Measures the pixel width of a target text string using GlyphCache and Kerning.
   */
  private static measureStringWidth(
    str: string,
    fontName: string,
    fontSize: number,
    scale: number,
    letterSpacing: number
  ): number {
    let widthDU = 0;
    
    for (let i = 0; i < str.length; i++) {
      const char = str[i];
      // Get design units advance
      const adv = GlyphCache.getGlyphAdvance(fontName, char);
      widthDU += adv;

      // Add kerning pair space if there is a next character
      if (i < str.length - 1) {
        const nextChar = str[i + 1];
        widthDU += Kerning.getSpacingOffset(fontName, char, nextChar, letterSpacing);
      }
    }

    return widthDU * scale;
  }
}
