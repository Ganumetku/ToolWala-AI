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

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.toolwala.co';
const SITE_NAME = 'ToolWala AI';

/** English SERP copy that beats stale DB/admin titles. Privacy is the click reason. */
const SEO_COPY_OVERRIDES: Record<string, { title: string; description: string }> = {
  'jpg-to-pdf': {
    title: 'JPG to PDF Converter Free – No Upload | ToolWala',
    description: 'Turn JPG, PNG, or WebP images into a single PDF in your browser. Nothing is uploaded. Fast, private, and free without watermarks.',
  },
  'merge-pdf': {
    title: 'Merge PDF – Combine Files in Your Browser, No Upload | ToolWala',
    description: 'Join two or more PDFs into a single file in this tab. Reorder pages and download. Files never leave your device.',
  },
  'compress-pdf': {
    title: 'Compress PDF in Your Browser – No Upload | ToolWala',
    description: 'Shrink PDF file sizes right on this page. Processing stays on your device—we never see the file.',
  },
  'cover-letter-generator': {
    title: 'Free Cover Letter Generator – No Signup | ToolWala',
    description: 'Generate a tailored, professional cover letter from your details and job description. 100% free with instant copy or download.',
  },
  'aadhaar-pdf-compressor': {
    title: 'Compress Aadhaar PDF to 300KB Online – No Upload | ToolWala',
    description: 'Compress e-Aadhaar PDF under 300KB in your browser. The password stays on your device. Useful for portal uploads with strict file size caps.',
  },
  'edit-pdf': {
    title: 'Edit PDF Pages Online Free – 100% Private | ToolWala',
    description: 'Edit PDF pages directly in your browser without uploading to any server. Fix text, annotate, sign, and organize pages privately and securely.',
  },
  'text-humanizer': {
    title: 'AI Text Humanizer Free Online | ToolWala',
    description: 'Convert robotic AI text into natural, human-sounding writing with conversational tone, improved rhythm, and clarity.',
  },
  'organize-pdf': {
    title: 'Organize PDF Pages Online Free – Reorder & Delete | ToolWala',
    description: 'Rearrange, rotate, or remove pages from any PDF document in your browser. Instant preview and secure local processing.',
  },
  'image-compressor': {
    title: 'Online Image Compressor & JPG Size Reducer | ToolWala',
    description: 'Compress JPG, PNG, and WebP images up to 80% without losing visual clarity. Fast, browser-native compression with zero uploads.',
  },
  'ssc-photo-resize': {
    title: 'SSC Photo & Signature Resize – Verified Presets | ToolWala',
    description: 'Format photo and signature for SSC CGL 2026, GD, Steno, and CHSL/MTS with verified 6×2 cm, 4×2 cm, and custom presets strictly between 10KB and 20KB.',
  },
  'passport-photo-maker': {
    title: 'Passport Photo Maker Online – 35×45mm & Custom Sizes | ToolWala',
    description: 'Create passport and ID photos with 35×45mm, 2×2 inch, and custom presets in your browser. White background option. Zero file uploads.',
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
    title: 'SSC फोटो व सिग्नेचर रिसाइज़ – ऑफिशियल साइज़ व प्रीसेट | ToolWala',
    description: 'SSC CGL 2026, GD, Steno और CHSL/MTS के लिए फोटो (35×45mm) और सिग्नेचर (10–20KB) काटें। ब्राउज़र में 100% सुरक्षित।',
  },
  'passport-photo-maker': {
    title: 'पासपोर्ट फोटो मेकर – 35×45mm, बिना अपलोड',
    description: 'सेल्फी से भारत का पासपोर्ट फोटो (35×45mm) ब्राउज़र में बनाएं। सफेद बैकग्राउंड। फोटो फोन पर रहती है।',
  },
};

