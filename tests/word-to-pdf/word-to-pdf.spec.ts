import { test, expect } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { PNG } from 'pngjs';
import { openPdf, rasterizePdfPage } from '../edit-pdf/helpers/pdfInspect';

test.describe.configure({ timeout: 180000 });

const FIXTURE_DIR = path.resolve('test-fixtures/word-to-pdf');

function ensureFixtures() {
  const needed = [
    '01-fonts-sizes.docx',
    '02-headings-justified.docx',
    '03-tables.docx',
    '04-images.docx',
    '05-lists.docx',
    '06-header-footer.docx',
    '07-page-breaks.docx',
    '08-landscape-margins.docx',
  ];
  const missing = needed.filter((name) => !fs.existsSync(path.join(FIXTURE_DIR, name)));
  if (missing.length > 0) {
    execFileSync(process.execPath, ['scripts/generate-word-to-pdf-fixtures.mjs'], { stdio: 'inherit' });
  }
}

function nonWhiteRatio(png: Buffer): number {
  const image = PNG.sync.read(png);
  let colored = 0;
  const total = image.width * image.height;
  for (let i = 0; i < image.data.length; i += 4) {
    const r = image.data[i];
    const g = image.data[i + 1];
    const b = image.data[i + 2];
    if (r < 250 || g < 250 || b < 250) colored += 1;
  }
  return colored / total;
}

async function convertFixture(page: import('@playwright/test').Page, fileName: string): Promise<Buffer> {
  await page.goto('/tools/word-to-pdf-converter/');
  await expect(page.locator('h1')).toContainText(/Word to PDF/i);
  await page.locator('input[type="file"]').setInputFiles(path.join(FIXTURE_DIR, fileName));
  const convertBtn = page.getByRole('button', { name: /Convert Word to PDF/i });
  await expect(convertBtn).toBeVisible({ timeout: 120000 });
  await page.getByText(/Generating page previews/i).waitFor({ state: 'hidden', timeout: 120000 }).catch(() => {});
  await convertBtn.click();
  const downloadBtn = page.getByRole('button', { name: /Download PDF File/i });
  await expect(downloadBtn).toBeVisible({ timeout: 120000 });
  const [download] = await Promise.all([page.waitForEvent('download'), downloadBtn.click()]);
  const downloadPath = await download.path();
  expect(downloadPath, 'Playwright should save the downloaded PDF').toBeTruthy();
  return fs.readFileSync(downloadPath!);
}

test.describe('Word to PDF conversion', () => {
  test.beforeAll(() => {
    ensureFixtures();
  });

  test('fonts document produces a non-blank PDF page', async ({ page }) => {
    const bytes = await convertFixture(page, '01-fonts-sizes.docx');
    expect(bytes.subarray(0, 5).toString('latin1')).toBe('%PDF-');
    const pdf = await openPdf(bytes);
    expect(pdf.numPages).toBeGreaterThanOrEqual(1);
    const { png, width, height } = await rasterizePdfPage(bytes, 1, 1.25);
    expect(width).toBeGreaterThan(400);
    expect(height).toBeGreaterThan(500);
    expect(nonWhiteRatio(png)).toBeGreaterThan(0.002);
  });

  test('centered headings document stays portrait and has ink', async ({ page }) => {
    const bytes = await convertFixture(page, '02-headings-justified.docx');
    const { png, width, height } = await rasterizePdfPage(bytes, 1, 1.25);
    expect(height).toBeGreaterThan(width * 0.9);
    expect(nonWhiteRatio(png)).toBeGreaterThan(0.002);
  });

  test('table document keeps a filled page', async ({ page }) => {
    const bytes = await convertFixture(page, '03-tables.docx');
    const { png } = await rasterizePdfPage(bytes, 1, 1.25);
    expect(nonWhiteRatio(png)).toBeGreaterThan(0.004);
  });

  test('image document paints non-white pixels for the embedded PNG', async ({ page }) => {
    const bytes = await convertFixture(page, '04-images.docx');
    const { png } = await rasterizePdfPage(bytes, 1, 1.25);
    expect(nonWhiteRatio(png)).toBeGreaterThan(0.004);
  });

  test('list document converts', async ({ page }) => {
    const bytes = await convertFixture(page, '05-lists.docx');
    const pdf = await openPdf(bytes);
    expect(pdf.numPages).toBeGreaterThanOrEqual(1);
    const { png } = await rasterizePdfPage(bytes, 1, 1.25);
    expect(nonWhiteRatio(png)).toBeGreaterThan(0.002);
  });

  test('header/footer document converts', async ({ page }) => {
    const bytes = await convertFixture(page, '06-header-footer.docx');
    const { png } = await rasterizePdfPage(bytes, 1, 1.25);
    expect(nonWhiteRatio(png)).toBeGreaterThan(0.002);
  });

  test('explicit page breaks produce three PDF pages', async ({ page }) => {
    const bytes = await convertFixture(page, '07-page-breaks.docx');
    const pdf = await openPdf(bytes);
    expect(pdf.numPages).toBe(3);
  });

  test('landscape section produces a wider-than-tall page', async ({ page }) => {
    const bytes = await convertFixture(page, '08-landscape-margins.docx');
    const { width, height } = await rasterizePdfPage(bytes, 1, 1);
    expect(width).toBeGreaterThan(height);
  });

  test('legacy .doc files are rejected', async ({ page }) => {
    await page.goto('/tools/word-to-pdf-converter/');
    const bogus = path.join(FIXTURE_DIR, 'legacy.doc');
    fs.writeFileSync(bogus, 'not a docx');
    await page.locator('input[type="file"]').setInputFiles(bogus);
    await expect(page.getByText(/valid \.docx file only/i)).toBeVisible({ timeout: 10000 });
  });
});
