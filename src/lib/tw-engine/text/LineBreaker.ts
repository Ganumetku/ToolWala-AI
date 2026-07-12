import { GlyphCache } from './GlyphCache';
import { FontMetricsRegistry } from './FontMetrics';
import { Kerning } from './Kerning';
import { FontMetricsCache } from './FontMetricsCache';

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
    letterSpacing = 0,
    fontWeight = 'normal',
    fontStyle = 'normal'
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
          letterSpacing,
          fontWeight,
          fontStyle
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
   * Measures the pixel width of a target text string using GlyphCache or FontMetricsCache.
   */
  private static measureStringWidth(
    str: string,
    fontName: string,
    fontSize: number,
    scale: number,
    letterSpacing: number,
    fontWeight: string,
    fontStyle: string
  ): number {
    const lowerFont = fontName.toLowerCase();
    const isStandard = lowerFont.includes('helvetica') || lowerFont.includes('times') || lowerFont.includes('roman') || lowerFont.includes('courier');

    if (!isStandard) {
      let width = 0;
      for (let i = 0; i < str.length; i++) {
        const metrics = FontMetricsCache.getMetrics(fontName, fontSize, fontWeight, fontStyle, str[i]);
        width += metrics.advanceX + letterSpacing;
      }
      return width;
    }

    let widthDU = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str[i];
      const resolvedFont = fontName;
      const adv = GlyphCache.getGlyphAdvance(resolvedFont, char);
      widthDU += adv;

      if (i < str.length - 1) {
        const nextChar = str[i + 1];
        widthDU += Kerning.getSpacingOffset(resolvedFont, char, nextChar, letterSpacing);
      }
    }

    return (widthDU * scale) + (str.length * letterSpacing);
  }
}
