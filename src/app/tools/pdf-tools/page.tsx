import Link from 'next/link';
import { 
  ChevronLeft, Shield, Files, ArrowRight, Sparkles 
} from 'lucide-react';
import { toolsData } from '@/data/tools';
import { getTranslationServer } from '@/lib/i18n-server';
import { MeshGradient, FloatingParticles } from '@/components/BackgroundEffects';
import ToolArticle from '@/components/ToolArticle';
import PdfToolIcon from '@/components/PdfToolIcon';
import { toolArticles } from '@/data/toolArticles';
import { 
  buildFAQSchema, 
  buildBreadcrumbJsonLd, 
  getLocalizedCanonicalUrl 
} from '@/lib/seo';

export default async function Page() {
  const { t, locale } = await getTranslationServer();

  const getTool = (id: string) => toolsData.find(t => t.id === id);

  const groups = [
    {
      title: t('pdf_dashboard.organize', 'Organize PDF'),
      icon: '🧩',
      description: t('pdf_dashboard.organize_desc', 'Merge, split, remove pages, or organize PDF files visually.'),
      toolIds: ['pdf-compare', 'merge-pdf', 'split-pdf', 'remove-pages', 'organize-pdf', 'add-page-numbers-to-pdf', 'rotate-pdf']
    },
    {
      title: t('pdf_dashboard.convert', 'Convert PDF'),
      icon: '📂',
      description: t('pdf_dashboard.convert_desc', 'Convert document layouts to PDF, or convert PDF pages to standard formats.'),
      toolIds: ['pdf-to-jpg', 'jpg-to-pdf', 'pdf-to-word-converter', 'word-to-pdf-converter']
    },
    {
      title: t('pdf_dashboard.optimize', 'Optimize PDF'),
      icon: '⚙️',
      description: t('pdf_dashboard.optimize_desc', 'Compress file sizes, crop page margins, and edit layouts locally.'),
      toolIds: ['compress-pdf', 'crop-pdf', 'edit-pdf']
    },
    {
      title: t('pdf_dashboard.secure', 'Security'),
      icon: '🔒',
      description: t('pdf_dashboard.secure_desc', 'Protect your files, sign documents, unlock password protection, or add watermarks.'),
      toolIds: ['protect-pdf', 'unlock-pdf', 'watermark-pdf', 'sign-pdf']
    },
    {
      title: t('pdf_dashboard.ai_ocr', 'OCR & AI'),
      icon: '🤖',
      description: t('pdf_dashboard.ai_ocr_desc', 'Extract text from scanned documents or summarize PDFs locally with AI.'),
      toolIds: ['pdf-ocr', 'pdf-summarizer']
    }
  ];

  const popularToolIds = ['merge-pdf', 'compress-pdf', 'split-pdf', 'pdf-ocr'];
  const popularTools = popularToolIds
    .map(id => toolsData.find(t => t.id === id))
    .filter((t): t is typeof toolsData[0] => !!t);

  const categoryUrl = getLocalizedCanonicalUrl('/tools/pdf-tools', locale);

  const breadcrumbItems = [
    { name: t('nav.home', 'Home'), href: locale === 'en' ? '/' : `/${locale}` },
    { name: t('nav.tools', 'Tools'), href: locale === 'en' ? '/tools' : `/${locale}/tools` },
    { name: t('nav.pdf_suite', 'PDF Suite'), href: locale === 'en' ? '/tools/pdf-tools' : `/${locale}/tools/pdf-tools` }
  ];

  const faqs = [
    {
      question: t('categories.pdf-tools.faq.q1', "Are my PDF files secure on ToolWala AI?"),
      answer: t('categories.pdf-tools.faq.a1', "Yes. All processing is executed 100% locally in your browser. Your documents never touch our servers or any cloud database.")
    },
    {
      question: t('categories.pdf-tools.faq.q2', "Is this PDF toolkit completely free?"),
      answer: t('categories.pdf-tools.faq.a2', "Absolutely. All document conversion, page sorting, split, and compression operations are fully free with no download caps.")
    }
  ];

  const faqSchema = buildFAQSchema(faqs);
  const breadcrumbSchema = buildBreadcrumbJsonLd(breadcrumbItems);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      breadcrumbSchema,
      ...(faqSchema ? [faqSchema] : [])
    ]
  };

  const localizeHref = (href: string) => {
    if (locale === 'en') return href;
    return `/${locale}${href}`;
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="bg-[#F6F8FC] dark:bg-[#030712] min-h-screen py-24 relative overflow-hidden font-sans transition-colors duration-250">
        <MeshGradient />
        <FloatingParticles />

        {/* Background Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-blue-600/5 blur-[120px] -z-10" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
          
          {/* Back to Directory Link */}
          <Link 
            href={localizeHref("/tools")} 
            className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors mb-8 group cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            {t('tools.back_to_directory', 'Back to Directory')}
          </Link>

          {/* Main Dashboard Block */}
          <div className="rounded-[2.5rem] border border-slate-200/80 dark:border-white/10 bg-white/90 dark:bg-[#0c1222]/80 backdrop-blur-xl overflow-hidden mb-16 shadow-xl">

            {/* HEADER HERO */}
            <div className="p-8 sm:p-10 border-b border-slate-200/80 dark:border-white/10 bg-white/60 dark:bg-black/[0.15]">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
                <div className="flex items-center gap-5 sm:gap-6 text-left">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-[0_0_25px_rgba(37,99,235,0.35)] shrink-0">
                    <Files className="w-7 h-7" />
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
                      {t('nav.pdf_suite', 'PDF Suite')}
                    </h1>
                    <p className="text-slate-600 dark:text-gray-400 text-sm font-medium mt-1">
                      {t('home.hero_pdf_subtitle', 'Browse all client-side PDF utilities. Free, secure, and processing locally.')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-emerald-500/10 px-3.5 py-1.5 rounded-xl border border-emerald-500/20 self-start">
                  <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">100% Client-Side</span>
                </div>
              </div>
            </div>

            <div className="p-8 sm:p-10 bg-slate-50/50 dark:bg-black/[0.2] border-b border-slate-200/80 dark:border-white/10">
              {/* Popular Tools Tray */}
              <div className="mb-2">
                <h2 className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-gray-400 mb-5 flex items-center gap-2 text-left">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 animate-pulse" />
                  {t('pdf_dashboard.popular_tools', 'Popular PDF Utilities')}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {popularTools.map((tool) => {
                    const displayTitle = t(`tools.${tool.id}.title`, tool.title);
                    const displayDesc = t(`tools.${tool.id}.description`, tool.description);
                    return (
                      <Link
                        key={tool.id}
                        href={localizeHref(tool.href)}
                        className="flex items-center gap-3.5 p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/10 hover:border-blue-500/50 dark:hover:border-blue-500/40 hover:bg-blue-50/40 dark:hover:bg-blue-600/5 hover:shadow-[0_8px_20px_rgba(37,99,235,0.08)] transition-all group cursor-pointer text-left"
                      >
                        <PdfToolIcon
                          toolId={tool.id}
                          iconName={tool.icon}
                          category={tool.category || "PDF Tools"}
                          size="sm"
                          className="shrink-0 group-hover:scale-105 transition-transform"
                        />
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">{displayTitle}</h4>
                          <p className="text-[10px] text-slate-500 dark:text-gray-400 font-semibold mt-0.5 truncate leading-relaxed">{displayDesc}</p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* CATEGORIES GRID */}
            <div className="p-8 sm:p-10 bg-slate-50/20 dark:bg-black/[0.1]">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {groups.map((group, groupIdx) => (
                  <div 
                    key={groupIdx} 
                    className="border border-slate-200/80 dark:border-white/10 bg-white dark:bg-white/[0.02] rounded-[2rem] p-6 sm:p-7 flex flex-col justify-between hover:border-slate-300 dark:hover:border-white/15 hover:shadow-lg transition-all duration-300 relative group/category shadow-sm"
                  >
                    <div>
                      {/* Category Header */}
                      <div className="flex items-center gap-3 border-b border-slate-100 dark:border-white/5 pb-4 mb-5 text-left">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200/70 dark:border-blue-500/20 flex items-center justify-center text-xl shrink-0 shadow-sm">
                          {group.icon}
                        </div>
                        <div>
                          <h2 className="text-sm font-black uppercase tracking-wide text-slate-900 dark:text-white group-hover/category:text-blue-600 dark:group-hover/category:text-blue-400 transition-colors">{group.title}</h2>
                          <p className="text-[11px] text-slate-500 dark:text-gray-400 font-semibold mt-0.5 leading-normal">{group.description}</p>
                        </div>
                      </div>

                      {/* Tools list in this category */}
                      <div className="space-y-3">
                        {group.toolIds.map((id) => {
                          const tool = getTool(id);
                          if (!tool) return null;
                          const localizedHref = localizeHref(tool.href);
                          const toolTitle = t(`tools.${tool.id}.title`, tool.title);
                          const toolDesc = t(`tools.${tool.id}.description`, tool.description);
                          return (
                            <Link 
                              key={tool.id} 
                              href={localizedHref}
                              className="flex items-center gap-3.5 p-3 rounded-2xl border border-slate-200/70 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.01] hover:bg-white dark:hover:bg-white/[0.04] hover:border-blue-500/40 hover:shadow-[0_4px_16px_rgba(37,99,235,0.08)] transition-all duration-200 group/tool block text-left relative overflow-hidden cursor-pointer"
                            >
                              {/* Micro-glow effect */}
                              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-transparent to-purple-600/5 opacity-0 group-hover/tool:opacity-100 transition-opacity pointer-events-none" />
                              
                              <PdfToolIcon
                                toolId={tool.id}
                                iconName={tool.icon}
                                category={tool.category || "PDF Tools"}
                                size="sm"
                                className="shrink-0 group-hover/tool:scale-105 transition-transform"
                              />
                              <div className="min-w-0 flex-1 pr-2">
                                <h3 className="text-xs font-black tracking-wide text-slate-900 dark:text-white group-hover/tool:text-blue-600 dark:group-hover/tool:text-blue-400 transition-colors truncate">
                                  {toolTitle}
                                </h3>
                                <p className="text-[10px] text-slate-500 dark:text-gray-400 leading-normal font-semibold truncate group-hover/tool:text-slate-600 dark:group-hover/tool:text-gray-300 transition-colors">
                                  {toolDesc}
                                </p>
                              </div>
                              <ArrowRight className="w-3.5 h-3.5 text-slate-400 dark:text-gray-600 group-hover/tool:text-blue-600 dark:group-hover/tool:text-blue-400 group-hover/tool:translate-x-0.5 transition-all self-center ml-auto shrink-0" />
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

        {/* SEO Article Section */}
        {toolArticles['pdf-tools'] && (
          <ToolArticle {...toolArticles['pdf-tools']} />
        )}
      </div>
    </>
  );
}

