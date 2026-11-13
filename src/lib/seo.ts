import type { Metadata } from 'next';
import type { Tool } from '@/data/tools';
import type { BlogPost } from '@/types/blog';
import type { BreadcrumbItem } from '@/lib/blog-seo';
import { buildFaqJsonLd } from '@/lib/blog-utils';
import { buildBlogBreadcrumbs } from '@/lib/blog-seo';
import { getTranslationServer } from '@/lib/i18n-server';
import { getEnabledLocales, getLanguagesConfig } from '@/lib/languages';
import { headers } from 'next/headers';
import { getToolTranslationWithFallback } from '@/lib/tool-translation-service';
import { landingPagesData } from '@/data/landingPages';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://toolwala.co';
const SITE_NAME = 'ToolWala AI';

/** English SERP copy that beats stale DB/admin titles. Privacy is the click reason. */
const SEO_COPY_OVERRIDES: Record<string, { title: string; description: string }> = {
  'jpg-to-pdf': {
    title: 'JPG to PDF – No Upload, Files Stay on Your Device',
    description: 'Turn JPG, PNG, or WebP images into a PDF in your browser. Nothing is uploaded. No signup, no watermark.',
  },
  'merge-pdf': {
    title: 'Merge PDF – Combine Files in Your Browser, No Upload',
    description: 'Join two or more PDFs in this tab. Reorder pages and download. Files never leave your device.',
  },
  'compress-pdf': {
    title: 'Compress PDF in Your Browser – No Upload',
    description: 'Shrink a PDF on this page. Processing stays on your device — we never see the file.',
  },
  'cover-letter-generator': {
    title: 'Free Cover Letter Generator – No Signup | ToolWala',
    description: 'Write a cover letter from your details and the job post. Free, no account, ready to copy or download.',
  },
  'aadhaar-pdf-compressor': {
    title: 'Compress Aadhaar PDF under 300KB – No Upload',
    description: 'Shrink e-Aadhaar to under 300KB in your browser. The password stays on your device. Built for UIDAI and KYC portals.',
  },
  'ssc-photo-resize': {
    title: 'SSC Photo Resize – 35×45mm Under 50KB, No Upload',
    description: 'Crop a photo to SSC size (3.5 × 4.5 cm) under 50KB in your browser. Nothing is uploaded to a server.',
  },
  'passport-photo-maker': {
    title: 'Passport Photo Maker – 35×45mm, No Upload',
    description: 'Make an India passport photo (35×45mm) from a selfie in your browser. White background. Files stay on your phone.',
  },
};

const HI_SEO_COPY_OVERRIDES: Record<string, { title: string; description: string }> = {
  'jpg-to-pdf': {
    title: 'JPG से PDF – बिना अपलोड, फ़ाइल डिवाइस पर रहती है',
    description: 'JPG, PNG या WebP को ब्राउज़र में PDF बनाएं। कुछ अपलोड नहीं होता। साइनअप नहीं, वॉटरमार्क नहीं।',
  },
  'aadhaar-pdf-compressor': {
    title: 'आधार PDF 300KB में कंप्रेस करें – बिना अपलोड',
    description: 'e-Aadhaar को ब्राउज़र में 300KB से कम करें। पासवर्ड आपके डिवाइस पर रहता है। UIDAI और KYC पोर्टल के लिए।',
  },
  'ssc-photo-resize': {
    title: 'SSC फोटो रिसाइज़ – 35×45mm, 50KB, बिना अपलोड',
    description: 'SSC साइज़ (3.5 × 4.5 सेमी) और 50KB के अंदर फोटो काटें। फ़ाइल सर्वर पर नहीं जाती।',
  },
  'passport-photo-maker': {
    title: 'पासपोर्ट फोटो मेकर – 35×45mm, बिना अपलोड',
    description: 'सेल्फी से भारत का पासपोर्ट फोटो (35×45mm) ब्राउज़र में बनाएं। सफेद बैकग्राउंड। फोटो फोन पर रहती है।',
  },
};

