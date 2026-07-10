# UI Synchronization Layer Module

The UI Synchronization Layer decouples the user interface from rendering engine libraries. It turns the native `ObjectRegistry` + `MutationEngine` into the single source of truth, treating the canvas purely as an output adapter.

---

## 📋 Responsibilities
* Manage standard UI event channels (Selections, moves, resizes, zoom levels, active pages changes).
* Externalize viewport parameters (zoom factors, scrolls) outside of canvas instances.
* Dispatch mutations upon user coordinate translations or text typing.
* Coordinate active selections with UI toolbar states.
* Provide an abstract wrapper interface (`Renderer`) to keep React views renderer-agnostic.
* Observe registry updates to trigger page repaints on registered canvas elements.
* Validate alignment of active layout elements to prevent stale objects.

---

## 🛠 Public API Reference
* `EditorEvents.getInstance()`: Event pub-sub subscription driver.
* `ViewportSync.getInstance()`: External zoom and translation settings.
* `SelectionSync.getInstance()`: Coordinate active selections.
* `InteractionController`: Translates cursor dragging inputs into registry updates and mutations.
* `RenderAdapter.setRenderer(renderer: Renderer)`: Set active canvas drawer.
* `CanvasSyncManager.getInstance().registerCanvas(page, canvas)`: Register element for update repaints.
* `UIStateValidator.validate(page, ids)`: Verify state alignment.

---

## 🔄 Synchronization Lifecycle Flow
```
User drag -> InteractionController -> Registry update -> Change Interceptor -> Repaint broadcast -> RenderAdapter -> Canvas Repaint
```
React components interact solely with the UI Sync APIs. They are completely decoupled from Fabric's internal state, enabling a transparent transition to a native HTML5 canvas renderer.
