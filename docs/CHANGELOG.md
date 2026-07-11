# Changelog: ToolWala Native PDF Engine

All notable changes and architectural updates to the ToolWala Native PDF Engine SDK will be recorded in this file.

---

## [Phase 5.6] - 2026-07-12
### Added
- Integrated `FidelityEngine` typesetting runs directly into `RenderEngine.ts`'s custom `fabricObjects` render pass, rendering solid characters character-by-character based on exact baseline offsets.
- Forced Fabric textbox `fill` to `'transparent'` during creation, selection, and editing modes inside `PDFCanvas.tsx` to completely remove Fabric text rendering visual discrepancies.
- Added `sessionListener` inside `PDFCanvas.tsx` setup lifecycle to propagate native typing changes from `EditingSession` back to Fabric text states and dynamically adjust text box width limits.
- Created `scratch/verify_native_text_rendering.ts` automated integration test script.

---

## [Phase 5.5] - 2026-07-12
### Added
- Created `src/lib/tw-engine/editing/` directory.
- Created `EditingState.ts` declaring state machine values (IDLE, OBJECT_SELECTED, TEXT_EDITING, TEXT_SELECTING, DRAGGING, RESIZING, ROTATING).
- Created `EditModeManager.ts` managing active canvas tool types.
- Created `EditingSession.ts` managing active text editing session values, transitions, and change listeners.
- Created `CaretRenderer.ts` and `SelectionRenderer.ts` rendering caret lines and highlights runs.
- Created `TextInputController.ts` dynamically mounting/unmounting an offscreen DOM textarea to capture native typing and composition inputs.
- KeyboardController.ts mapping command navigations, deletes, backspaces, and clipboard actions (Ctrl+A/C/X/V).
- Created `ClipboardController.ts` interfacing with the browser navigator clipboard systems.
- Created `IMEController.ts` managing Composition start/update/end events to support multi-byte inputs (Hindi, Japanese, Chinese, Korean).
- Created `FocusManager.ts` routing active window focus targets.
- Created `CursorManager.ts` styling canvas element CSS pointers (text, default, grab).
- Created `EditingValidator.ts` enforcing move blocking and transform controls hiding rules.
- Integrated `EditingSession` and validations into `RenderEngine.ts` and `PDFCanvas.tsx` event loops.
- Created `scratch/verify_editing_session.ts` verification test script.

---

## [Phase 5.4] - 2026-07-11
### Added
- Created `src/lib/tw-engine/fidelity/` directory.
- Created `FontMatcher.ts` converting subset fonts and standardizing Base14 names.
- Created `EmbeddedFontResolver.ts` caching font buffers and registering them in the browser via style elements.
- Created `BrowserFontFallback.ts` mapping closest typographic metrics to system fonts.
- Created `GlyphAdvanceEngine.ts` cache indexing explicit PDF glyph widths.
- Created `BaselineEngine.ts` correcting baseline offsets dynamically.
- Created `TextMatrixCompiler.ts` compiling text matrices (Tm, Td, T*).
- Created `CharacterPositionEngine.ts` typesetting character glyphs individually.
- Created `TextBoundsCompiler.ts` compiling aggregate line heights.
- Created `FidelityEngine.ts` coordinating text layout runs compile.
- Created `FidelityValidator.ts` assessing alignment drift error score.
- Integrated `FidelityEngine` in `RenderEngine.ts` to draw characters individually based on compiled glyph advance metrics.
- Created `scratch/verify_fidelity.ts` verification test script.

---

## [Phase 5.3.1] - 2026-07-11
### Added
- Implemented native I-beam cursor hovers on original text elements.
- Hooked single-click, double-click, and triple-click snaps inside text boxes.
- Registered drag selection handlers computing glyph start/end margins.
- Enabled keyboard arrow keys, Shift+Arrows, Home, and End navigation.
- Configured dynamic textbox controls and borders toggling between `edit-text` and `select` modes.
- Created `scratch/verify_text_selection.ts` verification test script.

---

## [Phase 5.3] - 2026-07-10
### Added
- Created `src/lib/tw-engine/bridge/` directory containing `FabricAdapter.ts`, `FabricSelectionBridge.ts`, and legacy dependencies isolation wrappers.

---

## [Phase 5.2] - 2026-07-10
### Added
- Created `src/lib/tw-engine/ui/` directory.
- Created `EditorEvents.ts` managing pub-sub layouts and selection updates channels.
- Created `UIStateBridge.ts` linking UI state requests directly to ObjectRegistry.
- Created `ViewportSync.ts` managing scroll coordinates, zoom levels, and page dimensions outside canvas contexts.
- Created `SelectionSync.ts` syncing active selection states.
- Created `MutationDispatcher.ts` dispatching mutations to MutationEngine on user actions.
- Created `InteractionController.ts` mapping moves, resizes, and rotations inputs into registry updates and mutations.
- Created `RenderAdapter.ts` wrapping generic Renderer adapter interfaces.
- Created `CanvasSyncManager.ts` registering active canvases and triggering repaints automatically upon registry changes.
- Created `UIStateValidator.ts` validating ID alignments between UI lists and the registry cache.
- Created `scratch/verify_ui_sync.ts` verification test script.

---

## [Phase 5.1] - 2026-07-10
### Added
- Created `src/lib/tw-engine/mutation/` directory.
- Created `MutationTypes.ts` declaring types for MutationType and Mutation payloads.
- Created `MutationValidator.ts` asserting Move, Resize, Rotate, and Opacity boundaries.
- Created `UndoRedoManager.ts` managing rollback and replay histories stack.
- Created `MutationHistory.ts` collecting a flat timeline chronological ledger of changes.
- Created `ChangeTracker.ts` observing ObjectRegistry updates and generating structured mutations automatically.
- Created `MutationMerger.ts` coalescing sequential changes (e.g. typing, coordinates dragging) within a threshold.
- Created `MutationSerializer.ts` consolidating mutations into final states maps.
- Created `MutationEngine.ts` coordinating the mutation lifecycle.
- Created `scratch/verify_mutation.ts` verification test script.
- Modified `src/lib/tw-engine/ObjectRegistry.ts` to support change observer subscriptions.

---

## [Phase 5.0] - 2026-07-10
### Added
- Created `src/lib/tw-engine/writer/` directory.
- Created `WriterTypes.ts` declaring types for PDFValues, names, and references.
- Created `IndirectObject.ts` representing indirect entries (`X Y obj`).
- Created `ObjectSerializer.ts` serializing nested dictionaries and value arrays.
- Created `Compression.ts` handling dynamic FlateDecode sync compression.
- Created `StreamWriter.ts` formatting headers and lengths.
- Created `XRefBuilder.ts` constructing cross-reference tables from offset maps.
- Created `TrailerBuilder.ts` constructing trailer Root catalog links.
- Created `PageSerializer.ts` translating text/path/image coordinates to PDF operators flipping Y.
- Created `IncrementalWriter.ts` skeleton placeholder for future incremental saves.
- Created `PDFWriter.ts` entrant controller compiling final bytes array.
- Created `scratch/verify_writer.ts` verification test script.

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
