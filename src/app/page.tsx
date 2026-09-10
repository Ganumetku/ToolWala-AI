"use client";

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Sparkles, ShieldCheck, Zap,
  Search, ChevronRight,
  Layers, Clock, ArrowRight, MousePointerClick,
  Lock, FileText, Cpu, UserX, Gift,
  FileCheck, Users, Star
} from 'lucide-react';
import ToolCard from '@/components/ToolCard';
import ToolIcon from '@/components/ToolIcon';
import PdfToolIcon, { isPdfTool } from '@/components/PdfToolIcon';
import ToolAutocompleteSearch from '@/components/ToolAutocompleteSearch';
import { toolsData, Tool } from '@/data/tools';
import { fetchPublicTools } from '@/lib/tools';
import dynamic from 'next/dynamic';
import { useTranslation } from '@/components/I18nContext';
import { startTopProgress } from '@/components/TopProgressBar';
import PageBackground from '@/components/PageBackground';



// Dynamic Import of Premium Hubs/Sections
const GovernmentToolHub = dynamic(() => import('@/components/GovernmentToolHub'), { ssr: false });
const HomepageFAQ = dynamic(() => import('@/components/HomepageFAQ'), { ssr: false });
const PopularToolsGrid = dynamic(() => import('@/components/PopularToolsGrid'), { ssr: false });

