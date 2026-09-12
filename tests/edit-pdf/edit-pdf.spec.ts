import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import {
  editRun,
  enterEditTextMode,
  exportEditedPdf,
  loadAndEdit,
  markers,
  openEditor,
  runLocator,
  uploadFixture,
  waitForEditorReady,
} from './helpers/editor';
import {
  extractPdfItems,
  extractPdfText,
  pdfPointToPngPixel,
  rasterizePdfPage,
} from './helpers/pdfInspect';
import { comparePngToBaseline, isNearColor, samplePixel } from './helpers/visualDiff';

test.describe.configure({ timeout: 180000 });

const REPLACEMENT = markers.replacement;

function expectVisual(png: Buffer, name: string) {
  const { ratio, diffPath } = comparePngToBaseline(png, name);
  expect(ratio, diffPath ? `visual diff ${name} saved at ${diffPath}` : name).toBeLessThanOrEqual(
    Number(process.env.EDIT_PDF_MAX_DIFF_RATIO || 0.02)
  );
}

function hasBrokenGrapheme(text: string): boolean {
  return /\s\p{M}/u.test(text) || /^\p{M}/u.test(text);
}

test.describe('Edit PDF fixtures', () => {
  test('digital-invoice: edit cell, keep other text, preserve table border', async ({ page }) => {
    const bytes = await loadAndEdit(page, 'digital-invoice.pdf', markers.invoiceEdit, REPLACEMENT);
    const text = await extractPdfText(bytes, 1);
    expect(text).toContain(REPLACEMENT);
    expect(text).toContain(markers.invoiceKeep);

    const { png, pageHeightPt } = await rasterizePdfPage(bytes, 1, 1.5);
    expectVisual(png, 'digital-invoice-edited.png');

    const sample = pdfPointToPngPixel(270, 565, pageHeightPt, 1.5);
    const pixel = samplePixel(png, sample.x, sample.y);
    expect(isNearColor(pixel, { r: 20, g: 41, b: 115 }, 50)).toBeTruthy();
  });

  test.skip('hindi-form: wrap does not split a grapheme cluster', async ({ page }) => {
    // Deferred: Devanagari ToUnicode + export hang. Re-enable after Hindi font export is fixed.
    const longHi = `${markers.hindiLong} ${markers.hindiLong}`;
    const bytes = await loadAndEdit(page, 'hindi-form.pdf', markers.hindiTarget, longHi);
    const text = await extractPdfText(bytes, 1);
    expect(hasBrokenGrapheme(text)).toBeFalsy();
    const { png } = await rasterizePdfPage(bytes, 1, 1.5);
    expectVisual(png, 'hindi-form-edited.png');
  });

  test('scanned-no-text: banner and no run overlays', async ({ page }) => {
    await openEditor(page);
    await uploadFixture(page, 'scanned-no-text.pdf');
    await waitForEditorReady(page);
    await expect(page.getByTestId('edit-pdf-info-notice')).toBeVisible();
    await expect(page.getByTestId('edit-pdf-info-notice')).toContainText(/no selectable text layer/i);
    await page.getByTestId('edit-pdf-tool-edit-text').click();
    await expect(page.locator('[data-original-text]')).toHaveCount(0);
    await expect(page.getByTestId('edit-pdf-tool-add-text')).toBeVisible();
  });

  test('mixed-scan-digital: digital pages edit; scanned page shows hint', async ({ page }) => {
    await openEditor(page);
    await uploadFixture(page, 'mixed-scan-digital.pdf');
    await waitForEditorReady(page);
    await enterEditTextMode(page);
    await expect(runLocator(page, markers.digitalKeep)).toBeVisible();
    await editRun(page, markers.invoiceEdit, REPLACEMENT);
    const hint = page.getByTestId('edit-pdf-no-text-page-hint');
    await hint.scrollIntoViewIfNeeded();
    await expect(hint).toBeVisible();
    const bytes = await exportEditedPdf(page);
    const page1 = await extractPdfText(bytes, 1);
    expect(page1).toContain(REPLACEMENT);
    expect(page1).toContain(markers.digitalKeep);
    const page2 = await extractPdfText(bytes, 2);
    expect(page2.trim().length).toBeLessThan(8);
  });

  test('rotated-stamp: exported angle stays ~35deg', async ({ page }) => {
    const bytes = await loadAndEdit(page, 'rotated-stamp.pdf', markers.rotatedStamp, REPLACEMENT);
    const items = await extractPdfItems(bytes, 1);
    const stamp = items.find((i) => i.str.includes(REPLACEMENT) || i.str.includes(markers.rotatedStamp));
    expect(stamp).toBeTruthy();
    expect(Math.abs((stamp?.angleDeg || 0) - 35)).toBeLessThan(6);
    const body = await extractPdfText(bytes, 1);
    expect(body).toContain('Letterhead body text stays');
    const { png } = await rasterizePdfPage(bytes, 1, 1.5);
    expectVisual(png, 'rotated-stamp-edited.png');
  });

  test('multi-column: edit left column only', async ({ page }) => {
    const bytes = await loadAndEdit(page, 'multi-column.pdf', markers.colLeft, REPLACEMENT);
    const text = await extractPdfText(bytes, 1);
    expect(text).toContain(REPLACEMENT);
    expect(text).toContain(markers.colRight);
    const { png } = await rasterizePdfPage(bytes, 1, 1.5);
    expectVisual(png, 'multi-column-edited.png');
  });

  test('font-weight-mix: edited and unedited bold runs stay heavy', async ({ page }) => {
    const bytes = await loadAndEdit(page, 'font-weight-mix.pdf', markers.weightBold, REPLACEMENT);
    const text = await extractPdfText(bytes, 1);
    expect(text).toContain(markers.weightRegular);
    expect(text).toContain(REPLACEMENT);
    const items = await extractPdfItems(bytes, 1);
    const edited = items.find((i) => i.str.includes(REPLACEMENT));
    const uneditedBold = items.find((i) => i.str.includes(markers.weightSemibold) || i.str.includes(markers.weightBlack));
    const nameOf = (item?: (typeof items)[0]) =>
      `${item?.fontObjectName || ''} ${item?.fontName || ''}`.toLowerCase();
    expect(edited, 'edited run present').toBeTruthy();
    expect(
      nameOf(edited).includes('bold') || edited?.bold === true,
      `edited font was ${nameOf(edited)}`
    ).toBeTruthy();
    expect(uneditedBold, 'unedited heavy run present').toBeTruthy();
    expect(
      nameOf(uneditedBold).includes('bold') || uneditedBold?.bold === true,
      `unedited heavy font was ${nameOf(uneditedBold)}`
    ).toBeTruthy();
    const { png } = await rasterizePdfPage(bytes, 1, 1.5);
    expectVisual(png, 'font-weight-mix-edited.png');
  });

  test('long-overflow: replacement stays inside page margin', async ({ page }) => {
    const bytes = await loadAndEdit(page, 'long-overflow.pdf', markers.shortRun, markers.longReplacement);
    const text = await extractPdfText(bytes, 1);
    expect(text).toContain('THIS REPLACEMENT STRING');
    expect(text).toContain('Header stays put');
    const { png, width } = await rasterizePdfPage(bytes, 1, 1.5);
    const edge = samplePixel(png, width - 8, Math.round(1.5 * (842 - 700)));
    expect(edge.r + edge.g + edge.b).toBeGreaterThan(600);
    expectVisual(png, 'long-overflow-edited.png');
  });

  test('undo/redo: run stack first, then canvas shape', async ({ page }) => {
    await openEditor(page);
    await uploadFixture(page, 'digital-invoice.pdf');
    await waitForEditorReady(page);
    await editRun(page, markers.invoiceEdit, 'FIRST-EDIT');
    await page.getByTestId('edit-pdf-tool-rect').click();
    await page.waitForTimeout(200);
    const inkAfterShape = await page.evaluate(() => (window as unknown as { __twPdfE2e?: { countInkObjects: () => number } }).__twPdfE2e?.countInkObjects() ?? 0);
    expect(inkAfterShape).toBeGreaterThan(0);
    await editRun(page, markers.invoiceKeep, 'SECOND-EDIT');

    const undo = async () => {
      await page.keyboard.press(process.platform === 'darwin' ? 'Meta+z' : 'Control+z');
      await page.waitForTimeout(200);
    };

    await undo();
    await expect(runLocator(page, markers.invoiceKeep)).toHaveText(markers.invoiceKeep);
    await expect(runLocator(page, markers.invoiceEdit)).toHaveText('FIRST-EDIT');
    expect(
      await page.evaluate(() => (window as unknown as { __twPdfE2e: { countInkObjects: () => number } }).__twPdfE2e.countInkObjects())
    ).toBeGreaterThan(0);

    await undo();
    await expect(runLocator(page, markers.invoiceEdit)).toHaveText(markers.invoiceEdit);
    expect(
      await page.evaluate(() => (window as unknown as { __twPdfE2e: { countInkObjects: () => number } }).__twPdfE2e.countInkObjects())
    ).toBeGreaterThan(0);

    await undo();
    for (let i = 0; i < 5; i++) {
      const ink = await page.evaluate(
        () => (window as unknown as { __twPdfE2e: { countInkObjects: () => number } }).__twPdfE2e.countInkObjects()
      );
      if (ink === 0) break;
      await undo();
    }
    expect(
      await page.evaluate(() => (window as unknown as { __twPdfE2e: { countInkObjects: () => number } }).__twPdfE2e.countInkObjects())
    ).toBe(0);
  });
});
