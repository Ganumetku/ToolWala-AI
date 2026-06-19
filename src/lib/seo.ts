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

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://toolwala.co';
const SITE_NAME = 'ToolWala AI';

export function getSiteUrl(path = ''): string {
  const base = SITE_URL.replace(/\/$/, '');
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${base}${p}`;
}

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
  enabledLocales.forEach((loc) => {
    if (loc !== 'en' && config[loc]?.seo_enabled) {
      languages[loc] = `${siteUrl}/${loc}${cleanPathNoSlash}/`;
    }
  });
  
  return languages;
}

export function getLocalizedCanonicalUrl(pathname: string, locale: string): string {
  const siteUrl = "https://toolwala.co";
  const parts = pathname.split('/');
  const cleanPath = ['hi', 'es', 'fr', 'de', 'pt', 'ar', 'id'].includes(parts[1])
    ? '/' + parts.slice(2).join('/')
    : pathname;
  
  const cleanPathNoSlash = cleanPath.replace(/\/$/, '');
  
  if (locale === 'en') {
    return `${siteUrl}${cleanPathNoSlash}/`;
  }
  return `${siteUrl}/${locale}${cleanPathNoSlash}/`;
}

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
  keywords: string[] = []
): Metadata {
  const url = getSiteUrl(path);
  return {
    title: `${title} | ${SITE_NAME}`,
    description,
    keywords,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      type: 'website',
      locale: 'en_US',
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
    // fallback
  }

  const dbTranslation = await getToolTranslationWithFallback(toolId, locale);
  const title = dbTranslation.seoTitle || dbTranslation.title || fallbackTitle;
  const description = dbTranslation.seoDescription || dbTranslation.description || fallbackDesc;

  const siteUrl = "https://toolwala.co";
  const parts = originalPathname.split('/');
  const cleanPath = ['hi', 'es', 'fr', 'de', 'pt', 'ar', 'id'].includes(parts[1])
    ? '/' + parts.slice(2).join('/')
    : originalPathname;
  
  const cleanPathNoSlash = cleanPath.replace(/\/$/, '');
  
  const languages: Record<string, string> = {
    'x-default': `${siteUrl}${cleanPathNoSlash}/`,
    'en': `${siteUrl}${cleanPathNoSlash}/`
  };
  
  const enabledLocales = getEnabledLocales();
  const config = getLanguagesConfig();
  enabledLocales.forEach((loc) => {
    if (loc !== 'en' && config[loc]?.seo_enabled) {
      languages[loc] = `${siteUrl}/${loc}${cleanPathNoSlash}/`;
    }
  });

  return {
    title,
    description,
    alternates: {
      canonical: `${siteUrl}${originalPathname.endsWith('/') ? originalPathname : originalPathname + '/'}`,
      languages
    },
    openGraph: {
      title,
      description,
      url: `${siteUrl}${originalPathname}`,
      siteName: "ToolWala AI",
      type: "website",
      locale: locale === 'en' ? 'en_US' : `${locale}_${locale.toUpperCase()}`,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
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

