"use client";

import { useState, useEffect, useMemo } from 'react';
import { toolsData, Tool, ToolCategory, toolCategories } from '@/data/tools';
import { getAdminTools, saveAdminOverride, ToolOverride, isToolLive } from '@/lib/tools';
import { Search, Eye, EyeOff, Star, TrendingUp, Zap, Calendar, Settings, ShieldCheck, ChevronDown, CheckCircle2, Clock, XCircle, MoreVertical } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type FilterType = "All" | "Published" | "Draft" | "Scheduled" | "Hidden";

export default function AdminToolsDashboard() {
  const [mounted, setMounted] = useState(false);
  const [tools, setTools] = useState<Tool[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<FilterType>("All");

  // Initial load
  useEffect(() => {
    setMounted(true);
    setTools(getAdminTools());
  }, []);

  const handleOverride = (toolId: string, override: ToolOverride) => {
    saveAdminOverride(toolId, override);
    setTools(getAdminTools()); // refresh state
  };

  const filteredTools = useMemo(() => {
    return tools.filter(tool => {
      // Search
      const matchesSearch = 
        tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.category.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Filter
      let matchesFilter = true;
      if (filter === "Published") matchesFilter = tool.status === "published";
      if (filter === "Draft") matchesFilter = tool.status === "draft";
      if (filter === "Scheduled") matchesFilter = tool.status === "scheduled";
      if (filter === "Hidden") matchesFilter = !tool.isVisible;

      return matchesSearch && matchesFilter;
    });
  }, [tools, searchQuery, filter]);

  if (!mounted) return null; // Avoid hydration errors

  return (
    <div className="min-h-screen bg-[#030712] py-24 font-sans text-gray-200">
      <div className="container mx-auto px-4 max-w-7xl">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black tracking-widest mb-4">
              <Settings className="w-3.5 h-3.5" />
              ADMIN DASHBOARD
            </div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white mb-2 uppercase leading-none">
              Tools <span className="text-blue-500">Registry</span>
            </h1>
            <p className="text-sm text-gray-500 font-medium max-w-xl">
              Manage visibility, publish status, and promotional badges for all ToolWala AI tools. Changes are saved locally to your browser.
            </p>
          </div>
          
          <div className="flex gap-4">
            <div className="bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-center">
              <div className="text-2xl font-black text-white">{tools.length}</div>
              <div className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mt-1">Total Tools</div>
            </div>
            <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl px-6 py-4 text-center">
              <div className="text-2xl font-black text-blue-400">{tools.filter(t => isToolLive(t)).length}</div>
              <div className="text-[10px] uppercase tracking-widest text-blue-500/70 font-bold mt-1">Live Public</div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="glass rounded-3xl border border-white/5 p-4 flex flex-col lg:flex-row gap-4 mb-8 sticky top-6 z-30 shadow-2xl bg-[#030712]/80 backdrop-blur-xl">
          
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input 
              type="text" 
              placeholder="Search by name, route, or category..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-sm font-medium text-white focus:outline-none focus:border-blue-500/50 transition-colors"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0 hide-scrollbar">
            {["All", "Published", "Draft", "Scheduled", "Hidden"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f as FilterType)}
                className={`px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                  filter === f 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white/5 text-gray-500 hover:bg-white/10 hover:text-gray-300 border border-transparent'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="glass rounded-3xl border border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/[0.02] border-b border-white/5 text-[10px] uppercase tracking-widest text-gray-500 font-black">
                  <th className="py-4 px-6">Tool Details</th>
                  <th className="py-4 px-6 text-center">Status</th>
                  <th className="py-4 px-6 text-center">Visibility</th>
                  <th className="py-4 px-6 text-center">Promotions</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filteredTools.map((tool) => (
                    <motion.tr 
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      key={tool.id} 
                      className={`border-b border-white/[0.02] hover:bg-white/[0.01] transition-colors ${
                        !isToolLive(tool) ? 'opacity-60 grayscale hover:grayscale-0' : ''
                      }`}
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-lg shadow-inner">
                            {tool.icon}
                          </div>
                          <div>
                            <div className="font-bold text-white text-sm flex items-center gap-2">
                              {tool.title}
                              {isToolLive(tool) && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />}
                            </div>
                            <div className="text-[10px] font-medium text-gray-500 mt-0.5 flex gap-2">
                              <span>{tool.category}</span>
                              <span className="text-white/20">•</span>
                              <span className="font-mono">{tool.href}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6 text-center">
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${
                          tool.status === 'published' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                          tool.status === 'scheduled' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400' :
                          'bg-gray-500/10 border-gray-500/20 text-gray-400'
                        }`}>
                          {tool.status === 'published' && <CheckCircle2 className="w-3 h-3" />}
                          {tool.status === 'scheduled' && <Clock className="w-3 h-3" />}
                          {tool.status === 'draft' && <Settings className="w-3 h-3" />}
                          {tool.status}
                        </div>
                        {tool.status === 'scheduled' && tool.publishDate && (
                          <div className="text-[9px] text-yellow-500/60 font-mono mt-1 font-bold">
                            {new Date(tool.publishDate).toLocaleDateString()}
                          </div>
                        )}
                      </td>

                      <td className="py-4 px-6 text-center">
                        <button
                          onClick={() => handleOverride(tool.id, { isVisible: !tool.isVisible })}
                          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            tool.isVisible 
                              ? 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/20' 
                              : 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20'
                          }`}
                        >
                          {tool.isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                          {tool.isVisible ? 'Visible' : 'Hidden'}
                        </button>
                      </td>

                      <td className="py-4 px-6">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            title="Featured"
                            onClick={() => handleOverride(tool.id, { featured: !tool.featured })}
                            className={`p-2 rounded-lg border transition-all ${tool.featured ? 'bg-purple-500/10 border-purple-500/30 text-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.2)]' : 'bg-white/5 border-transparent text-gray-600 hover:text-gray-400'}`}
                          >
                            <Star className="w-4 h-4" />
                          </button>
                          <button 
                            title="Trending"
                            onClick={() => handleOverride(tool.id, { trending: !tool.trending })}
                            className={`p-2 rounded-lg border transition-all ${tool.trending ? 'bg-orange-500/10 border-orange-500/30 text-orange-400 shadow-[0_0_10px_rgba(249,115,22,0.2)]' : 'bg-white/5 border-transparent text-gray-600 hover:text-gray-400'}`}
                          >
                            <TrendingUp className="w-4 h-4" />
                          </button>
                          <button 
                            title="Popular"
                            onClick={() => handleOverride(tool.id, { popular: !tool.popular })}
                            className={`p-2 rounded-lg border transition-all ${tool.popular ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.2)]' : 'bg-white/5 border-transparent text-gray-600 hover:text-gray-400'}`}
                          >
                            <Zap className="w-4 h-4" />
                          </button>
                        </div>
                      </td>

                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {tool.status !== 'published' ? (
                            <button 
                              onClick={() => handleOverride(tool.id, { status: 'published', isVisible: true })}
                              className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-lg border border-emerald-500/20 transition-colors"
                            >
                              Publish
                            </button>
                          ) : (
                            <button 
                              onClick={() => handleOverride(tool.id, { status: 'draft', isVisible: false })}
                              className="px-3 py-1.5 bg-gray-500/10 hover:bg-gray-500/20 text-gray-400 text-[10px] font-black uppercase tracking-widest rounded-lg border border-gray-500/20 transition-colors"
                            >
                              Unpublish
                            </button>
                          )}
                          <button 
                            onClick={() => {
                              const d = prompt("Enter future date (YYYY-MM-DD):");
                              if (d) handleOverride(tool.id, { status: 'scheduled', publishDate: d, isVisible: true });
                            }}
                            className="p-1.5 bg-white/5 hover:bg-white/10 text-gray-400 rounded-lg border border-white/5 transition-colors"
                            title="Schedule"
                          >
                            <Calendar className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
            {filteredTools.length === 0 && (
              <div className="text-center py-20 text-gray-500 text-sm font-medium">
                No tools found matching your filters.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
