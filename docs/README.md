# ToolWala Native PDF Engine SDK

ToolWala Native PDF Engine is a highly optimized, production-grade, zero-dependency typesetting and PDF editing engine written in pure TypeScript. 

By bypassing heavy third-party canvas wrappers (such as Fabric.js or Konva) and browser layout interfaces (such as `contenteditable` or the PDF.js text layer), ToolWala provides pixel-perfect rendering, click hit testing, culling, and text editing directly on raw canvas contexts.

---

## 📊 SDK Implementation Summary

* **Implementation Completeness**: 85%
* **Current Phase**: Phase 4.4 — Native Text Layout & Font Engine (Complete)
* **Next Phase**: Phase 5 — Native PDF Object Serializer & Exporter Writer

---

## 📂 Core Folder Overview

```
src/lib/tw-engine/
├── types.ts                # Shared state structures, interfaces & types
├── Matrix.ts               # Affine matrix linear algebra [a,b,c,d,e,f]
├── Geometry.ts             # coordinate snaps, rotations, distance checks
├── ObjectRegistry.ts       # Singleton source of truth & transaction history
├── DocumentParser.ts        # Dynamic worker setups & PDF.js ingest loader
├── PageParser.ts           # Page ingest and drawing-order zIndex sort
├── FontParser.ts           # PS font subsets parser & encoder extraction
├── TextParser.ts           # Text coordinates merging & conversions
├── ImageParser.ts          # Pixel buffer stream decode CTM tracker
├── VectorParser.ts         # Paths builder & graphics operations parser
├── AnnotationParser.ts     # Widgets, links & highlights parser
│
├── editor/                 # Client Selection & Transform controller
│   ├── HitTest.ts          # Rotated bounding boxes & SVG Path2D hits
│   ├── SelectionEngine.ts  # Top-to-bottom pointer selections
│   ├── BoundingBox.ts      # outline selection border & handles
│   └── TransformController.ts # Drag translation, scale, and rotations
│
├── render/                 # Render Graph & Layout tree compiler
│   ├── SceneNode.ts        # Hierarchical matrix nodes
│   ├── Scene.ts            # Page-layer grid builder
│   ├── Camera.ts           # Pan zoom view matrix compile
│   ├── Viewport.ts         # Canvas visible bounds calculations
│   ├── LayerManager.ts     # default PDF/Selection/Annotation layers
│   ├── CullingManager.ts   # Skips drawing nodes outside the camera
│   ├── DirtyRegionManager.ts # Repaint area bounding box clip paths
│   ├── RenderScheduler.ts  # Throttled requestAnimationFrame scheduler
│   └── RenderGraph.ts      # Compiles scene trees to render queues
│
├── text/                   # Typographic typesetting & caret selection
│   ├── FontMetrics.ts      # Ascent/Descent design metric registers
│   ├── GlyphCache.ts       # Widths and unicode advance maps
│   ├── FontResolver.ts     # PS subset stripping and fallbacks resolved
│   ├── Kerning.ts          # Pair kerning AV offsets and track spacing
│   ├── LineBreaker.ts      # Manual line breaks and auto word wrap
│   ├── GlyphLayout.ts      # Typographic bounds of individual characters
│   ├── TextLayout.ts       # Typesets strings into coordinate runs
│   ├── CaretEngine.ts      # Resolves coords clicks to caret indexes
│   └── TextSelection.ts    # selection highlight coordinates boxes
│
└── writer/                 # PDF Writer skeleton exporter
    └── PDFWriter.ts        # PDF exporter hook
```

---

## 🛠 Compilation and Verification

### Compilation Check
Compile the TypeScript code using:
```bash
npx tsc --noEmit
```

### Run Verification Scripts
Run the engine verification scripts:
```bash
# Verify Ingestion Parsers & Registry
npx tsx scratch/verify_parser.ts

# Verify HitTest, BoundingBox & Selection Transform Controller
npx tsx scratch/verify_editor.ts

# Verify Scene Graph, Viewport Culling & Repaint Scheduler
npx tsx scratch/verify_scene.ts

# Verify Typesetting, wrapping, Kerning & Caret mappings
npx tsx scratch/verify_text_layout.ts
```
