import { prisma } from './db';
import { jsonDb } from './jsonDb';

export interface ToolTranslationData {
  toolSlug: string;
  locale: string;
  title: string;
  description: string;
  faq: { question: string; answer: string }[];
  seoTitle?: string | null;
  seoDescription?: string | null;
}

const singleTranslationCache: Record<string, { data: ToolTranslationData | null; timestamp: number }> = {};
const getAllTranslationsCache: Record<string, { data: Record<string, any>; timestamp: number }> = {};
const CACHE_TIMEOUT = 60000; // 60 seconds

export async function getToolTranslation(slug: string, locale: string): Promise<ToolTranslationData | null> {
  const cacheKey = `${slug}_${locale}`;
  const now = Date.now();
  if (singleTranslationCache[cacheKey] && (now - singleTranslationCache[cacheKey].timestamp < CACHE_TIMEOUT)) {
    return singleTranslationCache[cacheKey].data;
  }

  const queryFn = async () => {
    if (prisma) {
      try {
        const record = await prisma.toolTranslation.findUnique({
          where: {
            toolSlug_locale: {
              toolSlug: slug,
              locale
            }
          }
        });
        if (record) {
          return {
            toolSlug: record.toolSlug,
            locale: record.locale,
            title: record.title,
            description: record.description,
            faq: record.faq as any || [],
            seoTitle: record.seoTitle,
            seoDescription: record.seoDescription
          };
        }
      } catch (err) {
        console.error(`Error querying tool translation from Prisma db:`, err);
      }
    }

    // Fallback to jsonDb
    const translations = jsonDb.getToolTranslations();
    const record = translations.find(t => t.toolSlug === slug && t.locale === locale);
    if (record) {
      return {
        toolSlug: record.toolSlug,
        locale: record.locale,
        title: record.title,
        description: record.description,
        faq: record.faq || [],
        seoTitle: record.seoTitle,
        seoDescription: record.seoDescription
      };
    }
    return null;
  };

  const result = await queryFn();
  singleTranslationCache[cacheKey] = { data: result, timestamp: now };
  return result;
}
export async function getAllToolTranslations(locale: string): Promise<Record<string, any>> {
  const now = Date.now();
  if (getAllTranslationsCache[locale] && (now - getAllTranslationsCache[locale].timestamp < CACHE_TIMEOUT)) {
    return getAllTranslationsCache[locale].data;
  }

  const queryFn = async () => {
    const result: Record<string, any> = {};
    if (prisma) {
      try {
        const records = await prisma.toolTranslation.findMany({
          where: { locale }
        });
        for (const record of records) {
          result[record.toolSlug] = {
            title: record.title,
            description: record.description,
            intro: record.description,
            faqs: record.faq || [],
            meta_title: record.seoTitle,
            meta_description: record.seoDescription
          };
        }
        return result;
      } catch (err) {
        console.error(`Error querying all tool translations from Prisma db:`, err);
      }
    }

    // Fallback to jsonDb
    const translations = jsonDb.getToolTranslations();
    const localeTranslations = translations.filter(t => t.locale === locale);
    for (const record of localeTranslations) {
      result[record.toolSlug] = {
        title: record.title,
        description: record.description,
        intro: record.description,
        faqs: record.faq || [],
        meta_title: record.seoTitle,
        meta_description: record.seoDescription
      };
    }
    return result;
  };

  const result = await queryFn();
  getAllTranslationsCache[locale] = { data: result, timestamp: now };
  return result;
}

