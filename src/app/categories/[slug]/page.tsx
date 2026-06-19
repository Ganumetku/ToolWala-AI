import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { categoriesData } from '@/data/categories';
import CategoryPageClient from './CategoryPageClient';
import { buildCategoryMetadata } from '@/lib/seo';

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

  return <CategoryPageClient slug={resolvedParams.slug} category={category} />;
}
