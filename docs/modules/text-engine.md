# Text Layout & Font Engine Module

The Text Layout & Font Engine is the typographic core typesetter of the SDK, computing character coordinate runs and mapping cursors carets.

---

## 📋 Responsibilities
* Store design heights (Ascent, Descent, lineGap) for standard PDF core fonts.
* Cache proportional widths and monospaced advances.
* Clean PostScript subset tags (`ABCDEF+`) and handle fallbacks.
* Parse AV pair-kerning design offsets and tracking spacing.
* Word-wrap paragraphs dynamically under width margins.
* Typeset strings into relative LineRuns of individual characters GlyphLayout coordinates.
* Resolve screen coordinate clicks to caret indices, word selections (double-click), and line selections (triple-click).
* Compile selection highlight rectangles overlapping LineRuns.

---

## 🛠 Public API Reference
* `FontMetricsRegistry.getMetrics(fontName: string): FontMetrics`: Resolve design metrics.
* `GlyphCache.getGlyphAdvance(fontName: string, char: string): number`: Fetch character advance.
* `LineBreaker.splitLines(text: string, fontName: string, fontSize: number, maxWidth: number, autoWrap: boolean): string[]`: Wrap runs.
* `TextLayout`: Paragraph typesetting constructor compiling glyph coordinates arrays.
* `CaretEngine.clickToCaretIndex(px: number, py: number, layout: TextLayout): number`: Coords mapper.
* `TextSelection.getSelectionRects(layout: TextLayout, start: number, end: number): SelectionRect[]`: Compile highlight boxes.

---

## 🔄 Typesetting Compile Pipeline
```
Paragraph block -> LineBreaker split -> TextLayout -> glyph advances & spacing -> coordinates runs
```
This is completely self-contained and does not call browser DOM selectors, enabling server-side PDF layouts.
