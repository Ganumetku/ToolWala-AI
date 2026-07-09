# Scene Graph Module

The Scene Graph coordinates the document layout trees, cascading world matrices and bounds down the child node hierarchies.

---

## 📋 Responsibilities
* Manage hierarchical parent-child relationships for document blocks.
* Compute world matrices by multiplying parent and local matrices.
* Coordinate camera translations/zoom levels and viewports visible regions.
* Layer page layouts dynamically (PDF, Selection, Annotation layers).

---

## 🛠 Public API Reference
* `SceneNode.addChild(node: SceneNode): void`: Add child node.
* `SceneNode.updateMatrices(): void`: Propagate parent coordinates matrices downwards.
* `SceneNode.getWorldBounds(): SceneBounds`: Resolve transformed boundaries.
* `Camera.getViewMatrix(): number[]`: Compile zoom/pan matrices.
* `Viewport.updateVisiblePages(pages: PageViewportBounds[]): void`: Flag visible page indexes.
* `Scene.initializeFromDocument(document: TWDocument): void`: Build hierarchy layouts.

---

## 🔄 Matrix Cascade Flow
```
Scene RootNode -> Page Container Nodes -> Layer Container Nodes -> Element Leaf Nodes
```
When camera translations pan, the compiler updates matrices downward, checking viewport culling and scheduling repaints.
