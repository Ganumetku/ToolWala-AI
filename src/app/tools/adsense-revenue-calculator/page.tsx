"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import {
  ChevronLeft, ChevronDown, TrendingUp, RefreshCw, Activity,
  Target, ShieldCheck, Zap, BookOpen, CheckCircle2, ArrowUp,
  Copy, DollarSign, Eye, MousePointerClick, Globe, BarChart3,
  Calculator
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer
} from "recharts";
import { MeshGradient, FloatingParticles } from "@/components/BackgroundEffects";
import ToolVisibilityGuard from "@/components/ToolVisibilityGuard";
import { toolsData } from "@/data/tools";
import { toolArticles } from "@/data/toolArticles";
import ToolArticle from "@/components/ToolArticle";
import ToolCard from "@/components/ToolCard";
import ToolIcon from "@/components/ToolIcon";
import PdfToolIcon from '@/components/PdfToolIcon';

// ─── Types ─────────────────────────────────────────────────────────────────────

type CalcMode = "cpc-ctr" | "rpm";
type Niche = "Finance" | "Tech" | "Education" | "Health" | "Blog" | "News" | "Entertainment";

interface NicheConfig { label: Niche; emoji: string; avgCpc: number; avgCtr: number; avgRpm: number; }
interface CountryConfig {
  label: string;
  flag: string;
  /** Multiplier applied to CPC (advertiser demand side). */
  cpcMultiplier: number;
  /** Multiplier applied to RPM (publisher revenue side). Typically ~= cpcMultiplier × 0.68 × fillRate. */
  rpmMultiplier: number;
  /** Human-readable tier label for display */
  tier: "Tier 1" | "Tier 2" | "Tier 3";
}

// ─── Static Data ───────────────────────────────────────────────────────────────

const NICHES: NicheConfig[] = [
  { label: "Finance",       emoji: "📈", avgCpc: 1.8,  avgCtr: 1.5, avgRpm: 22 },
  { label: "Tech",          emoji: "💻", avgCpc: 1.2,  avgCtr: 1.2, avgRpm: 14 },
  { label: "Education",     emoji: "📚", avgCpc: 0.9,  avgCtr: 1.0, avgRpm: 9  },
  { label: "Health",        emoji: "🏥", avgCpc: 2.1,  avgCtr: 1.4, avgRpm: 25 },
  { label: "Blog",          emoji: "✍️", avgCpc: 0.5,  avgCtr: 0.8, avgRpm: 4  },
  { label: "News",          emoji: "📰", avgCpc: 0.4,  avgCtr: 0.6, avgRpm: 3  },
  { label: "Entertainment", emoji: "🎭", avgCpc: 0.6,  avgCtr: 0.9, avgRpm: 5  },
];

// ─── Country Configuration (Centralized) ─────────────────────────────────────
//
// cpcMultiplier: relative to USA CPC = 1.0
// rpmMultiplier: relative to USA RPM = 1.0 (accounts for ad fill rate + demand)
// Rule: USA > UK ≈ Canada > Australia > Germany/NL > FR/JP/SG > UAE > KR/ES/IT
//       > SA/BR > MX > IN/MY > ID/PH > LK/NG > NP/BD/PK
//
const COUNTRIES: CountryConfig[] = [
  // ── Tier 1 ──────────────────────────────────────────────────────────────
  { label: "USA",          flag: "🇺🇸", tier: "Tier 1", cpcMultiplier: 1.00, rpmMultiplier: 1.00 },
  { label: "UK",           flag: "🇬🇧", tier: "Tier 1", cpcMultiplier: 0.90, rpmMultiplier: 0.90 },
  { label: "Canada",       flag: "🇨🇦", tier: "Tier 1", cpcMultiplier: 0.88, rpmMultiplier: 0.88 },
  { label: "Australia",    flag: "🇦🇺", tier: "Tier 1", cpcMultiplier: 0.86, rpmMultiplier: 0.86 },
  // ── Tier 2 – Europe ─────────────────────────────────────────────────────
  { label: "Germany",      flag: "🇩🇪", tier: "Tier 2", cpcMultiplier: 0.70, rpmMultiplier: 0.70 },
  { label: "Netherlands",  flag: "🇳🇱", tier: "Tier 2", cpcMultiplier: 0.68, rpmMultiplier: 0.68 },
  { label: "Singapore",    flag: "🇸🇬", tier: "Tier 2", cpcMultiplier: 0.66, rpmMultiplier: 0.66 },
  { label: "France",       flag: "🇫🇷", tier: "Tier 2", cpcMultiplier: 0.65, rpmMultiplier: 0.65 },
  { label: "UAE",          flag: "🇦🇪", tier: "Tier 2", cpcMultiplier: 0.62, rpmMultiplier: 0.62 },
  { label: "Spain",        flag: "🇪🇸", tier: "Tier 2", cpcMultiplier: 0.55, rpmMultiplier: 0.55 },
  { label: "Italy",        flag: "🇮🇹", tier: "Tier 2", cpcMultiplier: 0.50, rpmMultiplier: 0.50 },
  { label: "Japan",        flag: "🇯🇵", tier: "Tier 2", cpcMultiplier: 0.60, rpmMultiplier: 0.60 },
  { label: "South Korea",  flag: "🇰🇷", tier: "Tier 2", cpcMultiplier: 0.55, rpmMultiplier: 0.55 },
  { label: "Saudi Arabia", flag: "🇸🇦", tier: "Tier 2", cpcMultiplier: 0.45, rpmMultiplier: 0.45 },
  // ── Tier 3 – Americas ───────────────────────────────────────────────────
  { label: "Brazil",       flag: "🇧🇷", tier: "Tier 3", cpcMultiplier: 0.35, rpmMultiplier: 0.35 },
  { label: "Mexico",       flag: "🇲🇽", tier: "Tier 3", cpcMultiplier: 0.30, rpmMultiplier: 0.30 },
  // ── Tier 3 – South & Southeast Asia ────────────────────────────────────
  { label: "India",        flag: "🇮🇳", tier: "Tier 3", cpcMultiplier: 0.25, rpmMultiplier: 0.25 },
  { label: "Pakistan",     flag: "🇵🇰", tier: "Tier 3", cpcMultiplier: 0.18, rpmMultiplier: 0.18 },
  { label: "Bangladesh",   flag: "🇧🇩", tier: "Tier 3", cpcMultiplier: 0.16, rpmMultiplier: 0.16 },
  { label: "Nigeria",      flag: "🇳🇬", tier: "Tier 3", cpcMultiplier: 0.15, rpmMultiplier: 0.15 },
  { label: "Malaysia",     flag: "🇲🇾", tier: "Tier 3", cpcMultiplier: 0.22, rpmMultiplier: 0.22 },
  { label: "Indonesia",    flag: "🇮🇩", tier: "Tier 3", cpcMultiplier: 0.20, rpmMultiplier: 0.20 },
  { label: "Philippines",  flag: "🇵🇭", tier: "Tier 3", cpcMultiplier: 0.19, rpmMultiplier: 0.19 },
  { label: "Sri Lanka",    flag: "🇱🇰", tier: "Tier 3", cpcMultiplier: 0.17, rpmMultiplier: 0.17 },
  { label: "Nepal",        flag: "🇳🇵", tier: "Tier 3", cpcMultiplier: 0.17, rpmMultiplier: 0.17 },
  { label: "South Africa", flag: "🇿🇦", tier: "Tier 3", cpcMultiplier: 0.20, rpmMultiplier: 0.20 },
];

