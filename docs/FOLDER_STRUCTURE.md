# Folder Layout: ToolWala Native PDF Engine

This guide details the folder structure, packages, and modules of the ToolWala Native PDF Engine SDK under `src/lib/tw-engine/`.

---

## 📂 Directories Layout

* [tw-engine/](file:///Users/technicul-akash/ToolWala-AI/src/lib/tw-engine/)
  * `types.ts`: Holds typescript interfaces for parsed objects and coordinate state schemas.
  * `Matrix.ts`: Core matrix library executing affine 2D calculations (matrix multiplications, inversions, scaling).
  * `Geometry.ts`: Handles coordinate rotations, grid snapping tolerance, and line calculations.
  * `ObjectRegistry.ts`: Caches all parsed elements, tracking history and dirty-state indicators.
  * `DocumentParser.ts`: Entrant loader initializing PDF.js workers.
  * `PageParser.ts`: Spawns parallel sub-parsers per page, sorting them by stream order.
  * `FontParser.ts`: Scans document fonts, extracting PostScript names and subsets metadata.
  * `TextParser.ts`: Translates PDF operators into screen coordinate text blocks.
  * `ImageParser.ts`: Decodes pixel channel streams from PDF image streams.
  * `VectorParser.ts`: Builds line and SVG graphics paths.
  * `AnnotationParser.ts`: Scans widgets, interactive forms, highlights, and page links.
  * 
  * [editor/](file:///Users/technicul-akash/ToolWala-AI/src/lib/tw-engine/editor/)
    * `HitTest.ts`: Checks rotated coordinates and SVG Path2D collision checks.
    * `SelectionEngine.ts`: Resolves topmost clicked object (zIndex priority).
    * `BoundingBox.ts`: Renders outline frames, TC rotation connector lines, and 8 resize handles.
    * `TransformController.ts`: Processes moves, rotations, and scales, saving inputs back to the registry.
    * 
  * [render/](file:///Users/technicul-akash/ToolWala-AI/src/lib/tw-engine/render/)
    * `SceneNode.ts`: Tree node representation cascading parent-child world matrix grids.
    * `Camera.ts`: Keeps track of scroll panning, zoom scaling, and compiles view matrices.
    * `Viewport.ts`: Manages resolution, DPI, and visible scroll indexes.
    * `LayerManager.ts`: Maps default layout layers containers (PDF, selection, annotation layers).
    * `CullingManager.ts`: Bypasses drawing leaf nodes lying outside the camera viewport.
    * `DirtyRegionManager.ts`: Merges coordinate boxes of changed elements for clipped canvas renders.
    * `RenderScheduler.ts`: Throttles redraws to Animation Frames.
    * `RenderGraph.ts`: Traverses tree nodes to produce sorted Render Queues.
    * `Scene.ts`: Ingests documents and links page layouts vertically.
    * 
  * [text/](file:///Users/technicul-akash/ToolWala-AI/src/lib/tw-engine/text/)
    * `FontMetrics.ts`: Registers core typographic design heights (Ascent, Descent, lineGap) for core fonts.
    * `GlyphCache.ts`: Caches character widths.
    * `FontResolver.ts`: Filters PostScript prefixes (e.g. `XXXXXX+`) and maps fallbacks.
    * `Kerning.ts`: Pair-kerning design offsets and tracking spacing checks.
    * `LineBreaker.ts`: Word wrapper handling wrapping width constraints.
    * `GlyphLayout.ts`: Tracks relative bounds of individual glyphs.
    * `TextLayout.ts`: Typesets paragraphs into LineRuns of GlyphLayout runs.
    * `CaretEngine.ts`: Maps pointer coordinates to caret indices and word/line boundaries.
    * `TextSelection.ts`: Compiles highlight boxes representing selection ranges.
    * 
  * [writer/](file:///Users/technicul-akash/ToolWala-AI/src/lib/tw-engine/writer/)
    * `PDFWriter.ts`: Exporter skeleton.
