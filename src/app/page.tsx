"use client";

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Sparkles, ShieldCheck, Zap,
  Search, ChevronRight,
  Layers, Clock, ArrowRight, MousePointerClick,
  Lock, FileText, Cpu
} from 'lucide-react';
import ToolCard from '@/components/ToolCard';
import ToolAutocompleteSearch from '@/components/ToolAutocompleteSearch';
import { toolsData, Tool } from '@/data/tools';
import { fetchPublicTools } from '@/lib/tools';
import dynamic from 'next/dynamic';
import { useTranslation } from '@/components/I18nContext';

// Dynamic Import of Background Effects
const MeshGradient = dynamic(
  () => import('@/components/BackgroundEffects').then((m) => m.MeshGradient),
  { ssr: false }
);
const FloatingParticles = dynamic(
  () => import('@/components/BackgroundEffects').then((m) => m.FloatingParticles),
  { ssr: false }
);

// Dynamic Import of Premium Hubs/Sections
const GovernmentToolHub = dynamic(() => import('@/components/GovernmentToolHub'), { ssr: false });
const HomepageTestimonials = dynamic(() => import('@/components/HomepageTestimonials'), { ssr: false });
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
    if (searchQuery.trim()) {
      router.push(localizeHref('/tools') + '?search=' + encodeURIComponent(searchQuery.trim()));
    } else {
      router.push(localizeHref('/tools'));
    }
  };

  const handleSuggestionClick = (query: string) => {
    router.push(localizeHref('/tools') + '?search=' + encodeURIComponent(query));
  };

  // Shelves filter logic
  const popularToolsList = useMemo(() => {
    return mergedTools.filter(t => t.popular && t.isVisible).slice(0, 8);
  }, [mergedTools]);

  const pdfToolsList = useMemo(() => {
    return mergedTools.filter(t => t.category === 'PDF Tools' && t.isVisible).slice(0, 4);
  }, [mergedTools]);

  const imageToolsList = useMemo(() => {
    return mergedTools.filter(t => t.category === 'Image Tools' && t.isVisible).slice(0, 4);
  }, [mergedTools]);

  const aiToolsList = useMemo(() => {
    return mergedTools.filter(t => t.category === 'AI Tools' && t.isVisible).slice(0, 4);
  }, [mergedTools]);

  const popularSuggestionChips = [
    { label: t('tools.bg-remover.title', 'Remove Background'), query: "background" },
    { label: t('tools.passport-photo-maker.title', 'Passport Photo'), query: "passport" },
    { label: t('tools.image-compressor.title', 'Compress Image'), query: "compress" },
    { label: t('tools.merge-pdf.title', 'Merge PDF'), query: "merge" },
    { label: t('tools.aadhaar-photo-resizer.title', 'Aadhaar Resizer'), query: "aadhaar" },
    { label: t('tools.resume-builder.title', 'AI Resume'), query: "resume" }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#F7F8FC] dark:bg-[#030712] text-[#0F172A] dark:text-white relative overflow-hidden transition-colors duration-250">

      {/* 1. Hero Section */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center py-20 md:py-28 overflow-hidden border-b border-[#E8ECF4] dark:border-white/5">
        {loadEffects && <MeshGradient />}
        {loadEffects && <FloatingParticles />}

        {/* Background Radial Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-gradient-to-tr from-blue-500/10 via-purple-500/5 to-transparent rounded-full blur-[140px] pointer-events-none" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">

          {/* Glowing Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-white/5 border border-[#E8ECF4] dark:border-white/10 backdrop-blur-md text-[#2563EB] dark:text-blue-400 text-xs font-black tracking-widest mb-8 shadow-sm dark:shadow-2xl hover:border-blue-500/30 transition-colors cursor-pointer select-none"
          >
            <span className="flex h-2 w-2 rounded-full bg-[#2563EB] dark:bg-blue-500 animate-pulse" />
            <span>{t('home.badge', '🔒 100% Browser-Based • No Upload Required • Privacy First')}</span>
            <ChevronRight className="w-3.5 h-3.5 text-[#64748B] dark:text-gray-500" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mx-auto max-w-5xl font-black text-4xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tight text-[#0F172A] dark:text-white leading-[1.05] mb-6"
          >
            {t('home.hero_title_1', 'Free ')}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2563EB] via-indigo-600 to-[#7C3AED] dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 animate-gradient">
              {t('home.hero_title_highlight', 'PDF, Image & Resume Tools')}
            </span>
            <br />
            {t('home.hero_title_2', 'Built for Everyone')}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mx-auto max-w-[720px] text-base sm:text-lg md:text-xl font-medium text-[#334155] dark:text-gray-300 leading-relaxed mb-10"
          >
            {t('home.hero_subtitle', 'Edit PDFs, convert images, create passport photos, compress files, optimize resumes, and use powerful browser-based utilities — all without uploading your files. Fast, secure, and completely free.')}
          </motion.p>

          {/* Search bar for tools */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="mx-auto max-w-3xl mb-8"
          >
            <ToolAutocompleteSearch
              value={searchQuery}
              onChange={setSearchQuery}
              onSubmitSearch={(query) => {
                if (query.trim()) {
                  router.push(localizeHref('/tools') + '?search=' + encodeURIComponent(query.trim()));
                } else {
                  router.push(localizeHref('/tools'));
                }
              }}
            />
          </motion.div>

          {/* Top 3 Categories */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="flex flex-wrap justify-center gap-4 max-w-2xl mx-auto mb-8"
          >
            <Link
              href={localizeHref('/categories/pdf-tools')}
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-red-50 dark:bg-red-500/10 hover:bg-red-600 dark:hover:bg-red-600 border border-red-200/80 dark:border-red-500/20 text-xs font-black uppercase tracking-wider text-red-600 dark:text-red-400 hover:text-white dark:hover:text-white transition-all duration-300 active:scale-95 shadow-sm hover:shadow-lg hover:shadow-red-500/20 hover:scale-105"
            >
              📄 {t('categories.PDF Tools', 'PDF Tools')}
            </Link>
            <Link
              href={localizeHref('/categories/image-tools')}
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-600 dark:hover:bg-blue-600 border border-blue-200/80 dark:border-blue-500/20 text-xs font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 hover:text-white dark:hover:text-white transition-all duration-300 active:scale-95 shadow-sm hover:shadow-lg hover:shadow-blue-500/20 hover:scale-105"
            >
              🖼️ {t('categories.Image Tools', 'Image Tools')}
            </Link>
            <Link
              href={localizeHref('/categories/ai-tools')}
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-purple-50 dark:bg-purple-500/10 hover:bg-purple-600 dark:hover:bg-purple-600 border border-purple-200/80 dark:border-purple-500/20 text-xs font-black uppercase tracking-wider text-purple-600 dark:text-purple-400 hover:text-white dark:hover:text-white transition-all duration-300 active:scale-95 shadow-sm hover:shadow-lg hover:shadow-purple-500/20 hover:scale-105"
            >
              🤖 {t('categories.AI Tools', 'AI Tools')}
            </Link>
          </motion.div>

          {/* Suggestion Chips */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap justify-center items-center gap-2 max-w-2xl mx-auto mb-10"
          >
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-500 mr-1 flex items-center gap-1">
              <MousePointerClick className="w-3 h-3 text-blue-500" /> {t('home.suggestions_label', 'Suggestions:')}
            </span>
            {popularSuggestionChips.map((chip) => (
              <button
                key={chip.label}
                onClick={() => handleSuggestionClick(chip.query)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 hover:border-blue-500/40 hover:bg-blue-50 dark:hover:bg-blue-600/20 text-[9px] text-slate-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-white transition-all font-bold cursor-pointer active:scale-95"
              >
                {chip.label}
              </button>
            ))}
          </motion.div>

          {/* Primary & Secondary CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="flex flex-wrap justify-center items-center gap-4"
          >
            <Link
              href={localizeHref('/tools')}
              className="relative group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#2563EB] to-[#7C3AED] hover:from-blue-600 hover:to-purple-700 rounded-2xl text-xs font-black uppercase tracking-widest text-white shadow-[0_0_30px_rgba(37,99,235,0.3)] hover:shadow-[0_0_40px_rgba(37,99,235,0.5)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>{t('home.primary_cta', 'Explore Free Tools')}</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href={localizeHref('/categories')}
              className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-white dark:bg-white/5 border border-[#E8ECF4] dark:border-white/10 hover:border-blue-500/40 text-xs font-black uppercase tracking-widest text-[#0F172A] dark:text-white hover:text-[#2563EB] dark:hover:text-blue-400 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>{t('home.secondary_cta', 'Browse Categories')}</span>
              <ChevronRight className="w-4 h-4 text-[#64748B] dark:text-gray-400" />
            </Link>
          </motion.div>

        </div>
      </section>

      {/* 2. Trust & Security Seals Banner */}
      <section className="py-16 border-b border-[#E8ECF4] dark:border-white/5 bg-white dark:bg-white/[0.01] relative overflow-hidden transition-colors duration-250">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/[0.01] via-transparent to-purple-500/[0.01] pointer-events-none" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="text-center mb-10">
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#64748B]">
              {t('home.trust_banner.title', 'TRUST & SECURITY VERIFICATIONS')}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="premium-card p-6 flex flex-col items-center justify-center text-center border-emerald-200 dark:border-emerald-500/10 hover:border-emerald-500/30 bg-emerald-50/30 dark:bg-emerald-950/[0.01]">
              <ShieldCheck className="w-7 h-7 text-emerald-600 dark:text-emerald-400 mb-3" />
              <h4 className="text-[11px] font-black text-[#0F172A] dark:text-white uppercase tracking-wider mb-1">
                {t('home.trust_banner.gdpr', 'GDPR & CCPA Private')}
              </h4>
              <p className="text-[9px] text-[#475569] dark:text-gray-500 font-semibold leading-relaxed">No files ever leave your device.</p>
            </div>
            
            <div className="premium-card p-6 flex flex-col items-center justify-center text-center border-blue-200 dark:border-blue-500/10 hover:border-blue-500/30 bg-blue-50/30 dark:bg-blue-950/[0.01]">
              <Cpu className="w-7 h-7 text-[#2563EB] dark:text-blue-400 mb-3" />
              <h4 className="text-[11px] font-black text-[#0F172A] dark:text-white uppercase tracking-wider mb-1">
                {t('home.trust_banner.local', '100% Edge Processing')}
              </h4>
              <p className="text-[9px] text-[#475569] dark:text-gray-500 font-semibold leading-relaxed">Runs directly inside browser sandbox.</p>
            </div>

            <div className="premium-card p-6 flex flex-col items-center justify-center text-center border-purple-200 dark:border-purple-500/10 hover:border-purple-500/30 bg-purple-50/30 dark:bg-purple-950/[0.01]">
              <Lock className="w-7 h-7 text-[#7C3AED] dark:text-purple-400 mb-3" />
              <h4 className="text-[11px] font-black text-[#0F172A] dark:text-white uppercase tracking-wider mb-1">
                {t('home.trust_banner.no_upload', 'No Cloud Database Logs')}
              </h4>
              <p className="text-[9px] text-[#475569] dark:text-gray-500 font-semibold leading-relaxed">Absolute data privacy, zero logging.</p>
            </div>

            <div className="premium-card p-6 flex flex-col items-center justify-center text-center border-amber-200 dark:border-yellow-500/10 hover:border-yellow-500/30 bg-amber-50/30 dark:bg-yellow-950/[0.01]">
              <Zap className="w-7 h-7 text-amber-600 dark:text-yellow-400 mb-3" />
              <h4 className="text-[11px] font-black text-[#0F172A] dark:text-white uppercase tracking-wider mb-1">
                {t('home.trust_banner.free', 'Always Free Beta')}
              </h4>
              <p className="text-[9px] text-[#475569] dark:text-gray-500 font-semibold leading-relaxed">Unlimited calculations, splits, & crops.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Recently Used Tray */}
      {mounted && recentTools.length > 0 && (
        <section className="py-16 border-b border-[#E8ECF4] dark:border-white/5 bg-[#F8FAFC] dark:bg-white/[0.01] relative overflow-hidden transition-colors duration-250">
          <div className="absolute inset-0 bg-blue-600/[0.02] blur-3xl pointer-events-none" />
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
            <div className="flex items-center gap-2.5 mb-6 relative z-10">
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
                    <div className="text-xl w-10 h-10 rounded-xl bg-blue-50 dark:bg-white/5 flex items-center justify-center border border-blue-100 dark:border-white/5 group-hover:scale-110 transition-transform">
                      {tool.icon}
                    </div>
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

      {/* 3. Most Popular Tools Shelf */}
      {popularToolsList.length > 0 && (
        <section id="tools-section" className="py-24 relative overflow-hidden bg-[#F9FAFB] dark:bg-black/10 border-b border-[#E8ECF4] dark:border-white/5 transition-colors duration-250">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-widest border border-blue-200 dark:border-blue-500/20 mb-4 shadow-sm">
                <Sparkles className="w-3.5 h-3.5" />
                {t('home.popular_shelf_title', 'Popular Handpicked Tools')}
              </div>
              <h2 className="text-3xl sm:text-5xl font-black text-gray-900 dark:text-white tracking-tight uppercase">
                Most Popular Tools
              </h2>
              <p className="text-gray-600 dark:text-gray-500 mt-3 font-medium">
                Try our highly optimized local editors. No logins required, launch instantly.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {popularToolsList.map((tool) => (
                <ToolCard 
                  key={tool.id} 
                  {...tool} 
                  isPopular={true}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 4. PDF Tools Shelf */}
      {pdfToolsList.length > 0 && (
        <section className="py-24 relative overflow-hidden bg-slate-50/50 dark:bg-black/20 border-b border-gray-200 dark:border-white/5 transition-colors duration-250">
          <div className="absolute top-1/2 left-0 w-96 h-96 bg-red-500/5 rounded-full blur-[140px] pointer-events-none" />
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-[10px] font-black uppercase tracking-widest border border-red-200 dark:border-red-500/20 mb-4 shadow-sm">
                <FileText className="w-3.5 h-3.5" />
                PDF UTILITIES
              </div>
              <h2 className="text-3xl sm:text-5xl font-black text-gray-900 dark:text-white tracking-tight uppercase">
                PDF Tools
              </h2>
              <p className="text-gray-600 dark:text-gray-500 mt-3 font-medium">
                Professional document tools to merge, split, compress, protect and edit PDFs locally.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 mb-12">
              {pdfToolsList.map((tool) => (
                <ToolCard key={tool.id} {...tool} />
              ))}
            </div>

            <div className="text-center">
              <Link
                href={localizeHref('/categories/pdf-tools')}
                className="inline-flex items-center gap-2 px-6 py-3.5 border border-gray-200 dark:border-white/5 hover:border-red-500/40 bg-white dark:bg-white/[0.02] hover:bg-gray-50 dark:hover:bg-white/[0.05] text-[10px] font-black uppercase tracking-widest text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded-xl transition-all active:scale-95 shadow-sm cursor-pointer"
              >
                View All PDF Tools
                <ArrowRight className="w-4 h-4 text-red-600 dark:text-red-500" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* 5. Image Tools Shelf */}
      {imageToolsList.length > 0 && (
        <section className="py-24 relative overflow-hidden bg-white dark:bg-black/10 border-b border-gray-200 dark:border-white/5 transition-colors duration-250">
          <div className="absolute top-1/2 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-[140px] pointer-events-none" />
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-widest border border-blue-200 dark:border-blue-500/20 mb-4 shadow-sm">
                <Layers className="w-3.5 h-3.5" />
                IMAGE EDITORS
              </div>
              <h2 className="text-3xl sm:text-5xl font-black text-gray-900 dark:text-white tracking-tight uppercase">
                Image Tools
              </h2>
              <p className="text-gray-600 dark:text-gray-500 mt-3 font-medium">
                Crop, compress, remove backgrounds, or resize official document photos instantly.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 mb-12">
              {imageToolsList.map((tool) => (
                <ToolCard key={tool.id} {...tool} />
              ))}
            </div>

            <div className="text-center">
              <Link
                href={localizeHref('/categories/image-tools')}
                className="inline-flex items-center gap-2 px-6 py-3.5 border border-gray-200 dark:border-white/5 hover:border-blue-500/40 bg-white dark:bg-white/[0.02] hover:bg-gray-50 dark:hover:bg-white/[0.05] text-[10px] font-black uppercase tracking-widest text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded-xl transition-all active:scale-95 shadow-sm cursor-pointer"
              >
                View All Image Tools
                <ArrowRight className="w-4 h-4 text-blue-600 dark:text-blue-500" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* 6. AI Tools Shelf */}
      {aiToolsList.length > 0 && (
        <section className="py-24 relative overflow-hidden bg-slate-50/50 dark:bg-black/20 border-b border-gray-200 dark:border-white/5 transition-colors duration-250">
          <div className="absolute top-1/2 left-0 w-96 h-96 bg-purple-500/5 rounded-full blur-[140px] pointer-events-none" />
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 text-[10px] font-black uppercase tracking-widest border border-purple-200 dark:border-purple-500/20 mb-4 shadow-sm">
                <Cpu className="w-3.5 h-3.5" />
                INTELLIGENT AI
              </div>
              <h2 className="text-3xl sm:text-5xl font-black text-gray-900 dark:text-white tracking-tight uppercase">
                AI Tools
              </h2>
              <p className="text-gray-600 dark:text-gray-500 mt-3 font-medium">
                ATS resume builder, AI voice generator, logo constructor, and content humanizer.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 mb-12">
              {aiToolsList.map((tool) => (
                <ToolCard key={tool.id} {...tool} />
              ))}
            </div>

            <div className="text-center">
              <Link
                href={localizeHref('/categories/ai-tools')}
                className="inline-flex items-center gap-2 px-6 py-3.5 border border-gray-200 dark:border-white/5 hover:border-purple-500/40 bg-white dark:bg-white/[0.02] hover:bg-gray-50 dark:hover:bg-white/[0.05] text-[10px] font-black uppercase tracking-widest text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded-xl transition-all active:scale-95 shadow-sm cursor-pointer"
              >
                View All AI Tools
                <ArrowRight className="w-4 h-4 text-purple-600 dark:text-purple-500" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* 7. Why ToolWala (USP Section) */}
      <section className="py-24 bg-white dark:bg-[#030712] relative overflow-hidden border-b border-gray-200 dark:border-white/5 transition-colors duration-250">
        <div className="absolute top-1/2 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-[120px] -z-10 pointer-events-none" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-widest border border-blue-200 dark:border-blue-500/20 mb-4 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 fill-blue-600/20 dark:fill-blue-400" />
              {t('home.edge_title', 'The ToolWala Edge')}
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-gray-900 dark:text-white tracking-tight uppercase">
              {t('home.why_use_title', 'Why Professionals Choose ToolWala AI')}
            </h2>
            <p className="text-gray-600 dark:text-gray-500 mt-3 font-medium">
              {t('home.edge_desc', 'We bridge the gap between complex AI models and everyday utility. No confusing interfaces, no subscription traps—just powerful AI that works for you.')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="premium-card p-8 flex flex-col items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <Zap className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-wider">{t('home.feat1_title', 'Edge Processing')}</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed font-semibold">
                {t('home.feat1_desc', 'Most tools run directly in your browser, ensuring lightning-fast results without server delays.')}
              </p>
            </div>

            <div className="premium-card p-8 flex flex-col items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-wider">{t('home.feat2_title', 'Encrypted Data')}</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed font-semibold">
                {t('home.feat2_desc', 'Your files never leave your device. We use end-to-end encryption for any cloud-based processing.')}
              </p>
            </div>

            <div className="premium-card p-8 flex flex-col items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400">
                <Lock className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-wider">No Account Traps</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed font-semibold">
                Skip standard login sheets. Load the page and use features instantly inside active browser tab.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Privacy First (Sandbox comparison) */}
      <section className="py-24 bg-slate-50/50 dark:bg-black/10 relative overflow-hidden border-b border-gray-200 dark:border-white/5 transition-colors duration-250">
        <div className="absolute inset-0 bg-blue-900/[0.01] blur-3xl pointer-events-none" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest border border-emerald-200 dark:border-emerald-500/20 mb-4 shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5" />
              SECURITY VISUALIZED
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-gray-900 dark:text-white tracking-tight uppercase">
              {t('home.sandbox_diagram.title', 'On-Device Browser Sandbox vs Cloud Uploads')}
            </h2>
            <p className="text-gray-600 dark:text-gray-500 mt-3 font-medium">
              {t('home.sandbox_diagram.subtitle', 'Traditional tools copy your data to remote databases. ToolWala isolates all operations inside your local CPU thread.')}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Visual Flow diagram container */}
            <div className="space-y-6">
              
              {/* Cloud Upload Row */}
              <div className="p-5.5 rounded-2xl bg-red-50 dark:bg-red-950/5 border border-red-200 dark:border-red-500/10 flex items-center gap-5 relative opacity-85 shadow-sm">
                <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-500/10 flex items-center justify-center text-red-600 dark:text-red-400 text-xl border border-red-200 dark:border-red-500/20">
                  ⚠️
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-black text-red-600 dark:text-red-400 uppercase tracking-wider mb-1">
                    {t('home.sandbox_diagram.cloud_db', 'Traditional Cloud Service')}
                  </h4>
                  <p className="text-[11px] text-gray-600 dark:text-gray-500 font-semibold leading-relaxed">
                    {t('home.sandbox_diagram.cloud_desc', 'Files are transmitted to database servers, exposing them to network leaks, storage logs, and unsecure access.')}
                  </p>
                </div>
                {/* Dashed line flow */}
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-red-600 dark:text-red-500 animate-pulse text-xs font-bold uppercase tracking-widest hidden sm:block">
                  Upload &rarr;
                </div>
              </div>

              {/* ToolWala Local Sandbox Row */}
              <div className="p-6.5 rounded-[2rem] bg-emerald-50 dark:bg-emerald-950/10 border-2 border-emerald-200 dark:border-emerald-500/20 flex items-center gap-5 relative shadow-sm dark:shadow-[0_0_50px_rgba(16,185,129,0.05)] animate-pulse-slow">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 text-2xl border border-emerald-200 dark:border-emerald-500/20 shadow-sm">
                  🛡️
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-1">
                    {t('home.sandbox_diagram.local_browser', 'Local Browser Sandbox')}
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold leading-relaxed">
                    {t('home.sandbox_diagram.local_desc', 'Your documents remain in active RAM memory and compile locally using WebAssembly. 0% network uploads.')}
                  </p>
                </div>
                <div className="absolute right-6 top-1/2 -translate-y-1/2 text-emerald-700 dark:text-emerald-400 font-black text-[10px] uppercase tracking-widest bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 px-3 py-1 rounded-full hidden sm:block">
                  Local RAM
                </div>
              </div>

            </div>

            {/* Explanation Column */}
            <div className="space-y-6">
              <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight leading-snug">
                WebAssembly (WASM) & Browser Sandboxing
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                ToolWala uses cutting-edge browser engines. By compiling complex C++ and Rust libraries into WebAssembly (WASM), we load standard desktop-grade software directly inside your active tab sandbox.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 shadow-sm">
                  <h5 className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase mb-1">No Signups</h5>
                  <p className="text-[10px] text-gray-600 dark:text-gray-500 font-semibold leading-relaxed">Start editing or merging instantly without creating credentials.</p>
                </div>
                <div className="p-4 rounded-2xl bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 shadow-sm">
                  <h5 className="text-xs font-black text-purple-600 dark:text-purple-400 uppercase mb-1">Works Offline</h5>
                  <p className="text-[10px] text-gray-600 dark:text-gray-500 font-semibold leading-relaxed">Disconnect from network anytime. Core scripts execute offline in sandbox.</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 9. Browser Native Processing (On-Device Pipeline) */}
      <section className="py-24 bg-white dark:bg-[#030712] border-b border-gray-200 dark:border-white/5 relative overflow-hidden transition-colors duration-250">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-widest border border-blue-200 dark:border-blue-500/20 mb-4 shadow-sm">
              <Cpu className="w-3.5 h-3.5 animate-pulse" />
              LOCAL COMPILE PIPELINE
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-gray-900 dark:text-white tracking-tight uppercase">
              On-Device Execution Pipeline
            </h2>
            <p className="text-gray-600 dark:text-gray-500 mt-3 font-medium">
              Your processor does the heavy lifting, keeping your files safe on your own machine.
            </p>
          </div>

          {/* Stepper Pipeline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            
            {/* Step 1 */}
            <div className="premium-card p-6 flex flex-col items-center text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 flex items-center justify-center text-xl text-blue-600 dark:text-blue-400 font-black">
                1
              </div>
              <h4 className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-wider">User File Input</h4>
              <p className="text-[11px] text-gray-600 dark:text-gray-500 font-semibold leading-relaxed">
                Drag and drop your file. It stays within your system storage loop.
              </p>
            </div>

            {/* Step 2 */}
            <div className="premium-card p-6 flex flex-col items-center text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 flex items-center justify-center text-xl text-purple-600 dark:text-purple-400 font-black">
                2
              </div>
              <h4 className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-wider">WASM Cache Load</h4>
              <p className="text-[11px] text-gray-600 dark:text-gray-500 font-semibold leading-relaxed">
                Browser executes tool dependencies using local WebAssembly modules.
              </p>
            </div>

            {/* Step 3 */}
            <div className="premium-card p-6 flex flex-col items-center text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-500/10 border border-teal-200 dark:border-teal-500/20 flex items-center justify-center text-xl text-teal-600 dark:text-teal-400 font-black">
                3
              </div>
              <h4 className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-wider">GPU/Canvas Processing</h4>
              <p className="text-[11px] text-gray-600 dark:text-gray-500 font-semibold leading-relaxed">
                Image resizers, background removers, or PDFs compile locally in RAM.
              </p>
            </div>

            {/* Step 4 */}
            <div className="premium-card p-6 flex flex-col items-center text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-center text-xl text-emerald-600 dark:text-emerald-400 font-black">
                4
              </div>
              <h4 className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-wider">Secure Saving</h4>
              <p className="text-[11px] text-gray-600 dark:text-gray-500 font-semibold leading-relaxed">
                Click save to download your compiled output instantly.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 10. How It Works (3 Steps) */}
      <section className="py-24 relative overflow-hidden bg-slate-50/50 dark:bg-black/20 border-b border-gray-200 dark:border-white/5 transition-colors duration-250">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 text-[10px] font-black uppercase tracking-widest border border-purple-200 dark:border-purple-500/20 mb-4 shadow-sm">
              <Layers className="w-3.5 h-3.5" />
              {t('home.how_it_works_title', 'How ToolWala Works')}
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-gray-900 dark:text-white tracking-tight uppercase">
              Launch Tools in 3 Steps
            </h2>
            <p className="text-gray-600 dark:text-gray-500 mt-3 font-medium">
              We compile and output files without remote server configurations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Horizontal line for desktop stepper */}
            <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-[1px] bg-dashed bg-gradient-to-r from-transparent via-gray-300 dark:via-white/10 to-transparent pointer-events-none z-0" />

            <div className="flex flex-col items-center text-center relative z-10 space-y-3">
              <div className="w-14 h-14 rounded-full bg-blue-50 dark:bg-blue-500/10 border-2 border-blue-200 dark:border-blue-500/20 text-blue-600 dark:text-blue-400 font-black text-sm flex items-center justify-center shadow-sm">
                1
              </div>
              <h4 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wide">Choose Utility</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed font-semibold max-w-xs">
                {t('home.select_from_tools_desc', 'Select from 25+ specialized browser-native PDF, image, or AI tools.').replace('25+', `${mergedTools.length}+`).replace('25', mergedTools.length.toString())}
              </p>
            </div>

            <div className="flex flex-col items-center text-center relative z-10 space-y-3">
              <div className="w-14 h-14 rounded-full bg-purple-50 dark:bg-purple-500/10 border-2 border-purple-200 dark:border-purple-500/20 text-purple-600 dark:text-purple-400 font-black text-sm flex items-center justify-center shadow-sm">
                2
              </div>
              <h4 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wide">Import Locally</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed font-semibold max-w-xs">
                Drag and drop your file. It loads instantly in browser memory.
              </p>
            </div>

            <div className="flex flex-col items-center text-center relative z-10 space-y-3">
              <div className="w-14 h-14 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border-2 border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-black text-sm flex items-center justify-center shadow-sm">
                3
              </div>
              <h4 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wide">Download Securely</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed font-semibold max-w-xs">
                Edit, crop, or compress in real-time, then click save.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 11. Indian Government Tool Hub Section */}
      <GovernmentToolHub />

      {/* 12. Popular & Essential Tools Suite */}
      <PopularToolsGrid />

      {/* 13. Testimonials Section */}
      <HomepageTestimonials />

      {/* 14. FAQ Section */}
      <HomepageFAQ />

    </div>
  );
}
