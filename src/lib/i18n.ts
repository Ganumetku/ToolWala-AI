export const DEFAULT_LOCALE = 'en';

// Helper to look up nested keys (e.g. "home.hero_title")
export function getTranslation(messages: any, key: string, fallback?: any): any {
  if (!messages) return fallback !== undefined ? fallback : key;
  const parts = key.split('.');
  let current = messages;
  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      return fallback !== undefined ? fallback : key;
    }
  }
  return current;
}

const cache: Record<string, any> = {};

/** Dynamic import wrapper for messages catalog */
export async function loadTranslations(locale: string): Promise<any> {
  const cleanLocale = locale || DEFAULT_LOCALE;
  if (cache[cleanLocale]) {
    return cache[cleanLocale];
  }
  try {
    const data = await import(`../../messages/${cleanLocale}.json`);
    cache[cleanLocale] = data.default;
    return data.default;
  } catch (err) {
    console.error(`Failed to dynamically import translations for locale: ${cleanLocale}`, err);
    if (cleanLocale !== DEFAULT_LOCALE) {
      return loadTranslations(DEFAULT_LOCALE);
    }
    return {};
  }
}

/** Prepends the current language code to local links, preserving routes */
export function localizeHref(href: string, locale: string): string {
  if (!locale || locale === DEFAULT_LOCALE) return href;
  if (
    href.startsWith('/admin') ||
    href.startsWith('/api') ||
    href.startsWith('http') ||
    href.startsWith('//') ||
    href.startsWith('#')
  ) {
    return href;
  }
  const cleanHref = href.startsWith('/') ? href : `/${href}`;
  // Prevent duplicate prefixes e.g. /hi/hi/...
  if (cleanHref.startsWith(`/${locale}/`) || cleanHref === `/${locale}`) {
    return cleanHref;
  }
  return `/${locale}${cleanHref}`;
}
