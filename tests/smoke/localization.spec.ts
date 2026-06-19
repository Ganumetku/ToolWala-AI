import { test, expect } from '@playwright/test';

test.describe('Multilingual SEO and Localization', () => {
  test('Sitemap contains only enabled SEO locales (es, pt, hi) and excludes disabled (fr, de, id, ar)', async ({ request }) => {
    const res = await request.get('/sitemap.xml');
    expect(res.ok()).toBeTruthy();
    const text = await res.text();
    
    // Verifying sitemap includes es alternates
    expect(text).toContain('href="https://toolwala.co/es/"');
    expect(text).toContain('href="https://toolwala.co/es/blog/"');
    expect(text).toContain('href="https://toolwala.co/es/categories/pdf-tools/"');
    expect(text).toContain('href="https://toolwala.co/es/tools/image-compressor/"');

    // Verifying sitemap includes pt alternates
    expect(text).toContain('href="https://toolwala.co/pt/"');
    expect(text).toContain('href="https://toolwala.co/pt/blog/"');
    expect(text).toContain('href="https://toolwala.co/pt/categories/pdf-tools/"');
    expect(text).toContain('href="https://toolwala.co/pt/tools/image-compressor/"');

    // Verifying sitemap includes hi alternates
    expect(text).toContain('href="https://toolwala.co/hi/"');
    expect(text).toContain('href="https://toolwala.co/hi/blog/"');

    // Verifying sitemap excludes disabled alternates (fr, de, id, ar)
    expect(text).not.toContain('href="https://toolwala.co/fr/"');
    expect(text).not.toContain('href="https://toolwala.co/de/"');
    expect(text).not.toContain('href="https://toolwala.co/id/"');
    expect(text).not.toContain('href="https://toolwala.co/ar/"');
  });

  test('Disabled locales (e.g. fr, de, id, ar) redirect to English equivalents', async ({ page }) => {
    // Check that /fr/ redirect works
    const responseFr = await page.goto('/fr/tools/image-compressor/');
    expect(responseFr?.status()).toBe(200); // should successfully resolve after redirect
    expect(page.url()).toContain('/tools/image-compressor/');
    expect(page.url()).not.toContain('/fr/');
    
    // Check that /de/ redirect works
    await page.goto('/de/blog/');
    expect(page.url()).toContain('/blog/');
    expect(page.url()).not.toContain('/de/');
  });

  test('Brand logo "ToolWala AI" is preserved across locales', async ({ page }) => {
    // Go to Hindi homepage
    await page.goto('/hi/');
    const logoHi = page.locator('header a[href="/hi/"], header a[href="/hi"]').first();
    await expect(logoHi).toContainText('ToolWala');
    await expect(logoHi).toContainText('AI');

    // Go to Spanish homepage
    await page.goto('/es/');
    const logoEs = page.locator('header a[href="/es/"], header a[href="/es"]').first();
    await expect(logoEs).toContainText('ToolWala');
    await expect(logoEs).toContainText('AI');

    // Go to Portuguese homepage
    await page.goto('/pt/');
    const logoPt = page.locator('header a[href="/pt/"], header a[href="/pt"]').first();
    await expect(logoPt).toContainText('ToolWala');
    await expect(logoPt).toContainText('AI');
  });

  test('Homepage has correct Spanish meta, canonical and hreflangs', async ({ page }) => {
    await page.goto('/es/');

    // Check title contains brand name
    const title = await page.title();
    expect(title).toContain('ToolWala AI');

    // Check canonical ends with /es/
    const canonical = page.locator('link[rel="canonical"]');
    await expect(canonical).toHaveAttribute('href', 'https://toolwala.co/es/');

    // Check hreflangs are generated
    const hreflangEs = page.locator('link[rel="alternate"][hreflang="es"]');
    await expect(hreflangEs).toHaveAttribute('href', 'https://toolwala.co/es/');

    const hreflangPt = page.locator('link[rel="alternate"][hreflang="pt"]');
    await expect(hreflangPt).toHaveAttribute('href', 'https://toolwala.co/pt/');

    const hreflangHi = page.locator('link[rel="alternate"][hreflang="hi"]');
    await expect(hreflangHi).toHaveAttribute('href', 'https://toolwala.co/hi/');

    const hreflangEn = page.locator('link[rel="alternate"][hreflang="en"]');
    await expect(hreflangEn).toHaveAttribute('href', 'https://toolwala.co/');

    const hreflangXDefault = page.locator('link[rel="alternate"][hreflang="x-default"]');
    await expect(hreflangXDefault).toHaveAttribute('href', 'https://toolwala.co/');

    // Verify main title is translated to Spanish (hero title is "Potencia tu día a día")
    const h1 = page.locator('h1');
    await expect(h1).toContainText('Potencia tu');
  });

  test('Homepage has correct Portuguese meta, canonical and hreflangs', async ({ page }) => {
    await page.goto('/pt/');

    // Check title contains brand name
    const title = await page.title();
    expect(title).toContain('ToolWala AI');

    // Check canonical ends with /pt/
    const canonical = page.locator('link[rel="canonical"]');
    await expect(canonical).toHaveAttribute('href', 'https://toolwala.co/pt/');

    // Check hreflangs are generated
    const hreflangPt = page.locator('link[rel="alternate"][hreflang="pt"]');
    await expect(hreflangPt).toHaveAttribute('href', 'https://toolwala.co/pt/');

    const hreflangEs = page.locator('link[rel="alternate"][hreflang="es"]');
    await expect(hreflangEs).toHaveAttribute('href', 'https://toolwala.co/es/');

    const hreflangHi = page.locator('link[rel="alternate"][hreflang="hi"]');
    await expect(hreflangHi).toHaveAttribute('href', 'https://toolwala.co/hi/');

    const hreflangEn = page.locator('link[rel="alternate"][hreflang="en"]');
    await expect(hreflangEn).toHaveAttribute('href', 'https://toolwala.co/');

    const hreflangXDefault = page.locator('link[rel="alternate"][hreflang="x-default"]');
    await expect(hreflangXDefault).toHaveAttribute('href', 'https://toolwala.co/');

    // Verify main title is translated to Portuguese (hero title starts with "Turbine")
    const h1 = page.locator('h1');
    await expect(h1).toContainText('Turbine');
  });

  test('Blog details page generates Spanish alternates', async ({ page }) => {
    await page.goto('/es/blog/why-local-ocr-is-the-future/');

    // Check canonical
    const canonical = page.locator('link[rel="canonical"]');
    await expect(canonical).toHaveAttribute('href', 'https://toolwala.co/es/blog/why-local-ocr-is-the-future/');

    // Check hreflangs
    const hreflangEs = page.locator('link[rel="alternate"][hreflang="es"]');
    await expect(hreflangEs).toHaveAttribute('href', 'https://toolwala.co/es/blog/why-local-ocr-is-the-future/');

    const hreflangEn = page.locator('link[rel="alternate"][hreflang="en"]');
    await expect(hreflangEn).toHaveAttribute('href', 'https://toolwala.co/blog/why-local-ocr-is-the-future/');

    // Check header translated to Spanish
    const h1 = page.locator('h1');
    await expect(h1).toContainText('Por qué el OCR nativo del navegador es el futuro');
  });

  test('Category details page generates Spanish alternates', async ({ page }) => {
    await page.goto('/es/categories/pdf-tools/');

    // Check canonical
    const canonical = page.locator('link[rel="canonical"]');
    await expect(canonical).toHaveAttribute('href', 'https://toolwala.co/es/categories/pdf-tools/');

    // Check hreflangs
    const hreflangEs = page.locator('link[rel="alternate"][hreflang="es"]');
    await expect(hreflangEs).toHaveAttribute('href', 'https://toolwala.co/es/categories/pdf-tools/');

    // Check title in Spanish
    const title = await page.title();
    expect(title).toContain('PDF Herramientas');
  });

  test('Tool page generates Spanish alternates', async ({ page }) => {
    await page.goto('/es/tools/image-compressor/');

    // Check canonical
    const canonical = page.locator('link[rel="canonical"]');
    await expect(canonical).toHaveAttribute('href', 'https://toolwala.co/es/tools/image-compressor/');

    // Check hreflangs
    const hreflangEs = page.locator('link[rel="alternate"][hreflang="es"]');
    await expect(hreflangEs).toHaveAttribute('href', 'https://toolwala.co/es/tools/image-compressor/');

    // Verify that the title is dynamically translated to Spanish (should not remain "Image Compressor")
    const h1 = page.locator('h1');
    await expect(h1).not.toHaveText('Image Compressor', { timeout: 10000 });
  });

  test('Blog details page generates Portuguese alternates', async ({ page }) => {
    await page.goto('/pt/blog/why-local-ocr-is-the-future/');

    // Check canonical
    const canonical = page.locator('link[rel="canonical"]');
    await expect(canonical).toHaveAttribute('href', 'https://toolwala.co/pt/blog/why-local-ocr-is-the-future/');

    // Check hreflangs
    const hreflangPt = page.locator('link[rel="alternate"][hreflang="pt"]');
    await expect(hreflangPt).toHaveAttribute('href', 'https://toolwala.co/pt/blog/why-local-ocr-is-the-future/');

    // Check header translated to Portuguese
    const h1 = page.locator('h1');
    await expect(h1).toContainText('OCR');
  });

  test('Category details page generates Portuguese alternates', async ({ page }) => {
    await page.goto('/pt/categories/pdf-tools/');

    // Check canonical
    const canonical = page.locator('link[rel="canonical"]');
    await expect(canonical).toHaveAttribute('href', 'https://toolwala.co/pt/categories/pdf-tools/');

    // Check hreflangs
    const hreflangPt = page.locator('link[rel="alternate"][hreflang="pt"]');
    await expect(hreflangPt).toHaveAttribute('href', 'https://toolwala.co/pt/categories/pdf-tools/');

    // Check title in Portuguese (category: PDF Ferramentas)
    const title = await page.title();
    expect(title).toContain('Ferramentas');
  });

  test('Tool page generates Portuguese alternates', async ({ page }) => {
    await page.goto('/pt/tools/image-compressor/');

    // Check canonical
    const canonical = page.locator('link[rel="canonical"]');
    await expect(canonical).toHaveAttribute('href', 'https://toolwala.co/pt/tools/image-compressor/');

    // Check hreflangs
    const hreflangPt = page.locator('link[rel="alternate"][hreflang="pt"]');
    await expect(hreflangPt).toHaveAttribute('href', 'https://toolwala.co/pt/tools/image-compressor/');

    // Verify that the title is dynamically translated to Portuguese (should not remain "Image Compressor")
    const h1 = page.locator('h1');
    await expect(h1).not.toHaveText('Image Compressor', { timeout: 10000 });
  });
});
