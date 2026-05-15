"use client";

import { useState, useRef, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import ToolCard from '@/components/ToolCard';
import { toolsData, toolCategories, ToolCategory } from '@/data/tools';
import { MeshGradient, FloatingParticles } from '@/components/BackgroundEffects';
import { 
  Sparkles, Rocket, ShieldCheck, Zap, 
  Search, ArrowDown, Star, ChevronRight,
  MousePointer2, Layers, Users
} from 'lucide-react';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<ToolCategory>("All");
  const [mounted, setMounted] = useState(false);
  const toolsSectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const scrollToTools = () => {
    setTimeout(() => {
      toolsSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  const handleHeroSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (e.target.value.trim() !== "") {
      // Don't scroll automatically on every keystroke in hero, 
      // but maybe show a dropdown in future.
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    scrollToTools();
  };

  const filteredTools = useMemo(() => {
    return toolsData.filter(tool => {
      const matchesSearch = 
        tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
        tool.category.toLowerCase().includes(searchQuery.toLowerCase());
        
      const matchesCategory = activeCategory === "All" || tool.category === activeCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory]);

  if (!mounted) return <div className="min-h-screen bg-[#030712]" />;

  return (
    <div className="flex flex-col min-h-screen bg-[#030712] text-white">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center pt-20 pb-24 overflow-hidden">
        <MeshGradient />
        <FloatingParticles />
        
        {/* Background Radial Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          {/* Animated Badge */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-blue-400 text-xs font-black tracking-widest mb-8 shadow-2xl"
          >
            <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
            <span>AI-POWERED UTILITY PLATFORM</span>
            <ChevronRight className="w-3 h-3" />
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mx-auto max-w-5xl font-black text-5xl md:text-8xl tracking-tighter text-white leading-[0.9] mb-8"
          >
            Everything you can <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 animate-gradient">
              Imagine with AI
            </span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mx-auto max-w-2xl text-lg md:text-xl font-medium text-gray-400 leading-relaxed mb-12"
          >
            The world's most intuitive playground for AI tools. Generate, edit, and automate your workflows with professional-grade AI models.
          </motion.p>
          
          {/* Hero Search Bar */}
          <motion.form 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            onSubmit={handleSearchSubmit} 
            className="mx-auto max-w-3xl mb-16"
          >
            <div className="relative group p-1 rounded-[2rem] bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-blue-500/20 bg-[length:200%_auto] animate-gradient shadow-2xl transition-all hover:scale-[1.02]">
              <div className="relative flex items-center bg-[#0f172a] rounded-[1.8rem] p-2 border border-white/10 group-focus-within:border-blue-500/50 transition-colors">
                <div className="pl-5">
                  <Search className="h-6 w-6 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleHeroSearchChange}
                  className="block w-full border-0 bg-transparent py-5 pl-4 pr-4 text-white placeholder:text-gray-500 focus:ring-0 text-lg md:text-xl font-bold"
                  placeholder="Ask ToolWala: 'remove image background'..."
                />
                <button type="submit" className="hidden md:flex items-center gap-2 rounded-[1.4rem] bg-blue-600 px-8 py-4 text-sm font-black text-white shadow-xl hover:bg-blue-500 active:scale-95 transition-all">
                  Search Tools
                </button>
              </div>
            </div>
            <button type="submit" className="md:hidden w-full mt-4 rounded-2xl bg-blue-600 py-5 text-sm font-black text-white shadow-xl active:scale-95 transition-all">
              Search Tools
            </button>
          </motion.form>
          
          {/* Trust Strip */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap justify-center items-center gap-8 md:gap-12"
          >
            <div className="flex items-center gap-3 text-xs font-black uppercase tracking-[0.2em] text-gray-500">
              <MousePointer2 className="w-4 h-4 text-blue-500" />
              No Signup
            </div>
            <div className="flex items-center gap-3 text-xs font-black uppercase tracking-[0.2em] text-gray-500">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              Privacy Focused
            </div>
            <div className="flex items-center gap-3 text-xs font-black uppercase tracking-[0.2em] text-gray-500">
              <Zap className="w-4 h-4 text-amber-500" />
              Instant Speed
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 cursor-pointer group"
          onClick={scrollToTools}
        >
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-600 group-hover:text-blue-500 transition-colors">Discover Tools</span>
          <div className="w-6 h-10 border-2 border-white/10 rounded-full flex justify-center p-1">
            <motion.div 
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="w-1 h-1 bg-blue-500 rounded-full"
            />
          </div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="py-24 border-y border-white/5 bg-white/[0.01]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
            <StatCard icon={<Layers />} value="25+" label="AI Tools" color="blue" />
            <StatCard icon={<Users />} value="50K+" label="Active Users" color="purple" />
            <StatCard icon={<Zap />} value="0.8s" label="Avg Speed" color="amber" />
            <StatCard icon={<Star />} value="4.9/5" label="User Rating" color="emerald" />
          </div>
        </div>
      </section>

      {/* All Tools Section */}
      <section ref={toolsSectionRef} id="tools-section" className="relative pb-32 pt-24 min-h-screen">
        <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8 mb-16">
            <div>
              <h2 className="text-4xl font-black tracking-tighter mb-4">Explore Directory</h2>
              <p className="text-gray-500 font-medium">Browse our collection of professional AI utilities.</p>
            </div>

            {/* Category Chips */}
            <div className="flex items-center gap-3 overflow-x-auto pb-4 xl:pb-0 no-scrollbar w-full xl:w-auto">
              {toolCategories.map(category => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`whitespace-nowrap px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 transform active:scale-95 ${
                    activeCategory === category 
                      ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)]' 
                      : 'bg-white/5 text-gray-500 border border-white/10 hover:border-white/20 hover:text-white'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Tools Grid */}
          {filteredTools.length > 0 ? (
            <motion.div 
              layout
              className="grid grid-cols-1 gap-8 sm:gap-10 lg:grid-cols-3 xl:grid-cols-4"
            >
              <AnimatePresence>
                {filteredTools.map((tool) => (
                  <motion.div 
                    key={tool.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ToolCard {...tool} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            <div className="text-center py-32 bg-white/5 rounded-[3rem] border border-white/10 border-dashed">
              <div className="bg-white/5 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-10 h-10 text-gray-700" />
              </div>
              <h3 className="text-2xl font-black text-white mb-2">No tools found</h3>
              <p className="text-gray-500 max-w-sm mx-auto font-medium">Try searching for something else or browse all categories.</p>
              <button 
                onClick={() => { setSearchQuery(""); setActiveCategory("All"); }}
                className="mt-8 inline-flex items-center justify-center rounded-2xl bg-blue-600 px-8 py-4 text-sm font-black text-white hover:bg-blue-500 transition-all shadow-xl active:scale-95"
              >
                Clear Search
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Trust/Feature Section */}
      <section className="py-32 bg-[#030712] relative overflow-hidden">
        <div className="absolute top-1/2 left-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] -z-10" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-24 lg:grid-cols-2 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-blue-500/10 text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] mb-6">
                <Sparkles className="w-3.5 h-3.5 fill-blue-400" />
                The ToolWala Edge
              </div>
              <h2 className="text-4xl md:text-6xl font-black text-white leading-[1.1] tracking-tighter mb-8">
                Professional tools, <br /> 
                <span className="text-blue-500">Zero complexity.</span>
              </h2>
              <p className="text-lg text-gray-400 font-medium leading-relaxed mb-12">
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
              <div className="absolute -inset-4 bg-gradient-to-br from-blue-600 to-purple-600 rounded-[3rem] blur-2xl opacity-20 animate-pulse-slow" />
              <div className="relative aspect-square w-full overflow-hidden rounded-[3rem] bg-[#0f172a] shadow-2xl flex items-center justify-center border border-white/10">
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
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
