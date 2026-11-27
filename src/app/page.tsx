"use client";

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Sparkles, ShieldCheck, ArrowRight, Cpu, UserX, Gift,
} from 'lucide-react';
import ToolCard from '@/components/ToolCard';
import ToolAutocompleteSearch from '@/components/ToolAutocompleteSearch';
import { toolsData, type Tool } from '@/data/tools';
import { HOMEPAGE_TOP_TOOL_IDS } from '@/data/homepageTools';
import HomepageFAQ from '@/components/HomepageFAQ';
import { useTranslation } from '@/components/I18nContext';
import { startTopProgress } from '@/components/TopProgressBar';
import PageBackground from '@/components/PageBackground';

const QUICK_TOOLS = [
  { id: 'jpg-to-pdf', href: '/tools/jpg-to-pdf/', labelKey: 'home.quick_jpg', fallback: 'JPG to PDF' },
  { id: 'merge-pdf', href: '/tools/merge-pdf/', labelKey: 'home.quick_merge', fallback: 'Merge PDF' },
  { id: 'aadhaar-pdf-compressor', href: '/tools/aadhaar-pdf-compressor/', labelKey: 'home.quick_aadhaar', fallback: 'Aadhaar 300KB' },
  { id: 'passport-photo-maker', href: '/tools/passport-photo-maker/', labelKey: 'home.quick_passport', fallback: 'Passport Photo' },
] as const;

function resolveHomepageTools(): Tool[] {
  const seen = new Set<string>();
  const list: Tool[] = [];
  for (const id of HOMEPAGE_TOP_TOOL_IDS) {
    const found = toolsData.find((t) => (t.id === id || t.slug === id) && t.isVisible);
    if (found && !seen.has(found.id)) {
      list.push(found);
      seen.add(found.id);
    }
  }
  return list;
}

export default function Home() {
  const { t, localizeHref } = useTranslation();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const topTools = useMemo(() => resolveHomepageTools(), []);

  const goToDirectory = (query?: string) => {
    startTopProgress();
    const q = (query ?? searchQuery).trim();
    router.push(q ? `${localizeHref('/tools')}?search=${encodeURIComponent(q)}` : localizeHref('/tools'));
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F6F8FC] dark:bg-[#030712] text-[#33333b] dark:text-white relative transition-colors duration-250 font-sans">
      <PageBackground />

      <section className="relative pt-6 sm:pt-10 pb-16 border-b border-[#E5E7EB] dark:border-white/5 overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 max-w-7xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-50/90 dark:bg-slate-900/60 border border-slate-200/90 dark:border-white/10 text-slate-600 dark:text-slate-300 text-[10px] sm:text-[11px] font-bold uppercase tracking-widest mb-3.5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] select-none">
            <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 ring-2 ring-emerald-500/20" />
            <span>{t('home.badge', 'BROWSER-BASED • NO FILE UPLOADS • PRIVACY FIRST')}</span>
          </div>

          <h1 className="font-bold text-3xl sm:text-5xl md:text-6xl tracking-tight sm:tracking-tighter text-[#33333b] dark:text-white leading-[1.12] mb-3 max-w-4xl mx-auto">
            {t('home.hero_title_1', 'Free Online PDF & Image Tools')}
          </h1>

          <p className="mx-auto max-w-2xl text-xs sm:text-sm font-normal text-[#707078] dark:text-gray-400 leading-relaxed mb-5">
            {t('home.hero_subtitle', 'Edit PDFs, convert files, compress images and access everyday utilities directly in your browser. Fast, free and private — no sign-up required.')}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 mb-6">
            {QUICK_TOOLS.map((tool) => (
              <Link
                key={tool.id}
                href={localizeHref(tool.href)}
                onClick={() => startTopProgress()}
                className="inline-flex items-center px-3.5 py-2 rounded-full bg-white dark:bg-white/[0.06] border border-slate-200/90 dark:border-white/10 text-[12px] sm:text-[13px] font-semibold text-slate-700 dark:text-slate-200 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 hover:shadow-sm transition-all"
              >
                {t(tool.labelKey, tool.fallback)}
              </Link>
            ))}
          </div>

          <div className="mx-auto max-w-xl mb-8 relative z-30">
            <ToolAutocompleteSearch
              value={searchQuery}
              onChange={setSearchQuery}
              onSubmitSearch={goToDirectory}
              placeholder={t('home.search_placeholder', 'Search PDF, image and other tools...')}
            />
          </div>

          <div className="grid grid-cols-1 min-[480px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 text-left mb-8 sm:mb-10">
            {topTools.map((tool, index) => (
              <ToolCard
                key={tool.id}
                {...tool}
                isPopular
                priority={index < 4}
              />
            ))}
          </div>

          <div className="flex justify-center mt-6 sm:mt-8">
            <Link
              href={localizeHref('/tools')}
              className="inline-flex items-center gap-2.5 px-8 py-3.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold uppercase tracking-widest rounded-xl shadow-lg shadow-blue-500/20 hover:-translate-y-0.5 active:scale-95 transition-all duration-200 group"
            >
              <span>{t('tools.explore_all', 'Explore All Tools')}</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-24 bg-[#F6F8FC] dark:bg-[#030712] relative overflow-hidden border-b border-gray-200 dark:border-white/5 transition-colors duration-250">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 text-[10px] font-bold uppercase tracking-widest border border-gray-200 dark:border-white/10 mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              {t('home.edge_title', 'The ToolWala Edge')}
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              {t('home.why_use_title', 'Why Choose ToolWala?')}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="premium-card p-6 flex flex-col items-start gap-3 border border-gray-200 dark:border-white/5 bg-white dark:bg-white/[0.02]">
              <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <Cpu className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider">{t('home.feat1_title', 'Browser-Based Processing')}</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed font-semibold">
                {t('home.feat1_desc', 'Process supported PDF and image files directly in your browser without uploading them to a server.')}
              </p>
            </div>
            <div className="premium-card p-6 flex flex-col items-start gap-3 border border-gray-200 dark:border-white/5 bg-white dark:bg-white/[0.02]">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider">{t('home.feat2_title', 'Privacy by Design')}</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed font-semibold">
                {t('home.feat2_desc', 'Supported local tools keep your files on your device during processing. Read our Privacy Policy to learn more about analytics and data handling.')}
              </p>
            </div>
            <div className="premium-card p-6 flex flex-col items-start gap-3 border border-gray-200 dark:border-white/5 bg-white dark:bg-white/[0.02]">
              <div className="w-11 h-11 rounded-xl bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-white/5 flex items-center justify-center text-purple-600 dark:text-purple-400">
                <UserX className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider">{t('home.feat3_title', 'No Sign-Up Required')}</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed font-semibold">
                {t('home.feat3_desc', 'Use supported free tools without creating an account. Open a tool, process your file and download the result.')}
              </p>
            </div>
            <div className="premium-card p-6 flex flex-col items-start gap-3 border border-gray-200 dark:border-white/5 bg-white dark:bg-white/[0.02]">
              <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <Gift className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider">{t('home.feat4_title', 'Free & Easy to Use')}</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed font-semibold">
                {t('home.feat4_desc', 'Access essential PDF, image and everyday utility tools through a simple, browser-based interface.')}
              </p>
            </div>
          </div>
        </div>
      </section>

      <HomepageFAQ />
    </div>
  );
}
