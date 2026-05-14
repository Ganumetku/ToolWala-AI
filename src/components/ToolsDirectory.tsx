"use client";

import { useState, useMemo, useEffect } from 'react';
import { toolsData, toolCategories, ToolCategory } from '@/data/tools';
import ToolCard from '@/components/ToolCard';

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

  const searchQuery = externalSearchQuery !== undefined ? externalSearchQuery : internalSearchQuery;

  const handleSearchChange = (query: string) => {
    if (onSearchChange) {
      onSearchChange(query);
    } else {
      setInternalSearchQuery(query);
    }
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

  return (
    <div className="w-full" id="tools-directory">
      {/* Search Bar */}
      {!hideSearch && (
        <div className="mx-auto max-w-2xl flex flex-col sm:flex-row items-center gap-4 mb-8">
          <div className="relative w-full">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="block w-full rounded-full border-0 py-4 pl-10 pr-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-base sm:leading-6 transition-shadow hover:shadow-md"
              placeholder="Search for tools (e.g., 'Compress image', 'QR code')"
            />
          </div>
        </div>
      )}

      {/* Category Chips */}
      <div className="flex flex-wrap justify-center gap-2 mb-10">
        {toolCategories.map(category => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              activeCategory === category 
                ? 'bg-blue-600 text-white shadow-md transform scale-105' 
                : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Results Header */}
      {searchQuery && (
        <div className="mb-8 text-center animate-fade-in">
          <p className="text-gray-600 text-lg">
            Showing results for <span className="font-semibold text-gray-900">"{searchQuery}"</span>
            {activeCategory !== "All" && <span> in <span className="font-semibold text-blue-600">{activeCategory}</span></span>}
          </p>
        </div>
      )}

      {/* Grid */}
      {filteredTools.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-3 xl:grid-cols-4">
          {filteredTools.map((tool) => (
            <ToolCard key={tool.id} {...tool} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl border border-gray-200 border-dashed shadow-sm">
          <div className="text-5xl mb-4">🔍</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No tools found</h3>
          <p className="text-gray-500 max-w-md mx-auto">We couldn't find any tools matching your search criteria. Try using different keywords or categories.</p>
          <button 
            onClick={() => { handleSearchChange(""); setActiveCategory("All"); }}
            className="mt-6 inline-flex items-center justify-center rounded-full bg-blue-50 px-6 py-2.5 text-sm font-semibold text-blue-600 hover:bg-blue-100 transition-colors"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}
