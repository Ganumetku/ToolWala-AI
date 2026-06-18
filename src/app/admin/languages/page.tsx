"use client";

import { useState, useEffect } from 'react';
import { Globe, RefreshCw, AlertCircle, CheckCircle2, Star, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import { adminFetch } from '@/lib/admin-fetch';

interface LanguageStat {
  code: string;
  name: string;
  flag: string;
  enabled: boolean;
  progress: number;
  missingKeysCount: number;
  missingKeys: string[];
}

export default function LanguageManagementPage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [languages, setLanguages] = useState<LanguageStat[]>([]);
  const [totalKeys, setTotalKeys] = useState(0);

  const loadData = async (showToast = false) => {
    try {
      const res = await adminFetch('/api/admin/languages');
      const data = await res.json();
      if (res.ok && data.success) {
        setLanguages(data.languages);
        setTotalKeys(data.totalKeys);
        if (showToast) toast.success('Translation status refreshed!');
      } else {
        toast.error(data.error || 'Failed to load languages status');
      }
    } catch (e) {
      console.error(e);
      toast.error('Network error loading translations status');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggle = async (locale: string, currentStatus: boolean) => {
    try {
      const res = await adminFetch('/api/admin/languages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locale, enabled: !currentStatus }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setLanguages(prev => prev.map(lang => 
          lang.code === locale ? { ...lang, enabled: !currentStatus } : lang
        ));
        toast.success(`Language ${locale.toUpperCase()} ${!currentStatus ? 'enabled' : 'disabled'} successfully.`);
      } else {
        toast.error(data.error || 'Failed to toggle language');
      }
    } catch (e) {
      console.error(e);
      toast.error('Failed to connect to server');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
        <span className="text-xs font-black uppercase tracking-widest text-gray-500 animate-pulse">Loading Translation CMS...</span>
      </div>
    );
  }

  return (
    <div className="space-y-10 max-w-5xl mx-auto">
      {/* Header banner */}
      <div className="glass p-8 rounded-[2rem] border border-white/5 bg-white/[0.01] flex justify-between items-center relative overflow-hidden">
        <div className="absolute top-0 right-1/4 h-[1px] w-32 bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-white flex items-center gap-3">
            <Globe className="w-6 h-6 text-blue-500 animate-pulse" /> Language Settings
          </h1>
          <p className="text-xs text-gray-500 font-bold uppercase mt-1 tracking-wider">
            Enable or disable languages, track translation completion status and identify missing keys
          </p>
        </div>
        <button
          onClick={() => { setRefreshing(true); loadData(true); }}
          disabled={refreshing}
          className="flex items-center gap-2 p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 text-xs font-black uppercase tracking-wider text-gray-300 hover:text-white transition-all active:scale-95 cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh Status
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass p-6 rounded-[1.5rem] border border-white/5 bg-white/[0.01] flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Star className="w-5 h-5 fill-blue-500/20" />
          </div>
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500">Base Language</h4>
            <div className="text-lg font-black text-white mt-0.5">English (100% Ground Truth)</div>
          </div>
        </div>
        <div className="glass p-6 rounded-[1.5rem] border border-white/5 bg-white/[0.01] flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500">Supported Locales</h4>
            <div className="text-lg font-black text-white mt-0.5">{languages.length} High-Priority</div>
          </div>
        </div>
        <div className="glass p-6 rounded-[1.5rem] border border-white/5 bg-white/[0.01] flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500">Catalog Size</h4>
            <div className="text-lg font-black text-white mt-0.5">{totalKeys} Total Keys</div>
          </div>
        </div>
      </div>

      {/* Languages Table */}
      <div className="glass rounded-[2rem] border border-white/5 overflow-hidden bg-white/[0.01]">
        <div className="p-6 border-b border-white/5 flex justify-between items-center">
          <h2 className="text-sm font-black uppercase tracking-widest text-white">Active Language Registries</h2>
          <span className="text-[9px] font-black uppercase bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full border border-blue-500/20">System Live</span>
        </div>
        <div className="divide-y divide-white/5">
          {languages.map((lang) => {
            const hasMissing = lang.missingKeysCount > 0;
            return (
              <div key={lang.code} className="p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:bg-white/[0.02] transition-colors relative group">
                {/* Neon strip glow */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-r transition-all duration-300 ${lang.enabled ? 'bg-blue-500' : 'bg-gray-800'}`} />

                {/* Col 1: Language details */}
                <div className="flex items-center gap-4 lg:w-1/4">
                  <div className="text-3xl leading-none w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center border border-white/5 group-hover:scale-105 transition-transform duration-300">
                    {lang.flag}
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white tracking-tight uppercase flex items-center gap-2">
                      {lang.name}
                      <span className="text-[10px] text-gray-500 font-bold lowercase">({lang.code})</span>
                    </h3>
                    <div className="mt-1 flex items-center gap-2">
                      <span className={`inline-flex items-center h-2 w-2 rounded-full ${lang.enabled ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-gray-700'}`} />
                      <span className="text-[9px] font-black uppercase tracking-widest text-gray-500">
                        {lang.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Col 2: Progress bar */}
                <div className="flex-1 max-w-md">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">
                    <span>Translation Progress</span>
                    <span className="text-white">{lang.progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${
                        lang.progress === 100 
                          ? 'bg-gradient-to-r from-blue-500 to-indigo-500' 
                          : lang.progress > 70
                          ? 'bg-blue-500'
                          : 'bg-amber-500'
                      }`}
                      style={{ width: `${lang.progress}%` }}
                    />
                  </div>
                </div>

                {/* Col 3: Status / Alerts */}
                <div className="lg:w-1/4 flex flex-col gap-1 items-start lg:items-end">
                  {lang.code === 'en' ? (
                    <span className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-blue-400 bg-blue-500/10 px-3.5 py-1.5 rounded-full border border-blue-500/20">
                      System Reference
                    </span>
                  ) : hasMissing ? (
                    <div className="space-y-1 text-left lg:text-right">
                      <span className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-amber-400 bg-amber-500/10 px-3.5 py-1.5 rounded-full border border-amber-500/20">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {lang.missingKeysCount} Missing Keys
                      </span>
                    </div>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-3.5 py-1.5 rounded-full border border-emerald-500/20">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Fully Translated
                    </span>
                  )}
                </div>

                {/* Col 4: Toggle Actions */}
                <div className="flex items-center gap-4">
                  {lang.code !== 'en' && (
                    <button
                      onClick={() => handleToggle(lang.code, lang.enabled)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${
                        lang.enabled ? 'bg-blue-600' : 'bg-gray-800'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          lang.enabled ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Missing Translation Details Drawer/Grid */}
      {languages.some((l) => l.code !== 'en' && l.missingKeysCount > 0) && (
        <div className="glass p-8 rounded-[2.5rem] border border-white/5 bg-white/[0.01] space-y-6">
          <h3 className="text-xs font-black uppercase tracking-widest text-amber-400 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-500 animate-pulse" /> Missing Translation Alerts
          </h3>
          <p className="text-xs text-gray-500 font-bold uppercase tracking-wider -mt-2">
            The following keys exist in English but are empty or missing in their respective locales. Populate them in `messages/[locale].json` to clear warnings.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {languages
              .filter((l) => l.code !== 'en' && l.missingKeysCount > 0)
              .map((lang) => (
                <div key={lang.code} className="p-5 rounded-2xl bg-white/5 border border-white/5 space-y-3.5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 h-16 w-16 bg-amber-500/5 blur-xl pointer-events-none" />
                  <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
                    <span className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-2">
                      {lang.flag} {lang.name}
                    </span>
                    <span className="text-[9px] font-black uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                      {lang.missingKeysCount} Warned
                    </span>
                  </div>
                  <ul className="space-y-1.5 max-h-48 overflow-y-auto pr-2">
                    {lang.missingKeys.map((key) => (
                      <li key={key} className="text-[10px] font-bold text-gray-400 hover:text-white transition-colors bg-white/[0.02] hover:bg-white/5 p-2 rounded-lg border border-white/5 flex justify-between items-center">
                        <span className="truncate">{key}</span>
                        <span className="text-[8px] text-amber-500 font-black uppercase tracking-wider ml-2 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">Missing</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