const POPULAR_COUNTRIES = ["India", "USA", "UK", "Canada", "Australia"];

// ─── QA / Validation Helper ───────────────────────────────────────────────────

interface QAResult {
  country: string;
  tier: string;
  dailyRev: number;
  status: "Pass" | "Fail";
  warnings: string[];
}

interface QASummary {
  results: QAResult[];
  passed: boolean;
}

function validateCountryLogic(): QASummary {
  const TEST_VIEWS = 100_000;
  const TEST_CTR   = 2;     // %
  const TEST_CPC   = 0.50;  // $ base CPC (USA)

  const results: QAResult[] = COUNTRIES.map(c => {
    // Scale base CPC by country multiplier to simulate inputs changing
    const finalCpc = TEST_CPC * c.cpcMultiplier;
    const clicks = TEST_VIEWS * (TEST_CTR / 100);
    const dailyRev = clicks * finalCpc;

    return {
      country: c.label,
      tier: c.tier,
      dailyRev,
      status: "Pass",
      warnings: [],
    };
  });

  // Expected ranking validation
  const expectedRanking = ["USA", "UK", "Canada", "Australia", "Germany", "France", "India", "Pakistan", "Nigeria"];
  const rankedResults = expectedRanking.map(label => results.find(r => r.country === label));
  
  for (let i = 0; i < rankedResults.length - 1; i++) {
    const current = rankedResults[i];
    const next = rankedResults[i+1];
    if (current && next) {
      if (current.dailyRev <= next.dailyRev) {
         current.status = "Fail";
         next.status = "Fail";
         current.warnings.push(`${current.country} <= ${next.country}`);
      }
    }
  }

  // Tier sanity check vs USA
  const usaRev = results.find(r => r.country === "USA")?.dailyRev ?? 0;
  results.forEach(r => {
    if (r.tier === "Tier 3" && r.dailyRev >= usaRev && r.country !== "USA") {
      r.status = "Fail";
      r.warnings.push("Tier 3 revenue >= USA");
    }
    if (r.dailyRev <= 0) {
      r.status = "Fail";
      r.warnings.push("Revenue <= 0");
    }
  });

  const passed = results.every(r => r.status === "Pass");

  if (typeof window !== "undefined") {
    console.group("🧪 AdSense Country Validation Test");
    console.table(results.map(r => ({
      Country: r.country,
      Tier: r.tier,
      "Daily Revenue": `$${r.dailyRev.toFixed(2)}`,
      Status: r.status,
      Warnings: r.warnings.join("; ") || "None",
    })));
    if (passed) {
      console.log("✅ Tool is working correctly");
    } else {
      console.error("❌ Logic issue found");
    }
    console.groupEnd();
  }

  return { results, passed };
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

const fmt = (v: number, decimals = 2) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: decimals }).format(v);

const fmtNum = (v: number) =>
  new Intl.NumberFormat("en-IN", { notation: "compact", compactDisplay: "short" }).format(v);

// ─── SliderInput ───────────────────────────────────────────────────────────────

