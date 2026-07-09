# Phase 4.2: Native Object Selection Engine

This phase constructs the client selection layer, rotated bounding boxes checks, and interactive transform controller.

---

## 🎯 Purpose and Goals
* Perform hit testing at coordinates on rotated rectangles and SVG Path2D paths.
* Implement topmost selection resolution (searching reverse zIndex).
* Render dashed outline borders, TC rotations circles, and 8 resize nodes.
* Implement move dragging, rotation calculation, and axis-aligned scaling transforms, saving results to registries.

---

## 📂 Files Added & Modified
* `editor/HitTest.ts`: Checks rotated rectangular hits.
* `editor/SelectionEngine.ts`: Manages topmost selections.
* `editor/BoundingBox.ts`: Draws outlines and handles.
* `editor/TransformController.ts`: Drives moves/scales/rotates.
* `editor/RenderEngine.ts`: Standard drawing loop.

---

## 📐 Architecture & Verification
* Viewport mouse inputs map directly to selections and trigger redraw.
* Validated via `scratch/verify_editor.ts` asserting move shifts, rotation degrees, scale boundaries, and dirty commits.
