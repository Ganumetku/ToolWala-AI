"use client";

import { useState, useEffect } from 'react';
import { 
  Plus, Search, Edit3, Trash2, Layers, 
  Sparkles, CheckCircle2, Bookmark, Flame, Globe,
  Settings2, HelpCircle, FileText, Upload, RefreshCw, Copy, Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import InputBuilder, { FormInputSchema } from '@/components/admin/InputBuilder';

// Importing CMS scheduling components
import ToolStatusBadge from '@/components/admin/ToolStatusBadge';
import PublishToggle from '@/components/admin/PublishToggle';
import ScheduleModal from '@/components/admin/ScheduleModal';
import ToolSchedulerCard from '@/components/admin/ToolSchedulerCard';

interface ToolCMSItem {
  id: string;
  slug: string;
  title: string;
  description: string;
  longDesc?: string | null;
  categoryName?: string;
  categorySlug?: string;
  isPopular: boolean;
  isFeatured: boolean;
  isTrending: boolean;
  published: boolean;
  isPublished?: boolean;
  publishDate?: string | null;
  status?: 'draft' | 'scheduled' | 'published' | 'archived';
  icon?: string | null;
  thumbnail?: string | null;
  toolType: string;
  promptTemplate?: string | null;
  ctaButtonText: string;
  inputs?: FormInputSchema[];
  faqs?: { question: string; answer: string; order: number }[];
  articles?: { title: string; content: string }[];
  seoMetadata?: { title: string; description: string; keywords: string } | null;
}

const CATEGORIES = [
  "Creative & Design",
  "Document & PDF",
  "AI Writing",
  "Career Studio",
  "Business Ops",
  "Developer Utilities"
];

const TOOL_TYPES = [
  "AI Text Tool",
  "AI Image Tool",
  "PDF Tool",
  "Resume Tool",
  "Utility Tool",
  "QR Tool",
  "Generator Tool",
  "Converter Tool",
  "OCR Tool",
  "API Based Tool",
  "Custom Tool"
];

export default function ContentCMS() {
  const [tools, setTools] = useState<ToolCMSItem[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingItem, setEditingItem] = useState<ToolCMSItem | null>(null);
  const [activeTab, setActiveTab] = useState<'general' | 'inputs' | 'engine' | 'seo' | 'faqs'>('general');
  const [currentFilterTab, setCurrentFilterTab] = useState<'all' | 'published' | 'scheduled' | 'drafts' | 'archived'>('all');

  // Scheduling Modal State
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [schedulingTool, setSchedulingTool] = useState<ToolCMSItem | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [longDesc, setLongDesc] = useState('');
  const [categoryName, setCategoryName] = useState(CATEGORIES[0]);
  const [toolType, setToolType] = useState(TOOL_TYPES[0]);
  const [icon, setIcon] = useState('🔧');
  const [thumbnail, setThumbnail] = useState('');
  
  const [isPopular, setIsPopular] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isTrending, setIsTrending] = useState(false);
  const [published, setPublished] = useState(false); // Legacy sync check
  const [status, setStatus] = useState<'draft' | 'scheduled' | 'published' | 'archived'>('draft');
  const [publishDate, setPublishDate] = useState<string | null>(null);

  // Form inputs schema builder state
  const [inputs, setInputs] = useState<FormInputSchema[]>([]);

  // AI execution engine state
  const [promptTemplate, setPromptTemplate] = useState('');
  const [ctaButtonText, setCtaButtonText] = useState('Generate');
  const [apiType, setApiType] = useState('openai'); // openai, gemini, claude, custom

  // FAQ block state list
  const [faqs, setFaqs] = useState<{ question: string; answer: string; order: number }[]>([]);

  // Article state
  const [articleTitle, setArticleTitle] = useState('');
  const [articleContent, setArticleContent] = useState('');

  // SEO state
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDesc, setSeoDesc] = useState('');
  const [seoKeywords, setSeoKeywords] = useState('');

  // Fetch tools list on mount
  const fetchTools = async () => {
    try {
      const res = await fetch('/api/admin/tools');
      const data = await res.json();
      if (res.ok && data.success && data.tools) {
        // Normalizing data shapes
        const normalized = data.tools.map((t: any) => ({
          ...t,
          categoryName: t.category?.name || t.categoryName || 'Developer Utilities',
          inputs: t.inputs || []
        }));
        setTools(normalized);
      }
    } catch (err) {
      console.error(err);
      toast.error('Could not fetch tools registry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTools();
  }, []);

  const openAddModal = () => {
    setEditingItem(null);
    setActiveTab('general');

    setTitle('');
    setSlug('');
    setDescription('');
    setLongDesc('');
    setCategoryName(CATEGORIES[0]);
    setToolType(TOOL_TYPES[0]);
    setIcon('🔧');
    setThumbnail('');
    setIsPopular(false);
    setIsFeatured(false);
    setIsTrending(false);
    setPublished(false);
    setStatus('draft');
    setPublishDate(null);

    setInputs([]);
    setPromptTemplate('');
    setCtaButtonText('Generate');
    setApiType('openai');

    setFaqs([]);
    setArticleTitle('');
    setArticleContent('');
    setSeoTitle('');
    setSeoDesc('');
    setSeoKeywords('');

    setIsEditing(true);
  };

  const openEditModal = (item: ToolCMSItem) => {
    setEditingItem(item);
    setActiveTab('general');

    setTitle(item.title);
    setSlug(item.slug);
    setDescription(item.description);
    setLongDesc(item.longDesc || '');
    setCategoryName(item.categoryName || CATEGORIES[0]);
    setToolType(item.toolType || TOOL_TYPES[0]);
    setIcon(item.icon || '🔧');
    setThumbnail(item.thumbnail || '');
    setIsPopular(item.isPopular);
    setIsFeatured(item.isFeatured);
    setIsTrending(item.isTrending);
    
    const isPub = item.isPublished !== undefined ? item.isPublished : item.published;
    setPublished(isPub);
    setStatus(item.status || (isPub ? 'published' : 'draft'));
    setPublishDate(item.publishDate || null);

    setInputs(item.inputs || []);
    setPromptTemplate(item.promptTemplate || '');
    setCtaButtonText(item.ctaButtonText || 'Generate');
    
    setFaqs(item.faqs || []);
    
    const firstArticle = item.articles?.[0];
    setArticleTitle(firstArticle?.title || '');
    setArticleContent(firstArticle?.content || '');

    setSeoTitle(item.seoMetadata?.title || '');
    setSeoDesc(item.seoMetadata?.description || '');
    setSeoKeywords(item.seoMetadata?.keywords || '');

    setIsEditing(true);
  };

  const handleDuplicate = async (item: ToolCMSItem) => {
    try {
      const duplicatedSlug = `${item.slug}-copy-${Date.now().toString().slice(-4)}`;
      const res = await fetch('/api/admin/tools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...item,
          title: `${item.title} (Copy)`,
          slug: duplicatedSlug,
          published: false,
          isPublished: false,
          status: 'draft',
          publishDate: null,
          categoryName: item.categoryName,
          seoMetadata: item.seoMetadata ? {
            title: `${item.seoMetadata.title} (Copy)`,
            description: item.seoMetadata.description,
            keywords: item.seoMetadata.keywords
          } : null
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success('Tool entry duplicated as draft.');
        fetchTools();
      } else {
        toast.error(data.error || 'Failed to duplicate tool.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Network connection error.');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !slug || !description) {
      toast.error("Please fill in all general configuration fields.");
      return;
    }

    const isPub = status === 'published' || status === 'scheduled';
    const payload = {
      title,
      slug,
      description,
      longDesc,
      categoryName,
      toolType,
      icon,
      thumbnail,
      isPopular,
      isFeatured,
      isTrending,
      published: isPub,
      isPublished: isPub,
      status,
      publishDate: status === 'scheduled' ? publishDate : null,
      inputs,
      promptTemplate,
      ctaButtonText,
      faqs,
      articles: articleTitle && articleContent ? [{ title: articleTitle, content: articleContent }] : [],
      seoMetadata: seoTitle || seoDesc || seoKeywords ? {
        title: seoTitle,
        description: seoDesc,
        keywords: seoKeywords
      } : null
    };

    try {
      const url = editingItem ? `/api/admin/tools/${editingItem.id}` : '/api/admin/tools';
      const method = editingItem ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(editingItem ? "Tool configurations updated successfully." : "New AI tool utility registered!");
        setIsEditing(false);
        fetchTools();
      } else {
        toast.error(data.error || "Failed to persist tool configurations.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Unable to execute configuration synchronization.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this tool registry entry?')) return;
    try {
      const res = await fetch(`/api/admin/tools/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Tool registry entry deleted.");
        fetchTools();
      } else {
        toast.error(data.error || "Failed to remove entry.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error communicating delete call.");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'icon' | 'thumbnail') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      toast.loading('Uploading asset...', { id: 'upload' });
      const res = await fetch('/api/admin/media', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (res.ok && data.success && data.media) {
        if (target === 'icon') setIcon(data.media.url);
        else setThumbnail(data.media.url);
        toast.success('Asset uploaded and registered successfully.', { id: 'upload' });
      } else {
        toast.error(data.error || 'Asset upload failed.', { id: 'upload' });
      }
    } catch (err) {
      console.error(err);
      toast.error('Network file upload failed.', { id: 'upload' });
    }
  };

  const handleDirectStatusChange = async (
    id: string, 
    newStatus: 'draft' | 'scheduled' | 'published' | 'archived', 
    scheduledDate?: string | null
  ) => {
    const item = tools.find(t => t.id === id);
    if (!item) return;

    const isPub = newStatus === 'published' || newStatus === 'scheduled';
    const payload = {
      ...item,
      status: newStatus,
      isPublished: isPub,
      published: isPub,
      publishDate: newStatus === 'scheduled' ? (scheduledDate || item.publishDate || new Date(Date.now() + 86400000).toISOString()) : null
    };

    try {
      const res = await fetch(`/api/admin/tools/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(`Tool status updated to ${newStatus}`);
        fetchTools();
      } else {
        toast.error('Failed to update tool status.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error updating status.');
    }
  };

  const toggleStatusDirect = async (item: ToolCMSItem, field: 'isPopular' | 'isFeatured' | 'isTrending') => {
    try {
      const res = await fetch(`/api/admin/tools/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...item,
          [field]: !item[field]
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(`Toggled flag successfully.`);
        fetchTools();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const addFaqRow = () => {
    setFaqs([...faqs, { question: '', answer: '', order: faqs.length }]);
  };

  const updateFaqRow = (index: number, field: 'question' | 'answer', val: string) => {
    setFaqs(faqs.map((f, idx) => idx === index ? { ...f, [field]: val } : f));
  };

  const removeFaqRow = (index: number) => {
    setFaqs(faqs.filter((_, idx) => idx !== index).map((f, idx) => ({ ...f, order: idx })));
  };

  // Calculate states for ToolSchedulerCard
  const scheduledTools = tools.filter(t => {
    const isPub = t.isPublished !== undefined ? t.isPublished : t.published;
    const currentStatus = t.status || (isPub ? 'published' : 'draft');
    return currentStatus === 'scheduled';
  });

  const totalDrafts = tools.filter(t => {
    const isPub = t.isPublished !== undefined ? t.isPublished : t.published;
    const currentStatus = t.status || (isPub ? 'published' : 'draft');
    return currentStatus === 'draft';
  }).length;

  const totalPublished = tools.filter(t => {
    const isPub = t.isPublished !== undefined ? t.isPublished : t.published;
    const currentStatus = t.status || (isPub ? 'published' : 'draft');
    return currentStatus === 'published';
  }).length;

  const totalArchived = tools.filter(t => {
    const isPub = t.isPublished !== undefined ? t.isPublished : t.published;
    const currentStatus = t.status || (isPub ? 'published' : 'draft');
    return currentStatus === 'archived';
  }).length;

  const filteredTools = tools.filter(t => {
    // 1. Search Query filter
    const matchesSearch = 
      t.title.toLowerCase().includes(search.toLowerCase()) || 
      t.categoryName?.toLowerCase().includes(search.toLowerCase());
    
    if (!matchesSearch) return false;

    // 2. Status Tab Filter
    const isPub = t.isPublished !== undefined ? t.isPublished : t.published;
    const currentStatus = t.status || (isPub ? 'published' : 'draft');

    if (currentFilterTab === 'published') return currentStatus === 'published';
    if (currentFilterTab === 'scheduled') return currentStatus === 'scheduled';
    if (currentFilterTab === 'drafts') return currentStatus === 'draft';
    if (currentFilterTab === 'archived') return currentStatus === 'archived';

    return true;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
        <span className="text-xs font-black uppercase tracking-widest text-gray-500 animate-pulse">Querying Tools Index...</span>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      
      {/* 1. Scheduler Card overview */}
      <ToolSchedulerCard
        scheduledTools={scheduledTools}
        totalDrafts={totalDrafts}
        totalPublished={totalPublished}
        totalArchived={totalArchived}
      />

      {/* 2. Header and Add button */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 glass p-6 rounded-3xl border border-white/5 bg-white/[0.01]">
        <div className="flex items-center gap-3 bg-white/[0.02] border border-white/5 rounded-2xl px-5 py-3 w-full sm:w-80 focus-within:border-blue-500/50 transition-all">
          <Search className="w-4 h-4 text-gray-500" />
          <input 
            type="text" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tools registry..."
            className="bg-transparent text-sm border-none outline-none text-white w-full placeholder-gray-600 font-semibold"
          />
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-5 py-3.5 text-xs font-black uppercase tracking-widest text-white bg-blue-600 hover:bg-blue-500 rounded-2xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] cursor-pointer animate-in fade-in"
        >
          <Plus className="w-4 h-4" /> Add New Dynamic Tool
        </button>
      </div>

      {/* 3. Status workflow filter tabs */}
      <div className="flex flex-wrap gap-2 border-b border-white/5 pb-4">
        {[
          { id: 'all', label: `All Tools (${tools.length})` },
          { id: 'published', label: `Published (${totalPublished})` },
          { id: 'scheduled', label: `Scheduled (${scheduledTools.length})` },
          { id: 'drafts', label: `Drafts (${totalDrafts})` },
          { id: 'archived', label: `Archived (${totalArchived})` }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setCurrentFilterTab(tab.id as any)}
            className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all cursor-pointer ${
              currentFilterTab === tab.id
                ? 'border-blue-500/30 bg-blue-600/10 text-blue-400 shadow-[0_0_15px_rgba(37,99,235,0.1)]'
                : 'border-white/5 bg-white/[0.005] text-gray-500 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 4. Table view list */}
      <div className="glass rounded-3xl border border-white/5 bg-white/[0.01] shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="border-b border-white/5 text-[10px] font-black uppercase tracking-widest text-gray-500">
                <th className="py-5 pl-6">Utility Tool</th>
                <th className="py-5">Category</th>
                <th className="py-5">Type</th>
                <th className="py-5">Status</th>
                <th className="py-5">Popular</th>
                <th className="py-5">Featured</th>
                <th className="py-5">Trending</th>
                <th className="py-5 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs">
              {filteredTools.map((t) => (
                <tr key={t.id} className="hover:bg-white/[0.01] transition-colors">
                  <td className="py-5 pl-6">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 font-bold">
                        {t.icon || '🔧'}
                      </div>
                      <div>
                        <span className="font-black text-white block">{t.title}</span>
                        <span className="text-[10px] text-gray-500 font-bold block mt-0.5">Route: /tools/{t.slug}</span>
                      </div>
                    </div>
                  </td>

                  <td className="py-5">
                    <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-gray-400">
                      <Layers className="w-3.5 h-3.5 text-blue-500" /> {t.categoryName}
                    </span>
                  </td>

                  <td className="py-5 font-semibold text-gray-500">
                    {t.toolType}
                  </td>

                  <td className="py-5">
                    <ToolStatusBadge 
                      status={t.status || (t.isPublished ?? t.published ? 'published' : 'draft')} 
                      publishDate={t.publishDate} 
                    />
                  </td>

                  <td className="py-5">
                    <button
                      onClick={() => toggleStatusDirect(t, 'isPopular')}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                        t.isPopular 
                          ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' 
                          : 'border-white/5 hover:border-white/10 bg-white/[0.01] text-gray-500 hover:text-white'
                      }`}
                      title="Toggle Popular Status"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  </td>

                  <td className="py-5">
                    <button
                      onClick={() => toggleStatusDirect(t, 'isFeatured')}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                        t.isFeatured 
                          ? 'border-blue-500/30 bg-blue-500/10 text-blue-400' 
                          : 'border-white/5 hover:border-white/10 bg-white/[0.01] text-gray-500 hover:text-white'
                      }`}
                      title="Toggle Featured Status"
                    >
                      <Bookmark className="w-4 h-4" />
                    </button>
                  </td>

                  <td className="py-5">
                    <button
                      onClick={() => toggleStatusDirect(t, 'isTrending')}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                        t.isTrending 
                          ? 'border-amber-500/30 bg-amber-500/10 text-amber-400' 
                          : 'border-white/5 hover:border-white/10 bg-white/[0.01] text-gray-500 hover:text-white'
                      }`}
                      title="Toggle Trending Status"
                    >
                      <Flame className="w-4 h-4" />
                    </button>
                  </td>

                  <td className="py-5 pr-6 text-right space-x-2">
                    <PublishToggle 
                      status={t.status || (t.isPublished ?? t.published ? 'published' : 'draft')}
                      onStatusChange={(newStatus) => handleDirectStatusChange(t.id, newStatus)}
                      onScheduleClick={() => {
                        setSchedulingTool(t);
                        setScheduleModalOpen(true);
                      }}
                    />
                    <button
                      onClick={() => handleDuplicate(t)}
                      className="p-2.5 border border-white/5 hover:border-white/20 rounded-xl bg-white/[0.01] hover:bg-white/5 text-gray-500 hover:text-white active:scale-95 transition-all inline-flex items-center justify-center cursor-pointer"
                      title="Duplicate Tool"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => openEditModal(t)}
                      className="p-2.5 border border-white/5 hover:border-blue-500/30 rounded-xl bg-white/[0.01] hover:bg-blue-600/10 text-gray-500 hover:text-blue-400 active:scale-95 transition-all inline-flex items-center justify-center cursor-pointer"
                      title="Edit Configurations"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(t.id)}
                      className="p-2.5 border border-white/5 hover:border-red-500/30 rounded-xl bg-white/[0.01] hover:bg-red-500/10 text-gray-500 hover:text-red-400 active:scale-95 transition-all inline-flex items-center justify-center cursor-pointer"
                      title="Remove Entry"
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

      {/* 5. Schedule Modal Popup */}
      <ScheduleModal 
        isOpen={scheduleModalOpen}
        onClose={() => {
          setScheduleModalOpen(false);
          setSchedulingTool(null);
        }}
        onSchedule={(dateIso) => {
          if (schedulingTool) {
            handleDirectStatusChange(schedulingTool.id, 'scheduled', dateIso);
          }
        }}
        toolTitle={schedulingTool ? schedulingTool.title : ''}
        initialDate={schedulingTool ? schedulingTool.publishDate : null}
      />

      {/* Edit/Add Modal Overlay */}
      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-3xl glass border border-white/10 p-8 rounded-[2.5rem] shadow-2xl relative max-h-[90vh] flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-6">
                <h3 className="text-base font-black text-white uppercase tracking-widest">
                  {editingItem ? `Configure dynamic tool: ${editingItem.title}` : 'Register New AI Tool'}
                </h3>
              </div>

              {/* Internal Tab selectors */}
              <div className="flex flex-wrap gap-2 border-b border-white/5 pb-4 mb-6">
                {[
                  { id: 'general', label: 'General Info', icon: Settings2 },
                  { id: 'inputs', label: 'Form inputs', icon: Plus },
                  { id: 'engine', label: 'AI Execution Engine', icon: Sparkles },
                  { id: 'seo', label: 'SEO & Articles', icon: FileText },
                  { id: 'faqs', label: 'FAQs Accordion', icon: HelpCircle }
                ].map(tab => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all cursor-pointer ${
                        activeTab === tab.id
                          ? 'border-blue-500/30 bg-blue-600/10 text-blue-400'
                          : 'border-white/5 bg-white/[0.005] text-gray-500 hover:text-white'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Form Body - Scrollable */}
              <form onSubmit={handleSave} className="flex-1 overflow-y-auto space-y-6 pr-2">
                
                {/* TAB 1: GENERAL */}
                {activeTab === 'general' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Tool Name</label>
                        <input 
                          type="text" 
                          value={title}
                          onChange={(e) => {
                            setTitle(e.target.value);
                            if (!editingItem) setSlug(e.target.value.toLowerCase().replace(/ /g, '-').replace(/[^\w-]/g, ''));
                          }}
                          placeholder="e.g. Image Optimizer"
                          className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-sm font-bold text-white outline-none focus:border-blue-500/50"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Routing URL Slug</label>
                        <input 
                          type="text" 
                          value={slug}
                          onChange={(e) => setSlug(e.target.value)}
                          placeholder="e.g. image-optimizer"
                          className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-sm font-bold text-white outline-none focus:border-blue-500/50 font-mono"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Short Summary Description</label>
                      <textarea 
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Brief details about what the tool does..."
                        rows={2}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-sm font-medium text-white outline-none focus:border-blue-500/50 resize-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Extended Summary Description (Optional)</label>
                      <textarea 
                        value={longDesc}
                        onChange={(e) => setLongDesc(e.target.value)}
                        placeholder="Detailed background text explaining operations..."
                        rows={3}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-sm font-medium text-white outline-none focus:border-blue-500/50 resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Category Folder</label>
                        <select 
                          value={categoryName}
                          onChange={(e) => setCategoryName(e.target.value)}
                          className="w-full bg-[#0a0d17] border border-white/10 rounded-2xl px-5 py-3.5 text-sm font-bold text-white outline-none focus:border-blue-500/50 cursor-pointer"
                        >
                          {CATEGORIES.map(cat => (
                            <option key={cat} value={cat} className="bg-slate-950">{cat}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Tool Type Module</label>
                        <select 
                          value={toolType}
                          onChange={(e) => setToolType(e.target.value)}
                          className="w-full bg-[#0a0d17] border border-white/10 rounded-2xl px-5 py-3.5 text-sm font-bold text-white outline-none focus:border-blue-500/50 cursor-pointer"
                        >
                          {TOOL_TYPES.map(type => (
                            <option key={type} value={type} className="bg-slate-950">{type}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Media uploads */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Emoji Icon or URL</label>
                        <div className="flex gap-4">
                          <input 
                            type="text" 
                            value={icon}
                            onChange={(e) => setIcon(e.target.value)}
                            placeholder="e.g. 📸 or /uploads/image.png"
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-sm font-bold text-white outline-none focus:border-blue-500/50"
                          />
                          <label className="px-5 py-3.5 border border-white/10 hover:border-blue-500/50 rounded-2xl bg-white/5 hover:bg-blue-600/10 cursor-pointer transition-colors flex items-center justify-center shrink-0">
                            <Upload className="w-4 h-4 text-gray-400" />
                            <input type="file" onChange={(e) => handleFileUpload(e, 'icon')} className="hidden" />
                          </label>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Thumbnail Banner URL</label>
                        <div className="flex gap-4">
                          <input 
                            type="text" 
                            value={thumbnail}
                            onChange={(e) => setThumbnail(e.target.value)}
                            placeholder="e.g. /uploads/banner.jpg"
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-sm font-bold text-white outline-none focus:border-blue-500/50"
                          />
                          <label className="px-5 py-3.5 border border-white/10 hover:border-blue-500/50 rounded-2xl bg-white/5 hover:bg-blue-600/10 cursor-pointer transition-colors flex items-center justify-center shrink-0">
                            <Upload className="w-4 h-4 text-gray-400" />
                            <input type="file" onChange={(e) => handleFileUpload(e, 'thumbnail')} className="hidden" />
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Publishing Workflow & Status Selector */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 border border-white/5 bg-white/[0.005] rounded-2xl">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Publishing Status</label>
                        <select 
                          value={status}
                          onChange={(e) => setStatus(e.target.value as any)}
                          className="w-full bg-[#0a0d17] border border-white/10 rounded-2xl px-5 py-3.5 text-sm font-bold text-white outline-none focus:border-blue-500/50 cursor-pointer"
                        >
                          <option value="draft" className="bg-slate-950">Draft</option>
                          <option value="scheduled" className="bg-slate-950">Scheduled</option>
                          <option value="published" className="bg-slate-950">Published</option>
                          <option value="archived" className="bg-slate-950">Archived</option>
                        </select>
                      </div>

                      {status === 'scheduled' && (
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Schedule Publication Date & Time</label>
                          <input 
                            type="datetime-local" 
                            value={publishDate ? new Date(new Date(publishDate).getTime() - new Date(publishDate).getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ''}
                            onChange={(e) => {
                              const iso = e.target.value ? new Date(e.target.value).toISOString() : null;
                              setPublishDate(iso);
                            }}
                            className="w-full bg-[#0a0d17] border border-white/10 rounded-2xl px-5 py-3.5 text-sm font-bold text-white outline-none focus:border-blue-500/50 cursor-pointer"
                          />
                        </div>
                      )}
                    </div>

                    {/* Metadata Flags */}
                    <div className="grid grid-cols-3 gap-4 pt-2">
                      <label className="flex flex-col items-center gap-2 p-3 bg-white/[0.01] border border-white/5 rounded-2xl cursor-pointer hover:bg-white/[0.02]">
                        <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Popular Tool</span>
                        <input type="checkbox" checked={isPopular} onChange={(e) => setIsPopular(e.target.checked)} className="rounded text-blue-500 h-4 w-4" />
                      </label>
                      <label className="flex flex-col items-center gap-2 p-3 bg-white/[0.01] border border-white/5 rounded-2xl cursor-pointer hover:bg-white/[0.02]">
                        <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Featured Tool</span>
                        <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="rounded text-blue-500 h-4 w-4" />
                      </label>
                      <label className="flex flex-col items-center gap-2 p-3 bg-white/[0.01] border border-white/5 rounded-2xl cursor-pointer hover:bg-white/[0.02]">
                        <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Trending Tool</span>
                        <input type="checkbox" checked={isTrending} onChange={(e) => setIsTrending(e.target.checked)} className="rounded text-blue-500 h-4 w-4" />
                      </label>
                    </div>
                  </div>
                )}

                {/* TAB 2: INPUTS SCHEMA */}
                {activeTab === 'inputs' && (
                  <InputBuilder inputs={inputs} onChange={setInputs} />
                )}

                {/* TAB 3: ENGINE CONFIG */}
                {activeTab === 'engine' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Execution Provider API</label>
                        <select 
                          value={apiType}
                          onChange={(e) => setApiType(e.target.value)}
                          className="w-full bg-[#0a0d17] border border-white/10 rounded-2xl px-5 py-3.5 text-sm font-bold text-white outline-none focus:border-blue-500/50 cursor-pointer"
                        >
                          <option value="openai">OpenAI Chat Completion</option>
                          <option value="gemini">Google Gemini AI</option>
                          <option value="claude">Anthropic Claude API</option>
                          <option value="custom">Custom Web Service Endpoint</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Call-to-Action Text</label>
                        <input 
                          type="text" 
                          value={ctaButtonText}
                          onChange={(e) => setCtaButtonText(e.target.value)}
                          placeholder="e.g. Generate Copy"
                          className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-sm font-bold text-white outline-none focus:border-blue-500/50"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center ml-1">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">AI Prompt Template</label>
                        <span className="text-[9px] text-gray-600 font-bold italic">Wrap inputs in double braces, e.g. Write a story in a {"{{tone}}"} style.</span>
                      </div>
                      <textarea 
                        value={promptTemplate}
                        onChange={(e) => setPromptTemplate(e.target.value)}
                        placeholder="Write detailed prompt directives..."
                        rows={6}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-sm font-semibold text-white outline-none focus:border-blue-500/50 resize-none font-mono"
                      />
                    </div>
                  </div>
                )}

                {/* TAB 4: SEO & ARTICLE */}
                {activeTab === 'seo' && (
                  <div className="space-y-6">
                    {/* SEO Subpanel */}
                    <div className="p-6 border border-white/5 bg-white/[0.005] rounded-2xl space-y-4">
                      <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">SEO Meta Tags</span>
                      
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">SEO Meta Title</label>
                          <input 
                            type="text" 
                            value={seoTitle}
                            onChange={(e) => setSeoTitle(e.target.value)}
                            placeholder="Defaults to Tool Name | ToolWala AI"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs font-bold text-white outline-none focus:border-blue-500/50"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">SEO Meta Description</label>
                          <textarea 
                            value={seoDesc}
                            onChange={(e) => setSeoDesc(e.target.value)}
                            placeholder="Meta description search snippet..."
                            rows={2}
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-xs font-semibold text-white outline-none focus:border-blue-500/50 resize-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">SEO Meta Keywords (Comma separated)</label>
                          <input 
                            type="text" 
                            value={seoKeywords}
                            onChange={(e) => setSeoKeywords(e.target.value)}
                            placeholder="e.g. background remover, transparent image, cutoff tool"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs font-bold text-white outline-none focus:border-blue-500/50"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Article Editorial Subpanel */}
                    <div className="p-6 border border-white/5 bg-white/[0.005] rounded-2xl space-y-4">
                      <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">Deep Dive Guide Article</span>

                      <div className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Guide Heading Title</label>
                          <input 
                            type="text" 
                            value={articleTitle}
                            onChange={(e) => setArticleTitle(e.target.value)}
                            placeholder="e.g. Master dynamic data formatting with AI"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs font-bold text-white outline-none focus:border-blue-500/50"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Guide Content Text (Paragraphs or markdown format)</label>
                          <textarea 
                            value={articleContent}
                            onChange={(e) => setArticleContent(e.target.value)}
                            placeholder="Detailed overview article contents..."
                            rows={8}
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-xs font-semibold text-white outline-none focus:border-blue-500/50 resize-none font-sans"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 5: FAQ ACCORDIONS */}
                {activeTab === 'faqs' && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">FAQ accordion items</span>
                      <button
                        type="button"
                        onClick={addFaqRow}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-all cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add FAQ
                      </button>
                    </div>

                    {faqs.length === 0 ? (
                      <div className="text-center py-10 border border-white/5 border-dashed rounded-2xl bg-white/[0.005]">
                        <p className="text-gray-500 text-xs font-semibold">No accordion questions created yet.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {faqs.map((faq, index) => (
                          <div key={index} className="p-4 border border-white/5 bg-white/[0.005] rounded-2xl space-y-3 relative">
                            <button
                              type="button"
                              onClick={() => removeFaqRow(index)}
                              className="absolute top-4 right-4 p-1.5 border border-white/5 hover:border-red-500/20 rounded-lg text-gray-500 hover:text-red-400 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>

                            <div className="space-y-1 pr-10">
                              <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Question #{index + 1}</label>
                              <input
                                type="text"
                                value={faq.question}
                                onChange={(e) => updateFaqRow(index, 'question', e.target.value)}
                                placeholder="Enter question..."
                                className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Answer #{index + 1}</label>
                              <textarea
                                value={faq.answer}
                                onChange={(e) => updateFaqRow(index, 'answer', e.target.value)}
                                placeholder="Enter answer..."
                                rows={2}
                                className="w-full bg-slate-950/80 border border-white/10 rounded-xl p-3 text-xs font-medium text-white outline-none resize-none"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

              </form>

              {/* Action Buttons */}
              <div className="flex gap-4 border-t border-white/5 pt-4 mt-6">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 py-4 text-xs font-black uppercase tracking-widest text-gray-400 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 py-4 text-xs font-black uppercase tracking-widest text-white bg-blue-600 hover:bg-blue-500 rounded-2xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.4)] cursor-pointer"
                >
                  Save Changes
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
