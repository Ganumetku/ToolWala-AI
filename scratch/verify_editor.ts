import { jsPDF } from 'jspdf';
import { DocumentParser } from '../src/lib/tw-engine/DocumentParser';
import { ObjectRegistry } from '../src/lib/tw-engine/ObjectRegistry';
import { SelectionEngine } from '../src/lib/tw-engine/editor/SelectionEngine';
import { HitTest } from '../src/lib/tw-engine/editor/HitTest';
import { TransformController } from '../src/lib/tw-engine/editor/TransformController';
import { RenderEngine } from '../src/lib/tw-engine/editor/RenderEngine';
import { BoundingBox } from '../src/lib/tw-engine/editor/BoundingBox';

// Polyfill DOMMatrix for Node.js test environment compatibility
if (typeof (globalThis as any).DOMMatrix === 'undefined') {
  (globalThis as any).DOMMatrix = class DOMMatrix {
    a = 1; b = 0; c = 0; d = 1; e = 0; f = 0;
    constructor(init?: number[]) {
      if (Array.isArray(init) && init.length >= 6) {
        this.a = init[0];
        this.b = init[1];
        this.c = init[2];
        this.d = init[3];
        this.e = init[4];
        this.f = init[5];
      }
    }
  } as any;
}

// Polyfill Promise.try for Node.js compatibility
if (typeof (Promise as any).try === 'undefined') {
  (Promise as any).try = function (fn: any, ...args: any[]) {
    return new Promise((resolve, reject) => {
      try {
        resolve(fn(...args));
      } catch (err) {
        reject(err);
      }
    });
  };
}

// Polyfill Path2D for Node.js hit-test compatibility
if (typeof (globalThis as any).Path2D === 'undefined') {
  (globalThis as any).Path2D = class Path2D {
    pathData: string;
    constructor(data?: string) {
      this.pathData = data || '';
    }
  } as any;
}

// Mock Canvas Context to record drawing actions during Node execution
class MockCanvasRenderingContext2D {
  actions: string[] = [];
  globalAlpha = 1.0;
  fillStyle = '';
  strokeStyle = '';
  lineWidth = 1;
  font = '';

  save() { this.actions.push('save'); }
  restore() { this.actions.push('restore'); }
  translate(x: number, y: number) { this.actions.push(`translate(${x.toFixed(1)}, ${y.toFixed(1)})`); }
  rotate(angle: number) { this.actions.push(`rotate(${angle.toFixed(2)})`); }
  scale(sx: number, sy: number) { this.actions.push(`scale(${sx.toFixed(1)}, ${sy.toFixed(1)})`); }
  strokeRect(x: number, y: number, w: number, h: number) { this.actions.push(`strokeRect(${x},${y},${w},${h})`); }
  fillRect(x: number, y: number, w: number, h: number) { this.actions.push(`fillRect(${x},${y},${w},${h})`); }
  fillText(text: string, x: number, y: number) { this.actions.push(`fillText("${text}",${x},${y})`); }
  stroke() { this.actions.push('stroke'); }
  fill() { this.actions.push('fill'); }
  beginPath() { this.actions.push('beginPath'); }
  moveTo(x: number, y: number) { this.actions.push(`moveTo(${x},${y})`); }
  lineTo(x: number, y: number) { this.actions.push(`lineTo(${x},${y})`); }
  arc(x: number, y: number, r: number, s: number, e: number) { this.actions.push(`arc(${x},${y},${r})`); }
  setLineDash(dash: number[]) { this.actions.push(`setLineDash([${dash.join(',')}])`); }
  isPointInPath(path: any, x: number, y: number) {
    this.actions.push(`isPointInPath(${x}, ${y})`);
    return true; // Default hit for testing
  }
}

