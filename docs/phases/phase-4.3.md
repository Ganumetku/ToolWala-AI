# Phase 4.3: Render Graph & Scene Engine

This phase introduces a compiler-grade layout tree and Render Graph, decoupling drawing calculations from raw canvas rendering.

---

## 🎯 Purpose and Goals
* Model hierarchical `SceneNodes` tracking parent-child relations and propagating matrix transforms.
* Manage scroll viewports, visible pages mapping, and camera view matrices.
* Define page layers (PDF, Selection, Annotation layers).
* Implement out-of-viewport culling filters.
* Aggregate dirty bounding boxes for clipped repaints.
* Schedule redraw frames throttled to animation intervals.

---

## 📂 Files Added & Modified
* `render/SceneNode.ts`: Cascades world matrix coordinates.
* `render/Camera.ts`: Manages translations and zoom levels.
* `render/Viewport.ts`: Manages DPI and scroll boundaries.
* `render/LayerManager.ts`: Maps layer containers.
* `render/CullingManager.ts`: Bypasses out-of-screen nodes.
* `render/DirtyRegionManager.ts`: Merges repaint clip areas.
* `render/RenderScheduler.ts`: Redraw frame scheduler.
* `render/RenderGraph.ts`: Generates sorted Render Queue tasks.
* `render/Scene.ts`: Ingests documents and maps layouts.

---

## 📐 Architecture & Verification
* The scene coordinates cascade correctly.
* Validated via `scratch/verify_scene.ts` testing culling, scroll visibilities, camera matrices, and batch paints.
