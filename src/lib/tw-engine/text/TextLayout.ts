import { FontMetricsRegistry } from './FontMetrics';
import { GlyphCache } from './GlyphCache';
import { FontResolver } from './FontResolver';
import { Kerning } from './Kerning';
import { LineBreaker } from './LineBreaker';
import { GlyphLayout } from './GlyphLayout';
import { TextSelection, SelectionRect } from './TextSelection';

export interface LineRun {
  text: string;
  x: number;
  y: number; // Baseline Y position in local space
  width: number;
  height: number;
  ascent: number;
  descent: number;
  glyphs: GlyphLayout[];
}

/**
 * TextLayout compiles raw text strings into typeset lines,
 * word runs, and individual character positions in screen pixels.
 */
export class TextLayout {
  text = '';
  fontName = 'Helvetica';
  fontSize = 12;
  maxWidth = 0;
  autoWrap = false;
  letterSpacing = 0;
  lineHeightMultiplier = 1.2;
  lines: LineRun[] = [];
  width = 0;
  height = 0;
  ascent?: number;
  descent?: number;
  selectionRectangles: SelectionRect[] = [];
  caretPosition: { x: number; y: number; height: number } = { x: 0, y: 0, height: 12 };

  constructor(
    text: string,
    fontName: string,
    fontSize: number,
    maxWidth = 0,
    autoWrap = false,
    letterSpacing = 0,
    ascent?: number,
    descent?: number,
    selectionStart?: number,
    selectionEnd?: number,
    caretIndex?: number
  ) {
    this.text = text;
    this.fontName = FontResolver.resolveFontFamily(fontName);
    this.fontSize = fontSize;
    this.maxWidth = maxWidth;
    this.autoWrap = autoWrap;
    this.letterSpacing = letterSpacing;
    this.ascent = ascent;
    this.descent = descent;

    this.layout();

    this.selectionRectangles = TextSelection.getSelectionRects(this, selectionStart ?? 0, selectionEnd ?? 0);
    this.caretPosition = this.calculateCaretPosition(caretIndex ?? 0);
  }

  private calculateCaretPosition(caretIndex: number): { x: number; y: number; height: number } {
    let cumulative = 0;
    for (const line of this.lines) {
      const lineEndIdx = cumulative + line.text.length;
      
      if (caretIndex >= cumulative && caretIndex <= lineEndIdx) {
        const localIdx = caretIndex - cumulative;
        let cx = line.x;
        let cy = line.y - line.ascent;
        
        if (localIdx > 0 && line.glyphs.length > 0) {
          const glyphIdx = Math.min(localIdx - 1, line.glyphs.length - 1);
          const glyph = line.glyphs[glyphIdx];
          cx = line.x + glyph.x + glyph.advanceX;
        }
        
        return {
          x: cx,
          y: cy,
          height: line.ascent + line.descent,
        };
      }
      
      cumulative = lineEndIdx;
      if (this.text[cumulative] === '\n') {
        cumulative += 1;
      }
    }

    if (this.lines.length > 0) {
      const lastLine = this.lines[this.lines.length - 1];
      let cx = lastLine.x;
      if (lastLine.glyphs.length > 0) {
        const lastGlyph = lastLine.glyphs[lastLine.glyphs.length - 1];
        cx = lastLine.x + lastGlyph.x + lastGlyph.advanceX;
      }
      return {
        x: cx,
        y: lastLine.y - lastLine.ascent,
        height: lastLine.ascent + lastLine.descent,
      };
    }

    return { x: 0, y: 0, height: this.fontSize };
  }

  /**
   * Processes word wrapping, scales typographic margins, and calculates screen layouts.
   */
  layout(): void {
    // 1. Wrap string into lines array
    const rawLines = LineBreaker.splitLines(
      this.text,
      this.fontName,
      this.fontSize,
      this.maxWidth,
      this.autoWrap,
      this.letterSpacing
    );

    // 2. Resolve metrics scale factor
    const metrics = FontMetricsRegistry.getMetrics(this.fontName);
    const scale = this.fontSize / metrics.unitsPerEm;

    const ascentPx = (this.ascent !== undefined) ? (Math.abs(this.ascent) * this.fontSize) : (metrics.ascent * scale);
    const descentPx = (this.descent !== undefined) ? (Math.abs(this.descent) * this.fontSize) : Math.abs(metrics.descent * scale);
    const lineGapPx = metrics.lineGap * scale;
    const lineHeightPx = (ascentPx + descentPx + lineGapPx) * this.lineHeightMultiplier;

    this.lines = [];
    let currentY = ascentPx; // First line baseline offset
    let maxLineWidth = 0;

    for (const lineText of rawLines) {
      const glyphs: GlyphLayout[] = [];
      let currentX = 0;

      for (let i = 0; i < lineText.length; i++) {
        const char = lineText[i];
        const resolvedFont = FontResolver.resolveFallback(char, this.fontName);
        const advDU = GlyphCache.getGlyphAdvance(resolvedFont, char);
        const advPx = advDU * scale;

        // Apply spacing and kerning adjustments
        let spacingPx = 0;
        if (i < lineText.length - 1) {
          const nextChar = lineText[i + 1];
          const spacingDU = Kerning.getSpacingOffset(resolvedFont, char, nextChar, this.letterSpacing);
          spacingPx = spacingDU * scale;
        }

        // Create individual character GlyphLayout relative to line baseline origin
        const gY = -ascentPx;
        const gH = ascentPx + descentPx;
        const glyph = new GlyphLayout(
          char,
          currentX,
          gY,
          advPx,
          gH,
          ascentPx,
          descentPx,
          advPx + spacingPx
        );
        glyphs.push(glyph);

        currentX += advPx + spacingPx;
      }

      this.lines.push({
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

    this.width = maxLineWidth;
    this.height = currentY - lineHeightPx + descentPx;
  }
}
