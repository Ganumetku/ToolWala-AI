# Phase 5.2: ToolWala Native UI Synchronization Layer

This phase implements the ToolWala Native UI Synchronization Layer, decoupling the UI completely from Fabric.js state. The native `ObjectRegistry` + `MutationEngine` become the sole source of truth, rendering Fabric.js purely as a temporary view adapter.

---

## 🎯 Purpose and Goals
* Decouple state from canvas rendering: completely remove canvas state serializations, `toJSON`, and `loadFromJSON` dependencies.
* Build a pub-sub observer `EditorEvents` to communicate selections, translations, zoom settings, and page updates.
* Centralize view settings (zoom scales, scroll positions) in an isolated `ViewportSync` cache.
* Route cursor and keyboard drags through `InteractionController` and dispatch mutations via `MutationDispatcher`.
* Build a generic `RenderAdapter` interface ensuring React views are renderer-agnostic.
* Subcribe to registry changes and schedule page repaints automatically inside `CanvasSyncManager`.
* Validate UI-registry synchronization to flag duplicate or stale states via `UIStateValidator`.

---

## 📂 Files Added
* `src/lib/tw-engine/ui/EditorEvents.ts`: Pub-sub event channels.
* `src/lib/tw-engine/ui/UIStateBridge.ts`: Registry connector.
* `src/lib/tw-engine/ui/ViewportSync.ts`: External zoom and scrolls settings.
* `src/lib/tw-engine/ui/SelectionSync.ts`: Element selection tracker.
* `src/lib/tw-engine/ui/MutationDispatcher.ts`: Compiles and pushes mutations.
* `src/lib/tw-engine/ui/InteractionController.ts`: Processes user moves/scales/rotates inputs.
* `src/lib/tw-engine/ui/RenderAdapter.ts`: Generic Renderer wrapper interface.
* `src/lib/tw-engine/ui/CanvasSyncManager.ts`: Automated repaint scheduler.
* `src/lib/tw-engine/ui/UIStateValidator.ts`: Stale elements checklist.
* `scratch/verify_ui_sync.ts`: Verification script.

---

## 📐 Architecture & Verification
* Native Engine holds full state control.
* Validated via `scratch/verify_ui_sync.ts` asserting move interactions, automated repaints, undo rollbacks, selection zoom syncs, and validations.