export default function Home() {
  const { t, localizeHref } = useTranslation();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [mounted, setMounted] = useState(false);
  const [loadEffects, setLoadEffects] = useState(false);
  const [recentToolIds, setRecentToolIds] = useState<string[]>([]);
  const [mergedTools, setMergedTools] = useState<Tool[]>(toolsData);

  useEffect(() => {
    setMounted(true);
    try {
      const stored = JSON.parse(localStorage.getItem('recentlyUsedTools') || '[]');
      const validIds = stored.filter((id: string) => toolsData.some(t => t.id === id));
      setRecentToolIds(validIds);
    } catch (e) {
      console.error('Error reading recent tools:', e);
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      const timer = setTimeout(() => setLoadEffects(true), 1200);
      return () => clearTimeout(timer);
    }
  }, [mounted]);

  useEffect(() => {
    if (!mounted) return;
    fetchPublicTools().then(setMergedTools).catch(() => { });
  }, [mounted]);

  const recentTools = useMemo(() => {
    return recentToolIds
      .map(id => mergedTools.find(t => t.id === id))
      .filter((t): t is Tool => !!t);
  }, [recentToolIds, mergedTools]);

  // Redirection Search Submission
  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    startTopProgress();
    if (searchQuery.trim()) {
      router.push(localizeHref('/tools') + '?search=' + encodeURIComponent(searchQuery.trim()));
    } else {
      router.push(localizeHref('/tools'));
    }
  };

  const handleSuggestionClick = (query: string) => {
    startTopProgress();
    router.push(localizeHref('/tools') + '?search=' + encodeURIComponent(query));
  };

  const [activeCategoryTab, setActiveCategoryTab] = useState<string>("All");

  const categoryTabs = [
    { id: "All", label: t('categories.All', 'All Popular'), icon: "Sparkles" },
    { id: "PDF Tools", label: t('categories.PDF Tools', 'PDF'), icon: "FileText" },
    { id: "Image Tools", label: t('categories.Image Tools', 'Images'), icon: "Image" },
    { id: "AI Tools", label: t('categories.AI Tools', 'AI Tools'), icon: "Sparkles" },
    { id: "Govt & Exam", label: t('home.tab_govt', 'Govt & Exam'), icon: "IdCard" },
    { id: "Calculator Tools", label: t('categories.Calculator Tools', 'Calculators'), icon: "Calculator" }
  ];

  // Exact iLovePDF Layout Sequence followed by Image, AI, Govt & Calculators
  const ILOVEPDF_ORDERED_IDS = [
    // 1. iLovePDF Core PDF Suite (Exact Screenshot Sequence)
    "pdf-compare",
    "merge-pdf",
    "split-pdf",
    "compress-pdf",
    "pdf-to-word-converter",
    "pdf-to-powerpoint",
    "pdf-to-excel-converter",
    "word-to-pdf-converter",
    "powerpoint-to-pdf",
    "excel-to-pdf-converter",
    "edit-pdf",
    "pdf-to-jpg",
    "jpg-to-pdf",
    "sign-pdf",
    "watermark-pdf",
    "rotate-pdf",
    "unlock-pdf",
    "protect-pdf",
    "organize-pdf",
    "add-page-numbers-to-pdf",
    "pdf-ocr",
    "crop-pdf",
    "remove-pages",
    "pdf-summarizer",
    
    // 2. High-Demand Image Tools
    "image-compressor",
    "bg-remover",
    "background-remover",
    "passport-photo-maker",
    "heic-to-jpg-png-converter",
    "webp-to-jpg-png-converter",
    "jpg-to-webp",
    "png-to-webp",
    "color-palette-generator",
    "ai-image-upscaler",
    
    // 3. Indian Government & Exam Form Utilities
    "crop-aadhaar-card",
    "aadhaar-masking-tool",
    "aadhaar-pdf-compressor",
    "pan-card-resize",
    "signature-resize",
    "ssc-photo-resize",
    "upsc-photo-resize",
    "gov-form-pdf-compressor",
    "gov-form-image-compressor",
    
    // 4. Intelligent AI Utilities
    "text-humanizer",
    "voice-generator",
    "ai-logo-maker",
    "resume-builder",
    "ats-resume-checker",
    "caption-generator",
    "ai-image-describer",
    "cover-letter-generator",
    
    // 5. Calculators & Productivity Utilities
    "income-tax-calculator",
    "emi-calculator",
    "sip-calculator",
    "gst-calculator",
    "age-calculator",
    "bmi-calculator",
    "discount-calculator",
    "youtube-money-calculator",
    "adsense-revenue-calculator",
    "qr-code-generator",
    "json-formatter-validator",
    "base64-encoder-decoder",
    "word-counter",
    "password-generator",
    "invoice-generator",
    "ocr-to-text"
  ];

  // Dynamic Workspace Tools Filter
  const workspaceTools = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    
    if (query) {
      return mergedTools.filter(tool => {
        return (
          tool.isVisible &&
          (tool.title.toLowerCase().includes(query) ||
           tool.description.toLowerCase().includes(query) ||
           tool.category.toLowerCase().includes(query) ||
           tool.tags.some(tag => tag.toLowerCase().includes(query)))
        );
      });
    }

    if (activeCategoryTab === "All") {
      const orderedTools: Tool[] = [];
      const seenIds = new Set<string>();

      // First add tools in the exact iLovePDF sequence
      ILOVEPDF_ORDERED_IDS.forEach(id => {
        const found = mergedTools.find(t => (t.id === id || t.slug === id) && t.isVisible);
        if (found && !seenIds.has(found.id)) {
          orderedTools.push(found);
          seenIds.add(found.id);
        }
      });

      // Then add any remaining visible tools
      mergedTools.forEach(tool => {
        if (tool.isVisible && !seenIds.has(tool.id)) {
          orderedTools.push(tool);
          seenIds.add(tool.id);
        }
      });

      return orderedTools;
    }

    if (activeCategoryTab === "PDF Tools") {
      const pdfOrdered: Tool[] = [];
      const seenIds = new Set<string>();

      ILOVEPDF_ORDERED_IDS.forEach(id => {
        const found = mergedTools.find(t => (t.id === id || t.slug === id) && t.category === 'PDF Tools' && t.isVisible);
        if (found && !seenIds.has(found.id)) {
          pdfOrdered.push(found);
          seenIds.add(found.id);
        }
      });

      mergedTools.filter(t => t.category === 'PDF Tools' && t.isVisible).forEach(tool => {
        if (!seenIds.has(tool.id)) {
          pdfOrdered.push(tool);
          seenIds.add(tool.id);
        }
      });

      return pdfOrdered;
    }

    if (activeCategoryTab === "Govt & Exam") {
      return mergedTools.filter(t => 
        t.isVisible && (
          t.tags.some(tag => ['govt', 'exam', 'aadhaar', 'pan', 'ssc', 'upsc', 'resizer'].includes(tag.toLowerCase())) ||
          t.category === 'Document Tools'
        )
      );
    }

    return mergedTools.filter(t => t.category === activeCategoryTab && t.isVisible);
  }, [mergedTools, activeCategoryTab, searchQuery]);

  return (
    <div className="flex flex-col min-h-screen bg-[#F6F8FC] dark:bg-[#030712] text-[#33333b] dark:text-white relative transition-colors duration-250 font-sans">

      {/* iLovePDF-inspired Organic Background Waves & Pastels */}
      <PageBackground />

      {/* 1. Hero & Direct Interactive Tools Workspace (Above the Fold) */}
      <section className="relative pt-6 sm:pt-10 pb-16 border-b border-[#E5E7EB] dark:border-white/5 overflow-hidden">

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 max-w-7xl">

          {/* Integrated Privacy Pill Badge */}
          <div className="animate-fade-in inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-50/90 dark:bg-slate-900/60 border border-slate-200/90 dark:border-white/10 text-slate-600 dark:text-slate-300 text-[10px] sm:text-[11px] font-bold uppercase tracking-widest mb-3.5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] select-none backdrop-blur-sm">
            <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 ring-2 ring-emerald-500/20" />
            <span>{t('home.badge', '🔒 100% In-Browser • Zero Uploads • Free & Private')}</span>
          </div>

          {/* Punchy, Confident Headline with tighter tracking */}
          <h1 className="animate-fade-up font-bold text-3xl sm:text-5xl md:text-6xl tracking-tight sm:tracking-tighter text-[#33333b] dark:text-white leading-[1.12] mb-3 max-w-4xl mx-auto">
            {t('home.hero_title_1', 'Free ')}
            <span className="text-[#2563EB] dark:text-blue-400">
              {t('home.hero_title_highlight', 'PDF, Image & AI Tools')}
            </span>
          </h1>

          <p className="animate-fade-up mx-auto max-w-xl text-xs sm:text-sm font-normal text-[#707078] dark:text-gray-400 leading-relaxed mb-5">
            {t('home.hero_subtitle', 'Edit PDFs, compress images, remove backgrounds, and use AI utilities locally in your browser with zero data retention.')}
          </p>

          {/* Instant Search Bar with subtle shadow & tactile feel */}
          <div className="animate-fade-up mx-auto max-w-xl mb-5 relative z-30">
            <ToolAutocompleteSearch
              value={searchQuery}
              onChange={setSearchQuery}
              onSubmitSearch={(query) => {
                if (query.trim()) {
                  router.push(localizeHref('/tools') + '?search=' + encodeURIComponent(query.trim()));
                }
              }}
            />
          </div>

          {/* Interactive Category Filter Tabs (Tactile pills with smooth transition & subtle hover) */}
          <div className="animate-fade-in flex flex-wrap justify-center items-center gap-1.5 sm:gap-2 mb-7 sm:mb-9 relative z-10 max-w-3xl mx-auto">
            {categoryTabs.map((tab) => {
              const isActive = activeCategoryTab === tab.id && !searchQuery;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setSearchQuery("");
                    setActiveCategoryTab(tab.id);
                  }}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[10px] sm:text-[11px] font-bold uppercase tracking-wider transition-all duration-200 ease-out active:scale-95 cursor-pointer select-none ${
                    isActive
                      ? 'bg-[#2563EB] text-white shadow-sm shadow-blue-500/25 border border-blue-600'
                      : 'bg-slate-50/70 dark:bg-white/[0.03] text-slate-600 dark:text-slate-400 border border-slate-200/70 dark:border-white/8 hover:border-slate-300 dark:hover:border-white/15 hover:bg-white dark:hover:bg-white/[0.07] hover:text-slate-900 dark:hover:text-white hover:shadow-[0_2px_6px_rgba(0,0,0,0.04)]'
                  }`}
                >
                  <ToolIcon icon={tab.icon} className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" strokeWidth={2} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Search Result Count Notice */}
          {searchQuery && (
            <div className="mb-6 text-sm font-bold text-blue-600 dark:text-blue-400">
              {t('tools.showing_results', `Showing results for "${searchQuery}"`)} ({workspaceTools.length} tools)
            </div>
          )}

          {/* DIRECT TOOLS GRID (Generous breathing room & tactile elevation) */}
          {workspaceTools.length > 0 ? (
            <div className="grid grid-cols-1 min-[480px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 text-left mb-8 sm:mb-10">
              {workspaceTools.map((tool) => (
                <ToolCard 
                  key={tool.id} 
                  {...tool} 
                  isPopular={tool.popular}
                />
              ))}
            </div>
          ) : (
            <div className="p-10 rounded-3xl bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/10 text-center my-6">
              <p className="text-sm font-bold text-gray-500">{t('home.no_tools_found', 'No tools found matching your query.')}</p>
              <button
                onClick={() => setSearchQuery("")}
                className="mt-3 px-5 py-2 rounded-xl bg-blue-600 text-white text-xs font-black uppercase tracking-wider shadow-sm hover:brightness-105 active:scale-95 transition-all"
              >
                {t('tools.clear_search', 'Clear Search')}
              </button>
            </div>
          )}

          {/* Explore All Tools Banner Action */}
          <div className="flex flex-wrap justify-center items-center gap-4 mt-10 sm:mt-12">
            <Link
              href={localizeHref('/tools')}
              className="inline-flex items-center gap-2.5 px-8 py-3.5 bg-white dark:bg-white/5 border border-slate-200/90 dark:border-white/10 hover:border-blue-500/40 dark:hover:border-white/20 text-xs font-bold uppercase tracking-widest text-[#0F172A] dark:text-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_20px_rgba(37,99,235,0.08)] hover:-translate-y-0.5 active:scale-95 transition-all duration-200 group"
            >
              <span>{t('tools.explore_all_count', 'Explore All 60+ Browser Tools')}</span>
              <ArrowRight className="w-4 h-4 text-blue-600 dark:text-blue-400 transition-transform group-hover:translate-x-1" />
            </Link>

            <Link
              href={localizeHref('/categories')}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-slate-50/70 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 text-xs font-bold uppercase tracking-widest text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-white/[0.05] hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200 active:scale-95"
            >
              <span>{t('home.browse_categories', 'Browse 13 Categories')}</span>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </Link>
          </div>

        </div>
      </section>

      {/* 2. Indian Government & Exam Form Utilities Hub */}
      <GovernmentToolHub />

      {/* 3. Popular & Essential Tools Suite */}
      <PopularToolsGrid />

      {/* 4. Recently Used Tray (if any) */}
      {mounted && recentTools.length > 0 && (
        <section className="py-14 border-b border-[#E5E7EB] dark:border-white/5 bg-[#F6F8FC] dark:bg-white/[0.01] relative overflow-hidden transition-colors duration-250">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
            <div className="flex items-center gap-2.5 mb-5 relative z-10">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <h3 className="text-[10px] font-black uppercase tracking-widest text-[#64748B]">{t('home.recent_visited', 'Recently Visited Utilities')}</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
              {recentTools.map((tool) => {
                const displayTitle = t(`tools.${tool.id}.title`, tool.title);
                const displayCategory = t(`categories.${tool.category}`, tool.category);
                return (
                  <Link
                    key={tool.id}
                    href={localizeHref(tool.href)}
                    className="flex items-center gap-3.5 p-4 rounded-2xl bg-white dark:bg-white/5 border border-[#E8ECF4] dark:border-white/10 hover:border-[#2563EB]/40 hover:bg-blue-50/50 dark:hover:bg-blue-600/5 transition-all group animate-in fade-in duration-300 shadow-sm"
                  >
                    <PdfToolIcon
                      toolId={tool.id}
                      iconName={tool.icon}
                      category={tool.category}
                      size="sm"
                      className="shrink-0 group-hover:scale-105 transition-transform"
                    />
                    <div className="overflow-hidden">
                      <h4 className="text-xs font-black text-[#0F172A] dark:text-white group-hover:text-[#2563EB] dark:group-hover:text-blue-400 transition-colors truncate">{displayTitle}</h4>
                      <p className="text-[9px] text-[#64748B] dark:text-gray-600 font-bold uppercase tracking-wider mt-0.5">{displayCategory}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* 5. The ToolWala Edge (Unified Trust, Speed & Privacy Architecture) */}
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
            <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm font-medium">
              {t('home.edge_desc', 'Browser-native speed meets zero data retention. No signups, no cloud logs, and no subscription traps.')}
            </p>
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
              <div className="w-11 h-11 rounded-xl bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400">
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

          {/* Privacy Hub Banner Callout */}
          <div className="mt-10 p-6 sm:p-7 rounded-3xl bg-white dark:bg-white/[0.03] border border-blue-500/20 dark:border-blue-500/30 flex flex-col sm:flex-row items-center justify-between gap-5 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="text-left">
                <h4 className="text-base sm:text-lg font-black text-gray-900 dark:text-white tracking-tight">
                  {t('home.privacy_callout_title', 'Zero-Upload Privacy Architecture')}
                </h4>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">
                  {t('home.privacy_callout_desc', 'Explore our interactive Privacy Hub to see how WebAssembly and in-browser processing keep your data 100% on your device.')}
                </p>
              </div>
            </div>
            <Link
              href={localizeHref('/privacy')}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-2xl text-xs font-bold tracking-wider uppercase transition-all shadow-md shadow-blue-600/20 shrink-0 hover:scale-[1.02] active:scale-95 whitespace-nowrap"
            >
              <span>{t('home.explore_privacy_hub', 'Visit Privacy Hub')}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 6. FAQ Section */}
      <HomepageFAQ />

    </div>
  );
}
