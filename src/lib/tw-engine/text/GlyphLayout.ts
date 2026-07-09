/**
 * GlyphLayout stores typographic dimensions and position coordinates
 * for an individual character glyph in local text space.
 */
export class GlyphLayout {
  char: string;
  x: number;          // Left position offset relative to line baseline origin
  y: number;          // Top position offset relative to line baseline origin
  width: number;      // Rendered width in pixels
  height: number;     // Rendered height in pixels
  ascent: number;     // Ascent in pixels
  descent: number;    // Descent in pixels
  advanceX: number;   // Horizonal cursor advance in pixels

  constructor(
    char: string,
    x: number,
    y: number,
    width: number,
    height: number,
    ascent: number,
    descent: number,
    advanceX: number
  ) {
    this.char = char;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.ascent = ascent;
    this.descent = descent;
    this.advanceX = advanceX;
  }
}
