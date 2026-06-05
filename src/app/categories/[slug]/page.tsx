import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { categoriesData } from '@/data/categories';
import CategoryPageClient from './CategoryPageClient';

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

  return {
    title: category.seoTitle,
    description: category.seoDescription,
    keywords: category.keywords.join(', '),
    alternates: {
      canonical: `https://toolwala.co/categories/${category.slug}`,
    },
    openGraph: {
      title: category.seoTitle,
      description: category.seoDescription,
      url: `https://toolwala.co/categories/${category.slug}`,
      type: 'website',
    }
  };
}

export default async function Page({ params }: PageProps) {
  const resolvedParams = await params;
  const category = categoriesData.find((c) => c.slug === resolvedParams.slug);

  if (!category) {
    notFound();
  }

  return <CategoryPageClient slug={resolvedParams.slug} category={category} />;
}
