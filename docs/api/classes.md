# API Classes Reference

This document maps public classes, constructors, methods, and parameters inside the ToolWala Native PDF Engine SDK.

---

## `ObjectRegistry`
Cache source of truth singleton.
* **Methods**:
  - `static getInstance(): ObjectRegistry`: Singleton resolver.
  - `registerObject(obj: TWObject): void`: Register parsed elements.
  - `updateObject(id: string, updates: Partial<TWObject>): void`: Apply mutations and flip dirty triggers.
  - `getObject(id: string): TWObject | undefined`: Query element details.
  - `getObjectsByPage(pageNumber: number): TWObject[]`: Fetch page items sorted by zIndex.

---

## `SelectionEngine`
Pointer selections tracker.
* **Methods**:
  - `select(id: string, pageNumber: number): void`: Persist selected elements.
  - `deselect(): void`: Clear selection.
  - `getSelectedObjectId(): string | null`: Get active ID.
  - `handlePointerDown(px: number, py: number, pageNumber: number, ctx?: CanvasRenderingContext2D): TWObject | null`: Resolve clicked elements.

---

## `TransformController`
Move, scale, and rotate transform driver.
* **Methods**:
  - `startTransform(obj: TWObject, px: number, py: number): boolean`: Check if handle under pointer.
  - `updateTransform(px: number, py: number): void`: Process cursor moves and save inputs.
  - `stopTransform(): void`: Reset drag states.
  - `getHandleAt(obj: TWObject, px: number, py: number): string | null`: Handle hit verification check.

---

## `SceneNode`
Tree node.
* **Methods**:
  - `addChild(node: SceneNode): void`: Add child branch.
  - `removeChild(node: SceneNode): void`: Remove child branch.
  - `updateMatrices(): void`: Cascades parent matrices down the tree.
  - `getWorldBounds(): SceneBounds`: Resolve transformed screen boundaries.

---

## `TextLayout`
Typographic typesetting compiler.
* **Constructor**:
  - `constructor(text: string, fontName: string, fontSize: number, maxWidth?: number, autoWrap?: boolean, letterSpacing?: number)`
* **Methods**:
  - `layout(): void`: Compile typesetting runs.

---

## `CaretEngine`
Typographic click coordinate indices resolver.
* **Methods**:
  - `clickToCaretIndex(px: number, py: number, layout: TextLayout): number`: Map click coords to index.
  - `doubleClick(px: number, py: number, layout: TextLayout): void`: Select word under pointer.
  - `tripleClick(px: number, py: number, layout: TextLayout): void`: Select line under pointer.