function SliderInput({
  label, value, onChange, min, max, step, suffix = "", helperText, placeholder = "", icon: Icon,
}: {
  label: string; value: number | ""; onChange: (v: number | "") => void;
  min: number; max: number; step: number; suffix?: string;
  helperText?: string; placeholder?: string; icon: React.ElementType;
}) {
  const numVal = Number(value) || 0;
  const pct = Math.min(100, Math.max(0, ((numVal - min) / (max - min)) * 100));

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div className="flex items-center gap-2">
          <Icon className="w-5 h-5 text-blue-400" />
          <label className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">{label}</label>
        </div>
        <div className="relative flex items-center w-full sm:w-44">
          <input
            type="number"
            min={min} max={max} step={step}
            value={value}
            placeholder={placeholder}
            onChange={e => {
              const val: number | "" = e.target.value === "" ? "" : Number(e.target.value);
              onChange(val);
            }}
            onBlur={() => {
              if (value !== "" && numVal < min) onChange(min);
              if (value !== "" && numVal > max) onChange(max);
            }}
            className="w-full bg-slate-100 dark:bg-black/40 border border-slate-300 dark:border-white/10 hover:border-slate-400 dark:hover:border-white/20 rounded-xl py-3 px-4 pr-10 text-slate-900 dark:text-white font-mono text-lg text-center focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-slate-400 dark:placeholder:text-white/20 shadow-inner dark:shadow-none"
          />
          {suffix && <span className="absolute right-4 text-slate-500 dark:text-gray-500 text-sm font-bold pointer-events-none">{suffix}</span>}
        </div>
      </div>
      {helperText && <p className="text-xs text-slate-600 dark:text-gray-400 font-medium">{helperText}</p>}
      <div className="relative w-full h-2 bg-slate-200 dark:bg-white/5 rounded-full overflow-hidden">
        <motion.div
          className="absolute top-0 left-0 h-full bg-blue-500 pointer-events-none"
          animate={{ width: `${pct}%` }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
        />
        <input
          type="range" min={min} max={max} step={step} value={numVal}
          onChange={e => onChange(Number(e.target.value))}
          className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>
    </div>
  );
}

