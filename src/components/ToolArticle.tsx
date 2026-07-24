"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Sparkles, CheckCircle2, HelpCircle, ArrowRight } from 'lucide-react';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import ShareButtons from './ShareButtons';
import { toolsData } from '@/data/tools';
import { useTranslation } from '@/components/I18nContext';
import { getTranslation } from '@/lib/i18n';
import Breadcrumbs from './Breadcrumbs';
import { categoriesData } from '@/data/categories';
import blogsData from '@/data/dynamic_blogs.json';

interface FAQ {
  question: string;
  answer: string;
}

interface ToolArticleProps {
  title: string;
  intro: string;
  whatItDoes: string;
  howToUse: string[];
  keyFeatures: { title: string; desc: string }[];
  benefits: string[];
  whyChoose: string;
  useCases: string[];
  faqs: FAQ[];
  conclusion: string;
  relatedTools?: { name: string; href: string }[];
}

export default function ToolArticle({
  title,
  intro,
  whatItDoes,
  howToUse,
  keyFeatures,
  benefits,
  whyChoose,
  useCases,
  faqs,
  conclusion,
  relatedTools = [],
  toolId
}: ToolArticleProps & { toolId?: string }) {
  
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
  const translatedWhatItDoes = resolvedToolId ? t(`tools.${resolvedToolId}.whatItDoes`, whatItDoes) : whatItDoes;
  
  const translatedHowToUse = useMemo(() => {
    if (!resolvedToolId) return howToUse;
    const val = getTranslation(messages, `tools.${resolvedToolId}.howToUse`);
    return Array.isArray(val) ? val : howToUse;
  }, [messages, resolvedToolId, howToUse]);

  const translatedKeyFeatures = useMemo(() => {
    if (!resolvedToolId) return keyFeatures;
    const val = getTranslation(messages, `tools.${resolvedToolId}.keyFeatures`);
    return Array.isArray(val) ? val : keyFeatures;
  }, [messages, resolvedToolId, keyFeatures]);

  const translatedBenefits = useMemo(() => {
    if (!resolvedToolId) return benefits;
    const val = getTranslation(messages, `tools.${resolvedToolId}.benefits`);
    return Array.isArray(val) ? val : benefits;
  }, [messages, resolvedToolId, benefits]);

  const translatedWhyChoose = resolvedToolId ? t(`tools.${resolvedToolId}.whyChoose`, whyChoose) : whyChoose;

  const translatedUseCases = useMemo(() => {
    if (!resolvedToolId) return useCases;
    const val = getTranslation(messages, `tools.${resolvedToolId}.useCases`);
    return Array.isArray(val) ? val : useCases;
  }, [messages, resolvedToolId, useCases]);

  const translatedFaqs = useMemo(() => {
    if (!resolvedToolId) return faqs;
    const val = getTranslation(messages, `tools.${resolvedToolId}.faqs`);
    return Array.isArray(val) ? val : faqs;
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

  // Resolve related tools dynamically from toolsData if none provided (exactly 5 related tools)
  const resolvedRelatedTools = useMemo(() => {
    if (relatedTools && relatedTools.length > 0) return relatedTools;
    if (!currentTool) {
      return toolsData
        .filter(t => t.popular && t.isVisible)
        .slice(0, 5)
        .map(t => ({ name: t.title, href: t.href }));
    }

    const sameCategoryTools = toolsData.filter(t => 
      t.category === currentTool.category && 
      t.isVisible && 
      t.id !== currentTool.id
    );

    let related = [...sameCategoryTools];
    if (related.length < 5) {
      const popularTools = toolsData.filter(t => 
        t.popular && 
        t.isVisible && 
        t.id !== currentTool.id &&
        !sameCategoryTools.some(st => st.id === t.id)
      );
      related = [...related, ...popularTools];
    }

    return related.slice(0, 5).map(t => ({ name: t.title, href: t.href }));
  }, [currentTool, relatedTools]);

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
    'applicationCategory': 'BusinessApplication',
    'operatingSystem': 'All',
    'offers': {
      '@type': 'Offer',
      'price': '0',
      'priceCurrency': 'USD'
    }
  }), [translatedTitle, translatedIntro, translatedWhatItDoes]);

  const howToSchema = useMemo(() => (translatedHowToUse && translatedHowToUse.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    'name': `How to use ${translatedTitle}`,
    'description': translatedIntro,
    'step': translatedHowToUse.map((step, idx) => ({
      '@type': 'HowToStep',
      'position': idx + 1,
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
      { label: t('nav.home', 'Home'), href: locale === 'en' ? '/' : `/${locale}` },
      { label: t('nav.tools', 'Tools'), href: locale === 'en' ? '/tools' : `/${locale}/tools` }
    ];
    if (parentCategory) {
      items.push({
        label: t(`categories.${parentCategory.title}`, parentCategory.title),
        href: locale === 'en' ? `/categories/${parentCategory.slug}` : `/${locale}/categories/${parentCategory.slug}`
      });
    }
    items.push({ label: translatedTitle });
    return items;
  }, [t, translatedTitle, parentCategory, locale]);

  return (
    <section className="py-24 relative overflow-hidden bg-[#F6F8FC] dark:bg-[#030712] border-t border-[#E6ECF5] dark:border-white/5 transition-colors duration-250 font-sans">
      {/* Dynamic structured data */}
      {softwareAppSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppSchema) }}
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
          {/* Section Divider */}
          <div className="flex items-center gap-4 mb-16">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#E6ECF5] dark:via-white/10 to-transparent" />
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-white/5 border border-[#E6ECF5] dark:border-white/10 shadow-sm backdrop-blur-sm">
              <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">
                {t('article.deepDiveGuide', 'Deep Dive Guide & SaaS Documentation')}
              </span>
            </div>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#E6ECF5] dark:via-white/10 to-transparent" />
          </div>

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
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter mb-4 leading-[1.1] uppercase">
                {t('article.mastering', 'Mastering the')} <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:to-indigo-400">
                  {translatedTitle}
                </span>
              </h2>
              <p className="text-base sm:text-lg text-slate-600 dark:text-gray-400 leading-relaxed font-medium max-w-2xl mx-auto italic">
                "{translatedIntro}"
              </p>
              
              <div className="flex justify-center pt-4">
                <ShareButtons title={translatedTitle} />
              </div>
            </div>

            {/* Content Sections */}
            <div className="space-y-16">
              {/* What is it */}
              <div className="p-8 sm:p-10 rounded-[1.125rem] bg-white dark:bg-white/[0.01] border border-[#E6ECF5] dark:border-white/5 shadow-[0_10px_35px_rgba(15,23,42,0.06)] relative group">
                <div className="absolute top-0 right-10 h-[2px] w-24 bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
                <div className="relative">
                  <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-3 uppercase tracking-tight">
                    <span className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-600/20 border border-blue-200 dark:border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-blue-400 text-sm font-black shadow-sm">01</span>
                    {t('article.whatIs', 'What is {title}?').replace('{title}', translatedTitle)}
                  </h3>
                  <p className="text-slate-700 dark:text-gray-300 leading-relaxed text-base font-sans font-medium">
                    {translatedWhatItDoes}
                  </p>
                </div>
              </div>

              {/* How to use */}
              <div className="p-8 sm:p-10 rounded-[1.125rem] bg-[#FBFCFE] dark:bg-[#090d16] border border-[#E6ECF5] dark:border-white/5 shadow-[0_10px_35px_rgba(15,23,42,0.04)]">
                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-8 flex items-center gap-3 uppercase tracking-tight">
                  <span className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-600/20 border border-blue-200 dark:border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-blue-400 text-sm font-black shadow-sm">02</span>
                  {t('article.howToUse', 'How to use {title}').replace('{title}', translatedTitle)}
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
                      <p className="text-slate-800 dark:text-gray-200 font-medium leading-relaxed font-sans text-sm sm:text-base">{step}</p>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Key Features */}
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-8 flex items-center gap-3 uppercase tracking-tight">
                  <span className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-600/20 border border-blue-200 dark:border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-blue-400 text-sm font-black shadow-sm">03</span>
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

              {/* Benefits & Use Cases */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="p-8 rounded-[1.125rem] bg-white dark:bg-white/[0.01] border border-[#E6ECF5] dark:border-white/5 shadow-[0_10px_35px_rgba(15,23,42,0.06)]">
                  <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-3 uppercase tracking-tight">
                    <span className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-600/20 border border-blue-200 dark:border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-blue-400 text-xs font-black">04</span>
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
                <div className="p-8 rounded-[1.125rem] bg-white dark:bg-white/[0.01] border border-[#E6ECF5] dark:border-white/5 shadow-[0_10px_35px_rgba(15,23,42,0.06)]">
                  <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-3 uppercase tracking-tight">
                    <span className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-600/20 border border-blue-200 dark:border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-blue-400 text-xs font-black">05</span>
                    {t('article.useCases', 'Use Cases')}
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
              </div>

              {/* Callout / Tip Box */}
              <div className="p-6 sm:p-8 rounded-[1.125rem] bg-emerald-50/80 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 shadow-sm flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center flex-shrink-0 font-bold">
                  💡
                </div>
                <div>
                  <h4 className="text-sm font-black uppercase tracking-wider text-emerald-950 dark:text-emerald-300 mb-1">
                    Pro SaaS Tip
                  </h4>
                  <p className="text-xs sm:text-sm font-medium text-emerald-900 dark:text-emerald-200 leading-relaxed">
                    All file conversions and calculations executed on ToolWala AI leverage client-side web technology to guarantee maximum data privacy and instant processing speed.
                  </p>
                </div>
              </div>

              {/* Why ToolWala */}
              <div className="relative p-8 sm:p-10 rounded-[1.125rem] bg-white dark:bg-white/[0.01] border border-[#E6ECF5] dark:border-white/5 overflow-hidden shadow-[0_10px_35px_rgba(15,23,42,0.06)]">
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

              {/* FAQs */}
              {translatedFaqs && translatedFaqs.length > 0 && (
                <div>
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
              <div className="p-8 sm:p-12 rounded-[1.125rem] bg-gradient-to-br from-blue-50/80 via-[#FBFCFE] to-indigo-50/50 dark:from-blue-600/10 dark:via-transparent dark:to-transparent border border-blue-200 dark:border-blue-500/15 text-center relative overflow-hidden group shadow-[0_10px_35px_rgba(15,23,42,0.06)]">
                <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-4 uppercase tracking-tight">
                  {t('article.finalVerdict', 'Final Verdict')}
                </h3>
                <p className="text-slate-700 dark:text-gray-300 leading-relaxed text-base sm:text-lg font-medium max-w-2xl mx-auto relative z-10 font-sans">
                  {translatedConclusion}
                </p>
              </div>

              {/* Relevant Blogs Section */}
              {relevantBlogs.length > 0 && (
                <div className="pt-16 border-t border-[#E6ECF5] dark:border-white/5">
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-10 text-center select-none">
                    {t('blog.related_insights', 'Related Insights & Tutorials')}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {relevantBlogs.map((rBlog, idx) => (
                      <Link
                        key={`${rBlog.id || rBlog.slug}-${idx}`}
                        href={localizeHref(`/blog/${rBlog.slug}`)}
                        className="p-6 rounded-[1.125rem] bg-white dark:bg-white/[0.01] border border-[#E6ECF5] dark:border-white/5 hover:border-blue-300 dark:hover:border-blue-500/30 transition-all flex flex-col justify-between group h-48 text-left shadow-[0_4px_20px_rgba(15,23,42,0.03)] hover:shadow-[0_10px_35px_rgba(15,23,42,0.06)] hover:-translate-y-1"
                      >
                        <div>
                          <span className="text-[9px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-500">
                            {t(`categories.${rBlog.category}`, rBlog.category)}
                          </span>
                          <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 mt-2 leading-tight">
                            {t(`blogs.${rBlog.slug}.title`, rBlog.title)}
                          </h4>
                          <p className="text-slate-600 dark:text-gray-500 text-[10px] font-medium line-clamp-2 mt-2 leading-relaxed font-sans">
                            {t(`blogs.${rBlog.slug}.excerpt`, rBlog.excerpt)}
                          </p>
                        </div>
                        <div className="flex items-center justify-between pt-4 border-t border-[#E6ECF5] dark:border-white/5">
                          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                            {rBlog.readingTime}
                          </span>
                          <span className="text-[9px] font-black text-blue-600 dark:text-blue-500 uppercase tracking-widest flex items-center gap-1 select-none">
                            {t('blog.read_post', 'Read Post')}
                            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Related Tools Engine */}
              {resolvedRelatedTools.length > 0 && (
                <div className="pt-16 border-t border-[#E6ECF5] dark:border-white/5">
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-10 text-center select-none">
                    {t('article.recommendedUtilities', 'Recommended Utilities')}
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {resolvedRelatedTools.map((tool, i) => (
                      <Link 
                        key={i} 
                        href={tool.href}
                        className="p-5 rounded-[1.125rem] bg-white dark:bg-white/[0.01] border border-[#E6ECF5] dark:border-white/5 hover:border-blue-300 dark:hover:border-blue-500/30 transition-all flex flex-col justify-between group h-32 shadow-[0_4px_20px_rgba(15,23,42,0.03)] hover:-translate-y-1"
                      >
                        <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-white transition-colors uppercase leading-tight">
                           {tool.name}
                        </span>
                        <span className="text-[9px] font-black text-blue-600 dark:text-blue-500 uppercase tracking-widest flex items-center gap-1 select-none">
                          {t('article.tryTool', 'Try Tool')}
                          <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                        </span>
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
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-6 flex items-center justify-between text-left hover:bg-slate-50/50 dark:hover:bg-white/[0.01] transition-colors cursor-pointer"
      >
        <span className={`text-base font-black tracking-tight pr-6 transition-colors ${isOpen ? 'text-blue-600 dark:text-blue-400' : 'text-slate-900 dark:text-white'}`}>{question}</span>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-300 ${isOpen ? 'bg-blue-600 border-blue-600 text-white' : 'bg-blue-50 dark:bg-white/5 border-blue-100 dark:border-white/10 text-blue-600 dark:text-gray-500'}`}>
          <ChevronDown 
            className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
          />
        </div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
          >
            <div className="px-6 pb-6 text-slate-600 dark:text-gray-400 font-medium leading-relaxed text-sm font-sans">
              <div className="h-px w-8 bg-blue-500/20 mb-4" />
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
