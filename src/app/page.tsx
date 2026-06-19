"use client";

import { useState, useRef, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Rocket, ShieldCheck, Zap,
  Search, Star, ChevronRight,
  Layers, Users, TrendingUp, Clock, Grid, ArrowRight, MousePointerClick,
  Shield, Lock, FolderLock, FileText, CheckCircle2, Award, Cpu
} from 'lucide-react';
import ToolCard from '@/components/ToolCard';
import CategoryCard from '@/components/CategoryCard';
import { toolsData, Tool, ToolCategory, toolCategories } from '@/data/tools';
import { fetchPublicTools } from '@/lib/tools';
import { categoriesData, getToolsByCategory } from '@/data/categories';
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
  const { t, locale, localizeHref } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<ToolCategory>("All");
  const [activeTab, setActiveTab] = useState<'featured' | 'trending' | 'recent' | 'all'>('all');
  const [mounted, setMounted] = useState(false);
  const [loadEffects, setLoadEffects] = useState(false);
  const [recentToolIds, setRecentToolIds] = useState<string[]>([]);
  const [mergedTools, setMergedTools] = useState<Tool[]>(toolsData);

  const toolsSectionRef = useRef<HTMLElement | null>(null);

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

  const scrollToTools = () => {
    setTimeout(() => {
      toolsSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const handleSuggestionClick = (query: string) => {
    setSearchQuery(query);
    setActiveTab('all');
    scrollToTools();
  };

  // Helper filters for discover shelves
  const featuredToolsList = useMemo(() => {
    return mergedTools.filter(t => t.featured && t.isVisible);
  }, [mergedTools]);

  const trendingToolsList = useMemo(() => {
    return mergedTools.filter(t => t.trending && t.isVisible).slice(0, 4);
  }, [mergedTools]);

  const recentToolsList = useMemo(() => {
    return mergedTools.filter(t => t.isVisible).slice(0, 4);
  }, [mergedTools]);

  const popularToolsList = useMemo(() => {
    return mergedTools.filter(t => t.popular && t.isVisible).slice(0, 4);
  }, [mergedTools]);

  // Master filtered tools list
  const filteredTools = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return mergedTools.filter(tool => {
      if (!tool.isVisible) return false;
      const matchesSearch =
        tool.title.toLowerCase().includes(query) ||
        tool.description.toLowerCase().includes(query) ||
        tool.tags.some(tag => tag.toLowerCase().includes(query)) ||
        tool.category.toLowerCase().includes(query);

      const matchesCategory = activeCategory === "All" || tool.category === activeCategory;

      return matchesSearch && matchesCategory;
    });
  }, [mergedTools, searchQuery, activeCategory]);

  const popularSuggestionChips = [
    { label: t('tools.bg-remover.title', 'Remove Background'), query: "background" },
    { label: t('tools.passport-photo-maker.title', 'Passport Photo'), query: "passport" },
    { label: t('tools.image-compressor.title', 'Compress Image'), query: "compress" },
    { label: t('tools.merge-pdf.title', 'Merge PDF'), query: "merge" },
    { label: t('tools.aadhaar-photo-resizer.title', 'Aadhaar Resizer'), query: "aadhaar" },
    { label: t('tools.resume-builder.title', 'AI Resume'), query: "resume" }
  ];

  // Map category tool counts dynamically
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    categoriesData.forEach(cat => {
      const list = getToolsByCategory(cat.id, mergedTools);
      counts[cat.id] = list.filter(t => t.isVisible).length;
    });
    return counts;
  }, [mergedTools]);

  // Homepage displays first 6 categories that contain tools
  const homepageCategories = useMemo(() => {
    return categoriesData
      .filter(cat => (categoryCounts[cat.id] || 0) > 0)
      .slice(0, 6);
  }, [categoryCounts]);

  return (
    <div className="flex flex-col min-h-screen bg-[#030712] text-white relative overflow-hidden">

      {/* 1. Hero Section */}
      <section className="relative min-h-[95vh] flex flex-col items-center justify-center py-20 md:py-28 overflow-hidden border-b border-white/5">
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
            onClick={scrollToTools}
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

          {/* Interactive Hero Search */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="mx-auto max-w-3xl mb-6"
          >
            <div className="relative group p-1 rounded-[2.2rem] bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-blue-500/20 bg-[length:200%_auto] animate-gradient shadow-2xl transition-all hover:scale-[1.01]">
              <div className="relative flex items-center bg-[#090d16]/98 rounded-[2rem] p-2 border border-white/5 focus-within:border-blue-500/50 transition-colors">
                <div className="pl-5 text-gray-500">
                  <Search className="h-6 w-6 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={scrollToTools}
                  className="block w-full border-0 bg-transparent py-4 pl-4 pr-4 text-white placeholder:text-gray-500 focus:ring-0 text-sm sm:text-base font-bold outline-none"
                  placeholder={t('home.search_placeholder', 'Search 25+ offline utilities...')}
                />
                <button
                  onClick={scrollToTools}
                  className="hidden md:flex items-center gap-2 rounded-[1.5rem] bg-blue-600 hover:bg-blue-500 px-8 py-4 text-xs font-black uppercase tracking-widest text-white shadow-xl active:scale-95 transition-all cursor-pointer"
                >
                  {t('home.search_btn', 'Search Utilities')}
                </button>
              </div>
            </div>
          </motion.div>

          {/* Direct Tool Launch Shortcut Chips (High Conversion CTAs) */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="flex flex-wrap justify-center gap-3.5 max-w-2xl mx-auto mb-8"
          >
            <Link
              href={localizeHref('/tools/pdf-tools/edit-pdf')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-500/10 hover:bg-blue-600/20 border border-blue-500/20 text-[10px] font-black uppercase tracking-wider text-blue-400 hover:text-white transition-all active:scale-95"
            >
              📄 Launch Edit PDF
              <ArrowRight className="w-3 h-3" />
            </Link>
            <Link
              href={localizeHref('/tools/image-tools/bg-remover')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-500/10 hover:bg-purple-600/20 border border-purple-500/20 text-[10px] font-black uppercase tracking-wider text-purple-400 hover:text-white transition-all active:scale-95"
            >
              🖼️ Launch BG Remover
              <ArrowRight className="w-3 h-3" />
            </Link>
            <Link
              href={localizeHref('/tools/image-tools/passport-photo-maker')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-600/20 border border-indigo-500/20 text-[10px] font-black uppercase tracking-wider text-indigo-400 hover:text-white transition-all active:scale-95"
            >
              📸 Passport Maker
              <ArrowRight className="w-3 h-3" />
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

          {/* Trust Banner mini seals */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45 }}
            className="flex flex-wrap justify-center items-center gap-6 border-t border-white/5 pt-8 max-w-3xl mx-auto"
          >
            <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{t('home.trust_banner.gdpr', 'GDPR & CCPA Private')}</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-white/10" />
            <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-blue-400">
              <Cpu className="w-3.5 h-3.5" />
              <span>{t('home.trust_banner.local', '100% Edge Processing')}</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-white/10" />
            <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-purple-400">
              <Lock className="w-3.5 h-3.5" />
              <span>{t('home.trust_banner.no_upload', 'No Cloud Database Logs')}</span>
            </div>
          </motion.div>

        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 cursor-pointer group"
          onClick={scrollToTools}
        >
          <span className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-600 group-hover:text-blue-500 transition-colors">{t('home.start_discovering', 'Start Discovering')}</span>
          <div className="w-5 h-8 border-2 border-white/10 rounded-full flex justify-center p-1">
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="w-1 h-1 bg-blue-500 rounded-full"
            />
          </div>
        </motion.div>
      </section>

      {/* 2. Trust & Security Seals Banner (Replaces fake statistics) */}
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

      {/* 3. Popular Categories Section */}
      <section className="py-24 relative overflow-hidden bg-black/20 border-b border-white/5">
        <div className="absolute top-1/2 left-0 w-96 h-96 bg-purple-600/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-[10px] font-black uppercase tracking-widest border border-purple-500/20 mb-4">
              <Grid className="w-3.5 h-3.5" />
              {t('home.categories_deck', 'Categories Deck')}
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight uppercase">{t('home.browse_categories', 'Browse by Category')}</h2>
            <p className="text-gray-500 mt-3 font-medium">{t('home.browse_categories_sub', 'Explore local directories containing compliant browser utilities.')}</p>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {homepageCategories.map((cat) => (
              <CategoryCard
                key={cat.id}
                category={cat}
                toolCount={categoryCounts[cat.id] || 0}
                featured={cat.id === 'pdf-tools' || cat.id === 'image-tools'}
              />
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href={localizeHref('/categories')}
              className="inline-flex items-center gap-2 px-6 py-3.5 border border-white/5 hover:border-blue-500/30 bg-white/[0.02] hover:bg-white/[0.05] text-[10px] font-black uppercase tracking-widest text-gray-300 hover:text-white rounded-xl transition-all active:scale-95 shadow-xl cursor-pointer"
            >
              {t('home.view_all_categories', 'View All Categories')}
              <ArrowRight className="w-4 h-4 text-blue-500" />
            </Link>
          </div>
        </div>
      </section>

      {/* 4. Handpicked Popular Tools Section (Shelves layout) */}
      {popularToolsList.length > 0 && (
        <section className="py-24 relative overflow-hidden bg-black/10 border-b border-white/5">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-black uppercase tracking-widest border border-blue-500/20 mb-4">
                <Sparkles className="w-3.5 h-3.5" />
                {t('home.popular_shelf_title', 'Popular Handpicked Tools')}
              </div>
              <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight uppercase">
                Ready in Seconds
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

      {/* 5. Trending Tools Section */}
      <section className="py-24 relative overflow-hidden bg-black/20 border-b border-white/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-black uppercase tracking-widest border border-blue-500/20 mb-4 animate-pulse-slow">
              <TrendingUp className="w-3.5 h-3.5" />
              {t('home.hot_trending', 'HOT & TRENDING')}
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight uppercase">
              {t('home.trending_title', 'Trending Utilities')}
            </h2>
            <p className="text-gray-500 mt-3 font-medium">
              {t('home.trending_subtitle', 'The most popular, highly computed local tools in active use right now.')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {trendingToolsList.map((tool) => (
              <div key={tool.id} className="relative group/glow">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-md opacity-0 group-hover/glow:opacity-100 transition-opacity pointer-events-none" />
                <ToolCard {...tool} isTrending={true} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Why ToolWala (USP Section) */}
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

      {/* 7. Privacy First & Browser Sandbox visual comparison diagram */}
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

      {/* 8. Browser Native Processing Flow Section */}
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

      {/* 9. How It Works Section */}
      <section className="py-24 relative overflow-hidden bg-black/20 border-b border-white/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-[10px] font-black uppercase tracking-widest border border-purple-500/20 mb-4">
              <Grid className="w-3.5 h-3.5" />
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
                Select from 25+ specialized browser-native PDF, image, or AI tools.
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

      {/* 10. Indian Government Tool Hub Section */}
      <GovernmentToolHub />

      {/* 11. Blog Preview Section */}
      <BlogPreview />

      {/* 12. Testimonials Section */}
      <HomepageTestimonials />

      {/* 13. FAQ Section */}
      <HomepageFAQ />

      {/* Interactive Tool Search Area */}
      <section ref={toolsSectionRef} id="tools-section" className="relative py-24 min-h-screen">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.015] pointer-events-none" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">

          <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 mb-16 border-b border-white/5 pb-10">
            <div>
              <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight">{t('home.directory_title', 'Tools Directory')}</h2>
              <p className="text-gray-500 mt-2 font-medium font-sans">{t('home.directory_subtitle', 'Instant-run local utilities. Search by keywords or filter by tags.')}</p>
            </div>

            {/* Dashboard Tabs Toggle */}
            <div className="flex flex-wrap gap-2 p-1.5 bg-black/40 border border-white/5 rounded-2xl w-full xl:w-auto overflow-x-auto">
              <button
                onClick={() => { setActiveTab('all'); setActiveCategory('All'); }}
                className={`flex-1 xl:flex-initial flex items-center gap-2 justify-center px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${activeTab === 'all'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                  : 'text-gray-500 hover:text-white'
                  }`}
              >
                <Grid className="w-3.5 h-3.5" />
                {t('home.all_utilities', 'All Utilities')} ({filteredTools.length})
              </button>
              <button
                onClick={() => setActiveTab('featured')}
                className={`flex-1 xl:flex-initial flex items-center gap-2 justify-center px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${activeTab === 'featured'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                  : 'text-gray-500 hover:text-white'
                  }`}
              >
                <Star className="w-3.5 h-3.5" />
                {t('home.featured_flagships', 'Featured Flagships')}
              </button>
              <button
                onClick={() => setActiveTab('trending')}
                className={`flex-1 xl:flex-initial flex items-center gap-2 justify-center px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${activeTab === 'trending'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                  : 'text-gray-500 hover:text-white'
                  }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                {t('home.trending_hot', 'Trending Hot')}
              </button>
              <button
                onClick={() => setActiveTab('recent')}
                className={`flex-1 xl:flex-initial flex items-center gap-2 justify-center px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${activeTab === 'recent'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                  : 'text-gray-500 hover:text-white'
                  }`}
              >
                <Clock className="w-3.5 h-3.5" />
                {t('home.recently_added', 'Recently Added')}
              </button>
            </div>
          </div>

          {/* Active view renders based on tab state */}
          <AnimatePresence mode="wait">
            {activeTab === 'all' && (
              <motion.div
                key="all-tab"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                transition={{ duration: 0.3 }}
                className="space-y-12"
              >
                {/* Search Bar + Sub Category Chips inside full directory */}
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white/[0.01] border border-white/5 p-4 rounded-[2rem] glass">
                  <div className="relative w-full md:max-w-md group">
                    <div className="absolute inset-y-0 left-5 flex items-center text-gray-500 group-focus-within:text-blue-500 transition-colors">
                      <Search className="h-4 w-4" />
                    </div>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="block w-full rounded-2xl border border-white/5 bg-black/40 py-3.5 pl-12 pr-4 text-white placeholder:text-gray-600 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 text-xs font-bold outline-none transition-all shadow-inner"
                      placeholder={t('home.search_placeholder_filter', 'Live filter by keyword or tag...')}
                    />
                  </div>

                  <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar w-full md:w-auto">
                    {toolCategories.map(category => (
                      <button
                        key={category}
                        onClick={() => setActiveCategory(category)}
                        className={`whitespace-nowrap px-4.5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all duration-200 cursor-pointer ${activeCategory === category
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                          : 'bg-white/5 text-gray-500 hover:text-white border border-white/5'
                          }`}
                      >
                        {t('categories.' + category, category)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Recently Used Tray */}
                {mounted && recentTools.length > 0 && (
                  <div className="glass p-7 rounded-[2rem] border border-white/5 relative overflow-hidden bg-white/[0.01] shadow-2xl">
                    <div className="absolute inset-0 bg-blue-600/[0.02] blur-3xl pointer-events-none" />
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
                            className="flex items-center gap-3.5 p-4 rounded-xl bg-white/5 border border-white/10 hover:border-blue-500/30 hover:bg-blue-600/5 transition-all group"
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
                )}

                {/* Grid (2 columns on mobile) */}
                {filteredTools.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredTools.map((tool) => (
                      <ToolCard
                        key={tool.id}
                        {...tool}
                        isPopular={tool.popular}
                        isTrending={tool.trending}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-24 glass rounded-[2.5rem] border border-white/5 border-dashed">
                    <div className="bg-white/5 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <Search className="w-10 h-10 text-gray-700" />
                    </div>
                    <h3 className="text-2xl font-black text-white mb-2 tracking-tight">{t('home.no_tools_found', 'No tools found')}</h3>
                    <p className="text-gray-500 max-w-sm mx-auto text-sm font-medium">{t('home.no_tools_sub', 'Try checking tag queries or clear filters to view all directories.')}</p>
                    <button
                      onClick={() => { setSearchQuery(""); setActiveCategory("All"); }}
                      className="mt-6 px-6 py-3 rounded-xl bg-blue-600 text-white font-black uppercase tracking-widest text-xs hover:bg-blue-500 transition-all shadow-md cursor-pointer"
                    >
                      {t('home.reset_directory', 'Reset Directory View')}
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'featured' && (
              <motion.div
                key="featured-tab"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {featuredToolsList.map((tool) => (
                    <div key={tool.id} className="relative group/feat animate-in fade-in duration-300">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-md opacity-0 group-hover/feat:opacity-100 transition-opacity pointer-events-none" />
                      <ToolCard {...tool} isPopular={true} />
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'trending' && (
              <motion.div
                key="trending-tab"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              >
                {trendingToolsList.map((tool) => (
                  <ToolCard key={tool.id} {...tool} isTrending={true} />
                ))}
              </motion.div>
            )}

            {activeTab === 'recent' && (
              <motion.div
                key="recent-tab"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              >
                {recentToolsList.map((tool) => (
                  <ToolCard key={tool.id} {...tool} isTrending={true} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </section>
    </div>
  );
}
