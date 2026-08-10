"use client";

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  ChevronLeft, ChevronDown, TrendingUp, RefreshCw, Activity, Wallet, Target,
  ShieldCheck, Zap, BookOpen, CheckCircle2, ArrowUp, Copy, DollarSign, Eye,
  Play
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer
} from 'recharts';
import { MeshGradient, FloatingParticles } from '@/components/BackgroundEffects';
import ToolVisibilityGuard from '@/components/ToolVisibilityGuard';
import { toolsData } from '@/data/tools';
import { toolArticles } from '@/data/toolArticles';
import ToolArticle from '@/components/ToolArticle';

// ─── Types ────────────────────────────────────────────────────────────────────

type Niche = 'Tech' | 'Finance' | 'Gaming' | 'Education' | 'Entertainment' | 'Lifestyle' | 'Shorts';

interface NicheConfig {
  label: Niche;
  emoji: string;
  defaultCpm: number;
  defaultRpm: number;
  color: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const NICHES: NicheConfig[] = [
  { label: 'Tech',          emoji: '💻', defaultCpm: 8,   defaultRpm: 4.5,  color: '#3b82f6' },
  { label: 'Finance',       emoji: '📈', defaultCpm: 14,  defaultRpm: 7.5,  color: '#10b981' },
  { label: 'Gaming',        emoji: '🎮', defaultCpm: 4,   defaultRpm: 2.0,  color: '#8b5cf6' },
  { label: 'Education',     emoji: '📚', defaultCpm: 9,   defaultRpm: 5.0,  color: '#f59e0b' },
  { label: 'Entertainment', emoji: '🎭', defaultCpm: 5,   defaultRpm: 2.5,  color: '#ec4899' },
  { label: 'Lifestyle',     emoji: '✨', defaultCpm: 6,   defaultRpm: 3.2,  color: '#f97316' },
  { label: 'Shorts',        emoji: '⚡', defaultCpm: 1.5, defaultRpm: 0.05, color: '#ef4444' },
];

const VIEW_PRESETS = [
  { label: '10K',  value: 10_000 },
  { label: '100K', value: 100_000 },
  { label: '1M',   value: 1_000_000 },
  { label: '10M',  value: 10_000_000 },
];

const formatCurrency = (v: number, compact = false) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: compact ? 'compact' : 'standard',
    maximumFractionDigits: compact ? 1 : 2,
  }).format(v);

const formatViews = (v: number) =>
  new Intl.NumberFormat('en-IN', { notation: 'compact', compactDisplay: 'short' }).format(v);

// ─── Sub-components ───────────────────────────────────────────────────────────

