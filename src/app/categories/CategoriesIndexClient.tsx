"use client";

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Grid, HelpCircle, Layers } from 'lucide-react';
import { categoriesData, getToolsByCategory } from '@/data/categories';
import { toolsData, Tool } from '@/data/tools';
import { fetchPublicTools } from '@/lib/tools';
import CategoryCard from '@/components/CategoryCard';
import CategorySearch from '@/components/CategorySearch';
import { MeshGradient, FloatingParticles } from '@/components/BackgroundEffects';

export default function CategoriesIndexClient() {
  const [searchQuery, setSearchQuery] = useState("");
  const [mounted, setMounted] = useState(false);
  const [mergedTools, setMergedTools] = useState<Tool[]>(toolsData);

  useEffect(() => {
    setMounted(true);
    fetchPublicTools().then(setMergedTools).catch(() => {});
  }, []);

  // Map category tool counts dynamically
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    categoriesData.forEach(cat => {
      const list = getToolsByCategory(cat.id, mergedTools);
      counts[cat.id] = list.length;
    });
    return counts;
  }, [mergedTools]);

  const filteredCategories = useMemo(() => {
    return categoriesData
      .filter(cat => (categoryCounts[cat.id] || 0) > 0)
      .filter(cat => 
        cat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cat.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cat.keywords.some(k => k.toLowerCase().includes(searchQuery.toLowerCase()))
      );
  }, [searchQuery, categoryCounts]);

  if (!mounted) {
    return <div className="min-h-screen bg-[#030712]" />;
  }

  return (
    <>
      <div className="min-h-screen bg-[#030712] text-white relative overflow-hidden font-sans">
        <MeshGradient />
        <FloatingParticles />

        {/* Glow grid background */}
        <div className="absolute top-0 left-0 w-full h-[600px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-transparent pointer-events-none z-0" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-24 relative z-10">
          
          {/* Header Hero */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-400 text-xs font-black uppercase tracking-widest border border-blue-500/20 mb-6">
              <Grid className="w-3.5 h-3.5" />
              Categorized Hub
            </div>
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white mb-6 uppercase leading-none">
              Browse Categories <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
                ToolWala Directory
              </span>
            </h1>
            <p className="text-base sm:text-lg text-gray-400 leading-relaxed font-medium">
              Explore our comprehensive, categorized directory of 25+ browser-local AI utilities. Secure, private, and sub-second fast.
            </p>
          </div>

          {/* Search Folder filter */}
          <div className="max-w-xl mx-auto mb-16 animate-in slide-in-from-bottom-2 duration-300">
            <CategorySearch 
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search category folder titles..."
            />
          </div>

          {/* Category Grid Section */}
          <div className="max-w-6xl mx-auto">
            {filteredCategories.length > 0 ? (
              <motion.div 
                layout
                className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-6 sm:gap-8"
              >
                <AnimatePresence>
                  {filteredCategories.map((cat, index) => (
                    <motion.div
                      key={cat.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.25, delay: index * 0.05 }}
                    >
                      <CategoryCard 
                        category={cat}
                        toolCount={categoryCounts[cat.id] || 0}
                        featured={index < 3}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            ) : (
              <div className="text-center py-24 glass rounded-[2.5rem] border border-white/5 border-dashed max-w-3xl mx-auto">
                <div className="bg-white/5 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-white/5">
                  <Layers className="w-10 h-10 text-gray-700" />
                </div>
                <h3 className="text-2xl font-black text-white mb-2 tracking-tight">No categories found</h3>
                <p className="text-gray-500 max-w-xs mx-auto text-sm font-medium">No directories matched "{searchQuery}". Try broad keywords.</p>
                <button 
                  onClick={() => setSearchQuery("")}
                  className="mt-6 px-6 py-3 rounded-xl bg-blue-600 text-white font-black uppercase tracking-widest text-xs hover:bg-blue-500 transition-all active:scale-95 shadow-md"
                >
                  Clear search
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
}
