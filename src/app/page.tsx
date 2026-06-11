"use client";

import { useState, useRef, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Rocket, ShieldCheck, Zap, 
  Search, Star, ChevronRight,
  Layers, Users, TrendingUp, Clock, Grid, ArrowRight, MousePointerClick
} from 'lucide-react';
import ToolCard from '@/components/ToolCard';
import CategoryCard from '@/components/CategoryCard';
import { toolsData, Tool, ToolCategory, toolCategories } from '@/data/tools';
import { fetchPublicTools } from '@/lib/tools';
import { categoriesData, getToolsByCategory } from '@/data/categories';
import dynamic from 'next/dynamic';

const MeshGradient = dynamic(
  () => import('@/components/BackgroundEffects').then((m) => m.MeshGradient),
  { ssr: false }
);
const FloatingParticles = dynamic(
  () => import('@/components/BackgroundEffects').then((m) => m.FloatingParticles),
  { ssr: false }
);

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<ToolCategory>("All");
  const [activeTab, setActiveTab] = useState<'featured' | 'trending' | 'recent' | 'all'>('all');
  const [mounted, setMounted] = useState(false);
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
    if (!mounted) return;
    fetchPublicTools().then(setMergedTools).catch(() => {});
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

  // Helper filters for discover tabs
  const featuredToolsList = useMemo(() => {
    return mergedTools.filter(t => t.featured);
  }, [mergedTools]);

  const trendingToolsList = useMemo(() => {
    return mergedTools.filter(t => t.trending);
  }, [mergedTools]);

  const recentToolsList = useMemo(() => {
    return mergedTools.filter(t => 
      ['pdf-ocr', 'organize-pdf', 'unlock-pdf', 'pdf-to-jpg', 'ocr-to-text'].includes(t.id)
    );
  }, [mergedTools]);

  // Master filtered tools list
  const filteredTools = useMemo(() => {
    return mergedTools.filter(tool => {
      const matchesSearch = 
        tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
        tool.category.toLowerCase().includes(searchQuery.toLowerCase());
        
      const matchesCategory = activeCategory === "All" || tool.category === activeCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [mergedTools, searchQuery, activeCategory]);

  const popularSuggestionChips = [
    { label: "Remove Background", query: "background" },
    { label: "Passport Photo", query: "passport" },
    { label: "Compress JPEG", query: "compress" },
    { label: "Merge PDF", query: "merge" },
    { label: "Aadhaar Resizer", query: "aadhaar" },
    { label: "AI Resume", query: "resume" }
  ];

  // Map category tool counts dynamically
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    categoriesData.forEach(cat => {
      const list = getToolsByCategory(cat.id, mergedTools);
      counts[cat.id] = list.length;
    });
    return counts;
  }, [mergedTools]);

  // Homepage displays first 6 categories that contain tools
  const homepageCategories = useMemo(() => {
    return categoriesData
      .filter(cat => (categoryCounts[cat.id] || 0) > 0)
      .slice(0, 6);
  }, [categoryCounts]);

  if (!mounted) return <div className="min-h-screen bg-[#030712]" />;

  return (
    <>
      <div className="flex flex-col min-h-screen bg-[#030712] text-white relative overflow-hidden">
        
        {/* Hero Section */}
        <section className="relative min-h-[95vh] flex flex-col items-center justify-center py-24 md:py-32 overflow-hidden">
          <MeshGradient />
          <FloatingParticles />
          
          {/* Background Radial Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-blue-600/5 rounded-full blur-[140px] pointer-events-none" />

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            
            {/* Glowing Badge */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-blue-400 text-xs font-black tracking-widest mb-8 shadow-2xl hover:border-blue-500/30 transition-colors cursor-pointer"
              onClick={scrollToTools}
            >
              <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
              <span>🔒 100% Client-Side Local AI Processing</span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mx-auto max-w-5xl font-black text-5xl sm:text-7xl md:text-8xl tracking-tight text-white leading-[0.9] mb-8 uppercase"
            >
              Supercharge Your Daily <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 animate-gradient">
                Workflows with AI 
              </span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mx-auto max-w-2xl text-base sm:text-lg md:text-xl font-medium text-gray-400 leading-relaxed mb-12"
            >
              25+ professional-grade, privacy-first AI utilities that run 100% locally in your browser. No registration, no latency, no server uploads.
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
                    className="block w-full border-0 bg-transparent py-4.5 pl-4 pr-4 text-white placeholder:text-gray-500 focus:ring-0 text-base sm:text-lg font-bold outline-none"
                    placeholder="What tool do you need? Try 'background remover', 'merge PDF'..."
                  />
                  <button 
                    onClick={scrollToTools}
                    className="hidden md:flex items-center gap-2 rounded-[1.5rem] bg-blue-600 hover:bg-blue-500 px-8 py-4.5 text-xs font-black uppercase tracking-widest text-white shadow-xl active:scale-95 transition-all"
                  >
                    Search Utilities
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Clickable Suggestions Chips */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap justify-center items-center gap-2 max-w-2xl mx-auto mb-16"
            >
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 mr-2 flex items-center gap-1">
                <MousePointerClick className="w-3.5 h-3.5 text-blue-500" /> Suggestions:
              </span>
              {popularSuggestionChips.map((chip) => (
                <button
                  key={chip.label}
                  onClick={() => handleSuggestionClick(chip.query)}
                  className="px-3.5 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:border-blue-500/30 text-[10px] text-gray-400 hover:text-white transition-all font-semibold cursor-pointer active:scale-95"
                >
                  {chip.label}
                </button>
              ))}
            </motion.div>
            
            {/* Trust strip */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap justify-center items-center gap-8 md:gap-12 border-t border-white/5 pt-8 max-w-md mx-auto"
            >
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
                <span className="h-2 w-2 rounded-full bg-blue-500" />
                No Registration
              </div>
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                GDPR Compliant
              </div>
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                100% Free
              </div>
            </motion.div>
          </div>

          {/* Scroll Indicator */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 cursor-pointer group"
            onClick={scrollToTools}
          >
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-600 group-hover:text-blue-500 transition-colors">Start Designing</span>
            <div className="w-5 h-8 border-2 border-white/10 rounded-full flex justify-center p-1">
              <motion.div 
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                className="w-1 h-1 bg-blue-500 rounded-full"
              />
            </div>
          </motion.div>
        </section>

        {/* Stats Section */}
        <section className="py-20 md:py-24 border-y border-white/5 bg-white/[0.01]">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
              <StatCard icon={<Layers />} value="25+" label="Local Tools" color="blue" />
              <StatCard icon={<Users />} value="50K+" label="Active Users" color="purple" />
              <StatCard icon={<Zap />} value="0.8s" label="Avg Speed" color="amber" />
              <StatCard icon={<Star />} value="4.9/5" label="User Rating" color="emerald" />
            </div>
          </div>
        </section>

        {/* Small Featured Categories Grid (Show only 6 cards, 2-column mobile layout!) */}
        <section className="py-24 relative overflow-hidden bg-black/20 border-b border-white/5 animate-in fade-in">
          <div className="absolute top-1/2 left-0 w-96 h-96 bg-purple-600/5 rounded-full blur-[120px] pointer-events-none" />
          
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-[10px] font-black uppercase tracking-widest border border-purple-500/20 mb-4">
                <Grid className="w-3.5 h-3.5" />
                Featured Categories
              </div>
              <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight uppercase">Browse by Category</h2>
              <p className="text-gray-500 mt-3 font-medium">Explore hand-picked directories containing browser-local tools.</p>
            </div>

            {/* Category card responsive grid: 2 columns on mobile! */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 max-w-7xl mx-auto">
              {homepageCategories.map((cat) => (
                <CategoryCard
                  key={cat.id}
                  category={cat}
                  toolCount={categoryCounts[cat.id] || 0}
                  featured={cat.id === 'pdf-tools' || cat.id === 'image-tools'}
                />
              ))}
            </div>

            {/* View All Categories Button */}
            <div className="text-center mt-12 animate-in fade-in">
              <Link 
                href="/categories"
                className="inline-flex items-center gap-2 px-6 py-3.5 border border-white/5 hover:border-blue-500/30 bg-white/[0.02] hover:bg-white/[0.05] text-[10px] font-black uppercase tracking-widest text-gray-300 hover:text-white rounded-xl transition-all active:scale-95 shadow-xl cursor-pointer"
              >
                View All Categories
                <ArrowRight className="w-4 h-4 text-blue-500" />
              </Link>
            </div>
          </div>
        </section>

        {/* Discovery Dashboard (Interactive Tabs Section) */}
        <section ref={toolsSectionRef} id="tools-section" className="relative py-24 min-h-screen">
          <div className="absolute inset-0 bg-grid-pattern opacity-[0.015] pointer-events-none" />
          
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
            
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 mb-16 border-b border-white/5 pb-10">
              <div>
                <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight">Tools Directory</h2>
                <p className="text-gray-500 mt-2 font-medium">Instant-run local utilities. Filter by tags or types.</p>
              </div>

              {/* Dashboard Tabs Toggle */}
              <div className="flex flex-wrap gap-2 p-1.5 bg-black/40 border border-white/5 rounded-2xl w-full xl:w-auto overflow-x-auto">
                <button
                  onClick={() => { setActiveTab('all'); setActiveCategory('All'); }}
                  className={`flex-1 xl:flex-initial flex items-center gap-2 justify-center px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${
                    activeTab === 'all'
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                      : 'text-gray-500 hover:text-white'
                  }`}
                >
                  <Grid className="w-3.5 h-3.5" />
                  All Utilities ({filteredTools.length})
                </button>
                <button
                  onClick={() => setActiveTab('featured')}
                  className={`flex-1 xl:flex-initial flex items-center gap-2 justify-center px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${
                    activeTab === 'featured'
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                      : 'text-gray-500 hover:text-white'
                  }`}
                >
                  <Star className="w-3.5 h-3.5" />
                  Featured Flagships
                </button>
                <button
                  onClick={() => setActiveTab('trending')}
                  className={`flex-1 xl:flex-initial flex items-center gap-2 justify-center px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${
                    activeTab === 'trending'
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                      : 'text-gray-500 hover:text-white'
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  Trending Hot
                </button>
                <button
                  onClick={() => setActiveTab('recent')}
                  className={`flex-1 xl:flex-initial flex items-center gap-2 justify-center px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${
                    activeTab === 'recent'
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                      : 'text-gray-500 hover:text-white'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  Recently Added
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
                        placeholder="Live filter by keyword or tag..."
                      />
                    </div>

                    <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar w-full md:w-auto">
                      {toolCategories.map(category => (
                        <button
                          key={category}
                          onClick={() => setActiveCategory(category)}
                          className={`whitespace-nowrap px-4.5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                            activeCategory === category 
                              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' 
                              : 'bg-white/5 text-gray-500 hover:text-white border border-white/5'
                          }`}
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Recently Used Tray */}
                  {recentTools.length > 0 && (
                    <div className="glass p-7 rounded-[2rem] border border-white/5 relative overflow-hidden bg-white/[0.01] shadow-2xl">
                      <div className="absolute inset-0 bg-blue-600/[0.02] blur-3xl pointer-events-none" />
                      <div className="flex items-center gap-2.5 mb-6 relative z-10">
                        <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-500">Recently Visited Utilities</h3>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
                        {recentTools.map((tool) => (
                          <Link 
                            key={tool.id} 
                            href={tool.href}
                            className="flex items-center gap-3.5 p-4 rounded-xl bg-white/5 border border-white/10 hover:border-blue-500/30 hover:bg-blue-600/5 transition-all group"
                          >
                            <div className="text-xl w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform">
                              {tool.icon}
                            </div>
                            <div className="overflow-hidden">
                              <h4 className="text-xs font-black text-white group-hover:text-blue-400 transition-colors truncate">{tool.title}</h4>
                              <p className="text-[9px] text-gray-600 font-bold uppercase tracking-wider mt-0.5">{tool.category}</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Grid */}
                  {filteredTools.length > 0 ? (
                    <div className="grid grid-cols-1 gap-8 sm:gap-10 lg:grid-cols-3 xl:grid-cols-4">
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
                      <h3 className="text-2xl font-black text-white mb-2 tracking-tight">No tools found</h3>
                      <p className="text-gray-500 max-w-sm mx-auto text-sm font-medium">Try checking tag queries or clear filters to view all directories.</p>
                      <button 
                        onClick={() => { setSearchQuery(""); setActiveCategory("All"); }}
                        className="mt-6 px-6 py-3 rounded-xl bg-blue-600 text-white font-black uppercase tracking-widest text-xs hover:bg-blue-500 transition-all shadow-md"
                      >
                        Reset Directory View
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
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {featuredToolsList.map((tool) => (
                      <div key={tool.id} className="relative group/feat">
                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-3xl blur opacity-20 group-hover/feat:opacity-50 transition duration-1000 pointer-events-none" />
                        <div className="relative h-full">
                          <ToolCard {...tool} isPopular={true} />
                        </div>
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
                  className="grid grid-cols-1 gap-8 sm:gap-10 lg:grid-cols-3 xl:grid-cols-4"
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
                  className="grid grid-cols-1 gap-8 sm:gap-10 lg:grid-cols-3 xl:grid-cols-4"
                >
                  {recentToolsList.map((tool) => (
                    <ToolCard key={tool.id} {...tool} isTrending={true} />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </section>

        {/* Pitch Info Section */}
        <section className="py-24 bg-[#030712] relative overflow-hidden">
          <div className="absolute top-1/2 left-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] -z-10 pointer-events-none" />
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-24 lg:grid-cols-2 items-center max-w-6xl mx-auto">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-blue-500/10 text-blue-400 text-[10px] font-black uppercase tracking-widest border border-blue-500/20 mb-6">
                  <Sparkles className="w-3.5 h-3.5 fill-blue-400" />
                  The ToolWala Edge
                </div>
                <h2 className="text-4xl md:text-5xl font-black text-white leading-tight tracking-tight mb-8">
                  Professional tools, <br /> 
                  <span className="text-blue-500">Zero complexity.</span>
                </h2>
                <p className="text-base text-gray-400 font-medium leading-relaxed mb-12">
                  We bridge the gap between complex AI models and everyday utility. No confusing interfaces, no subscription traps—just powerful AI that works for you.
                </p>
                
                <div className="grid gap-10">
                  <FeatureItem 
                    icon={<Zap />} 
                    title="Edge Processing" 
                    desc="Most tools run directly in your browser, ensuring lightning-fast results without server delays." 
                  />
                  <FeatureItem 
                    icon={<ShieldCheck />} 
                    title="Encrypted Data" 
                    desc="Your files never leave your device. We use end-to-end encryption for any cloud-based processing." 
                  />
                  <FeatureItem 
                    icon={<Star />} 
                    title="Curated Models" 
                    desc="We select and fine-tune the best AI models specifically for each tool's unique purpose." 
                  />
                </div>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="absolute -inset-4 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl blur-2xl opacity-20 animate-pulse-slow" />
                <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-[#0f172a] shadow-2xl flex items-center justify-center border border-white/10">
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:40px_40px] opacity-20" />
                  <div className="flex flex-col items-center gap-10 text-center px-12 relative z-10">
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                      className="w-40 h-40 rounded-full border-4 border-dashed border-blue-500/30 flex items-center justify-center p-8"
                    >
                      <div className="w-full h-full rounded-full bg-blue-600 flex items-center justify-center text-white shadow-[0_0_50px_rgba(37,99,235,0.5)]">
                        <Sparkles className="w-12 h-12" />
                      </div>
                    </motion.div>
                    <div className="space-y-4">
                      <h3 className="text-3xl font-black text-white uppercase tracking-tighter">AI Processing <br /> Engine 2.0</h3>
                      <div className="flex justify-center gap-3">
                        {[...Array(3)].map((_, i) => (
                          <motion.div 
                            key={i}
                            animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                            transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }}
                            className="w-3 h-3 rounded-full bg-blue-500" 
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

function StatCard({ icon, value, label, color }: { icon: React.ReactNode; value: string; label: string; color: string }) {
  const colors: Record<string, string> = {
    blue: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    purple: "text-purple-500 bg-purple-500/10 border-purple-500/20",
    amber: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    emerald: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
  };

  return (
    <div className="flex flex-col items-center text-center group">
      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 border transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 ${colors[color]}`}>
        {icon}
      </div>
      <h4 className="text-4xl font-black text-white mb-2 tracking-tighter">{value}</h4>
      <p className="text-sm font-black uppercase tracking-[0.2em] text-gray-600">{label}</p>
    </div>
  );
}

function FeatureItem({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex gap-6 group">
      <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-blue-500 border border-white/10 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
        {icon}
      </div>
      <div>
        <h4 className="text-xl font-black text-white mb-2 uppercase tracking-tight group-hover:text-blue-400 transition-colors">{title}</h4>
        <p className="text-gray-500 font-medium leading-relaxed group-hover:text-gray-400 transition-colors">{desc}</p>
      </div>
    </div>
  );
}
