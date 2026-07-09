import { FontMetricsRegistry } from '../src/lib/tw-engine/text/FontMetrics';
import { GlyphCache } from '../src/lib/tw-engine/text/GlyphCache';
import { FontResolver } from '../src/lib/tw-engine/text/FontResolver';
import { Kerning } from '../src/lib/tw-engine/text/Kerning';
import { LineBreaker } from '../src/lib/tw-engine/text/LineBreaker';
import { TextLayout } from '../src/lib/tw-engine/text/TextLayout';
import { CaretEngine } from '../src/lib/tw-engine/text/CaretEngine';
import { TextSelection } from '../src/lib/tw-engine/text/TextSelection';

function runTextLayoutVerification() {
  console.log('=== Starting PDF Text Layout & Font Engine Verification (Phase 4.4) ===');

  try {
    // 1. Font Metrics Registry
    console.log('\n--- Testing FontMetricsRegistry ---');
    const metrics = FontMetricsRegistry.getMetrics('Helvetica-Bold');
    console.log(`Resolved PS Name: ${metrics.fontName}`);
    console.log(`  - Ascent: ${metrics.ascent} units`);
    console.log(`  - Descent: ${metrics.descent} units`);
    console.log(`  - Cap Height: ${metrics.capHeight} units`);

    if (metrics.fontName !== 'Helvetica' || metrics.ascent !== 800) {
      throw new Error('FontMetricsRegistry mismatch: expected Helvetica metrics.');
    }
    console.log('✅ Font metrics registry passed.');

    // 2. Font Resolver Subsets Strip
    console.log('\n--- Testing FontResolver ---');
    const subsetName = 'ABCDEF+TimesNewRoman-Bold';
    const resolvedName = FontResolver.resolveFontFamily(subsetName);
    console.log(`Raw Name: "${subsetName}" | Resolved Name: "${resolvedName}"`);
    if (resolvedName !== 'TimesNewRoman-Bold') {
      throw new Error('FontResolver failed: PS subset prefix was not stripped.');
    }
    console.log('✅ Font resolver subset parsing passed.');

    // 3. Spacing and Pair Kerning offsets
    console.log('\n--- Testing Kerning Pairs ---');
    const kernAV = Kerning.getKerningOffset('Helvetica', 'A', 'V');
    const kernAB = Kerning.getKerningOffset('Helvetica', 'A', 'B');
    console.log(`Pair "AV" kerning offset: ${kernAV} design units`);
    console.log(`Pair "AB" kerning offset: ${kernAB} design units`);

    if (kernAV >= 0 || kernAB !== 0) {
      throw new Error('Kerning calculations error: Expected negative offset for AV, zero for AB.');
    }
    console.log('✅ Pair-kerning passed.');

    // 4. Line Wrapping and breaker
    console.log('\n--- Testing LineBreaker auto wrapping ---');
    const paragraphText = 'ToolWala Native PDF Typesetting layout wrapper wraps long lines dynamically.';
    // maxWidth=100px with fontSize=12 should wrap it to multiple lines
    const wrapLines = LineBreaker.splitLines(paragraphText, 'Helvetica', 12, 100, true);
    console.log(`Long paragraph wrapped into: ${wrapLines.length} lines`);
    wrapLines.forEach((l, idx) => console.log(`  Line ${idx + 1}: "${l}"`));
    
    if (wrapLines.length < 2) {
      throw new Error('LineBreaker wrapping error: Expected text block to wrap into multiple lines.');
    }
    console.log('✅ LineBreaker auto-wrapping passed.');

    // 5. Typeset Text Layout Coordinates Compilation
    console.log('\n--- Testing TextLayout coordinates compiler ---');
    const layout = new TextLayout('A Very Simple Text\nSecond Line Text', 'Helvetica', 12, 0, false);
    console.log(`Lines count in compiled layout: ${layout.lines.length}`);
    console.log(`Line 1 text: "${layout.lines[0].text}" | Baseline Y: ${layout.lines[0].y.toFixed(1)} px`);
    console.log(`Line 2 text: "${layout.lines[1].text}" | Baseline Y: ${layout.lines[1].y.toFixed(1)} px`);
    
    if (layout.lines.length !== 2) {
      throw new Error('TextLayout compiler error: expected exactly 2 lines.');
    }

    const firstGlyph = layout.lines[0].glyphs[0];
    console.log(`First glyph: "${firstGlyph.char}" | bounds: x=${firstGlyph.x.toFixed(1)}, y=${firstGlyph.y.toFixed(1)}, w=${firstGlyph.width.toFixed(1)}, h=${firstGlyph.height.toFixed(1)}`);
    if (firstGlyph.char !== 'A' || firstGlyph.x !== 0) {
      throw new Error('TextLayout glyph layout error.');
    }
    console.log('✅ TextLayout compiler passed.');

    // 6. Caret Click Mapping, double-clicks, and triple-clicks
    console.log('\n--- Testing CaretEngine cursor mapping ---');
    const caret = new CaretEngine();
    
    // Simulate mouse click inside line 1 close to index 4 (between character 'e' and 'r' in "A Very Simple Text")
    // glyph 4 'e' starts at roughly x = 12 * scale * advance widths
    const clickX = 25; 
    const clickY = 5; // First row baseline region
    
    const caretIdx = caret.clickToCaretIndex(clickX, clickY, layout);
    console.log(`Click at (x: ${clickX}, y: ${clickY}) resolved to caret text index: ${caretIdx}`);
    if (caretIdx === 0) {
      throw new Error('CaretEngine click-to-caret index mapping failed.');
    }

    // Double-click selection check (selects word "Very")
    console.log('Executing Double-Click word selection...');
    caret.doubleClick(30, 5, layout); // clicked inside "Very"
    console.log(`  - Selection range: [${caret.selectionStart}, ${caret.selectionEnd}]`);
    const selectedWord = layout.text.slice(caret.selectionStart, caret.selectionEnd);
    console.log(`  - Selected text slice: "${selectedWord}"`);
    if (selectedWord !== 'Very') {
      throw new Error(`CaretEngine doubleClick word selection failed: expected "Very", got "${selectedWord}".`);
    }

    // Triple-click selection check (selects line "A Very Simple Text")
    console.log('Executing Triple-Click line selection...');
    caret.tripleClick(30, 5, layout);
    console.log(`  - Selection range: [${caret.selectionStart}, ${caret.selectionEnd}]`);
    const selectedLine = layout.text.slice(caret.selectionStart, caret.selectionEnd);
    console.log(`  - Selected text slice: "${selectedLine}"`);
    if (selectedLine !== 'A Very Simple Text') {
      throw new Error(`CaretEngine tripleClick line selection failed: expected "A Very Simple Text", got "${selectedLine}".`);
    }
    console.log('✅ CaretEngine clicks mappings passed.');

    // 7. Selection Highlight Bounding Boxes Compilation
    console.log('\n--- Testing Selection Highlight compiler ---');
    // Highlight range from index 2 to 6 ("Very")
    const highlights = TextSelection.getSelectionRects(layout, 2, 6);
    console.log(`Selection highlight rects count: ${highlights.length}`);
    if (highlights.length !== 1) {
      throw new Error('TextSelection error: Expected exactly 1 selection highlight box.');
    }
    const rect = highlights[0];
    console.log(`Highlight bounds: x=${rect.x.toFixed(1)}, y=${rect.y.toFixed(1)}, w=${rect.width.toFixed(1)}, h=${rect.height.toFixed(1)}`);
    if (rect.width <= 0 || rect.height <= 0) {
      throw new Error('TextSelection error: Highlight rectangle size must be positive.');
    }
    console.log('✅ TextSelection highlight box compiler passed.');

    console.log('\n✅ ALL TEXT LAYOUT & FONT ENGINE ASSERTIONS PASSED!');

  } catch (err) {
    console.error('❌ Verification failed with error:', err);
    process.exit(1);
  }
}

runTextLayoutVerification();
