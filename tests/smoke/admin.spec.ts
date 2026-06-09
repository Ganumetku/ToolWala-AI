import { test, expect } from '@playwright/test';

test.describe('Admin security smoke', () => {
  test('unauthenticated admin redirects to login', async ({ page }) => {
    await page.goto('/admin/');
    await expect(page).toHaveURL(/\/login/);
  });

  test('login page renders without hardcoded credentials', async ({ page }) => {
    await page.goto('/login/');
    await expect(page.locator('h1')).toContainText(/ToolWala Admin/i);
    const content = await page.content();
    expect(content).not.toContain('toolwala_admin');
    expect(content).not.toContain('tg_admin_secure');
  });
});
