# Phase 4.4: Native Text Layout & Font Engine

This phase builds the internal typography compiler, scaling font metrics, wrapping runs, and mapping caret index clicks.

---

## 🎯 Purpose and Goals
* Register typographic heights (Ascent, Descent, lineGap) for core fonts.
* Cache proportional widths and monospaced advances.
* Clean PostScript subset prefixes (`ABCDEF+`) and map fallback fonts.
* Resolve pair kerning AV gaps and tracking spacing offsets.
* Word-wrap paragraphs based on wrap width constraints and carriage breaks.
* Build TextLayout line runs and GlyphLayout coordinates relative to baselines.
* Map click coordinates to caret indices, double-clicks word ranges, and triple-clicks line ranges.
* Compile highlight rectangles bounding selections.

---

## 📂 Files Added & Modified
* `text/FontMetrics.ts`: Registers core typographic design heights.
* `text/GlyphCache.ts`: Caches character widths.
* `text/FontResolver.ts`: PS subset names cleaner.
* `text/Kerning.ts`: Spacing tracking controller.
* `text/LineBreaker.ts`: Word wrapping manager.
* `text/GlyphLayout.ts`: Individual glyph boundaries.
* `text/TextLayout.ts`: Typesetting paragraph layout compiler.
* `text/CaretEngine.ts`: Maps pointer clicks to caret indices.
* `text/TextSelection.ts`: Compiles selection ranges highlights.

---

## 📐 Architecture & Verification
* Characters typeset precisely relative to baselines.
* Validated via `scratch/verify_text_layout.ts` testing line breaks, kerning, carets, double/triple selections, and highlights.
