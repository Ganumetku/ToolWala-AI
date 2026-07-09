# Changelog: ToolWala Native PDF Engine

All notable changes and architectural updates to the ToolWala Native PDF Engine SDK will be recorded in this file.

---

## [Phase 4.4] - 2026-07-09
### Added
- Created `src/lib/tw-engine/text/` directory.
- Created `FontMetrics.ts` storing typographic ascent, descent, and line gap design metrics.
- Created `GlyphCache.ts` storing Helvetica and Times character width tables.
- Created `FontResolver.ts` stripping subset prefixes and managing font fallbacks.
- Created `Kerning.ts` resolving pair kerning AV overlaps and tracking offsets.
- Created `LineBreaker.ts` wrapping text blocks based on width constraints.
- Created `GlyphLayout.ts` tracking coordinates and heights of individual character glyphs.
- Created `TextLayout.ts` typesetter compiling lines into structured runs.
- Created `CaretEngine.ts` mapping click coordinates to caret insertion indices, double-clicks word ranges, and triple-clicks line ranges.
- Created `TextSelection.ts` compiling highlight rectangles bounding selections.
- Created `scratch/verify_text_layout.ts` verification test script.

---

## [Phase 4.3] - 2026-07-09
### Added
- Created `src/lib/tw-engine/render/` directory.
- Created `SceneNode.ts` model tracking parent-child relations and propagating matrix transforms.
- Created `Camera.ts` compiling pan and zoom metrics into view matrices.
- Created `Viewport.ts` calculating active page visibilities.
- Created `LayerManager.ts` generating default PDF, selection, and annotation layers.
- Created `CullingManager.ts` bypassing rendering for out-of-screen nodes.
- Created `DirtyRegionManager.ts` aggregating repaint zones for canvas clipping.
- Created `RenderScheduler.ts` batching paint requests into animation frames.
- Created `RenderGraph.ts` compiling hierarchy trees to sorted render queues.
- Created `Scene.ts` coordinating root nodes, layout collections, and camera bounds.
- Created `scratch/verify_scene.ts` verification test script.

---

## [Phase 4.2] - 2026-07-09
### Added
- Created `src/lib/tw-engine/editor/` directory.
- Created `HitTest.ts` checking rotated bounding box pointer overlaps and SVG Path2D hits.
- Created `SelectionEngine.ts` mapping clicks to topmost objects (zIndex order).
- Created `BoundingBox.ts` drawing outline borders, rotation stems, and 8 resize nodes.
- Created `TransformController.ts` handling pointer drag translations (move, rotate, scale/resize).
- Created `RenderEngine.ts` drawing texts, image buffers, and paths on 2D contexts.
- Created `scratch/verify_editor.ts` verification test script.

### Modified
- Refactored `types.ts` base `TWObject` interface to include state snapshot properties.

---

## [Phase 4.1] - 2026-07-09
### Added
- Created `types.ts` declaring types (`TWObject`, `TWTextObject`, etc.).
- Created `ObjectRegistry.ts` singleton source-of-truth cache and dirty tracking.
- Created `Matrix.ts` affine linear algebra calculations.
- Created `Geometry.ts` coordinate snapping and distance checking.
- Created `FontParser.ts` scanning and parsing PostScript subset encodings.
- Created `scratch/verify_parser.ts` verification test script.
- Renamed `ObjectParser.ts` to `VectorParser.ts`.

---

## [Phase 4.0] - 2026-07-09
### Added
- Created `src/lib/tw-engine/` directory.
- Created `DocumentParser.ts` entrance document parser.
- Created `PageParser.ts` page parsing orchestrator.
- Created `TextParser.ts` text elements aggregator.
- Created `ImageParser.ts` pixel buffer channel decoder.
- Created `AnnotationParser.ts` widgets, highlights, and link scanner.
