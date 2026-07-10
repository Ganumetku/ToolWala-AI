import * as fs from 'fs';
import * as path from 'path';
import { PDFWriter } from '../src/lib/tw-engine/writer/PDFWriter';
import { DocumentParser } from '../src/lib/tw-engine/DocumentParser';
import { ObjectRegistry } from '../src/lib/tw-engine/ObjectRegistry';
import type { TWDocument, TWPage, TWTextObject, TWPathObject } from '../src/lib/tw-engine/types';

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

async function runWriterVerification() {
  console.log('=== Starting PDF Writer Engine Verification (Phase 5.0) ===');

  try {
    // 1. Construct a mock TWDocument in memory
    console.log('Building in-memory mock TWDocument with 2 pages...');
    
    const page1Objects: (TWTextObject | TWPathObject)[] = [
      {
        id: 'tw_text_1_0_test',
        page: 1,
        type: 'text',
        zIndex: 1,
        x: 50,
        y: 100,
        width: 200,
        height: 16,
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
        transformationMatrix: [16, 0, 0, 16, 50, 742],
        text: 'ToolWala Native PDF Writer Text on Page 1',
        fontName: 'Helvetica',
        fontSize: 16,
        fontColor: '#FF0000', // Red
        baseline: 742,
        boundingBox: { x: 50, y: 100, width: 200, height: 16 },
        originalState: {},
        currentState: {}
      } as any,
      {
        id: 'tw_path_1_1_test',
        page: 1,
        type: 'path',
        zIndex: 2,
        x: 50,
        y: 200,
        width: 100,
        height: 50,
        rotation: 0,
        opacity: 1,
        visible: true,
        locked: false,
        deleted: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        isDirty: false,
        pageIndex: 0,
        operatorIndex: 1,
        transformationMatrix: [1, 0, 0, 1, 0, 0],
        pathData: 'M 50 200 L 150 200 L 100 250 Z', // Triangle
        strokeColor: '#0000FF', // Blue
        fillColor: '#00FF00', // Green
        strokeWidth: 2,
        originalState: {},
        currentState: {}
      } as any
    ];

    const page2Objects: TWTextObject[] = [
      {
        id: 'tw_text_2_0_test',
        page: 2,
        type: 'text',
        zIndex: 1,
        x: 50,
        y: 100,
        width: 200,
        height: 16,
        rotation: 15, // Rotated text
        opacity: 1,
        visible: true,
        locked: false,
        deleted: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        isDirty: false,
        pageIndex: 1,
        operatorIndex: 0,
        transformationMatrix: [16, 0, 0, 16, 50, 742],
        text: 'Rotated Text on Page 2',
        fontName: 'Helvetica-Bold',
        fontSize: 16,
        fontColor: '#000000', // Black
        baseline: 742,
        boundingBox: { x: 50, y: 100, width: 200, height: 16 },
        originalState: {},
        currentState: {}
      } as any
    ];

    const mockDoc: TWDocument = {
      id: 'tw_doc_writer_test',
      fileName: 'writer_test.pdf',
      pageCount: 2,
      metadata: {},
      pages: [
        {
          pageNumber: 1,
          width: 595,  // A4 Width
          height: 842, // A4 Height
          objects: page1Objects
        },
        {
          pageNumber: 2,
          width: 595,
          height: 842,
          objects: page2Objects
        }
      ]
    };

    // 2. Generate PDF bytes using PDFWriter
    console.log('Generating PDF bytes...');
    const pdfBytes = PDFWriter.writeDocument(mockDoc);
    console.log(`Generated PDF byte size: ${pdfBytes.length} bytes.`);

    // 3. Write PDF to temporary test file in scratch directory
    const scratchDir = path.resolve(__dirname, 'test-runs');
    if (!fs.existsSync(scratchDir)) {
      fs.mkdirSync(scratchDir, { recursive: true });
    }
    const outputPath = path.join(scratchDir, 'writer_output.pdf');
    fs.writeFileSync(outputPath, pdfBytes);
    console.log(`Saved PDF to disk at: ${outputPath}`);

    // 4. Verify PDF structure integrity by parsing it back!
    console.log('\nParsing the generated PDF back with Ingestion Engine for integrity check...');
    ObjectRegistry.getInstance().clear(); // Reset registry cache
    
    const parsedDoc = await DocumentParser.parseDocument(pdfBytes, 'reparsed.pdf');
    console.log(`Reparsed Document Details:`);
    console.log(`  - Page Count: ${parsedDoc.pageCount}`);
    console.log(`  - Registered Objects in registry cache: ${ObjectRegistry.getInstance().getObjects().length}`);

    if (parsedDoc.pageCount !== 2) {
      throw new Error(`Reparsing failed: Expected 2 pages, got ${parsedDoc.pageCount}`);
    }

    const reparsedObjects = ObjectRegistry.getInstance().getObjects();
    if (reparsedObjects.length < 3) {
      throw new Error(`Reparsing failed: Expected at least 3 objects registered, got ${reparsedObjects.length}`);
    }

    console.log('\nVerified parsed object properties:');
    reparsedObjects.forEach((obj, idx) => {
      console.log(`  Object ${idx + 1}: ID: ${obj.id} | Page: ${obj.page} | Type: ${obj.type} | zIndex: ${obj.zIndex}`);
      if (obj.type === 'text') {
        console.log(`    - Text contents: "${(obj as any).text}"`);
      }
    });

    console.log('\n✅ ALL PDF WRITER ENGINE ASSERTIONS PASSED! Generated PDF is structurally standard and parsing-compliant.');

  } catch (err) {
    console.error('❌ Verification failed with error:', err);
    process.exit(1);
  }
}

runWriterVerification();
