import { FontResolver } from './FontResolver';
import { GlyphLayout } from '../typography/GlyphLayout';
import { TextSelection, SelectionRect } from './TextSelection';
import { TypographyEngine } from '../typography/TypographyEngine';

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
  fontWeight = 'normal';
  fontStyle = 'normal';
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
    caretIndex?: number,
    fontWeight = 'normal',
    fontStyle = 'normal'
  ) {
    this.text = text;
    this.fontName = FontResolver.resolveFontFamily(fontName);
    this.fontSize = fontSize;
    this.maxWidth = maxWidth;
    this.autoWrap = autoWrap;
    this.letterSpacing = letterSpacing;
    this.ascent = ascent;
    this.descent = descent;
    this.fontWeight = fontWeight;
    this.fontStyle = fontStyle;

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

  layout(): void {
    const layout = TypographyEngine.layout(
      this.text,
      this.fontName,
      this.fontSize,
      this.fontWeight,
      this.fontStyle,
      this.maxWidth,
      this.autoWrap,
      this.letterSpacing,
      this.lineHeightMultiplier,
      this.ascent,
      this.descent
    );

    this.lines = layout.lines;
    this.width = layout.width;
    this.height = layout.height;
  }
}
