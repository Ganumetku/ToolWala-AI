"use client";

import Link from 'next/link';
import { ChevronLeft, Sparkles, ShieldCheck, ArrowRight, HelpCircle } from 'lucide-react';
import { useTranslation } from '@/components/I18nContext';
import { MeshGradient } from '@/components/BackgroundEffects';
import FAQAccordion from '@/app/tools/[slug]/FAQAccordion';
import WorkflowRecommendations from '@/components/tools/WorkflowRecommendations';
import { landingPagesData } from '@/data/landingPages';
import { toolsData } from '@/data/tools';
import { getLocalizedCanonicalUrl } from '@/lib/seo-client';

interface SEOPageTemplateProps {
  slug: string;
}

export default function SEOPageTemplate({ slug }: SEOPageTemplateProps) {
  const { t, locale, localizeHref } = useTranslation();

  // Find page data from metadata config
  const pageData = landingPagesData.find(lp => lp.slug === slug);
  if (!pageData) return null;

  const pageUrl = getLocalizedCanonicalUrl(`/landing/${slug}`, locale);

  // Setup breadcrumbs
  const breadcrumbItems = [
    { name: t('nav.home', 'Home'), href: locale === 'en' ? '/' : `/${locale}` },
    { name: t('nav.tools', 'Tools'), href: localizeHref('/tools') },
    { name: pageData.title, href: pageUrl }
  ];

  // Build JSON-LD schemas
  const localeLang = locale === 'hi' ? 'hi-IN' : locale === 'en' ? 'en-US' : `${locale}-${locale.toUpperCase()}`;
  
  const webpageJsonLd = {
    '@type': 'WebPage',
    '@id': `${pageUrl}#webpage`,
    'url': pageUrl,
    'name': pageData.title,
    'description': pageData.metaDescription,
    'inLanguage': localeLang,
    'isPartOf': {
      '@type': 'WebSite',
      '@id': 'https://toolwala.co/#website',
      'url': 'https://toolwala.co',
      'name': 'ToolWala AI'
    }
  };

  const breadcrumbJsonLd = {
    '@type': 'BreadcrumbList',
    'itemListElement': breadcrumbItems.map((item, index) => ({
      '@type': 'ListItem',
      'position': index + 1,
      'name': item.name,
      'item': item.href.startsWith('http') ? item.href : `https://toolwala.co${item.href}`
    }))
  };

  const faqJsonLd = pageData.faqs.length > 0 ? {
    '@type': 'FAQPage',
    'mainEntity': pageData.faqs.map(faq => ({
      '@type': 'Question',
      'name': faq.question,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': faq.answer
      }
    }))
  } : null;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      webpageJsonLd,
      breadcrumbJsonLd,
      ...(faqJsonLd ? [faqJsonLd] : [])
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="bg-slate-50/50 dark:bg-[#030712] min-h-screen py-24 relative overflow-hidden font-sans transition-colors duration-250">
        <MeshGradient />
        
        {/* Decorative Glow Grid */}
        <div className="absolute top-0 left-0 w-full h-[600px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-500/5 dark:from-blue-900/20 via-transparent to-transparent pointer-events-none z-0" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl relative z-10 text-left animate-in fade-in duration-500">
          {/* Breadcrumb Back Navigation */}
          <Link 
            href={localizeHref('/tools')} 
            className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-widest text-gray-500 hover:text-blue-600 dark:hover:text-blue-500 transition-colors mb-10 group cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            {t('tools.back_to_directory', 'Back to Directory')}
          </Link>

          <div className="bg-white dark:glass rounded-[2.5rem] border border-gray-200 dark:border-white/5 p-8 sm:p-14 shadow-sm dark:shadow-2xl space-y-12">
            {/* Hero Header */}
            <div className="text-center max-w-3xl mx-auto space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 dark:bg-blue-500/10 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 shadow-sm">
                <Sparkles className="w-3.5 h-3.5" />
                {pageData.badgeText}
              </div>
              <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-gray-900 dark:text-white uppercase leading-tight">
                {pageData.h1}
              </h1>
              <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 font-medium leading-relaxed">
                {pageData.description}
              </p>

              {/* Core Call-to-Action Link Above the Fold */}
              <div className="pt-6">
                <Link
                  href={localizeHref(pageData.ctaHref)}
                  className="inline-flex items-center justify-center gap-3 px-10 py-5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-[0.2em] rounded-2xl transition-all shadow-md hover:scale-105 active:scale-95 cursor-pointer font-sans"
                >
                  {pageData.ctaText}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Secure Notification Banner */}
            <div className="flex items-center gap-4 bg-emerald-50 dark:bg-emerald-500/5 border border-emerald-200 dark:border-emerald-500/10 p-5 rounded-2xl max-w-2xl mx-auto">
              <ShieldCheck className="w-8 h-8 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed font-sans">
                <strong>100% Browser-Native:</strong> Your documents are optimized directly on your device. We never copy, upload, or process your files on our servers.
              </div>
            </div>

            {/* 800+ Words Long-Form SEO Content */}
            <section className="space-y-6 pt-6 border-t border-gray-200 dark:border-white/5 content-renderer font-sans text-gray-700 dark:text-gray-300 leading-relaxed">
              <div 
                className="space-y-6 text-sm [&>h2]:text-2xl [&>h2]:font-black [&>h2]:text-gray-900 dark:[&>h2]:text-white [&>h2]:uppercase [&>h2]:tracking-tight [&>h2]:mt-8 [&>h3]:text-xl [&>h3]:font-black [&>h3]:text-gray-900 dark:[&>h3]:text-white [&>h3]:mt-6 [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:space-y-2 [&>ol]:list-decimal [&>ol]:pl-6 [&>ol]:space-y-2"
                dangerouslySetInnerHTML={{ 
                  __html: pageData.content
                    .replace(/\n\n/g, '<br/>')
                    .replace(/### (.*)/g, '<h3 class="text-xl font-black text-gray-900 dark:text-white mt-6">$1</h3>')
                    .replace(/## (.*)/g, '<h2 class="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight mt-8 border-b border-gray-200 dark:border-white/5 pb-2">$1</h2>')
                    .replace(/\* \*\*(.*?)\*\*:(.*)/g, '<li><strong>$1</strong>: $2</li>')
                    .replace(/1\. \*\*(.*?)\*\*:(.*)/g, '<li><strong>$1</strong>: $2</li>')
                }} 
              />
            </section>

            {/* FAQs Accordion */}
            {pageData.faqs.length > 0 && (
              <section className="space-y-6 pt-6 border-t border-gray-200 dark:border-white/5">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Frequently Asked Questions</h3>
                </div>
                <div className="space-y-4">
                  {pageData.faqs.map((faq, i) => (
                    <FAQAccordion key={i} question={faq.question} answer={faq.answer} />
                  ))}
                </div>
              </section>
            )}

            {/* Related Resources / Articles */}
            {pageData.relatedBlogs.length > 0 && (
              <section className="space-y-6 pt-6 border-t border-gray-200 dark:border-white/5">
                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-gray-500">Related Articles & Guides</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {pageData.relatedBlogs.map((blog) => (
                    <Link 
                      key={blog.slug} 
                      href={localizeHref(`/blog/${blog.slug}`)}
                      className="p-5 rounded-2xl border border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-[#0b0f19]/40 hover:border-blue-500/30 hover:bg-blue-50/50 dark:hover:bg-blue-500/[0.01] transition-all group flex items-center justify-between cursor-pointer shadow-sm"
                    >
                      <span className="text-xs font-black text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors uppercase tracking-tight line-clamp-1">{blog.title}</span>
                      <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-white group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                    </Link>
                  ))}
                </div>
              </section>
            )}

          </div>

          {/* Workflow Recommendations widget */}
          <WorkflowRecommendations slug={pageData.ctaHref.split('/').pop() || slug} />
        </div>
      </div>
    </>
  );
}
