import type { Metadata } from 'next';
import { generateToolMetadataHelper } from '@/lib/seo';
import { headers } from 'next/headers';
import { getToolTranslationWithFallback } from '@/lib/tool-translation-service';
import { getTranslationServer } from '@/lib/i18n-server';
import { getLocalizedCanonicalUrl } from '@/lib/seo-client';
import { 
  buildFAQSchema, 
  buildBreadcrumbJsonLd, 
  buildWebPageSchema, 
  buildEnrichedToolJsonLd 
} from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  let locale = "en";
  try {
    const headerList = await headers();
    locale = headerList.get('x-locale') || 'en';
  } catch (e) {}

  const title = locale === 'hi'
    ? 'परीक्षा अंक कैलकुलेटर - प्रतिशत और ग्रेड की गणना करें'
    : 'Exam Marks Calculator - Calculate Percentage & Grades';
  
  const description = locale === 'hi'
    ? 'मुफ्त परीक्षा अंक कैलकुलेटर। विषयों के अंक दर्ज करें और कुल प्रतिशत, ग्रेड, औसत और विवरणात्मक रिपोर्ट प्राप्त करें। पीडीएफ डाउनलोड और प्रिंट सपोर्ट।'
    : 'Free Exam Marks Calculator. Enter subject marks to calculate total percentage, grades, GPA, average, and download visual reports. Print and PDF support.';

  return generateToolMetadataHelper(
    'exam-marks-calculator',
    title,
    description,
    '/tools/exam-marks-calculator/'
  );
}

export default async function ExamMarksCalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let locale = 'en';
  try {
    const headerList = await headers();
    locale = headerList.get('x-locale') || 'en';
  } catch (e) {}

  const translation = await getToolTranslationWithFallback('exam-marks-calculator', locale);

  const toolUrl = getLocalizedCanonicalUrl('/tools/exam-marks-calculator/', locale);
  const breadcrumbItems = [
    { name: locale === 'hi' ? 'मुख्यपृष्ठ' : 'Home', href: locale === 'en' ? '/' : `/${locale}/` },
    { name: locale === 'hi' ? 'टूल्स' : 'Tools', href: locale === 'en' ? '/tools/' : `/${locale}/tools/` },
    { name: translation.title || 'Exam Marks Calculator', href: toolUrl }
  ];

  const mockTool = {
    title: translation.title || 'Exam Marks Calculator',
    description: translation.description || 'Calculate exam percentage, grades, and stats.',
    faqs: translation.faq || []
  };

  const graph: any[] = [
    buildEnrichedToolJsonLd(mockTool, toolUrl, 'Calculator Tools'),
    buildWebPageSchema(mockTool.title, mockTool.description, toolUrl, locale),
    buildBreadcrumbJsonLd(breadcrumbItems)
  ];

  const faqSchema = buildFAQSchema(mockTool.faqs);
  if (faqSchema) {
    graph.push(faqSchema);
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
      {children}
    </>
  );
}
