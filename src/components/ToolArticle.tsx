"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Sparkles, CheckCircle2, HelpCircle, ArrowRight } from 'lucide-react';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import ShareButtons from './ShareButtons';
import { toolsData } from '@/data/tools';
import ToolIcon from '@/components/ToolIcon';
import { useTranslation } from '@/components/I18nContext';
import { getTranslation } from '@/lib/i18n';
import Breadcrumbs from './Breadcrumbs';
import { categoriesData } from '@/data/categories';
import blogsData from '@/data/dynamic_blogs.json';

interface FAQ {
  question: string;
  answer: string;
}

type ArticleLayout = 'default' | 'fails-first' | 'howto-first' | 'limits-first' | 'print-first';

interface ToolArticleProps {
  title: string;
  intro: string;
  whatItDoes?: string;
  whatHeading?: string;
  howToUse?: string[];
  howToHeading?: string;
  screenshotCaptions?: string[];
  specificationTable?: { requirement: string; specification: string }[];
  commonMistakes?: string[];
  limitations?: string[];
  privacyNote?: string;
  privacyHeading?: string;
  uniqueSection?: { title: string; body?: string; bullets?: string[] };
  keyFeatures?: { title: string; desc: string }[];
  benefits?: string[];
  whyChoose?: string;
  useCases?: string[];
  useCasesHeading?: string;
  faqs?: FAQ[];
  conclusion?: string;
  conclusionHeading?: string;
  relatedTools?: { name: string; href: string }[];
  toolId?: string;
  layout?: ArticleLayout;
}

