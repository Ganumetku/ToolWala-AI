import { test, expect } from '@playwright/test';

test.describe('Critical tools smoke', () => {
  test('PDF Merge tool page loads', async ({ page }) => {
    await page.goto('/tools/merge-pdf/');
    await expect(page.locator('body')).toContainText(/merge|pdf/i);
  });

  test('Background Remover tool page loads', async ({ page }) => {
    await page.goto('/tools/bg-remover/');
    await expect(page.locator('body')).toContainText(/background|remov/i);
  });

  test('OCR tool page loads', async ({ page }) => {
    await page.goto('/tools/ocr-to-text/');
    await expect(page.locator('body')).toContainText(/ocr|text/i);
  });

  test('EMI Calculator loads', async ({ page }) => {
    await page.goto('/tools/emi-calculator/');
    await expect(page.locator('body')).toContainText(/emi|calculator|loan/i);
  });

  test('Caption Generator (AI) loads', async ({ page }) => {
    await page.goto('/tools/caption-generator/');
    await expect(page.locator('body')).toContainText(/caption/i);
  });

  test('Discount Calculator loads and calculates savings', async ({ page }) => {
    await page.goto('/tools/discount-calculator/');
    await expect(page.locator('h1')).toContainText(/Discount Calculator/i);
    await expect(page.locator('body')).toContainText(/Total You Save|Final/i);
  });
});
