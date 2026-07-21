"use client";

import { useState, useEffect } from 'react';
import { Sparkles, Save, ShieldAlert, Key, Globe, Mail, Link as LinkIcon, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { adminFetch } from '@/lib/admin-fetch';

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Settings state values
  const [siteTitle, setSiteTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [openaiKey, setOpenaiKey] = useState('');
  const [geminiKey, setGeminiKey] = useState('');
  const [claudeKey, setClaudeKey] = useState('');
  
  const [smtpHost, setSmtpHost] = useState('');
  const [smtpPort, setSmtpPort] = useState('');
  const [smtpUser, setSmtpUser] = useState('');
  const [smtpPass, setSmtpPass] = useState('');

  const [socialTwitter, setSocialTwitter] = useState('');
  const [socialGithub, setSocialGithub] = useState('');

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await adminFetch('/api/admin/settings');
        const data = await res.json();
        if (res.ok && data.success && data.settings) {
          const s = data.settings;
          setSiteTitle(s.site_title || '');
          setSeoDescription(s.seo_description || '');
          setOpenaiKey(s.openai_api_key || '');
          setGeminiKey(s.gemini_api_key || '');
          setClaudeKey(s.claude_api_key || '');
          setSmtpHost(s.smtp_host || '');
          setSmtpPort(s.smtp_port || '');
          setSmtpUser(s.smtp_user || '');
          setSmtpPass(s.smtp_password || '');
          setSocialTwitter(s.social_twitter || '');
          setSocialGithub(s.social_github || '');
        }
      } catch (err) {
        console.error(err);
        toast.error('Failed to load global configurations.');
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await adminFetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          settings: {
            site_title: siteTitle,
            seo_description: seoDescription,
            openai_api_key: openaiKey,
            gemini_api_key: geminiKey,
            claude_api_key: claudeKey,
            smtp_host: smtpHost,
            smtp_port: smtpPort,
            smtp_user: smtpUser,
            smtp_password: smtpPass,
            social_twitter: socialTwitter,
            social_github: socialGithub
          }
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success('Global settings saved successfully.');
      } else {
        toast.error(data.error || 'Failed to persist configurations.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Unable to connect to the administration backend.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
        <span className="text-xs font-black uppercase tracking-widest text-gray-500 animate-pulse">Loading Platform Settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-10 max-w-4xl mx-auto">
      {/* Header banner */}
      <div className="bg-white dark:bg-white/[0.01] p-8 rounded-[2rem] border border-slate-200/80 dark:border-white/5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex justify-between items-center relative overflow-hidden">
        <div className="absolute top-0 right-1/4 h-[1px] w-32 bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white">System Settings</h1>
          <p className="text-xs text-slate-500 dark:text-gray-500 font-bold uppercase mt-1 tracking-wider">Configure API tokens, SMTP credentials, and branding profiles</p>
        </div>
        <ShieldAlert className="w-10 h-10 text-blue-600/30 dark:text-blue-500/30" />
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        
        {/* SECTION 1: API KEYS */}
        <div className="bg-white dark:bg-white/[0.01] p-8 sm:p-10 rounded-[2.5rem] border border-slate-200/80 dark:border-white/5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-6 relative">
          <h3 className="text-xs font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 flex items-center gap-2">
            <Key className="w-4 h-4" /> AI Models API Infrastructure
          </h3>
          
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 dark:text-gray-500 uppercase tracking-widest ml-1">OpenAI Secret Token (GPT-4o / GPT-4o-mini)</label>
              <input
                type="password"
                value={openaiKey}
                onChange={(e) => setOpenaiKey(e.target.value)}
                placeholder="sk-proj-..."
                className="w-full bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 dark:text-gray-500 uppercase tracking-widest ml-1">Google Gemini API Key (Gemini 1.5 Pro / Flash)</label>
              <input
                type="password"
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 dark:text-gray-500 uppercase tracking-widest ml-1">Anthropic Claude API Key (Claude 3.5 Sonnet / Haiku)</label>
              <input
                type="password"
                value={claudeKey}
                onChange={(e) => setClaudeKey(e.target.value)}
                placeholder="sk-ant-..."
                className="w-full bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: BRANDING & GENERAL SEO */}
        <div className="bg-white dark:bg-white/[0.01] p-8 sm:p-10 rounded-[2.5rem] border border-slate-200/80 dark:border-white/5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-6 relative">
          <h3 className="text-xs font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 flex items-center gap-2">
            <Globe className="w-4 h-4" /> Branding & SEO Settings
          </h3>

          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 dark:text-gray-500 uppercase tracking-widest ml-1">Site Title Brand</label>
              <input
                type="text"
                value={siteTitle}
                onChange={(e) => setSiteTitle(e.target.value)}
                placeholder="e.g. ToolWala - The AI SaaS Directory"
                className="w-full bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 dark:text-gray-500 uppercase tracking-widest ml-1">Global Meta Description</label>
              <textarea
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                placeholder="Provide a search-optimized summary of your tools platform..."
                rows={3}
                className="w-full bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 rounded-2xl p-5 text-sm font-medium text-slate-900 dark:text-white outline-none focus:border-blue-500 resize-none"
              />
            </div>
          </div>
        </div>

        {/* SECTION 3: SMTP MAIL SERVER */}
        <div className="bg-white dark:bg-white/[0.01] p-8 sm:p-10 rounded-[2.5rem] border border-slate-200/80 dark:border-white/5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-6 relative">
          <h3 className="text-xs font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 flex items-center gap-2">
            <Mail className="w-4 h-4" /> SMTP Email Server Integrations
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 dark:text-gray-500 uppercase tracking-widest ml-1">SMTP Host Endpoint</label>
              <input
                type="text"
                value={smtpHost}
                onChange={(e) => setSmtpHost(e.target.value)}
                placeholder="smtp.mailgun.org"
                className="w-full bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 dark:text-gray-500 uppercase tracking-widest ml-1">SMTP Port Connection</label>
              <input
                type="text"
                value={smtpPort}
                onChange={(e) => setSmtpPort(e.target.value)}
                placeholder="587 / 465"
                className="w-full bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 dark:text-gray-500 uppercase tracking-widest ml-1">SMTP User Account</label>
              <input
                type="text"
                value={smtpUser}
                onChange={(e) => setSmtpUser(e.target.value)}
                placeholder="postmaster@domain.com"
                className="w-full bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 dark:text-gray-500 uppercase tracking-widest ml-1">SMTP Secret Password</label>
              <input
                type="password"
                value={smtpPass}
                onChange={(e) => setSmtpPass(e.target.value)}
                placeholder="••••••••••••••"
                className="w-full bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* SECTION 4: SOCIAL CONNECTIONS */}
        <div className="bg-white dark:bg-white/[0.01] p-8 sm:p-10 rounded-[2.5rem] border border-slate-200/80 dark:border-white/5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-6 relative">
          <h3 className="text-xs font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 flex items-center gap-2">
            <LinkIcon className="w-4 h-4" /> Social & Repository Links
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 dark:text-gray-500 uppercase tracking-widest ml-1">Twitter Account URL</label>
              <input
                type="text"
                value={socialTwitter}
                onChange={(e) => setSocialTwitter(e.target.value)}
                placeholder="https://twitter.com/mybrand"
                className="w-full bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 dark:text-gray-500 uppercase tracking-widest ml-1">GitHub Account URL</label>
              <input
                type="text"
                value={socialGithub}
                onChange={(e) => setSocialGithub(e.target.value)}
                placeholder="https://github.com/myorg"
                className="w-full bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex gap-4 justify-end pt-4">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-8 py-4.5 text-xs font-black uppercase tracking-widest text-white bg-blue-600 hover:bg-blue-700 rounded-2xl transition-all shadow-md shadow-blue-500/20 disabled:opacity-50 active:scale-[0.98] cursor-pointer"
          >
            {saving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" /> Save Configuration
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}
