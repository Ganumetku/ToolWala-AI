"use client";

import { useState } from 'react';
import { 
  CheckCircle2, Clock, Settings, EyeOff, Eye, 
  ArrowRight, FileCode, Lock, Unlock, HelpCircle, 
  Terminal, Sparkles, AlertCircle, Info, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminPublishGuide() {
  // Demo State for Section 9 (Interactive Demo)
  const [demoStatus, setDemoStatus] = useState<'draft' | 'published' | 'scheduled'>('draft');
  const [demoVisible, setDemoVisible] = useState<boolean>(false);
  const [demoDate, setDemoDate] = useState<string>('2026-06-15');
  const [demoLogs, setDemoLogs] = useState<string[]>([
    "System: Tool 'AI Thumbnail Generator' initialized as status: 'draft', isVisible: false."
  ]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setDemoLogs(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 4)]);
  };

  const handleDemoToggle = () => {
    const nextVisible = !demoVisible;
    setDemoVisible(nextVisible);
    addLog(`Action: Visibility toggled to ${nextVisible ? 'ON' : 'OFF'}.`);
  };

  const handleDemoPublish = () => {
    setDemoStatus('published');
    setDemoVisible(true);
    addLog("Action: Clicked 'Publish'. Status changed to 'published' and isVisible set to true.");
  };

  const handleDemoUnpublish = () => {
    setDemoStatus('draft');
    setDemoVisible(false);
    addLog("Action: Clicked 'Unpublish'. Status changed to 'draft' and isVisible set to false.");
  };

  const handleDemoSchedule = (date: string) => {
    if (!date) return;
    setDemoDate(date);
    setDemoStatus('scheduled');
    setDemoVisible(true);
    addLog(`Action: Scheduled for ${date}. Status changed to 'scheduled' and isVisible set to true.`);
  };

  // Live checker for Demo
  const isDemoLive = () => {
    if (!demoVisible) return false;
    if (demoStatus === 'published') return true;
    if (demoStatus === 'scheduled') {
      return new Date(demoDate) <= new Date();
    }
    return false;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#030712] py-24 font-sans text-slate-800 dark:text-gray-200 overflow-hidden relative">
      
      {/* Background Radial Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] bg-blue-600/5 rounded-full blur-[160px] pointer-events-none -z-10" />

      <div className="container mx-auto px-4 max-w-5xl relative z-10">
        
        {/* Header */}
        <div className="mb-16 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-700 dark:text-blue-400 text-[10px] font-black tracking-widest mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            PUBLISH SYSTEM GUIDE & DEMO
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white mb-3 uppercase leading-none">
            Publishing <span className="text-blue-600 dark:text-blue-500">Playbook</span>
          </h1>
          <p className="text-sm text-slate-600 dark:text-gray-400 font-medium max-w-xl">
            A comprehensive, interactive manual detailing ToolWala AI's live publish controls, draft behaviors, overrides, and automatic schedules.
          </p>
        </div>

        {/* Grid Container */}
        <div className="space-y-12">
          
          {/* SECTION 1 — HOW TOOL SYSTEM WORKS */}
          <section className="bg-white dark:bg-white/[0.01] rounded-[2rem] border border-slate-200/80 dark:border-white/5 p-8 relative overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
            <div className="absolute top-0 right-0 p-8 text-blue-500/10 pointer-events-none">
              <FileCode className="w-32 h-32" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-6 flex items-center gap-2">
              <span className="text-blue-600 dark:text-blue-500">01.</span> How the System Works
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
              <div className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-2xl p-6 flex flex-col justify-between">
                <div>
                  <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 font-black text-xs mb-4">1</div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm uppercase mb-2">Write Tool Code</h4>
                  <p className="text-xs text-slate-600 dark:text-gray-400 leading-relaxed font-semibold">
                    Developer adds a new tool inside <code className="text-blue-600 dark:text-blue-400 font-mono">src/data/tools.ts</code>, for example: <span className="text-slate-900 dark:text-white font-bold">"AI Thumbnail Generator"</span>.
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-2xl p-6 flex flex-col justify-between">
                <div>
                  <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-500/10 flex items-center justify-center text-red-600 dark:text-red-400 font-black text-xs mb-4">2</div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm uppercase mb-2">Default Hidden Mode</h4>
                  <p className="text-xs text-slate-600 dark:text-gray-400 leading-relaxed font-semibold">
                    The tool automatically initializes in draft state: <code className="text-red-600 dark:text-red-400 font-mono">status: "draft"</code> and <code className="text-red-600 dark:text-red-400 font-mono">isVisible: false</code>.
                  </p>
                </div>
                <div className="mt-4 text-[9px] text-red-600 dark:text-red-400/80 font-black uppercase tracking-widest flex items-center gap-1.5">
                  <EyeOff className="w-3 h-3" /> Hidden from website
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-2xl p-6 flex flex-col justify-between">
                <div>
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-black text-xs mb-4">3</div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm uppercase mb-2">Admin Control Panel</h4>
                  <p className="text-xs text-slate-600 dark:text-gray-400 leading-relaxed font-semibold">
                    The tool is visible only in the Admin Dashboard, awaiting manual activation. No code redeployment is needed to take it live.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 2 — DASHBOARD EXAMPLE */}
          <section className="bg-white dark:bg-white/[0.01] rounded-[2rem] border border-slate-200/80 dark:border-white/5 p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-6 flex items-center gap-2">
              <span className="text-blue-600 dark:text-blue-500">02.</span> Registry Interface Preview
            </h2>
            <p className="text-xs text-slate-600 dark:text-gray-400 font-medium mb-6">
              Below is a simplified example of how new registry additions look inside your database override tables:
            </p>
            
            <div className="border border-slate-200 dark:border-white/5 rounded-2xl overflow-hidden bg-slate-50/50 dark:bg-black/40">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100/80 dark:bg-white/[0.02] border-b border-slate-200 dark:border-white/5 text-[9px] uppercase tracking-widest text-slate-500 dark:text-gray-500 font-black">
                    <th className="py-3.5 px-6">Tool Name</th>
                    <th className="py-3.5 px-6 text-center">Status</th>
                    <th className="py-3.5 px-6 text-center">Visible</th>
                    <th className="py-3.5 px-6 text-right">Primary Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-100 dark:border-white/[0.02]">
                    <td className="py-4 px-6 font-bold text-slate-900 dark:text-white">AI Thumbnail Generator</td>
                    <td className="py-4 px-6 text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-200 dark:bg-gray-500/10 border border-slate-300 dark:border-gray-500/20 text-slate-700 dark:text-gray-400 text-[9px] uppercase font-bold">
                        <Settings className="w-2.5 h-2.5" /> Draft
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-[9px] uppercase font-bold">
                        OFF
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[9px] font-black uppercase tracking-widest rounded border border-emerald-200 dark:border-emerald-500/20">
                        Publish
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* SECTION 3 — HOW TO MAKE TOOL LIVE */}
          <section className="bg-white dark:bg-white/[0.01] rounded-[2rem] border border-slate-200/80 dark:border-white/5 p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-6 flex items-center gap-2">
              <span className="text-blue-600 dark:text-blue-500">03.</span> Quick Publish Flow
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full border border-slate-200 dark:border-white/10 flex items-center justify-center text-xs font-bold text-slate-500 dark:text-gray-400 shrink-0 bg-slate-100 dark:bg-transparent">1</div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase">Go to Registry</h4>
                    <p className="text-xs text-slate-600 dark:text-gray-400 font-semibold mt-1">Navigate to your domain's admin panel directory at <code className="text-blue-600 dark:text-blue-400">/admin/tools</code>.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full border border-slate-200 dark:border-white/10 flex items-center justify-center text-xs font-bold text-slate-500 dark:text-gray-400 shrink-0 bg-slate-100 dark:bg-transparent">2</div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase">Activate Visibility</h4>
                    <p className="text-xs text-slate-600 dark:text-gray-400 font-semibold mt-1">Slide the visibility switch next to the tool to the **ON** position.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full border border-slate-200 dark:border-white/10 flex items-center justify-center text-xs font-bold text-slate-500 dark:text-gray-400 shrink-0 bg-slate-100 dark:bg-transparent">3</div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase">Click Publish</h4>
                    <p className="text-xs text-slate-600 dark:text-gray-400 font-semibold mt-1">Press the green **Publish** button to transition its database status to published.</p>
                  </div>
                </div>
              </div>

              <div className="bg-emerald-50 dark:bg-emerald-500/5 border border-emerald-200 dark:border-emerald-500/10 rounded-2xl p-6 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-xs">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase">Instant Site-Wide Activation</h4>
                <p className="text-xs text-slate-600 dark:text-gray-400 font-medium leading-relaxed">
                  Once published, the system bypasses internal static caches. The tool instantly appears live on the Homepage, /tools page, Categories listing, Search indexing, and Related shelves.
                </p>
              </div>
            </div>
          </section>

          {/* SECTION 4 — SCHEDULE SYSTEM */}
          <section className="bg-white dark:bg-white/[0.01] rounded-[2rem] border border-slate-200/80 dark:border-white/5 p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-6 flex items-center gap-2">
              <span className="text-blue-600 dark:text-blue-500">04.</span> Automated Release Scheduler
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-2xl p-6 space-y-3">
                <div className="flex justify-between items-center text-[10px] uppercase font-bold text-slate-500 dark:text-gray-500">
                  <span>Target Publish Date:</span>
                  <span className="font-mono text-amber-600 dark:text-yellow-400">2026-06-15</span>
                </div>
                <div className="h-0.5 bg-slate-200 dark:bg-white/5 my-2" />
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5 text-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    <span className="text-slate-600 dark:text-gray-400">Before target date: <strong className="text-red-600 dark:text-red-400">HIDDEN</strong></span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-slate-600 dark:text-gray-400">On or after target date: <strong className="text-emerald-600 dark:text-emerald-400">AUTOMATICALLY LIVE</strong></span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col justify-center space-y-3">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase">Automated Engine Checks</h4>
                <p className="text-xs text-slate-600 dark:text-gray-400 font-medium leading-relaxed">
                  When a tool is scheduled, the frontend calculates target release timestamps compared to the client's current timezone. No developer action, database migrations, or pushes are required on the release date.
                </p>
              </div>
            </div>
          </section>

          {/* SECTION 5 — TOOL STATUS TYPES */}
          <section className="bg-white dark:bg-white/[0.01] rounded-[2rem] border border-slate-200/80 dark:border-white/5 p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-6 flex items-center gap-2">
              <span className="text-blue-600 dark:text-blue-500">05.</span> Status Directory Matrix
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-emerald-50 dark:bg-emerald-500/5 border border-emerald-200 dark:border-emerald-500/10 rounded-2xl p-5 space-y-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <CheckCircle2 className="w-4.5 h-4.5" />
                </div>
                <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Published (Green)</h4>
                <p className="text-[11px] text-slate-600 dark:text-gray-400 font-semibold leading-relaxed">The tool is fully live and publicly accessible on all indices.</p>
              </div>

              <div className="bg-slate-100 dark:bg-gray-500/5 border border-slate-200 dark:border-gray-500/10 rounded-2xl p-5 space-y-3">
                <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-gray-500/10 text-slate-600 dark:text-gray-400 flex items-center justify-center">
                  <Settings className="w-4.5 h-4.5" />
                </div>
                <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Draft (Gray)</h4>
                <p className="text-[11px] text-slate-600 dark:text-gray-400 font-semibold leading-relaxed">The tool is in development phase and strictly hidden from public.</p>
              </div>

              <div className="bg-amber-50 dark:bg-yellow-500/5 border border-amber-200 dark:border-yellow-500/10 rounded-2xl p-5 space-y-3">
                <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-yellow-500/10 text-amber-600 dark:text-yellow-400 flex items-center justify-center">
                  <Clock className="w-4.5 h-4.5" />
                </div>
                <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Scheduled (Yellow)</h4>
                <p className="text-[11px] text-slate-600 dark:text-gray-400 font-semibold leading-relaxed">The tool will go live automatically once its target date is hit.</p>
              </div>

              <div className="bg-red-50 dark:bg-red-500/5 border border-red-200 dark:border-red-500/10 rounded-2xl p-5 space-y-3">
                <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center">
                  <EyeOff className="w-4.5 h-4.5" />
                </div>
                <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Hidden (Red)</h4>
                <p className="text-[11px] text-slate-600 dark:text-gray-400 font-semibold leading-relaxed">Visibility is turned OFF, making the tool hidden regardless of its status.</p>
              </div>
            </div>
          </section>

          {/* SECTION 6 — REAL EXAMPLE */}
          <section className="bg-white dark:bg-white/[0.01] rounded-[2rem] border border-slate-200/80 dark:border-white/5 p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-6 flex items-center gap-2">
              <span className="text-blue-600 dark:text-blue-500">06.</span> Production Live Benchmarks
            </h2>
            <p className="text-xs text-slate-600 dark:text-gray-400 font-medium mb-6">
              The following calculators are pre-compiled and set to <code className="text-emerald-600 dark:text-emerald-400">status: "published"</code> and <code className="text-emerald-600 dark:text-emerald-400">isVisible: true</code> inside the codebase:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {[
                "SIP Calculator", "EMI Calculator", "GST Calculator",
                "YouTube Money", "AdSense Revenue"
              ].map((name) => (
                <div key={name} className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-xl p-4 text-center">
                  <div className="text-xs font-bold text-slate-900 dark:text-white mb-2">{name}</div>
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[9px] uppercase font-black">
                    Live Default
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* SECTION 7 — FUTURE TOOL FLOW */}
          <section className="bg-white dark:bg-white/[0.01] rounded-[2rem] border border-slate-200/80 dark:border-white/5 p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-6 flex items-center gap-2">
              <span className="text-blue-600 dark:text-blue-500">07.</span> Future Releases Roadmap
            </h2>
            <div className="flex flex-col md:flex-row gap-6 items-center">
              <div className="flex-1 space-y-4">
                <div className="p-5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-2xl flex items-center gap-4">
                  <div className="text-2xl">✍️</div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase">Developer creates "AI Blog Writer"</h4>
                    <p className="text-[11px] text-slate-500 dark:text-gray-500 mt-0.5">Appears as draft/hidden in registry automatically.</p>
                  </div>
                </div>
                <div className="flex justify-center text-slate-400 dark:text-gray-600">
                  <ChevronRight className="w-5 h-5 rotate-90 md:rotate-0" />
                </div>
                <div className="p-5 bg-emerald-50 dark:bg-emerald-500/5 border border-emerald-200 dark:border-emerald-500/10 rounded-2xl flex items-center gap-4">
                  <div className="text-2xl">⚡</div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase">Admin Toggle + Activate ON</h4>
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-bold mt-0.5">Instant activation. No codebase adjustments required.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 8 — IMPORTANT RULES */}
          <section className="bg-white dark:bg-white/[0.01] rounded-[2rem] border border-slate-200/80 dark:border-white/5 p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 text-amber-500/10 pointer-events-none">
              <AlertCircle className="w-32 h-32" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-6 flex items-center gap-2">
              <span className="text-blue-600 dark:text-blue-500">08.</span> Ground Rules & Best Practices
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10 text-xs text-slate-600 dark:text-gray-400 font-semibold leading-relaxed">
              <div className="space-y-4">
                <div className="flex gap-2">
                  <span className="text-blue-600 dark:text-blue-500">•</span>
                  <p><strong className="text-slate-900 dark:text-white">Zero Auto-Publishing:</strong> Newly registered tools default to draft/hidden state to guarantee zero accidental leaks.</p>
                </div>
                <div className="flex gap-2">
                  <span className="text-blue-600 dark:text-blue-500">•</span>
                  <p><strong className="text-slate-900 dark:text-white">Dynamic Local Memory:</strong> The admin dashboard acts on client override tables, maintaining high visual speed.</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <span className="text-blue-600 dark:text-blue-500">•</span>
                  <p><strong className="text-slate-900 dark:text-white">TZ Independence:</strong> Release checks execute timestamps matching server offsets so scheduling behaves correctly.</p>
                </div>
                <div className="flex gap-2">
                  <span className="text-blue-600 dark:text-blue-500">•</span>
                  <p><strong className="text-slate-900 dark:text-white">Production Safety:</strong> Deactivating visibility hides a tool instantly from all indices without breaking deep links.</p>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 9 — ADD DEMO COMPONENT */}
          <section className="bg-white dark:bg-white/[0.01] rounded-[2rem] border border-slate-200/80 dark:border-white/5 p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] relative">
            <div className="absolute top-0 right-0 p-4">
              <span className="px-2 py-1 rounded bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-700 dark:text-blue-400 text-[9px] uppercase font-black">
                Interactive Simulator
              </span>
            </div>
            
            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-6 flex items-center gap-2">
              <span className="text-blue-600 dark:text-blue-500">09.</span> Playbook Sandbox Simulator
            </h2>
            <p className="text-xs text-slate-600 dark:text-gray-400 font-medium mb-8">
              Click the controls below to test state transitions and live previews for the sandbox tool <strong className="text-slate-900 dark:text-white">"AI Thumbnail Generator"</strong>:
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Simulator Card (Left) */}
              <div className="lg:col-span-5 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/5 rounded-3xl p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center text-lg shadow-xs">
                      🖼️
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">AI Thumbnail Generator</h4>
                      <span className="text-[10px] text-slate-400 dark:text-gray-500">Image Tools</span>
                    </div>
                  </div>
                  <div className="shrink-0">
                    {demoVisible ? (
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-500 block shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                    ) : (
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500 block" />
                    )}
                  </div>
                </div>

                <div className="space-y-3.5 border-y border-slate-200 dark:border-white/5 py-4 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-gray-500">Status:</span>
                    <span className={`font-bold uppercase ${
                      demoStatus === 'published' ? 'text-emerald-600 dark:text-emerald-400' :
                      demoStatus === 'scheduled' ? 'text-amber-600 dark:text-yellow-400' : 'text-slate-500 dark:text-gray-400'
                    }`}>{demoStatus}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-gray-500">Visible:</span>
                    <span className={`font-bold ${demoVisible ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'}`}>
                      {demoVisible ? 'ON' : 'OFF'}
                    </span>
                  </div>
                  {demoStatus === 'scheduled' && (
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-gray-500">Release Date:</span>
                      <span className="text-amber-600 dark:text-yellow-400">{demoDate}</span>
                    </div>
                  )}
                </div>

                {/* Live Output */}
                <div className="pt-2 text-center">
                  {isDemoLive() ? (
                    <div className="px-4 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-black uppercase tracking-widest animate-pulse">
                      ✅ Live on Website
                    </div>
                  ) : (
                    <div className="px-4 py-2.5 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400 text-xs font-black uppercase tracking-widest">
                      ❌ Hidden from Public
                    </div>
                  )}
                </div>
              </div>

              {/* Controls (Middle) */}
              <div className="lg:col-span-4 space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-slate-500 dark:text-gray-500">Visibility Control</label>
                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/5">
                    <span className="text-xs font-bold text-slate-900 dark:text-white uppercase">Visibility (ON/OFF)</span>
                    <button
                      onClick={handleDemoToggle}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        demoVisible ? 'bg-blue-600' : 'bg-slate-300 dark:bg-gray-800'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          demoVisible ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-slate-500 dark:text-gray-500">Publish Transitions</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={handleDemoPublish}
                      className="py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-colors active:scale-95 shadow-md shadow-emerald-500/20"
                    >
                      Publish
                    </button>
                    <button
                      onClick={handleDemoUnpublish}
                      className="py-3.5 bg-slate-200 dark:bg-gray-800 hover:bg-slate-300 dark:hover:bg-gray-700 text-slate-700 dark:text-gray-400 text-[10px] font-black uppercase tracking-widest rounded-xl transition-colors active:scale-95 border border-slate-300 dark:border-white/5"
                    >
                      Unpublish
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-slate-500 dark:text-gray-500">Schedule Launch</label>
                  <input
                    type="date"
                    value={demoDate}
                    onChange={(e) => handleDemoSchedule(e.target.value)}
                    className="w-full bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-all font-mono"
                  />
                </div>
              </div>

              {/* Console Logs (Right) */}
              <div className="lg:col-span-3 space-y-2 h-full">
                <label className="text-[10px] uppercase font-bold text-slate-500 dark:text-gray-500 flex items-center gap-1">
                  <Terminal className="w-3.5 h-3.5 text-blue-600 dark:text-blue-500" /> Console Logs
                </label>
                <div className="bg-slate-900 dark:bg-[#0b0f19] border border-slate-800 dark:border-white/5 rounded-3xl p-5 h-[280px] font-mono text-[10px] leading-relaxed text-slate-300 dark:text-gray-500 overflow-y-auto space-y-2.5 select-none shadow-inner">
                  {demoLogs.map((log, index) => (
                    <div 
                      key={index}
                      className={`${index === 0 ? 'text-blue-400 font-bold' : ''}`}
                    >
                      {log}
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </section>

          {/* SECTION 10 — FINAL RESULT SUMMARY */}
          <section className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-600/10 dark:to-indigo-600/10 border border-blue-200 dark:border-blue-500/20 rounded-[2rem] p-8 text-center space-y-4 shadow-xs">
            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto shadow-xs">
              <Info className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">System Summary & Output</h3>
            <p className="text-xs text-slate-600 dark:text-gray-400 font-medium max-w-2xl mx-auto leading-relaxed">
              With this upgrade, you hold complete autonomy over the activation timeline of ToolWala AI. Create drafts securely in code, test them locally, and deploy safely. When you are ready, slide the visibility toggle and publish directly from the dashboard to make additions live instantly.
            </p>
          </section>

        </div>

      </div>
    </div>
  );
}
