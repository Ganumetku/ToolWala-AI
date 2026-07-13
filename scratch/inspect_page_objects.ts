import fs from 'fs';
import { DocumentParser } from '../src/lib/tw-engine/DocumentParser';

async function inspectObjects() {
  console.log('=== Inspecting Page Objects ===');
  try {
    const pdfPath = '/Users/technicul-akash/ToolWala-AI/scratch/test-runs/writer_output.pdf';
    const data = fs.readFileSync(pdfPath);
    
    // Parse document
    const doc = await DocumentParser.parseDocument(new Uint8Array(data), 'writer_output.pdf');
    console.log(`Document parsed successfully. Pages: ${doc.pages.length}`);

    for (let p = 0; p < doc.pages.length; p++) {
      console.log(`\n--- Page ${p + 1} ---`);
      const page = doc.pages[p];
      const texts = page.objects.filter(o => o.type === 'text');
      console.log(`Found ${texts.length} text objects:`);
      
      texts.forEach((o: any, idx) => {
        console.log(`[${idx}] text="${o.text}" | x=${o.x.toFixed(1)}, y=${o.y.toFixed(1)}, w=${o.width.toFixed(1)}, h=${o.height.toFixed(1)} | fontSize=${o.fontSize} | fontFamily="${o.fontFamily}"`);
      });
    }
  } catch (e) {
    console.error('Inspection failed:', e);
  }
}

inspectObjects();
