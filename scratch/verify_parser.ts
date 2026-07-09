import { jsPDF } from 'jspdf';
import { DocumentParser } from '../src/lib/tw-engine/DocumentParser';
import { ObjectRegistry } from '../src/lib/tw-engine/ObjectRegistry';
import { Matrix } from '../src/lib/tw-engine/Matrix';
import { Geometry } from '../src/lib/tw-engine/Geometry';

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

// Polyfill Promise.try for Node.js versions lacking native support
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

async function runVerification() {
  console.log('=== Starting PDF Engine Architecture Upgrade Verification ===');

  try {
    // 1. Test Matrix Utilities
    console.log('\n--- Testing Matrix Utilities ---');
    const m1 = [2, 0, 0, 2, 10, 20];
    const m2 = [1, 0, 0, 1, 5, 5];
    const multiplied = Matrix.multiply(m1, m2);
    console.log(`Matrix multiply: [${multiplied.join(', ')}]`);
    
    const inversed = Matrix.inverse(m1);
    console.log(`Matrix inverse: [${inversed.join(', ')}]`);
    
    const [tx, ty] = Matrix.transformPoint(m1, 10, 10);
    console.log(`Matrix transformPoint (10, 10): (${tx}, ${ty})`);

    if (tx !== 30 || ty !== 40) {
      throw new Error(`Matrix transformPoint failed: expected (30, 40), got (${tx}, ${ty})`);
    }
    console.log('✅ Matrix utilities passed assertions.');

    // 2. Test Geometry Utilities
    console.log('\n--- Testing Geometry Utilities ---');
    const distance = Geometry.distance({ x: 0, y: 0 }, { x: 3, y: 4 });
    console.log(`Geometry distance (0,0) to (3,4): ${distance}`);
    if (distance !== 5) {
      throw new Error(`Geometry distance failed: expected 5, got ${distance}`);
    }

    const snapped = Geometry.snap(12.3, 10, 3);
    console.log(`Geometry snap 12.3 to grid 10 (tolerance 3): ${snapped}`);
    if (snapped !== 10) {
      throw new Error(`Geometry snap failed: expected 10, got ${snapped}`);
    }
    console.log('✅ Geometry utilities passed assertions.');

    // 3. Generate a mock PDF document with diverse elements
    console.log('\n--- Generating Sample PDF ---');
    const doc = new jsPDF();
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(16);
    doc.text('ToolWala Native PDF Engine Architecture Upgrade Test', 20, 30);
    
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Testing base TWObject inheritance', 20, 45);
    
    doc.setDrawColor(255, 0, 0);
    doc.setLineWidth(2);
    doc.line(20, 60, 180, 60);

    doc.addPage();
    const base64RedPixel = 
      'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAoHBwkHBgoJCAkLCwoMDxkQDw4ODx8WFhUYFiMZGRUiIiUiHzYkHR82HR8lJyUqKy4xNTU1JS81NTA5Ozk5NTcBCwwLDw4PHxQTHzchJychNyEnJyE3Nyc3Nyc3Nyc3Nyc3Nyc3Nyc3Nyc3Nyc3Nyc3Nyc3Nyc3Nyc3Nyc3Nyc3Nyc3N//AABEIAAIABwMBIgACEQEDEQH/xAAYAAEBAQEBAAAAAAAAAAAAAAAAAgEDBAX/xAAcEAADAAIDAQAAAAAAAAAAAAAAAQIDBAUREhP/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPx8Af//Z';
    doc.addImage(base64RedPixel, 'JPEG', 20, 40, 50, 50);

    const pdfArrayBuffer = doc.output('arraybuffer');
    const pdfBytes = new Uint8Array(pdfArrayBuffer);
    console.log(`Generated PDF bytes: ${pdfBytes.length} bytes.`);

    // 4. Parse the PDF bytes
    console.log('\n--- Parsing PDF with upgraded engine ---');
    const twDoc = await DocumentParser.parseDocument(pdfBytes, 'verification_test.pdf');
    console.log(`Document ID: ${twDoc.id}`);
    console.log(`Page Count: ${twDoc.pageCount}`);

    // 5. Test Registry Caching
    console.log('\n--- Testing ObjectRegistry Singleton ---');
    const registry = ObjectRegistry.getInstance();
    const allRegisteredObjects = registry.getObjects();
    console.log(`Total objects loaded in registry: ${allRegisteredObjects.length}`);
    if (allRegisteredObjects.length === 0) {
      throw new Error('Assertion failed: Expected objects inside ObjectRegistry cache.');
    }

    // Verify TWObject base properties inheritance
    console.log('\nChecking object properties and state history...');
    allRegisteredObjects.forEach((obj, idx) => {
      console.log(`Object ${idx + 1} [Type: ${obj.type}]:`);
      console.log(`  - id: ${obj.id}`);
      console.log(`  - pageIndex: ${obj.pageIndex}, operatorIndex: ${obj.operatorIndex}, zIndex: ${obj.zIndex}`);
      console.log(`  - coordinates: (x: ${obj.x.toFixed(1)}, y: ${obj.y.toFixed(1)}, width: ${obj.width.toFixed(1)}, height: ${obj.height.toFixed(1)})`);
      console.log(`  - matrix: [${obj.transformationMatrix.join(', ')}]`);
      
      const hasStates = (obj as any).originalState !== undefined && (obj as any).currentState !== undefined;
      console.log(`  - has state histories (originalState & currentState): ${hasStates}`);
      if (!hasStates) {
        throw new Error(`Object ${obj.id} does not contain state snapshots.`);
      }
    });

    // 6. Test Dirty State tracking
    console.log('\n--- Testing Dirty State Trigger ---');
    const firstTextObj = allRegisteredObjects.find((obj) => obj.type === 'text');
    if (!firstTextObj) {
      throw new Error('Could not find text object to perform edit test.');
    }

    console.log(`Initial dirty status: ${firstTextObj.isDirty}`);
    if (firstTextObj.isDirty) {
      throw new Error('Initial dirty state should be false.');
    }

    console.log('Modifying text content in registry...');
    registry.updateObject(firstTextObj.id, {
      text: 'Modified text value',
    } as any);

    const updatedTextObj = registry.getObject(firstTextObj.id);
    console.log(`Updated dirty status: ${updatedTextObj?.isDirty}`);
    if (!updatedTextObj || !updatedTextObj.isDirty) {
      throw new Error('isDirty should flip to true upon layout or content updates.');
    }

    console.log('\nChecking dirty list output...');
    const dirtyObjects = registry.getDirtyObjects();
    console.log(`Count of dirty objects: ${dirtyObjects.length}`);
    if (dirtyObjects.length !== 1 || dirtyObjects[0].id !== firstTextObj.id) {
      throw new Error('Assertion failed: Expected exactly 1 dirty object matching edited ID.');
    }

    console.log('\nChecking font metadata parsing...');
    twDoc.pages.forEach((page) => {
      console.log(`Page ${page.pageNumber} Fonts (${page.fonts?.length || 0}):`);
      page.fonts?.forEach((f) => {
        console.log(`  - Ref: ${f.fontName} | PS Name: ${f.postscriptName} | Embedded: ${f.isEmbedded} | Subset: ${f.isSubset}`);
      });
    });

    console.log('\n✅ ALL ARCHITECTURE UPGRADE ASSERTIONS PASSED! Native PDF Engine refactoring completed successfully.');

  } catch (err) {
    console.error('❌ Verification failed with error:', err);
    process.exit(1);
  }
}

runVerification();
