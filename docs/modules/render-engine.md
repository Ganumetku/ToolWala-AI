# Render Engine Module

The `RenderEngine` is responsible for drawing registered objects (texts, images, path vectors, annotations) onto HTML5 Canvas 2D contexts.

---

## 📋 Responsibilities
* Draw elements inside page coordinate layers in drawing-order (`zIndex` ascending).
* Render proportional fonts on precise typographic baselines.
* Decouple asset loading: manage asynchronous image buffers caches.
* Apply relative translation/rotation/scaling adjustments to SVG Path2D vectors.

---

## 🛠 Public API Reference
* `RenderEngine.render(ctx: CanvasRenderingContext2D, pageNumber: number): void`: Main loop drawing active page elements.
* `BoundingBox.render(ctx: CanvasRenderingContext2D, obj: TWObject): void`: Draw bounding selection borders and handles.

---

## 🔄 Internal Drawing Flow
1. Fetch page items sorted by `zIndex` ascending.
2. For each element:
   - Check if visible and not deleted.
   - Apply global opacity.
   - Translate context coordinate origin to element center and rotate by angle.
   - Draw shape (baseline text runs, decoded image buffers, Path2D SVGs).
   - Restore drawing state.
3. Draw selection handles if item matches active selection ID.
