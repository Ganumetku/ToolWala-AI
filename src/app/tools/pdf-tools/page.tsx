import Link from 'next/link';
import { 
  ChevronLeft, Shield, Files, ArrowRight, Sparkles 
} from 'lucide-react';
import { toolsData } from '@/data/tools';
import { getTranslationServer } from '@/lib/i18n-server';
import { MeshGradient, FloatingParticles } from '@/components/BackgroundEffects';
import ToolArticle from '@/components/ToolArticle';
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
      toolIds: ['merge-pdf', 'split-pdf', 'remove-pages', 'organize-pdf', 'rotate-pdf']
    },
    {
      title: t('pdf_dashboard.convert', 'Convert PDF'),
      icon: '📂',
      description: t('pdf_dashboard.convert_desc', 'Convert document layouts to PDF, or convert PDF pages to standard formats.'),
      toolIds: ['pdf-to-jpg', 'jpg-to-pdf', 'pdf-to-word-converter', 'word-to-pdf-converter']
    },
    {
      title: t('pdf_dashboard.secure', 'Secure PDF'),
      icon: '🔒',
      description: t('pdf_dashboard.secure_desc', 'Protect your files with password encryption, unlock, or add watermarks.'),
      toolIds: ['protect-pdf', 'unlock-pdf', 'watermark-pdf']
    },
    {
      title: t('pdf_dashboard.ai_ocr', 'AI & OCR'),
      icon: '🤖',
      description: t('pdf_dashboard.ai_ocr_desc', 'Extract text from scanned documents or summarize PDFs locally with AI.'),
      toolIds: ['pdf-ocr', 'pdf-summarizer']
    },
    {
      title: t('pdf_dashboard.optimize_edit', 'Optimize & Edit'),
      icon: '⚙️',
      description: t('pdf_dashboard.optimize_edit_desc', 'Compress file sizes, crop page margins, and edit layouts locally.'),
      toolIds: ['compress-pdf', 'crop-pdf', 'edit-pdf']
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

      <div className="bg-[#030712] min-h-screen py-24 relative overflow-hidden font-sans">
        <MeshGradient />
        <FloatingParticles />

        {/* Background Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-blue-600/5 blur-[120px] -z-10" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
          
          {/* Back to Directory Link */}
          <Link 
            href={localizeHref("/tools")} 
            className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-widest text-gray-500 hover:text-blue-500 transition-colors mb-10 group cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            {t('tools.back_to_directory', 'Back to Directory')}
          </Link>

          {/* Main Dashboard Block */}
          <div className="glass rounded-[2.5rem] border border-white/5 overflow-hidden mb-16 shadow-2xl">

            {/* HEADER HERO */}
            <div className="p-8 sm:p-10 border-b border-white/5 bg-black/[0.15]">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
                <div className="flex items-center gap-6 text-left">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-[0_0_25px_rgba(37,99,235,0.4)]">
                    <Files className="w-7 h-7" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-black text-white tracking-tighter uppercase">
                      {t('nav.pdf_suite', 'PDF Suite')}
                    </h1>
                    <p className="text-gray-400 font-medium mt-1">
                      {t('home.hero_pdf_subtitle', 'Browse all client-side PDF utilities. Free, secure, and processing locally.')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-emerald-500/10 px-4 py-2 rounded-xl border border-emerald-500/20 self-start">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">100% Client-Side</span>
                </div>
              </div>
            </div>

            <div className="p-8 sm:p-10 bg-black/[0.05] border-b border-white/5">
              {/* Popular Tools Tray */}
              <div className="mb-8">
                <h2 className="text-xs font-black uppercase tracking-widest text-gray-500 mb-6 flex items-center gap-2 text-left">
                  <Sparkles className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
                  {t('pdf_dashboard.popular_tools', 'Popular PDF Utilities')}
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {popularTools.map((tool) => {
                    const displayTitle = t(`tools.${tool.id}.title`, tool.title);
                    const displayDesc = t(`tools.${tool.id}.description`, tool.description);
                    return (
                      <Link
                        key={tool.id}
                        href={localizeHref(tool.href)}
                        className="flex items-center gap-3.5 p-4 rounded-xl bg-white/[0.01] border border-white/5 hover:border-blue-500/30 hover:bg-blue-600/5 hover:shadow-[0_0_15px_rgba(37,99,235,0.08)] transition-all group cursor-pointer text-left"
                      >
                        <div className="text-xl w-10 h-10 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                          {tool.icon}
                        </div>
                        <div className="overflow-hidden">
                          <h4 className="text-xs font-black text-white group-hover:text-blue-400 transition-colors truncate">{displayTitle}</h4>
                          <p className="text-[9px] text-gray-500 font-semibold mt-0.5 truncate leading-relaxed">{displayDesc}</p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* CATEGORIES GRID */}
            <div className="p-8 sm:p-10 bg-black/[0.05]">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {groups.map((group, groupIdx) => (
                  <div 
                    key={groupIdx} 
                    className="glass border border-white/5 bg-white/[0.01] rounded-[2rem] p-6.5 sm:p-8 flex flex-col justify-between hover:border-white/10 hover:bg-white/[0.02] transition-all duration-500 relative group/category shadow-2xl"
                  >
                    <div>
                      {/* Category Header */}
                      <div className="flex items-center gap-3 border-b border-white/5 pb-4 mb-6 text-left">
                        <div className="text-3xl filter drop-shadow-[0_0_8px_rgba(37,99,235,0.2)]">{group.icon}</div>
                        <div>
                          <h2 className="text-sm font-black uppercase tracking-wide text-white group-hover/category:text-blue-400 transition-colors">{group.title}</h2>
                          <p className="text-[10px] text-gray-500 font-semibold mt-0.5 leading-normal">{group.description}</p>
                        </div>
                      </div>

                      {/* Tools list in this category */}
                      <div className="space-y-4">
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
                              className="flex items-start gap-4 p-4 rounded-2xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.04] hover:border-blue-500/30 hover:shadow-[0_0_15px_rgba(37,99,235,0.08)] transition-all duration-300 group/tool block text-left relative overflow-hidden cursor-pointer"
                            >
                              {/* Micro-glow effect */}
                              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-transparent to-purple-600/5 opacity-0 group-hover/tool:opacity-100 transition-opacity pointer-events-none" />
                              
                              <div className="bg-[#030712] p-2.5 rounded-xl border border-white/5 flex-shrink-0 flex items-center justify-center text-2xl group-hover/tool:scale-110 duration-300 transition-transform">
                                {tool.icon}
                              </div>
                              <div className="space-y-0.5 overflow-hidden pr-4">
                                <h3 className="text-xs font-black uppercase tracking-wide text-white group-hover/tool:text-blue-400 transition-colors">
                                  {toolTitle}
                                </h3>
                                <p className="text-[10px] text-gray-500 leading-normal font-semibold truncate group-hover/tool:text-gray-400 transition-colors">
                                  {toolDesc}
                                </p>
                              </div>
                              <ArrowRight className="w-3.5 h-3.5 text-gray-600 group-hover/tool:text-blue-500 group-hover/tool:translate-x-0.5 transition-all self-center ml-auto shrink-0" />
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
