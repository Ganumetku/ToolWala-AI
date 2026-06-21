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
const BlogPreview = dynamic(() => import('@/components/BlogPreview'), { ssr: false });

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
    <div className="flex flex-col min-h-screen bg-[#030712] text-white relative overflow-hidden">

      {/* 1. Hero Section */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center py-20 md:py-28 overflow-hidden border-b border-white/5">
        {loadEffects && <MeshGradient />}
        {loadEffects && <FloatingParticles />}

        {/* Background Radial Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-blue-600/5 rounded-full blur-[140px] pointer-events-none" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">

          {/* Glowing Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-blue-400 text-xs font-black tracking-widest mb-8 shadow-2xl hover:border-blue-500/30 transition-colors cursor-pointer select-none"
          >
            <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
            <span>{t('home.badge', '🔒 100% Client-Side Local AI Processing')}</span>
            <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mx-auto max-w-5xl font-black text-4xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tight text-white leading-[0.95] mb-6 uppercase"
          >
            {t('home.hero_title_1', 'Supercharge Your Daily')} <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 animate-gradient">
              {t('home.hero_title_2', 'Workflow with AI')}
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mx-auto max-w-2xl text-sm sm:text-base md:text-lg font-medium text-gray-400 leading-relaxed mb-10"
          >
            {t('home.hero_subtitle', 'Free AI utilities that run 100% locally in your browser. No registration, no latency, no server uploads. Your data stays entirely on your device.')}
          </motion.p>

          {/* Search bar for tools */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="mx-auto max-w-3xl mb-8"
          >
            <form onSubmit={handleSearchSubmit} className="relative group p-1 rounded-[2.2rem] bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-blue-500/20 bg-[length:200%_auto] animate-gradient shadow-2xl transition-all hover:scale-[1.01]">
              <div className="relative flex items-center bg-[#090d16]/98 rounded-[2rem] p-2 border border-white/5 focus-within:border-blue-500/50 transition-colors">
                <div className="pl-5 text-gray-500">
                  <Search className="h-6 w-6 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full border-0 bg-transparent py-4 pl-4 pr-4 text-white placeholder:text-gray-500 focus:ring-0 text-sm sm:text-base font-bold outline-none"
                  placeholder={t('home.search_placeholder', 'Search 25+ offline utilities...').replace('25+', `${mergedTools.length}+`).replace('25', mergedTools.length.toString())}
                />
                <button
                  type="submit"
                  className="hidden md:flex items-center gap-2 rounded-[1.5rem] bg-blue-600 hover:bg-blue-500 px-8 py-4 text-xs font-black uppercase tracking-widest text-white shadow-xl active:scale-95 transition-all cursor-pointer"
                >
                  {t('home.search_btn', 'Search Utilities')}
                </button>
              </div>
            </form>
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
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-red-500/10 hover:bg-red-600/20 border border-red-500/20 text-xs font-black uppercase tracking-wider text-red-400 hover:text-white transition-all duration-300 active:scale-95 shadow-lg"
            >
              📄 {t('categories.PDF Tools', 'PDF Tools')}
            </Link>
            <Link
              href={localizeHref('/categories/image-tools')}
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-blue-500/10 hover:bg-blue-600/20 border border-blue-500/20 text-xs font-black uppercase tracking-wider text-blue-400 hover:text-white transition-all duration-300 active:scale-95 shadow-lg"
            >
              🖼️ {t('categories.Image Tools', 'Image Tools')}
            </Link>
            <Link
              href={localizeHref('/categories/ai-tools')}
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-purple-500/10 hover:bg-purple-600/20 border border-purple-500/20 text-xs font-black uppercase tracking-wider text-purple-400 hover:text-white transition-all duration-300 active:scale-95 shadow-lg"
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
            <span className="text-[9px] font-black uppercase tracking-widest text-gray-500 mr-1 flex items-center gap-1">
              <MousePointerClick className="w-3 h-3 text-blue-500" /> {t('home.suggestions_label', 'Suggestions:')}
            </span>
            {popularSuggestionChips.map((chip) => (
              <button
                key={chip.label}
                onClick={() => handleSuggestionClick(chip.query)}
                className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:border-blue-500/30 text-[9px] text-gray-400 hover:text-white transition-all font-bold cursor-pointer active:scale-95"
              >
                {chip.label}
              </button>
            ))}
          </motion.div>

          {/* Primary CTA */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="flex justify-center"
          >
            <Link
              href={localizeHref('/tools')}
              className="relative group inline-flex items-center gap-3.5 px-9 py-4.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl text-xs font-black uppercase tracking-widest text-white shadow-[0_0_30px_rgba(37,99,235,0.3)] hover:shadow-[0_0_40px_rgba(37,99,235,0.5)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>{t('home.explore_all_tools', 'Explore All 25+ Tools').replace('25+', `${mergedTools.length}+`).replace('25', mergedTools.length.toString())}</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>

        </div>
      </section>

      {/* 2. Trust & Security Seals Banner */}
      <section className="py-16 border-b border-white/5 bg-white/[0.01] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/[0.01] via-transparent to-purple-500/[0.01] pointer-events-none" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="text-center mb-10">
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-500">
              {t('home.trust_banner.title', 'TRUST & SECURITY VERIFICATIONS')}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="premium-card p-6 flex flex-col items-center justify-center text-center border-emerald-500/10 hover:border-emerald-500/20 bg-emerald-950/[0.01]">
              <ShieldCheck className="w-7 h-7 text-emerald-400 mb-3" />
              <h4 className="text-[11px] font-black text-white uppercase tracking-wider mb-1">
                {t('home.trust_banner.gdpr', 'GDPR & CCPA Private')}
              </h4>
              <p className="text-[9px] text-gray-500 font-semibold leading-relaxed">No files ever leave your device.</p>
            </div>
            
            <div className="premium-card p-6 flex flex-col items-center justify-center text-center border-blue-500/10 hover:border-blue-500/20 bg-blue-950/[0.01]">
              <Cpu className="w-7 h-7 text-blue-400 mb-3" />
              <h4 className="text-[11px] font-black text-white uppercase tracking-wider mb-1">
                {t('home.trust_banner.local', '100% Edge Processing')}
              </h4>
              <p className="text-[9px] text-gray-500 font-semibold leading-relaxed">Runs directly inside browser sandbox.</p>
            </div>

            <div className="premium-card p-6 flex flex-col items-center justify-center text-center border-purple-500/10 hover:border-purple-500/20 bg-purple-950/[0.01]">
              <Lock className="w-7 h-7 text-purple-400 mb-3" />
              <h4 className="text-[11px] font-black text-white uppercase tracking-wider mb-1">
                {t('home.trust_banner.no_upload', 'No Cloud Database Logs')}
              </h4>
              <p className="text-[9px] text-gray-500 font-semibold leading-relaxed">Absolute data privacy, zero logging.</p>
            </div>

            <div className="premium-card p-6 flex flex-col items-center justify-center text-center border-yellow-500/10 hover:border-yellow-500/20 bg-yellow-950/[0.01]">
              <Zap className="w-7 h-7 text-yellow-400 mb-3" />
              <h4 className="text-[11px] font-black text-white uppercase tracking-wider mb-1">
                {t('home.trust_banner.free', 'Always Free Beta')}
              </h4>
              <p className="text-[9px] text-gray-500 font-semibold leading-relaxed">Unlimited calculations, splits, & crops.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Recently Used Tray */}
      {mounted && recentTools.length > 0 && (
        <section className="py-16 border-b border-white/5 bg-white/[0.01] relative overflow-hidden">
          <div className="absolute inset-0 bg-blue-600/[0.02] blur-3xl pointer-events-none" />
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
            <div className="flex items-center gap-2.5 mb-6 relative z-10">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-500">{t('home.recent_visited', 'Recently Visited Utilities')}</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
              {recentTools.map((tool) => {
                const displayTitle = t(`tools.${tool.id}.title`, tool.title);
                const displayCategory = t(`categories.${tool.category}`, tool.category);
                return (
                  <Link
                    key={tool.id}
                    href={localizeHref(tool.href)}
                    className="flex items-center gap-3.5 p-4 rounded-xl bg-white/5 border border-white/10 hover:border-blue-500/30 hover:bg-blue-600/5 transition-all group animate-in fade-in duration-300"
                  >
                    <div className="text-xl w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform">
                      {tool.icon}
                    </div>
                    <div className="overflow-hidden">
                      <h4 className="text-xs font-black text-white group-hover:text-blue-400 transition-colors truncate">{displayTitle}</h4>
                      <p className="text-[9px] text-gray-600 font-bold uppercase tracking-wider mt-0.5">{displayCategory}</p>
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
        <section className="py-24 relative overflow-hidden bg-black/10 border-b border-white/5">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-black uppercase tracking-widest border border-blue-500/20 mb-4">
                <Sparkles className="w-3.5 h-3.5" />
                {t('home.popular_shelf_title', 'Popular Handpicked Tools')}
              </div>
              <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight uppercase">
                Most Popular Tools
              </h2>
              <p className="text-gray-500 mt-3 font-medium">
                Try our highly optimized local editors. No logins required, launch instantly.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
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
        <section className="py-24 relative overflow-hidden bg-black/20 border-b border-white/5">
          <div className="absolute top-1/2 left-0 w-96 h-96 bg-red-600/5 rounded-full blur-[140px] pointer-events-none" />
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 text-red-400 text-[10px] font-black uppercase tracking-widest border border-red-500/20 mb-4">
                <FileText className="w-3.5 h-3.5" />
                PDF UTILITIES
              </div>
              <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight uppercase">
                PDF Tools
              </h2>
              <p className="text-gray-500 mt-3 font-medium">
                Professional document tools to merge, split, compress, protect and edit PDFs locally.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
              {pdfToolsList.map((tool) => (
                <ToolCard key={tool.id} {...tool} />
              ))}
            </div>

            <div className="text-center">
              <Link
                href={localizeHref('/categories/pdf-tools')}
                className="inline-flex items-center gap-2 px-6 py-3.5 border border-white/5 hover:border-red-500/30 bg-white/[0.02] hover:bg-white/[0.05] text-[10px] font-black uppercase tracking-widest text-gray-300 hover:text-white rounded-xl transition-all active:scale-95 shadow-xl cursor-pointer"
              >
                View All PDF Tools
                <ArrowRight className="w-4 h-4 text-red-500" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* 5. Image Tools Shelf */}
      {imageToolsList.length > 0 && (
        <section className="py-24 relative overflow-hidden bg-black/10 border-b border-white/5">
          <div className="absolute top-1/2 right-0 w-96 h-96 bg-blue-600/5 rounded-full blur-[140px] pointer-events-none" />
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-black uppercase tracking-widest border border-blue-500/20 mb-4">
                <Layers className="w-3.5 h-3.5" />
                IMAGE EDITORS
              </div>
              <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight uppercase">
                Image Tools
              </h2>
              <p className="text-gray-500 mt-3 font-medium">
                Crop, compress, remove backgrounds, or resize official document photos instantly.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
              {imageToolsList.map((tool) => (
                <ToolCard key={tool.id} {...tool} />
              ))}
            </div>

            <div className="text-center">
              <Link
                href={localizeHref('/categories/image-tools')}
                className="inline-flex items-center gap-2 px-6 py-3.5 border border-white/5 hover:border-blue-500/30 bg-white/[0.02] hover:bg-white/[0.05] text-[10px] font-black uppercase tracking-widest text-gray-300 hover:text-white rounded-xl transition-all active:scale-95 shadow-xl cursor-pointer"
              >
                View All Image Tools
                <ArrowRight className="w-4 h-4 text-blue-500" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* 6. AI Tools Shelf */}
      {aiToolsList.length > 0 && (
        <section className="py-24 relative overflow-hidden bg-black/20 border-b border-white/5">
          <div className="absolute top-1/2 left-0 w-96 h-96 bg-purple-600/5 rounded-full blur-[140px] pointer-events-none" />
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-[10px] font-black uppercase tracking-widest border border-purple-500/20 mb-4">
                <Cpu className="w-3.5 h-3.5" />
                INTELLIGENT AI
              </div>
              <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight uppercase">
                AI Tools
              </h2>
              <p className="text-gray-500 mt-3 font-medium">
                ATS resume builder, AI voice generator, logo constructor, and content humanizer.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
              {aiToolsList.map((tool) => (
                <ToolCard key={tool.id} {...tool} />
              ))}
            </div>

            <div className="text-center">
              <Link
                href={localizeHref('/categories/ai-tools')}
                className="inline-flex items-center gap-2 px-6 py-3.5 border border-white/5 hover:border-purple-500/30 bg-white/[0.02] hover:bg-white/[0.05] text-[10px] font-black uppercase tracking-widest text-gray-300 hover:text-white rounded-xl transition-all active:scale-95 shadow-xl cursor-pointer"
              >
                View All AI Tools
                <ArrowRight className="w-4 h-4 text-purple-500" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* 7. Why ToolWala (USP Section) */}
      <section className="py-24 bg-[#030712] relative overflow-hidden border-b border-white/5">
        <div className="absolute top-1/2 left-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] -z-10 pointer-events-none" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-blue-500/10 text-blue-400 text-[10px] font-black uppercase tracking-widest border border-blue-500/20 mb-4">
              <Sparkles className="w-3.5 h-3.5 fill-blue-400" />
              {t('home.edge_title', 'The ToolWala Edge')}
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight uppercase">
              {t('home.why_use_title', 'Why Professionals Choose ToolWala AI')}
            </h2>
            <p className="text-gray-500 mt-3 font-medium">
              {t('home.edge_desc', 'We bridge the gap between complex AI models and everyday utility. No confusing interfaces, no subscription traps—just powerful AI that works for you.')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="premium-card p-8 flex flex-col items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <Zap className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-black text-white uppercase tracking-wider">{t('home.feat1_title', 'Edge Processing')}</h4>
              <p className="text-xs text-gray-400 leading-relaxed font-semibold">
                {t('home.feat1_desc', 'Most tools run directly in your browser, ensuring lightning-fast results without server delays.')}
              </p>
            </div>

            <div className="premium-card p-8 flex flex-col items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-black text-white uppercase tracking-wider">{t('home.feat2_title', 'Encrypted Data')}</h4>
              <p className="text-xs text-gray-400 leading-relaxed font-semibold">
                {t('home.feat2_desc', 'Your files never leave your device. We use end-to-end encryption for any cloud-based processing.')}
              </p>
            </div>

            <div className="premium-card p-8 flex flex-col items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <Lock className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-black text-white uppercase tracking-wider">No Account Traps</h4>
              <p className="text-xs text-gray-400 leading-relaxed font-semibold">
                Skip standard login sheets. Load the page and use features instantly inside active browser tab.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Privacy First (Sandbox comparison) */}
      <section className="py-24 bg-black/10 relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-blue-900/[0.01] blur-3xl pointer-events-none" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20 mb-4">
              <ShieldCheck className="w-3.5 h-3.5" />
              SECURITY VISUALIZED
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight uppercase">
              {t('home.sandbox_diagram.title', 'On-Device Browser Sandbox vs Cloud Uploads')}
            </h2>
            <p className="text-gray-500 mt-3 font-medium">
              {t('home.sandbox_diagram.subtitle', 'Traditional tools copy your data to remote databases. ToolWala isolates all operations inside your local CPU thread.')}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Visual Flow diagram container */}
            <div className="space-y-6">
              
              {/* Cloud Upload Row */}
              <div className="p-5.5 rounded-2xl bg-red-950/5 border border-red-500/10 flex items-center gap-5 relative opacity-75">
                <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center text-red-400 text-xl border border-red-500/20">
                  ⚠️
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-black text-red-400 uppercase tracking-wider mb-1">
                    {t('home.sandbox_diagram.cloud_db', 'Traditional Cloud Service')}
                  </h4>
                  <p className="text-[11px] text-gray-500 font-semibold leading-relaxed">
                    {t('home.sandbox_diagram.cloud_desc', 'Files are transmitted to database servers, exposing them to network leaks, storage logs, and unsecure access.')}
                  </p>
                </div>
                {/* Dashed line flow */}
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-red-500 animate-pulse text-xs font-bold uppercase tracking-widest hidden sm:block">
                  Upload &rarr;
                </div>
              </div>

              {/* ToolWala Local Sandbox Row */}
              <div className="p-6.5 rounded-[2rem] bg-emerald-950/10 border-2 border-emerald-500/20 flex items-center gap-5 relative shadow-[0_0_50px_rgba(16,185,129,0.05)] animate-pulse-slow">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 text-2xl border border-emerald-500/20 shadow-lg">
                  🛡️
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-black text-emerald-400 uppercase tracking-wider mb-1">
                    {t('home.sandbox_diagram.local_browser', 'Local Browser Sandbox')}
                  </h4>
                  <p className="text-xs text-gray-400 font-semibold leading-relaxed">
                    {t('home.sandbox_diagram.local_desc', 'Your documents remain in active RAM memory and compile locally using WebAssembly. 0% network uploads.')}
                  </p>
                </div>
                <div className="absolute right-6 top-1/2 -translate-y-1/2 text-emerald-400 font-black text-[10px] uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full hidden sm:block">
                  Local RAM
                </div>
              </div>

            </div>

            {/* Explanation Column */}
            <div className="space-y-6">
              <h3 className="text-2xl font-black text-white uppercase tracking-tight leading-snug">
                WebAssembly (WASM) & Browser Sandboxing
              </h3>
              <p className="text-sm text-gray-400 leading-relaxed font-medium">
                ToolWala uses cutting-edge browser engines. By compiling complex C++ and Rust libraries into WebAssembly (WASM), we load standard desktop-grade software directly inside your active tab sandbox.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                  <h5 className="text-xs font-black text-blue-400 uppercase mb-1">No Signups</h5>
                  <p className="text-[10px] text-gray-500 font-semibold leading-relaxed">Start editing or merging instantly without creating credentials.</p>
                </div>
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                  <h5 className="text-xs font-black text-purple-400 uppercase mb-1">Works Offline</h5>
                  <p className="text-[10px] text-gray-500 font-semibold leading-relaxed">Disconnect from network anytime. Core scripts execute offline in sandbox.</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 9. Browser Native Processing (On-Device Pipeline) */}
      <section className="py-24 bg-[#030712] border-b border-white/5 relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-black uppercase tracking-widest border border-blue-500/20 mb-4">
              <Cpu className="w-3.5 h-3.5 animate-pulse" />
              LOCAL COMPILE PIPELINE
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight uppercase">
              On-Device Execution Pipeline
            </h2>
            <p className="text-gray-500 mt-3 font-medium">
              Your processor does the heavy lifting, keeping your files safe on your own machine.
            </p>
          </div>

          {/* Stepper Pipeline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            
            {/* Step 1 */}
            <div className="premium-card p-6 flex flex-col items-center text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-xl text-blue-400 font-black">
                1
              </div>
              <h4 className="text-xs font-black text-white uppercase tracking-wider">User File Input</h4>
              <p className="text-[11px] text-gray-500 font-semibold leading-relaxed">
                Drag and drop your file. It stays within your system storage loop.
              </p>
            </div>

            {/* Step 2 */}
            <div className="premium-card p-6 flex flex-col items-center text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-xl text-purple-400 font-black">
                2
              </div>
              <h4 className="text-xs font-black text-white uppercase tracking-wider">WASM Cache Load</h4>
              <p className="text-[11px] text-gray-500 font-semibold leading-relaxed">
                Browser executes tool dependencies using local WebAssembly modules.
              </p>
            </div>

            {/* Step 3 */}
            <div className="premium-card p-6 flex flex-col items-center text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-xl text-teal-400 font-black">
                3
              </div>
              <h4 className="text-xs font-black text-white uppercase tracking-wider">GPU/Canvas Processing</h4>
              <p className="text-[11px] text-gray-500 font-semibold leading-relaxed">
                Image resizers, background removers, or PDFs compile locally in RAM.
              </p>
            </div>

            {/* Step 4 */}
            <div className="premium-card p-6 flex flex-col items-center text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-xl text-emerald-400 font-black">
                4
              </div>
              <h4 className="text-xs font-black text-white uppercase tracking-wider">Secure Saving</h4>
              <p className="text-[11px] text-gray-500 font-semibold leading-relaxed">
                Click save to download your compiled output instantly.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 10. How It Works (3 Steps) */}
      <section className="py-24 relative overflow-hidden bg-black/20 border-b border-white/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-[10px] font-black uppercase tracking-widest border border-purple-500/20 mb-4">
              <Layers className="w-3.5 h-3.5" />
              {t('home.how_it_works_title', 'How ToolWala Works')}
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight uppercase">
              Launch Tools in 3 Steps
            </h2>
            <p className="text-gray-500 mt-3 font-medium">
              We compile and output files without remote server configurations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Horizontal line for desktop stepper */}
            <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-[1px] bg-dashed bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none z-0" />

            <div className="flex flex-col items-center text-center relative z-10 space-y-3">
              <div className="w-14 h-14 rounded-full bg-blue-500/10 border-2 border-blue-500/20 text-blue-400 font-black text-sm flex items-center justify-center shadow-lg shadow-blue-500/5">
                1
              </div>
              <h4 className="text-sm font-black text-white uppercase tracking-wide">Choose Utility</h4>
              <p className="text-xs text-gray-400 leading-relaxed font-semibold max-w-xs">
                {t('home.select_from_tools_desc', 'Select from 25+ specialized browser-native PDF, image, or AI tools.').replace('25+', `${mergedTools.length}+`).replace('25', mergedTools.length.toString())}
              </p>
            </div>

            <div className="flex flex-col items-center text-center relative z-10 space-y-3">
              <div className="w-14 h-14 rounded-full bg-purple-500/10 border-2 border-purple-500/20 text-purple-400 font-black text-sm flex items-center justify-center shadow-lg shadow-purple-500/5">
                2
              </div>
              <h4 className="text-sm font-black text-white uppercase tracking-wide">Import Locally</h4>
              <p className="text-xs text-gray-400 leading-relaxed font-semibold max-w-xs">
                Drag and drop your file. It loads instantly in browser memory.
              </p>
            </div>

            <div className="flex flex-col items-center text-center relative z-10 space-y-3">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 border-2 border-emerald-500/20 text-emerald-400 font-black text-sm flex items-center justify-center shadow-lg shadow-emerald-500/5">
                3
              </div>
              <h4 className="text-sm font-black text-white uppercase tracking-wide">Download Securely</h4>
              <p className="text-xs text-gray-400 leading-relaxed font-semibold max-w-xs">
                Edit, crop, or compress in real-time, then click save.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 11. Indian Government Tool Hub Section */}
      <GovernmentToolHub />

      {/* 12. Blog Preview Section */}
      <BlogPreview />

      {/* 13. Testimonials Section */}
      <HomepageTestimonials />

      {/* 14. FAQ Section */}
      <HomepageFAQ />

    </div>
  );
}
