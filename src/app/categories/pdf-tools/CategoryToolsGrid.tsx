"use client";

import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { Tool } from '@/data/tools';
import ToolCard from '@/components/ToolCard';
import CategorySearch from '@/components/CategorySearch';
import { useTranslation } from '@/components/I18nContext';

interface CategoryToolsGridProps {
  categoryTools: Tool[];
}

export default function CategoryToolsGrid({ categoryTools }: CategoryToolsGridProps) {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<'all' | 'popular' | 'trending'>('all');

  const filteredTools = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    let result = categoryTools.filter(tool => {
      if (!tool.isVisible) return false;
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

  const allCount = categoryTools.filter(t => t.isVisible).length;
  const popularCount = categoryTools.filter(t => t.popular && t.isVisible).length;

  return (
    <section className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white/[0.01] border border-white/5 p-4 rounded-[2rem] glass">
        <div className="w-full md:max-w-md">
          <CategorySearch 
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder={t('categories.search_placeholder', 'Search tools inside this folder...')}
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
            {t('categories.All', 'All')} ({allCount})
          </button>
          <button
            onClick={() => setActiveFilter('popular')}
            className={`flex-1 md:flex-initial px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider transition-colors cursor-pointer ${
              activeFilter === 'popular' ? 'bg-white/5 text-white' : 'text-gray-500 hover:text-white'
            }`}
          >
            {t('categories.Popular', 'Popular')} ({popularCount})
          </button>
          <button
            onClick={() => setActiveFilter('trending')}
            className={`flex-1 md:flex-initial px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider transition-colors cursor-pointer ${
              activeFilter === 'trending' ? 'bg-white/5 text-white' : 'text-gray-500 hover:text-white'
            }`}
          >
            {t('categories.Trending', 'Trending')}
          </button>
        </div>
      </div>

      {/* Grid layout (2 columns on mobile) */}
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
            <h4 className="text-lg font-black text-white mb-2 uppercase tracking-tight">
              {t('categories.no_tools_match', 'No tools match criteria')}
            </h4>
            <p className="text-xs text-gray-500 max-w-xs mx-auto font-medium">
              {t('categories.no_tools_sub', 'Try checking description filters or reset active tabs.')}
            </p>
            <button
              onClick={() => { setSearchQuery(""); setActiveFilter('all'); }}
              className="mt-5 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest text-[10px] shadow-md animate-fade-in cursor-pointer"
            >
              {t('categories.reset_view', 'Reset Directory View')}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
