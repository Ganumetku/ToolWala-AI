"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Clock, TrendingUp, Sparkles, ArrowRight, CornerDownLeft, Trash2 } from 'lucide-react';
import { Tool, toolsData } from '@/data/tools';
import { fetchPublicTools } from '@/lib/tools';
import { useTranslation } from '@/components/I18nContext';
import ToolIcon from '@/components/ToolIcon';

const RECENT_SEARCHES_KEY = 'toolwala_recent_searches_history';
const MAX_RECENT_SEARCHES = 5;

const POPULAR_SEARCH_ITEMS = [
  { label: 'Compress PDF', query: 'Compress PDF' },
  { label: 'Merge PDF', query: 'Merge PDF' },
  { label: 'Passport Photo Maker', query: 'Passport Photo' },
  { label: 'Resume ATS Checker', query: 'Resume' },
  { label: 'Image Compressor', query: 'Image Compressor' },
  { label: 'Remove Background', query: 'Background' }
];

interface ToolAutocompleteSearchProps {
  value?: string;
  onChange?: (val: string) => void;
  onSelectTool?: (tool: Tool) => void;
  onSubmitSearch?: (query: string) => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
  inputHeight?: string;
}

export default function ToolAutocompleteSearch({
  value: externalValue,
  onChange,
  onSelectTool,
  onSubmitSearch,
  placeholder,
  className = "",
  autoFocus = false,
  inputHeight = "h-[68px]"
}: ToolAutocompleteSearchProps) {
  const { t, localizeHref } = useTranslation();
  const router = useRouter();

  const [internalValue, setInternalValue] = useState(externalValue || "");
  const [debouncedValue, setDebouncedValue] = useState(externalValue || "");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [allTools, setAllTools] = useState<Tool[]>(toolsData);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [fuzzyResults, setFuzzyResults] = useState<Tool[]>([]);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const fuseRef = useRef<any>(null);

  const query = externalValue !== undefined ? externalValue : internalValue;

  // Fetch tools & recent searches on mount
  useEffect(() => {
    fetchPublicTools().then(setAllTools).catch(() => {});
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load recent searches:', e);
    }
  }, []);

  // Sync internal value with external prop
  useEffect(() => {
    if (externalValue !== undefined) {
      setInternalValue(externalValue);
    }
  }, [externalValue]);

  // Debounce search input by 150ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(query);
    }, 150);
    return () => clearTimeout(handler);
  }, [query]);

  // Lazy-load Fuse.js on demand when user types a query
  useEffect(() => {
    const trimmed = debouncedValue.trim().toLowerCase();
    if (!trimmed) {
      setFuzzyResults([]);
      return;
    }

    let isCancelled = false;
    const loadAndSearchFuse = async () => {
      try {
        if (!fuseRef.current) {
          const { default: Fuse } = await import('fuse.js');
          fuseRef.current = new Fuse(allTools, {
            includeScore: true,
            threshold: 0.45,
            ignoreLocation: true,
            minMatchCharLength: 1,
            keys: [
              { name: 'title', weight: 0.5 },
              { name: 'tags', weight: 0.25 },
              { name: 'category', weight: 0.15 },
              { name: 'description', weight: 0.1 }
            ]
          });
        }
        if (!isCancelled && fuseRef.current) {
          const results = fuseRef.current.search(trimmed);
          setFuzzyResults(results.map((r: any) => r.item));
        }
      } catch (err) {
        console.error('Failed to run fuzzy search:', err);
      }
    };

    loadAndSearchFuse();
    return () => {
      isCancelled = true;
    };
  }, [debouncedValue, allTools]);

  // Save recent search
  const addRecentSearch = useCallback((searchQuery: string) => {
    const cleaned = searchQuery.trim();
    if (!cleaned) return;
    setRecentSearches(prev => {
      const filtered = prev.filter(s => s.toLowerCase() !== cleaned.toLowerCase());
      const updated = [cleaned, ...filtered].slice(0, MAX_RECENT_SEARCHES);
      try {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save recent search:', e);
      }
      return updated;
    });
  }, []);

  // Clear all recent searches
  const clearRecentSearches = useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setRecentSearches([]);
    try {
      localStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch (e) {
      console.error('Failed to clear recent searches:', e);
    }
  }, []);

  // Remove single recent search
  const removeRecentSearch = useCallback((itemToRemove: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentSearches(prev => {
      const updated = prev.filter(s => s !== itemToRemove);
      try {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      } catch (err) {
        console.error('Failed to remove recent search:', err);
      }
      return updated;
    });
  }, []);

  // Search Ranking Logic
  const suggestions = useMemo(() => {
    const trimmed = debouncedValue.trim().toLowerCase();
    if (!trimmed) return [];

    const exactTitleStarts: Tool[] = [];
    const wordTitleStarts: Tool[] = [];
    const containsTitle: Tool[] = [];
    const tagOrCategoryMatch: Tool[] = [];

    const matchedIds = new Set<string>();

    allTools.forEach(tool => {
      if (!tool.isVisible) return;
      const lowerTitle = tool.title.toLowerCase();
      const lowerCategory = tool.category.toLowerCase();
      const lowerTags = tool.tags.map(t => t.toLowerCase());

      // 1. Starts with typed keyword
      if (lowerTitle.startsWith(trimmed)) {
        exactTitleStarts.push(tool);
        matchedIds.add(tool.id);
        return;
      }

      // 2. A word in title starts with typed keyword
      const words = lowerTitle.split(/\s+/);
      if (words.some(w => w.startsWith(trimmed))) {
        wordTitleStarts.push(tool);
        matchedIds.add(tool.id);
        return;
      }

      // 3. Contains typed keyword in title
      if (lowerTitle.includes(trimmed)) {
        containsTitle.push(tool);
        matchedIds.add(tool.id);
        return;
      }

      // 4. Matches tags or category
      if (lowerCategory.includes(trimmed) || lowerTags.some(t => t.includes(trimmed))) {
        tagOrCategoryMatch.push(tool);
        matchedIds.add(tool.id);
      }
    });

    // 5. Add dynamic fuzzy matches
    const extraFuzzy: Tool[] = [];
    fuzzyResults.forEach(item => {
      if (!matchedIds.has(item.id) && item.isVisible) {
        extraFuzzy.push(item);
        matchedIds.add(item.id);
      }
    });

    // Sort helper: prioritize popular tools within same bucket
    const sortByPopularity = (arr: Tool[]) => {
      return [...arr].sort((a, b) => (b.popular ? 1 : 0) - (a.popular ? 1 : 0));
    };

    const combined = [
      ...sortByPopularity(exactTitleStarts),
      ...sortByPopularity(wordTitleStarts),
      ...sortByPopularity(containsTitle),
      ...sortByPopularity(tagOrCategoryMatch),
      ...extraFuzzy
    ];

    return combined.slice(0, 7); // Max 7 suggestions
  }, [debouncedValue, allTools, fuzzyResults]);

  // Fallback "Did you mean" tools if no exact results match
  const fallbackSuggestions = useMemo(() => {
    if (suggestions.length > 0 || !debouncedValue.trim()) return [];
    return allTools.filter(t => t.popular && t.isVisible).slice(0, 4);
  }, [suggestions, debouncedValue, allTools]);

  // Handle Input Changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (onChange) {
      onChange(val);
    } else {
      setInternalValue(val);
    }
    setSelectedIndex(-1);
    if (!isOpen) setIsOpen(true);
  };

  // Open item
  const handleSelectTool = (tool: Tool) => {
    addRecentSearch(tool.title);
    setIsOpen(false);
    if (onSelectTool) {
      onSelectTool(tool);
    } else {
      router.push(localizeHref(tool.href));
    }
  };

  // Run Search Submission
  const handleSearchSubmit = (searchQueryToSubmit?: string) => {
    const finalQuery = searchQueryToSubmit !== undefined ? searchQueryToSubmit : query;
    if (finalQuery.trim()) {
      addRecentSearch(finalQuery.trim());
    }
    setIsOpen(false);
    if (onSubmitSearch) {
      onSubmitSearch(finalQuery);
    } else {
      router.push(localizeHref('/tools') + '?search=' + encodeURIComponent(finalQuery.trim()));
    }
  };

  // Handle Keyboard Navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        setIsOpen(true);
        return;
      }
    }

    const totalCount = suggestions.length > 0 ? suggestions.length : fallbackSuggestions.length;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1 < totalCount ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 >= 0 ? prev - 1 : totalCount - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && suggestions[selectedIndex]) {
        handleSelectTool(suggestions[selectedIndex]);
      } else if (selectedIndex >= 0 && fallbackSuggestions[selectedIndex]) {
        handleSelectTool(fallbackSuggestions[selectedIndex]);
      } else {
        handleSearchSubmit();
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setSelectedIndex(-1);
      inputRef.current?.blur();
    } else if (e.key === 'Tab') {
      setIsOpen(false);
    }
  };

  // Scroll active item into view
  useEffect(() => {
    if (selectedIndex >= 0 && listRef.current) {
      const activeEl = listRef.current.children[selectedIndex] as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [selectedIndex]);

  // Click Outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Helper to highlight matching letters in tool title
  const highlightMatches = (text: string, searchQuery: string) => {
    const trimmed = searchQuery.trim();
    if (!trimmed) return text;

    const regex = new RegExp(`(${trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);

    if (parts.length <= 1) {
      // Fallback word matching
      const words = trimmed.split(/\s+/).filter(Boolean);
      if (words.length === 0) return text;
      const pattern = words.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
      const wordRegex = new RegExp(`(${pattern})`, 'gi');
      const wordParts = text.split(wordRegex);
      return wordParts.map((part, i) =>
        wordRegex.test(part) ? (
          <span key={i} className="text-[#2563EB] dark:text-blue-400 font-extrabold bg-blue-500/10 dark:bg-blue-500/20 px-1 rounded">
            {part}
          </span>
        ) : (
          part
        )
      );
    }

    return parts.map((part, i) =>
      regex.test(part) ? (
        <span key={i} className="text-[#2563EB] dark:text-blue-400 font-extrabold bg-blue-500/10 dark:bg-blue-500/20 px-1 rounded">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  const defaultPlaceholder = t('tools.search_placeholder_filter', 'Search PDF, Image, Resume & AI tools...');

  return (
    <div ref={containerRef} className={`relative w-full ${isOpen ? 'z-50' : 'z-20'} ${className}`}>
      
      {/* Search Input Box */}
      <div className="relative group p-0.5 rounded-[22px] bg-gradient-to-r from-[#2563EB]/20 via-[#7C3AED]/20 to-[#2563EB]/20 bg-[length:200%_auto] focus-within:from-[#2563EB] focus-within:to-[#7C3AED] transition-all shadow-[0_10px_30px_rgba(15,23,42,0.06)] dark:shadow-2xl">
        <div className={`relative flex items-center bg-white dark:bg-[#090d16] ${inputHeight} rounded-[20px] pl-5 sm:pl-6 pr-3 sm:pr-4 border border-[#E8ECF4] dark:border-white/5 transition-colors`}>
          <div className="text-[#64748B] dark:text-gray-500 mr-2 sm:mr-3 shrink-0 flex items-center justify-center pointer-events-none">
            <Search className="h-5 w-5 sm:h-6 sm:w-6 group-focus-within:text-[#2563EB] dark:group-focus-within:text-blue-500 transition-colors" />
          </div>
          
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-expanded={isOpen}
            aria-autocomplete="list"
            aria-controls="search-autocomplete-listbox"
            aria-activedescendant={selectedIndex >= 0 ? `autocomplete-option-${selectedIndex}` : undefined}
            value={query}
            onChange={handleInputChange}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            autoFocus={autoFocus}
            placeholder={placeholder || defaultPlaceholder}
            className="w-full bg-transparent border-0 border-none outline-none focus:outline-none focus:ring-0 focus:border-none focus-visible:outline-none focus-visible:ring-0 text-[#0F172A] dark:text-white py-3 pl-3 sm:pl-4 pr-2 text-base sm:text-lg font-bold placeholder:text-[#64748B] dark:placeholder:text-gray-500"
          />

          {query ? (
            <button
              type="button"
              onClick={() => {
                if (onChange) onChange('');
                else setInternalValue('');
                setSelectedIndex(-1);
                inputRef.current?.focus();
              }}
              className="p-2 text-[#64748B] hover:text-[#0F172A] dark:hover:text-white transition-colors cursor-pointer rounded-lg shrink-0"
              aria-label="Clear search"
            >
              <X className="h-5 w-5" />
            </button>
          ) : null}

          <button
            type="button"
            onClick={() => handleSearchSubmit()}
            className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-[#2563EB] to-[#7C3AED] hover:opacity-95 text-white font-black px-6 py-3 rounded-xl text-xs uppercase tracking-widest transition-all shadow-md shrink-0 cursor-pointer ml-2"
          >
            {t('home.search_btn', 'Search')}
          </button>
        </div>
      </div>

      {/* Autocomplete Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute top-full left-0 right-0 mt-3 z-50 bg-white dark:bg-[#090d16] border border-[#E8ECF4] dark:border-white/10 shadow-[0_20px_50px_rgba(15,23,42,0.15)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.9)] rounded-2xl overflow-hidden text-left"
          >
            
            {/* 1. Live Suggestions Available */}
            {query.trim() && suggestions.length > 0 && (
              <div className="p-2">
                <div className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-[#64748B] dark:text-gray-400 flex items-center justify-between border-b border-gray-100 dark:border-white/5 mb-1">
                  <span>{t('tools.suggestions_header', 'Matching Tools')} ({suggestions.length})</span>
                  <span className="text-[9px] font-semibold text-gray-600 dark:text-gray-500">Press ↑↓ to navigate, ↵ to select</span>
                </div>

                <ul id="search-autocomplete-listbox" role="listbox" ref={listRef} className="max-h-[380px] overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                  {suggestions.map((tool, idx) => {
                    const isSelected = selectedIndex === idx;
                    return (
                      <li
                        key={tool.id}
                        id={`autocomplete-option-${idx}`}
                        role="option"
                        aria-selected={isSelected}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        onClick={() => handleSelectTool(tool)}
                        className={`flex items-center gap-3.5 p-3 rounded-xl cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-blue-50 dark:bg-blue-600/20 border-l-4 border-[#2563EB] dark:border-blue-400 pl-2.5'
                            : 'hover:bg-gray-50 dark:hover:bg-white/5 border-l-4 border-transparent'
                        }`}
                      >
                        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-white/5 border border-blue-100 dark:border-white/10 flex items-center justify-center shrink-0 shadow-sm text-blue-600 dark:text-blue-400">
                          <ToolIcon icon={tool.icon} className="w-5 h-5" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-[#0F172A] dark:text-white truncate">
                              {highlightMatches(tool.title, debouncedValue)}
                            </h4>
                            {tool.popular && (
                              <span className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shrink-0">
                                Popular
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 mt-0.5 text-xs text-[#64748B] dark:text-gray-400 font-medium">
                            <span className="font-semibold text-blue-600 dark:text-blue-400 text-[11px]">
                              {tool.category}
                            </span>
                            <span>•</span>
                            <span className="truncate text-[11px] text-gray-500 dark:text-gray-400">
                              {tool.description}
                            </span>
                          </div>
                        </div>

                        <div className="text-gray-400 dark:text-gray-500 shrink-0">
                          <CornerDownLeft className={`w-4 h-4 transition-opacity ${isSelected ? 'opacity-100 text-[#2563EB] dark:text-blue-400' : 'opacity-0'}`} />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {/* 2. No Exact Results Fallback */}
            {query.trim() && suggestions.length === 0 && (
              <div className="p-6 text-center">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center mx-auto mb-3">
                  <Search className="w-6 h-6" />
                </div>

                <h4 className="text-sm font-black text-[#0F172A] dark:text-white mb-1">
                  {t('tools.no_match_found', 'No exact match found for "{query}"').replace('{query}', query)}
                </h4>
                <p className="text-xs text-[#64748B] dark:text-gray-400 mb-5 font-medium">
                  {t('tools.did_you_mean', 'Did you mean standard utilities below?')}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left mb-5">
                  {fallbackSuggestions.map((tool, idx) => (
                    <button
                      key={tool.id}
                      onClick={() => handleSelectTool(tool)}
                      className="flex items-center gap-3 p-2.5 rounded-xl bg-gray-50 dark:bg-white/5 hover:bg-blue-50 dark:hover:bg-blue-600/10 border border-gray-200 dark:border-white/5 hover:border-blue-500/30 transition-all text-left group"
                    >
                      <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-white/5 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                        <ToolIcon icon={tool.icon} className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-gray-800 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate">
                        {tool.title}
                      </span>
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => {
                    if (onChange) onChange('');
                    else setInternalValue('');
                    setIsOpen(false);
                  }}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#7C3AED] text-white font-black text-xs uppercase tracking-widest hover:opacity-95 transition-all shadow-md cursor-pointer"
                >
                  <span>{t('tools.browse_all_tools', 'Browse All Tools')}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* 3. Empty Query (Focus State): Recent & Popular Searches */}
            {!query.trim() && (
              <div className="p-4 space-y-4">
                
                {/* Recent Searches */}
                {recentSearches.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-[#64748B] dark:text-gray-400 mb-2.5 px-1">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-blue-500" />
                        {t('tools.recent_searches', 'Recent Searches')}
                      </span>
                      <button
                        onClick={clearRecentSearches}
                        className="text-[9px] font-bold text-red-500 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                        {t('tools.clear_history', 'Clear History')}
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {recentSearches.map((item, idx) => (
                        <div
                          key={idx}
                          onClick={() => {
                            if (onChange) onChange(item);
                            else setInternalValue(item);
                            handleSearchSubmit(item);
                          }}
                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:border-blue-500/40 hover:text-blue-600 dark:hover:text-blue-400 transition-all cursor-pointer group"
                        >
                          <Clock className="w-3 h-3 text-gray-400 group-hover:text-blue-500" />
                          <span>{item}</span>
                          <span
                            onClick={(e) => removeRecentSearch(item, e)}
                            className="p-0.5 text-gray-400 hover:text-red-500 transition-colors rounded"
                          >
                            <X className="w-3 h-3" />
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Popular Searches */}
                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-[#64748B] dark:text-gray-400 mb-2.5 px-1 flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-purple-500" />
                    {t('tools.popular_searches', 'Popular Searches')}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {POPULAR_SEARCH_ITEMS.map((item) => (
                      <button
                        key={item.label}
                        onClick={() => {
                          if (onChange) onChange(item.query);
                          else setInternalValue(item.query);
                          handleSearchSubmit(item.query);
                        }}
                        className="flex items-center gap-2 p-2.5 rounded-xl bg-gray-50 dark:bg-white/5 hover:bg-blue-50 dark:hover:bg-blue-600/10 border border-gray-200 dark:border-white/5 hover:border-blue-500/30 text-xs font-bold text-gray-800 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-all text-left cursor-pointer group"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            )}

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
