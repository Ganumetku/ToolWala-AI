"use client";

import React, { useMemo } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { toolsData } from '@/data/tools';
import { categoriesData } from '@/data/categories';
import blogsData from '@/data/dynamic_blogs.json';
import { useTranslation } from '@/components/I18nContext';

interface ToolSeoFooterProps {
  currentSlug: string;
}

export default function ToolSeoFooter({ currentSlug }: ToolSeoFooterProps) {
  const { t, locale, localizeHref } = useTranslation();

  // Find current tool matching slug (or matching landing page prefixes like compress-pdf-to-100kb -> compress-pdf)
  const tool = useMemo(() => {
    return toolsData.find(t => t.slug === currentSlug) || 
           toolsData.find(t => currentSlug.startsWith(t.slug) || currentSlug.includes(t.slug));
  }, [currentSlug]);

  // Find parent category
  const parentCategory = useMemo(() => {
    if (!tool) return null;
    return categoriesData.find(c => c.title === tool.category);
  }, [tool]);

  // Find 5 related tools in same category
  const relatedTools = useMemo(() => {
    if (!tool) return [];
    return toolsData
      .filter(t => t.isVisible && t.status === 'published' && t.slug !== tool.slug)
      .sort((a, b) => {
        // Prioritize same category
        if (a.category === tool.category && b.category !== tool.category) return -1;
        if (a.category !== tool.category && b.category === tool.category) return 1;
        // Prioritize trending/featured
        if (a.trending && !b.trending) return -1;
        if (!a.trending && b.trending) return 1;
        return 0;
      })
      .slice(0, 5);
  }, [tool]);

  // Find 3 related blog posts
  const relatedBlogs = useMemo(() => {
    if (!tool) return [];
    
    // Scored blog matchmaking
    const matched = (blogsData as any[])
      .filter(b => b.status === 'published')
      .map(b => {
        let score = 0;
        if (b.category.toLowerCase() === tool.category.toLowerCase()) score += 5;
        if (b.tags?.some((tag: string) => tool.tags.some(t => t.toLowerCase() === tag.toLowerCase()))) score += 3;
        if (b.title.toLowerCase().includes(tool.title.toLowerCase())) score += 10;
        return { blog: b, score };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(item => item.blog);

    // Dynamic padding if not enough matched blogs to ensure we ALWAYS have exactly 3 links
    const finalBlogs = [...matched].slice(0, 3);
    if (finalBlogs.length < 3) {
      const extraBlogs = (blogsData as any[])
        .filter(b => b.status === 'published' && !finalBlogs.some(fb => fb.id === b.id))
        .slice(0, 3 - finalBlogs.length);
      finalBlogs.push(...extraBlogs);
    }
    return finalBlogs;
  }, [tool]);

  if (!tool) return null;

  return (
    <div className="mt-20 border-t border-white/5 pt-16 space-y-16 text-left max-w-7xl mx-auto w-full relative z-20 font-sans">
      
      {/* 1. Parent Category Link Banner */}
      {parentCategory && (
        <div className="glass rounded-[2rem] border border-white/5 p-6 bg-white/[0.01] flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3">
            <span className="text-3xl shrink-0">{parentCategory.icon}</span>
            <div>
              <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                {t('tools.parent_category', 'Parent Category')}
              </h4>
              <span className="text-sm font-black text-white uppercase mt-0.5 block">
                {t(`categories.${parentCategory.title}`, parentCategory.title)}
              </span>
            </div>
          </div>
          <Link 
            href={localizeHref(`/categories/${parentCategory.slug}`)}
            className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest text-[10px] transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-blue-600/10 active:scale-95"
          >
            {t('tools.explore_category_dir', 'Explore Category Directory')}
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* CRO & Trust Verification Section */}
      <div className="glass rounded-[2.5rem] border border-white/5 p-8 sm:p-12 bg-white/[0.01] shadow-xl space-y-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          {/* Column 1: Core Explanation & Badges */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
              🛡️ {t('tools.trust.verified_badge', 'SECURE BROWSER-NATIVE EXECUTION')}
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
              {t('tools.trust.title', 'Files Never Leave Your Device')}
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed font-medium">
              {t('tools.trust.description', 'ToolWala executes all operations directly on your computer using WebAssembly (WASM) sandboxing and local RAM compilation. We do not copy, store, or transmit your private document details. 100% serverless, private-by-design.')}
            </p>
            
            {/* Badges Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-start gap-3">
                <span className="text-xl">❌</span>
                <div>
                  <h5 className="text-xs font-black text-white uppercase">{t('tools.trust.no_uploads', 'No Uploads')}</h5>
                  <p className="text-[10px] text-gray-500 leading-relaxed font-semibold">{t('tools.trust.no_uploads_desc', 'Files compile in local RAM.')}</p>
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-start gap-3">
                <span className="text-xl">🚫</span>
                <div>
                  <h5 className="text-xs font-black text-white uppercase">{t('tools.trust.no_signups', 'No Signups')}</h5>
                  <p className="text-[10px] text-gray-500 leading-relaxed font-semibold">{t('tools.trust.no_signups_desc', 'Skip email collection.')}</p>
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-start gap-3">
                <span className="text-xl">🔌</span>
                <div>
                  <h5 className="text-xs font-black text-white uppercase">{t('tools.trust.offline', 'Offline Ready')}</h5>
                  <p className="text-[10px] text-gray-500 leading-relaxed font-semibold">{t('tools.trust.offline_desc', 'Works with internet cut off.')}</p>
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-start gap-3">
                <span className="text-xl">🛡️</span>
                <div>
                  <h5 className="text-xs font-black text-white uppercase">{t('tools.trust.gdpr', 'GDPR Compliant')}</h5>
                  <p className="text-[10px] text-gray-500 leading-relaxed font-semibold">{t('tools.trust.gdpr_desc', 'Complete data sovereignty.')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Column 2: Direct Comparison Grid */}
          <div className="border border-white/10 rounded-[2rem] overflow-hidden bg-black/20">
            <div className="p-5 border-b border-white/5 bg-white/5 text-center">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                {t('tools.trust.comp_title', 'ToolWala vs Cloud Alternatives')}
              </span>
            </div>
            <div className="divide-y divide-white/5 text-xs font-semibold">
              <div className="grid grid-cols-3 p-4 items-center">
                <span className="text-gray-400 font-bold">{t('tools.trust.metric_upload', 'File Uploads')}</span>
                <span className="text-emerald-400 font-black col-span-2 text-right">❌ {t('tools.trust.comp_none', 'None (Browser-Local)')}</span>
              </div>
              <div className="grid grid-cols-3 p-4 items-center">
                <span className="text-gray-400 font-bold">{t('tools.trust.metric_data', 'Data Storage')}</span>
                <span className="text-emerald-400 font-black col-span-2 text-right">0% {t('tools.trust.comp_purged', 'Saved (Instant Purge)')}</span>
              </div>
              <div className="grid grid-cols-3 p-4 items-center">
                <span className="text-gray-400 font-bold">{t('tools.trust.metric_speed', 'Processing Speed')}</span>
                <span className="text-emerald-400 font-black col-span-2 text-right">⚡ {t('tools.trust.comp_subsecond', 'Sub-second (No Queue)')}</span>
              </div>
              <div className="grid grid-cols-3 p-4 items-center">
                <span className="text-gray-400 font-bold">{t('tools.trust.metric_limits', 'Limits & Fees')}</span>
                <span className="text-emerald-400 font-black col-span-2 text-right">🆓 {t('tools.trust.comp_free', '100% Free / Unlimited')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. 5 Related Tools */}
      {relatedTools.length > 0 && (
        <div className="space-y-6">
          <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">
            {t('tools.related_utilities', 'Explore Related Utilities')}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {relatedTools.map((rt) => (
              <Link
                key={rt.id}
                href={localizeHref(rt.href)}
                className="group p-5 rounded-2xl bg-white/[0.01] border border-white/5 hover:border-blue-500/20 hover:bg-blue-600/5 transition-all flex flex-col justify-between h-36 shadow-lg hover:shadow-blue-500/5 cursor-pointer"
              >
                <div>
                  <span className="text-2xl mb-3 block group-hover:scale-110 transition-transform">{rt.icon}</span>
                  <h4 className="text-xs font-black text-white group-hover:text-blue-400 transition-colors uppercase line-clamp-2 leading-tight">
                    {t(`tools.${rt.slug}.title`, rt.title)}
                  </h4>
                </div>
                <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest flex items-center gap-1 mt-2">
                  {t('tools.try_tool', 'Try Tool')}
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* 3. 3 Related Blogs */}
      {relatedBlogs.length > 0 && (
        <div className="space-y-6">
          <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">
            {t('tools.related_insights', 'Related Insights & Guides')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedBlogs.map((b) => (
              <Link
                key={b.id}
                href={localizeHref(`/blog/${b.slug}`)}
                className="p-6 rounded-[2rem] bg-white/[0.01] border border-white/5 hover:border-blue-500/20 hover:bg-blue-600/5 transition-all flex flex-col justify-between h-48 group shadow-lg cursor-pointer"
              >
                <div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-blue-500">
                    {t(`categories.${b.category}`, b.category)}
                  </span>
                  <h4 className="text-sm font-black text-white uppercase group-hover:text-blue-400 transition-colors line-clamp-2 mt-2 leading-tight">
                    {t(`blogs.${b.slug}.title`, b.title)}
                  </h4>
                  <p className="text-gray-400 text-xs font-medium line-clamp-2 mt-2 font-sans leading-relaxed">
                    {t(`blogs.${b.slug}.excerpt`, b.excerpt)}
                  </p>
                </div>
                <div className="flex items-center justify-between pt-4 mt-4 border-t border-white/5">
                  <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">
                    {b.readingTime}
                  </span>
                  <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest flex items-center gap-1 select-none">
                    {t('blog.read_post', 'Read Post')}
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
