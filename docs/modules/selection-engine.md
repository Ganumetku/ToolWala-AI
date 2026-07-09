# Selection Engine Module

The Selection Engine manages pointer coordinate hit-testing and drag translations move/scale/rotate transforms.

---

## 📋 Responsibilities
* Resolve clicks to topmost active objects, searching reverse `zIndex`.
* Map coordinates to rotated rectangular bounds and Path2D vectors.
* Process coordinate shifts during drags to edit `currentState`/`editedState` in the registry.

---

## 🛠 Public API Reference
* `HitTest.hitTest(obj: TWObject, px: number, py: number, ctx?: CanvasRenderingContext2D): boolean`: Click validation check.
* `SelectionEngine.handlePointerDown(px: number, py: number, pageNumber: number): TWObject | null`: Selections resolver.
* `TransformController.startTransform(obj: TWObject, px: number, py: number): boolean`: Check if clicked handle.
* `TransformController.updateTransform(px: number, py: number): void`: Process drags and updates.

---

## 🔄 Interaction Flow
1. User clicks canvas context coordinate `(px, py)`.
2. `SelectionEngine` loops objects top-to-bottom:
   - `HitTest` rotates points back by $-\theta$ around center to check intersection boundaries.
3. Topmost hit becomes selected.
4. Dragging handles executes `TransformController` moves, rotates, or scales.
5. Updates write to registry and toggle dirty triggers.
