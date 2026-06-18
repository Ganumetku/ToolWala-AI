import { headers } from 'next/headers';
import { DEFAULT_LOCALE, loadTranslations, getTranslation } from './i18n';

/** Server-side helper to translate keys within Server Components */
export async function getTranslationServer() {
  let locale = DEFAULT_LOCALE;
  try {
    const headerList = await headers();
    locale = headerList.get('x-locale') || DEFAULT_LOCALE;
  } catch {
    // fallback if headers() is called outside request context
  }
  const messages = await loadTranslations(locale);
  return {
    t: (key: string, fallback?: any) => {
      const val = getTranslation(messages, key, fallback);
      return val !== undefined ? val : key;
    },
    locale,
  };
}