export default function ToolArticle({
  title,
  intro,
  whatItDoes = "",
  whatHeading,
  howToUse = [],
  howToHeading,
  screenshotCaptions = [],
  specificationTable = [],
  commonMistakes = [],
  limitations = [],
  privacyNote = "",
  privacyHeading,
  uniqueSection,
  keyFeatures = [],
  benefits = [],
  whyChoose = "",
  useCases = [],
  useCasesHeading,
  faqs = [],
  conclusion = "",
  conclusionHeading,
  relatedTools = [],
  toolId,
  layout = 'default'
}: ToolArticleProps) {
  
  const { t, locale, messages, localizeHref } = useTranslation();

  // Automatically resolve toolId if not passed
  const resolvedToolId = useMemo(() => {
    if (toolId) return toolId;
    const found = toolsData.find(t => 
      t.title.toLowerCase().includes(title.toLowerCase()) || 
      title.toLowerCase().includes(t.title.toLowerCase())
    );
    return found ? found.id : null;
  }, [toolId, title]);

  // Try to load translated values from messages for this tool
  const translatedTitle = resolvedToolId ? t(`tools.${resolvedToolId}.title`, title) : title;
  const translatedIntro = resolvedToolId ? t(`tools.${resolvedToolId}.intro`, intro) : intro;
  const translatedWhatItDoes: string = String(
    resolvedToolId ? t(`tools.${resolvedToolId}.whatItDoes`, whatItDoes) : whatItDoes
  );
  
  const translatedHowToUse = useMemo(() => {
    if (!resolvedToolId) return howToUse || [];
    const val = getTranslation(messages, `tools.${resolvedToolId}.howToUse`);
    return Array.isArray(val) ? val : (howToUse || []);
  }, [messages, resolvedToolId, howToUse]);

  const translatedKeyFeatures = useMemo(() => {
    if (!resolvedToolId) return keyFeatures || [];
    const val = getTranslation(messages, `tools.${resolvedToolId}.keyFeatures`);
    return Array.isArray(val) ? val : (keyFeatures || []);
  }, [messages, resolvedToolId, keyFeatures]);

  const translatedBenefits = useMemo(() => {
    if (!resolvedToolId) return benefits || [];
    const val = getTranslation(messages, `tools.${resolvedToolId}.benefits`);
    return Array.isArray(val) ? val : (benefits || []);
  }, [messages, resolvedToolId, benefits]);

  const translatedWhyChoose = resolvedToolId ? t(`tools.${resolvedToolId}.whyChoose`, whyChoose) : whyChoose;

  const translatedUseCases = useMemo(() => {
    if (!resolvedToolId) return useCases || [];
    const val = getTranslation(messages, `tools.${resolvedToolId}.useCases`);
    return Array.isArray(val) ? val : (useCases || []);
  }, [messages, resolvedToolId, useCases]);

  const translatedFaqs = useMemo(() => {
    if (!resolvedToolId) return faqs || [];
    const val = getTranslation(messages, `tools.${resolvedToolId}.faqs`);
    return Array.isArray(val) ? val : (faqs || []);
  }, [messages, resolvedToolId, faqs]);

  const translatedConclusion = resolvedToolId ? t(`tools.${resolvedToolId}.conclusion`, conclusion) : conclusion;

  const currentTool = useMemo(() => {
    return toolsData.find(t => 
      t.id === resolvedToolId ||
      t.title.toLowerCase().includes(title.toLowerCase()) || 
      title.toLowerCase().includes(t.title.toLowerCase())
    );
  }, [resolvedToolId, title]);

  const parentCategory = useMemo(() => {
    if (!currentTool) return null;
    return categoriesData.find(cat => 
      cat.title.toLowerCase() === currentTool.category.toLowerCase()
    );
  }, [currentTool]);


  const relevantBlogs = useMemo(() => {
    if (!currentTool) return [];
    const activeBlogs = blogsData.filter(b => b.status === 'published');
    const matched = activeBlogs.filter(blog => {
      if (blog.relatedToolSlugs?.includes(currentTool.slug)) return true;
      if (blog.category.toLowerCase() === currentTool.category.toLowerCase()) return true;
      if (blog.tags?.some(tag => currentTool.tags?.some(t => t.toLowerCase() === tag.toLowerCase()))) return true;
      return false;
    });
    if (matched.length === 0) {
      return activeBlogs.slice(0, 3);
    }
    return matched.slice(0, 3);
  }, [currentTool]);

  // Construct structured JSON-LD schemas
  const softwareAppSchema = useMemo(() => ({
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    'name': translatedTitle,
    'description': translatedIntro || translatedWhatItDoes,
    'applicationCategory': 'UtilitiesApplication',
    'operatingSystem': 'Any',
    'url': currentTool ? (currentTool.href.startsWith('http') ? currentTool.href : `https://toolwala.co${currentTool.href.endsWith('/') ? currentTool.href : currentTool.href + '/'}`) : 'https://toolwala.co/tools/merge-pdf/',
    'dateModified': currentTool?.updatedAt || '2026-03-24T00:00:00Z',
    'offers': {
      '@type': 'Offer',
      'price': '0',
      'priceCurrency': 'USD'
    }
  }), [translatedTitle, translatedIntro, translatedWhatItDoes, currentTool]);

  const howToSchema = useMemo(() => (translatedHowToUse && translatedHowToUse.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    'name': `How to use ${translatedTitle}`,
    'description': translatedIntro,
    'step': translatedHowToUse.map((step, idx) => ({
      '@type': 'HowToStep',
      'position': idx + 1,
      'name': `Step ${idx + 1}`,
      'text': step
    }))
  } : null), [translatedTitle, translatedIntro, translatedHowToUse]);

  const faqSchema = useMemo(() => (translatedFaqs && translatedFaqs.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': translatedFaqs.map((faq) => ({
      '@type': 'Question',
      'name': faq.question,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': faq.answer
      }
    }))
  } : null), [translatedFaqs]);

  const breadcrumbItems = useMemo(() => {
    const items: { label: string; href?: string }[] = [
      { label: t('nav.home', 'Home'), href: locale === 'en' ? '/' : `/${locale}/` },
      { label: t('nav.tools', 'Tools'), href: locale === 'en' ? '/tools/' : `/${locale}/tools/` }
    ];
    if (parentCategory) {
      items.push({
        label: t(`categories.${parentCategory.title}`, parentCategory.title),
        href: locale === 'en' ? `/categories/${parentCategory.slug}/` : `/${locale}/categories/${parentCategory.slug}/`
      });
    }
    items.push({ label: translatedTitle });
    return items;
  }, [t, translatedTitle, parentCategory, locale]);

  const breadcrumbSchema = useMemo(() => ({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': breadcrumbItems.map((item, idx) => ({
      '@type': 'ListItem',
      'position': idx + 1,
      'name': item.label,
      'item': item.href ? (item.href.startsWith('http') ? item.href : `https://toolwala.co${item.href.endsWith('/') ? item.href : item.href + '/'}`) : undefined
    }))
  }), [breadcrumbItems]);

  const numbered = layout === 'default';

  return (
    <section className="pt-8 pb-16 sm:pt-12 sm:pb-24 relative overflow-hidden bg-[#F6F8FC] dark:bg-[#030712] border-t border-[#E6ECF5] dark:border-white/5 transition-colors duration-250 font-sans">
      {/* Dynamic structured data */}
      {softwareAppSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppSchema) }}
        />
      )}
      {breadcrumbSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
      )}
      {howToSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
        />
      )}
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}

      {/* Background Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/5 dark:bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 dark:bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <Breadcrumbs items={breadcrumbItems} />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="max-w-[72ch] mx-auto">
            {/* Header */}
            <div className="text-center mb-16 space-y-6">
              {parentCategory && (
                <div className="flex justify-center mb-2">
                  <Link
                    href={localizeHref(`/categories/${parentCategory.slug}`)}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-all active:scale-95 shadow-sm"
                  >
                    📂 {t(`categories.${parentCategory.title}`, parentCategory.title)}
                  </Link>
                </div>
              )}
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter mb-4 leading-[1.1]">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:to-indigo-400">
                  {translatedTitle}
                </span>
              </h2>
              {translatedIntro && (
                <p className="text-slate-600 dark:text-gray-400 text-base sm:text-lg font-medium leading-relaxed max-w-2xl mx-auto">
                  {translatedIntro}
                </p>
              )}
              
              <div className="flex justify-center pt-2">
                <ShareButtons title={translatedTitle} />
              </div>
            </div>

            {/* Content Sections — custom layouts change flex order so pages don't share one skeleton */}
            <div className="flex flex-col gap-12">
              {uniqueSection && (uniqueSection.body || (uniqueSection.bullets && uniqueSection.bullets.length > 0)) && (
                <div
                  style={{ order: layout === 'fails-first' ? 1 : layout === 'howto-first' ? 3 : layout === 'limits-first' ? 2 : layout === 'print-first' ? 3 : 6 }}
                  className={`p-8 sm:p-10 rounded-[1.125rem] shadow-sm border ${
                    layout === 'fails-first'
                      ? 'bg-rose-50/50 dark:bg-rose-950/15 border-rose-200 dark:border-rose-500/20'
                      : layout === 'limits-first'
                        ? 'bg-amber-50/60 dark:bg-amber-950/15 border-amber-200 dark:border-amber-500/20'
                        : layout === 'print-first'
                          ? 'bg-sky-50/70 dark:bg-sky-950/15 border-sky-200 dark:border-sky-500/20'
                          : 'bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/10'
                  }`}
                >
                  <h3 className="text-xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
                    {uniqueSection.title}
                  </h3>
                  {uniqueSection.body && (
                    <p className="text-slate-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base font-medium font-sans mb-4">
                      {uniqueSection.body}
                    </p>
                  )}
                  {uniqueSection.bullets && uniqueSection.bullets.length > 0 && (
                    <ul className="space-y-3 list-none p-0">
                      {uniqueSection.bullets.map((item, i) => (
                        <li key={i} className="flex items-start gap-3 text-slate-800 dark:text-gray-200 font-medium font-sans text-sm">
                          <span className="text-slate-400 font-black flex-shrink-0 mt-0.5">•</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {/* What is section with Specification Table immediately following the paragraph */}
              {translatedWhatItDoes && translatedWhatItDoes.trim().length > 0 && (
                <div style={{ order: layout === 'howto-first' ? 4 : layout === 'fails-first' ? 3 : layout === 'limits-first' ? 3 : layout === 'print-first' ? 4 : 1 }} className="p-8 sm:p-10 rounded-[1.125rem] bg-white dark:bg-white/[0.01] border border-[#E6ECF5] dark:border-white/5 shadow-[0_10px_35px_rgba(15,23,42,0.06)] relative group">
                  <div className="absolute top-0 right-10 h-[2px] w-24 bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
                  <div className="relative space-y-6">
                    <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3 tracking-tight">
                      {numbered && (
                        <span className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-600/20 border border-blue-200 dark:border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-blue-400 text-sm font-black shadow-sm">01</span>
                      )}
                      {whatHeading || t('article.whatIs', 'What is {title}?').replace('{title}', translatedTitle)}
                    </h3>
                    <div className="space-y-4">
                      {translatedWhatItDoes.split('\n\n').map((para, idx) => (
                        <p key={idx} className="text-slate-700 dark:text-gray-300 leading-relaxed text-base font-sans font-medium">
                          {para}
                        </p>
                      ))}
                    </div>

                    {/* Markdown Specification Table immediately after paragraph */}
                    {specificationTable && specificationTable.length > 0 && (
                      <div className="pt-4 space-y-2">
                        <div className="overflow-x-auto rounded-xl border border-[#E6ECF5] dark:border-white/10">
                          <table className="w-full text-left text-xs sm:text-sm font-sans border-collapse">
                            <thead>
                              <tr className="border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5">
                                <th className="py-3 px-4 font-black uppercase text-slate-900 dark:text-white tracking-wider">Requirement</th>
                                <th className="py-3 px-4 font-black uppercase text-slate-900 dark:text-white tracking-wider">Specification</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-white/5 bg-white dark:bg-transparent">
                              {specificationTable.map((row, idx) => (
                                <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
                                  <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{row.requirement}</td>
                                  <td className="py-3 px-4 font-mono text-xs text-slate-700 dark:text-gray-300">{row.specification}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        {commonMistakes.length > 0 && (
                          <p className="text-[11px] font-semibold text-slate-500 dark:text-gray-400 italic">
                            * Official notification se cross-verify zaroor karein apply karne se pehle.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Common Mistakes Warning Card */}
              {commonMistakes && commonMistakes.length > 0 && (
                <div style={{ order: 5 }} className="p-8 sm:p-10 rounded-[1.125rem] bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-500/20 shadow-sm relative">
                  <h3 className="text-xl font-black text-rose-950 dark:text-rose-300 mb-6 flex items-center gap-3 tracking-tight">
                    <span className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center text-sm font-black shadow-sm">⚠️</span>
                    Common Mistakes That Cause Rejection
                  </h3>
                  <ul className="space-y-3 list-none p-0">
                    {commonMistakes.map((mistake, i) => (
                      <li key={i} className="flex items-start gap-3 text-rose-900 dark:text-rose-200 font-medium font-sans text-sm">
                        <span className="text-rose-500 font-black flex-shrink-0 mt-0.5">•</span>
                        {mistake}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* How to use */}
              {translatedHowToUse && translatedHowToUse.length > 0 && (
                <div style={{ order: layout === 'howto-first' ? 2 : layout === 'fails-first' ? 2 : layout === 'limits-first' ? 4 : layout === 'print-first' ? 2 : 2 }} className="p-8 sm:p-10 rounded-[1.125rem] bg-[#FBFCFE] dark:bg-[#090d16] border border-[#E6ECF5] dark:border-white/5 shadow-[0_10px_35px_rgba(15,23,42,0.04)]">
                  <h3 className="text-xl font-black text-slate-900 dark:text-white mb-8 flex items-center gap-3 tracking-tight">
                    {numbered && (
                      <span className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-600/20 border border-blue-200 dark:border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-blue-400 text-sm font-black shadow-sm">02</span>
                    )}
                    {howToHeading || t('article.howToUse', 'How to use {title}').replace('{title}', translatedTitle)}
                  </h3>
                  <div className="grid gap-4">
                    {translatedHowToUse.map((step, i) => (
                      <motion.div 
                        key={i}
                        whileHover={{ x: 6 }}
                        className="flex gap-5 p-5 rounded-[1rem] bg-white dark:bg-white/[0.01] border border-[#E6ECF5] dark:border-white/5 hover:border-blue-300 dark:hover:border-blue-500/30 transition-all shadow-[0_4px_20px_rgba(15,23,42,0.03)] group"
                      >
                        <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-600/10 border border-blue-200 dark:border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 font-black text-sm">
                          {i + 1}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-slate-800 dark:text-gray-200 font-medium leading-relaxed font-sans text-sm sm:text-base">{step}</p>
                          {screenshotCaptions[i] && (
                            <figure className="mt-3 rounded-xl border border-dashed border-slate-300 dark:border-white/15 bg-slate-50 dark:bg-white/[0.03] p-3">
                              <div className="aspect-[16/6] rounded-lg bg-slate-200/80 dark:bg-white/5 flex items-center justify-center text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 dark:text-gray-500">
                                Screenshot placeholder
                              </div>
                              <figcaption className="mt-2 text-xs text-slate-500 dark:text-gray-400 font-medium leading-relaxed">
                                {screenshotCaptions[i]}
                              </figcaption>
                            </figure>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Key Features */}
              {translatedKeyFeatures && translatedKeyFeatures.length > 0 && (
                <div style={{ order: 7 }}>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white mb-8 flex items-center gap-3 tracking-tight">
                    {numbered && (
                      <span className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-600/20 border border-blue-200 dark:border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-blue-400 text-sm font-black shadow-sm">03</span>
                    )}
                    {t('article.keyFeatures', 'Key Features')}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {translatedKeyFeatures.map((feature, i) => (
                      <div key={i} className="p-6 sm:p-8 rounded-[1.125rem] bg-white dark:bg-white/[0.01] border border-[#E6ECF5] dark:border-white/5 hover:border-blue-300 dark:hover:border-blue-500/30 transition-all shadow-[0_10px_35px_rgba(15,23,42,0.06)] hover:-translate-y-1 group relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-[0.05] group-hover:opacity-20 transition-opacity">
                           <Sparkles className="w-12 h-12 text-blue-600 dark:text-white" />
                        </div>
                        <h4 className="text-slate-900 dark:text-white font-black mb-3 uppercase tracking-widest text-xs flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                          {feature.title}
                        </h4>
                        <p className="text-slate-600 dark:text-gray-400 text-xs sm:text-sm leading-relaxed font-medium font-sans">
                          {feature.desc}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Benefits & Use Cases */}
              {(translatedBenefits.length > 0 || translatedUseCases.length > 0) && (
                <div style={{ order: layout === 'default' ? 8 : layout === 'print-first' ? 1 : 5 }} className={`grid gap-8 ${translatedBenefits.length > 0 && translatedUseCases.length > 0 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
                  {translatedBenefits.length > 0 && (
                    <div className="p-8 rounded-[1.125rem] bg-white dark:bg-white/[0.01] border border-[#E6ECF5] dark:border-white/5 shadow-[0_10px_35px_rgba(15,23,42,0.06)]">
                      <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-3 tracking-tight">
                        {numbered && (
                          <span className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-600/20 border border-blue-200 dark:border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-blue-400 text-xs font-black">04</span>
                        )}
                        {t('article.benefits', 'Benefits')}
                      </h3>
                      <ul className="space-y-4 list-none p-0">
                        {translatedBenefits.map((benefit, i) => (
                          <li key={i} className="flex items-start gap-3 text-slate-700 dark:text-gray-300 font-medium font-sans text-sm">
                            <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-500 flex-shrink-0 mt-0.5" />
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {translatedUseCases.length > 0 && (
                    <div className="p-8 rounded-[1.125rem] bg-white dark:bg-white/[0.01] border border-[#E6ECF5] dark:border-white/5 shadow-[0_10px_35px_rgba(15,23,42,0.06)]">
                      <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-3 tracking-tight">
                        {numbered && (
                          <span className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-600/20 border border-blue-200 dark:border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-blue-400 text-xs font-black">05</span>
                        )}
                        {useCasesHeading || t('article.useCases', 'Use Cases')}
                      </h3>
                      <ul className="space-y-3 list-none p-0">
                        {translatedUseCases.map((useCase, i) => (
                          <li key={i} className="bg-[#FBFCFE] dark:bg-white/[0.01] px-5 py-3.5 rounded-[16px] border border-[#E6ECF5] dark:border-white/5 text-slate-800 dark:text-gray-200 text-xs font-bold flex items-center justify-between group hover:border-blue-300 transition-all shadow-sm">
                             <span className="font-sans leading-relaxed">{useCase}</span>
                             <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-500 transition-colors" />
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {limitations.length > 0 && (
                <div style={{ order: layout === 'limits-first' ? 1 : 6 }} className="p-8 sm:p-10 rounded-[1.125rem] bg-amber-50/70 dark:bg-amber-950/15 border border-amber-200 dark:border-amber-500/20 shadow-sm">
                  <h3 className="text-xl font-black text-amber-950 dark:text-amber-200 mb-6 flex items-center gap-3 tracking-tight">
                    <span className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center text-sm font-black shadow-sm">!</span>
                    Limits and important notes
                  </h3>
                  <ul className="space-y-3 list-none p-0">
                    {limitations.map((note, i) => (
                      <li key={i} className="flex items-start gap-3 text-amber-950 dark:text-amber-100 font-medium font-sans text-sm">
                        <span className="text-amber-600 font-black flex-shrink-0 mt-0.5">•</span>
                        {note}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Privacy Trust Section: Shown only if tool-specific note provided */}
              {(privacyHeading || privacyNote) && (
                <div style={{ order: 9 }} className="p-8 sm:p-10 rounded-[1.125rem] bg-slate-900 dark:bg-white/[0.02] text-white border border-slate-800 dark:border-white/10 shadow-xl relative overflow-hidden">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-2xl flex-shrink-0">
                      🔒
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg sm:text-xl font-black tracking-tight text-white">
                        {privacyHeading || 'Files never leave your device'}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-300 dark:text-gray-300 leading-relaxed font-sans font-medium">
                        {privacyNote}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Why ToolWala */}
              {translatedWhyChoose && translatedWhyChoose.trim().length > 0 && (
                <div style={{ order: 10 }} className="relative p-8 sm:p-10 rounded-[1.125rem] bg-white dark:bg-white/[0.01] border border-[#E6ECF5] dark:border-white/5 overflow-hidden shadow-[0_10px_35px_rgba(15,23,42,0.06)]">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />
                  <div className="relative">
                    <h3 className="text-xl font-black text-slate-900 dark:text-white mb-4 uppercase tracking-tight">
                      {t('article.whyChoose', 'Why Choose ToolWala AI?')}
                    </h3>
                    <p className="text-slate-700 dark:text-gray-300 leading-relaxed text-base font-sans font-medium">
                      {translatedWhyChoose}
                    </p>
                  </div>
                </div>
              )}

              {/* FAQs */}
              {translatedFaqs && translatedFaqs.length > 0 && (
                <div style={{ order: 11 }}>
                  <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4">
                      <HelpCircle className="w-3.5 h-3.5" />
                      {t('article.supportCenter', 'Support Center')}
                    </div>
                    <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">
                      {t('article.commonQuestions', 'Common Questions')}
                    </h3>
                  </div>
                  <div className="space-y-4 max-w-3xl mx-auto">
                    {translatedFaqs.map((faq, i) => (
                      <FAQItem key={i} question={faq.question} answer={faq.answer} />
                    ))}
                  </div>
                </div>
              )}

              {/* Conclusion */}
              {translatedConclusion && translatedConclusion.trim().length > 0 && (
                <div style={{ order: 12 }} className="p-8 sm:p-12 rounded-[1.125rem] bg-gradient-to-br from-blue-50/80 via-[#FBFCFE] to-indigo-50/50 dark:from-blue-600/10 dark:via-transparent dark:to-transparent border border-blue-200 dark:border-blue-500/15 text-center relative overflow-hidden group shadow-[0_10px_35px_rgba(15,23,42,0.06)]">
                  <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />
                  <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
                    {conclusionHeading || t('article.finalVerdict', 'Final Verdict')}
                  </h3>
                  <p className="text-slate-700 dark:text-gray-300 leading-relaxed text-base sm:text-lg font-medium max-w-2xl mx-auto relative z-10 font-sans">
                    {translatedConclusion}
                  </p>
                </div>
              )}

              {/* Relevant Blogs Section */}
              {relevantBlogs.length > 0 && (
                <div style={{ order: 20 }} className="pt-16 border-t border-[#E6ECF5] dark:border-white/10">
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-10 text-center select-none">
                    {t('blog.related_insights', 'Related Insights & Tutorials')}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {relevantBlogs.map((rBlog, idx) => (
                      <Link
                        key={`${rBlog.id || rBlog.slug}-${idx}`}
                        href={localizeHref(`/blog/${rBlog.slug}`)}
                        className="p-6 rounded-[1.125rem] bg-white dark:bg-white/[0.03] border border-[#E6ECF5] dark:border-white/10 hover:border-blue-400 dark:hover:border-blue-500/50 transition-all flex flex-col justify-between group h-48 text-left shadow-[0_4px_20px_rgba(15,23,42,0.03)] hover:shadow-[0_10px_35px_rgba(15,23,42,0.06)] hover:-translate-y-1"
                      >
                        <div>
                          <span className="text-[9px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">
                            {t(`categories.${rBlog.category}`, rBlog.category)}
                          </span>
                          <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 mt-2 leading-tight">
                            {t(`blogs.${rBlog.slug}.title`, rBlog.title)}
                          </h4>
                          <p className="text-slate-600 dark:text-gray-400 text-[10px] font-medium line-clamp-2 mt-2 leading-relaxed font-sans">
                            {t(`blogs.${rBlog.slug}.excerpt`, rBlog.excerpt)}
                          </p>
                        </div>
                        <div className="flex items-center justify-between pt-4 border-t border-[#E6ECF5] dark:border-white/5">
                          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                            {rBlog.readingTime}
                          </span>
                          <span className="text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest flex items-center gap-1 select-none">
                            {t('blog.read_post', 'Read Post')}
                            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}


            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`border transition-all duration-300 rounded-[1.125rem] overflow-hidden ${
      isOpen 
        ? 'bg-white dark:bg-white/[0.02] border-blue-500/40 shadow-[0_10px_35px_rgba(15,23,42,0.06)]' 
        : 'bg-white dark:bg-white/[0.01] border-[#E6ECF5] dark:border-white/5 shadow-[0_4px_20px_rgba(15,23,42,0.03)] hover:-translate-y-0.5'
    }`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className="w-full p-6 flex items-center justify-between text-left hover:bg-slate-50/50 dark:hover:bg-white/[0.01] transition-colors cursor-pointer"
      >
        <span className={`text-base font-black tracking-tight pr-6 transition-colors ${isOpen ? 'text-blue-600 dark:text-blue-400' : 'text-slate-900 dark:text-white'}`}>{question}</span>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-300 shrink-0 ${isOpen ? 'bg-blue-600 border-blue-600 text-white' : 'bg-blue-50 dark:bg-white/5 border-blue-100 dark:border-white/10 text-blue-600 dark:text-gray-500'}`}>
          <ChevronDown 
            className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
          />
        </div>
      </button>
      {/* Permanent DOM inclusion for SEO crawlers with smooth transition */}
      <div 
        className={`px-6 transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-[600px] pb-6 opacity-100 visible' : 'max-h-0 pb-0 opacity-0 overflow-hidden'
        }`}
      >
        <div className="h-px w-8 bg-blue-500/20 mb-4" />
        <div className="text-slate-600 dark:text-gray-400 font-medium leading-relaxed text-sm font-sans">
          {answer}
        </div>
      </div>
    </div>
  );
}
