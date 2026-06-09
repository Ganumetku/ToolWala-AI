import { test, expect } from '@playwright/test';

test.describe('Homepage smoke', () => {
  test('loads and shows hero section', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText(/Workflows with AI/i);
  });

  test('tools directory section is reachable', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#tools-section, [id="tools-section"]')).toBeVisible({ timeout: 10000 });
  });
});
