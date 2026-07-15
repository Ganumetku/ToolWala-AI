import { FontParser } from '../src/lib/tw-engine/FontParser';
import { GlyphAdvanceEngine } from '../src/lib/tw-engine/fidelity/GlyphAdvanceEngine';
import { GlyphMetrics } from '../src/lib/tw-engine/typography/GlyphMetrics';

async function runFontFidelityVerification() {
  console.log('=== Starting Font Metrics Fidelity Verification ===');

  try {
    // 1. Construct a mock PDF page with dynamic embedded font objects
    const mockFontRef = 'g_d0_f5';
    const mockPostscriptName = 'ABCDEF+CustomFont-Bold';
    const mockFamilyName = 'CustomFont-Bold';

    // PDF widths array: indices represent charCode - FirstChar.
    // Let's set FirstChar = 48 (unicode for '0').
    // Widths array for '0' (48) to '9' (57)
    const mockWidths = [
      500, // '0'
      300, // '1'
      600, // '2'
      450, // '3'
      550, // '4'
      580, // '5'
      620, // '6'
      350, // '7'
      700, // '8'
      750  // '9'
    ];

    const mockFontObj = {
      type: 'font',
      name: mockPostscriptName,
      data: {
        widths: mockWidths,
        firstChar: 48,
        lastChar: 57,
        missingWidth: 500,
        fontMatrix: [0.001, 0, 0, 0.001, 0, 0], // standard 1/1000 scale
        toUnicode: {
          mappings: {
            '48': '0',
            '49': '1',
            '50': '2',
            '51': '3',
            '52': '4',
            '53': '5',
            '54': '6',
            '55': '7',
            '56': '8',
            '57': '9'
          }
        }
      }
    };

    const mockPage = {
      getTextContent: async () => ({
        items: [],
        styles: {
          [mockFontRef]: {
            fontFamily: mockFamilyName,
            ascent: 800,
            descent: -200,
          }
        }
      }),
      commonObjs: {
        get: (ref: string) => (ref === mockFontRef ? mockFontObj : null),
      },
      objs: {
        get: () => null,
      }
    };

    // 2. Execute FontParser
    console.log('\nStep 1: Parsing and registering embedded fonts...');
    await FontParser.parsePageFonts(mockPage);

    // Verify GlyphAdvanceEngine has cached the fonts
    console.log('Verifying registrations in GlyphAdvanceEngine:');
    console.log(`- hasFont(${mockFontRef}): ${GlyphAdvanceEngine.hasFont(mockFontRef)}`);
    console.log(`- hasFont(${mockPostscriptName}): ${GlyphAdvanceEngine.hasFont(mockPostscriptName)}`);
    console.log(`- hasFont(${mockFamilyName}): ${GlyphAdvanceEngine.hasFont(mockFamilyName)}`);

    if (!GlyphAdvanceEngine.hasFont(mockFontRef)) throw new Error('FontRef registry missing');
    if (!GlyphAdvanceEngine.hasFont(mockPostscriptName)) throw new Error('PostscriptName registry missing');
    if (!GlyphAdvanceEngine.hasFont(mockFamilyName)) throw new Error('FamilyName registry missing');

    // 3. Resolve and assert advances through getAdvance
    console.log('\nStep 2: Resolving char code advances via getAdvance...');
    const fontSz = 12;

    // Widths mapping test:
    // '0' -> unicode 48 -> design width 500 -> scaled: 500 * 0.001 * 12 = 6.0px
    const w0 = GlyphAdvanceEngine.getAdvance(mockFontRef, '0', fontSz);
    // '1' -> unicode 49 -> design width 300 -> scaled: 300 * 0.001 * 12 = 3.6px
    const w1 = GlyphAdvanceEngine.getAdvance(mockFontRef, '1', fontSz);
    // '8' -> unicode 56 -> design width 700 -> scaled: 700 * 0.001 * 12 = 8.4px
    const w8 = GlyphAdvanceEngine.getAdvance(mockFontRef, '8', fontSz);
    // Unmapped character (e.g. 'A') -> fallback to missingWidth 500 -> scaled: 6.0px
    const wA = GlyphAdvanceEngine.getAdvance(mockFontRef, 'A', fontSz);

    console.log(`- Char '0' width at 12pt (expected 6.0px): ${w0}px`);
    console.log(`- Char '1' width at 12pt (expected 3.6px): ${w1}px`);
    console.log(`- Char '8' width at 12pt (expected 8.4px): ${w8}px`);
    console.log(`- Char 'A' width at 12pt (expected 6.0px): ${wA}px`);

    if (Math.abs(w0 - 6.0) > 0.0001) throw new Error('w0 advance incorrect');
    if (Math.abs(w1 - 3.6) > 0.0001) throw new Error('w1 advance incorrect');
    if (Math.abs(w8 - 8.4) > 0.0001) throw new Error('w8 advance incorrect');
    if (Math.abs(wA - 6.0) > 0.0001) throw new Error('wA fallback advance incorrect');

    // 4. Assert GlyphMetrics bypasses measureText and uses our cached advances
    console.log('\nStep 3: Verifying GlyphMetrics bypasses browser canvas measurements...');
    const metricsW2 = GlyphMetrics.getGlyphWidth('2', mockFamilyName, 12, 'normal', 'normal', false);
    console.log(`- GlyphMetrics width for '2' (expected 7.2px): ${metricsW2}px`);
    if (Math.abs(metricsW2 - 7.2) > 0.0001) throw new Error('GlyphMetrics bypassed GlyphAdvanceEngine metrics');

    console.log('\n🎉 ALL FONT METRICS FIDELITY CHECKS PASSED SUCCESSFULLY! 🎉');

  } catch (error) {
    console.error('Fidelity verification failed:', error);
    process.exit(1);
  }
}

runFontFidelityVerification();
