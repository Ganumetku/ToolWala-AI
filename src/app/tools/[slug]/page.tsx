import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft, ShieldCheck, Sparkles, HelpCircle, Layers, ChevronDown, ArrowRight } from 'lucide-react';
import { findToolBySlugServer } from '@/lib/tools-server';
import ToolFormRenderer from '@/components/ToolFormRenderer';
import ToolIcon from '@/components/ToolIcon';
import { MeshGradient } from '@/components/BackgroundEffects';
import FAQAccordion from './FAQAccordion';
import ToolVisibilityGuard from '@/components/ToolVisibilityGuard';
import ShareButtons from '@/components/ShareButtons';
import { headers } from 'next/headers';
import { getToolTranslationWithFallback } from '@/lib/tool-translation-service';
import WorkflowRecommendations from '@/components/tools/WorkflowRecommendations';
import PdfToolIcon from '@/components/PdfToolIcon';
import { 
  generateToolMetadataHelper, 
  buildBreadcrumbJsonLd, 
  buildEnrichedToolJsonLd, 
  buildWebPageSchema, 
  buildFAQSchema,
  getLocalizedCanonicalUrl 
} from '@/lib/seo';
import { getTranslationServer } from '@/lib/i18n-server';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;

  const tool = await findToolBySlugServer(slug);

  if (!tool) {
    return {
      title: 'Tool Not Found | ToolWala AI'
    };
  }

  const fallbackTitle = tool.seoMetadata?.title || `${tool.title} | ToolWala AI`;
  const fallbackDesc = tool.seoMetadata?.description || tool.description;

  return generateToolMetadataHelper(slug, fallbackTitle, fallbackDesc, `/tools/${slug}`);
}

