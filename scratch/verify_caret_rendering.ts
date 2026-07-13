import { chromium } from '@playwright/test';

async function runCaretVerification() {
  console.log('=== Caret and Keyboard Navigation Audit ===');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));

  try {
    await page.goto('http://localhost:3000/tools/pdf-tools/edit-pdf/', { waitUntil: 'networkidle' });

    const pdfPath = '/Users/technicul-akash/ToolWala-AI/scratch/test-runs/writer_output.pdf';
    console.log(`Uploading ${pdfPath}...`);
    await page.setInputFiles('input[type="file"]', pdfPath);
    await page.waitForTimeout(5000);

    // Click 'Edit Text' tool
    await page.click('button:has-text("Edit Text")');
    await page.waitForTimeout(500);

    // Double click the rotated text on page 2 to select and enter editing
    // The canvas is on page 2. Let's find the canvas container or find the text.
    // Let's execute in the browser to start session on the object:
    const result = await page.evaluate(async () => {
      const canvas = (window as any).fabricCanvas;
      if (!canvas) return { error: 'Fabric Canvas not found' };

      const obj = canvas.getObjects().find((o: any) => o.isOriginalText);
      if (!obj) return { error: 'No text object found' };

      // Make it active
      canvas.setActiveObject(obj);
      canvas.requestRenderAll();
      
      // Simulate double click to edit
      const selectionEngine = (window as any).SelectionEngine || (await import('@/lib/tw-engine/editor/SelectionEngine')).SelectionEngine.getInstance();
      const EditingSession = (window as any).EditingSession || (await import('@/lib/tw-engine/editing/EditingSession')).EditingSession.getInstance();
      
      selectionEngine.select(obj.id, 1);
      
      // Let's get the local coordinates
      const layout = obj._cachedLayout || new (await import('@/lib/tw-engine/text/TextLayout')).TextLayout(obj.text, obj.fontFamily, obj.fontSize);
      selectionEngine.handleSingleClick(0, 0, layout);
      
      EditingSession.startSession(obj.id, 1, obj.text);
      
      return {
        text: EditingSession.getText(),
        caretIndex: EditingSession.getCaretIndex(),
        isEditingText: selectionEngine.getIsEditingText(),
        activeObjectId: EditingSession.getActiveObjectId()
      };
    });

    console.log('Session started:', result);

    // Now press ArrowLeft in the browser 5 times
    console.log('Pressing ArrowLeft...');
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('ArrowLeft');

    // Get selection state again
    const stateAfterLeft = await page.evaluate(() => {
      const EditingSession = (window as any).EditingSession || (globalThis as any).EditingSession;
      const session = EditingSession.getInstance();
      return {
        text: session.getText(),
        caretIndex: session.getCaretIndex(),
        selectionStart: session.getSelectionStart(),
        selectionEnd: session.getSelectionEnd()
      };
    });

    console.log('State after left arrows:', stateAfterLeft);

  } catch (error) {
    console.error('Error during caret verification:', error);
  } finally {
    await browser.close();
  }
}

runCaretVerification();
