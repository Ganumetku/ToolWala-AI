import { test, expect } from '@playwright/test';

test.describe('Admin security smoke', () => {
  test('unauthenticated admin redirects to login or control-access', async ({ page }) => {
    await page.goto('/admin/');
    await expect(page).toHaveURL(/\/(login|control-access)/);
  });

  test('admin login page renders without hardcoded credentials', async ({ page }) => {
    await page.goto('/admin/login/');
    await expect(page.locator('h1, h2, h3').first()).toBeVisible();
    const content = await page.content();
    expect(content).not.toContain('toolwala_admin');
    expect(content).not.toContain('tg_admin_secure');
  });
});
