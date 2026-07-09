# API Events and Callbacks Reference

This document maps event callbacks, hooks, and transaction listeners inside the ToolWala engines.

---

## Registry Listeners
`ObjectRegistry` triggers event listener functions when updates are committed:
* `onObjectUpdated(id: string, updates: Partial<TWObject>): void`
  - Triggered whenever coordinates, widths, heights, rotations, or opacity values are modified.
* `onObjectAdded(obj: TWObject): void`
  - Triggered when new elements are ingested or appended to pages.
* `onObjectDeleted(id: string): void`
  - Triggered when element delete states are flagged.

---

## Editor Callbacks
Interactive user interface hooks matching selection movements:
* `onObjectSelected(id: string, pageNumber: number): void`
  - Triggered when a pointer down selects a topmost element.
* `onSelectionCleared(): void`
  - Triggered when user clicks blank regions of page viewports.
* `onRedrawRequired(): void`
  - Triggered by `RenderScheduler` or `TransformController` requesting canvas repaints.