function SliderInput({
  label, value, onChange, min, max, step, suffix = '', helperText, placeholder = '', icon: Icon,
}: {
  label: string; value: number | ''; onChange: (v: number | '') => void;
  min: number; max: number; step: number; suffix?: string;
  helperText?: string; placeholder?: string; icon: React.ElementType;
}) {
  const numVal = Number(value) || 0;
  const pct = Math.min(100, Math.max(0, ((numVal - min) / (max - min)) * 100));

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div className="flex items-center gap-2">
          <Icon className="w-5 h-5 text-red-400" />
          <label className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">{label}</label>
        </div>
        <div className="relative flex items-center w-full sm:w-44">
          <input
            type="number"
            min={min} max={max} step={step}
            value={value}
            placeholder={placeholder}
            onChange={e => {
              const val: number | '' = e.target.value === '' ? '' : Number(e.target.value);
              onChange(val);
            }}
            onBlur={() => {
              if (value !== '' && numVal < min) onChange(min);
              if (value !== '' && numVal > max) onChange(max);
            }}
            className="w-full bg-slate-100 dark:bg-black/40 border border-slate-300 dark:border-white/10 hover:border-slate-400 dark:hover:border-white/20 rounded-xl py-3 px-4 pr-10 text-slate-900 dark:text-white font-mono text-lg text-center focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all placeholder:text-slate-400 dark:placeholder:text-white/20 shadow-inner dark:shadow-none"
          />
          {suffix && <span className="absolute right-4 text-slate-500 dark:text-gray-500 text-sm font-bold pointer-events-none">{suffix}</span>}
        </div>
      </div>
      {helperText && <p className="text-xs text-slate-600 dark:text-gray-400 font-medium">{helperText}</p>}
      <div className="relative w-full h-2 bg-slate-200 dark:bg-white/5 rounded-full overflow-hidden">
        <motion.div
          className="absolute top-0 left-0 h-full bg-red-500 pointer-events-none"
          animate={{ width: `${pct}%` }}
          transition={{ type: 'spring', stiffness: 100, damping: 20 }}
        />
        <input
          type="range" min={min} max={max} step={step}
          value={numVal}
          onChange={e => onChange(Number(e.target.value))}
          className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="glass rounded-xl border border-white/10 p-3 bg-black/80 backdrop-blur-md text-xs">
        <p className="text-gray-400 mb-1 font-bold">{label}</p>
        <p className="text-red-400 font-black">{formatCurrency(payload[0].value)}</p>
      </div>
    );
  }
  return null;
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function YoutubeMoneyCalculatorPage() {
  const [faqExpanded, setFaqExpanded] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  // Inputs
  const [monthlyViews, setMonthlyViews] = useState<number | ''>(1_000_000);
  const [cpm, setCpm]                   = useState<number | ''>(8);
  const [rpm, setRpm]                   = useState<number | ''>(4.5);
  const [selectedNiche, setSelectedNiche] = useState<Niche>('Tech');

  // Apply niche preset
  const applyNiche = (niche: NicheConfig) => {
    setSelectedNiche(niche.label);
    setCpm(niche.defaultCpm);
    setRpm(niche.defaultRpm);
  };

  const results = useMemo(() => {
    const views   = Number(monthlyViews) || 0;
    const rpmVal  = Number(rpm)          || 0;
    // RPM = Revenue per 1000 views (most accurate)
    const monthly  = (views / 1000) * rpmVal;
    const yearly   = monthly * 12;
    const per1k    = rpmVal;
    return { monthly, yearly, per1k };
  }, [monthlyViews, rpm]);

  // Chart data: views at 6 milestones up to monthlyViews
  const chartData = useMemo(() => {
    const views  = Number(monthlyViews) || 1_000_000;
    const rpmVal = Number(rpm)          || 0;
    const points = 6;
    return Array.from({ length: points }, (_, i) => {
      const v = Math.round((views / points) * (i + 1));
      return {
        views: formatViews(v),
        earnings: parseFloat(((v / 1000) * rpmVal).toFixed(2)),
      };
    });
  }, [monthlyViews, rpm]);

  const currentNicheConfig = NICHES.find(n => n.label === selectedNiche)!;

  const handleCopy = async () => {
    try {
      const text = [
        `Niche: ${selectedNiche}`,
        `Monthly Views: ${Number(monthlyViews).toLocaleString()}`,
        `CPM: $${cpm}  |  RPM: $${rpm}`,
        '',
        `Monthly Earnings: ${formatCurrency(results.monthly)}`,
        `Yearly Earnings:  ${formatCurrency(results.yearly)}`,
        `Per 1,000 views:  ${formatCurrency(results.per1k)}`,
        '',
        'Estimated via ToolWala AI – youtube-money-calculator',
      ].join('\n');
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* silent */ }
  };

  const relatedTools = toolsData.filter(t =>
    ['gst-calculator', 'sip-calculator', 'emi-calculator'].includes(t.slug)
  );

  const faqs = [
    {
      q: 'What is CPM on YouTube?',
      a: 'CPM (Cost Per Mille) is the amount advertisers pay per 1,000 ad impressions. It represents the demand-side cost before YouTube takes its cut.',
    },
    {
      q: 'What is RPM on YouTube?',
      a: 'RPM (Revenue Per Mille) is how much YOU earn per 1,000 views after YouTube takes its ~45% share. RPM = CPM × 0.55 approximately, though it varies widely by geography and niche.',
    },
    {
      q: 'Why does my niche matter?',
      a: 'Finance and Tech channels attract high-value advertisers who pay premium CPMs ($10–$30). Gaming or Entertainment channels have lower CPMs ($2–$6) since their ad categories are less competitive.',
    },
    {
      q: 'How accurate is this calculator?',
      a: 'It provides a solid estimate. Actual earnings depend on viewer geography, watch time, video length, seasonality, ad blockers, and your channel\'s engagement metrics. Always treat the result as a range.',
    },
    {
      q: 'Do YouTube Shorts pay the same as long videos?',
      a: 'No. Shorts have a significantly lower RPM (often $0.03–$0.07) since monetisation is from a separate Shorts ad pool. The preset in this calculator reflects that difference.',
    },
  ];

  return (
    <ToolVisibilityGuard slug="youtube-money-calculator">
      <div className="bg-[#F6F8FC] dark:bg-[#030712] min-h-screen py-24 relative overflow-hidden font-sans transition-colors duration-250 font-sans">

        <MeshGradient />
        <FloatingParticles />
        {/* Red ambient glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-red-600/5 rounded-full blur-[140px] pointer-events-none z-0" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl relative z-10">

          {/* Back */}
          <Link
            href="/tools"
            className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-widest text-gray-500 hover:text-red-400 transition-colors mb-10 group"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Directory
          </Link>

          {/* ── Hero ─────────────────────────────────────────────────────────── */}
          <div className="text-center max-w-4xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-black tracking-widest mb-6 shadow-2xl">
              <Play className="w-4 h-4" />
              <span>YouTube Revenue Estimator</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 dark:text-white mb-2 uppercase leading-none">
              YouTube Money<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-rose-400 to-orange-400">
                Calculator
              </span>
            </h1>

            <p className="text-sm sm:text-base text-gray-400 leading-relaxed font-medium mb-8 max-w-2xl mx-auto mt-6">
              Estimate your YouTube ad revenue based on views, CPM, RPM, and niche. 
              Instantly see monthly &amp; yearly earnings.
            </p>

            <div className="flex flex-wrap justify-center gap-6 text-[10px] sm:text-xs font-black text-gray-500 uppercase tracking-widest mb-10">
              <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-red-500" /> 100% Private</span>
              <span className="flex items-center gap-1.5"><Zap className="w-4 h-4 text-red-500" /> Instant Results</span>
              <span className="flex items-center gap-1.5"><Activity className="w-4 h-4 text-red-500" /> 7 Niches</span>
            </div>

            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <button
                onClick={() => document.getElementById('calculator-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="w-full sm:w-auto px-8 py-4 bg-red-500 hover:bg-red-400 text-white font-black uppercase tracking-widest text-sm rounded-full transition-transform hover:scale-105 active:scale-95 shadow-lg shadow-red-500/20"
              >
                Estimate Earnings
              </button>
              <button
                onClick={() => document.getElementById('learn-more-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-widest text-sm rounded-full transition-transform hover:scale-105 active:scale-95 border border-white/10"
              >
                How It Works
              </button>
            </div>
          </div>

          {/* ── Calculator ───────────────────────────────────────────────────── */}
          <div id="calculator-section" className="flex flex-col lg:flex-row gap-8 mb-16 pt-4">

            {/* Inputs Panel */}
            <div className="w-full lg:w-5/12 space-y-6 shrink-0">
              <div className="glass rounded-[2.5rem] border border-white/5 shadow-2xl p-6 sm:p-8 bg-white/[0.01]">

                <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-8">
                  <div className="flex items-center gap-2">
                    <Play className="w-5 h-5 text-red-400" />
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">Channel Settings</h3>
                  </div>
                  <button
                    onClick={() => { setMonthlyViews(1_000_000); setCpm(8); setRpm(4.5); setSelectedNiche('Tech'); }}
                    className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-gray-500 hover:text-red-400 transition-colors"
                  >
                    <RefreshCw className="w-3 h-3" /> Reset
                  </button>
                </div>

                <div className="space-y-9">

                  {/* Niche Selector */}
                  <div className="space-y-3">
                    <p className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">Select Your Niche</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-2">
                      {NICHES.map(n => (
                        <button
                          key={n.label}
                          onClick={() => applyNiche(n)}
                          className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-bold transition-all ${
                            selectedNiche === n.label
                              ? 'bg-red-500/20 border-red-500/50 text-white shadow-lg shadow-red-500/10'
                              : 'bg-white/[0.02] border-white/10 text-gray-400 hover:border-red-500/30 hover:text-white'
                          }`}
                        >
                          <span>{n.emoji}</span>
                          <span>{n.label}</span>
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500">Selecting a niche auto-fills typical CPM &amp; RPM values.</p>
                  </div>

                  {/* View Presets */}
                  <div className="space-y-3">
                    <SliderInput
                      label="Monthly Views"
                      icon={Eye}
                      value={monthlyViews}
                      onChange={setMonthlyViews}
                      min={1000} max={100_000_000} step={1000}
                      helperText="Total views your channel gets per month."
                      placeholder="1000000"
                    />
                    <div className="flex flex-wrap gap-2">
                      {VIEW_PRESETS.map(p => (
                        <button
                          key={p.label}
                          onClick={() => setMonthlyViews(p.value)}
                          className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                            Number(monthlyViews) === p.value
                              ? 'bg-red-500/20 border-red-500/50 text-red-400'
                              : 'bg-white/[0.02] border-white/10 text-gray-400 hover:border-red-500/30 hover:text-white'
                          }`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <SliderInput
                    label="CPM (Cost Per Mille)"
                    icon={DollarSign}
                    value={cpm}
                    onChange={setCpm}
                    min={0.5} max={50} step={0.5}
                    suffix="$"
                    helperText="What advertisers pay per 1,000 ad impressions."
                    placeholder="8"
                  />

                  <SliderInput
                    label="RPM (Revenue Per Mille)"
                    icon={TrendingUp}
                    value={rpm}
                    onChange={setRpm}
                    min={0.05} max={30} step={0.05}
                    suffix="$"
                    helperText="What YOU earn per 1,000 views (after YouTube's cut)."
                    placeholder="4.5"
                  />

                </div>
              </div>
            </div>

            {/* Results Panel */}
            <div className="w-full lg:w-7/12 flex flex-col gap-6">

              {/* Main Results Card */}
              <div className="glass rounded-[2.5rem] border border-white/5 shadow-2xl overflow-hidden bg-white/[0.01] relative group">
                <div className="absolute top-0 right-0 w-72 h-72 bg-red-500/10 rounded-full blur-3xl pointer-events-none group-hover:scale-110 transition-transform duration-700" />

                <div className="p-8 sm:p-10 relative z-10">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-2">
                      <Target className="w-6 h-6 text-red-400" />
                      <span className="text-sm font-black uppercase tracking-widest text-white">💰 Earnings Estimate</span>
                    </div>
                    <button
                      onClick={handleCopy}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-bold text-gray-300 transition-colors border border-white/10"
                    >
                      {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-red-400" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>

                  {/* Monthly Earnings Hero */}
                  <div className="text-center mb-8">
                    <span className="text-xs font-bold uppercase tracking-widest text-red-400 mb-2 block">Monthly Earnings</span>
                    <motion.div
                      key={results.monthly}
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-5xl sm:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-400 tracking-tight leading-none"
                    >
                      {formatCurrency(results.monthly)}
                    </motion.div>
                    <p className="text-xs text-gray-500 mt-2">
                      Based on <span className="text-white font-bold">{formatViews(Number(monthlyViews) || 0)} views</span> at <span className="text-red-400 font-bold">${rpm} RPM</span>
                    </p>
                  </div>

                  {/* Stat Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 text-center">
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-2">Yearly Earnings</span>
                      <span className="text-2xl font-black text-white">{formatCurrency(results.yearly, true)}</span>
                    </div>
                    <div className="bg-red-500/[0.04] border border-red-500/10 rounded-2xl p-5 text-center">
                      <span className="text-[10px] font-black uppercase tracking-widest text-red-400/70 block mb-2">Per 1,000 Views</span>
                      <span className="text-2xl font-black text-red-400">{formatCurrency(results.per1k)}</span>
                    </div>
                  </div>

                  {/* Niche badge */}
                  <div className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white/[0.02] border border-white/5">
                    <span className="text-lg">{currentNicheConfig.emoji}</span>
                    <span className="text-xs font-black uppercase tracking-widest text-gray-400">
                      {selectedNiche} Niche · CPM ${cpm} · RPM ${rpm}
                    </span>
                  </div>
                </div>
              </div>

              {/* Views vs Earnings Chart */}
              <div className="glass rounded-3xl border border-white/5 p-6 sm:p-8 bg-white/[0.01]">
                <h3 className="text-xs font-black uppercase tracking-widest text-red-400 mb-6">Views vs Earnings</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <defs>
                      <linearGradient id="ytGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="views" tick={{ fill: '#6b7280', fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#6b7280', fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} width={45} />
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="earnings"
                      stroke="#ef4444"
                      strokeWidth={2.5}
                      fill="url(#ytGrad)"
                      dot={{ r: 4, fill: '#ef4444', strokeWidth: 0 }}
                      activeDot={{ r: 6, fill: '#ef4444', stroke: '#fff', strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Disclaimer */}
              <div className="flex gap-3 items-start glass rounded-2xl border border-yellow-500/10 bg-yellow-500/[0.03] p-5">
                <span className="text-yellow-400 text-lg shrink-0">⚠️</span>
                <p className="text-xs text-yellow-300/70 font-medium leading-relaxed">
                  <strong className="text-yellow-400 font-black">Disclaimer: </strong>
                  This is an estimated earning. Actual YouTube revenue depends on niche, country, audience, ads, engagement, and seasonal fluctuations. Use this tool as a directional guide only.
                </p>
              </div>
            </div>
          </div>

          {/* ── Educational Section ───────────────────────────────────────────── */}
          <section id="learn-more-section" className="py-20 border-t border-white/5 mt-8 scroll-mt-10">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-red-400 text-xs font-black tracking-widest mb-6">
                <BookOpen className="w-4 h-4" />
                <span>YouTube Monetisation Guide</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight uppercase mb-6">
                📚 How YouTube Earnings Work
              </h2>
              <p className="text-gray-400 text-base sm:text-lg font-medium leading-relaxed">
                Understand CPM, RPM, and how your niche directly impacts your revenue per view.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
              {[
                {
                  title: 'CPM vs RPM',
                  color: 'text-red-400',
                  body: 'CPM is what advertisers pay. RPM is what you receive — typically 45–55% of CPM after YouTube\'s cut. Always optimise for RPM when measuring your channel\'s health.',
                },
                {
                  title: 'How to Increase Earnings',
                  color: 'text-orange-400',
                  body: 'Target finance/tech niches, create longer videos (8+ mins for mid-rolls), focus on Tier-1 audiences (US/UK/Canada/Australia), and enable all ad formats.',
                },
                {
                  title: 'YouTube Shorts Revenue',
                  color: 'text-rose-400',
                  body: 'Shorts are monetised via the YouTube Shorts Bonus Pool, not traditional AdSense. RPM is significantly lower ($0.03–$0.06). Shorts work best as a discovery funnel to long-form content.',
                },
                {
                  title: 'Other Revenue Streams',
                  color: 'text-pink-400',
                  body: 'Successful creators also earn via memberships, Super Chats, merch shelf, brand deals, and affiliate marketing — often exceeding AdSense revenue by 3–5×.',
                },
              ].map(card => (
                <div key={card.title} className="glass rounded-[2rem] border border-white/5 p-8 bg-white/[0.01] hover:bg-white/[0.02] transition-colors">
                  <h3 className={`text-xl font-black uppercase tracking-widest mb-4 ${card.color}`}>{card.title}</h3>
                  <p className="text-gray-300 leading-relaxed font-medium">{card.body}</p>
                </div>
              ))}
            </div>

            {/* FAQ */}
            <div className="max-w-3xl mx-auto mb-20">
              <div className="text-center mb-8">
                <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase mb-2">Frequently Asked Questions</h3>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Everything about YouTube money</p>
              </div>
              <div className="space-y-4">
                {faqs.map((faq, i) => {
                  const open = faqExpanded === i;
                  return (
                    <div key={i} className="glass rounded-2xl border border-white/5 bg-white/[0.01] overflow-hidden">
                      <button
                        onClick={() => setFaqExpanded(open ? null : i)}
                        className="w-full flex items-center justify-between p-5 text-left focus:outline-none"
                      >
                        <span className="text-sm font-black text-white hover:text-red-400 transition-colors">{faq.q}</span>
                        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-300 flex-shrink-0 ml-4 ${open ? 'rotate-180 text-red-400' : ''}`} />
                      </button>
                      <AnimatePresence initial={false}>
                        {open && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2, ease: 'easeInOut' }}
                          >
                            <div className="px-5 pb-5 border-t border-white/5 text-xs text-gray-400 leading-relaxed font-semibold pt-3">
                              {faq.a}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Related Tools */}
            {relatedTools.length > 0 && (
              <div className="mt-16">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase mb-8 text-center">Related Tools</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
                  {relatedTools.map(tool => (
                    <Link key={tool.slug} href={tool.href} className="glass rounded-2xl border border-white/5 p-6 bg-white/[0.01] hover:bg-white/[0.05] transition-all group">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-3xl group-hover:scale-110 transition-transform">{tool.icon}</span>
                        <h4 className="text-sm font-black text-slate-900 dark:text-white">{tool.title}</h4>
                      </div>
                      <p className="text-xs text-gray-400 font-medium">{tool.description}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <div className="text-center py-12 border-t border-white/5 mt-16">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-8">Ready to estimate your earnings?</h3>
              <button
                onClick={() => document.getElementById('calculator-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-8 py-4 bg-red-500 hover:bg-red-400 text-white font-black uppercase tracking-widest text-sm rounded-full transition-transform hover:scale-105 flex items-center justify-center gap-2 mx-auto shadow-lg shadow-red-500/20"
              >
                <ArrowUp className="w-5 h-5" />
                Back to Calculator
              </button>
            </div>
          </section>

        </div>

        {toolArticles['youtube-money-calculator'] && (
          <ToolArticle {...toolArticles['youtube-money-calculator']} />
        )}
      </div>
    </ToolVisibilityGuard>
  );
}
