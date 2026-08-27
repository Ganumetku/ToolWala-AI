import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Sparkles, ArrowRight, HelpCircle } from 'lucide-react';
import { getTranslationServer } from '@/lib/i18n-server';
import { MeshGradient } from '@/components/BackgroundEffects';
import FAQAccordion from '@/app/tools/[slug]/FAQAccordion';
import { hubsData } from '@/data/hubs';
import { landingPagesData } from '@/data/landingPages';
import { renderMarkdown } from '@/lib/markdown';
import ToolIcon from '@/components/ToolIcon';
import { 
  buildWebPageSchema, 
  buildBreadcrumbJsonLd, 
  buildFAQSchema,
  getLocalizedCanonicalUrl 
} from '@/lib/seo';

interface HubPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return hubsData.map((hub) => ({
    slug: hub.slug,
  }));
}

export async function generateMetadata({ params }: HubPageProps) {
  const { slug } = await params;
  const hub = hubsData.find((h) => h.slug === slug);

  if (!hub) {
    return {
      title: 'Hub Not Found | ToolWala AI',
    };
  }

  return {
    title: hub.title,
    description: hub.description,
    alternates: {
      canonical: `https://toolwala.co/hubs/${hub.slug}/`,
    }
  };
}

export default async function HubPage({ params }: HubPageProps) {
  const { slug } = await params;
  const hub = hubsData.find((h) => h.slug === slug);

  if (!hub) {
    notFound();
  }

  const { t, locale } = await getTranslationServer();
  const localizeHref = (href: string) => {
    if (locale === 'en') return href;
    const cleanHref = href.startsWith('/') ? href : '/' + href;
    return `/${locale}${cleanHref}`;
  };

  const hubUrl = getLocalizedCanonicalUrl(`/hubs/${hub.slug}`, locale);

  // Setup breadcrumbs
  const breadcrumbItems = [
    { name: t('nav.home', 'Home'), href: locale === 'en' ? '/' : `/${locale}` },
    { name: t('nav.tools', 'Tools'), href: localizeHref('/tools') },
    { name: hub.title, href: hubUrl }
  ];

  // Build schemas
  const breadcrumbJsonLd = buildBreadcrumbJsonLd(breadcrumbItems);
  const webpageJsonLd = buildWebPageSchema(hub.title, hub.description, hubUrl, locale);
  const faqSchema = buildFAQSchema(hub.faqs);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      webpageJsonLd,
      breadcrumbJsonLd,
      ...(faqSchema ? [faqSchema] : [])
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="bg-[#F6F8FC] dark:bg-[#030712] min-h-screen py-24 relative overflow-hidden font-sans">
        <MeshGradient />
        
        {/* Decorative Glow Grid */}
        <div className="absolute top-0 left-0 w-full h-[600px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent pointer-events-none z-0" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl relative z-10 text-left">
          {/* Breadcrumb Navigation */}
          <Link 
            href={localizeHref('/tools')} 
            className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-widest text-gray-500 hover:text-blue-500 transition-colors mb-10 group cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            {t('tools.back_to_directory', 'Back to Directory')}
          </Link>

          <div className="glass rounded-[2.5rem] border border-white/5 p-8 sm:p-14 bg-white/[0.01] shadow-2xl space-y-12">
            {/* Header section */}
            <div className="text-center max-w-3xl mx-auto space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-blue-400 border border-blue-500/20 shadow-md">
                <Sparkles className="w-3.5 h-3.5" />
                {hub.badgeText}
              </div>
              <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white uppercase leading-tight">
                {hub.h1}
              </h1>
              <p className="text-base sm:text-lg text-gray-400 font-medium leading-relaxed">
                {hub.intro}
              </p>
            </div>

            {/* Core Category Tools Grid */}
            <section className="space-y-6 pt-6 border-t border-white/5">
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-gray-500">Core Utilities & Tools</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {hub.relatedTools.map((tool) => (
                  <Link
                    key={tool.slug}
                    href={localizeHref(`/tools/${tool.slug}`)}
                    className="glass p-6 rounded-[2rem] border border-white/5 bg-white/[0.01] hover:border-blue-500/30 hover:bg-blue-500/[0.02] transition-all group flex flex-col justify-between cursor-pointer"
                  >
                    <div className="space-y-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600/10 text-blue-600 dark:text-white border border-blue-500/10">
                        <ToolIcon icon={tool.icon} className="w-6 h-6" strokeWidth={1.75} />
                      </div>
                      <h3 className="text-base font-black text-white group-hover:text-blue-400 transition-colors tracking-tight">
                        {tool.title}
                      </h3>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-blue-400 mt-6 group-hover:text-white transition-colors">
                      Open Tool
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            {/* 800+ Words Guidelines */}
            <section className="space-y-6 pt-6 border-t border-white/5 content-renderer prose prose-invert max-w-none text-gray-300 leading-relaxed font-sans">
              <div 
                className="space-y-4 text-sm [&_h2]:text-2xl [&_h2]:font-black [&_h2]:text-white [&_h2]:uppercase [&_h2]:tracking-tight [&_h2]:mt-8 [&_h2]:border-b [&_h2]:border-white/5 [&_h2]:pb-2 [&_h3]:text-xl [&_h3]:font-black [&_h3]:text-white [&_h3]:mt-6 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:space-y-2 [&_p]:mb-4 [&_strong]:font-bold [&_strong]:text-white"
                dangerouslySetInnerHTML={{ 
                  __html: renderMarkdown(hub.content)
                }} 
              />
            </section>

            {/* Target Landing Pages List */}
            {hub.landingPages.length > 0 && (
              <section className="space-y-6 pt-6 border-t border-white/5">
                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-gray-500">Related Application Helpers</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {hub.landingPages.map((lp) => {
                    const isLanding = landingPagesData.some(item => item.slug === lp.slug);
                    const targetHref = isLanding ? `/landing/${lp.slug}` : `/tools/${lp.slug}`;
                    return (
                      <Link 
                        key={lp.slug} 
                        href={localizeHref(targetHref)}
                        className="p-5 rounded-2xl border border-white/5 bg-[#0b0f19]/40 hover:border-blue-500/20 hover:bg-blue-500/[0.01] transition-all group flex items-center justify-between cursor-pointer"
                      >
                        <span className="text-xs font-black text-white group-hover:text-blue-400 transition-colors tracking-tight line-clamp-1">{lp.title}</span>
                        <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-white group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                      </Link>
                    );
                  })}
                </div>
              </section>
            )}

            {/* FAQs Accordion */}
            {hub.faqs.length > 0 && (
              <section className="space-y-6 pt-6 border-t border-white/5">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-blue-400" />
                  <h3 className="text-xl font-black text-white uppercase tracking-tight font-sans">Compliance FAQs</h3>
                </div>
                <div className="space-y-4">
                  {hub.faqs.map((faq, i) => (
                    <FAQAccordion key={i} question={faq.question} answer={faq.answer} />
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
