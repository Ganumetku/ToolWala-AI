import { test, expect } from '@playwright/test';
import {
  closestBundledWeight,
  cssFontWeight,
  fabricFontWeight,
  isHeavyFontWeight,
  numericFontWeight,
  resolveNumericFontWeight,
} from '../../src/lib/twpdf/fonts/fontWeight';

test.describe('PDF font-weight mapping', () => {
  test('keyword and numeric signals map to the right bucket', () => {
    const cases: Array<{
      label: string;
      signals: Parameters<typeof resolveNumericFontWeight>[0];
      expected: number;
    }> = [
      { label: 'Regular', signals: { fontObject: { name: 'Helvetica', bold: false } }, expected: 400 },
      { label: 'Bold flag', signals: { fontObject: { name: 'Helvetica-Bold', bold: true } }, expected: 700 },
      { label: 'pdf.js id + Bold name', signals: { fontName: 'g_d0_f2', resolvedFontFamily: 'sans-serif', fontObject: { name: 'Helvetica-Bold' } }, expected: 700 },
      { label: 'Medium', signals: { fontObject: { name: 'NotoSans-Medium' } }, expected: 500 },
      { label: 'Semibold', signals: { fontObject: { name: 'Inter-SemiBold' } }, expected: 600 },
      { label: 'Demibold', signals: { fontObject: { name: 'Avenir-DemiBold' } }, expected: 600 },
      { label: 'Black', signals: { fontObject: { name: 'NotoSans-Black', black: true } }, expected: 900 },
      { label: 'Heavy', signals: { fontObject: { name: 'Arial-Heavy' } }, expected: 900 },
      { label: 'numeric 700', signals: { fontObject: { name: 'Custom', fontWeight: 700 } }, expected: 700 },
      { label: 'w700 token', signals: { fontName: 'ABCDEE+FooW700' }, expected: 700 },
      { label: 'Light', signals: { fontObject: { name: 'NotoSans-Light' } }, expected: 300 },
      { label: 'stroke-sim Tr2', signals: { fontObject: { name: 'Helvetica', bold: false }, renderMode: 2 }, expected: 700 },
      { label: 'g_d id alone', signals: { fontName: 'g_d0_f2', resolvedFontFamily: 'sans-serif' }, expected: 400 },
    ];

    for (const row of cases) {
      expect(resolveNumericFontWeight(row.signals), row.label).toBe(row.expected);
    }
  });

  test('CSS/Fabric weight strings treat 500+ as heavy', () => {
    expect(numericFontWeight('bold')).toBe(700);
    expect(numericFontWeight('700')).toBe(700);
    expect(numericFontWeight('semibold')).toBe(600);
    expect(isHeavyFontWeight('bold')).toBe(true);
    expect(isHeavyFontWeight('700')).toBe(true);
    expect(isHeavyFontWeight('medium')).toBe(true);
    expect(isHeavyFontWeight('normal')).toBe(false);
    expect(fabricFontWeight(500)).toBe('bold');
    expect(cssFontWeight('bold')).toBe('700');
    expect(closestBundledWeight(500, [400, 700])).toBe(700);
    expect(closestBundledWeight(400, [400, 700])).toBe(400);
  });
});
