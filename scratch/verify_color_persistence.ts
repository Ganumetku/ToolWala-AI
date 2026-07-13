import { chromium } from '@playwright/test';

async function runColorPersistenceVerification() {
  console.log('=== Starting Color Persistence Verification ===');

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    console.log('Navigating to editor page...');
    await page.goto('http://localhost:3000/tools/pdf-tools/edit-pdf/', { waitUntil: 'networkidle' });

    // Upload sample PDF
    const pdfPath = '/Users/technicul-akash/ToolWala-AI/scratch/test-runs/writer_output.pdf';
    console.log(`Uploading ${pdfPath}...`);
    await page.setInputFiles('input[type="file"]', pdfPath);

    // Wait for canvas elements to render
    await page.waitForTimeout(5000);

    const verificationResults = await page.evaluate(async () => {
      const canvas = (window as any).fabricCanvas;
      if (!canvas) return { error: 'Fabric Canvas not found' };

      const objects = canvas.getObjects();
      const textObjects = objects.filter((o: any) => o.isOriginalText && o.originalTextData);
      
      if (textObjects.length === 0) return { error: 'No original text objects found to verify' };

      console.log(`Found ${textObjects.length} text objects. Verifying color propagation...`);

      const checks = textObjects.map((obj: any) => {
        const orig = obj.originalTextData;
        const colorBefore = orig.detectedColor;
        
        // Assert color is defined and is not the old hardcoded blue (unless the PDF text itself is blue)
        const isColorDetected = typeof colorBefore === 'string' && colorBefore.startsWith('#');
        
        return {
          id: obj.id,
          text: obj.text,
          detectedColor: colorBefore,
          isColorDetected,
        };
      });

      // Select first object and simulate an edit commit
      const targetObj = textObjects[0];
      const origColor = targetObj.originalTextData.detectedColor;

      canvas.setActiveObject(targetObj);
      targetObj.enterEditing();
      targetObj.text = 'Color Persisted String';
      canvas.requestRenderAll();
      await new Promise(r => setTimeout(r, 200));

      const colorDuringEdit = targetObj.originalTextData.detectedColor;

      // Exit editing / commit
      targetObj.exitEditing();
      canvas.discardActiveObject();
      canvas.requestRenderAll();
      await new Promise(r => setTimeout(r, 200));

      // After commit, reload list
      const reloadedObjects = canvas.getObjects();
      const reloadedObj = reloadedObjects.find((o: any) => o.id === targetObj.id);
      const colorAfterCommit = reloadedObj.originalTextData.detectedColor;
      const fillAfterCommit = reloadedObj.fill;

      return {
        checks,
        editFlow: {
          id: targetObj.id,
          originalText: targetObj.text,
          origColor,
          colorDuringEdit,
          colorAfterCommit,
          fillAfterCommit,
          isColorPreserved: origColor === colorAfterCommit,
          isFillMatchingColor: fillAfterCommit === origColor
        }
      };
    });

    console.log('\n--- VERIFICATION RESULTS ---');
    console.log(JSON.stringify(verificationResults, null, 2));

    // Assertions
    const results = verificationResults as any;
    if (results.error) {
      throw new Error(`Verification failed: ${results.error}`);
    }

    const { checks, editFlow } = results;
    let allDetected = true;
    for (const check of checks) {
      if (!check.isColorDetected) {
        console.error(`❌ Color not detected for object: ${check.id} (${check.text})`);
        allDetected = false;
      } else {
        console.log(`✅ Color detected: ${check.detectedColor} for: "${check.text}"`);
      }
    }

    if (!allDetected) {
      throw new Error('Verification failed: some text objects did not have a detected color.');
    }

    if (!editFlow.isColorPreserved) {
      throw new Error(`Verification failed: Color changed from ${editFlow.origColor} to ${editFlow.colorAfterCommit} after commit`);
    }

    if (!editFlow.isFillMatchingColor) {
      throw new Error(`Verification failed: Fill color ${editFlow.fillAfterCommit} does not match original color ${editFlow.origColor} after commit`);
    }

    console.log('\n🎉 ALL COLOR PERSISTENCE CHECKS PASSED SUCCESSFULLY! 🎉');

  } catch (error) {
    console.error('Error during verification:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runColorPersistenceVerification();
