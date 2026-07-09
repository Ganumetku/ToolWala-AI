import type { TextLayout } from './TextLayout';

export interface SelectionRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * TextSelection compiles highlight rectangles for active selections ranges,
 * checking line index intersections.
 */
export class TextSelection {
  /**
   * Generates a list of bounding boxes representing highlighted ranges inside a text layout block.
   */
  static getSelectionRects(
    layout: TextLayout,
    selectionStart: number,
    selectionEnd: number
  ): SelectionRect[] {
    if (selectionStart === selectionEnd) return [];

    const start = Math.min(selectionStart, selectionEnd);
    const end = Math.max(selectionStart, selectionEnd);

    const rects: SelectionRect[] = [];
    let lineStartIdx = 0;

    for (const line of layout.lines) {
      const lineEndIdx = lineStartIdx + line.text.length;

      // Check if the selection range intersects this line
      const overlapStart = Math.max(start, lineStartIdx);
      const overlapEnd = Math.min(end, lineEndIdx);

      if (overlapStart < overlapEnd) {
        const localStart = overlapStart - lineStartIdx;
        const localEnd = overlapEnd - lineStartIdx;

        // Get coordinates inside line glyphs
        if (line.glyphs.length > 0 && localStart < line.glyphs.length) {
          const leftGlyph = line.glyphs[localStart];
          const rightGlyph = line.glyphs[Math.min(line.glyphs.length - 1, localEnd - 1)];

          const x = leftGlyph.x;
          const width = rightGlyph.x + rightGlyph.width - x;
          const y = line.y - line.ascent;
          const height = line.ascent + line.descent;

          rects.push({ x, y, width, height });
        }
      }

      lineStartIdx = lineEndIdx;
    }

    return rects;
  }
}
