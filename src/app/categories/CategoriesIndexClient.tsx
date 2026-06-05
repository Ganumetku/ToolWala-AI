"use client";

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Grid, HelpCircle, Layers } from 'lucide-react';
import { categoriesData } from '@/data/categories';
import { toolsData, Tool, isToolVisible } from '@/data/tools';
import CategoryCard from '@/components/CategoryCard';
import CategorySearch from '@/components/CategorySearch';
import { MeshGradient, FloatingParticles } from '@/components/BackgroundEffects';

export default function CategoriesIndexClient() {
  const [searchQuery, setSearchQuery] = useState("");
  const [mounted, setMounted] = useState(false);
  const [dynamicTools, setDynamicTools] = useState<Tool[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch dynamic database tools to count totals accurately
  useEffect(() => {
    async function fetchDynamicTools() {
      try {
        const res = await fetch('/api/admin/tools');
        if (!res.ok) return;
        const data = await res.json();
        if (data.success && data.tools) {
          const staticSlugs = new Set(toolsData.map(t => t.href.split('/').pop()));
          
          const categoryMap: Record<string, string> = {
            'Creative & Design': 'Image Tools',
            'Document & PDF': 'PDF Tools',
            'AI Writing': 'AI Tools',
            'Career Studio': 'Document Tools',
            'Business Ops': 'Document Tools',
            'Developer Utilities': 'Utility Tools',
          };

          const mapped: Tool[] = data.tools
            .filter((t: any) => !staticSlugs.has(t.slug) && isToolVisible(t))
            .map((t: any) => ({
              id: t.id,
              title: t.title,
              description: t.description,
              icon: t.icon || '🔧',
              href: `/tools/${t.slug}`,
              category: (categoryMap[t.category?.name] || categoryMap[t.categoryName] || 'Utility Tools') as any,
              featured: !!t.featured || !!t.isFeatured,
              trending: !!t.trending || !!t.isTrending,
              popular: !!t.isPopular,
              status: t.status,
              isPublished: t.isPublished,
              publishDate: t.publishDate,
              tags: t.seoMetadata?.keywords?.split(',').map((s: string) => s.trim()) || ['ai', t.toolType || 'utility']
            }));
          setDynamicTools(mapped);
        }
      } catch (err) {
        console.warn('Failed to load dynamic categories index totals:', err);
      }
    }
    fetchDynamicTools();
  }, []);

  const mergedTools = useMemo(() => {
    return [...toolsData, ...dynamicTools];
  }, [dynamicTools]);

  // Map category tool counts dynamically
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    categoriesData.forEach(cat => {
      // Map static/dynamic lists
      let list = mergedTools.filter(t => t.category === cat.title);
      // Fallback custom cross-maps inside getToolsByCategory
      if (cat.id === 'resume-career') {
        list = mergedTools.filter(t => ['resume-builder', 'cover-letter-generator'].includes(t.id));
      } else if (cat.id === 'seo-tools') {
        list = mergedTools.filter(t => ['text-humanizer', 'ocr-to-text', 'caption-generator'].includes(t.id));
      } else if (cat.id === 'developer-tools') {
        list = mergedTools.filter(t => ['qr-code-generator', 'ocr-to-text'].includes(t.id));
      } else if (cat.id === 'social-media-tools') {
        list = mergedTools.filter(t => ['caption-generator', 'voice-generator', 'bg-remover'].includes(t.id));
      }
      counts[cat.id] = list.length;
    });
    return counts;
  }, [mergedTools]);

  const filteredCategories = useMemo(() => {
    return categoriesData.filter(cat => 
      cat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cat.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cat.keywords.some(k => k.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [searchQuery]);

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