export default async function DynamicToolPage({ params }: PageProps) {
  const { slug } = await params;

  const tool = await findToolBySlugServer(slug, true);

  if (!tool) {
    notFound();
  }

  const { t, locale } = await getTranslationServer();
  const localizeHref = (href: string) => {
    if (locale === 'en') return href;
    const cleanHref = href.startsWith('/') ? href : '/' + href;
    return `/${locale}${cleanHref}`;
  };

  const translation = await getToolTranslationWithFallback(slug, locale);
  tool.title = translation.title || tool.title;
  tool.description = translation.description || tool.description;
  if (translation.faq && translation.faq.length > 0) {
    tool.faqs = translation.faq;
  }

  // Schema Markup (LD-JSON)
  const toolUrl = getLocalizedCanonicalUrl(`/tools/${slug}`, locale);
  const categoryName = tool.category?.title || tool.categoryName || 'Utilities';
  
  const breadcrumbItems = [
    { name: t('nav.home', 'Home'), href: locale === 'en' ? '/' : `/${locale}` },
    { name: t('nav.tools', 'Tools'), href: localizeHref('/tools') },
    { name: tool.title, href: localizeHref(`/tools/${slug}`) }
  ];

  const graph: any[] = [
    buildEnrichedToolJsonLd(tool, toolUrl, categoryName),
    buildWebPageSchema(tool.title, tool.description, toolUrl, locale),
    buildBreadcrumbJsonLd(breadcrumbItems)
  ];

  const faqSchema = buildFAQSchema(tool.faqs);
  if (faqSchema) {
    graph.push(faqSchema);
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': graph
  };

  return (
    <ToolVisibilityGuard slug={slug}>
      <div className="bg-[#F6F8FC] dark:bg-[#030712] min-h-screen py-24 relative overflow-hidden transition-colors duration-250 font-sans">
        {/* Dynamic structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        {/* Background Glow */}
        <MeshGradient />
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
          
          {/* Navigation link */}
          <Link 
            href={localizeHref('/tools')} 
            className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-widest text-slate-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors mb-10 group cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            {t('tools.back_to_directory', 'Back to Directory')}
          </Link>
          
          {/* Main Tool Container */}
          <div className="glass rounded-[1.125rem] overflow-hidden border border-[#E6ECF5] dark:border-white/5 shadow-[0_10px_35px_rgba(15,23,42,0.06)] mb-16">
            
            {/* Header Banner */}
            <div className="p-5 sm:p-8 lg:p-12 border-b border-[#E6ECF5] dark:border-white/5 bg-[#FBFCFE] dark:bg-white/[0.02]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-8">
                <div className="flex items-start sm:items-center gap-3.5 sm:gap-6 flex-1 min-w-0">
                  <PdfToolIcon
                    toolId={tool.id || slug}
                    iconName={tool.icon}
                    category={categoryName}
                    size="xl"
                    className="shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">{tool.title}</h1>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-gray-400 font-medium mt-1 font-sans leading-relaxed">{tool.description}</p>
                    
                    {/* Reusable share component */}
                    <div className="mt-3 sm:mt-4">
                      <ShareButtons title={tool.title} />
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 self-start sm:self-center shrink-0 bg-emerald-50 dark:bg-emerald-500/10 px-3.5 py-2 rounded-2xl border border-emerald-200 dark:border-emerald-500/20">
                  <div className="flex flex-col items-start sm:items-end">
                    <span className="text-[9.5px] sm:text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-500">{t('tools.secure_processing', 'Secure Processing')}</span>
                    <span className="text-[9.5px] sm:text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-400">{t('tools.local_managed', '100% On-Device')}</span>
                  </div>
                  <ShieldCheck className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-600/70 dark:text-emerald-500/60 shrink-0" />
                </div>
              </div>
            </div>
            
            {/* Form Compiler Area */}
            <div className="p-6 sm:p-10 bg-white dark:bg-white dark:bg-black/[0.15]">
              <ToolFormRenderer
                toolId={tool.id}
                slug={tool.slug}
                inputsSchema={tool.inputs}
                ctaText={tool.ctaButtonText}
              />
            </div>
          </div>

          {/* Dynamic Deep-Dive Article */}
          {tool.articles && tool.articles.length > 0 && (
            <section className="py-16 border-t border-[#E6ECF5] dark:border-white/5">
              <div className="max-w-4xl mx-auto space-y-10">
                <div className="flex items-center gap-4 justify-center mb-10">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#E6ECF5] dark:via-white/10 to-transparent" />
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-white/5 border border-[#E6ECF5] dark:border-white/10 backdrop-blur-sm shadow-sm">
                    <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">{t('tools.tutorial_overview', 'Tutorial & Overview')}</span>
                  </div>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#E6ECF5] dark:via-white/10 to-transparent" />
                </div>

                {tool.articles.map((art: any, i: number) => (
                  <div key={i} className="glass p-8 sm:p-12 rounded-[1.125rem] border border-[#E6ECF5] dark:border-white/5 bg-white dark:bg-white/[0.01] shadow-[0_10px_35px_rgba(15,23,42,0.06)]">
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase mb-6">{art.title}</h2>
                    <div className="text-slate-600 dark:text-gray-400 text-sm font-medium leading-relaxed font-sans whitespace-pre-wrap">
                      {art.content}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Dynamic Workflow Recommendations */}
          <WorkflowRecommendations slug={slug} />

          {/* Dynamic FAQ List */}
          {tool.faqs && tool.faqs.length > 0 && (
            <section className="py-16 border-t border-[#E6ECF5] dark:border-white/5">
              <div className="max-w-3xl mx-auto space-y-8">
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4">
                    <HelpCircle className="w-3.5 h-3.5" /> {t('tools.support_center', 'Support Center')}
                  </div>
                  <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">{t('tools.faq_title', 'Frequently Asked Questions')}</h3>
                </div>

                <div className="space-y-4">
                  {tool.faqs.map((faq: any, i: number) => (
                    <FAQAccordion key={i} question={faq.question} answer={faq.answer} />
                  ))}
                </div>
              </div>
            </section>
          )}

        </div>
      </div>
    </ToolVisibilityGuard>
  );
}

export async function generateStaticParams() {
  try {
    const { jsonDb } = await import('@/lib/jsonDb');
    const tools = jsonDb.getTools();
    return tools.map((tool) => ({
      slug: tool.slug,
    }));
  } catch (err) {
    console.error("Failed to generate static params for tools:", err);
    return [];
  }
}
