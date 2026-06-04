"use client";

import { useState, useEffect } from 'react';
import { 
  Plus, Search, Edit3, Trash2,
  FileText, Globe, CheckCircle2, AlertTriangle, Heading, RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface ArticleItem {
  id: string;
  slug: string;
  title: string;
  content: string;
  published: boolean;
  createdAt: string;
  seoMetadata?: {
    title: string;
    description: string;
    keywords: string;
  } | null;
}

export default function BlogCMS() {
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingItem, setEditingItem] = useState<ArticleItem | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDesc, setSeoDesc] = useState('');
  const [seoKeywords, setSeoKeywords] = useState('');
  const [published, setPublished] = useState(false);

  const fetchBlogs = async () => {
    try {
      const res = await fetch('/api/admin/blogs');
      const data = await res.json();
      if (res.ok && data.success && data.blogs) {
        setArticles(data.blogs);
      }
    } catch (err) {
      console.error(err);
      toast.error('Could not fetch articles index.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const openAddModal = () => {
    setEditingItem(null);
    setTitle('');
    setSlug('');
    setContent('');
    setSeoTitle('');
    setSeoDesc('');
    setSeoKeywords('');
    setPublished(false);
    setIsEditing(true);
  };

  const openEditModal = (item: ArticleItem) => {
    setEditingItem(item);
    setTitle(item.title);
    setSlug(item.slug);
    setContent(item.content);
    setSeoTitle(item.seoMetadata?.title || '');
    setSeoDesc(item.seoMetadata?.description || '');
    setSeoKeywords(item.seoMetadata?.keywords || '');
    setPublished(item.published);
    setIsEditing(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !slug || !content) {
      toast.error('Title, slug, and content are required configurations.');
      return;
    }

    const payload = {
      title,
      slug,
      content,
      published,
      seoMetadata: {
        title: seoTitle,
        description: seoDesc,
        keywords: seoKeywords
      }
    };

    try {
      const url = editingItem ? `/api/admin/blogs/${editingItem.id}` : '/api/admin/blogs';
      const method = editingItem ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(editingItem ? 'Blog post updated successfully.' : 'New blog post published!');
        setIsEditing(false);
        fetchBlogs();
      } else {
        toast.error(data.error || 'Failed to save blog post.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to communicate configuration updates.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this blog post?')) return;
    try {
      const res = await fetch(`/api/admin/blogs/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success('Blog post deleted.');
        fetchBlogs();
      } else {
        toast.error(data.error || 'Failed to delete blog.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Network execution failure.');
    }
  };

  const togglePublishedDirect = async (item: ArticleItem) => {
    try {
      const res = await fetch(`/api/admin/blogs/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...item,
          published: !item.published
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success('Toggled article visibility.');
        fetchBlogs();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredArticles = articles.filter(a => 
    a.title.toLowerCase().includes(search.toLowerCase()) || 
    a.slug.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
        <span className="text-xs font-black uppercase tracking-widest text-gray-500 animate-pulse">Loading Blog Articles...</span>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      
      {/* Search and Add bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 glass p-6 rounded-3xl border border-white/5 bg-white/[0.01]">
        <div className="flex items-center gap-3 bg-white/[0.02] border border-white/5 rounded-2xl px-5 py-3 w-full sm:w-80 focus-within:border-blue-500/50 transition-all">
          <Search className="w-4 h-4 text-gray-500" />
          <input 
            type="text" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search articles..."
            className="bg-transparent text-sm border-none outline-none text-white w-full placeholder-gray-600 font-semibold"
          />
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-5 py-3.5 text-xs font-black uppercase tracking-widest text-white bg-blue-600 hover:bg-blue-500 rounded-2xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Draft New Article
        </button>
      </div>

      {/* Main Articles List */}
      <div className="glass rounded-3xl border border-white/5 bg-white/[0.01] shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-white/5 text-[10px] font-black uppercase tracking-widest text-gray-500">
                <th className="py-5 pl-6">Blog Post</th>
                <th className="py-5">SEO Title / Indexing</th>
                <th className="py-5">Published</th>
                <th className="py-5">Created Date</th>
                <th className="py-5 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs">
              {filteredArticles.map((a) => (
                <tr key={a.id} className="hover:bg-white/[0.01] transition-colors">
                  <td className="py-5 pl-6">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-black text-white block">{a.title}</span>
                        <span className="text-[10px] text-gray-500 font-bold block mt-0.5">Route: /blog/{a.slug}</span>
                      </div>
                    </div>
                  </td>

                  <td className="py-5">
                    <div className="max-w-xs truncate font-semibold text-gray-400" title={a.seoMetadata?.title || a.title}>
                      {a.seoMetadata?.title || <span className="text-gray-600 font-bold italic">No custom SEO title set</span>}
                    </div>
                  </td>

                  <td className="py-5">
                    <button
                      onClick={() => togglePublishedDirect(a)}
                      className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                        a.published 
                          ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400' 
                          : 'border-white/5 bg-white/[0.01] text-gray-500 hover:text-white'
                      }`}
                    >
                      {a.published ? (
                        <>
                          <Globe className="w-3 h-3 text-emerald-400" /> Public
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-3 h-3 text-gray-500" /> Draft
                        </>
                      )}
                    </button>
                  </td>

                  <td className="py-5 text-gray-500 font-bold">
                    {new Date(a.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </td>

                  <td className="py-5 pr-6 text-right space-x-2">
                    <button
                      onClick={() => openEditModal(a)}
                      className="p-2.5 border border-white/5 hover:border-blue-500/30 rounded-xl bg-white/[0.01] hover:bg-blue-600/10 text-gray-500 hover:text-blue-400 active:scale-95 transition-all inline-flex items-center justify-center cursor-pointer"
                      title="Edit Article"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(a.id)}
                      className="p-2.5 border border-white/5 hover:border-red-500/30 rounded-xl bg-white/[0.01] hover:bg-red-500/10 text-gray-500 hover:text-red-400 active:scale-95 transition-all inline-flex items-center justify-center cursor-pointer"
                      title="Delete Article"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Editor Modal */}
      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-2xl glass border border-white/10 p-8 rounded-[2rem] shadow-2xl relative max-h-[90vh] overflow-y-auto"
            >
              <h3 className="text-lg font-black text-white uppercase tracking-widest mb-6">
                {editingItem ? 'Edit Blog Article' : 'Draft New Blog Article'}
              </h3>

              <form onSubmit={handleSave} className="space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Article Title</label>
                    <input 
                      type="text" 
                      value={title}
                      onChange={(e) => {
                        setTitle(e.target.value);
                        if (!editingItem) setSlug(e.target.value.toLowerCase().replace(/ /g, '-').replace(/[^\w-]/g, ''));
                      }}
                      placeholder="e.g. Navigating AI Integrations"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-sm font-bold text-white outline-none focus:border-blue-500/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Article Slug</label>
                    <input 
                      type="text" 
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      placeholder="e.g. navigating-ai-integrations"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-sm font-bold text-white outline-none focus:border-blue-500/50 font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Post Content</label>
                  <textarea 
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Write article content here..."
                    rows={8}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-sm font-medium text-white outline-none focus:border-blue-500/50 resize-none font-sans"
                  />
                </div>

                {/* SEO Sub-panel */}
                <div className="p-5 border border-white/5 rounded-2xl bg-white/[0.01] space-y-4">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500 flex items-center gap-2">
                    <Heading className="w-3.5 h-3.5" /> SEO Metadata Engine
                  </span>
                  
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">SEO Meta Title</label>
                      <input 
                        type="text" 
                        value={seoTitle}
                        onChange={(e) => setSeoTitle(e.target.value)}
                        placeholder="Google Search title bar content..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs font-bold text-white outline-none focus:border-blue-500/50"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">SEO Meta Description</label>
                      <textarea 
                        value={seoDesc}
                        onChange={(e) => setSeoDesc(e.target.value)}
                        placeholder="150 character search snippet snippet..."
                        rows={2}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-xs font-semibold text-white outline-none focus:border-blue-500/50 resize-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">SEO Keywords</label>
                      <input 
                        type="text" 
                        value={seoKeywords}
                        onChange={(e) => setSeoKeywords(e.target.value)}
                        placeholder="e.g. automation, security, local model"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs font-bold text-white outline-none focus:border-blue-500/50"
                      />
                    </div>
                  </div>
                </div>

                {/* Publish Checkbox */}
                <label className="flex items-center gap-3 p-4 bg-white/[0.01] border border-white/5 rounded-2xl cursor-pointer hover:bg-white/[0.02]">
                  <input 
                    type="checkbox" 
                    checked={published} 
                    onChange={(e) => setPublished(e.target.checked)} 
                    className="rounded text-blue-500 h-4 w-4 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-black text-white block">Publish Immediately</span>
                    <span className="text-[10px] text-gray-500 font-semibold mt-0.5">Toggle to index the article on your public sitemap routes.</span>
                  </div>
                </label>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="flex-1 py-4 text-xs font-black uppercase tracking-widest text-gray-400 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-4 text-xs font-black uppercase tracking-widest text-white bg-blue-600 hover:bg-blue-500 rounded-2xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.4)] cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