export function getSiteUrl(path = ''): string {
  const base = SITE_URL.replace(/\/$/, '');
  let p = path.startsWith('/') ? path : `/${path}`;
  if (!p.includes('?') && !p.includes('#') && !/\.[a-z0-9]+$/i.test(p) && !p.endsWith('/')) {
    p += '/';
  }
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
  const siteUrl = SITE_URL;
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
    alternates: { canonical: url },
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
  const url = getSiteUrl('/blog/');

  return {
    title,
    description,
    alternates: { canonical: url },
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

  const isEditorialOrg = blog.author.name === 'ToolWala Editorial' || blog.author.name.toLowerCase().includes('toolwala');
  const authorNode = isEditorialOrg
    ? {
        '@type': 'Organization',
        '@id': `${SITE_URL}/#organization`,
        name: 'ToolWala',
        url: `${SITE_URL}/`,
      }
    : {
        '@type': 'Person',
        name: blog.author.name,
        ...(blog.author.avatar ? { image: blog.author.avatar } : {}),
      };

  return {
    '@type': 'Article',
    '@id': `${url}#article`,
    headline: blog.title,
    description: blog.excerpt,
    image: [image],
    url,
    datePublished: blog.publishedAt || blog.createdAt,
    dateModified: blog.updatedAt,
    author: authorNode,
    publisher: {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: 'ToolWala',
      url: `${SITE_URL}/`,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/icon-512.png`,
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
        name: 'ToolWala',
        url: `${SITE_URL}/`,
        logo: {
          '@type': 'ImageObject',
          '@id': `${SITE_URL}/#logo`,
          url: `${SITE_URL}/icon-512.png`,
          contentUrl: `${SITE_URL}/icon-512.png`,
          caption: 'ToolWala Logo',
          inLanguage: 'en-US',
          width: 512,
          height: 512,
        },
        description: 'Free, browser-native PDF, image, resume, and document utility tools running 100% locally with zero server uploads.',
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        url: `${SITE_URL}/`,
        name: 'ToolWala',
        description: 'Free PDF, image, and utility tools that run directly in your browser. Files stay on your device with zero cloud storage.',
        publisher: { '@id': `${SITE_URL}/#organization` },
        inLanguage: 'en-US',
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
      toolTitle = (translatedData.title && translatedData.title !== toolId) ? translatedData.title : enTitle;
    }

    let toolDesc = dbTranslation.description || '';
    if (!toolDesc) {
      const enDesc = baseEn.description || (landingPage ? landingPage.metaDescription : fallbackDesc);
      const { getToolTranslationWithFallback: getFallback } = await import('@/lib/tool-translation-service');
      const translatedData = await getFallback(toolId, locale);
      toolDesc = translatedData.description || enDesc;
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

  const siteUrl = SITE_URL;
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
      '@id': 'https://www.toolwala.co/#website',
      'url': 'https://www.toolwala.co/',
      'name': 'ToolWala'
    }
  };
}

export function buildEnrichedToolJsonLd(tool: any, url: string, categoryName: string, locale: string = 'en') {
  const applicationCategory =
    categoryName === 'Image Tools' ? 'MultimediaApplication' :
      categoryName === 'PDF Tools' ? 'UtilitiesApplication' :
        categoryName === 'Business Tools' || categoryName === 'Resume & Career' ? 'BusinessApplication' :
          categoryName === 'Developer Tools' ? 'DeveloperApplication' :
            'UtilitiesApplication';

  const inLanguage = locale === 'hi' ? 'hi-IN' : locale === 'en' ? 'en-US' : `${locale}-${locale.toUpperCase()}`;

  return {
    '@type': ['WebApplication', 'SoftwareApplication'],
    '@id': `${url}#webapp`,
    name: tool.title,
    description: tool.description,
    url: url,
    applicationCategory: applicationCategory,
    operatingSystem: 'Any (Web Browser)',
    browserRequirements: 'Requires HTML5 and JavaScript compatible modern web browser',
    inLanguage: inLanguage,
    featureList: [
      '100% Client-Side Processing in Browser RAM',
      'Zero Server Uploads for Supported Tools',
      'No Account or Registration Required',
      'Free Access'
    ],
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    },
    provider: {
      '@type': 'Organization',
      '@id': 'https://www.toolwala.co/#organization',
      name: 'ToolWala',
      url: 'https://www.toolwala.co/',
    },
  };
}

