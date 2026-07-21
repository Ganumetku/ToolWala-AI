"use client";

import { useState, useEffect } from "react";
import {
  Plus, Search, Edit3, Trash2, Globe,
  AlertTriangle, Heading, RefreshCw, X, Eye, Code,
  Star, Sparkles, BookOpen, Layers, Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { adminFetch } from "@/lib/admin-fetch";
import RichTextEditor from "@/components/blog/RichTextEditor";
import BlogSeoScore from "@/components/blog/BlogSeoScore";
import { generateSeoSlug, autoGenerateSeoMetadata } from "@/lib/blog-seo";
import type { BlogFaq } from "@/types/blog";

interface ArticleItem {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  thumbnail: string;
  category: string;
  tags: string[];
  featured: boolean;
  trending: boolean;
  status: "draft" | "published";
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
  readingTime: string;
  author: {
    name: string;
    avatar?: string;
    role?: string;
  };
  seoMetadata?: {
    title: string;
    description: string;
    keywords?: string;
  } | null;
  faqs: BlogFaq[];
  relatedToolSlugs: string[];
  viewCount: number;
}

const CATEGORIES = [
  "AI Tools",
  "PDF Tools",
  "Image Editing",
  "Productivity",
  "SEO",
  "Tutorials",
  "Online Utilities",
  "Document Tools",
];

const UNSPLASH_SUGGESTIONS = [
  { label: "AI Futuristic", url: "https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=800&q=80" },
  { label: "Tech Security", url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80" },
  { label: "Image Editing", url: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&w=800&q=80" },
  { label: "Code / WASM", url: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80" },
  { label: "Office / Productivity", url: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=800&q=80" }
];

export default function BlogCMS() {
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCatFilter, setSelectedCatFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingItem, setEditingItem] = useState<ArticleItem | null>(null);

  // Active Editor Modal Tab
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");

  // Form Fields
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("AI Tools");
  const [tagsInput, setTagsInput] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [featured, setFeatured] = useState(false);
  const [trending, setTrending] = useState(false);
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [faqs, setFaqs] = useState<BlogFaq[]>([]);
  const [relatedToolSlugsInput, setRelatedToolSlugsInput] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Only image files are allowed.');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Upload failed');
      }

      const data = await res.json();
      if (data.success && data.url) {
        setThumbnail(data.url);
        toast.success('Thumbnail uploaded successfully!');
      } else {
        throw new Error(data.error || 'Upload failed');
      }
    } catch (err: any) {
      console.error('Upload error:', err);
      toast.error(`Upload failed: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };
  
  // Author fields
  const [authorName, setAuthorName] = useState("ToolWala Editorial");
  const [authorAvatar, setAuthorAvatar] = useState("https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80");
  const [authorRole, setAuthorRole] = useState("Tech Writer");

  // SEO Fields
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDesc, setSeoDesc] = useState("");

  const fetchBlogs = async () => {
    try {
      const res = await adminFetch("/api/admin/blogs");
      const data = await res.json();
      if (res.ok && data.success && data.blogs) {
        setArticles(data.blogs);
      } else {
        toast.error(data.error || "Could not fetch articles index.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Could not fetch articles index.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  // Auto-generate SEO-friendly slug from title (new posts only)
  useEffect(() => {
    if (!editingItem && title) {
      setSlug(generateSeoSlug(title));
    }
  }, [title, editingItem]);

  const handleAutoFillSeo = () => {
    const tags = tagsInput.split(",").map((t) => t.trim()).filter(Boolean);
    const generated = autoGenerateSeoMetadata({ title, excerpt, tags, category });
    setSeoTitle(generated.title);
    setSeoDesc(generated.description);
    toast.success("SEO metadata auto-filled from title & excerpt.");
  };

  const draftForSeoScore = {
    title,
    slug,
    excerpt,
    content,
    thumbnail,
    tags: tagsInput.split(",").map((t) => t.trim()).filter(Boolean),
    category,
    faqs,
    seoMetadata: { title: seoTitle, description: seoDesc, keywords: tagsInput },
    status,
  };

  const openAddModal = () => {
    setEditingItem(null);
    setTitle("");
    setSlug("");
    setExcerpt("");
    setContent("");
    setCategory("AI Tools");
    setTagsInput("");
    setThumbnail(UNSPLASH_SUGGESTIONS[0].url);
    setFeatured(false);
    setTrending(false);
    setStatus("draft");
    setFaqs([]);
    setRelatedToolSlugsInput("");
    setAuthorName("ToolWala Editorial");
    setAuthorAvatar("https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80");
    setAuthorRole("Tech Writer");
    setSeoTitle("");
    setSeoDesc("");
    setActiveTab("write");
    setIsEditing(true);
  };

  const openEditModal = (item: ArticleItem) => {
    setEditingItem(item);
    setTitle(item.title);
    setSlug(item.slug);
    setExcerpt(item.excerpt || "");
    setContent(item.content || "");
    setCategory(item.category || "AI Tools");
    setTagsInput(item.tags ? item.tags.join(", ") : "");
    setThumbnail(item.thumbnail || UNSPLASH_SUGGESTIONS[0].url);
    setFeatured(item.featured || false);
    setTrending(item.trending || false);
    setStatus(item.status || "draft");
    setFaqs(item.faqs || []);
    setRelatedToolSlugsInput(item.relatedToolSlugs?.join(", ") || "");
    setAuthorName(item.author?.name || "ToolWala Editorial");
    setAuthorAvatar(item.author?.avatar || "");
    setAuthorRole(item.author?.role || "Tech Writer");
    setSeoTitle(item.seoMetadata?.title || "");
    setSeoDesc(item.seoMetadata?.description || "");
    setActiveTab("write");
    setIsEditing(true);
  };

  const addFaq = () => {
    setFaqs((prev) => [
      ...prev,
      { id: crypto.randomUUID(), question: "", answer: "", order: prev.length },
    ]);
  };

  const updateFaq = (id: string, field: "question" | "answer", value: string) => {
    setFaqs((prev) => prev.map((f) => (f.id === id ? { ...f, [field]: value } : f)));
  };

  const removeFaq = (id: string) => {
    setFaqs((prev) => prev.filter((f) => f.id !== id));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !slug || !content || !excerpt) {
      toast.error("Title, slug, excerpt, and content are required.");
      return;
    }

    setSaving(true);

    // Estimate Reading Time (avg 200 wpm)
    const wordCount = content.split(/\s+/).filter(Boolean).length;
    const minutes = Math.max(1, Math.ceil(wordCount / 200));
    const readingTime = `${minutes} min read`;

    // Process Tags
    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const relatedToolSlugs = relatedToolSlugsInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const payload = {
      title,
      slug,
      excerpt,
      content,
      thumbnail,
      category,
      tags,
      featured,
      trending,
      status,
      publishedAt: status === "published" ? new Date().toISOString() : "",
      readingTime,
      author: {
        name: authorName,
        avatar: authorAvatar,
        role: authorRole,
      },
      faqs: faqs.filter((f) => f.question && f.answer),
      relatedToolSlugs,
      seoMetadata: {
        title: seoTitle || title,
        description: seoDesc || excerpt,
        keywords: tags.join(", "),
      },
    };

    try {
      const url = editingItem ? `/api/admin/blogs/${editingItem.id}` : "/api/admin/blogs";
      const method = editingItem ? "PUT" : "POST";

      const res = await adminFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(editingItem ? "Blog post updated." : "New blog post drafted!");
        setIsEditing(false);
        fetchBlogs();
      } else {
        toast.error(data.error || "Failed to save post.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network communication failure.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this blog article?")) return;
    try {
      const res = await adminFetch(`/api/admin/blogs/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Blog article deleted successfully.");
        fetchBlogs();
      } else {
        toast.error(data.error || "Failed to delete.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete article.");
    }
  };

  const toggleFeaturedDirect = async (item: ArticleItem) => {
    try {
      const res = await adminFetch(`/api/admin/blogs/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...item,
          featured: !item.featured,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Updated featured status.");
        fetchBlogs();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const togglePublishedDirect = async (item: ArticleItem) => {
    const nextStatus = item.status === "published" ? "draft" : "published";
    try {
      const res = await adminFetch(`/api/admin/blogs/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...item,
          status: nextStatus,
          published: nextStatus === "published",
          publishedAt: nextStatus === "published" ? new Date().toISOString() : "",
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(`Post is now ${nextStatus}.`);
        fetchBlogs();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredArticles = articles.filter((a) => {
    const matchesSearch =
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.slug.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      selectedCatFilter === "All" || a.category === selectedCatFilter;

    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
        <span className="text-xs font-black uppercase tracking-widest text-gray-500 animate-pulse">
          Loading Blog Articles...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-8 select-none">
      {/* Search and Category Filter triggers */}
      <div className="flex flex-col xl:flex-row items-center justify-between gap-6 bg-white dark:bg-white/[0.01] p-6 rounded-3xl border border-slate-200/80 dark:border-white/5 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full xl:w-auto">
          {/* Search */}
          <div className="flex items-center gap-3 bg-slate-100/80 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/5 rounded-2xl px-5 py-3 w-full sm:w-80 focus-within:border-blue-500 transition-all">
            <Search className="w-4 h-4 text-slate-400 dark:text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title..."
              className="bg-transparent text-sm border-none outline-none text-slate-900 dark:text-white w-full placeholder-slate-400 dark:placeholder-gray-600 font-semibold"
            />
          </div>

          {/* Category drop filter */}
          <select
            value={selectedCatFilter}
            onChange={(e) => setSelectedCatFilter(e.target.value)}
            className="bg-slate-100/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-3 text-xs font-black uppercase tracking-widest outline-none text-slate-900 dark:text-white w-full sm:w-48 cursor-pointer"
          >
            <option value="All" className="bg-white text-slate-900 dark:bg-slate-950 dark:text-white">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c} className="bg-white text-slate-900 dark:bg-slate-950 dark:text-white">
                {c}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-6 py-4 text-xs font-black uppercase tracking-widest text-white bg-blue-600 hover:bg-blue-700 rounded-2xl transition-all shadow-md shadow-blue-500/20 cursor-pointer shrink-0 w-full xl:w-auto justify-center"
        >
          <Plus className="w-4 h-4" /> Composer Editor
        </button>
      </div>

      {/* Grid listing items */}
      <div className="bg-white dark:bg-white/[0.01] rounded-[2rem] border border-slate-200/80 dark:border-white/5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-transparent border-b border-slate-200 dark:border-white/5 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-gray-500">
                <th className="py-5 pl-6">Cover</th>
                <th className="py-5">Title / URL</th>
                <th className="py-5">Category</th>
                <th className="py-5 text-center">Featured</th>
                <th className="py-5">Status</th>
                <th className="py-5">Published At</th>
                <th className="py-5 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-xs font-semibold">
              {filteredArticles.length > 0 ? (
                filteredArticles.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50/80 dark:hover:bg-white/[0.01] transition-colors">
                    {/* Thumbnail */}
                    <td className="py-4 pl-6">
                      <div className="h-12 w-20 rounded-lg overflow-hidden border border-slate-200 dark:border-white/10 relative shrink-0">
                        {a.thumbnail ? (
                          <img src={a.thumbnail} alt="" className="absolute inset-0 w-full h-full object-cover" />
                        ) : (
                          <div className="absolute inset-0 bg-slate-100 dark:bg-white/5 flex items-center justify-center">
                            <BookOpen className="w-4 h-4 text-slate-400 dark:text-gray-600" />
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Title */}
                    <td className="py-4">
                      <div className="max-w-xs truncate">
                        <span className="font-black text-slate-900 dark:text-white block truncate">{a.title}</span>
                        <span className="text-[10px] text-slate-400 dark:text-gray-500 font-mono block mt-0.5 truncate">/blog/{a.slug}</span>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-4">
                      <span className="px-2 py-1 rounded bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-[9px] font-black uppercase tracking-widest text-blue-700 dark:text-blue-400">
                        {a.category}
                      </span>
                    </td>

                    {/* Featured toggle */}
                    <td className="py-4 text-center">
                      <button
                        onClick={() => toggleFeaturedDirect(a)}
                        className={`p-2 rounded-xl border transition-all cursor-pointer inline-flex items-center justify-center ${
                          a.featured
                            ? "bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20 text-amber-700 dark:text-amber-400"
                            : "bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-transparent text-slate-400 dark:text-gray-600 hover:text-slate-900 dark:hover:text-white"
                        }`}
                      >
                        <Star className="w-4 h-4" />
                      </button>
                    </td>

                    {/* Status */}
                    <td className="py-4">
                      <button
                        onClick={() => togglePublishedDirect(a)}
                        className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                          a.status === "published"
                            ? "border-emerald-200 dark:border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                            : "border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/[0.01] text-slate-500 dark:text-gray-500 hover:text-slate-900 dark:hover:text-white"
                        }`}
                      >
                        {a.status === "published" ? (
                          <>
                            <Globe className="w-3 h-3" /> Live
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="w-3 h-3" /> Draft
                          </>
                        )}
                      </button>
                    </td>

                    {/* Published Date */}
                    <td className="py-4 text-slate-400 dark:text-gray-500 font-bold">
                      {a.status === "published" && a.publishedAt ? (
                        new Date(a.publishedAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      ) : (
                        <span className="italic text-slate-400 dark:text-gray-600">Not published</span>
                      )}
                    </td>

                    {/* Edit/Delete Actions */}
                    <td className="py-4 pr-6 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(a)}
                        className="p-2.5 border border-slate-200 dark:border-white/5 hover:border-blue-300 dark:hover:border-blue-500/30 rounded-xl bg-slate-50 dark:bg-white/[0.01] hover:bg-blue-50 dark:hover:bg-blue-600/10 text-slate-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 active:scale-95 transition-all inline-flex items-center justify-center cursor-pointer"
                        title="Edit Article"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(a.id)}
                        className="p-2.5 border border-slate-200 dark:border-white/5 hover:border-red-300 dark:hover:border-red-500/30 rounded-xl bg-slate-50 dark:bg-white/[0.01] hover:bg-red-50 dark:hover:bg-red-500/10 text-slate-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 active:scale-95 transition-all inline-flex items-center justify-center cursor-pointer"
                        title="Delete Article"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 dark:text-gray-500">
                    <BookOpen className="w-8 h-8 text-slate-300 dark:text-gray-700 mx-auto mb-3" />
                    <span>No blog articles found. Create your first post!</span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Large Composer Modal Drawer */}
      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, x: "100%" }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 200 }}
              className="w-full max-w-5xl h-screen bg-white dark:bg-gray-950 border-l border-slate-200 dark:border-white/10 flex flex-col justify-between text-slate-900 dark:text-gray-200"
            >
              {/* Modal Header */}
              <div className="h-20 px-8 border-b border-slate-200 dark:border-white/5 flex items-center justify-between bg-slate-50/80 dark:bg-gray-900/50">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-blue-50 dark:bg-blue-600/10 border border-blue-200 dark:border-blue-500/20 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center">
                    <Sparkles className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest leading-none">
                      {editingItem ? "Modify Article" : "Compose Article"}
                    </h3>
                    <span className="text-[10px] text-slate-400 dark:text-gray-500 font-bold block mt-1">
                      ToolWala premium editor canvas
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {/* Tabs Selector */}
                  <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-xl border border-slate-200 dark:border-white/5">
                    <button
                      onClick={() => setActiveTab("write")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest cursor-pointer transition-all ${
                        activeTab === "write" ? "bg-blue-600 text-white shadow-sm" : "text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      <Code className="w-3.5 h-3.5" /> Compose
                    </button>
                    <button
                      onClick={() => setActiveTab("preview")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest cursor-pointer transition-all ${
                        activeTab === "preview" ? "bg-blue-600 text-white shadow-sm" : "text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      <Eye className="w-3.5 h-3.5" /> Preview
                    </button>
                  </div>

                  <button
                    onClick={() => setIsEditing(false)}
                    className="p-2 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10 rounded-xl hover:bg-slate-200 dark:hover:bg-white/10 text-slate-400 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Modal Core Contents */}
              <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50 dark:bg-[#030712] relative">
                {activeTab === "write" ? (
                  <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Forms Inputs Column */}
                    <div className="lg:col-span-8 space-y-6">
                      {/* Title & Slug */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[9px] font-black text-slate-500 dark:text-gray-500 uppercase tracking-widest">
                            Article Title
                          </label>
                          <input
                            type="text"
                            required
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. Mastering Browser WebGPU"
                            className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-blue-500"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-[9px] font-black text-slate-500 dark:text-gray-500 uppercase tracking-widest">
                            Url Slug path
                          </label>
                          <input
                            type="text"
                            required
                            value={slug}
                            onChange={(e) => setSlug(e.target.value)}
                            placeholder="e.g. mastering-browser-webgpu"
                            className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-blue-500 font-mono"
                          />
                        </div>
                      </div>

                      {/* Excerpt */}
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-500 dark:text-gray-500 uppercase tracking-widest">
                          Article Excerpt (Short description card summary)
                        </label>
                        <textarea
                          required
                          value={excerpt}
                          onChange={(e) => setExcerpt(e.target.value)}
                          placeholder="Summarize the core focus of the article inside 2 lines..."
                          rows={2}
                          className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-5 text-sm font-semibold text-slate-900 dark:text-white outline-none focus:border-blue-500 resize-none font-sans"
                        />
                      </div>

                      {/* Rich Text Editor */}
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-500 dark:text-gray-500 uppercase tracking-widest">
                          Post Content (Rich Editor)
                        </label>
                        <RichTextEditor
                          value={content}
                          onChange={setContent}
                          placeholder="Compose your article with headings, lists, CTA blocks, and Try Tool buttons..."
                        />
                      </div>

                      {/* FAQ Schema Editor */}
                      <div className="space-y-3 p-5 border border-slate-200 dark:border-white/5 rounded-2xl bg-white dark:bg-white/[0.01]">
                        <div className="flex items-center justify-between">
                          <label className="text-[9px] font-black text-slate-500 dark:text-gray-500 uppercase tracking-widest">
                            FAQ Schema (SEO)
                          </label>
                          <button
                            type="button"
                            onClick={addFaq}
                            className="text-[9px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                          >
                            + Add FAQ
                          </button>
                        </div>
                        {faqs.map((faq) => (
                          <div key={faq.id} className="space-y-2 p-4 border border-slate-200 dark:border-white/5 rounded-xl bg-slate-50/50 dark:bg-transparent">
                            <input
                              type="text"
                              value={faq.question}
                              onChange={(e) => updateFaq(faq.id, "question", e.target.value)}
                              placeholder="Question"
                              className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-xs font-bold text-slate-900 dark:text-white outline-none"
                            />
                            <textarea
                              value={faq.answer}
                              onChange={(e) => updateFaq(faq.id, "answer", e.target.value)}
                              placeholder="Answer"
                              rows={2}
                              className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white outline-none resize-none"
                            />
                            <button
                              type="button"
                              onClick={() => removeFaq(faq.id)}
                              className="text-[9px] font-black uppercase text-red-600 dark:text-red-400 cursor-pointer"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Right Meta Settings Column */}
                    <div className="lg:col-span-4 space-y-6">
                      {/* Configuration Grid */}
                      <div className="bg-white dark:bg-white/[0.01] rounded-[2rem] border border-slate-200 dark:border-white/5 p-6 space-y-5 shadow-xs">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-500 flex items-center gap-2">
                          <Layers className="w-4 h-4" /> Taxonomy & Configs
                        </span>

                        <div className="space-y-4">
                          {/* Category select */}
                          <div className="space-y-1">
                            <label className="text-[9px] font-black text-slate-500 dark:text-gray-500 uppercase tracking-widest">
                              Category Tab
                            </label>
                            <select
                              value={category}
                              onChange={(e) => setCategory(e.target.value)}
                              className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-blue-500 cursor-pointer"
                            >
                              {CATEGORIES.map((c) => (
                                <option key={c} value={c} className="bg-white text-slate-900 dark:bg-slate-950 dark:text-white">
                                  {c}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Tags */}
                          <div className="space-y-1">
                            <label className="text-[9px] font-black text-slate-500 dark:text-gray-500 uppercase tracking-widest">
                              Tags (Comma separated)
                            </label>
                            <input
                              type="text"
                              value={tagsInput}
                              onChange={(e) => setTagsInput(e.target.value)}
                              placeholder="e.g. security, WASM, performance"
                              className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-blue-500"
                            />
                          </div>

                          {/* Thumbnail */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <label className="text-[9px] font-black text-slate-500 dark:text-gray-500 uppercase tracking-widest">
                                Thumbnail Image URL
                              </label>
                              <div className="relative">
                                <input
                                  type="file"
                                  id="thumbnail-upload"
                                  accept="image/*"
                                  onChange={handleThumbnailUpload}
                                  className="hidden"
                                  disabled={uploading}
                                />
                                <label
                                  htmlFor="thumbnail-upload"
                                  className={`flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 dark:border-white/10 rounded-lg text-[9px] font-black uppercase tracking-wider text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-all cursor-pointer ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
                                >
                                  {uploading ? (
                                    <>
                                      <Loader2 className="w-3 h-3 animate-spin" />
                                      Uploading...
                                    </>
                                  ) : (
                                    <>
                                      <Plus className="w-3 h-3" />
                                      Upload Image
                                    </>
                                  )}
                                </label>
                              </div>
                            </div>
                            <input
                              type="text"
                              value={thumbnail}
                              onChange={(e) => setThumbnail(e.target.value)}
                              placeholder="Unsplash URL, local path, or upload a new one..."
                              className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-blue-500 font-mono"
                            />
                            
                            {/* suggestions */}
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {UNSPLASH_SUGGESTIONS.map((preset) => (
                                <button
                                  key={preset.label}
                                  type="button"
                                  onClick={() => setThumbnail(preset.url)}
                                  className={`px-2 py-1 border rounded text-[8px] font-black uppercase tracking-wider transition-colors cursor-pointer ${
                                    thumbnail === preset.url
                                      ? "border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-600/10"
                                      : "border-slate-200 dark:border-white/5 text-slate-400 dark:text-gray-500 hover:text-slate-900 dark:hover:text-white"
                                  }`}
                                >
                                  {preset.label}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Author details block */}
                          <div className="p-4 border border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.01] rounded-2xl space-y-3">
                            <span className="text-[8px] font-black uppercase tracking-wider text-slate-400 dark:text-gray-400">
                              Author Bio
                            </span>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <label className="text-[8px] font-bold text-slate-400 dark:text-gray-600 uppercase">Name</label>
                                <input
                                  type="text"
                                  value={authorName}
                                  onChange={(e) => setAuthorName(e.target.value)}
                                  className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg p-2 text-[10px] font-bold text-slate-900 dark:text-white outline-none"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[8px] font-bold text-slate-400 dark:text-gray-600 uppercase">Role</label>
                                <input
                                  type="text"
                                  value={authorRole}
                                  onChange={(e) => setAuthorRole(e.target.value)}
                                  className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg p-2 text-[10px] font-bold text-slate-900 dark:text-white outline-none"
                                />
                              </div>
                            </div>
                            <div className="space-y-1">
                              <label className="text-[8px] font-bold text-slate-400 dark:text-gray-600 uppercase">Avatar URL</label>
                              <input
                                type="text"
                                value={authorAvatar}
                                onChange={(e) => setAuthorAvatar(e.target.value)}
                                className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg p-2 text-[9px] font-bold text-slate-900 dark:text-white outline-none font-mono"
                              />
                            </div>
                          </div>

                          {/* Related tools override */}
                          <div className="space-y-1">
                            <label className="text-[9px] font-black text-slate-500 dark:text-gray-500 uppercase tracking-widest">
                              Related Tool Slugs (auto if empty)
                            </label>
                            <input
                              type="text"
                              value={relatedToolSlugsInput}
                              onChange={(e) => setRelatedToolSlugsInput(e.target.value)}
                              placeholder="pdf-ocr, image-compressor"
                              className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-blue-500 font-mono"
                            />
                          </div>

                          {/* Toggles */}
                          <div className="flex gap-4 flex-wrap">
                            <label className="flex-1 flex items-center gap-2.5 p-3 bg-white dark:bg-white/[0.01] border border-slate-200 dark:border-white/5 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-white/[0.02] min-w-[120px]">
                              <input
                                type="checkbox"
                                checked={featured}
                                onChange={(e) => setFeatured(e.target.checked)}
                                className="rounded text-blue-600 h-4 w-4 cursor-pointer"
                              />
                              <span className="text-[10px] font-black uppercase text-slate-900 dark:text-white">Featured</span>
                            </label>

                            <label className="flex-1 flex items-center gap-2.5 p-3 bg-white dark:bg-white/[0.01] border border-slate-200 dark:border-white/5 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-white/[0.02] min-w-[120px]">
                              <input
                                type="checkbox"
                                checked={trending}
                                onChange={(e) => setTrending(e.target.checked)}
                                className="rounded text-purple-600 h-4 w-4 cursor-pointer"
                              />
                              <span className="text-[10px] font-black uppercase text-slate-900 dark:text-white">Trending</span>
                            </label>

                            <div className="flex-1 flex flex-col justify-center min-w-[120px]">
                              <label className="text-[8px] font-bold text-slate-400 dark:text-gray-600 uppercase mb-1">State</label>
                              <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value as any)}
                                className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg px-2 py-1.5 text-[10px] font-bold text-slate-900 dark:text-white outline-none cursor-pointer"
                              >
                                <option value="draft" className="bg-white text-slate-900 dark:bg-slate-950 dark:text-white">Draft</option>
                                <option value="published" className="bg-white text-slate-900 dark:bg-slate-950 dark:text-white">Published</option>
                              </select>
                            </div>
                          </div>

                        </div>
                      </div>

                      {/* SEO Score & Meta Engine */}
                      <BlogSeoScore blog={draftForSeoScore} />

                      <div className="bg-white dark:bg-white/[0.01] rounded-[2rem] border border-slate-200 dark:border-white/5 p-6 space-y-4 shadow-xs">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-500 flex items-center gap-2">
                            <Heading className="w-4 h-4" /> SEO Metadata
                          </span>
                          <button
                            type="button"
                            onClick={handleAutoFillSeo}
                            className="text-[9px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                          >
                            Auto-fill
                          </button>
                        </div>

                        <div className="space-y-3">
                          <div className="space-y-1">
                            <label className="text-[8px] font-bold uppercase text-slate-400 dark:text-gray-500">
                              Meta Title ({seoTitle.length}/60)
                            </label>
                            <input
                              type="text"
                              value={seoTitle}
                              onChange={(e) => setSeoTitle(e.target.value)}
                              placeholder={title || "Google search title..."}
                              className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-blue-500"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[8px] font-bold uppercase text-slate-400 dark:text-gray-500">
                              Meta Description ({seoDesc.length}/160)
                            </label>
                            <textarea
                              value={seoDesc}
                              onChange={(e) => setSeoDesc(e.target.value)}
                              placeholder={excerpt || "SERP snippet description..."}
                              rows={2.5}
                              className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-4 text-xs font-semibold text-slate-900 dark:text-white outline-none focus:border-blue-500 resize-none font-sans"
                            />
                          </div>

                          <p className="text-[9px] text-slate-400 dark:text-gray-600 font-mono break-all">
                            Canonical: /blog/{slug || "your-slug"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </form>
                ) : (
                  /* Live Preview Canvas layout simulator */
                  <div className="max-w-3xl mx-auto space-y-8 py-8 animate-fade-in">
                    {/* Featured Image */}
                    {thumbnail && (
                      <div className="w-full aspect-[21/9] rounded-[2rem] overflow-hidden border border-slate-200 dark:border-white/5 relative shadow-md">
                        <img src={thumbnail} alt="" className="absolute inset-0 w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 dark:from-gray-950/80 via-transparent" />
                      </div>
                    )}

                    <div className="bg-white dark:bg-white/[0.01] rounded-[2rem] p-8 sm:p-12 border border-slate-200 dark:border-white/5 shadow-md">
                      {/* Meta layout details */}
                      <header className="border-b border-slate-200 dark:border-white/5 pb-6 mb-8 space-y-4">
                        <span className="px-3 py-1 rounded bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-[10px] font-black uppercase tracking-widest text-blue-700 dark:text-blue-400 inline-block">
                          {category}
                        </span>

                        <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-snug">
                          {title || "Untitled Article"}
                        </h2>

                        <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-gray-500 pt-2">
                          <div className="flex items-center gap-2">
                            {authorAvatar && (
                              <img src={authorAvatar} alt="" className="w-6 h-6 rounded-full border border-slate-200 dark:border-white/10" />
                            )}
                            <span className="text-slate-900 dark:text-white">{authorName} ({authorRole})</span>
                          </div>
                          <span>•</span>
                          <span>Just Now</span>
                          <span>•</span>
                          <span>Preview Mode</span>
                        </div>
                      </header>

                      {/* Rendered HTML content simulator */}
                      {content ? (
                        <div
                          className="prose dark:prose-invert max-w-none text-slate-700 dark:text-gray-300 text-sm font-medium leading-relaxed font-sans space-y-6"
                          dangerouslySetInnerHTML={{ __html: content }}
                        />
                      ) : (
                        <div className="text-center py-10 italic text-slate-400 dark:text-gray-600">
                          Empty content canvas. Start composing to preview.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer Controls */}
              {activeTab === "write" && (
                <div className="h-20 px-8 border-t border-slate-200 dark:border-white/5 bg-slate-50/80 dark:bg-gray-900/50 flex items-center justify-end gap-4">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    disabled={saving}
                    className="px-6 py-3.5 text-xs font-black uppercase tracking-widest text-slate-600 dark:text-gray-400 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl hover:bg-slate-200 dark:hover:bg-white/10 transition-all cursor-pointer disabled:opacity-50"
                  >
                    Close Canvas
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-8 py-3.5 text-xs font-black uppercase tracking-widest text-white bg-blue-600 hover:bg-blue-700 rounded-2xl transition-all shadow-md shadow-blue-500/20 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      editingItem ? "Save Modifications" : "Publish to DB"
                    )}
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
