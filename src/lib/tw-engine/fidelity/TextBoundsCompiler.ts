import { PositionedGlyph } from './CharacterPositionEngine';

export interface BoundingRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * TextBoundsCompiler aggregates character bounds into line/paragraph bounding boxes.
 */
export class TextBoundsCompiler {
  /**
   * Aggregates character glyph runs boundaries into a single bounding box.
   */
  static compileBounds(glyphs: PositionedGlyph[]): BoundingRect {
    if (glyphs.length === 0) return { x: 0, y: 0, width: 0, height: 0 };

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (const g of glyphs) {
      if (g.x < minX) minX = g.x;
      if (g.y < minY) minY = g.y;
      if (g.x + g.width > maxX) maxX = g.x + g.width;
      if (g.y + g.height > maxY) maxY = g.y + g.height;
    }

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    };
  }
}
