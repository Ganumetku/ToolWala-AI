"use client";

import React, { useState, useRef } from 'react';
import { Tool } from '@/data/tools';
import ToolIcon from '@/components/ToolIcon';
import { adminFetch } from '@/lib/admin-fetch';
import { toast } from 'sonner';
import { X, Upload, Image as ImageIcon, Smile, Link as LinkIcon, Loader2, Check } from 'lucide-react';
import { motion } from 'framer-motion';

interface ToolIconModalProps {
  tool: Tool;
  onClose: () => void;
  onSave: (tool: Tool, newIcon: string) => Promise<void>;
}

const EMOJI_CATEGORIES = [
  {
    name: '🪪 Govt ID & Photo Tools',
    icons: ['🪪', '📸', '🏛️', '🎯', '🎓', '🛡️', '🔒', '📋', '💳', '🆔', '📷', '👤']
  },
  {
    name: '📄 PDF & Document Tools',
    icons: ['📄', '🔀', '✂️', '🗜️', '✍️', '🔐', '🔓', '🏷️', '🔄', '🗑️', '🔢', '🖊️', '🗂️', '📖', '📘', '📑']
  },
  {
    name: '🤖 AI & Media Tools',
    icons: ['🤖', '🎙️', '💬', '🧠', '🚀', '🪄', '🎨', '👁️', '🎞️', '✨', '🖼️', '📉']
  },
  {
    name: '🧮 Calculators & Finance',
    icons: ['🧮', '📈', '🏦', '💸', '🧾', '💰', '⏳', '📊', '📉', '⚖️', '💲', '➕']
  },
  {
    name: '📱 Dev, Utility & Social',
    icons: ['📱', '🌐', '⚡', '🔧', '⚙️', '🛠️', '💻', '🔗', '📦', '🏷️', '🔍', '💡']
  }
];

