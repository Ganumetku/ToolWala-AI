"use client";

import { useState, useEffect } from 'react';
import { 
  Globe, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2, 
  Star, 
  ShieldAlert, 
  ArrowUp, 
  ArrowDown, 
  Eye, 
  TrendingUp, 
  Activity, 
  Sliders, 
  FileText,
  HelpCircle,
  TrendingDown
} from 'lucide-react';
import { toast } from 'sonner';
import { adminFetch } from '@/lib/admin-fetch';

interface LanguageStat {
  code: string;
  name: string;
  flag: string;
  enabled: boolean;
  seo_enabled: boolean;
  display_order: number;
  progress: number;
  missingKeysCount: number;
  missingKeys: string[];
  analytics: {
    users: number;
    views: number;
    topTools: string[];
    topBlogs: string[];
  };
}

export default function LanguageManagementPage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [languages, setLanguages] = useState<LanguageStat[]>([]);
  const [totalKeys, setTotalKeys] = useState(0);
  const [selectedLanguageCode, setSelectedLanguageCode] = useState<string>('es');

  // Safety Modal State
  const [safetyModal, setSafetyModal] = useState<{
    locale: string;
    name: string;
    progress: number;
  } | null>(null);

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

  const handleToggleEnabledClick = (locale: string, currentEnabled: boolean, progress: number, name: string) => {
    if (!currentEnabled && progress < 90) {
      setSafetyModal({ locale, name, progress });
    } else {
      handleToggle(locale, currentEnabled);
    }
  };

  const confirmEnableLanguage = () => {
    if (safetyModal) {
      handleToggle(safetyModal.locale, false);
      setSafetyModal(null);
    }
  };

  const handleToggleSeo = async (locale: string, currentSeoStatus: boolean) => {
    try {
      const res = await adminFetch('/api/admin/languages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locale, seo_enabled: !currentSeoStatus }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setLanguages(prev => prev.map(lang => 
          lang.code === locale ? { ...lang, seo_enabled: !currentSeoStatus } : lang
        ));
        toast.success(`SEO dynamic metadata for ${locale.toUpperCase()} ${!currentSeoStatus ? 'enabled' : 'disabled'}.`);
      } else {
        toast.error(data.error || 'Failed to toggle SEO status');
      }
    } catch (e) {
      console.error(e);
      toast.error('Failed to update SEO configuration');
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= languages.length) return;

    const currentLang = languages[index];
    const targetLang = languages[targetIndex];

    const tempOrder = currentLang.display_order;
    const nextCurrentOrder = targetLang.display_order;
    const nextTargetOrder = tempOrder;

    try {
      // Optimistic sorting/updates
      const updatedLangs = [...languages];
      updatedLangs[index] = { ...currentLang, display_order: nextCurrentOrder };
      updatedLangs[targetIndex] = { ...targetLang, display_order: nextTargetOrder };
      updatedLangs.sort((a, b) => a.display_order - b.display_order);
      setLanguages(updatedLangs);

      await Promise.all([
        adminFetch('/api/admin/languages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ locale: currentLang.code, display_order: nextCurrentOrder }),
        }),
        adminFetch('/api/admin/languages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ locale: targetLang.code, display_order: nextTargetOrder }),
        })
      ]);
      
      toast.success('Language layout display priority updated.');
    } catch (err) {
      console.error(err);
      toast.error('Failed to swap priority order');
      loadData(); // Revert
    }
  };

  const activeAnalyticsLang = languages.find(l => l.code === selectedLanguageCode) || languages[0];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
        <span className="text-xs font-black uppercase tracking-widest text-gray-500 animate-pulse">Loading Language Management System...</span>
      </div>
    );
  }

  return (
    <div className="space-y-10 max-w-6xl mx-auto pb-16">
      {/* Header banner */}
      <div className="glass p-8 rounded-[2rem] border border-white/5 bg-white/[0.01] flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-1/4 h-[1px] w-32 bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-white flex items-center gap-3">
            <Globe className="w-6 h-6 text-blue-500 animate-pulse" /> Language Manager
          </h1>
          <p className="text-xs text-gray-400 font-bold uppercase mt-1 tracking-wider">
            Enable locales, adjust switcher priority, toggle sitemaps & monitor translation analytics
          </p>
        </div>
        <button
          onClick={() => { setRefreshing(true); loadData(true); }}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 text-xs font-black uppercase tracking-wider text-gray-300 hover:text-white transition-all active:scale-95 cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh Status
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        <div className="glass p-6 rounded-[1.5rem] border border-white/5 bg-white/[0.01] flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
            <Star className="w-5 h-5 fill-blue-500/20" />
          </div>
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500">Base Language</h4>
            <div className="text-base font-black text-white mt-0.5">English (en)</div>
          </div>
        </div>
        <div className="glass p-6 rounded-[1.5rem] border border-white/5 bg-white/[0.01] flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500">Active Switcher</h4>
            <div className="text-base font-black text-white mt-0.5">{languages.filter(l => l.enabled).length} Enabled</div>
          </div>
        </div>
        <div className="glass p-6 rounded-[1.5rem] border border-white/5 bg-white/[0.01] flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500">Catalog Size</h4>
            <div className="text-base font-black text-white mt-0.5">{totalKeys} Total Keys</div>
          </div>
        </div>
        <div className="glass p-6 rounded-[1.5rem] border border-white/5 bg-white/[0.01] flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500">SEO Enabled</h4>
            <div className="text-base font-black text-white mt-0.5">{languages.filter(l => l.seo_enabled).length} Locales</div>
          </div>
        </div>
      </div>

      {/* Main Table Panel */}
      <div className="glass rounded-[2rem] border border-white/5 overflow-hidden bg-white/[0.01]">
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.005]">
          <h2 className="text-sm font-black uppercase tracking-widest text-white">Registered System Languages</h2>
          <span className="text-[9px] font-black uppercase bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full border border-blue-500/20">Configured Priority</span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-white/5 text-[10px] uppercase font-black tracking-wider text-gray-500">
                <th className="py-4 px-6">Language</th>
                <th className="py-4 px-6 text-center">Code</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6">SEO Enabled</th>
                <th className="py-4 px-6 text-center">Sitemap Status</th>
                <th className="py-4 px-6 text-center">Priority Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {languages.map((lang, index) => {
                const hasMissing = lang.missingKeysCount > 0;
                return (
                  <tr key={lang.code} className="hover:bg-white/[0.01] transition-colors group">
                    {/* Language Detail */}
                    <td className="py-5 px-6">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/5 shrink-0 select-none">
                          {lang.flag}
                        </span>
                        <div>
                          <span className="text-sm font-black text-white">{lang.name}</span>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="w-20 h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                              <div className="h-full bg-blue-500 rounded-full" style={{ width: `${lang.progress}%` }} />
                            </div>
                            <span className="text-[9px] font-bold text-gray-500">{lang.progress}% done</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Language Code */}
                    <td className="py-5 px-6 text-center">
                      <span className="font-mono text-xs font-bold text-gray-400 bg-white/5 px-2 py-1 rounded border border-white/5 lowercase">{lang.code}</span>
                    </td>

                    {/* Switcher Status Toggle */}
                    <td className="py-5 px-6">
                      <div className="flex items-center gap-3">
                        {lang.code === 'en' ? (
                          <span className="text-[9px] font-black uppercase text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20 select-none">
                            System Lock
                          </span>
                        ) : (
                          <button
                            onClick={() => handleToggleEnabledClick(lang.code, lang.enabled, lang.progress, lang.name)}
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
                        <span className="text-[10px] font-black uppercase text-gray-500">
                          {lang.enabled ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                    </td>

                    {/* SEO Enabled Toggle */}
                    <td className="py-5 px-6">
                      <div className="flex items-center gap-3">
                        {lang.code === 'en' ? (
                          <span className="text-[9px] font-black uppercase text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20 select-none">
                            System Lock
                          </span>
                        ) : (
                          <button
                            onClick={() => handleToggleSeo(lang.code, lang.seo_enabled)}
                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${
                              lang.seo_enabled ? 'bg-emerald-600' : 'bg-gray-800'
                            }`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                lang.seo_enabled ? 'translate-x-5' : 'translate-x-0'
                              }`}
                            />
                          </button>
                        )}
                        <span className="text-[10px] font-black uppercase text-gray-500">
                          {lang.seo_enabled ? 'SEO Meta On' : 'SEO Meta Off'}
                        </span>
                      </div>
                    </td>

                    {/* Sitemap Status */}
                    <td className="py-5 px-6 text-center">
                      <span className={`inline-flex items-center gap-1.5 text-[9px] font-black uppercase px-3 py-1 rounded-full border ${
                        lang.enabled && lang.seo_enabled 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}>
                        {lang.enabled && lang.seo_enabled ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Included
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-3 h-3 text-amber-400" /> Excluded
                          </>
                        )}
                      </span>
                    </td>

                    {/* display_order Swap Reordering */}
                    <td className="py-5 px-6 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleMove(index, 'up')}
                          disabled={index === 0}
                          className="p-1.5 hover:bg-white/10 rounded border border-white/5 text-gray-400 hover:text-white transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleMove(index, 'down')}
                          disabled={index === languages.length - 1}
                          className="p-1.5 hover:bg-white/10 rounded border border-white/5 text-gray-400 hover:text-white transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Analytics & Coverage Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col: Analytics Card for selected language */}
        <div className="lg:col-span-2 glass p-8 rounded-[2.5rem] border border-white/5 bg-white/[0.01] flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex justify-between items-start flex-wrap gap-4">
              <div>
                <h3 className="text-sm font-black uppercase tracking-widest text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-500" /> Traffic & Usage Metrics
                </h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">
                  Dynamic localization analytics over the last 30 days
                </p>
              </div>

              {/* Selector */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-gray-400 font-bold uppercase">Language:</span>
                <select
                  value={selectedLanguageCode}
                  onChange={(e) => setSelectedLanguageCode(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-lg text-xs font-black uppercase text-white p-2 outline-none cursor-pointer"
                >
                  {languages.map(l => (
                    <option key={l.code} value={l.code} className="bg-gray-900 text-white uppercase font-bold">
                      {l.flag} {l.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Performance Indicators */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
              <div className="p-5 rounded-2xl bg-white/5 border border-white/5">
                <span className="text-[9px] font-black uppercase tracking-wider text-gray-500">Estimated Unique Visitors</span>
                <div className="text-2xl font-black text-white mt-1 flex items-baseline gap-2">
                  {activeAnalyticsLang.analytics.users.toLocaleString()}
                  <span className="text-xs text-emerald-400 font-bold flex items-center gap-0.5">
                    <TrendingUp className="w-3.5 h-3.5" /> +12.4%
                  </span>
                </div>
              </div>
              <div className="p-5 rounded-2xl bg-white/5 border border-white/5">
                <span className="text-[9px] font-black uppercase tracking-wider text-gray-500">Localized Page Views</span>
                <div className="text-2xl font-black text-white mt-1 flex items-baseline gap-2">
                  {activeAnalyticsLang.analytics.views.toLocaleString()}
                  <span className="text-xs text-emerald-400 font-bold flex items-center gap-0.5">
                    <TrendingUp className="w-3.5 h-3.5" /> +8.1%
                  </span>
                </div>
              </div>
            </div>

            {/* Top performing assets */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
              <div className="space-y-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-400 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5" /> Top Tools ({activeAnalyticsLang.name})
                </span>
                {activeAnalyticsLang.analytics.topTools.length > 0 ? (
                  <ul className="space-y-2">
                    {activeAnalyticsLang.analytics.topTools.map((tool, idx) => (
                      <li key={tool} className="text-xs font-bold text-gray-300 bg-white/5 border border-white/5 px-3 py-2 rounded-xl flex justify-between items-center">
                        <span>{tool}</span>
                        <span className="text-[9px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">Rank #{idx+1}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-xs font-bold text-gray-500 italic p-4 bg-white/[0.02] border border-white/5 rounded-xl">No active tool view logs</div>
                )}
              </div>

              <div className="space-y-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-purple-400 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" /> Top Blogs ({activeAnalyticsLang.name})
                </span>
                {activeAnalyticsLang.analytics.topBlogs.length > 0 ? (
                  <ul className="space-y-2">
                    {activeAnalyticsLang.analytics.topBlogs.map((blog, idx) => (
                      <li key={blog} className="text-xs font-bold text-gray-300 bg-white/5 border border-white/5 px-3 py-2 rounded-xl flex justify-between items-center">
                        <span className="truncate max-w-[200px]">{blog}</span>
                        <span className="text-[9px] font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20 shrink-0">Rank #{idx+1}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-xs font-bold text-gray-500 italic p-4 bg-white/[0.02] border border-white/5 rounded-xl">No active blog view logs</div>
                )}
              </div>
            </div>
          </div>
          
          <div className="mt-8 pt-4 border-t border-white/5 text-[9px] font-black uppercase tracking-wider text-gray-500 flex justify-between">
            <span>Database Table: languages</span>
            <span>Realtime Aggregations: page_views</span>
          </div>
        </div>

        {/* Right Col: Missing Translation Keys Alert */}
        <div className="glass p-8 rounded-[2.5rem] border border-white/5 bg-white/[0.01] flex flex-col justify-between">
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-black uppercase tracking-widest text-amber-400 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-500 animate-pulse" /> Translation Gaps
              </h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">
                Keys present in en.json but empty or missing in locales
              </p>
            </div>

            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
              {languages
                .filter(l => l.code !== 'en' && l.missingKeysCount > 0)
                .map(lang => (
                  <div key={lang.code} className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-black uppercase text-white">{lang.flag} {lang.name}</span>
                      <span className="text-[9px] font-black uppercase text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                        {lang.missingKeysCount} missing
                      </span>
                    </div>
                    <ul className="space-y-1.5">
                      {lang.missingKeys.slice(0, 3).map(key => (
                        <li key={key} className="text-[10px] font-mono text-gray-400 truncate bg-black/20 p-1.5 rounded border border-white/5">
                          {key}
                        </li>
                      ))}
                      {lang.missingKeysCount > 3 && (
                        <li className="text-[9px] font-bold text-gray-500 text-center italic">
                          + {lang.missingKeysCount - 3} more key(s) missing
                        </li>
                      )}
                    </ul>
                  </div>
                ))}
              {languages.filter(l => l.code !== 'en' && l.missingKeysCount > 0).length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center gap-3 bg-white/[0.01] border border-white/5 rounded-2xl">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                  <div>
                    <span className="text-xs font-black uppercase text-white">All Clear!</span>
                    <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mt-1">100% translation coverage across locales</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 mt-6 flex gap-3">
            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase text-amber-400">Safety Threshold</span>
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wide leading-relaxed">
                Languages with less than 90% translation progress require administrator confirmation to enable.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Safety Confirmation Modal */}
      {safetyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="glass max-w-md w-full p-8 rounded-[2rem] border border-amber-500/20 bg-gray-950/90 shadow-[0_0_50px_rgba(245,158,11,0.15)] space-y-6">
            <div className="flex items-center gap-3 text-amber-500">
              <ShieldAlert className="w-8 h-8 text-amber-500 animate-pulse" />
              <h3 className="text-lg font-black uppercase tracking-tight text-white">Safety Check Warning</h3>
            </div>
            
            <div className="space-y-3 text-xs text-gray-300 leading-relaxed font-bold uppercase tracking-wide">
              <p>
                You are attempting to enable the language <span className="text-white font-black">{safetyModal.name} ({safetyModal.locale.toUpperCase()})</span>.
              </p>
              <p>
                This language is currently only <span className="text-amber-400 font-black">{safetyModal.progress}% translated</span>. Enabling this language below the recommended <span className="text-white font-black">90% threshold</span> will expose public visitors to mixed/untranslated English content on pages and tools.
              </p>
              <p className="text-[10px] text-gray-500">
                Are you sure you wish to bypass this safety guardrail?
              </p>
            </div>

            <div className="flex gap-4 pt-2">
              <button
                onClick={() => setSafetyModal(null)}
                className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded-xl border border-white/10 text-xs font-black uppercase tracking-widest transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmEnableLanguage}
                className="flex-1 px-4 py-3 bg-amber-500 hover:bg-amber-600 text-black rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)] cursor-pointer"
              >
                Yes, Enable
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
