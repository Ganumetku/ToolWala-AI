"use client";

import { useState, useRef, useMemo } from 'react';
import Link from 'next/link';
import SectionTitle from '@/components/SectionTitle';
import ToolCard from '@/components/ToolCard';
import { toolsData, toolCategories, ToolCategory } from '@/data/tools';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<ToolCategory>("All");
  const toolsSectionRef = useRef<HTMLElement | null>(null);

  const scrollToTools = () => {
    // Adding a slight delay to allow React state to settle if needed
    setTimeout(() => {
      toolsSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  const handleHeroSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (e.target.value.trim() !== "") {
      scrollToTools();
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    scrollToTools();
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
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white pt-12 pb-16 sm:pt-16 sm:pb-20">
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
          <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#eff6ff] to-[#bfdbfe] opacity-50 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="mx-auto max-w-4xl font-display text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl">
            Powerful AI tools for your <span className="relative whitespace-nowrap text-blue-600">everyday tasks</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg tracking-tight text-slate-700">
            Boost your productivity with ToolWala AI. From image processing to PDF manipulation, get everything done in one place, instantly.
          </p>
          
          {/* Hero Search Bar */}
          <form onSubmit={handleSearchSubmit} className="mx-auto mt-8 max-w-2xl flex items-center justify-center">
            <div className="relative w-full max-w-xl">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={handleHeroSearchChange}
                className="block w-full rounded-full border-0 py-4 pl-12 pr-4 text-gray-900 shadow-lg ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-lg sm:leading-6 transition-all hover:shadow-xl"
                placeholder="Search tools (e.g., 'PDF', 'Compress image')"
              />
            </div>
            <button type="submit" className="ml-3 sm:ml-4 rounded-full bg-blue-600 px-6 sm:px-8 py-4 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-colors">
              Search
            </button>
          </form>
          
          <div className="mt-8 flex justify-center gap-x-6">
            <button onClick={scrollToTools} className="text-sm font-semibold leading-6 text-gray-900 hover:text-blue-600 flex items-center transition-colors">
              Browse all tools <span aria-hidden="true" className="ml-1">↓</span>
            </button>
          </div>
        </div>
      </section>

      {/* All Tools Section */}
      <section ref={toolsSectionRef} id="tools-section" className="bg-gray-50 flex-1 flex flex-col relative pb-20">
        
        {/* Sticky Filtering Header */}
        <div className="sticky top-[64px] z-40 bg-gray-50/95 backdrop-blur-md pt-6 pb-4 border-b border-gray-200/60 shadow-sm w-full">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              {/* Internal Sticky Search */}
              <div className="relative w-full md:w-80">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full rounded-full border-0 py-2.5 pl-10 pr-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                  placeholder="Refine search..."
                />
              </div>

              {/* Category Chips */}
              <div className="flex flex-wrap items-center gap-2 overflow-x-auto pb-1 md:pb-0 w-full md:w-auto no-scrollbar">
                {toolCategories.map(category => (
                  <button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                      activeCategory === category 
                        ? 'bg-blue-600 text-white shadow-md' 
                        : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Results Count & Status */}
            <div className="mt-3 text-sm font-medium h-5">
              {searchQuery && (
                <span className="text-gray-600 animate-fade-in">
                  Found <span className="text-blue-600 font-bold">{filteredTools.length}</span> tools for <span className="text-gray-900 font-semibold">"{searchQuery}"</span>
                  {activeCategory !== "All" && <span> in {activeCategory}</span>}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Tools Grid */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-10">
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
                onClick={() => { setSearchQuery(""); setActiveCategory("All"); }}
                className="mt-6 inline-flex items-center justify-center rounded-full bg-blue-50 px-6 py-2.5 text-sm font-semibold text-blue-600 hover:bg-blue-100 transition-colors"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Why Use ToolWala AI */}
      <section className="bg-white py-24 sm:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-y-16 lg:grid-cols-2 lg:gap-x-16 lg:items-center">
            <div>
              <SectionTitle 
                title="Why choose ToolWala AI?" 
                subtitle="We combine powerful AI models with intuitive interfaces to provide the best tools for your workflow."
              />
              <dl className="mt-10 max-w-xl space-y-8 text-base leading-7 text-gray-600 lg:max-w-none">
                <div className="relative pl-9">
                  <dt className="inline font-semibold text-gray-900">
                    <svg className="absolute left-1 top-1 h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                    </svg>
                    Lightning Fast.
                  </dt>
                  <dd className="inline ml-1">Processed instantly in your browser or through our optimized servers.</dd>
                </div>
                <div className="relative pl-9">
                  <dt className="inline font-semibold text-gray-900">
                    <svg className="absolute left-1 top-1 h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                    </svg>
                    Secure & Private.
                  </dt>
                  <dd className="inline ml-1">Your files are automatically deleted after processing. We never store your data.</dd>
                </div>
                <div className="relative pl-9">
                  <dt className="inline font-semibold text-gray-900">
                    <svg className="absolute left-1 top-1 h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                    </svg>
                    Always Free to Try.
                  </dt>
                  <dd className="inline ml-1">Generous free tiers for all our tools so you can experience the value first.</dd>
                </div>
              </dl>
            </div>
            <div className="relative lg:col-start-2">
              <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-2xl bg-blue-50">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-indigo-50 opacity-90"></div>
                <div className="relative flex flex-col items-center gap-4 text-blue-600">
                  <svg className="h-32 w-32 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                  <span className="text-2xl font-bold">AI Powered Engine</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
