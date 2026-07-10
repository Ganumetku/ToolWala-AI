# Phase 5.1: ToolWala Native Object Mutation Engine

This phase designs and builds an Object Mutation Engine capturing layout transformations and text edits as structured, verifiable, and mergeable mutation transactions, introducing complete undo/redo capabilities.

---

## 🎯 Purpose and Goals
* Capture edits inside the editor as structured mutation logs.
* Automate mutation tracking by implementing update observers inside the central `ObjectRegistry` cache.
* Handle undo rollbacks (`beforeState`) and redo replays (`afterState`) cleanly.
* Implement layout boundaries validation checking coordinates ranges, positive dimensions, and valid rotations.
* Coalesce sequential consecutive keystrokes or dragging shifts to avoid bloating the undo history stacks.
* Serialize mutation logs and consolidate states for PDFWriter compilation.

---

## 📂 Files Added & Modified
* `src/lib/tw-engine/ObjectRegistry.ts`: Added listener hooks and updates broadcast events.
* `src/lib/tw-engine/mutation/MutationTypes.ts`: Union type categories and mutation schemas.
* `src/lib/tw-engine/mutation/MutationValidator.ts`: Asserts bounds constraints.
* `src/lib/tw-engine/mutation/UndoRedoManager.ts`: Undo/Redo rollback and replay manager.
* `src/lib/tw-engine/mutation/MutationHistory.ts`: Flat chronological timeline collections.
* `src/lib/tw-engine/mutation/ChangeTracker.ts`: Observes registry updates, classifying mutation types.
* `src/lib/tw-engine/mutation/MutationMerger.ts`: Time-based typing and dragging merger.
* `src/lib/tw-engine/mutation/MutationSerializer.ts`: Serializes records and consolidates final states.
* `src/lib/tw-engine/mutation/MutationEngine.ts`: Central operations manager.

---

## 📐 Architecture & Verification
* Automated mutations are generated upon registry updates.
* Validated via `scratch/verify_mutation.ts` asserting move/resize classifications, negative bounds rejection, undos/redos state restoring, sequential merges, and final state consolidation.
