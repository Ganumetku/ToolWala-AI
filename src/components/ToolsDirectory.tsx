"use client";

import { useState, useMemo, useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { toolsData, type Tool } from '@/data/tools';
import { fetchPublicTools } from '@/lib/tools';
import {
  DIRECTORY_FILTERS,
  DIRECTORY_PAGE_SIZE,
  matchesDirectoryFilter,
} from '@/data/homepageTools';
import ToolCard from '@/components/ToolCard';
import ToolAutocompleteSearch from '@/components/ToolAutocompleteSearch';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { useTranslation } from '@/components/I18nContext';
import Fuse from 'fuse.js';

interface ToolsDirectoryProps {
  initialSearchQuery?: string;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  hideSearch?: boolean;
}

export default function ToolsDirectory({
  initialSearchQuery = '',
  searchQuery: externalSearchQuery,
  onSearchChange,
  hideSearch = false,
}: ToolsDirectoryProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [internalSearchQuery, setInternalSearchQuery] = useState(initialSearchQuery);
  const [activeCategory, setActiveCategory] = useState(searchParams?.get('category') || 'All');
  const [page, setPage] = useState(Math.max(1, Number(searchParams?.get('page') || 1)));
  const [publicTools, setPublicTools] = useState<Tool[]>(toolsData);

  const searchQuery = externalSearchQuery !== undefined ? externalSearchQuery : internalSearchQuery;

  useEffect(() => {
    setInternalSearchQuery(initialSearchQuery);
  }, [initialSearchQuery]);

  useEffect(() => {
    fetchPublicTools().then(setPublicTools).catch(() => {});
  }, []);

  const fuse = useMemo(() => {
    return new Fuse(publicTools, {
      includeScore: true,
      threshold: 0.45,
      ignoreLocation: true,
      minMatchCharLength: 1,
      keys: [
        { name: 'title', weight: 0.5 },
        { name: 'tags', weight: 0.25 },
        { name: 'category', weight: 0.15 },
        { name: 'description', weight: 0.1 },
      ],
    });
  }, [publicTools]);

  const handleSearchChange = (query: string) => {
    setPage(1);
    if (onSearchChange) onSearchChange(query);
    else setInternalSearchQuery(query);
  };

  const filteredTools = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    let baseList = publicTools.filter((t) => t.isVisible && t.status === 'published');
    baseList = baseList.filter((t) => matchesDirectoryFilter(t, activeCategory));

    if (!query) return baseList;

    const matchedIds = new Set<string>();
    const directMatches = baseList.filter((tool) => {
      const matches =
        tool.title.toLowerCase().includes(query) ||
        tool.category.toLowerCase().includes(query) ||
        tool.tags.some((tag) => tag.toLowerCase().includes(query)) ||
        tool.description.toLowerCase().includes(query);
      if (matches) matchedIds.add(tool.id);
      return matches;
    });

    const fuseResults = fuse.search(query);
    const fuzzyMatches: Tool[] = [];
    fuseResults.forEach((res) => {
      if (!baseList.some((t) => t.id === res.item.id)) return;
      if (!matchedIds.has(res.item.id)) {
        fuzzyMatches.push(res.item);
        matchedIds.add(res.item.id);
      }
    });

    return [...directMatches, ...fuzzyMatches];
  }, [publicTools, searchQuery, activeCategory, fuse]);

  const totalPages = Math.max(1, Math.ceil(filteredTools.length / DIRECTORY_PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageTools = filteredTools.slice((safePage - 1) * DIRECTORY_PAGE_SIZE, safePage * DIRECTORY_PAGE_SIZE);

  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('search', searchQuery.trim());
    if (activeCategory !== 'All') params.set('category', activeCategory);
    if (safePage > 1) params.set('page', String(safePage));
    const next = params.toString();
    const current = searchParams?.toString() || '';
    if (next !== current) {
      router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
    }
  }, [searchQuery, activeCategory, safePage, pathname, router, searchParams]);

  const changeCategory = (id: string) => {
    setActiveCategory(id);
    setPage(1);
  };

  return (
    <div className="w-full" id="tools-directory">
      {!hideSearch && (
        <div className="mx-auto max-w-2xl flex flex-col items-center gap-4 mb-6 sm:mb-8 relative z-30">
          <ToolAutocompleteSearch
            value={searchQuery}
            onChange={handleSearchChange}
            onSubmitSearch={(q) => handleSearchChange(q)}
            onSelectTool={(tool) => handleSearchChange(tool.title)}
          />
        </div>
      )}

      <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-8 sm:mb-10 relative z-10">
        {DIRECTORY_FILTERS.map((category) => (
          <button
            key={category.id}
            onClick={() => changeCategory(category.id)}
            className={`px-3.5 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl text-[9px] sm:text-[10px] font-black uppercase tracking-wider sm:tracking-[0.2em] transition-all duration-300 transform active:scale-95 cursor-pointer ${
              activeCategory === category.id
                ? 'bg-gradient-to-r from-[#2563EB] to-[#7C3AED] text-white shadow-md border-transparent'
                : 'bg-white dark:bg-white/5 text-[#475569] dark:text-gray-400 border border-[#E8ECF4] dark:border-white/10 hover:-translate-y-0.5 hover:border-[#2563EB]/50 hover:text-[#2563EB] dark:hover:text-white shadow-sm'
            }`}
          >
            {t('categories.' + category.id, category.label)}
          </button>
        ))}
      </div>

      {searchQuery && (
        <div className="mb-8 text-center relative z-10">
          <p className="text-gray-600 dark:text-gray-400 font-medium font-sans text-xs sm:text-base">
            {t('tools.found_count', 'Found {count} tools for "{query}"')
              .replace('{count}', String(filteredTools.length))
              .replace('{query}', searchQuery)}
          </p>
        </div>
      )}

      {pageTools.length > 0 ? (
        <>
          <div className="grid grid-cols-1 min-[480px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 relative z-10">
            {pageTools.map((tool, index) => (
              <ToolCard key={tool.id} {...tool} priority={safePage === 1 && index < 8} />
            ))}
          </div>

          {totalPages > 1 && (
            <nav className="mt-10 flex flex-wrap items-center justify-center gap-2" aria-label="Tools pagination">
              <button
                type="button"
                disabled={safePage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border border-slate-200 dark:border-white/10 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
                Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setPage(n)}
                  className={`min-w-9 h-9 px-2 rounded-xl text-xs font-bold ${
                    n === safePage
                      ? 'bg-[#2563EB] text-white'
                      : 'bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10'
                  }`}
                >
                  {n}
                </button>
              ))}
              <button
                type="button"
                disabled={safePage >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border border-slate-200 dark:border-white/10 disabled:opacity-40"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </nav>
          )}
        </>
      ) : (
        <div className="text-center py-32 bg-white dark:glass rounded-[3rem] border border-gray-200 dark:border-white/5 border-dashed shadow-sm">
          <div className="bg-blue-50 dark:bg-white/5 w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto mb-8 border border-blue-100 dark:border-white/5 shadow-inner">
            <Search className="w-12 h-12 text-blue-600 dark:text-gray-400" />
          </div>
          <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-3 tracking-tighter">{t('home.no_tools_found', 'No tools found')}</h3>
          <p className="text-gray-600 dark:text-gray-400 max-w-sm mx-auto font-medium">{t('tools.no_tools_sub', 'Try broadening your search or exploring a different category.')}</p>
          <button
            onClick={() => {
              handleSearchChange('');
              changeCategory('All');
            }}
            className="mt-10 px-8 py-4 rounded-2xl bg-blue-600 text-white font-black uppercase tracking-widest text-sm hover:bg-blue-700 transition-all active:scale-95 shadow-md"
          >
            {t('tools.clear_filters', 'Clear Filters')}
          </button>
        </div>
      )}
    </div>
  );
}
