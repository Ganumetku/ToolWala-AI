import { ObjectRegistry } from '../src/lib/tw-engine/ObjectRegistry';
import { ChangeTracker } from '../src/lib/tw-engine/mutation/ChangeTracker';
import { MutationEngine } from '../src/lib/tw-engine/mutation/MutationEngine';
import { MutationSerializer } from '../src/lib/tw-engine/mutation/MutationSerializer';
import type { TWTextObject } from '../src/lib/tw-engine/types';

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

function runMutationVerification() {
  console.log('=== Starting PDF Object Mutation Engine Verification (Phase 5.1) ===');

  try {
    const registry = ObjectRegistry.getInstance();
    const tracker = ChangeTracker.getInstance();
    const engine = MutationEngine.getInstance();

    // Reset all instances
    registry.clear();
    engine.clear();
    tracker.stopTracking();

    // 1. Register a mock text object
    console.log('Registering a mock Text object...');
    const testObjId = 'tw_text_1_0_mut_test';
    const testObj: TWTextObject = {
      id: testObjId,
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
      text: 'Original Text',
      fontName: 'Helvetica',
      fontSize: 14,
      fontColor: '#000000',
      baseline: 130,
      boundingBox: { x: 100, y: 150, width: 200, height: 20 },
      originalState: {},
      currentState: {}
    } as any;

    registry.registerObject(testObj);

    // 2. Start change tracking and connect it to MutationEngine
    console.log('Enabling ChangeTracker hooks...');
    tracker.startTracking((mut) => {
      console.log(`  -> Tracker intercepted update: [${mut.type}] on Object: ${mut.objectId}`);
      engine.applyMutation(mut);
    });

    // 3. Test: Move mutation
    console.log('\nExecuting coordinates Move update...');
    registry.updateObject(testObjId, { x: 120, y: 160 });
    
    let history = engine.getHistory().getTimeline();
    if (history.length !== 1 || history[0].type !== 'Move') {
      throw new Error(`Move tracking failed: Expected 1 Move mutation, got ${history.length} items`);
    }
    console.log(`  - Active x/y state in registry: x=${testObj.x}, y=${testObj.y}`);

    // 4. Test: Resize mutation with boundaries validation
    console.log('\nExecuting Resize update...');
    registry.updateObject(testObjId, { width: 250, height: 30 });
    
    history = engine.getHistory().getTimeline();
    if (history.length !== 2 || history[1].type !== 'Resize') {
      throw new Error(`Resize tracking failed: Expected 2 mutations, got ${history.length}`);
    }

    console.log('Executing Invalid Resize update (negative width)...');
    // Save current width to assert rollback validation bypasses registry assignment
    const prevWidth = testObj.width;
    
    // Create an invalid mutation directly to assert validator rejection
    const invalidMut = {
      id: 'invalid_mut_1',
      type: 'Resize' as const,
      objectId: testObjId,
      page: 1,
      timestamp: Date.now(),
      beforeState: { width: prevWidth, height: testObj.height },
      afterState: { width: -50, height: testObj.height }
    };
    
    const wasApplied = engine.applyMutation(invalidMut);
    if (wasApplied) {
      throw new Error('Validation failed: Rejected negative dimension mutation should return false');
    }
    console.log('  - Validations successfully rejected negative width.');

    // 5. Test: Undo / Redo Rollbacks
    console.log('\nExecuting Undo rollbacks...');
    const undoneMut = engine.undo();
    if (!undoneMut) {
      throw new Error('Undo failed: no mutation was rolled back');
    }
    console.log(`  - Rolled back: [${undoneMut.type}] on object ${undoneMut.objectId}`);
    console.log(`  - Current width in registry after Undo: ${testObj.width} (expected: 200)`);
    if ((testObj.width as number) !== 200) {
      throw new Error(`Undo failed: expected width to revert to 200, got ${testObj.width}`);
    }

    console.log('Executing Redo replay...');
    const redoneMut = engine.redo();
    if (!redoneMut) {
      throw new Error('Redo failed: no mutation was replayed');
    }
    console.log(`  - Replayed: [${redoneMut.type}] on object ${redoneMut.objectId}`);
    console.log(`  - Current width in registry after Redo: ${testObj.width} (expected: 250)`);
    if ((testObj.width as number) !== 250) {
      throw new Error(`Redo failed: expected width to restore to 250, got ${testObj.width}`);
    }

    // 6. Test: Mutation Merger (Typing Hello Hello Sequential merges)
    console.log('\nExecuting typing updates (sequential merging)...');
    engine.clear(); // Reset timeline
    
    const now = Date.now();
    // Simulate typing "H", "He", "Hel", "Hell", "Hello" sequentially within threshold
    const typingSteps = ['H', 'He', 'Hel', 'Hell', 'Hello'];
    typingSteps.forEach((txt, idx) => {
      const stepBefore = { text: idx === 0 ? 'Original Text' : typingSteps[idx - 1] };
      const stepAfter = { text: txt };
      
      const stepMut = {
        id: 'typing_test_mut',
        type: 'TextReplace' as const,
        objectId: testObjId,
        page: 1,
        timestamp: now + idx * 200, // 200ms increments (within 1500ms threshold)
        beforeState: stepBefore,
        afterState: stepAfter
      };
      
      engine.applyMutation(stepMut);
    });

    const finalHistory = engine.getHistory().getTimeline();
    console.log(`  - Total mutations remaining after typing merging: ${finalHistory.length} (expected: 1)`);
    if (finalHistory.length !== 1) {
      throw new Error(`Mutation Merger failed: Expected 1 merged mutation, got ${finalHistory.length}`);
    }
    console.log(`  - Merged mutation final text state: "${finalHistory[0].afterState.text}"`);
    if (finalHistory[0].afterState.text !== 'Hello') {
      throw new Error(`Merger state error: Expected text 'Hello', got '${finalHistory[0].afterState.text}'`);
    }

    // 7. Test: Mutation Serialization and States Consolidation
    console.log('\nTesting serialization and state consolidations...');
    const serializedJSON = MutationSerializer.serialize(finalHistory);
    console.log(`  - Serialized mutations string width: ${serializedJSON.length} characters.`);
    
    const deserialized = MutationSerializer.deserialize(serializedJSON);
    if (deserialized.length !== 1 || deserialized[0].afterState.text !== 'Hello') {
      throw new Error('Serializer failed: deserialized arrays values mismatch');
    }

    const consolidatedMap = MutationSerializer.consolidateStates(finalHistory);
    console.log(`  - Consolidated states map count: ${consolidatedMap.size}`);
    console.log(`  - Final consolidated text: "${consolidatedMap.get(testObjId).text}"`);
    if (consolidatedMap.get(testObjId).text !== 'Hello') {
      throw new Error('Consolidation failed: incorrect text state resolved');
    }

    tracker.stopTracking();
    console.log('\n✅ ALL NATIVE OBJECT MUTATION ENGINE ASSERTIONS PASSED! Change tracking, rollbacks, and mergers are fully operational.');

  } catch (err) {
    console.error('❌ Verification failed with error:', err);
    process.exit(1);
  }
}

runMutationVerification();
