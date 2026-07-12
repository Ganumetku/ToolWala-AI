import { TextLayout } from '../text/TextLayout';
import { TextSelection } from '../text/TextSelection';

/**
 * SelectionRenderer manages selection highlights calculations and draws.
 */
export class SelectionRenderer {
  /**
   * Draws selection highlights on the context.
   */
  static drawSelection(
    ctx: CanvasRenderingContext2D,
    layout: TextLayout,
    start: number,
    end: number,
    color = 'rgba(0, 102, 204, 0.3)'
  ): void {
    if (start === end) return;

    const rects = layout.selectionRectangles;
    ctx.save();
    ctx.fillStyle = color;
    for (const r of rects) {
      ctx.fillRect(r.x, r.y, r.width, r.height);
    }
    ctx.restore();
  }
}
