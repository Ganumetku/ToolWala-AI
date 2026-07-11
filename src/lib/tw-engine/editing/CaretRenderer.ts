import { TextLayout } from '../text/TextLayout';

/**
 * CaretRenderer manages typesetting caret rendering metrics and overlays.
 */
export class CaretRenderer {
  /**
   * Computes caret coordinate relative to text block layout coordinates.
   */
  static getCaretCoords(layout: TextLayout, caretIndex: number): { x: number; y: number; height: number } {
    let cumulative = 0;
    for (const line of layout.lines) {
      const lineEndIdx = cumulative + line.text.length;
      
      // Check if caret index lies inside this line
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
      // Add 1 for carriage return character
      if (layout.text[cumulative] === '\n') {
        cumulative += 1;
      }
    }

    // Default fallback to end of last line
    if (layout.lines.length > 0) {
      const lastLine = layout.lines[layout.lines.length - 1];
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

    return { x: 0, y: 0, height: 12 };
  }

  /**
   * Draws a blinking vertical caret line onto a canvas context.
   */
  static drawCaret(
    ctx: CanvasRenderingContext2D,
    layout: TextLayout,
    caretIndex: number,
    color: string
  ): void {
    if (Math.floor(Date.now() / 500) % 2 === 0) {
      const coords = this.getCaretCoords(layout, caretIndex);
      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(coords.x, coords.y);
      ctx.lineTo(coords.x, coords.y + coords.height);
      ctx.stroke();
      ctx.restore();
    }
  }
}
