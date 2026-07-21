"use client";

import { useState, useMemo, useEffect } from 'react';
import { toolsData, toolCategories, ToolCategory, Tool } from '@/data/tools';
import { fetchPublicTools } from '@/lib/tools';
import ToolCard from '@/components/ToolCard';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { useTranslation } from '@/components/I18nContext';

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
  const { t } = useTranslation();
  const [internalSearchQuery, setInternalSearchQuery] = useState(initialSearchQuery);
  const [activeCategory, setActiveCategory] = useState<ToolCategory>("All");
  const [publicTools, setPublicTools] = useState<Tool[]>(toolsData);

  const searchQuery = externalSearchQuery !== undefined ? externalSearchQuery : internalSearchQuery;

  useEffect(() => {
    setInternalSearchQuery(initialSearchQuery);
  }, [initialSearchQuery]);

  useEffect(() => {
    fetchPublicTools().then(setPublicTools).catch(() => {});
  }, []);

  const mergedTools = publicTools;

  const handleSearchChange = (query: string) => {
    if (onSearchChange) {
      onSearchChange(query);
    } else {
      setInternalSearchQuery(query);
    }
  };

  const filteredTools = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return mergedTools.filter(tool => {
      const matchesSearch = 
        tool.title.toLowerCase().includes(query) ||
        tool.description.toLowerCase().includes(query) ||
        tool.tags.some(tag => tag.toLowerCase().includes(query)) ||
        tool.category.toLowerCase().includes(query);
        
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
            <div className="absolute inset-y-0 left-6 flex items-center text-[#64748B] dark:text-gray-500 group-focus-within:text-[#2563EB] dark:group-focus-within:text-blue-500 transition-colors">
              <Search className="h-5 w-5" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="block w-full h-[68px] rounded-[20px] border border-[#E8ECF4] dark:border-white/5 bg-white dark:bg-white/[0.03] pl-14 pr-12 text-[#0F172A] dark:text-white placeholder:text-[#64748B] dark:placeholder:text-gray-600 focus:border-[#2563EB] focus:ring-4 focus:ring-blue-500/10 sm:text-lg font-bold outline-none transition-all shadow-[0_10px_30px_rgba(15,23,42,0.06)] dark:shadow-2xl backdrop-blur-md"
              placeholder={t('tools.search_placeholder_filter', 'Filter by name, tag or category...')}
            />
            {searchQuery && (
              <button 
                onClick={() => handleSearchChange("")}
                className="absolute inset-y-0 right-4 flex items-center px-2 text-[#64748B] hover:text-[#0F172A] dark:hover:text-white"
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
            className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 transform active:scale-95 cursor-pointer ${
              activeCategory === category 
                ? 'bg-gradient-to-r from-[#2563EB] to-[#7C3AED] text-white shadow-md border-transparent' 
                : 'bg-white dark:bg-white/5 text-[#475569] dark:text-gray-400 border border-[#E8ECF4] dark:border-white/10 hover:-translate-y-0.5 hover:border-[#2563EB]/50 hover:text-[#2563EB] dark:hover:text-white shadow-sm'
            }`}
          >
            {t('categories.' + category, category)}
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
          <p className="text-gray-600 dark:text-gray-400 font-medium font-sans">
            {t('tools.found_count', 'Found {count} tools for "{query}"').replace('{count}', String(filteredTools.length)).replace('{query}', searchQuery)}
            {activeCategory !== "All" && <span className="text-gray-600 dark:text-gray-400 font-medium"> {t('tools.in_category', ' in {category}').replace('{category}', t('categories.' + activeCategory, activeCategory))}</span>}
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
        <div className="text-center py-32 bg-white dark:glass rounded-[3rem] border border-gray-200 dark:border-white/5 border-dashed shadow-sm">
          <div className="bg-blue-50 dark:bg-white/5 w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto mb-8 border border-blue-100 dark:border-white/5 shadow-inner">
            <Search className="w-12 h-12 text-blue-600 dark:text-gray-400" />
          </div>
          <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-3 tracking-tighter">{t('home.no_tools_found', 'No tools found')}</h3>
          <p className="text-gray-600 dark:text-gray-400 max-w-sm mx-auto font-medium">{t('tools.no_tools_sub', 'Try broadening your search or exploring a different category.')}</p>
          <button 
            onClick={() => { handleSearchChange(""); setActiveCategory("All"); }}
            className="mt-10 px-8 py-4 rounded-2xl bg-blue-600 text-white font-black uppercase tracking-widest text-sm hover:bg-blue-700 transition-all active:scale-95 shadow-md"
          >
            {t('tools.clear_filters', 'Clear Filters')}
          </button>
        </div>
      )}
    </div>
  );
}
