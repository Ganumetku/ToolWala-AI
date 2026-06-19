import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { categoriesData, getToolsByCategory } from '@/data/categories';
import { toolsData } from '@/data/tools';
import CategoryPageClient from './CategoryPageClient';
import { 
  buildCategoryMetadata, 
  buildFAQSchema, 
  buildWebPageSchema, 
  buildBreadcrumbJsonLd, 
  getLocalizedCanonicalUrl 
} from '@/lib/seo';
import { getTranslationServer } from '@/lib/i18n-server';

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return categoriesData.map((category) => ({
    slug: category.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const category = categoriesData.find((c) => c.slug === resolvedParams.slug);
  
  if (!category) {
    return {
      title: 'Category Not Found - ToolWala AI',
    };
  }

  let locale = "en";
  try {
    const { headers } = await import('next/headers');
    const headerList = await headers();
    locale = headerList.get('x-locale') || 'en';
  } catch (e) {}

  let seoTitle = category.seoTitle;
  let seoDescription = category.seoDescription;

  try {
    const fs = await import('fs');
    const path = await import('path');
    const messagesPath = path.join(process.cwd(), 'messages', `${locale}.json`);
    const messages = JSON.parse(fs.readFileSync(messagesPath, 'utf8'));
    if (messages.categories?.[category.id]) {
      seoTitle = messages.categories[category.id].seoTitle || seoTitle;
      seoDescription = messages.categories[category.id].seoDescription || seoDescription;
    }
  } catch (e) {}

  return buildCategoryMetadata(seoTitle, seoDescription, category.slug, category.keywords, locale);
}

export default async function Page({ params }: PageProps) {
  const resolvedParams = await params;
  const category = categoriesData.find((c) => c.slug === resolvedParams.slug);

  if (!category) {
    notFound();
  }

  const { t, locale } = await getTranslationServer();

  let seoTitle = category.seoTitle;
  let seoDescription = category.seoDescription;

  try {
    const fs = await import('fs');
    const path = await import('path');
    const messagesPath = path.join(process.cwd(), 'messages', `${locale}.json`);
    const messages = JSON.parse(fs.readFileSync(messagesPath, 'utf8'));
    if (messages.categories?.[category.id]) {
      seoTitle = messages.categories[category.id].seoTitle || seoTitle;
      seoDescription = messages.categories[category.id].seoDescription || seoDescription;
    }
  } catch (e) {}

  const categoryUrl = getLocalizedCanonicalUrl(`/categories/${category.slug}`, locale);

  const breadcrumbItems = [
    { name: t('nav.home', 'Home'), href: locale === 'en' ? '/' : `/${locale}` },
    { name: t('nav.categories', 'Categories'), href: locale === 'en' ? '/categories' : `/${locale}/categories` },
    { name: seoTitle, href: locale === 'en' ? `/categories/${category.slug}` : `/${locale}/categories/${category.slug}` }
  ];

  const categoryTools = getToolsByCategory(category.id, toolsData).filter(t => t.isVisible);
  
  const collectionPageSchema = {
    '@type': 'CollectionPage',
    '@id': `${categoryUrl}#collection`,
    'url': categoryUrl,
    'name': seoTitle,
    'description': seoDescription,
    'isPartOf': {
      '@type': 'WebSite',
      '@id': 'https://toolwala.co/#website',
      'url': 'https://toolwala.co',
      'name': 'ToolWala AI'
    },
    'about': {
      '@type': 'Thing',
      'name': category.title
    },
    'mainEntity': {
      '@type': 'ItemList',
      'numberOfItems': categoryTools.length,
      'itemListElement': categoryTools.map((tool, index) => ({
        '@type': 'ListItem',
        'position': index + 1,
        'url': `https://toolwala.co${locale === 'en' ? '' : '/' + locale}${tool.href}`
      }))
    }
  };

  const graph: any[] = [
    buildWebPageSchema(seoTitle, seoDescription, categoryUrl, locale),
    buildBreadcrumbJsonLd(breadcrumbItems),
    collectionPageSchema
  ];

  if (category.faqs && category.faqs.length > 0) {
    const faqSchema = buildFAQSchema(category.faqs.map((faq, index) => ({
      question: t(`categories.${category.id}.faq.q${index + 1}`, faq.question),
      answer: t(`categories.${category.id}.faq.a${index + 1}`, faq.answer)
    })));
    if (faqSchema) {
      graph.push(faqSchema);
    }
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': graph
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <CategoryPageClient slug={resolvedParams.slug} category={category} />
    </>
  );
}

