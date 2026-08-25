"use client";

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers } from 'lucide-react';
import { categoriesData, getToolsByCategory } from '@/data/categories';
import { Tool } from '@/data/tools';
import { fetchPublicTools } from '@/lib/tools';
import CategoryCard from '@/components/CategoryCard';
import CategorySearch from '@/components/CategorySearch';
import { useTranslation } from '@/components/I18nContext';

interface CategoriesIndexClientProps {
  initialCategoryCounts: Record<string, number>;
  initialMergedTools: Tool[];
}

export default function CategoriesIndexClient({
  initialCategoryCounts,
  initialMergedTools,
}: CategoriesIndexClientProps) {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [mergedTools, setMergedTools] = useState<Tool[]>(initialMergedTools);

  useEffect(() => {
    fetchPublicTools().then(setMergedTools).catch(() => {});
  }, []);

  // Map category tool counts dynamically
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { ...initialCategoryCounts };
    categoriesData.forEach(cat => {
      const list = getToolsByCategory(cat.id, mergedTools);
      counts[cat.id] = list.length;
    });
    return counts;
  }, [mergedTools, initialCategoryCounts]);

  const filteredCategories = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return categoriesData
      .filter(cat => (categoryCounts[cat.id] || 0) > 0)
      .filter(cat => 
        cat.title.toLowerCase().includes(query) ||
        cat.description.toLowerCase().includes(query) ||
        cat.keywords.some(k => k.toLowerCase().includes(query))
      );
  }, [searchQuery, categoryCounts]);

  return (
    <div className="w-full">
      {/* Search Folder filter */}
      <div className="max-w-xl mx-auto mb-12 animate-in slide-in-from-bottom-2 duration-300">
        <CategorySearch 
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder={t('categories.search_folders_placeholder', 'Search category folder titles...')}
        />
      </div>

      {/* Category Grid Section */}
      <div className="max-w-6xl mx-auto">
        {filteredCategories.length > 0 ? (
          <motion.div 
            layout
            className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8"
          >
            <AnimatePresence>
              {filteredCategories.map((cat, index) => (
                <motion.div
                  key={cat.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25, delay: index * 0.04 }}
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
          <div className="text-center py-16 bg-white dark:glass rounded-[2rem] border border-gray-200 dark:border-white/5 border-dashed max-w-2xl mx-auto shadow-sm">
            <div className="bg-blue-50 dark:bg-white/5 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-100 dark:border-white/5">
              <Layers className="w-8 h-8 text-blue-600 dark:text-gray-400" />
            </div>
            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-1.5 tracking-tight">
              {t('categories.no_folders_found', 'No categories found')}
            </h3>
            <p className="text-gray-600 dark:text-gray-500 max-w-xs mx-auto text-xs font-medium">
              {t('categories.no_folders_sub', 'No directories matched "{query}". Try broad keywords.').replace('{query}', searchQuery)}
            </p>
            <button 
              onClick={() => setSearchQuery("")}
              className="mt-5 px-5 py-2.5 rounded-xl bg-blue-600 text-white font-black uppercase tracking-widest text-xs hover:bg-blue-700 transition-all active:scale-95 shadow-md"
            >
              {t('categories.clear_search', 'Clear search')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
