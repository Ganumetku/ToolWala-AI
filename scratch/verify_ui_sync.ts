import { ObjectRegistry } from '../src/lib/tw-engine/ObjectRegistry';
import { MutationEngine } from '../src/lib/tw-engine/mutation/MutationEngine';
import { EditorEvents } from '../src/lib/tw-engine/ui/EditorEvents';
import { UIStateBridge } from '../src/lib/tw-engine/ui/UIStateBridge';
import { ViewportSync } from '../src/lib/tw-engine/ui/ViewportSync';
import { SelectionSync } from '../src/lib/tw-engine/ui/SelectionSync';
import { InteractionController } from '../src/lib/tw-engine/ui/InteractionController';
import { RenderAdapter, Renderer } from '../src/lib/tw-engine/ui/RenderAdapter';
import { CanvasSyncManager } from '../src/lib/tw-engine/ui/CanvasSyncManager';
import { UIStateValidator } from '../src/lib/tw-engine/ui/UIStateValidator';
import type { TWObject } from '../src/lib/tw-engine/types';

// Polyfill DOMMatrix for Node test compatibility
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

// Mock Canvas class
class MockHTMLCanvasElement {
  id = 'mock-canvas-1';
}

// Mock Renderer implementation
class MockRenderer implements Renderer {
  lastRenderPageNum: number | null = null;
  lastRenderZoom: number | null = null;
  renderCallCount = 0;

  async renderPage(pageNum: number, _canvasElement: HTMLCanvasElement, zoom: number): Promise<void> {
    this.lastRenderPageNum = pageNum;
    this.lastRenderZoom = zoom;
    this.renderCallCount++;
  }

  updateObject(_id: string, _properties: any): void {}
}

function runUiSyncVerification() {
  console.log('=== Starting UI Synchronization Layer Verification (Phase 5.2) ===');

  try {
    const registry = ObjectRegistry.getInstance();
    const engine = MutationEngine.getInstance();
    const eventSys = EditorEvents.getInstance();
    const viewport = ViewportSync.getInstance();
    const selection = SelectionSync.getInstance();
    const syncManager = CanvasSyncManager.getInstance();

    registry.clear();
    engine.clear();
    viewport.setZoom(1.0);
    selection.deselect();

    // 1. Register a mock object
    const objId = 'tw_obj_sync_test';
    const testObj: TWObject = {
      id: objId,
      page: 1,
      type: 'text',
      zIndex: 1,
      x: 100,
      y: 150,
      width: 200,
      height: 20,
      rotation: 0,
      opacity: 1,
      visible: true,
      locked: false,
      deleted: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isDirty: false,
      pageIndex: 0,
      operatorIndex: 0,
      transformationMatrix: [1, 0, 0, 1, 100, 150],
      originalState: { x: 100, y: 150 },
      currentState: { x: 100, y: 150 }
    } as any;

    registry.registerObject(testObj);

    // 2. Setup mock canvas and mock renderer
    const mockCanvas = new MockHTMLCanvasElement() as any as HTMLCanvasElement;
    const mockRenderer = new MockRenderer();
    RenderAdapter.setRenderer(mockRenderer);

    console.log('Registering mock canvas with CanvasSyncManager...');
    syncManager.registerCanvas(1, mockCanvas);

    // Verify initial auto-repaint upon registration
    if ((mockRenderer.renderCallCount as number) !== 1) {
      throw new Error(`Repaint check failed: Expected 1 repaint on registration, got ${mockRenderer.renderCallCount}`);
    }

    // 3. Test: Coordinates Move interaction
    console.log('\nSimulating user Move interaction via InteractionController...');
    let eventReceived = false;
    const unsub = eventSys.subscribe('ObjectMoved', (payload) => {
      console.log(`  - Event received: ObjectMoved payload:`, payload);
      eventReceived = true;
    });

    InteractionController.handleMove(objId, 1, 120, 180);
    unsub();

    if (!eventReceived) {
      throw new Error('Event failure: ObjectMoved event was not dispatched');
    }
    if ((testObj.x as number) !== 120 || (testObj.y as number) !== 180) {
      throw new Error(`Move update failed: Expected x=120 y=180 in registry, got x=${testObj.x} y=${testObj.y}`);
    }

    // Repaint check: Moving object updates registry, which broadcasts changes and triggers repaint automatically!
    if ((mockRenderer.renderCallCount as number) !== 2) {
      throw new Error(`Repaint check failed: Expected 2 total repaints after object update, got ${mockRenderer.renderCallCount}`);
    }
    console.log('  - Registry changes successfully scheduled repaint through RenderAdapter.');

    // 4. Test: History Undo rollbacks without canvas serialization
    console.log('\nTesting Undo rollback through MutationEngine...');
    const undone = engine.undo();
    if (!undone || undone.objectId !== objId) {
      throw new Error('Undo failed: no mutation rollback logged');
    }
    console.log(`  - Reverted coordinate after Undo: x=${testObj.x}, y=${testObj.y} (expected: 100, 150)`);
    if ((testObj.x as number) !== 100 || (testObj.y as number) !== 150) {
      throw new Error('Undo value mismatch');
    }
    // Undo registry update should trigger another repaint!
    if ((mockRenderer.renderCallCount as number) !== 3) {
      throw new Error(`Repaint check failed: Expected 3 repaints after Undo, got ${mockRenderer.renderCallCount}`);
    }
    console.log('  - Undo successfully triggered repaint.');

    // 5. Test: Selection and Zoom synchronization
    console.log('\nTesting Selection and Viewport zoom sync...');
    let selectionEventCount = 0;
    eventSys.subscribe('SelectionChanged', (payload) => {
      console.log(`  - Selection sync callback received: selectedId=${payload.id}`);
      selectionEventCount++;
    });

    selection.select(objId, 1);
    if (selection.getSelectedId() !== objId) {
      throw new Error('Selection sync failed');
    }

    let zoomEventCount = 0;
    eventSys.subscribe('ZoomChanged', (payload) => {
      console.log(`  - Zoom sync callback received: zoom=${payload.zoom}`);
      zoomEventCount++;
    });

    viewport.setZoom(1.5);
    if (viewport.getZoom() !== 1.5) {
      throw new Error('Viewport zoom sync failed');
    }

    if (selectionEventCount !== 1 || zoomEventCount !== 1) {
      throw new Error('Events check failed: selection/zoom callbacks mismatch');
    }

    // 6. Test: UI State validation
    console.log('\nTesting UIStateValidator...');
    const isValid = UIStateValidator.validate(1, [objId]);
    if (!isValid) {
      throw new Error('Validation failed: Expected state to be synchronized');
    }
    console.log('  - State validator confirms UI alignment.');

    syncManager.unregisterCanvas(1);
    console.log('\n✅ ALL NATIVE UI SYNCHRONIZATION LAYER ASSERTIONS PASSED! Decoupled state management verified.');

  } catch (err) {
    console.error('❌ Verification failed with error:', err);
    process.exit(1);
  }
}

runUiSyncVerification();
