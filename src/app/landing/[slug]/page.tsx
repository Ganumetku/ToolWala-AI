import { notFound } from 'next/navigation';
import { landingPagesData } from '@/data/landingPages';
import SEOPageTemplate from '@/components/tools/SEOPageTemplate';
import { generateToolMetadataHelper } from '@/lib/seo';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return landingPagesData.map((lp) => ({
    slug: lp.slug,
  }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const landingPage = landingPagesData.find((lp) => lp.slug === slug);

  if (!landingPage) {
    return {
      title: 'Page Not Found | ToolWala AI',
    };
  }

  // Canonical handles correct trails
  return generateToolMetadataHelper(slug, landingPage.title, landingPage.metaDescription, `/landing/${slug}`);
}

export default async function LandingPage({ params }: PageProps) {
  const { slug } = await params;
  const landingPage = landingPagesData.find((lp) => lp.slug === slug);

  if (!landingPage) {
    notFound();
  }

  return <SEOPageTemplate slug={slug} />;
}