async function runEditorVerification() {
  console.log('=== Starting PDF Editor Engine Verification (Phase 4.2) ===');

  try {
    // 1. Generate test PDF document
    console.log('Generating sample PDF...');
    const doc = new jsPDF();
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(16);
    doc.text('ToolWala Selection Engine Test Box', 20, 30); // Top text object
    doc.text('Second Line Text Object', 20, 50); // Lower text object

    const pdfArrayBuffer = doc.output('arraybuffer');
    const pdfBytes = new Uint8Array(pdfArrayBuffer);

    // 2. Ingest and parse PDF
    console.log('Ingesting and parsing PDF...');
    const twDoc = await DocumentParser.parseDocument(pdfBytes, 'editor_test.pdf');
    const registry = ObjectRegistry.getInstance();
    const allObjects = registry.getObjects();
    console.log(`Successfully registered ${allObjects.length} objects.`);

    // 3. Selection and Top-to-Bottom Hit Testing
    console.log('\n--- Testing Hit Test and Selection ---');
    const selector = new SelectionEngine();
    
    // Print registered objects for diagnostics
    allObjects.forEach((o) => {
      console.log(`Diagnostic Obj ID: ${o.id} | Page: ${o.page} | Bounds: x=${o.x.toFixed(1)}, y=${o.y.toFixed(1)}, w=${o.width.toFixed(1)}, h=${o.height.toFixed(1)}`);
    });

    // Attempt hit check at coordinates matching the second text object (y=130 lies inside y=125.7 to y=141.7)
    const hitCoords = { x: 60, y: 130 }; // Maps close to second text object
    allObjects.forEach((o) => {
      const hit = HitTest.hitTest(o, hitCoords.x, hitCoords.y);
      console.log(`Hit test for ${o.id}: ${hit}`);
    });
    const hitObj = selector.handlePointerDown(hitCoords.x, hitCoords.y, 1);
    
    if (!hitObj) {
      throw new Error(`Hit testing failed: Expected to select topmost text run at (${hitCoords.x}, ${hitCoords.y}).`);
    }
    
    console.log(`✅ Click at (${hitCoords.x}, ${hitCoords.y}) successfully selected object:`);
    console.log(`  - Type: ${hitObj.type}`);
    console.log(`  - Selected ID: ${selector.getSelectedObjectId()}`);
    console.log(`  - Persistent Object text content: "${(hitObj as any).text}"`);
    
    if (selector.getSelectedObjectId() !== hitObj.id) {
      throw new Error('Selection persistence error: Selected ID does not match hit object ID.');
    }

    // 4. Transformations and State Mutation Rules
    console.log('\n--- Testing Transformations (Move, Scale, Rotate) ---');
    const controller = new TransformController();
    
    // Start body dragging translation
    console.log('Starting Body Move Transform...');
    const startX = hitObj.x;
    const startY = hitObj.y;
    controller.startTransform(hitObj, hitCoords.x, hitCoords.y);
    
    // Drag by dx=25, dy=-15
    controller.updateTransform(hitCoords.x + 25, hitCoords.y - 15);
    controller.stopTransform();

    const movedObj = registry.getObject(hitObj.id)!;
    console.log(`  - Original X/Y: (${startX.toFixed(1)}, ${startY.toFixed(1)})`);
    console.log(`  - Current X/Y: (${movedObj.x.toFixed(1)}, ${movedObj.y.toFixed(1)})`);
    console.log(`  - isDirty Status: ${movedObj.isDirty}`);

    if (movedObj.x !== startX + 25 || movedObj.y !== startY - 15) {
      throw new Error(`Move calculation error: coordinates expected (${startX + 25}, ${startY - 15}), got (${movedObj.x}, ${movedObj.y}).`);
    }
    if (!movedObj.isDirty) {
      throw new Error('State rule violation: Object should be marked isDirty = true.');
    }
    if (movedObj.originalState.x !== startX) {
      throw new Error('State rule violation: originalState must remain locked/unmodified.');
    }
    console.log('✅ Move transformations verify correctly.');

    // Start rotation translation
    console.log('Starting Rotation Transform...');
    const rotX = movedObj.x + movedObj.width / 2;
    const rotY = movedObj.y - 25; // rotation handle center
    controller.startTransform(movedObj, rotX, rotY);
    
    // Drag cursor right to perform ~90 degree rotation
    controller.updateTransform(rotX + 50, rotY + 25);
    controller.stopTransform();
    
    const rotatedObj = registry.getObject(hitObj.id)!;
    console.log(`  - Current Rotation: ${rotatedObj.rotation.toFixed(1)}°`);
    if (rotatedObj.rotation === 0) {
      throw new Error('Rotation calculation error: expected rotation to change.');
    }
    console.log('✅ Rotation transformation verifies correctly.');

    // 5. Render Engine Loop Drawing Validation
    console.log('\n--- Testing Render Loop and BoundingBox Helpers ---');
    const mockCtx = new MockCanvasRenderingContext2D();
    const renderer = new RenderEngine();
    
    // Render page 1
    renderer.render(mockCtx as any, 1);
    console.log(`Total render actions executed on canvas: ${mockCtx.actions.length}`);
    if (mockCtx.actions.length === 0) {
      throw new Error('Assertion failed: RenderEngine did not execute canvas commands.');
    }

    // Render bounding box visual handles
    const helperCtx = new MockCanvasRenderingContext2D();
    BoundingBox.render(helperCtx as any, rotatedObj);
    console.log(`Total bounding box layout actions executed on canvas: ${helperCtx.actions.length}`);
    
    // Verify outline rect and handles were drawn
    const hasStrokeRect = helperCtx.actions.some(act => act.startsWith('strokeRect'));
    const hasArc = helperCtx.actions.some(act => act.startsWith('arc'));
    const hasFillRectCount = helperCtx.actions.filter(act => act.startsWith('fillRect')).length;
    
    console.log(`  - Contains outline strokeRect: ${hasStrokeRect}`);
    console.log(`  - Contains rotation arc handle: ${hasArc}`);
    console.log(`  - Total resize handle squares filled: ${hasFillRectCount}`);

    if (!hasStrokeRect || !hasArc || hasFillRectCount !== 8) {
      throw new Error('BoundingBox rendering validation failed: Missing outline, rotation node, or resize handles.');
    }
    console.log('✅ BoundingBox helpers verify correctly.');

    console.log('\n✅ ALL SELECTION ENGINE ASSERTIONS PASSED! Native Object Selection Engine refactoring completed successfully.');

  } catch (err) {
    console.error('❌ Verification failed with error:', err);
    process.exit(1);
  }
}

runEditorVerification();
