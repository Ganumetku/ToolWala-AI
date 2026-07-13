import { TypographyEngine } from '../src/lib/tw-engine/typography/TypographyEngine';
import { FontMetrics } from '../src/lib/tw-engine/typography/FontMetrics';
import { GlyphMetrics } from '../src/lib/tw-engine/typography/GlyphMetrics';
import { KerningEngine } from '../src/lib/tw-engine/typography/KerningEngine';
import { BaselineEngine } from '../src/lib/tw-engine/typography/BaselineEngine';

async function runFidelityVerification() {
  console.log('=== Starting Typography Fidelity Engine Verification ===');

  try {
    // 1. Verify standard Helvetica typesetting metrics
    console.log('Verifying standard font layout...');
    const text = 'Pankaj Sharma';
    const layout = TypographyEngine.layout(
      text,
      'Helvetica',
      12,
      'normal',
      'normal',
      0,
      false,
      0,
      1.2
    );

    console.log(`- Lines count: ${layout.lines.length}`);
    console.log(`- Layout width: ${layout.width}px`);
    console.log(`- Layout height: ${layout.height}px`);

    if (layout.lines.length !== 1) {
      throw new Error('Fidelity check failed: standard font paragraph composer must yield 1 line');
    }

    const firstLine = layout.lines[0];
    if (firstLine.glyphs.length !== text.length) {
      throw new Error(`Fidelity check failed: expected ${text.length} glyphs, got ${firstLine.glyphs.length}`);
    }

    // 2. Verify KerningEngine spacing offsets
    console.log('Verifying Kerning pair adjustments...');
    const AV_kern = KerningEngine.getKerning('A', 'V', 'Helvetica', 1000, true);
    console.log(`- Kerning offset for "AV" at 1000pt: ${AV_kern} units`);
    if (Math.abs(AV_kern) === 0) {
      throw new Error('Fidelity check failed: standard Helvetica kerning table AV mismatch');
    }

    // 3. Verify GlyphMetrics advance resolutions
    console.log('Verifying Glyph design advances...');
    const charW = GlyphMetrics.getGlyphWidth('W', 'Helvetica', 12, 'normal', 'normal', true);
    console.log(`- Glyph width for "W" at 12pt: ${charW}px`);
    if (charW <= 0) {
      throw new Error('Fidelity check failed: expected positive advance for glyph W');
    }

    // 4. Verify BaselineEngine shift adjustments
    console.log('Verifying Baseline alignments...');
    const originalBaseline = 100;
    const boxTop = 88;
    const firstLineY = firstLine.y; // Local baseline Y
    const shift = BaselineEngine.calculateBaselineShift(originalBaseline, boxTop, 12, firstLineY);
    console.log(`- Calculated Baseline Shift: ${shift}px`);

    console.log('\n🎉 ALL TYPOGRAPHY FIDELITY CHECKS PASSED SUCCESSFULLY! 🎉');

  } catch (error) {
    console.error('Typography fidelity verification failed:', error);
    process.exit(1);
  }
}

runFidelityVerification();