export function getSiteUrl(path = ''): string {
  const base = SITE_URL.replace(/\/$/, '');
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${base}${p}`;
}

export const INDIA_ONLY_SLUGS = new Set([
  'ssc-photo-resize',
  'upsc-photo-resize',
  'crop-aadhaar-card',
  'aadhaar-pdf-compressor',
  'aadhaar-masking-tool',
  'pan-card-resize',
  'income-tax-calculator',
  'gst-calculator',
  'exam-marks-calculator',
  'exam-photo-resizer',
  'gov-form-image-compressor',
  'gov-form-pdf-compressor',
  'how-to-calculate-exam-percentage-easily',
  // Landing pages
  'photo-resize-to-20kb',
  'photo-resize-to-50kb',
  'photo-resize-to-100kb',
  'signature-resize-to-20kb',
  'signature-resize-to-50kb',
  'compress-image-to-20kb',
  'compress-image-to-50kb',
  'compress-pdf-to-100kb',
  'compress-pdf-to-200kb',
  'image-resize-in-kb',
  'compress-image-government-portals',
]);

export function getAlternateLanguages(pathname: string): Record<string, string> {
  const siteUrl = "https://toolwala.co";
  const parts = pathname.split('/');
  const cleanPath = ['hi', 'es', 'fr', 'de', 'pt', 'ar', 'id'].includes(parts[1])
    ? '/' + parts.slice(2).join('/')
    : pathname;
  
  const cleanPathNoSlash = cleanPath.replace(/\/$/, '');
  
  const languages: Record<string, string> = {
    'x-default': `${siteUrl}${cleanPathNoSlash}/`,
    'en': `${siteUrl}${cleanPathNoSlash}/`
  };
  
  const enabledLocales = getEnabledLocales();
  const config = getLanguagesConfig();
  const isIndiaOnly = Array.from(INDIA_ONLY_SLUGS).some((slug) => cleanPathNoSlash.includes(slug));
  
  enabledLocales.forEach((loc) => {
    if (loc !== 'en' && config[loc]?.seo_enabled) {
      if (isIndiaOnly && loc !== 'hi') {
        return;
      }
      languages[loc] = `${siteUrl}/${loc}${cleanPathNoSlash}/`;
    }
  });
  
  return languages;
}

import { getLocalizedCanonicalUrl } from './seo-client';
export { getLocalizedCanonicalUrl };


export function buildToolMetadata(tool: Tool): Metadata {
  const title = `${tool.title} – Free Online Tool`;
  const description = tool.description;
  const url = getSiteUrl(tool.href);

  return {
    title,
    description,
    keywords: tool.tags,
    alternates: { canonical: tool.href },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      type: 'website',
      locale: 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    robots: { index: true, follow: true },
  };
}

export function buildCategoryMetadata(
  title: string,
  description: string,
  slug: string,
  keywords: string[] = [],
  locale: string = 'en'
): Metadata {
  const path = `/categories/${slug}`;
  const canonical = getLocalizedCanonicalUrl(path, locale);
  const languages = getAlternateLanguages(path);
  const url = getSiteUrl(locale === 'en' ? `/categories/${slug}` : `/${locale}/categories/${slug}`);

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical,
      languages
    },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      type: 'website',
      locale: locale === 'en' ? 'en_US' : `${locale}_${locale.toUpperCase()}`,
    },
    twitter: { card: 'summary_large_image', title, description },
  };
}

export function buildToolJsonLd(tool: Tool) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: tool.title,
    description: tool.description,
    url: getSiteUrl(tool.href),
    applicationCategory: tool.category,
    operatingSystem: 'Web Browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    provider: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
  };
}

export function buildBlogMetadata(blog: BlogPost, locale: string = 'en'): Metadata {
  const title = blog.seoMetadata?.title || `${blog.title} | ${SITE_NAME}`;
  const description =
    blog.seoMetadata?.description ||
    blog.excerpt ||
    blog.content.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim().slice(0, 160);
  const keywords =
    blog.seoMetadata?.keywords?.split(',').map((k) => k.trim()).filter(Boolean) || blog.tags;
  
  const path = `/blog/${blog.slug}`;
  const canonical = getLocalizedCanonicalUrl(path, locale);
  const languages = getAlternateLanguages(path);
  const url = getSiteUrl(locale === 'en' ? `/blog/${blog.slug}` : `/${locale}/blog/${blog.slug}`);
  const image = blog.thumbnail || `${SITE_URL}/og-image.png`;
  const isPublished = blog.status === 'published';

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical,
      languages
    },
    openGraph: {
      title,
      description,
      type: 'article',
      url,
      siteName: SITE_NAME,
      locale: locale === 'en' ? 'en_US' : `${locale}_${locale.toUpperCase()}`,
      publishedTime: blog.publishedAt || blog.createdAt,
      modifiedTime: blog.updatedAt,
      authors: [blog.author.name],
      section: blog.category,
      tags: blog.tags,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: blog.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [{ url: image, alt: blog.title }],
      creator: '@toolwala',
      site: '@toolwala',
    },
    robots: isPublished
      ? { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large' } }
      : { index: false, follow: false },
  };
}

export function buildBlogArchiveMetadata(
  title: string,
  description: string,
  path: string,
  keywords: string[] = [],
  locale: string = 'en'
): Metadata {
  const canonical = getLocalizedCanonicalUrl(path, locale);
  const languages = getAlternateLanguages(path);
  const url = getSiteUrl(locale === 'en' ? path : `/${locale}${path}`);

  return {
    title: `${title} | ${SITE_NAME}`,
    description,
    keywords,
    alternates: {
      canonical,
      languages
    },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      type: 'website',
      locale: locale === 'en' ? 'en_US' : `${locale}_${locale.toUpperCase()}`,
      images: [{ url: `${SITE_URL}/og-image.png`, width: 1200, height: 630, alt: title }],
    },
    twitter: { card: 'summary_large_image', title, description },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  };
}

export function buildBlogIndexMetadata(): Metadata {
  const title = 'ToolWala AI Blog – Modern AI, PDF & Design Insights';
  const description =
    'Stay ahead with guides on local browser OCR, image compression, ATS resumes, and high-performance developer utilities on ToolWala AI.';
  const url = getSiteUrl('/blog');

  return {
    title,
    description,
    alternates: { canonical: '/blog' },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      type: 'website',
      images: [{ url: `${SITE_URL}/og-image.png`, width: 1200, height: 630, alt: 'ToolWala AI Blog' }],
    },
    twitter: { card: 'summary_large_image', title, description },
  };
}

export function buildBreadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: getSiteUrl(item.href),
    })),
  };
}

export async function buildArticleJsonLd(blog: BlogPost) {
  let locale = 'en';
  try {
    const headerList = await headers();
    locale = headerList.get('x-locale') || 'en';
  } catch (e) {
    // fallback
  }

  const url = getSiteUrl(locale === 'en' ? `/blog/${blog.slug}` : `/${locale}/blog/${blog.slug}`);
  const image = blog.thumbnail || `${SITE_URL}/og-image.png`;
  const wordCount = blog.content.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;

  const localeLang = locale === 'hi' ? 'hi-IN' : locale === 'en' ? 'en-US' : `${locale}-${locale.toUpperCase()}`;

  return {
    '@type': 'Article',
    '@id': `${url}#article`,
    headline: blog.title,
    description: blog.excerpt,
    image: [image],
    url,
    datePublished: blog.publishedAt || blog.createdAt,
    dateModified: blog.updatedAt,
    author: {
      '@type': 'Person',
      name: blog.author.name,
      ...(blog.author.avatar ? { image: blog.author.avatar } : {}),
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/og-image.png`,
      },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    keywords: blog.tags.join(', '),
    articleSection: blog.category,
    wordCount,
    inLanguage: localeLang,
  };
}

export async function buildBlogPostingJsonLd(blog: BlogPost) {
  const article = await buildArticleJsonLd(blog);
  return { ...article, '@type': 'BlogPosting' };
}

export async function buildBlogStructuredData(blog: BlogPost) {
  const breadcrumbs = buildBlogBreadcrumbs(blog);
  const articleNode = await buildArticleJsonLd(blog);
  const graph: Record<string, unknown>[] = [
    articleNode,
    buildBreadcrumbJsonLd(breadcrumbs),
  ];

  const faq = buildFaqJsonLd(blog.faqs);
  if (faq) {
    const { '@context': _ctx, ...faqNode } = faq as Record<string, unknown> & { '@context'?: string };
    graph.push(faqNode);
  }

  return { '@context': 'https://schema.org', '@graph': graph };
}

export function buildWebsiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${SITE_URL}/#organization`,
        name: SITE_NAME,
        url: SITE_URL,
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE_NAME,
        publisher: { '@id': `${SITE_URL}/#organization` },
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${SITE_URL}/?search={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      },
    ],
  };
}

