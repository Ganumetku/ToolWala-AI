import type { TextLayout } from './TextLayout';

/**
 * CaretEngine maps physical mouse cursor clicks onto character layout indices,
 * handles caret moves, and manages selection indexes ranges.
 */
export class CaretEngine {
  caretIndex = 0;
  selectionStart = 0;
  selectionEnd = 0;

  /**
   * Resets selection offsets.
   */
  clearSelection(): void {
    this.selectionStart = this.caretIndex;
    this.selectionEnd = this.caretIndex;
  }

  /**
   * Resolves the closest character cursor position for viewport coordinate click (px, py).
   */
  clickToCaretIndex(px: number, py: number, layout: TextLayout): number {
    if (layout.lines.length === 0) return 0;

    // 1. Identify the line row under py coordinate
    let activeLineIdx = 0;
    for (let i = 0; i < layout.lines.length; i++) {
      const line = layout.lines[i];
      const top = line.y - line.ascent;
      const bottom = line.y + line.descent;
      
      if (py >= top && py <= bottom) {
        activeLineIdx = i;
        break;
      }
      if (py < top && i === 0) {
        activeLineIdx = 0;
        break;
      }
      if (py > bottom) {
        activeLineIdx = i; // Fallback to last row
      }
    }

    const line = layout.lines[activeLineIdx];
    let glyphOffsetIndex = 0;
    
    // 2. Identify the character under px coordinate
    for (let j = 0; j < line.glyphs.length; j++) {
      const glyph = line.glyphs[j];
      const halfWidth = glyph.width / 2;
      
      // If click falls in left half of glyph, insert caret before it
      if (px < glyph.x + halfWidth) {
        glyphOffsetIndex = j;
        break;
      }
      glyphOffsetIndex = j + 1; // Insert caret after it
    }

    // 3. Compute the cumulative text string index
    let cumulative = 0;
    for (let k = 0; k < activeLineIdx; k++) {
      cumulative += layout.lines[k].text.length;
      if (layout.text[cumulative] === '\n') {
        cumulative += 1;
      }
    }

    return cumulative + glyphOffsetIndex;
  }

  /**
   * Handles double click: selects the word under cursor.
   */
  doubleClick(px: number, py: number, layout: TextLayout): void {
    const idx = this.clickToCaretIndex(px, py, layout);
    const text = layout.text;

    let start = idx;
    let end = idx;

    // Expand search leftwards to word boundary
    while (start > 0 && this.isWordCharacter(text[start - 1])) {
      start--;
    }

    // Expand search rightwards to word boundary
    while (end < text.length && this.isWordCharacter(text[end])) {
      end++;
    }

    this.caretIndex = end;
    this.selectionStart = start;
    this.selectionEnd = end;
  }

  /**
   * Handles triple click: selects the entire line under cursor.
   */
  tripleClick(px: number, py: number, layout: TextLayout): void {
    if (layout.lines.length === 0) return;

    // Resolve line idx under cursor
    let activeLineIdx = 0;
    for (let i = 0; i < layout.lines.length; i++) {
      const line = layout.lines[i];
      const top = line.y - line.ascent;
      const bottom = line.y + line.descent;
      
      if (py >= top && py <= bottom) {
        activeLineIdx = i;
        break;
      }
      if (py < top && i === 0) {
        activeLineIdx = 0;
        break;
      }
      if (py > bottom) {
        activeLineIdx = i;
      }
    }

    let cumulative = 0;
    for (let k = 0; k < activeLineIdx; k++) {
      cumulative += layout.lines[k].text.length;
      if (layout.text[cumulative] === '\n') {
        cumulative += 1;
      }
    }

    const lineText = layout.lines[activeLineIdx].text;
    this.selectionStart = cumulative;
    this.selectionEnd = cumulative + lineText.length;
    this.caretIndex = this.selectionEnd;
  }

  private isWordCharacter(char: string): boolean {
    if (!char) return false;
    return /[a-zA-Z0-9_]/.test(char);
  }
}
