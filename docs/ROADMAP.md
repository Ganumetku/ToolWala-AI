# Live Roadmap: ToolWala Native PDF Engine

This live roadmap tracks completed implementation phases, current work scopes, and upcoming SDK serialization tasks.

---

## 🗺 Phases Overview

### Ingestion & Model Parsing
* [x] **Phase 1**: Ingest PDF document bytes & basic page structure.
* [x] **Phase 2**: Extract raw texts mapping layouts.
* [x] **Phase 3**: Render overlay layouts on fabric overlays.
* [x] **Phase 4**: Native PDF Object Detection Engine (Text, Image, Path, Vector, Annotation, Font sub-parsers).

### Upgrades, Selection & Layout compilations
* [x] **Phase 4.1**: Engine Architecture Upgrade (TWObject polymorphism, state history snapshots, ObjectRegistry singleton cache, linear algebra/geometry packages).
* [x] **Phase 4.2**: Native Object Selection Engine (Pointer selections, rotated bounding boxes checks, SVG Path2D hit testing, outline borders and resize handles, TransformController move/scale/rotate).
* [x] **Phase 4.3**: Render Graph & Scene Engine (Hierarchical SceneNodes, Camera pan/zoom view matrices, Viewport boundary visible pages, default layers containers, CullingManager, DirtyRegionManager clipped repaint clipping, RenderScheduler batch frame scheduler, RenderGraph compilation).
* [x] **Phase 4.4**: Native Text Layout & Font Engine (Ascent/descent FontMetrics registries, GlyphCache proportional widths, FontResolver subset cleaner, Kerning pair spacing, LineBreaker wrapping constraints, GlyphLayout, TextLayout typesetter, CaretEngine click mapping, TextSelection highlights builder).

### Upcoming Milestones
* [ ] **Phase 5**: Native PDF Object Serializer & Exporter Writer
* [ ] **Phase 6**: Interactive UI Components integration (React/Canvas hooks bridge, toolbar commands layout, active caret indicator drawing)
* [ ] **Phase 7**: Production benchmark tests & SDK packaging
