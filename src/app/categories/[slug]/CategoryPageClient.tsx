"use client";

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, ChevronDown, Sparkles, TrendingUp, Grid, Search } from 'lucide-react';
import { toolsData, Tool, isToolVisible } from '@/data/tools';
import { categoriesData, getToolsByCategory, CategoryMetadata } from '@/data/categories';
import ToolCard from '@/components/ToolCard';
import CategoryHeader from '@/components/CategoryHeader';
import CategorySidebar from '@/components/CategorySidebar';
import CategorySearch from '@/components/CategorySearch';
import { MeshGradient, FloatingParticles } from '@/components/BackgroundEffects';

interface CategoryPageClientProps {
  slug: string;
  category: CategoryMetadata;
}

export default function CategoryPageClient({ slug, category }: CategoryPageClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<'all' | 'popular' | 'trending'>('all');
  const [dynamicTools, setDynamicTools] = useState<Tool[]>([]);
  const [expandedFaqIndex, setExpandedFaqIndex] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch dynamic database tools to count totals and show inside the category
  useEffect(() => {
    async function fetchDynamicTools() {
      try {
        const res = await fetch('/api/admin/tools');
        if (!res.ok) return;
        const data = await res.json();
        
        if (data.success && data.tools) {
          const staticSlugs = new Set(toolsData.map(t => t.href.split('/').pop()));
          
          const categoryMap: Record<string, string> = {
            'Creative & Design': 'image-tools',
            'Document & PDF': 'pdf-tools',
            'AI Writing': 'ai-tools',
            'Career Studio': 'document-tools',
            'Business Ops': 'document-tools',
            'Developer Utilities': 'utility-tools',
          };

          const mapped: Tool[] = data.tools
            .filter((t: any) => {
              if (staticSlugs.has(t.slug) || !isToolVisible(t)) return false;
              const toolCatName = t.category?.name || t.categoryName || '';
              const mappedSlug = t.category?.slug || categoryMap[toolCatName] || 'utility-tools';
              return mappedSlug === slug;
            })
            .map((t: any) => ({
              id: t.id,
              title: t.title,
              description: t.description,
              icon: t.icon || '🔧',
              href: `/tools/${t.slug}`,
              slug: t.slug,
              category: category.title as any,
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
        console.warn('Failed loading dynamic tools inside category client:', err);
      }
    }
    fetchDynamicTools();
  }, [slug, category]);

  // Merge static and dynamic category tools
  const categoryTools = useMemo(() => {
    const staticTools = getToolsByCategory(category.id, toolsData);
    return [...staticTools, ...dynamicTools];
  }, [category, dynamicTools]);

  // Filter tools based on query and tabs
  const filteredTools = useMemo(() => {
    let result = categoryTools.filter(tool => {
      const query = searchQuery.toLowerCase();
      return (
        tool.title.toLowerCase().includes(query) ||
        tool.description.toLowerCase().includes(query) ||
        tool.tags.some(tag => tag.toLowerCase().includes(query))
      );
    });

    if (activeFilter === 'popular') {
      result = result.filter(tool => tool.popular);
    } else if (activeFilter === 'trending') {
      result = result.filter(tool => tool.trending);
    }

    return result;
  }, [categoryTools, searchQuery, activeFilter]);

  // Separate trending tools in this category for the dedicated trending shelf
  const trendingShelfTools = useMemo(() => {
    return categoryTools.filter(t => t.trending).slice(0, 3);
  }, [categoryTools]);

  if (!mounted) {
    return <div className="min-h-screen bg-[#030712]" />;
  }

  return (
    <>
      <div className="min-h-screen bg-[#030712] text-white relative overflow-hidden font-sans">
        <MeshGradient />
        <FloatingParticles />

        <div className="absolute top-0 left-0 w-full h-[600px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-transparent pointer-events-none z-0" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-24 relative z-10">
          
          {/* Modular Reusable Header Component */}
          <CategoryHeader 
            title={category.title}
            icon={category.icon}
            description={category.intro}
          />

          {/* Grid Layout: Left Sidebar Navigation & Right Content Dashboard */}
          <div className="flex flex-col lg:flex-row gap-8 items-start mt-10">
            
            {/* Modular Reusable Sidebar Navigation */}
            <CategorySidebar activeSlug={slug} />

            {/* Content Deck */}
            <div className="flex-1 w-full space-y-12">
              
              {/* Dedicated Trending Cards Shelf */}
              {trendingShelfTools.length > 0 && !searchQuery && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-purple-400" />
                    <h3 className="text-[11px] font-black uppercase tracking-widest text-purple-400">Trending Utilities</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {trendingShelfTools.map((tool) => (
                      <div key={tool.id} className="relative group/glow">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/20 via-indigo-500/20 to-purple-500/20 rounded-2xl blur-md opacity-0 group-hover/glow:opacity-100 transition-opacity pointer-events-none" />
                        <ToolCard {...tool} isTrending={true} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Main Directory Search & Filters Panel */}
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white/[0.01] border border-white/5 p-4 rounded-[2rem] glass">
                <div className="w-full md:max-w-md">
                  <CategorySearch 
                    value={searchQuery}
                    onChange={setSearchQuery}
                    placeholder="Search tools inside this folder..."
                  />
                </div>

                {/* Switch Filters Tab */}
                <div className="flex gap-1.5 p-1 bg-black/40 border border-white/5 rounded-2xl w-full md:w-auto overflow-x-auto">
                  <button
                    onClick={() => setActiveFilter('all')}
                    className={`flex-1 md:flex-initial px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider transition-colors cursor-pointer ${
                      activeFilter === 'all' ? 'bg-white/5 text-white' : 'text-gray-500 hover:text-white'
                    }`}
                  >
                    All ({categoryTools.length})
                  </button>
                  <button
                    onClick={() => setActiveFilter('popular')}
                    className={`flex-1 md:flex-initial px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider transition-colors cursor-pointer ${
                      activeFilter === 'popular' ? 'bg-white/5 text-white' : 'text-gray-500 hover:text-white'
                    }`}
                  >
                    Popular ({categoryTools.filter(t => t.popular).length})
                  </button>
                  <button
                    onClick={() => setActiveFilter('trending')}
                    className={`flex-1 md:flex-initial px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider transition-colors cursor-pointer ${
                      activeFilter === 'trending' ? 'bg-white/5 text-white' : 'text-gray-500 hover:text-white'
                    }`}
                  >
                    Trending
                  </button>
                </div>
              </div>

              {/* Tools Responsive Grid (2 columns on mobile!) */}
              <div className="w-full">
                {filteredTools.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-6">
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
                  <div className="text-center py-20 glass rounded-[2.5rem] border border-white/5 border-dashed">
                    <div className="bg-white/5 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4 border border-white/5">
                      <Search className="w-8 h-8 text-gray-700" />
                    </div>
                    <h4 className="text-lg font-black text-white mb-2 uppercase tracking-tight">No tools match criteria</h4>
                    <p className="text-xs text-gray-500 max-w-xs mx-auto font-medium">Try checking description filters or reset active tabs.</p>
                    <button
                      onClick={() => { setSearchQuery(""); setActiveFilter('all'); }}
                      className="mt-5 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest text-[10px] shadow-md"
                    >
                      Reset Directory View
                    </button>
                  </div>
                )}
              </div>

              {/* FAQs Accordion */}
              {category.faqs.length > 0 && (
                <div className="border-t border-white/5 pt-12">
                  <div className="flex items-center gap-2 mb-8">
                    <HelpCircle className="w-4.5 h-4.5 text-blue-400" />
                    <h3 className="text-xs font-black uppercase tracking-widest text-white">Frequently Asked Questions</h3>
                  </div>

                  <div className="space-y-4.5">
                    {category.faqs.map((faq, index) => {
                      const isExpanded = expandedFaqIndex === index;
                      return (
                        <div key={index} className="glass rounded-2xl border border-white/5 bg-white/[0.01] overflow-hidden">
                          <button
                            onClick={() => setExpandedFaqIndex(isExpanded ? null : index)}
                            className="w-full flex items-center justify-between p-5.5 text-left focus:outline-none cursor-pointer"
                          >
                            <span className="text-xs sm:text-sm font-black text-white hover:text-blue-400 transition-colors">
                              {faq.question}
                            </span>
                            <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-300 flex-shrink-0 ml-4 ${isExpanded ? 'rotate-180 text-blue-400' : ''}`} />
                          </button>

                          <AnimatePresence initial={false}>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2, ease: "easeInOut" }}
                              >
                                <div className="px-5.5 pb-5.5 pt-0.5 border-t border-white/5 text-xs text-gray-400 leading-relaxed font-semibold">
                                  {faq.answer}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>

          </div>

        </div>
      </div>
    </>
  );
}
