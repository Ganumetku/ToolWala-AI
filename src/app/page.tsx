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
import dynamic from 'next/dynamic';
import { useTranslation } from '@/components/I18nContext';
import { startTopProgress } from '@/components/TopProgressBar';
import PageBackground from '@/components/PageBackground';

const HomepageFAQ = dynamic(() => import('@/components/HomepageFAQ'), { ssr: false });

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
            <span>{t('home.badge', '🔒 100% In-Browser • Zero Uploads • Free & Private')}</span>
          </div>

          <h1 className="font-bold text-3xl sm:text-5xl md:text-6xl tracking-tight sm:tracking-tighter text-[#33333b] dark:text-white leading-[1.12] mb-3 max-w-4xl mx-auto">
            {t('home.hero_title_1', 'Free ')}
            <span className="text-[#2563EB] dark:text-blue-400">
              {t('home.hero_title_highlight', 'PDF, Image & Resume Tools')}
            </span>
          </h1>

          <p className="mx-auto max-w-xl text-xs sm:text-sm font-normal text-[#707078] dark:text-gray-400 leading-relaxed mb-5">
            {t('home.hero_subtitle', 'Edit PDFs, compress images, and build resumes locally in your browser with zero data retention.')}
          </p>

          <div className="mx-auto max-w-xl mb-8 relative z-30">
            <ToolAutocompleteSearch
              value={searchQuery}
              onChange={setSearchQuery}
              onSubmitSearch={goToDirectory}
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
              {t('home.why_use_title', 'Why Professionals Choose ToolWala AI')}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="premium-card p-6 flex flex-col items-start gap-3 border border-gray-200 dark:border-white/5 bg-white dark:bg-white/[0.02]">
              <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <Cpu className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider">{t('home.feat1_title', '100% In-Browser (WASM)')}</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed font-semibold">
                PDFs, images, and calculations process directly inside device RAM without uploading files to remote servers.
              </p>
            </div>
            <div className="premium-card p-6 flex flex-col items-start gap-3 border border-gray-200 dark:border-white/5 bg-white dark:bg-white/[0.02]">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider">{t('home.feat2_title', 'Zero AI Retention')}</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed font-semibold">
                Your documents and inputs are never stored, logged, or used to train third-party AI models.
              </p>
            </div>
            <div className="premium-card p-6 flex flex-col items-start gap-3 border border-gray-200 dark:border-white/5 bg-white dark:bg-white/[0.02]">
              <div className="w-11 h-11 rounded-xl bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-white/5 flex items-center justify-center text-purple-600 dark:text-purple-400">
                <UserX className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider">No Account Traps</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed font-semibold">
                Skip standard login sheets. Open any tool and process files instantly inside your active browser tab.
              </p>
            </div>
            <div className="premium-card p-6 flex flex-col items-start gap-3 border border-gray-200 dark:border-white/5 bg-white dark:bg-white/[0.02]">
              <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <Gift className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider">{t('home.trust_banner.free', '100% Free Always')}</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed font-semibold">
                Enjoy unlimited document splits, PDF compressions, background removals, and calculations without fees.
              </p>
            </div>
          </div>
        </div>
      </section>

      <HomepageFAQ />
    </div>
  );
}