async function translateText(text: string, targetLang = 'hi'): Promise<string> {
  if (!text || !text.trim()) return '';
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Fetch failed: ${res.statusText}`);
    const data = await res.json();
    const translated = data[0].map((s: any) => s[0]).join('');
    return translated;
  } catch (err) {
    console.error('Translation error:', err);
    return text;
  }
}

async function translateFaqs(faqs: { question: string; answer: string }[], targetLang = 'hi') {
  const result = [];
  for (const faq of faqs) {
    const question = await translateText(faq.question, targetLang);
    const answer = await translateText(faq.answer, targetLang);
    result.push({ question, answer });
  }
  return result;
}

export async function getToolTranslationWithFallback(slug: string, locale: string): Promise<ToolTranslationData> {
  const hasDevanagari = (str: string) => /[\u0900-\u097F]/.test(str || '');

  // Try requested locale
  let data = await getToolTranslation(slug, locale);

  // If locale is Hindi, ensure we don't return English strings
  if (locale === 'hi') {
    const isUntranslated = !data || (!hasDevanagari(data.title) && !hasDevanagari(data.description));
    if (isUntranslated) {
      // Load English version as base for translation
      const enData = await getToolTranslationWithFallback(slug, 'en');
      
      const hiTitle = await translateText(enData.title, 'hi');
      const hiDesc = await translateText(enData.description, 'hi');
      const hiFaqs = await translateFaqs(enData.faq, 'hi');
      const hiSeoTitle = await translateText(enData.seoTitle || '', 'hi');
      const hiSeoDesc = await translateText(enData.seoDescription || '', 'hi');

      const translatedData: ToolTranslationData = {
        toolSlug: slug,
        locale: 'hi',
        title: hiTitle,
        description: hiDesc,
        faq: hiFaqs,
        seoTitle: hiSeoTitle,
        seoDescription: hiSeoDesc
      };

      // Save translation so it's cached for future requests
      await saveToolTranslation(translatedData);
      return translatedData;
    }
  }

  // If locale is Spanish, ensure we don't return English strings
  if (locale === 'es') {
    const enData = await getToolTranslation(slug, 'en');
    const isUntranslated = !data || (enData && data.title === enData.title && data.description === enData.description);
    if (isUntranslated) {
      const baseEn = enData || await getToolTranslationWithFallback(slug, 'en');
      const esTitle = await translateText(baseEn.title, 'es');
      const esDesc = await translateText(baseEn.description, 'es');
      const esFaqs = await translateFaqs(baseEn.faq, 'es');
      const esSeoTitle = await translateText(baseEn.seoTitle || '', 'es');
      const esSeoDesc = await translateText(baseEn.seoDescription || '', 'es');

      const translatedData: ToolTranslationData = {
        toolSlug: slug,
        locale: 'es',
        title: esTitle,
        description: esDesc,
        faq: esFaqs,
        seoTitle: esSeoTitle,
        seoDescription: esSeoDesc
      };

      await saveToolTranslation(translatedData);
      return translatedData;
    }
  }

  if (data) return data;

  // Fallback to English
  if (locale !== 'en') {
    data = await getToolTranslation(slug, 'en');
    if (data) return data;
  }

  // Absolute fallback values from hardcoded static assets
  let fallbackTitle = slug;
  let fallbackDesc = '';
  let fallbackFaqs: any[] = [];

  try {
    const { toolArticles } = require('@/data/toolArticles');
    const article = toolArticles[slug];
    if (article) {
      fallbackTitle = article.title;
      fallbackDesc = article.intro;
      fallbackFaqs = article.faqs;
    } else {
      const { toolsData } = require('@/data/tools');
      const tool = toolsData.find((t: any) => t.id === slug);
      if (tool) {
        fallbackTitle = tool.title;
        fallbackDesc = tool.description;
      }
    }
  } catch (e) {
    // ignore
  }

  return {
    toolSlug: slug,
    locale,
    title: fallbackTitle,
    description: fallbackDesc,
    faq: fallbackFaqs,
    seoTitle: fallbackTitle,
    seoDescription: fallbackDesc
  };
}

export async function saveToolTranslation(data: ToolTranslationData): Promise<void> {
  if (prisma) {
    try {
      await prisma.toolTranslation.upsert({
        where: {
          toolSlug_locale: {
            toolSlug: data.toolSlug,
            locale: data.locale
          }
        },
        update: {
          title: data.title,
          description: data.description,
          faq: data.faq as any,
          seoTitle: data.seoTitle,
          seoDescription: data.seoDescription
        },
        create: {
          toolSlug: data.toolSlug,
          locale: data.locale,
          title: data.title,
          description: data.description,
          faq: data.faq as any,
          seoTitle: data.seoTitle,
          seoDescription: data.seoDescription
        }
      });
      return;
    } catch (err) {
      console.error(`Error saving tool translation to Prisma db:`, err);
    }
  }

  // Fallback to jsonDb
  const translations = jsonDb.getToolTranslations();
  const existingIndex = translations.findIndex(t => t.toolSlug === data.toolSlug && t.locale === data.locale);
  const now = new Date().toISOString();
  
  if (existingIndex > -1) {
    translations[existingIndex] = {
      ...translations[existingIndex],
      title: data.title,
      description: data.description,
      faq: data.faq,
      seoTitle: data.seoTitle,
      seoDescription: data.seoDescription,
      updatedAt: now
    };
  } else {
    translations.push({
      id: Math.random().toString(36).substring(2, 9),
      toolSlug: data.toolSlug,
      locale: data.locale,
      title: data.title,
      description: data.description,
      faq: data.faq,
      seoTitle: data.seoTitle,
      seoDescription: data.seoDescription,
      createdAt: now,
      updatedAt: now
    });
  }
  jsonDb.saveToolTranslations(translations);
}