export async function generateToolMetadataHelper(
  toolId: string,
  fallbackTitle: string,
  fallbackDesc: string,
  path: string
): Promise<Metadata> {
  let locale = 'en';
  let originalPathname = path;
  try {
    const headerList = await headers();
    locale = headerList.get('x-locale') || 'en';
    originalPathname = headerList.get('x-original-pathname') || path;
  } catch (e) {
    if (typeof global !== 'undefined' && (global as any).mockLocale) {
      locale = (global as any).mockLocale;
      originalPathname = (global as any).mockPathname || path;
    }
  }

  const dbTranslation = await getToolTranslationWithFallback(toolId, locale);
  const landingPage = landingPagesData.find(lp => lp.slug === toolId);
  const baseEn = await getToolTranslationWithFallback(toolId, 'en');

  let title = '';
  let description = '';

  if (locale === 'en') {
    const override = SEO_COPY_OVERRIDES[toolId];
    title = override?.title
      || ((dbTranslation.seoTitle && dbTranslation.seoTitle !== toolId) ? dbTranslation.seoTitle :
      (landingPage ? landingPage.title : (dbTranslation.title && dbTranslation.title !== toolId ? dbTranslation.title : fallbackTitle)));
    description = override?.description
      || ((dbTranslation.seoDescription && dbTranslation.seoDescription !== "") ? dbTranslation.seoDescription :
      (landingPage ? landingPage.metaDescription : (dbTranslation.description || fallbackDesc)));
  } else {
    // Non-English locale. Build SEO title/description safely.
    let toolTitle = dbTranslation.title && dbTranslation.title !== toolId ? dbTranslation.title : '';
    if (!toolTitle) {
      const enTitle = baseEn.title && baseEn.title !== toolId ? baseEn.title : (landingPage ? landingPage.title : fallbackTitle);
      const { getToolTranslationWithFallback: getFallback } = await import('@/lib/tool-translation-service');
      const translatedData = await getFallback(toolId, locale);
      toolTitle = translatedData.title;
    }

    let toolDesc = dbTranslation.description || '';
    if (!toolDesc) {
      const enDesc = baseEn.description || (landingPage ? landingPage.metaDescription : fallbackDesc);
      const { getToolTranslationWithFallback: getFallback } = await import('@/lib/tool-translation-service');
      const translatedData = await getFallback(toolId, locale);
      toolDesc = translatedData.description;
    }

    const hiOverride = locale === 'hi' ? HI_SEO_COPY_OVERRIDES[toolId] : undefined;

    // Try to get clean seoTitle
    let rawSeoTitle = hiOverride?.title
      || ((dbTranslation.seoTitle && dbTranslation.seoTitle !== toolId) ? dbTranslation.seoTitle : '');
    
    if (rawSeoTitle) {
      title = rawSeoTitle;
    } else {
      // Construct SEO title cleanly based on locale
      if (locale === 'hi') {
        title = `${toolTitle} - मुफ्त ऑनलाइन टूल`;
      } else if (locale === 'es') {
        title = `${toolTitle} - Herramienta Gratuita`;
      } else if (locale === 'pt') {
        title = `${toolTitle} - Ferramenta Gratuita`;
      } else if (locale === 'fr') {
        title = `${toolTitle} - Outil en ligne gratuit`;
      } else if (locale === 'de') {
        title = `${toolTitle} - Kostenloses Online-Tool`;
      } else if (locale === 'id') {
        title = `${toolTitle} - Alat Online Gratis`;
      } else if (locale === 'ar') {
        title = `${toolTitle} - أداة مجانية على الإنترنت`;
      } else {
        title = `${toolTitle} - Free Online Tool`;
      }
    }

    // Replace English proper nouns / tool titles inside the seoTitle and seoDescription if they were not translated
    if (baseEn && baseEn.title && toolTitle) {
      const englishName = baseEn.title;
      const escapedEnglishName = englishName.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      const regex = new RegExp(escapedEnglishName, 'gi');
      if (!hiOverride) {
        title = title.replace(regex, toolTitle);
      }

      if (hiOverride?.description) {
        description = hiOverride.description;
      } else if (dbTranslation.seoDescription) {
        description = dbTranslation.seoDescription.replace(regex, toolTitle);
      } else {
        description = toolDesc.replace(regex, toolTitle);
      }
    } else {
      description = hiOverride?.description || dbTranslation.seoDescription || toolDesc;
    }

    // Ensure proper casing & translation of AI -> IA for Romance languages, and AI -> एआई for Hindi
    if (['es', 'pt', 'fr'].includes(locale)) {
      title = title.replace(/\bAI\b/gi, 'IA');
      description = description.replace(/\bAI\b/gi, 'IA');
    } else if (locale === 'hi') {
      title = title.replace(/\bAI\b/gi, 'एआई');
      description = description.replace(/\bAI\b/gi, 'एआई');
    }
  }
  try {
    // Debug logging removed — was writing to scratch/seo_debug.log in production
  } catch (e) {
    // ignore
  }

  const siteUrl = "https://toolwala.co";
  const languages = getAlternateLanguages(originalPathname);
  const canonicalPath = originalPathname.endsWith('/') ? originalPathname : `${originalPathname}/`;
  const canonicalUrl = `${siteUrl}${canonicalPath}`;

  return {
    // Use absolute title to bypass root template — this helper already builds final titles
    // without the template, so we avoid double-branding like "Title | ToolWala AI | ToolWala AI"
    title: { absolute: title },
    description,
    alternates: {
      canonical: canonicalUrl,
      languages
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: "ToolWala AI",
      type: "website",
      locale: locale === 'en' ? 'en_US' : `${locale}_${locale.toUpperCase()}`,
      images: [
        {
          url: `${siteUrl}/og-image.png`,
          width: 1200,
          height: 630,
          alt: title,
        }
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${siteUrl}/og-image.png`],
    }
  };
}

export function buildFAQSchema(faqs: { question: string; answer: string }[]) {
  if (!faqs || faqs.length === 0) return null;
  return {
    '@type': 'FAQPage',
    'mainEntity': faqs.map(faq => ({
      '@type': 'Question',
      'name': faq.question,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': faq.answer
      }
    }))
  };
}

export function buildWebPageSchema(title: string, description: string, url: string, locale: string = 'en') {
  return {
    '@type': 'WebPage',
    '@id': `${url}#webpage`,
    'url': url,
    'name': title,
    'description': description,
    'inLanguage': locale === 'en' ? 'en-US' : `${locale}-${locale.toUpperCase()}`,
    'isPartOf': {
      '@type': 'WebSite',
      '@id': 'https://toolwala.co/#website',
      'url': 'https://toolwala.co',
      'name': 'ToolWala AI'
    }
  };
}

export function buildEnrichedToolJsonLd(tool: any, url: string, categoryName: string) {
  const applicationCategory = 
    categoryName === 'Image Tools' ? 'MultimediaApplication' :
    categoryName === 'PDF Tools' ? 'DesignApplication' :
    'UtilitiesApplication';

  return {
    '@type': 'SoftwareApplication',
    '@id': `${url}#software`,
    name: tool.title,
    description: tool.description,
    url: url,
    applicationCategory: applicationCategory,
    operatingSystem: 'Web Browser',
    browserRequirements: 'Requires HTML5 compatible web browser',
    featureList: [
      '100% Client-Side Processing',
      'No Signups required',
      'GDPR & CCPA Private (Local Only)'
    ],
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    provider: {
      '@type': 'Organization',
      '@id': 'https://toolwala.co/#organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
  };
}

