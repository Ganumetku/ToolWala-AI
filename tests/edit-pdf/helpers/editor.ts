import { expect, type Page } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import markers from '../../../test-fixtures/edit-pdf/markers.json';

export { markers };

export const FIXTURE_DIR = path.resolve('test-fixtures/edit-pdf');
export const BASELINE_DIR = path.resolve('tests/edit-pdf/baselines');
export const OUTPUT_DIR = path.resolve('tests/edit-pdf/output');

export function fixturePath(name: string): string {
  return path.join(FIXTURE_DIR, name);
}

export async function openEditor(page: Page) {
  await page.goto('/tools/pdf-tools/edit-pdf/');
  await expect(page.getByRole('heading', { name: 'Edit PDF Online', exact: true })).toBeVisible({
    timeout: 30000,
  });
  await expect(page.getByTestId('edit-pdf-landing')).toHaveAttribute('data-libs-ready', 'true', {
    timeout: 60000,
  });
}

export async function uploadFixture(page: Page, fileName: string) {
  const input = page.getByTestId('tool-file-input');
  await input.setInputFiles(fixturePath(fileName));
}

export async function waitForEditorReady(page: Page) {
  await expect(page.getByTestId('edit-pdf-export')).toBeVisible({ timeout: 120000 });
  await expect(page.getByTestId('edit-pdf-export')).toBeEnabled({ timeout: 120000 });
  await expect(page.locator('[id^="page-wrapper-"]').first()).toBeVisible({ timeout: 120000 });
}

export async function enterEditTextMode(page: Page) {
  await page.getByTestId('edit-pdf-tool-edit-text').click({ force: true });
}

export function runLocator(page: Page, originalText: string) {
  return page.locator(`[data-original-text="${originalText}"], [data-original-text*="${originalText}"]`).first();
}

export async function editRun(page: Page, originalText: string, replacement: string) {
  await enterEditTextMode(page);
  const run = runLocator(page, originalText);
  await expect(run).toBeVisible({ timeout: 45000 });
  await run.click();
  await run.press(process.platform === 'darwin' ? 'Meta+A' : 'Control+A');
  await page.keyboard.insertText(replacement);
  await run.blur();
  await page.waitForTimeout(250);
}

export async function exportEditedPdf(page: Page): Promise<Buffer> {
  const [download] = await Promise.all([
    page.waitForEvent('download', { timeout: 120000 }),
    page.getByTestId('edit-pdf-export').click(),
  ]);
  const filePath = await download.path();
  if (!filePath) throw new Error('Export download had no path');
  return fs.readFileSync(filePath);
}

export async function loadAndEdit(
  page: Page,
  fileName: string,
  originalText: string,
  replacement: string
): Promise<Buffer> {
  await openEditor(page);
  await uploadFixture(page, fileName);
  await waitForEditorReady(page);
  await editRun(page, originalText, replacement);
  return exportEditedPdf(page);
}
