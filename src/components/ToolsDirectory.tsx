"use client";

import { useState, useMemo, useEffect } from 'react';
import { toolsData, toolCategories, ToolCategory, Tool, isToolVisible } from '@/data/tools';
import ToolCard from '@/components/ToolCard';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X } from 'lucide-react';

interface ToolsDirectoryProps {
  initialSearchQuery?: string;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  hideSearch?: boolean;
}

export default function ToolsDirectory({ 
  initialSearchQuery = "", 
  searchQuery: externalSearchQuery, 
  onSearchChange,
  hideSearch = false 
}: ToolsDirectoryProps) {
  const [internalSearchQuery, setInternalSearchQuery] = useState(initialSearchQuery);
  const [activeCategory, setActiveCategory] = useState<ToolCategory>("All");
  const [dynamicTools, setDynamicTools] = useState<Tool[]>([]);

  const searchQuery = externalSearchQuery !== undefined ? externalSearchQuery : internalSearchQuery;

  // Fetch dynamic tools on mount
  useEffect(() => {
    async function fetchDynamicTools() {
      try {
        const res = await fetch('/api/admin/tools');
        if (!res.ok) {
          console.warn(`Failed to load dynamic tools: Server responded with status ${res.status}`);
          return;
        }
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          console.warn("Failed to load dynamic tools: Response content type is not JSON");
          return;
        }
        const text = await res.text();
        if (!text.trim().startsWith('{') && !text.trim().startsWith('[')) {
          console.warn("Failed to load dynamic tools: Response body does not start with JSON characters");
          return;
        }
        const data = JSON.parse(text);
        if (data.success && data.tools) {
          // Format dynamic database tools to match Tool interface
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
              slug: t.slug,
              category: (categoryMap[t.category?.name] || categoryMap[t.categoryName] || t.category?.name || t.categoryName || 'Utility Tools') as ToolCategory,
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
        console.warn('Failed to load dynamic tools:', err);
      }
    }
    fetchDynamicTools();
  }, []);

  // Merge static and dynamic lists
  const mergedTools = useMemo(() => {
    return [...toolsData, ...dynamicTools];
  }, [dynamicTools]);

  const handleSearchChange = (query: string) => {
    if (onSearchChange) {
      onSearchChange(query);
    } else {
      setInternalSearchQuery(query);
    }
  };

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


  return (
    <div className="w-full" id="tools-directory">
      {/* Search Bar */}
      {!hideSearch && (
        <div className="mx-auto max-w-2xl flex flex-col items-center gap-4 mb-16">
          <div className="relative w-full group">
            <div className="absolute inset-y-0 left-6 flex items-center text-gray-500 group-focus-within:text-blue-500 transition-colors">
              <Search className="h-5 w-5" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="block w-full rounded-2xl border border-white/5 bg-white/[0.03] py-5 pl-14 pr-12 text-white placeholder:text-gray-600 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 sm:text-lg font-bold outline-none transition-all shadow-2xl backdrop-blur-md"
              placeholder="Filter by name, tag or category..."
            />
            {searchQuery && (
              <button 
                onClick={() => handleSearchChange("")}
                className="absolute inset-y-0 right-4 flex items-center px-2 text-gray-500 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Category Chips */}
      <div className="flex flex-wrap justify-center gap-3 mb-16">
        {toolCategories.map(category => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 transform active:scale-95 ${
              activeCategory === category 
                ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)]' 
                : 'bg-white/5 text-gray-500 border border-white/10 hover:border-white/20 hover:text-white'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Results Header */}
      {searchQuery && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <p className="text-gray-500 font-medium">
            Found <span className="text-white font-black">{filteredTools.length}</span> tools for <span className="text-blue-500 font-black">"{searchQuery}"</span>
            {activeCategory !== "All" && <span className="text-gray-500 font-medium"> in <span className="text-white font-black">{activeCategory}</span></span>}
          </p>
        </motion.div>
      )}

      {/* Grid */}
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
        <div className="text-center py-32 glass rounded-[3rem] border border-white/5 border-dashed">
          <div className="bg-white/5 w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto mb-8 border border-white/5 shadow-inner">
            <Search className="w-12 h-12 text-gray-700" />
          </div>
          <h3 className="text-3xl font-black text-white mb-3 tracking-tighter">No tools found</h3>
          <p className="text-gray-500 max-w-sm mx-auto font-medium">Try broadening your search or exploring a different category.</p>
          <button 
            onClick={() => { handleSearchChange(""); setActiveCategory("All"); }}
            className="mt-10 px-8 py-4 rounded-2xl bg-blue-600 text-white font-black uppercase tracking-widest text-sm hover:bg-blue-500 transition-all active:scale-95 shadow-2xl"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}