// ─── Custom Chart Tooltip ──────────────────────────────────────────────────────

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="glass rounded-xl border border-white/10 p-3 bg-black/80 backdrop-blur-md text-xs">
        <p className="text-gray-400 mb-1 font-bold">{label}</p>
        <p className="text-blue-400 font-black">{fmt(payload[0].value)}</p>
      </div>
    );
  }
  return null;
};

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function AdSenseRevenueCalculatorPage() {
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const [copied, setCopied]   = useState(false);
  const [mode, setMode]       = useState<CalcMode>("cpc-ctr");

  // Inputs
  const [pageViews,  setPageViews]  = useState<number | "">(100_000);
  const [ctr,        setCtr]        = useState<number | "">(1.5);
  const [cpc,        setCpc]        = useState<number | "">(0.5);
  const [rpm,        setRpm]        = useState<number | "">(5);
  const [niche,      setNiche]      = useState<Niche>("Blog");
  const [country,    setCountry]    = useState<string>("India");
  const [countrySearch, setCountrySearch] = useState("");
  const [dropdownOpen, setDropdownOpen]   = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
        setCountrySearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Apply niche preset (scaled by current country)
  const applyNiche = (n: NicheConfig) => {
    setNiche(n.label);
    const cfg = COUNTRIES.find(c => c.label === country) ?? COUNTRIES[0];
    setCpc(parseFloat((n.avgCpc * cfg.cpcMultiplier).toFixed(2)));
    setCtr(n.avgCtr);
    setRpm(parseFloat((n.avgRpm * cfg.rpmMultiplier).toFixed(2)));
  };

  // Apply country preset (scales current input values proportionally)
  const applyCountry = (c: CountryConfig) => {
    const oldConfig = COUNTRIES.find(x => x.label === country) ?? COUNTRIES[0];
    const cpcRatio = c.cpcMultiplier / oldConfig.cpcMultiplier;
    const rpmRatio = c.rpmMultiplier / oldConfig.rpmMultiplier;

    setCountry(c.label);
    setDropdownOpen(false);
    setCountrySearch("");

    setCpc(prev => {
      const val = Number(prev) || 0;
      return parseFloat((val * cpcRatio).toFixed(2));
    });
    setRpm(prev => {
      const val = Number(prev) || 0;
      return parseFloat((val * rpmRatio).toFixed(2));
    });
  };

  const filteredCountries = COUNTRIES.filter(c =>
    c.label.toLowerCase().includes(countrySearch.toLowerCase())
  );

  const selectedCountryConfig = COUNTRIES.find(c => c.label === country) ?? COUNTRIES[0];

  // ── QA panel state ─────────────────────────────────────────────────────────
  const [showQaPanel, setShowQaPanel] = useState(false);
  const [qaSummary, setQaSummary] = useState<QASummary | null>(null);

  const handleRunQaTest = () => {
    setQaSummary(validateCountryLogic());
  };

  const hasConfigWarning = useMemo(() => {
    const usaRev  = COUNTRIES.find(c => c.label === "USA")?.cpcMultiplier ?? 1;
    const indiaRev = COUNTRIES.find(c => c.label === "India")?.cpcMultiplier ?? 1;
    return indiaRev >= usaRev;
  }, []);

  // Console validation for France vs USA
  useEffect(() => {
    const usaCfg = COUNTRIES.find(c => c.label === "USA");
    const franceCfg = COUNTRIES.find(c => c.label === "France");
    if (usaCfg && franceCfg && franceCfg.cpcMultiplier > usaCfg.cpcMultiplier) {
      console.warn("Validation Error: France revenue > USA revenue. Country multipliers are incorrect.");
    }
  }, []);

  const results = useMemo(() => {
    const views  = Number(pageViews) || 0;
    let dailyRev = 0;
    let clicks   = 0;
    let pageRpm  = 0;

    if (mode === "cpc-ctr") {
      const ctrVal = Number(ctr) || 0;
      const cpcVal = Number(cpc) || 0;
      clicks   = views * (ctrVal / 100);
      dailyRev = clicks * cpcVal;
      pageRpm  = views > 0 ? (dailyRev / views) * 1000 : 0;
    } else {
      const rpmVal = Number(rpm) || 0;
      dailyRev = (views / 1000) * rpmVal;
      pageRpm  = rpmVal;
      clicks   = 0; // not used in rpm mode
    }

    return {
      clicks:   Math.round(clicks),
      daily:    dailyRev,
      monthly:  dailyRev * 30,
      yearly:   dailyRev * 365,
      pageRpm,
    };
  }, [pageViews, ctr, cpc, rpm, mode]);

  // Chart: daily revenue for each month label
  const chartData = useMemo(() => {
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const seasonal = [0.85,0.88,0.95,1.0,0.98,0.9,0.85,0.88,0.95,1.05,1.15,1.3];
    return months.map((m, i) => ({
      month: m,
      revenue: parseFloat((results.monthly * seasonal[i]).toFixed(2)),
    }));
  }, [results.monthly]);

  const handleCopy = async () => {
    try {
      const lines = [
        `Mode: ${mode === "cpc-ctr" ? "CPC + CTR" : "RPM"}`,
        `Niche: ${niche} | Country: ${country}`,
        `Daily Page Views: ${Number(pageViews).toLocaleString()}`,
        "",
        mode === "cpc-ctr"
          ? `CTR: ${ctr}%  |  CPC: $${cpc}`
          : `RPM: $${rpm}`,
        "",
        `Estimated Clicks/Day: ${results.clicks.toLocaleString()}`,
        `Daily Revenue:   ${fmt(results.daily)}`,
        `Monthly Revenue: ${fmt(results.monthly)}`,
        `Yearly Revenue:  ${fmt(results.yearly)}`,
        `Page RPM:        ${fmt(results.pageRpm)}`,
        "",
        "Estimated via ToolWala AI — adsense-revenue-calculator",
      ].join("\n");
      await navigator.clipboard.writeText(lines);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* silent */ }
  };

  const handleReset = () => {
    setPageViews(100_000); setCtr(1.5); setCpc(0.5); setRpm(5);
    setNiche("Blog"); setCountry("India"); setMode("cpc-ctr");
  };

  const relatedTools = toolsData.filter(t =>
    ["youtube-money-calculator", "gst-calculator", "sip-calculator"].includes(t.slug)
  );

  const faqs = [
    { q: "What is AdSense RPM?", a: "RPM (Revenue Per Mille) is the estimated earnings you receive for every 1,000 page views. It is calculated as (Total Estimated Earnings / Total Page Views) × 1000. RPM is useful for comparing the revenue potential of different pages or ad placements." },
    { q: "What is CTR in AdSense?", a: "CTR (Click-Through Rate) is the percentage of page views that result in an ad click. CTR = (Clicks / Page Views) × 100. Higher CTR means more visitors are clicking on ads, which increases your revenue." },
    { q: "What is CPC in AdSense?", a: "CPC (Cost Per Click) is the amount an advertiser pays each time a user clicks their ad. Google pays you approximately 68% of the CPC. CPC varies greatly by niche — finance and health ads typically have much higher CPCs than entertainment or news." },
    { q: "Why does country matter for AdSense earnings?", a: "Advertisers pay much more for clicks from Tier-1 countries (USA, UK, Canada, Australia) than from Tier-3 countries (India, Indonesia, etc.). The same niche site can earn 5–10x more from a US visitor than an Indian visitor." },
    { q: "How can I increase my AdSense RPM?", a: "Focus on high-CPC niches (Finance, Health, Tech), attract Tier-1 country traffic, improve your site speed (impacts ad viewability), use responsive ads, and place ads above the fold. Quality content that ranks for high-intent keywords naturally attracts premium advertisers." },
  ];

  return (
    <ToolVisibilityGuard slug="adsense-revenue-calculator">
      <div className="bg-[#F6F8FC] dark:bg-[#030712] min-h-screen py-24 relative overflow-hidden font-sans transition-colors duration-250 font-sans">
        <MeshGradient />
        <FloatingParticles />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-blue-600/5 rounded-full blur-[140px] pointer-events-none z-0" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl relative z-10">

          {/* Back */}
          <Link
            href="/tools"
            className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-widest text-gray-500 hover:text-blue-400 transition-colors mb-10 group"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Directory
          </Link>

          {/* ── Hero ─────────────────────────────────────────────────────────── */}
          <div className="text-center max-w-4xl mx-auto mb-16">
            <PdfToolIcon toolId="adsense-revenue-calculator" size="xl" className="mx-auto mb-4" />
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-black tracking-widest mb-6 shadow-2xl">
              <BarChart3 className="w-4 h-4" />
              <span>Google AdSense Revenue Estimator</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 dark:text-white mb-2 uppercase leading-none">
              AdSense Revenue
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-indigo-400">
                Calculator
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-600 dark:text-gray-400 leading-relaxed font-medium mb-8 max-w-2xl mx-auto mt-6">
              Estimate your Google AdSense earnings from page views, CTR, CPC, RPM, your niche, and your audience country.
            </p>

            <div className="flex flex-wrap justify-center gap-6 text-[10px] sm:text-xs font-black text-slate-500 dark:text-gray-500 uppercase tracking-widest mb-10">
              <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-500" /> 100% Private</span>
              <span className="flex items-center gap-1.5"><Zap className="w-4 h-4 text-blue-600 dark:text-blue-500" /> Instant Results</span>
              <span className="flex items-center gap-1.5"><Activity className="w-4 h-4 text-blue-600 dark:text-blue-500" /> 7 Niches · 5 Countries</span>
            </div>

            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <button
                onClick={() => document.getElementById("calc-section")?.scrollIntoView({ behavior: "smooth" })}
                className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest text-sm rounded-full transition-transform hover:scale-105 active:scale-95 shadow-lg shadow-blue-500/20 cursor-pointer"
              >
                Estimate Earnings
              </button>
              <button
                onClick={() => document.getElementById("learn-section")?.scrollIntoView({ behavior: "smooth" })}
                className="w-full sm:w-auto px-8 py-4 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-white font-black uppercase tracking-widest text-sm rounded-full transition-transform hover:scale-105 active:scale-95 border border-slate-200 dark:border-white/10 cursor-pointer shadow-sm"
              >
                How It Works
              </button>
            </div>
          </div>

          {/* ── Calculator ───────────────────────────────────────────────────── */}
          <div id="calc-section" className="flex flex-col lg:flex-row gap-8 mb-16 pt-4">

            {/* ── LEFT: Inputs ──────────────────────────────────────────────── */}
            <div className="w-full lg:w-5/12 space-y-6 shrink-0">
              <div className="bg-[#FBFCFE] dark:bg-white/[0.01] rounded-3xl border border-[#E6ECF5] dark:border-white/5 shadow-2xl p-6 sm:p-8">

                {/* Header */}
                <div className="flex items-center justify-between border-b border-[#E6ECF5] dark:border-white/5 pb-4 mb-8">
                  <div className="flex items-center gap-2">
                    <Calculator className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">Site Settings</h3>
                  </div>
                  <button onClick={handleReset} className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-slate-500 hover:text-blue-600 dark:text-gray-500 dark:hover:text-blue-400 transition-colors cursor-pointer">
                    <RefreshCw className="w-3 h-3" /> Reset
                  </button>
                </div>

                <div className="space-y-8">

                  {/* Mode Toggle */}
                  <div className="space-y-3">
                    <p className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">Calculation Mode</p>
                    <div className="flex bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl p-1.5 gap-1">
                      <button
                        onClick={() => setMode("cpc-ctr")}
                        className={`flex-1 py-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${mode === "cpc-ctr" ? "bg-blue-600 text-white shadow-sm" : "text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/5"}`}
                      >
                        CPC + CTR
                      </button>
                      <button
                        onClick={() => setMode("rpm")}
                        className={`flex-1 py-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${mode === "rpm" ? "bg-blue-600 text-white shadow-sm" : "text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/5"}`}
                      >
                        By RPM
                      </button>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-gray-500">
                      {mode === "cpc-ctr"
                        ? "Use your click-through rate and cost-per-click to estimate revenue."
                        : "Use your known RPM (revenue per 1,000 views) directly."}
                    </p>
                  </div>

                  {/* Page Views */}
                  <SliderInput
                    label="Daily Page Views" icon={Eye}
                    value={pageViews} onChange={setPageViews}
                    min={100} max={10_000_000} step={100}
                    helperText="Total number of page views your site receives per day."
                    placeholder="100000"
                  />

                  {/* Mode-specific inputs */}
                  <AnimatePresence mode="wait">
                    {mode === "cpc-ctr" ? (
                      <motion.div
                        key="cpc-ctr"
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                        className="space-y-8"
                      >
                        <SliderInput
                          label="CTR %" icon={MousePointerClick}
                          value={ctr} onChange={setCtr}
                          min={0.1} max={20} step={0.1} suffix="%"
                          helperText="Percentage of views that result in an ad click."
                          placeholder="1.5"
                        />
                        <SliderInput
                          label="CPC" icon={DollarSign}
                          value={cpc} onChange={setCpc}
                          min={0.01} max={20} step={0.01} suffix="$"
                          helperText="Revenue you earn per ad click."
                          placeholder="0.50"
                        />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="rpm"
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                      >
                        <SliderInput
                          label="Page RPM" icon={TrendingUp}
                          value={rpm} onChange={setRpm}
                          min={0.1} max={100} step={0.1} suffix="$"
                          helperText="Your known revenue per 1,000 page views."
                          placeholder="5"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Niche */}
                  <div className="space-y-3">
                    <p className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">Niche</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-2">
                      {NICHES.map(n => (
                        <button
                          key={n.label}
                          onClick={() => applyNiche(n)}
                          className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${niche === n.label ? "bg-blue-50 dark:bg-blue-500/20 border-blue-500 text-blue-600 dark:text-white shadow-sm" : "bg-slate-100 hover:bg-slate-200/70 dark:bg-white/[0.02] border-slate-200 dark:border-white/10 text-slate-700 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white"}`}
                        >
                          <span>{n.emoji}</span><span>{n.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Country */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <p className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">Audience Country</p>
                    </div>

                    {/* Popular Quick Chips */}
                    <div className="flex flex-wrap gap-2">
                      {POPULAR_COUNTRIES.map(name => {
                        const c = COUNTRIES.find(x => x.label === name)!;
                        return (
                          <button
                            key={c.label}
                            onClick={() => applyCountry(c)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                              country === c.label
                                ? "bg-blue-50 dark:bg-blue-500/20 border-blue-500 text-blue-600 dark:text-white shadow-sm"
                                : "bg-slate-100 hover:bg-slate-200/70 dark:bg-white/[0.02] border-slate-200 dark:border-white/10 text-slate-700 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white"
                            }`}
                          >
                            <span>{c.flag}</span><span>{c.label}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Searchable Dropdown */}
                    <div className="relative" ref={dropdownRef}>
                      {/* Trigger */}
                      <button
                        type="button"
                        onClick={() => { setDropdownOpen(o => !o); setCountrySearch(""); }}
                        className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 hover:border-blue-500/50 rounded-xl text-sm font-bold text-slate-900 dark:text-white transition-all focus:outline-none focus:border-blue-500 shadow-sm cursor-pointer"
                      >
                        <span className="flex items-center gap-2">
                          <span className="text-base">{selectedCountryConfig.flag}</span>
                          <span>{selectedCountryConfig.label}</span>
                        </span>
                        <ChevronDown className={`w-4 h-4 text-slate-500 dark:text-gray-400 transition-transform duration-200 ${dropdownOpen ? "rotate-180 text-blue-600 dark:text-blue-400" : ""}`} />
                      </button>

                      {/* Dropdown Panel */}
                      <AnimatePresence>
                        {dropdownOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{ duration: 0.15 }}
                            className="absolute left-0 right-0 top-full mt-2 z-50 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-black/90 backdrop-blur-xl shadow-2xl overflow-hidden"
                          >
                            {/* Search box */}
                            <div className="p-3 border-b border-slate-200 dark:border-white/5">
                              <input
                                autoFocus
                                type="text"
                                value={countrySearch}
                                onChange={e => setCountrySearch(e.target.value)}
                                placeholder="Search country..."
                                className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-gray-600 focus:outline-none focus:border-blue-500 transition-all shadow-inner"
                              />
                            </div>

                            {/* Country list */}
                            <div className="max-h-56 overflow-y-auto no-scrollbar py-1">
                              {filteredCountries.length === 0 ? (
                                <p className="text-center text-xs text-slate-500 dark:text-gray-600 py-4">No countries found</p>
                              ) : (
                                filteredCountries.map(c => (
                                  <button
                                    key={c.label}
                                    type="button"
                                    onClick={() => applyCountry(c)}
                                    className={`w-full flex items-center justify-between gap-3 px-4 py-2.5 text-sm font-semibold transition-all hover:bg-slate-100 dark:hover:bg-blue-500/10 cursor-pointer ${
                                      country === c.label ? "text-blue-600 dark:text-white bg-blue-50 dark:bg-blue-500/10 font-bold" : "text-slate-700 dark:text-gray-300"
                                    }`}
                                  >
                                    <span className="flex items-center gap-2.5">
                                      <span className="text-base w-6">{c.flag}</span>
                                      <span>{c.label}</span>
                                    </span>
                                    {country === c.label && (
                                      <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400 flex-shrink-0" />
                                    )}
                                  </button>
                                ))
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Tooltip / Info */}
                    <div className="flex items-start gap-2 mt-1 p-3 rounded-xl bg-blue-50 dark:bg-blue-500/5 border border-blue-200 dark:border-blue-500/10 shadow-sm">
                      <Globe className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                      <p className="text-xs text-slate-600 dark:text-blue-300/70 font-medium leading-relaxed">
                        Different countries have different advertising rates. Higher-tier countries (USA, UK, CA) generally generate significantly higher AdSense revenue than Tier 3 countries (India, Pakistan, Nigeria).
                      </p>
                    </div>

                    {/* Tier reference */}
                    <div className="flex flex-wrap gap-2">
                      {(["Tier 1", "Tier 2", "Tier 3"] as const).map(t => (
                        <span key={t} className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border shadow-xs ${
                          t === "Tier 1" ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400" :
                          t === "Tier 2" ? "bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20 text-blue-700 dark:text-blue-400" :
                          "bg-slate-100 dark:bg-gray-500/10 border-slate-200 dark:border-gray-500/20 text-slate-600 dark:text-gray-400"
                        }`}>
                          {t === "Tier 1" ? "🏆" : t === "Tier 2" ? "⭐" : "🌐"} {t}
                        </span>
                      ))}
                      <span className="text-[10px] text-slate-500 dark:text-gray-600 self-center font-medium">· selected: <span className={`font-bold ${
                        selectedCountryConfig.tier === "Tier 1" ? "text-emerald-600 dark:text-emerald-400" :
                        selectedCountryConfig.tier === "Tier 2" ? "text-blue-600 dark:text-blue-400" : "text-slate-600 dark:text-gray-400"
                      }`}>{selectedCountryConfig.tier}</span></span>
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* ── RIGHT: Results ─────────────────────────────────────────────── */}
            <div className="w-full lg:w-7/12 flex flex-col gap-6">

              {/* Main result card */}
              <div className="bg-[#FBFCFE] dark:bg-white/[0.01] rounded-3xl border border-[#E6ECF5] dark:border-white/5 shadow-2xl overflow-hidden relative group">
                <div className="absolute top-0 right-0 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none group-hover:scale-110 transition-transform duration-700" />

                <div className="p-8 sm:p-10 relative z-10">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-2">
                      <Target className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      <span className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">💰 Revenue Estimate</span>
                    </div>
                    <button
                      onClick={handleCopy}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-xs font-bold text-slate-700 dark:text-gray-300 transition-colors border border-slate-200 dark:border-white/10 cursor-pointer shadow-xs"
                    >
                      {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-blue-400" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied ? "Copied!" : "Copy"}
                    </button>
                  </div>

                  {/* Daily hero */}
                  <div className="text-center mb-8">
                    <span className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-2 block">Daily Revenue</span>
                    <motion.div
                      key={results.daily}
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-5xl sm:text-7xl font-black text-slate-900 dark:text-white tracking-tight leading-none"
                    >
                      {fmt(results.daily)}
                    </motion.div>
                    <p className="text-xs text-slate-500 dark:text-gray-500 mt-2">
                      From <span className="text-slate-900 dark:text-white font-bold">{fmtNum(Number(pageViews) || 0)} daily views</span>
                      {" · "}
                      <span className="text-blue-600 dark:text-blue-400 font-bold">{niche}</span>
                      {" · "}
                      <span className="text-blue-600 dark:text-blue-400 font-bold">{country}</span>
                    </p>
                  </div>

                  {/* Stat grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-2 gap-4 mb-4">
                    <div className="bg-slate-50/70 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/5 rounded-2xl p-5 text-center shadow-sm">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-500 block mb-1">Monthly</span>
                      <span className="text-xl font-black text-slate-900 dark:text-white">{fmt(results.monthly)}</span>
                    </div>
                    <div className="bg-blue-50/70 dark:bg-blue-500/[0.04] border border-blue-200 dark:border-blue-500/10 rounded-2xl p-5 text-center shadow-sm">
                      <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400/70 block mb-1">Yearly</span>
                      <span className="text-xl font-black text-blue-600 dark:text-blue-400">{fmt(results.yearly, 0)}</span>
                    </div>
                    <div className="bg-slate-50/70 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/5 rounded-2xl p-5 text-center shadow-sm">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-500 block mb-1">Page RPM</span>
                      <span className="text-xl font-black text-slate-900 dark:text-white">{fmt(results.pageRpm)}</span>
                    </div>
                    <div className="bg-slate-50/70 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/5 rounded-2xl p-5 text-center shadow-sm">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-500 block mb-1">
                        {mode === "cpc-ctr" ? "Est. Clicks/Day" : "Mode"}
                      </span>
                      <span className="text-xl font-black text-slate-900 dark:text-white">
                        {mode === "cpc-ctr" ? fmtNum(results.clicks) : "RPM"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bar chart */}
              <div className="bg-[#FBFCFE] dark:bg-white/[0.01] rounded-3xl border border-[#E6ECF5] dark:border-white/5 p-6 sm:p-8 shadow-sm">
                <h3 className="text-xs font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-1">Seasonal Monthly Revenue</h3>
                <p className="text-xs text-slate-500 dark:text-gray-500 mb-6">AdSense earnings peak in Q4 (Oct–Dec) due to higher advertiser spend.</p>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <defs>
                      <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%"   stopColor="#3b82f6" stopOpacity={0.9} />
                        <stop offset="100%" stopColor="#6366f1" stopOpacity={0.6} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.15)" />
                    <XAxis dataKey="month" tick={{ fill: "#64748b", fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "#64748b", fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} width={50} />
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Bar dataKey="revenue" fill="url(#barGrad)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Disclaimer */}
              <div className="flex gap-3 items-start rounded-2xl border border-yellow-200 dark:border-yellow-500/10 bg-yellow-50 dark:bg-yellow-500/[0.03] p-5 shadow-sm">
                <span className="text-yellow-600 dark:text-yellow-400 text-lg shrink-0">⚠️</span>
                <p className="text-xs text-slate-600 dark:text-yellow-300/70 font-medium leading-relaxed">
                  <strong className="text-slate-900 dark:text-yellow-400 font-black">Disclaimer: </strong>
                  These are estimates only. Actual AdSense earnings vary based on ad fill rate, invalid traffic filtering, seasonality, ad layout, and Google policy changes. Use for planning purposes only.
                </p>
              </div>

              {/* Sanity Warning */}
              {hasConfigWarning && (
                <div className="flex gap-3 items-start rounded-2xl border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/[0.04] p-5 shadow-sm">
                  <span className="text-red-600 dark:text-red-400 text-lg shrink-0">🚨</span>
                  <p className="text-xs text-slate-600 dark:text-red-300/80 font-medium leading-relaxed">
                    <strong className="text-slate-900 dark:text-red-400 font-black">Config Warning: </strong>
                    Country multiplier configuration may be incorrect — USA revenue should exceed India revenue.
                  </p>
                </div>
              )}

              {/* QA Test Panel */}
              <div className="bg-[#FBFCFE] dark:bg-white/[0.01] rounded-3xl border border-[#E6ECF5] dark:border-white/5 overflow-hidden shadow-sm">
                <button
                  onClick={() => setShowQaPanel(v => !v)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-600 dark:text-gray-500">
                    <span>🧪</span>
                    <span>Country Revenue Validation Table</span>
                  </span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 dark:text-gray-600 transition-transform duration-200 ${showQaPanel ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence initial={false}>
                  {showQaPanel && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                    >
                      <div className="px-4 pb-4 border-t border-slate-200 dark:border-white/5">
                        <div className="flex items-center justify-between py-4">
                          <p className="text-[10px] text-slate-500 dark:text-gray-500 font-medium">Test: 100K views · 2% CTR · $0.50 CPC (USA)</p>
                          <button
                            onClick={handleRunQaTest}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-widest rounded-lg transition-transform hover:scale-105 active:scale-95 cursor-pointer shadow-sm"
                          >
                            Run Calculator Test
                          </button>
                        </div>

                        {qaSummary && (
                          <>
                            <div className={`mb-4 p-3 rounded-xl border flex items-center gap-2 text-sm font-black uppercase tracking-widest shadow-xs ${
                              qaSummary.passed 
                                ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400" 
                                : "bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400"
                            }`}>
                              {qaSummary.passed ? "✅ Tool is working correctly" : "❌ Logic issue found"}
                            </div>

                            <div className="overflow-x-auto border border-slate-200 dark:border-white/[0.05] rounded-xl shadow-xs">
                              <table className="w-full text-xs">
                                <thead className="bg-slate-50 dark:bg-white/[0.02]">
                                  <tr className="text-slate-500 dark:text-gray-600 uppercase tracking-widest text-[10px]">
                                    <th className="text-left py-3 px-4 font-black">Country</th>
                                    <th className="text-left py-3 px-4 font-black">Tier</th>
                                    <th className="text-right py-3 px-4 font-black">Daily Revenue</th>
                                    <th className="text-right py-3 px-4 font-black">Status</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {qaSummary.results.map((r, i) => (
                                    <tr key={r.country} className={`border-t border-slate-200/80 dark:border-white/[0.03] ${
                                      r.status === "Fail" ? "bg-red-50 dark:bg-red-500/5" : (i % 2 === 0 ? "bg-slate-50/50 dark:bg-white/[0.01]" : "")
                                    }`}>
                                      <td className="py-2 px-4 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                                        {COUNTRIES.find(c => c.label === r.country)?.flag} {r.country}
                                      </td>
                                      <td className="py-2 px-4">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-black whitespace-nowrap ${
                                          r.tier === "Tier 1" ? "text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10" :
                                          r.tier === "Tier 2" ? "text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10" :
                                          "text-slate-600 dark:text-gray-400 bg-slate-100 dark:bg-gray-500/10"
                                        }`}>{r.tier}</span>
                                      </td>
                                      <td className="py-2 px-4 text-right font-bold text-blue-600 dark:text-cyan-400 font-mono">
                                        ${r.dailyRev.toFixed(2)}
                                      </td>
                                      <td className={`py-2 px-4 text-right font-bold uppercase text-[10px] tracking-widest ${
                                        r.status === "Pass" ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
                                      }`}>
                                        {r.status}
                                        {r.warnings.length > 0 && (
                                          <span className="ml-1 text-red-600 dark:text-red-400" title={r.warnings.join(", ")}>⚠️</span>
                                        )}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </div>
          </div>

          {/* ── Educational Section ───────────────────────────────────────────── */}
          <section id="learn-section" className="py-20 border-t border-[#E6ECF5] dark:border-white/5 mt-8 scroll-mt-10">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-white/5 border border-blue-200 dark:border-white/10 text-blue-600 dark:text-blue-400 text-xs font-black tracking-widest mb-6 shadow-xs">
                <BookOpen className="w-4 h-4" />
                <span>AdSense Mastery Guide</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight uppercase mb-6">
                📚 How AdSense Revenue Works
              </h2>
              <p className="text-slate-600 dark:text-gray-400 text-base font-medium leading-relaxed">
                Understand the key metrics that determine how much your website earns from Google AdSense.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
              {[
                {
                  title: "What is AdSense RPM?",
                  color: "text-blue-600 dark:text-blue-400",
                  body: "RPM (Revenue Per Mille) is your earnings per 1,000 page views. It is calculated as (Total Earnings / Total Page Views) × 1000. RPM is the single best metric for comparing revenue across different content types.",
                },
                {
                  title: "What is CTR?",
                  color: "text-blue-600 dark:text-cyan-400",
                  body: "CTR (Click-Through Rate) = (Ad Clicks / Page Views) × 100. A typical AdSense CTR ranges from 0.5% to 3%. Placing ads strategically near content (not blocking it) can boost CTR significantly.",
                },
                {
                  title: "CPC & Country Impact",
                  color: "text-indigo-600 dark:text-indigo-400",
                  body: "CPC is what you earn per click. US visitors generate CPCs 5–10x higher than Indian visitors in the same niche. Targeting English-speaking Tier-1 audiences is the fastest way to improve AdSense revenue.",
                },
                {
                  title: "Tips to Increase Revenue",
                  color: "text-violet-600 dark:text-violet-400",
                  body: "Target high-CPC niches (Finance, Health), write for Tier-1 audiences, use auto ads for smart placement, improve Core Web Vitals for better ad viewability, and publish high-intent keyword content.",
                },
              ].map(card => (
                <div key={card.title} className="bg-[#FBFCFE] dark:bg-white/[0.01] rounded-3xl border border-[#E6ECF5] dark:border-white/5 p-8 shadow-sm">
                  <h3 className={`text-xl font-black uppercase tracking-widest mb-4 ${card.color}`}>{card.title}</h3>
                  <p className="text-slate-600 dark:text-gray-300 leading-relaxed font-medium">{card.body}</p>
                </div>
              ))}
            </div>

            {/* FAQ */}
            <div className="max-w-3xl mx-auto mb-20">
              <div className="text-center mb-8">
                <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase mb-2">Frequently Asked Questions</h3>
                <p className="text-xs text-slate-500 dark:text-gray-500 font-bold uppercase tracking-wider">Everything about Google AdSense</p>
              </div>
              <div className="space-y-4">
                {faqs.map((faq, i) => {
                  const open = faqOpen === i;
                  return (
                    <div key={i} className="bg-[#FBFCFE] dark:bg-white/[0.01] rounded-2xl border border-[#E6ECF5] dark:border-white/5 overflow-hidden shadow-sm">
                      <button
                        onClick={() => setFaqOpen(open ? null : i)}
                        className="w-full flex items-center justify-between p-5 text-left focus:outline-none cursor-pointer"
                      >
                        <span className="text-sm font-black text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors pr-4">{faq.q}</span>
                        <ChevronDown className={`w-4 h-4 text-slate-400 dark:text-gray-500 transition-transform duration-300 flex-shrink-0 ${open ? "rotate-180 text-blue-600 dark:text-blue-400" : ""}`} />
                      </button>
                      <AnimatePresence initial={false}>
                        {open && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2, ease: "easeInOut" }}
                          >
                            <div className="px-5 pb-5 border-t border-[#E6ECF5] dark:border-white/5 text-xs text-slate-600 dark:text-gray-400 leading-relaxed font-semibold pt-3">
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

            {/* Related tools */}
            {relatedTools.length > 0 && (
              <div className="mt-16">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase mb-8 text-center">Related Tools</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 max-w-5xl mx-auto">
                  {relatedTools.map(tool => (
                    <ToolCard
                      key={tool.id || tool.slug}
                      {...tool}
                      isPopular={tool.popular}
                      isTrending={tool.trending}
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="text-center py-12 border-t border-[#E6ECF5] dark:border-white/5 mt-16">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-8">Ready to estimate your AdSense income?</h3>
              <button
                onClick={() => document.getElementById("calc-section")?.scrollIntoView({ behavior: "smooth" })}
                className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest text-sm rounded-full transition-transform hover:scale-105 flex items-center justify-center gap-2 mx-auto shadow-lg shadow-blue-500/20 cursor-pointer"
              >
                <ArrowUp className="w-5 h-5" />
                Back to Calculator
              </button>
            </div>
          </section>

        </div>

        {toolArticles['adsense-revenue-calculator'] && (
          <ToolArticle {...toolArticles['adsense-revenue-calculator']} />
        )}
      </div>
    </ToolVisibilityGuard>
  );
}
