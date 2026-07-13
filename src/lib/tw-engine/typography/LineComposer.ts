import { GlyphMetrics } from './GlyphMetrics';
import { KerningEngine } from './KerningEngine';

/**
 * LineComposer handles paragraph line wraps using layout advances.
 */
export class LineComposer {
  static composeLines(
    text: string,
    fontFamily: string,
    fontSize: number,
    fontWeight: string,
    fontStyle: string,
    isStandard: boolean,
    maxWidth: number,
    autoWrap: boolean,
    letterSpacing: number
  ): string[] {
    if (!autoWrap || maxWidth <= 0) {
      return text.split('\n');
    }

    const paragraphs = text.split('\n');
    const lines: string[] = [];

    for (const paragraph of paragraphs) {
      if (paragraph.length === 0) {
        lines.push('');
        continue;
      }

      const words = paragraph.split(' ');
      let currentLine = words[0] || '';

      for (let i = 1; i < words.length; i++) {
        const word = words[i];
        const candidate = currentLine + ' ' + word;
        const width = this.measureStringWidth(
          candidate,
          fontFamily,
          fontSize,
          fontWeight,
          fontStyle,
          isStandard,
          letterSpacing
        );
        if (width <= maxWidth) {
          currentLine = candidate;
        } else {
          lines.push(currentLine);
          currentLine = word;
        }
      }
      lines.push(currentLine);
    }

    return lines;
  }

  private static measureStringWidth(
    str: string,
    fontFamily: string,
    fontSize: number,
    fontWeight: string,
    fontStyle: string,
    isStandard: boolean,
    letterSpacing: number
  ): number {
    let width = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str[i];
      const adv = GlyphMetrics.getGlyphWidth(char, fontFamily, fontSize, fontWeight, fontStyle, isStandard);
      let kern = 0;
      if (i < str.length - 1) {
        kern = KerningEngine.getKerning(char, str[i + 1], fontFamily, fontSize, isStandard);
      }
      width += adv + kern + letterSpacing;
    }
    return width;
  }
}
