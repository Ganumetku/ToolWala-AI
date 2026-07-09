# Parser Module

The Ingestion Parser translates raw PDF bytes into the internal model trees used by the ToolWala engines.

---

## 📋 Responsibilities
* Load documents dynamically using configured PDF.js workers.
* Traverse page collections and parse individual content streams.
* Extract objects (text runs, images, vectors, annotations, metadata) and assign sequential drawing-order indices.

---

## 🛠 Public API Reference
* `DocumentParser.parseDocument(pdfBytes: Uint8Array, fileName: string): Promise<TWDocument>`: Main ingestion entry point.
* `PageParser.parsePage(pdfPage: any, pageIndex: number): Promise<TWPage>`: Segment page operator stream elements.

---

## 🔄 Internal Pipeline Flow
```
PDF bytes -> DocumentParser -> PageParser -> Ingestion sub-parsers -> TWPage models
```
1. `DocumentParser` loads PDF bytes and queries page collections.
2. `PageParser` iterates page operators parallelly.
3. Sub-parsers (`TextParser`, `ImageParser`, `VectorParser`, `AnnotationParser`, `FontParser`) extract parameters.
4. Items sort by operator indices and bind to `TWPage` models.
