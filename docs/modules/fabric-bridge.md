# Legacy Fabric Compatibility Bridge

> [!WARNING]
> This module is a **temporary compatibility bridge** designed to keep the legacy Fabric.js canvas layer operational during Phase 5 implementation steps. It will be **fully removed and decommissioned in Phase 6**, when the UI renders elements directly on HTML5 Canvas using our Native Render/Mutation Engine.

---

## 📋 Purpose
The `LegacyFabricBridge` translates native ToolWala objects into temporary Fabric-compatible JSON states. 

It prevents serialization crashes during PDF uploads by validating coordinate formats, image source values, and drawing paths before loading items into the Fabric canvas.

---

## 🛠 Handled Translations
* **Text, Image, Shape, Highlight, Signature Objects**: Performs property validation (asserting positive width/height, valid coordinates). If invalid, defaults them to placeholders to avoid crashes.
* **Drawable Annotations**: Splits and compiles path coordinates. If path data is valid, maps to a Fabric `'path'` object.
* **Non-Drawable Annotations (Links, Widgets, Form Fields)**: Bypasses path mapping and renders a lightweight dashed translucent `rect` placeholder containing all native metadata. Fabric can load and serialize this object safely.

---

## 🛠 Public API Reference
* `LegacyFabricBridge.toFabricObject(obj: TWPDFObject): Record<string, unknown> | null`: Primary translation and validation entry point.
