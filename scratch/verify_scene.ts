import { jsPDF } from 'jspdf';
import { DocumentParser } from '../src/lib/tw-engine/DocumentParser';
import { Scene } from '../src/lib/tw-engine/render/Scene';
import { RenderGraph } from '../src/lib/tw-engine/render/RenderGraph';
import { CullingManager } from '../src/lib/tw-engine/render/CullingManager';
import { DirtyRegionManager } from '../src/lib/tw-engine/render/DirtyRegionManager';
import { RenderScheduler } from '../src/lib/tw-engine/render/RenderScheduler';
import { SceneNode } from '../src/lib/tw-engine/render/SceneNode';

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

async function runSceneVerification() {
  console.log('=== Starting PDF Render Graph & Scene Engine Verification (Phase 4.3) ===');

  try {
    // 1. Generate test PDF
    console.log('Generating sample PDF...');
    const doc = new jsPDF();
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(16);
    doc.text('ToolWala Scene Graph Ingestion Box', 20, 30);
    doc.addPage();
    doc.text('Page 2 Content Node', 20, 30);

    const pdfArrayBuffer = doc.output('arraybuffer');
    const pdfBytes = new Uint8Array(pdfArrayBuffer);

    // 2. Parse PDF Document
    console.log('Parsing PDF...');
    const twDoc = await DocumentParser.parseDocument(pdfBytes, 'scene_test.pdf');

    // 3. Initialize Scene Graph Tree
    console.log('\n--- Testing Scene Graph Tree Initialization ---');
    const scene = new Scene();
    scene.initializeFromDocument(twDoc);
    
    // Check root node and pages children count
    console.log(`Root Node ID: ${scene.rootNode.id}`);
    console.log(`Pages count registered in root node: ${scene.rootNode.children.length}`);
    if (scene.rootNode.children.length !== 2) {
      throw new Error(`Scene initialization failed: expected 2 page nodes, got ${scene.rootNode.children.length}`);
    }

    // Verify Page 1 Layer Container mappings
    const layers = scene.getLayersForPage(1)!;
    console.log('Page 1 Layers created successfully:');
    console.log(`  - pdf: ${layers.pdf.id} (zIndex: ${layers.pdf.zIndex})`);
    console.log(`  - annotation: ${layers.annotation.id} (zIndex: ${layers.annotation.zIndex})`);
    console.log(`  - selection: ${layers.selection.id} (zIndex: ${layers.selection.zIndex})`);
    
    if (layers.pdf.zIndex !== 10 || layers.selection.zIndex !== 30) {
      throw new Error('LayerManager error: Layer container zIndex mapping mismatch.');
    }

    // 4. Viewport Scroll Boundaries and Visible Pages Calculation
    console.log('\n--- Testing Viewport visible page checks ---');
    scene.viewport.setCanvasSize(800, 600);
    // Scroll viewport to y=0
    scene.viewport.scrollTo(0, 0);
    scene.viewport.updateVisiblePages([
      { pageNumber: 1, x: 0, y: 0, width: 595, height: 842 },
      { pageNumber: 2, x: 0, y: 862, width: 595, height: 842 } // 20px gap
    ]);
    console.log(`Visible pages at scroll Y=0: [${scene.viewport.visiblePages.join(', ')}]`);
    if (scene.viewport.visiblePages.length !== 1 || (scene.viewport.visiblePages[0] as number) !== 1) {
      throw new Error(`Viewport error: expected page 1 to be visible, got [${scene.viewport.visiblePages.join(', ')}]`);
    }

    // Scroll viewport down to page 2 (y=900)
    scene.viewport.scrollTo(0, 900);
    scene.viewport.updateVisiblePages([
      { pageNumber: 1, x: 0, y: 0, width: 595, height: 842 },
      { pageNumber: 2, x: 0, y: 862, width: 595, height: 842 }
    ]);
    console.log(`Visible pages at scroll Y=900: [${scene.viewport.visiblePages.join(', ')}]`);
    if (scene.viewport.visiblePages.length !== 1 || (scene.viewport.visiblePages[0] as number) !== 2) {
      throw new Error(`Viewport error: expected page 2 to be visible, got [${scene.viewport.visiblePages.join(', ')}]`);
    }
    console.log('✅ Viewport visible pages checks passed.');

    // 5. Culling checks
    console.log('\n--- Testing CullingManager ---');
    const offscreenNode = new SceneNode('test_culling_node', 1);
    offscreenNode.bounds = { x: 1000, y: 1000, width: 100, height: 100 };
    offscreenNode.updateMatrices();
    
    const viewportBounds = { x: 0, y: 0, width: 800, height: 600 };
    const shouldCull = CullingManager.shouldCull(offscreenNode, viewportBounds);
    console.log(`Should cull node at (1000, 1000) for viewport (800x600): ${shouldCull}`);
    if (!shouldCull) {
      throw new Error('CullingManager error: offscreen node was not culled.');
    }
    console.log('✅ Culling checks passed.');

    // 6. DirtyRegion clipping bounds merging
    console.log('\n--- Testing DirtyRegionManager bounds ---');
    const dirtyManager = new DirtyRegionManager();
    dirtyManager.addDirtyRegion({ x: 10, y: 20, width: 50, height: 50 });
    dirtyManager.addDirtyRegion({ x: 40, y: 50, width: 40, height: 40 });
    
    const combined = dirtyManager.getCombinedBounds()!;
    console.log(`Combined dirty region box: x=${combined.x}, y=${combined.y}, w=${combined.width}, h=${combined.height}`);
    if (combined.x !== 10 || combined.y !== 20 || combined.width !== 70 || combined.height !== 70) {
      throw new Error(`DirtyRegionManager error: expected (10, 20, 70, 70), got (${combined.x}, ${combined.y}, ${combined.width}, ${combined.height})`);
    }
    console.log('✅ DirtyRegionManager bounds passed.');

    // 7. Camera translations and ViewMatrix compilation
    console.log('\n--- Testing Camera getViewMatrix ---');
    const camera = scene.camera;
    camera.translate(100, 150);
    camera.scale(1.5);
    camera.rotate(90);
    const viewMatrix = camera.getViewMatrix();
    console.log(`View Transformation Matrix: [${viewMatrix.join(', ')}]`);
    if (viewMatrix[0].toFixed(2) !== '0.00' || viewMatrix[4] !== 100 || viewMatrix[5] !== 150) {
      throw new Error('Camera matrix error: translation coordinates or scales are incorrect.');
    }
    console.log('✅ Camera matrix calculations passed.');

    // 8. RenderGraph compilation sorted queue
    console.log('\n--- Testing RenderGraph CompileRenderQueue ---');
    // Scroll viewport to y=0 to cull page 2
    scene.viewport.scrollTo(0, 0);
    scene.viewport.setCanvasSize(800, 600);
    scene.camera.x = 0;
    scene.camera.y = 0;
    scene.camera.zoom = 1.0;
    scene.camera.rotation = 0;

    const renderQueue = RenderGraph.compileRenderQueue(scene.rootNode, scene.camera, scene.viewport);
    console.log(`Compiled Render Queue tasks count: ${renderQueue.length}`);
    if (renderQueue.length === 0) {
      throw new Error('RenderGraph error: compiled empty queue.');
    }
    
    // Output node execution draw order
    renderQueue.forEach((node, idx) => {
      console.log(`  Render Node ${idx + 1}: ${node.id} | Page: ${node.page} | zIndex: ${node.zIndex}`);
    });
    
    // Assert page 2 objects are culled
    const hasPage2 = renderQueue.some(n => n.page === 2);
    console.log(`  Queue contains elements belonging to page 2: ${hasPage2}`);
    if (hasPage2) {
      throw new Error('Culling/RenderGraph error: page 2 elements should have been culled out of viewport bounds.');
    }
    console.log('✅ RenderGraph compilation sorted queue passed.');

    // 9. Scheduler batch paint loop
    console.log('\n--- Testing RenderScheduler Frame Batching ---');
    let paintCount = 0;
    const scheduler = new RenderScheduler(() => {
      paintCount++;
    });

    scheduler.requestRender();
    scheduler.requestRender();
    scheduler.requestRender();
    console.log(`Initial paint execution count: ${paintCount} (expected 0 due to frame throttling)`);
    
    // Wait for the scheduled animation frame/timeout to process
    await new Promise(resolve => setTimeout(resolve, 50));
    console.log(`Final paint execution count after frame resolve: ${paintCount} (expected exactly 1)`);
    if (paintCount !== 1) {
      throw new Error(`RenderScheduler error: paint operations were not batched correctly, executed ${paintCount} times.`);
    }
    console.log('✅ RenderScheduler batching passed.');

    console.log('\n✅ ALL SCENE GRAPH & RENDER ENGINE UPGRADE ASSERTIONS PASSED!');

  } catch (err) {
    console.error('❌ Verification failed with error:', err);
    process.exit(1);
  }
}

runSceneVerification();
