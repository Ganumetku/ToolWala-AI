# Mutation Engine Module

The Mutation Engine manages user interface transformations, coordinate modifications, and text updates as structured, mergeable transaction objects.

---

## 📋 Responsibilities
* Classify layout changes (moves, resizes, rotations, typing, color tweaks) into specific `MutationType` categories.
* Validate boundaries: reject zero/negative dimensions, invalid rotations, and missing objects.
* Track undo/redo actions, rolling back to `beforeState` or replaying `afterState` inside `ObjectRegistry`.
* Coalesce sequential character additions or coordinates dragging coordinates into single logical mutations.
* Consolidate timeline ledgers into maps of target object IDs and final states for PDF compilation.

---

## 🛠 Public API Reference
* `MutationEngine.getInstance(): MutationEngine`: Singleton resolver.
* `MutationEngine.applyMutation(mutation: Mutation): boolean`: Evaluates, validates, and applies mutations.
* `MutationEngine.undo(): Mutation | null`: Rollback the last operation.
* `MutationEngine.redo(): Mutation | null`: Replay the last undone operation.
* `ChangeTracker.getInstance().startTracking(callback): void`: Subscribes to registry events and translates updates to mutations.
* `MutationSerializer.consolidateStates(timeline: Mutation[]): Map<string, any>`: Computes final state updates.

---

## 🔄 Lifecycle Data Flow
```
ObjectRegistry (updateObject) -> ChangeTracker (detect change) -> MutationEngine -> MutationValidator -> MutationMerger (coalesce) -> UndoRedoManager / MutationHistory
```
Every transaction preserves the state of the object before the modification took place, ensuring that undo operations are deterministic and rollback values are mathematically exact.
