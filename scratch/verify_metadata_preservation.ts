import { TextParser } from '../src/lib/tw-engine/TextParser';
import { ObjectRegistry } from '../src/lib/tw-engine/ObjectRegistry';
import { CANVAS_JSON_PROPS } from '../src/types/pdf';
import { fabricObjectToTWPDF } from '../src/lib/twpdf/dom/fabricSync';

async function runMetadataVerification() {
  console.log('=== Starting Typography Metadata Preservation Verification ===');

  try {
    // 1. Mocking PDF.js items to simulate extraction stage
    const mockPage = {
      getTextContent: async () => ({
        items: [
          {
            str: 'Pankaj Sharma 20220170013496',
            transform: [12, 0, 0, 12, 50, 100],
            fontName: 'g_d0_f2',
            width: 200,
            height: 12,
          }
        ],
        styles: {
          'g_d0_f2': {
            fontFamily: 'Times-Roman',
            ascent: 798,
            descent: -207,
          }
        }
      })
    };

    const mockViewport = {
      convertToViewportPoint: (x: number, y: number) => [x, y],
    };

    // 2. Run PDF.js extraction / TextParser
    console.log('\nStep 1: Running TextParser Extraction...');
    const parsedObjects = await TextParser.parsePageText(mockPage, 1, mockViewport);
    if (parsedObjects.length === 0) {
      throw new Error('TextParser failed to extract objects');
    }
    const textObj = parsedObjects[0];

    // Assert extraction properties
    console.log('Asserting properties after extraction:');
    console.log(`- id: ${textObj.id}`);
    console.log(`- fontName: ${textObj.fontName}`);
    console.log(`- pdfFontName: ${textObj.pdfFontName}`);
    console.log(`- fontWeight: ${textObj.fontWeight}`);
    console.log(`- fontStyle: ${textObj.fontStyle}`);
    console.log(`- baseline: ${textObj.baseline}`);
    console.log(`- ascent: ${textObj.ascent}`);
    console.log(`- descent: ${textObj.descent}`);
    console.log(`- originalBBox: ${JSON.stringify(textObj.originalBBox)}`);
    console.log(`- originalTextData.pdfFontName: ${textObj.originalTextData?.pdfFontName}`);

    if (textObj.pdfFontName !== 'g_d0_f2') throw new Error(`pdfFontName should be g_d0_f2, got ${textObj.pdfFontName}`);
    if (textObj.fontWeight !== 'normal') throw new Error(`fontWeight should be normal, got ${textObj.fontWeight}`);
    if (textObj.fontStyle !== 'normal') throw new Error(`fontStyle should be normal, got ${textObj.fontStyle}`);
    if (textObj.ascent !== 798) throw new Error(`ascent should be 798, got ${textObj.ascent}`);
    if (textObj.descent !== -207) throw new Error(`descent should be -207, got ${textObj.descent}`);
    if (!textObj.originalBBox) throw new Error('originalBBox is missing');

    // 3. Register in ObjectRegistry
    console.log('\nStep 2: Registering in ObjectRegistry...');
    const registry = ObjectRegistry.getInstance();
    registry.clear();
    registry.registerObject(textObj);

    const registryObj = registry.getObject(textObj.id) as any;
    if (!registryObj) {
      throw new Error('Object failed to register');
    }

    if (registryObj.pdfFontName !== 'g_d0_f2') throw new Error('pdfFontName lost in Registry');
    if (registryObj.ascent !== 798) throw new Error('ascent lost in Registry');
    if (registryObj.descent !== -207) throw new Error('descent lost in Registry');

    // 4. Simulate canvas serialization using CANVAS_JSON_PROPS
    console.log('\nStep 3: Simulating Canvas Serialization (JSON)...');
    // Emulate toObject using the CANVAS_JSON_PROPS
    const serializedJson: Record<string, any> = {
      type: 'textbox',
      text: registryObj.text,
      fontFamily: registryObj.fontName,
      fontSize: registryObj.fontSize,
      fill: registryObj.fontColor,
    };
    CANVAS_JSON_PROPS.forEach((prop) => {
      serializedJson[prop] = registryObj[prop];
    });

    console.log('Serialized JSON custom keys:', Object.keys(serializedJson).filter(k => CANVAS_JSON_PROPS.includes(k as any)));
    
    // Assert JSON properties
    if (serializedJson.pdfFontName !== 'g_d0_f2') throw new Error('pdfFontName lost in JSON');
    if (serializedJson.ascent !== 798) throw new Error('ascent lost in JSON');
    if (serializedJson.descent !== -207) throw new Error('descent lost in JSON');

    // 5. Restore using loadFromJSON (fabricToText)
    console.log('\nStep 4: Restoring from JSON (fabricToText)...');
    const restoredObj = fabricObjectToTWPDF(serializedJson, 0) as any;
    if (!restoredObj) {
      throw new Error('Reconstruction failed');
    }

    console.log('Asserting properties after restoration:');
    console.log(`- baseline: ${restoredObj.baseline}`);
    console.log(`- ascent: ${restoredObj.ascent}`);
    console.log(`- descent: ${restoredObj.descent}`);
    console.log(`- pdfFontName: ${restoredObj.pdfFontName}`);
    console.log(`- fontWeight: ${restoredObj.fontWeight}`);
    console.log(`- fontStyle: ${restoredObj.fontStyle}`);
    console.log(`- fontName: ${restoredObj.fontName}`);
    console.log(`- originalBBox: ${JSON.stringify(restoredObj.originalBBox)}`);

    if (restoredObj.pdfFontName !== 'g_d0_f2') throw new Error('pdfFontName lost after restoration');
    if (restoredObj.ascent !== 798) throw new Error('ascent lost after restoration');
    if (restoredObj.descent !== -207) throw new Error('descent lost after restoration');
    if (restoredObj.baseline !== 100) throw new Error('baseline lost after restoration');
    if (!restoredObj.originalBBox) throw new Error('originalBBox lost after restoration');

    console.log('\n🎉 ALL TYPOGRAPHY METADATA PRESERVATION CHECKS PASSED SUCCESSFULLY! 🎉');

  } catch (error) {
    console.error('Metadata verification failed:', error);
    process.exit(1);
  }
}

runMetadataVerification();
