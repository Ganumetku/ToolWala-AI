"use client";

import { useState, useRef, useMemo } from 'react';
import Link from 'next/link';
import SectionTitle from '@/components/SectionTitle';
import ToolCard from '@/components/ToolCard';
import { toolsData, toolCategories, ToolCategory } from '@/data/tools';
import { 
  Sparkles, Rocket, ShieldCheck, Zap, 
  Search, ArrowDown, FileText, ImageIcon, 
  Mic, MousePointer2, Star
} from 'lucide-react';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<ToolCategory>("All");
  const toolsSectionRef = useRef<HTMLElement | null>(null);

  const scrollToTools = () => {
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
    <div className="flex flex-col min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-24 sm:pt-28 sm:pb-32 bg-white">
        {/* Premium AI Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100/50 rounded-full blur-[120px] animate-pulse-slow" />
          <div className="absolute bottom-[10%] right-[-10%] w-[35%] h-[35%] bg-indigo-100/40 rounded-full blur-[100px] animate-pulse-slow" style={{ animationDelay: '2s' }} />
          <div className="absolute top-[20%] right-[15%] w-[15%] h-[15%] bg-blue-50/60 rounded-full blur-[80px]" />
          <div className="absolute inset-0 bg-grid-pattern opacity-[0.4]" />
        </div>

        {/* Floating Icons */}
        <div className="hidden lg:block absolute inset-0 pointer-events-none -z-10">
          <div className="absolute top-[20%] left-[10%] animate-float" style={{ animationDelay: '0s' }}>
            <div className="p-4 rounded-2xl bg-white shadow-xl border border-gray-100 text-blue-600">
              <ImageIcon className="w-8 h-8" />
            </div>
          </div>
          <div className="absolute top-[60%] left-[15%] animate-float" style={{ animationDelay: '1.5s' }}>
            <div className="p-3 rounded-2xl bg-white shadow-xl border border-gray-100 text-emerald-600">
              <FileText className="w-6 h-6" />
            </div>
          </div>
          <div className="absolute top-[25%] right-[10%] animate-float" style={{ animationDelay: '0.8s' }}>
            <div className="p-4 rounded-2xl bg-white shadow-xl border border-gray-100 text-purple-600">
              <Mic className="w-8 h-8" />
            </div>
          </div>
          <div className="absolute top-[65%] right-[15%] animate-float" style={{ animationDelay: '2.2s' }}>
            <div className="p-3 rounded-2xl bg-white shadow-xl border border-gray-100 text-amber-600">
              <Sparkles className="w-6 h-6" />
            </div>
          </div>
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          {/* Beta Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-700 text-sm font-black mb-8 animate-fade-up border border-blue-100 shadow-sm shadow-blue-50">
            <Rocket className="w-4 h-4" />
            <span>FREE BETA ACCESS</span>
          </div>

          <h1 className="mx-auto max-w-4xl font-black text-5xl md:text-7xl tracking-tight text-gray-900 leading-[1.1] animate-fade-up" style={{ animationDelay: '0.1s' }}>
            Everything you can imagine, <br />
            <span className="text-blue-600 relative">
              Powered by AI
              <svg className="absolute -bottom-2 left-0 w-full h-3 text-blue-200 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0 5 Q 25 0 50 5 T 100 5" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
              </svg>
            </span>
          </h1>
          
          <p className="mx-auto mt-8 max-w-2xl text-xl font-medium text-gray-600 leading-relaxed animate-fade-up" style={{ animationDelay: '0.2s' }}>
            The ultimate playground for AI tools. Generate, edit, and optimize your workflows with the world's most powerful AI models.
          </p>
          
          {/* Trust Strip */}
          <div className="mt-8 flex flex-wrap justify-center items-center gap-6 text-sm font-bold text-gray-400 uppercase tracking-widest animate-fade-up" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center gap-2">
              <MousePointer2 className="w-4 h-4 text-blue-500" />
              No Signup
            </div>
            <div className="hidden sm:block text-gray-200">|</div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              Browser-based
            </div>
            <div className="hidden sm:block text-gray-200">|</div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              Fast & Free
            </div>
          </div>

          {/* Hero Search Bar */}
          <form onSubmit={handleSearchSubmit} className="mx-auto mt-12 max-w-2xl animate-fade-up" style={{ animationDelay: '0.4s' }}>
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full blur opacity-25 group-focus-within:opacity-50 transition duration-1000 group-focus-within:duration-200"></div>
              <div className="relative flex items-center bg-white rounded-full p-2 shadow-2xl border border-gray-100">
                <div className="pl-4">
                  <Search className="h-6 w-6 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleHeroSearchChange}
                  className="block w-full border-0 bg-transparent py-4 pl-3 pr-4 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-xl font-medium"
                  placeholder="What can I help you with today?"
                />
                <button type="submit" className="hidden sm:block rounded-full bg-blue-600 px-8 py-4 text-sm font-black text-white shadow-xl hover:bg-blue-700 active:scale-95 transition-all">
                  Search Tools
                </button>
              </div>
            </div>
            <button type="submit" className="sm:hidden w-full mt-4 rounded-2xl bg-blue-600 py-4 text-sm font-black text-white shadow-xl hover:bg-blue-700 transition-all">
              Search Tools
            </button>
          </form>
          
          <div className="mt-12 animate-fade-up" style={{ animationDelay: '0.5s' }}>
            <button onClick={scrollToTools} className="group text-sm font-black text-gray-900 flex flex-col items-center gap-2 mx-auto hover:text-blue-600 transition-colors">
              <span className="uppercase tracking-widest">Explore Directory</span>
              <ArrowDown className="w-5 h-5 animate-bounce group-hover:text-blue-600" />
            </button>
          </div>
        </div>
      </section>

      {/* All Tools Section */}
      <section ref={toolsSectionRef} id="tools-section" className="bg-gray-50 flex-1 flex flex-col relative pb-32 pt-16">
        <div className="absolute inset-0 bg-gradient-to-b from-white to-transparent h-40 -z-0" />
        
        {/* Sticky Filtering Header */}
        <div className="sticky top-[68px] z-40 bg-white/80 backdrop-blur-xl pt-6 pb-6 border-b border-gray-100 shadow-sm w-full transition-all">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col xl:flex-row justify-between items-stretch xl:items-center gap-6">
              {/* Internal Sticky Search */}
              <div className="relative flex-1 max-w-md group">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <Search className="h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full rounded-2xl border-gray-200 bg-gray-50/50 py-3 pl-11 pr-4 text-gray-900 shadow-sm focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all font-medium"
                  placeholder="Filter by name or category..."
                />
              </div>

              {/* Category Chips */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 xl:pb-0 no-scrollbar">
                {toolCategories.map(category => (
                  <button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={`whitespace-nowrap px-6 py-2.5 rounded-xl text-sm font-black tracking-wide transition-all duration-300 transform active:scale-95 ${
                      activeCategory === category 
                        ? 'bg-blue-600 text-white shadow-xl shadow-blue-100' 
                        : 'bg-white text-gray-500 border border-gray-200 hover:border-blue-200 hover:text-blue-600'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Results Count & Status */}
            <div className="mt-4 text-xs font-black uppercase tracking-widest h-4">
              {searchQuery && (
                <span className="text-gray-400 animate-fade-in flex items-center gap-2">
                  <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                  Showing <span className="text-blue-600">{filteredTools.length}</span> tools matching <span className="text-gray-900">"{searchQuery}"</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Tools Grid */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-16">
          {filteredTools.length > 0 ? (
            <div className="grid grid-cols-1 gap-8 sm:gap-10 lg:grid-cols-3 xl:grid-cols-4">
              {filteredTools.map((tool) => (
                <div key={tool.id} className="transition-transform duration-500 hover:-translate-y-2">
                  <ToolCard {...tool} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-32 bg-white rounded-[3rem] border-2 border-gray-100 border-dashed shadow-sm">
              <div className="bg-gray-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-10 h-10 text-gray-300" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-2">No tools found</h3>
              <p className="text-gray-500 max-w-sm mx-auto font-medium">We couldn't find any tools matching your search criteria. Try a different term!</p>
              <button 
                onClick={() => { setSearchQuery(""); setActiveCategory("All"); }}
                className="mt-8 inline-flex items-center justify-center rounded-2xl bg-blue-600 px-8 py-3 text-sm font-black text-white hover:bg-blue-700 transition-all shadow-xl shadow-blue-100"
              >
                Show All Tools
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Why Use ToolWala AI */}
      <section className="bg-white py-32 relative overflow-hidden">
        <div className="absolute top-1/2 left-0 w-64 h-64 bg-blue-50 rounded-full blur-[100px] -z-10" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-y-16 lg:grid-cols-2 lg:gap-x-24 lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-blue-50 text-blue-600 text-xs font-black uppercase tracking-widest mb-6">
                <Star className="w-3.5 h-3.5 fill-blue-600" />
                The Difference
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight mb-8">
                The most intuitive AI <br /> 
                <span className="text-blue-600">utility playground</span>
              </h2>
              <p className="text-lg text-gray-600 font-medium leading-relaxed mb-10">
                ToolWala AI isn't just another directory. We build and host specialized AI models optimized for speed, accuracy, and ease of use.
              </p>
              
              <div className="space-y-8">
                <div className="flex gap-5">
                  <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                    <Zap className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-gray-900 mb-1 uppercase tracking-tight">Lightning Performance</h4>
                    <p className="text-gray-500 font-medium">Tools optimized to process data in milliseconds using GPU acceleration.</p>
                  </div>
                </div>
                <div className="flex gap-5">
                  <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-gray-900 mb-1 uppercase tracking-tight">Privacy by Design</h4>
                    <p className="text-gray-500 font-medium">All processing happens either in-browser or on temporary secure nodes.</p>
                  </div>
                </div>
                <div className="flex gap-5">
                  <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
                    <Star className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-gray-900 mb-1 uppercase tracking-tight">Universal Access</h4>
                    <p className="text-gray-500 font-medium">No account required. Use any tool instantly from any device.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-blue-600 rounded-[3rem] rotate-3 opacity-5 -z-10" />
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[3rem] bg-gray-900 shadow-2xl flex items-center justify-center border border-gray-800">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-600/20 to-transparent" />
                <div className="flex flex-col items-center gap-6 text-center px-12 relative z-10">
                  <div className="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-2xl shadow-blue-500/50">
                    <Sparkles className="w-12 h-12" />
                  </div>
                  <h3 className="text-3xl font-black text-white uppercase tracking-tighter">AI Powered <br /> Workspace</h3>
                  <div className="flex gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" />
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0.2s' }} />
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0.4s' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
