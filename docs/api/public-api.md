# Public API Reference

This document maps public entrant APIs and main integration methods for developers using the ToolWala PDF SDK.

---

## Ingest Document Ingest
Loads and parses document arrays:
```typescript
import { DocumentParser } from '@/lib/tw-engine/DocumentParser';

const pdfBytes = new Uint8Array(fileBuffer);
const document = await DocumentParser.parseDocument(pdfBytes, 'proposal.pdf');
```

---

## Update Object Layouts
Registers and mutates layouts through the registry:
```typescript
import { ObjectRegistry } from '@/lib/tw-engine/ObjectRegistry';

const registry = ObjectRegistry.getInstance();
registry.updateObject('tw_text_1_0_123', {
  x: 100,
  y: 150,
  rotation: 45
});
```

---

## Render Scene Tree Graph
Traverses layout nodes and repaints on 2D context canvas:
```typescript
import { Scene } from '@/lib/tw-engine/render/Scene';
import { RenderGraph } from '@/lib/tw-engine/render/RenderGraph';
import { RenderEngine } from '@/lib/tw-engine/editor/RenderEngine';

const scene = new Scene();
scene.initializeFromDocument(document);

const renderQueue = RenderGraph.compileRenderQueue(scene.rootNode, scene.camera, scene.viewport);
const renderer = new RenderEngine();

// Draw page 1
renderer.render(canvasContext, 1);
```

---

## Typeset & Selection Clicks
Typesets paragraph lines and maps clicks:
```typescript
import { TextLayout } from '@/lib/tw-engine/text/TextLayout';
import { CaretEngine } from '@/lib/tw-engine/text/CaretEngine';

const layout = new TextLayout('Editable Typeset Box', 'Helvetica', 12);
const caret = new CaretEngine();

const caretIndex = caret.clickToCaretIndex(50, 8, layout);
```
