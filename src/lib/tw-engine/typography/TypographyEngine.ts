import { FontMetrics } from './FontMetrics';
import { GlyphMetrics } from './GlyphMetrics';
import { KerningEngine } from './KerningEngine';
import { LineComposer } from './LineComposer';
import { GlyphLayout } from './GlyphLayout';

export interface ComputedTextLayout {
  lines: Array<{
    text: string;
    x: number;
    y: number;
    width: number;
    height: number;
    ascent: number;
    descent: number;
    glyphs: GlyphLayout[];
  }>;
  width: number;
  height: number;
}

/**
 * TypographyEngine orchestrates the layout pipelines.
 */
export class TypographyEngine {
  static layout(
    text: string,
    fontFamily: string,
    fontSize: number,
    fontWeight: string,
    fontStyle: string,
    maxWidth: number,
    autoWrap: boolean,
    letterSpacing: number,
    lineHeightMultiplier: number,
    originalAscent?: number,
    originalDescent?: number
  ): ComputedTextLayout {
    const lowerFont = fontFamily.toLowerCase();
    const isStandard =
      lowerFont.includes('helvetica') ||
      lowerFont.includes('times') ||
      lowerFont.includes('roman') ||
      lowerFont.includes('courier');

    const rawLines = LineComposer.composeLines(
      text,
      fontFamily,
      fontSize,
      fontWeight,
      fontStyle,
      isStandard,
      maxWidth,
      autoWrap,
      letterSpacing
    );

    const stats = FontMetrics.getMetrics(fontFamily, fontSize, fontWeight, fontStyle, isStandard);

    const ascentPx = (originalAscent !== undefined) ? (Math.abs(originalAscent) * fontSize) : stats.ascent;
    const descentPx = (originalDescent !== undefined) ? (Math.abs(originalDescent) * fontSize) : stats.descent;
    const lineHeightPx = (ascentPx + descentPx + stats.lineGap) * lineHeightMultiplier;

    const lines: ComputedTextLayout['lines'] = [];
    let currentY = ascentPx;
    let maxLineWidth = 0;

    for (const lineText of rawLines) {
      const glyphs: GlyphLayout[] = [];
      let currentX = 0;

      for (let i = 0; i < lineText.length; i++) {
        const char = lineText[i];
        const advPx = GlyphMetrics.getGlyphWidth(char, fontFamily, fontSize, fontWeight, fontStyle, isStandard);
        const kernPx = (i < lineText.length - 1)
          ? KerningEngine.getKerning(char, lineText[i + 1], fontFamily, fontSize, isStandard)
          : 0;

        const glyph = new GlyphLayout(
          char,
          currentX,
          -ascentPx,
          advPx,
          ascentPx + descentPx,
          ascentPx,
          descentPx,
          advPx + kernPx + letterSpacing
        );
        glyphs.push(glyph);

        currentX += advPx + kernPx + letterSpacing;
      }

      lines.push({
        text: lineText,
        x: 0,
        y: currentY,
        width: currentX,
        height: ascentPx + descentPx,
        ascent: ascentPx,
        descent: descentPx,
        glyphs,
      });

      if (currentX > maxLineWidth) {
        maxLineWidth = currentX;
      }

      currentY += lineHeightPx;
    }

    return {
      lines,
      width: maxLineWidth,
      height: currentY - lineHeightPx + descentPx,
    };
  }
}
