# native-text-rendering

The `native-text-rendering` layer establishes the native engine as the sole owner of visible text rendering, bypassing Fabric.js text rendering completely.

---

## Architecture Design

### Transparency Control
Fabric.js textboxes (`fabric.Textbox`) are configured with `fill: 'transparent'` at all times (including during selection, active editing, and static view mode). Fabric is used only as an input tracking container to register mouse drags and selection clicks.

### Rendering Sequence
The viewport renders the canvas in the following exact order:
1. **PDF Background**: Base PDF page rasterized underneath.
2. **Whiteout Layer**: Masking rectangle drawn on the canvas to obscure the original background PDF characters.
3. **Native Text**: The `RenderEngine` compiles text runs using `FidelityEngine` and paints the glyphs character-by-character along their typographic baselines.
4. **Native Highlights**: Displays exact text selection bounds.
5. **Native Caret**: Renders the blinking typing insertion pointer.

---

## Spacing and Alignment
* Spacing coordinates are resolved dynamically using custom glyph advance widths from embedded fonts.
* Baseline alignment utilizes absolute offsets calculated relative to the textbox top boundaries, ensuring text remains visually stable and aligned with original PDF positions.