export default function ToolIconModal({ tool, onClose, onSave }: ToolIconModalProps) {
  const [activeTab, setActiveTab] = useState<'upload' | 'preset' | 'custom'>('upload');
  const [selectedIcon, setSelectedIcon] = useState<string>(tool.icon || '🔧');
  const [customUrl, setCustomUrl] = useState<string>(tool.icon.startsWith('/') || tool.icon.startsWith('http') ? tool.icon : '');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // File Upload Handler
  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error("Please upload an image file (PNG, JPG, SVG, WebP).");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await adminFetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Upload failed');
      }

      setSelectedIcon(data.url);
      toast.success("Image logo uploaded successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to upload image.");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    const finalIcon = activeTab === 'custom' && customUrl.trim() ? customUrl.trim() : selectedIcon;
    setSaving(true);
    try {
      await onSave(tool, finalIcon);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in font-sans">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-xl bg-white dark:bg-[#090d16] rounded-3xl border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden text-slate-900 dark:text-white"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-white/[0.01]">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">Tool Icon & Logo Manager</span>
            <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white mt-0.5">
              {tool.title}
            </h3>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-100 dark:border-white/5 px-6 pt-3 gap-2 bg-slate-50/30 dark:bg-transparent">
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer border-b-2 ${
              activeTab === 'upload'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-white/5'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white'
            }`}
          >
            <Upload className="w-4 h-4" /> Upload Image
          </button>
          <button
            onClick={() => setActiveTab('preset')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer border-b-2 ${
              activeTab === 'preset'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-white/5'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white'
            }`}
          >
            <Smile className="w-4 h-4" /> Emoji Gallery
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer border-b-2 ${
              activeTab === 'custom'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-white/5'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white'
            }`}
          >
            <LinkIcon className="w-4 h-4" /> Image URL
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6 max-h-[420px] overflow-y-auto">
          
          {/* 1. UPLOAD IMAGE TAB */}
          {activeTab === 'upload' && (
            <div className="space-y-6">
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    handleFileUpload(e.dataTransfer.files[0]);
                  }
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-250 ${
                  isDragging 
                    ? 'border-blue-500 bg-blue-50/80 dark:bg-blue-500/10 scale-[1.01]'
                    : 'border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.01] hover:bg-blue-50/40 dark:hover:bg-white/[0.03] hover:border-blue-400'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileUpload(e.target.files[0]);
                    }
                  }}
                  accept="image/png, image/jpeg, image/svg+xml, image/webp"
                  className="hidden"
                />

                {uploading ? (
                  <div className="flex flex-col items-center justify-center py-4 gap-3">
                    <Loader2 className="w-8 h-8 text-blue-600 dark:text-blue-500 animate-spin" />
                    <span className="text-xs font-bold text-slate-600 dark:text-gray-400 uppercase tracking-wider">Uploading Image Logo...</span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 dark:bg-white/5 border border-blue-100 dark:border-white/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
                      <ImageIcon className="w-7 h-7" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase">Upload Custom Tool Logo</h4>
                      <p className="text-xs text-slate-500 dark:text-gray-400 font-medium mt-1">Supports PNG, JPG, SVG, and WebP up to 5MB.</p>
                    </div>
                    <button type="button" className="px-5 py-2.5 bg-blue-600 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-blue-700 transition-all shadow-sm pointer-events-none">
                      Browse Files
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 2. PRESET EMOJI GALLERY TAB */}
          {activeTab === 'preset' && (
            <div className="space-y-6">
              {EMOJI_CATEGORIES.map((cat, idx) => (
                <div key={idx} className="space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-400 block">{cat.name}</span>
                  <div className="grid grid-cols-6 sm:grid-cols-8 gap-2">
                    {cat.icons.map((ic) => (
                      <button
                        key={ic}
                        type="button"
                        onClick={() => setSelectedIcon(ic)}
                        className={`h-12 w-12 rounded-xl text-2xl flex items-center justify-center transition-all cursor-pointer ${
                          selectedIcon === ic
                            ? 'bg-blue-600 text-white ring-2 ring-blue-500 ring-offset-2 scale-110 shadow-md'
                            : 'bg-slate-100 dark:bg-white/5 hover:bg-blue-50 dark:hover:bg-white/10 border border-slate-200/60 dark:border-white/5'
                        }`}
                      >
                        {ic}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 3. CUSTOM URL TAB */}
          {activeTab === 'custom' && (
            <div className="space-y-4">
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-gray-300">
                Direct Image URL or Symbol
              </label>
              <input
                type="text"
                placeholder="https://example.com/logo.png or /uploads/my_logo.svg"
                value={customUrl}
                onChange={(e) => {
                  setCustomUrl(e.target.value);
                  if (e.target.value.trim()) setSelectedIcon(e.target.value.trim());
                }}
                className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-mono text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          )}

          {/* Live Preview Card */}
          <div className="mt-6 p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-white/5 border border-blue-100 dark:border-white/10 flex items-center justify-center shadow-sm">
                <ToolIcon icon={activeTab === 'custom' && customUrl.trim() ? customUrl.trim() : selectedIcon} className="w-8 h-8 text-2xl" />
              </div>
              <div>
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Live Preview</span>
                <p className="text-sm font-black text-slate-900 dark:text-white uppercase truncate">{tool.title}</p>
              </div>
            </div>
            <span className="text-[10px] font-mono px-3 py-1 bg-white dark:bg-white/5 rounded-lg border border-slate-200 dark:border-white/10 text-slate-600 dark:text-gray-400 truncate max-w-[150px]">
              {selectedIcon}
            </span>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-100 dark:border-white/5 flex items-center justify-end gap-3 bg-slate-50/50 dark:bg-white/[0.01]">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-black uppercase tracking-wider text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-blue-500/20 disabled:opacity-50 cursor-pointer"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            Save Tool Logo
          </button>
        </div>
      </motion.div>
    </div>
  );
}
