# Writer Module

The PDF Writer is the export layer responsible for serializing modifications back into raw PDF document bytes.

---

## 📋 Responsibilities
* Filter `ObjectRegistry` singleton cache to extract dirty elements (`isDirty = true`).
* Identify deletion flags to modify stream layouts.
* Re-encode fonts, pixels, and vectors back into PDF format byte streams.

---

## 🛠 Public API Reference
* `PDFWriter.exportDocument(registry: ObjectRegistry): Uint8Array`: Exporter skeleton entry point.

---

## 🔄 Upcoming Serialization Pipeline
1. Scan registries for items with `isDirty === true` or `deleted === true`.
2. Map current viewport edited coordinates back to native PDF coordinates using the inverse matrix `Matrix.inverse(transformationMatrix)`.
3. Rewrite the page operator content streams.
4. Save file catalog updates and output compiled PDF bytes.
