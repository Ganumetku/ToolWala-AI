"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Tool, toolCategories } from '@/data/tools';
import { isToolLive } from '@/lib/tools';
import type { ToolUpdateInput, CreateToolInput } from '@/lib/tool-service';
import { toast } from 'sonner';
import { adminFetch } from '@/lib/admin-fetch';
import {
  Search, EyeOff, Star, TrendingUp, Zap, Calendar, Settings,
  CheckCircle2, Clock, Plus, RefreshCw, Database, X, Loader2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type FilterType = "All" | "Published" | "Draft" | "Scheduled" | "Hidden";

export default function AdminToolsDashboard() {
  const [mounted, setMounted] = useState(false);
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<FilterType>("All");
  const [showAddModal, setShowAddModal] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [activeScheduleTool, setActiveScheduleTool] = useState<Tool | null>(null);

  // Add tool form
  const [newTitle, setNewTitle] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newCategory, setNewCategory] = useState<Tool['category']>('Utility Tools');

  const loadTools = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminFetch('/api/admin/tools');
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to load tools');
      }
      setTools(data.tools);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load tools';
      toast.error(msg);
      console.error('[AdminTools] loadTools error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    loadTools();
  }, [loadTools]);

  const runAction = async (
    slug: string,
    action: () => Promise<void>,
    successMsg: string
  ) => {
    setSaving(slug);
    try {
      await action();
      toast.success(successMsg);
      await loadTools();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Update failed';
      toast.error(msg);
    } finally {
      setSaving(null);
    }
  };

  const handleUpdate = (tool: Tool, updates: ToolUpdateInput) =>
    runAction(tool.slug, async () => {
      const res = await adminFetch('/api/admin/tools', {
        method: 'PATCH',
        body: JSON.stringify({ slug: tool.slug, ...updates }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to update tool');
    }, `${tool.title} updated`);

  const handlePublish = (tool: Tool) =>
    runAction(tool.slug, async () => {
      const res = await adminFetch('/api/admin/tools', {
        method: 'PATCH',
        body: JSON.stringify({ slug: tool.slug, status: 'published', isVisible: true }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to publish tool');
    }, `${tool.title} is now LIVE`);

  const handleUnpublish = (tool: Tool) =>
    runAction(tool.slug, async () => {
      const res = await adminFetch('/api/admin/tools', {
        method: 'PATCH',
        body: JSON.stringify({ slug: tool.slug, status: 'draft', isVisible: false }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to unpublish tool');
    }, `${tool.title} unpublished`);

  const handleToggleVisibility = (tool: Tool) =>
    runAction(
      tool.slug,
      async () => {
        const res = await adminFetch('/api/admin/tools', {
          method: 'PATCH',
          body: JSON.stringify({ slug: tool.slug, isVisible: !tool.isVisible }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.error || 'Failed to toggle visibility');
      },
      `${tool.title} visibility ${!tool.isVisible ? 'ON' : 'OFF'}`
    );

  const handleAddTool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newSlug.trim()) {
      toast.error('Title and slug are required');
      return;
    }

    setSaving('new-tool');
    try {
      const input = {
        title: newTitle.trim(),
        slug: newSlug.trim().toLowerCase().replace(/\s+/g, '-'),
        description: newDescription.trim() || 'New ToolWala utility',
        category: newCategory,
        status: 'draft',
        isVisible: false,
      };

      const res = await adminFetch('/api/admin/tools', {
        method: 'POST',
        body: JSON.stringify(input),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to create tool');

      toast.success(`${input.title} saved to Supabase`);
      setShowAddModal(false);
      setNewTitle('');
      setNewSlug('');
      setNewDescription('');
      await loadTools();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to create tool';
      toast.error(msg);
    } finally {
      setSaving(null);
    }
  };

  const handleSeedCatalog = async () => {
    setSeeding(true);
    try {
      const res = await adminFetch('/api/admin/tools/seed', { method: 'POST' });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.error || 'Seed failed');
        return;
      }
      toast.success(`Synced ${data.seeded} tools to Supabase`);
      await loadTools();
    } catch {
      toast.error('Network error during seed');
    } finally {
      setSeeding(false);
    }
  };

  const filteredTools = useMemo(() => {
    return tools.filter(tool => {
      const matchesSearch =
        tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.category.toLowerCase().includes(searchQuery.toLowerCase());

      let matchesFilter = true;
      if (filter === "Published") matchesFilter = tool.status === "published";
      if (filter === "Draft") matchesFilter = tool.status === "draft";
      if (filter === "Scheduled") matchesFilter = tool.status === "scheduled";
      if (filter === "Hidden") matchesFilter = !tool.isVisible;

      return matchesSearch && matchesFilter;
    });
  }, [tools, searchQuery, filter]);

  const getStatusBadge = (tool: Tool) => {
    if (!tool.isVisible) {
      return (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border bg-red-500/10 border-red-500/20 text-red-400">
          <EyeOff className="w-3 h-3" />
          Hidden
        </div>
      );
    }
    switch (tool.status) {
      case 'published':
        return (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border bg-emerald-500/10 border-emerald-500/20 text-emerald-400">
            <CheckCircle2 className="w-3 h-3" />
            Published
          </div>
        );
      case 'scheduled':
        return (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border bg-yellow-500/10 border-yellow-500/20 text-yellow-400">
            <Clock className="w-3 h-3" />
            Scheduled
          </div>
        );
      default:
        return (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border bg-gray-500/10 border-gray-500/20 text-gray-400">
            <Settings className="w-3 h-3" />
            Draft
          </div>
        );
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#030712] py-24 font-sans text-gray-200">
      <div className="container mx-auto px-4 max-w-7xl">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black tracking-widest mb-4">
              <Settings className="w-3.5 h-3.5" />
              ADMIN DASHBOARD
            </div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white mb-2 uppercase leading-none">
              Tools <span className="text-blue-500">Registry</span>
            </h1>
            <p className="text-sm text-gray-500 font-medium max-w-xl">
              Manage visibility, publish status, and promotional badges. All changes sync to Supabase in real time.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => loadTools()}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400 border border-white/10 hover:border-white/20 rounded-2xl transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={handleSeedCatalog}
              disabled={seeding}
              className="flex items-center gap-2 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-amber-400 border border-amber-500/20 hover:bg-amber-500/10 rounded-2xl transition-all disabled:opacity-50"
            >
              <Database className={`w-4 h-4 ${seeding ? 'animate-pulse' : ''}`} />
              Sync Catalog
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-white bg-blue-600 hover:bg-blue-500 rounded-2xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)]"
            >
              <Plus className="w-4 h-4" />
              Add Tool
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-center shadow-xl">
            <div className="text-3xl font-black text-white">{tools.length}</div>
            <div className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mt-1">Total Tools</div>
          </div>
          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl px-6 py-5 text-center shadow-xl">
            <div className="text-3xl font-black text-emerald-400">{tools.filter(t => isToolLive(t)).length}</div>
            <div className="text-[10px] uppercase tracking-widest text-emerald-500/70 font-bold mt-1">Live Tools</div>
          </div>
          <div className="bg-red-500/5 border border-red-500/20 rounded-2xl px-6 py-5 text-center shadow-xl">
            <div className="text-3xl font-black text-red-400">{tools.filter(t => !t.isVisible).length}</div>
            <div className="text-[10px] uppercase tracking-widest text-red-500/70 font-bold mt-1">Hidden Tools</div>
          </div>
          <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-2xl px-6 py-5 text-center shadow-xl">
            <div className="text-3xl font-black text-yellow-400">{tools.filter(t => t.status === 'scheduled').length}</div>
            <div className="text-[10px] uppercase tracking-widest text-yellow-500/70 font-bold mt-1">Scheduled Tools</div>
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
            {(["All", "Published", "Draft", "Scheduled", "Hidden"] as FilterType[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
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

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">
              Loading tools from Supabase...
            </span>
          </div>
        )}

        {/* Table */}
        {!loading && (
          <div className="glass rounded-3xl border border-white/5 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/[0.02] border-b border-white/5 text-[10px] uppercase tracking-widest text-gray-500 font-black">
                    <th className="py-4 px-6">Tool Details</th>
                    <th className="py-4 px-6 text-center">Status</th>
                    <th className="py-4 px-6 text-center">Visibility</th>
                    <th className="py-4 px-6 text-center">Promotions</th>
                    <th className="py-4 px-6 text-center">Schedule Date</th>
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
                        key={tool.slug}
                        className={`border-b border-white/[0.02] hover:bg-white/[0.01] transition-colors ${
                          !isToolLive(tool) ? 'opacity-60 grayscale hover:grayscale-0' : ''
                        } ${saving === tool.slug ? 'pointer-events-none opacity-50' : ''}`}
                      >
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-lg shadow-inner">
                              {tool.icon}
                            </div>
                            <div>
                              <div className="font-bold text-white text-sm flex items-center gap-2 flex-wrap">
                                {tool.title}
                                {isToolLive(tool) && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                                )}
                              </div>
                              <div className="text-[10px] font-medium text-gray-500 mt-0.5 flex gap-2">
                                <span>{tool.category}</span>
                                <span className="text-white/20">•</span>
                                <span className="font-mono">{tool.href}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-6 text-center">{getStatusBadge(tool)}</td>

                        <td className="py-4 px-6 text-center">
                          <button
                            onClick={() => handleToggleVisibility(tool)}
                            disabled={saving === tool.slug}
                            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                              tool.isVisible ? 'bg-blue-600' : 'bg-gray-800'
                            }`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                tool.isVisible ? 'translate-x-5' : 'translate-x-0'
                              }`}
                            />
                          </button>
                        </td>

                        <td className="py-4 px-6">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              title="Featured"
                              onClick={() => handleUpdate(tool, { featured: !tool.featured })}
                              disabled={saving === tool.slug}
                              className={`p-2 rounded-lg border transition-all ${tool.featured ? 'bg-purple-500/10 border-purple-500/30 text-purple-400' : 'bg-white/5 border-transparent text-gray-600 hover:text-gray-400'}`}
                            >
                              <Star className="w-4 h-4" />
                            </button>
                            <button
                              title="Trending"
                              onClick={() => handleUpdate(tool, { trending: !tool.trending })}
                              disabled={saving === tool.slug}
                              className={`p-2 rounded-lg border transition-all ${tool.trending ? 'bg-orange-500/10 border-orange-500/30 text-orange-400' : 'bg-white/5 border-transparent text-gray-600 hover:text-gray-400'}`}
                            >
                              <TrendingUp className="w-4 h-4" />
                            </button>
                            <button
                              title="Popular"
                              onClick={() => handleUpdate(tool, { popular: !tool.popular })}
                              disabled={saving === tool.slug}
                              className={`p-2 rounded-lg border transition-all ${tool.popular ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' : 'bg-white/5 border-transparent text-gray-600 hover:text-gray-400'}`}
                            >
                              <Zap className="w-4 h-4" />
                            </button>
                          </div>
                        </td>

                        <td className="py-4 px-6 text-center">
                          {tool.publishDate ? (
                            <button
                              onClick={() => setActiveScheduleTool(tool)}
                              disabled={saving === tool.slug}
                              className="inline-flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-xl border border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/10 text-blue-400 font-medium transition-all group/sched"
                            >
                              <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider">
                                <Clock className="w-2.5 h-2.5 group-hover/sched:scale-110 transition-transform" />
                                {tool.status === 'scheduled' ? 'Scheduled' : 'Published'}
                              </div>
                              <span className="text-[10px] font-mono opacity-80">
                                {new Date(tool.publishDate).toLocaleDateString(undefined, {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </span>
                              <span className="text-[9px] font-mono opacity-65">
                                {new Date(tool.publishDate).toLocaleTimeString(undefined, {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  hour12: true
                                })}
                              </span>
                            </button>
                          ) : (
                            <button
                              onClick={() => setActiveScheduleTool(tool)}
                              disabled={saving === tool.slug}
                              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/5 hover:border-white/20 text-gray-500 hover:text-gray-300 text-[10px] font-bold transition-all uppercase tracking-wider"
                            >
                              <Calendar className="w-3 h-3" />
                              Not Scheduled
                            </button>
                          )}
                        </td>

                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handlePublish(tool)}
                              disabled={saving === tool.slug}
                              className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg border transition-colors disabled:opacity-50 ${
                                tool.status === 'published' && tool.isVisible
                                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                  : 'bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-500/80 border-emerald-500/10'
                              }`}
                            >
                              Publish
                            </button>
                            <button
                              onClick={() => handleUnpublish(tool)}
                              disabled={saving === tool.slug}
                              className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg border transition-colors disabled:opacity-50 ${
                                tool.status === 'draft' && !tool.isVisible
                                  ? 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                                  : 'bg-gray-500/5 hover:bg-gray-500/10 text-gray-500/80 border-gray-500/10'
                              }`}
                            >
                              Unpublish
                            </button>
                            <button
                              onClick={() => setActiveScheduleTool(tool)}
                              disabled={saving === tool.slug}
                              className="p-1.5 bg-white/5 hover:bg-white/10 text-gray-400 rounded-lg border border-white/5 transition-colors disabled:opacity-50"
                              title="Schedule Publish"
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
        )}
      </div>

      {/* Add Tool Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg glass border border-white/10 rounded-[2rem] p-8 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-black text-white uppercase">Add New Tool</h2>
                <button onClick={() => setShowAddModal(false)} className="text-gray-500 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddTool} className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Title</label>
                  <input
                    value={newTitle}
                    onChange={(e) => {
                      setNewTitle(e.target.value);
                      if (!newSlug) setNewSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'));
                    }}
                    className="w-full mt-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-blue-500/50"
                    placeholder="AI Resume Builder"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Slug</label>
                  <input
                    value={newSlug}
                    onChange={(e) => setNewSlug(e.target.value)}
                    className="w-full mt-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-mono outline-none focus:border-blue-500/50"
                    placeholder="ai-resume-builder"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Description</label>
                  <textarea
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    className="w-full mt-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-blue-500/50 resize-none"
                    rows={3}
                    placeholder="Short tool description..."
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as Tool['category'])}
                    className="w-full mt-1 bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-blue-500/50"
                  >
                    {toolCategories.filter(c => c !== 'All').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <p className="text-[10px] text-gray-600 font-medium">
                  New tools default to <span className="text-gray-400">draft</span> and <span className="text-gray-400">hidden</span>.
                </p>
                <button
                  type="submit"
                  disabled={saving === 'new-tool'}
                  className="w-full flex items-center justify-center gap-2 py-4 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase tracking-widest rounded-2xl transition-all disabled:opacity-50"
                >
                  {saving === 'new-tool' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Save to Supabase
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Publish Scheduler Modal */}
      <AnimatePresence>
        {activeScheduleTool && (
          <PublishSchedulerModal
            tool={activeScheduleTool}
            onClose={() => setActiveScheduleTool(null)}
            onSchedule={async (publishDateISO) => {
              await handleUpdate(activeScheduleTool, {
                status: 'scheduled',
                publishDate: publishDateISO,
                isVisible: true
              });
              setActiveScheduleTool(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function PublishSchedulerModal({ 
  tool, 
  onClose, 
  onSchedule 
}: { 
  tool: Tool; 
  onClose: () => void; 
  onSchedule: (publishDateISO: string) => Promise<void>;
}) {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Set default values from tool's publishDate if present
  useEffect(() => {
    if (tool.publishDate) {
      const d = new Date(tool.publishDate);
      if (!isNaN(d.getTime())) {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const date = String(d.getDate()).padStart(2, '0');
        setSelectedDate(`${year}-${month}-${date}`);
        
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        setSelectedTime(`${hours}:${minutes}`);
        return;
      }
    }
    
    // Default to tomorrow 09:00 AM if not set
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const year = tomorrow.getFullYear();
    const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const date = String(tomorrow.getDate()).padStart(2, '0');
    setSelectedDate(`${year}-${month}-${date}`);
    setSelectedTime('09:00');
  }, [tool.publishDate]);

  // Keep clock running
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Timezone helpers
  const tzName = useMemo(() => {
    try {
      const parts = new Intl.DateTimeFormat(undefined, { timeZoneName: 'short' }).formatToParts(new Date());
      const tzPart = parts.find(p => p.type === 'timeZoneName');
      const shortName = tzPart ? tzPart.value : '';
      const fullName = Intl.DateTimeFormat().resolvedOptions().timeZone;
      return shortName ? `${shortName} (${fullName})` : fullName;
    } catch {
      return '';
    }
  }, []);

  // Format helper
  const formatDateTime = (date: Date) => {
    return date.toLocaleDateString(undefined, {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    }) + ' — ' + date.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Perform validation on the fly
  const validation = useMemo(() => {
    const now = new Date();
    
    // Edge case: Empty fields
    if (!selectedDate || !selectedTime) {
      return { isValid: false, error: 'Please select a date and time.' };
    }

    // Parse YYYY-MM-DD
    const dateParts = selectedDate.split('-');
    if (dateParts.length !== 3) {
      return { isValid: false, error: 'Invalid date format.' };
    }
    
    const year = parseInt(dateParts[0], 10);
    const month = parseInt(dateParts[1], 10) - 1;
    const day = parseInt(dateParts[2], 10);
    
    // Parse HH:MM
    const timeParts = selectedTime.split(':');
    if (timeParts.length !== 2) {
      return { isValid: false, error: 'Invalid time format.' };
    }
    
    const hours = parseInt(timeParts[0], 10);
    const minutes = parseInt(timeParts[1], 10);

    const scheduledDate = new Date(year, month, day, hours, minutes, 0, 0);

    if (isNaN(scheduledDate.getTime())) {
      return { isValid: false, error: 'Invalid date or time values.' };
    }

    // 1️⃣ Date Validation: Check if selected date is before today
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const selectedDateStart = new Date(year, month, day, 0, 0, 0, 0);
    
    if (selectedDateStart.getTime() < todayStart.getTime()) {
      return { 
        isValid: false, 
        error: 'Past dates are not allowed for scheduled publishing.',
        toastError: 'Cannot publish in the past.'
      };
    }

    // 2️⃣ Time Validation: If date is today, check if time has already passed
    if (selectedDateStart.getTime() === todayStart.getTime()) {
      const selectedTimeMs = (hours * 60 + minutes) * 60 * 1000;
      const todayTimeMs = (now.getHours() * 60 + now.getMinutes()) * 60 * 1000 + now.getSeconds() * 1000;
      if (selectedTimeMs <= todayTimeMs) {
        return { 
          isValid: false, 
          error: 'Selected time has already passed.',
          toastError: 'Selected time has already expired.'
        };
      }
    }

    // 3️⃣ Full Timestamp Validation: scheduledDateTime <= currentDateTime
    if (scheduledDate.getTime() <= now.getTime()) {
      return { 
        isValid: false, 
        error: 'Please select a future date and time.',
        toastError: 'Selected time has already expired.'
      };
    }

    return { 
      isValid: true, 
      scheduledDate,
      error: null 
    };
  }, [selectedDate, selectedTime, currentTime]);

  const handleScheduleClick = () => {
    if (!validation.isValid) {
      const toastMsg = validation.toastError || validation.error || 'Please select a future date and time.';
      toast.error(toastMsg);
      return;
    }

    const isoStr = validation.scheduledDate!.toISOString();
    onSchedule(isoStr);
    toast.success('Tool scheduled successfully.');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md glass border border-white/10 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden bg-[#0d1321]/95 text-gray-200"
      >
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-[80px] pointer-events-none" />

        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-black text-white uppercase tracking-tight">Schedule Publication</h2>
            <p className="text-xs text-gray-500 font-bold uppercase mt-1 tracking-wider text-blue-400">{tool.title}</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* 1. Current system time display */}
          <div className="bg-white/5 border border-white/5 rounded-2xl p-4">
            <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              Current System Time
            </div>
            <div className="text-sm font-black text-white">
              {formatDateTime(currentTime)}
            </div>
            <div className="text-[9px] font-bold text-gray-600 uppercase tracking-wider mt-1">
              Timezone: <span className="text-gray-400">{tzName}</span>
            </div>
          </div>

          {/* 2. Pickers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Publish Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full bg-[#030712] border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-mono outline-none focus:border-blue-500/50 transition-colors"
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Publish Time</label>
              <input
                type="time"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="w-full bg-[#030712] border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-mono outline-none focus:border-blue-500/50 transition-colors"
              />
            </div>
          </div>

          {/* 3. Validation Feedback Area */}
          <div className="min-h-[70px] flex flex-col justify-center bg-black/30 border border-white/5 rounded-2xl p-4">
            {validation.error ? (
              <div className="text-red-400 font-bold text-xs leading-relaxed flex items-start gap-2 animate-fade-in">
                <span className="text-red-500 text-lg leading-none select-none">⚠️</span>
                <span>{validation.error}</span>
              </div>
            ) : (
              <div className="text-emerald-400 font-bold text-xs leading-relaxed flex items-start gap-2 animate-fade-in">
                <span className="text-emerald-500 text-lg leading-none select-none">📅</span>
                <div>
                  <div className="text-[9px] text-gray-500 uppercase tracking-widest mb-0.5 font-black">Live Scheduled Preview</div>
                  <div className="text-sm font-black text-emerald-400">
                    {validation.scheduledDate ? formatDateTime(validation.scheduledDate) : ''}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
            <button
              onClick={onClose}
              className="px-6 py-3.5 text-[10px] font-black uppercase tracking-widest text-gray-400 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all active:scale-95"
            >
              Cancel
            </button>
            <button
              onClick={handleScheduleClick}
              disabled={!validation.isValid}
              className={`px-8 py-3.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${
                validation.isValid
                  ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)] cursor-pointer active:scale-95'
                  : 'bg-white/5 text-gray-600 border border-transparent cursor-not-allowed opacity-40'
              }`}
            >
              Schedule Publish
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

