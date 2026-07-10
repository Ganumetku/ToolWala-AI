# Writer Module

The Writer module compiles `TWDocument` model trees back into standard binary PDF byte streams.

---

## 📋 Responsibilities
* Manage standard document trees compilation: Catalog node, Pages parent list, Page elements, and Info metadata dictionaries.
* Serialize numbers, literal strings, reference arrays, and nested dictionaries into PDF syntax.
* Translate screen layout text positions (including rotation angles), fonts, hex colors, and SVG paths into coordinate-flipped PDF drawing operators.
* Compress streams dynamically using FlateDecode (deflateSync) with a browser uncompressed fallback.
* Compile correct cross-reference offsets (`xref` sections) and trailers.

---

## 🛠 Public API Reference
* `PDFWriter.writeDocument(doc: TWDocument): Uint8Array`: Entrant method generating the compiled PDF byte stream.
* `ObjectSerializer.serialize(val: PDFValue): string`: Converts values to PDF string formatting.
* `PageSerializer.generateContentsStream(page: TWPage): Uint8Array`: Generates binary graphics instructions.
* `IncrementalWriter.appendChanges(existingPdfBytes: Uint8Array, modifiedObjectsList: any[]): Uint8Array`: Architecture stub for incremental saving.

---

## 🔄 Internal Data Pipeline Flow
```
TWDocument -> PDFWriter (indirect objects loop) -> PageSerializer (operators compilation) -> StreamWriter (Flate compression) -> XRefBuilder (byte offsets table) -> TrailerBuilder -> Compiled byte array
```
This module is self-contained and operates entirely in native TypeScript. It works on both Node.js server scripts and web browsers, facilitating clean document serialization.
