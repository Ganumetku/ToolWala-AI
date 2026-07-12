import { TextLayout } from '../text/TextLayout';

/**
 * CaretRenderer manages typesetting caret rendering metrics and overlays.
 */
export class CaretRenderer {
  /**
   * Computes caret coordinate relative to text block layout coordinates.
   */
  static getCaretCoords(layout: TextLayout, caretIndex: number): { x: number; y: number; height: number } {
    return layout.caretPosition;
  }

  static lastInteractionTime = 0;

  static recordInteraction(): void {
    CaretRenderer.lastInteractionTime = Date.now();
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
    const timeSinceInteraction = Date.now() - CaretRenderer.lastInteractionTime;
    const forceVisible = timeSinceInteraction < 500;
    
    if (forceVisible || Math.floor(Date.now() / 500) % 2 === 0) {
      const coords = layout.caretPosition;
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
