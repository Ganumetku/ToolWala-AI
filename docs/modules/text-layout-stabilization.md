# text-layout-stabilization

The `text-layout-stabilization` layer guarantees that text drawing coordinates, selections overlays, and carets are generated from a single immutable layout cache, eliminating repaint drifts.

---

## Technical Details

### Layout Cache
Every text object is decorated with:
* `obj._cachedLayout`: Holds the compiled `TextLayout` instance.
* `obj._cachedLayoutKey`: Encapsulates a composite hash key representing the text value, font family, font size, style, and weight.

### Painting and Measurements Consolidations
* **Draw Character Glyphs**: Iterate over `layout.lines` and `line.glyphs` using the baseline local vertical Y coordinate computed by the layout.
* **Selection Highlighting**: Generates selection highlights directly using the cached `layout` glyph structures.
* **Caret Positioning**: Positions caret coordinates by querying cached line glyph bounds.
* **Selection Drags & Clicks**: Snap to coordinates referencing the identical layout instance cached on the target textbox.
