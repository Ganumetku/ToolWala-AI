"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  ChevronLeft, Calculator, DollarSign, ShieldCheck, RefreshCw, 
  Copy, CheckCircle2, AlertCircle, Info, Heart, Award, Sparkles, 
  BookOpen, Target, Sliders, ArrowRight, Zap, HelpCircle, Check,
  TrendingDown, FileText, ChevronDown, ChevronUp, AlertTriangle, PieChart as PieIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { MeshGradient, FloatingParticles } from '@/components/BackgroundEffects';
import ToolVisibilityGuard from '@/components/ToolVisibilityGuard';
import { toolArticles } from '@/data/toolArticles';
import ToolArticle from '@/components/ToolArticle';
import { 
  TAX_CONFIG, DEDUCTION_LIMITS, calculateSurchargeWithMarginalRelief,
  AgeCategory, FinancialYear, IncomeType, TaxSlab, RegimeConfig 
} from '@/lib/taxConstants';

const SEO_TITLE = "Income Tax Calculator India FY 2026-27 (AY 2027-28) | ToolWala AI";
const SEO_DESC = "Calculate Indian Income Tax for FY 2026-27 & FY 2025-26 with verified Union Budget slabs, New vs Old Regime comparison, 87A marginal relief, and Section 80C/80D deductions.";

// Helper: Format Currency (INR)
const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(val || 0);
};

// Helper: Indian Rupees in Words Converter
const numberToWordsINR = (num: number): string => {
  if (num === 0) return "Zero Rupees";
  if (!num || isNaN(num) || num < 0) return "";
  if (num >= 10000000000) return "Amount exceeds Indian conversion limits";

  const a = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function inWords(n: number): string {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : '');
    if (n < 1000) return a[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' ' + inWords(n % 100) : '');
    if (n < 100000) return inWords(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 !== 0 ? ' ' + inWords(n % 1000) : '');
    if (n < 10000000) return inWords(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 !== 0 ? ' ' + inWords(n % 100000) : '');
    return inWords(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 !== 0 ? ' ' + inWords(n % 10000000) : '');
  }

  const integerPart = Math.floor(num);
  return inWords(integerPart) + " Rupees Only";
};

// Interactive Input Slider Component
function InputSlider({ 
  label, min, max, step, value, onChange, icon: Icon, suffix = "₹", 
  helperText, presets, placeholder = "", limit
}: any) {
  const isOverLimit = limit !== undefined && typeof value === 'number' && value > limit;
  const numVal = typeof value === 'number' ? value : min;
  const pct = Math.min(100, Math.max(0, ((numVal - min) / (max - min)) * 100));

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />}
          <label className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">{label}</label>
        </div>
        <div className="relative flex items-center w-full sm:w-48">
          <input 
            type="number"
            min={min}
            max={max}
            value={value}
            placeholder={placeholder}
            onChange={(e) => {
              let valStr = e.target.value;
              const maxLen = 10;
              if (valStr.length > maxLen) valStr = valStr.slice(0, maxLen);
              let val = valStr === '' ? '' : Number(valStr);
              onChange(val);
            }}
            onBlur={() => {
              if (value !== '' && value < min) onChange(min);
            }}
            className={`w-full bg-slate-100 dark:bg-black/40 border ${
              isOverLimit ? 'border-amber-500 ring-2 ring-amber-500/20' : 'border-slate-300 dark:border-white/10'
            } hover:border-slate-400 dark:hover:border-white/20 rounded-xl py-3 px-4 pr-10 text-slate-900 dark:text-white font-mono text-lg text-center focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all placeholder:text-slate-400 dark:placeholder:text-white/20 shadow-inner dark:shadow-none`}
          />
          {suffix && <span className="absolute right-4 text-slate-500 dark:text-emerald-400 text-sm font-extrabold pointer-events-none">{suffix}</span>}
        </div>
      </div>

      {isOverLimit && (
        <div className="text-xs text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-500/10 border border-amber-300 dark:border-amber-500/30 px-3.5 py-2 rounded-xl flex items-center gap-1.5 font-bold shadow-sm">
          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <span>Statutory Cap Warning: Input exceeds ₹{limit.toLocaleString('en-IN')}. Maximum deductible limit of {formatCurrency(limit)} will be applied in calculation.</span>
        </div>
      )}

      {value > 0 && label.toLowerCase().includes('income') && (
        <div className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/30 px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-sm">
          <span className="font-bold text-emerald-800 dark:text-emerald-400 shrink-0">🔤 In Words:</span>
          <span className="font-bold truncate text-slate-900 dark:text-white">{numberToWordsINR(Number(value))}</span>
        </div>
      )}
      
      {helperText && <p className="text-xs text-slate-600 dark:text-gray-400 font-medium">{helperText}</p>}
      
      {/* Interactive Slider Track */}
      <div className="relative w-full py-3 cursor-pointer group select-none">
        <div className="w-full h-2.5 bg-slate-200 dark:bg-white/10 rounded-full relative overflow-hidden shadow-inner">
          <motion.div 
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full" 
            animate={{ width: `${pct}%` }} 
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        </div>

        {/* Draggable Knob */}
        <motion.div 
          className="absolute top-1/2 -translate-y-1/2 -ml-3.5 w-7 h-7 bg-white dark:bg-slate-900 border-2 border-emerald-500 rounded-full shadow-lg flex items-center justify-center pointer-events-none group-hover:scale-110 group-active:scale-95 transition-transform"
          animate={{ left: `${pct}%` }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm" />
        </motion.div>

        <input 
          type="range"
          min={min}
          max={max}
          step={step}
          value={Math.min(numVal, max)}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-grab active:cursor-grabbing z-10"
        />
      </div>

      {presets && (
        <div className="flex flex-wrap gap-2 pt-1">
          {presets.map((preset: any) => (
            <button
              key={preset.value}
              onClick={() => onChange(preset.value)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all shadow-sm ${
                value === preset.value
                  ? 'border-emerald-500 bg-emerald-500 text-white dark:bg-emerald-500'
                  : 'border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 hover:bg-emerald-500/20 dark:hover:bg-emerald-500/20 hover:text-emerald-700 dark:hover:text-emerald-300 text-slate-700 dark:text-slate-200'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Custom Recharts Tooltip
const CustomPieTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-white/10 p-3.5 rounded-2xl shadow-2xl backdrop-blur-md z-50">
        <p className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-gray-400 mb-1">{data.name}</p>
        <p className="text-slate-900 dark:text-white font-mono text-sm font-bold truncate">{formatCurrency(data.value)}</p>
      </div>
    );
  }
  return null;
};

export default function IncomeTaxCalculatorPage() {
  const [mounted, setMounted] = useState(false);

  // User Settings
  const [financialYear, setFinancialYear] = useState<FinancialYear>('2026-2027');
  const [incomeType, setIncomeType] = useState<IncomeType>('salaried');
  const [ageCategory, setAgeCategory] = useState<AgeCategory>('below60');
  const [activeTab, setActiveTab] = useState<'compare' | 'new' | 'old'>('compare');

  // Gross Salary / Income
  const [grossIncome, setGrossIncome] = useState<number>(1200000); // Default ₹12 Lakhs

  // Old Regime Deductions
  const [sec80C, setSec80C] = useState<number>(150000); // Max 1.5L
  const [sec80D, setSec80D] = useState<number>(25000);  // Health Ins
  const [sec80CCD1B, setSec80CCD1B] = useState<number>(0); // NPS Max 50k
  const [sec24b, setSec24b] = useState<number>(0);      // Home Loan Interest Max 2L
  const [hraExemption, setHraExemption] = useState<number>(0);
  const [otherDeductions, setOtherDeductions] = useState<number>(0);

  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleReset = () => {
    setGrossIncome(1200000);
    setFinancialYear('2026-2027');
    setIncomeType('salaried');
    setAgeCategory('below60');
    setSec80C(150000);
    setSec80D(25000);
    setSec80CCD1B(0);
    setSec24b(0);
    setHraExemption(0);
    setOtherDeductions(0);
  };

  // Basic Tax Calculator function per regime
  const calculateBaseTaxForRegime = (taxableIncome: number, regimeConfig: RegimeConfig, age: AgeCategory) => {
    const slabs = regimeConfig.slabs[age];
    let tax = 0;
    slabs.forEach((slab) => {
      if (taxableIncome > slab.min) {
        const upper = slab.max !== null ? Math.min(taxableIncome, slab.max) : taxableIncome;
        const amountInSlab = Math.max(0, upper - slab.min);
        tax += (amountInSlab * slab.rate) / 100;
      }
    });
    return tax;
  };

  // Full Computation Logic for a Specific Regime
  const calculateRegimeTax = (
    income: number, 
    regimeConfig: RegimeConfig, 
    isNewRegime: boolean,
    userDeductions: { sec80C: number; sec80D: number; sec80CCD1B: number; sec24b: number; hraExemption: number; otherDeductions: number }
  ) => {
    // Standard deduction applies to salaried/pensioners only
    const stdDed = incomeType === 'salaried' ? regimeConfig.standardDeduction : 0;

    let chapter6ADeductions = 0;
    if (!isNewRegime) {
      // Capped statutory deductions for Old Regime
      const max80DLimit = ageCategory === 'below60' ? DEDUCTION_LIMITS.sec80DGeneral : DEDUCTION_LIMITS.sec80DSenior;
      const capped80C = Math.min(DEDUCTION_LIMITS.sec80C, Math.max(0, userDeductions.sec80C || 0));
      const capped80D = Math.min(max80DLimit, Math.max(0, userDeductions.sec80D || 0));
      const capped80CCD = Math.min(DEDUCTION_LIMITS.sec80CCD1B, Math.max(0, userDeductions.sec80CCD1B || 0));
      const capped24b = Math.min(DEDUCTION_LIMITS.sec24b, Math.max(0, userDeductions.sec24b || 0));
      const hra = Math.max(0, userDeductions.hraExemption || 0);
      const other = Math.max(0, userDeductions.otherDeductions || 0);

      chapter6ADeductions = capped80C + capped80D + capped80CCD + capped24b + hra + other;
    }

    const totalDeductions = stdDed + chapter6ADeductions;
    const taxableIncome = Math.max(0, income - totalDeductions);

    // Calculate Slab-by-Slab Base Tax
    const slabs = regimeConfig.slabs[ageCategory];
    let baseTax = 0;
    const slabBreakdown: { label: string; rate: number; taxableInSlab: number; taxInSlab: number }[] = [];

    slabs.forEach((slab) => {
      if (taxableIncome > slab.min) {
        const upper = slab.max !== null ? Math.min(taxableIncome, slab.max) : taxableIncome;
        const amountInSlab = Math.max(0, upper - slab.min);
        const taxInSlab = (amountInSlab * slab.rate) / 100;
        baseTax += taxInSlab;

        slabBreakdown.push({
          label: slab.label,
          rate: slab.rate,
          taxableInSlab: amountInSlab,
          taxInSlab
        });
      } else {
        slabBreakdown.push({
          label: slab.label,
          rate: slab.rate,
          taxableInSlab: 0,
          taxInSlab: 0
        });
      }
    });

    // Apply Section 87A Rebate with Marginal Relief
    let rebate87A = 0;
    let marginalRelief87A = 0;

    if (isNewRegime && financialYear === '2026-2027') {
      if (taxableIncome <= 1200000) {
        rebate87A = baseTax; // Tax payable becomes 0
      } else if (taxableIncome > 1200000) {
        const excessIncomeOver12L = taxableIncome - 1200000;
        // Total tax after rebate cannot exceed excess income over 12 Lakhs
        if (baseTax > excessIncomeOver12L) {
          const maxTaxAfterRebate = excessIncomeOver12L;
          rebate87A = Math.max(0, baseTax - maxTaxAfterRebate);
          marginalRelief87A = rebate87A;
        }
      }
    } else if (isNewRegime) {
      // Historical New Regime (FY 24-25 / 25-26 limit 7L)
      if (taxableIncome <= regimeConfig.rebate87ALimit) {
        rebate87A = Math.min(baseTax, regimeConfig.rebate87AMaxAmount);
      } else if (taxableIncome > regimeConfig.rebate87ALimit) {
        const excess = taxableIncome - regimeConfig.rebate87ALimit;
        if (baseTax > excess) {
          rebate87A = Math.max(0, baseTax - excess);
          marginalRelief87A = rebate87A;
        }
      }
    } else {
      // Old Regime (Limit 5L)
      if (taxableIncome <= regimeConfig.rebate87ALimit) {
        rebate87A = Math.min(baseTax, regimeConfig.rebate87AMaxAmount);
      }
    }

    const taxAfterRebate = Math.max(0, baseTax - rebate87A);

    // Calculate Surcharge & Surcharge Marginal Relief
    const surchargeResult = calculateSurchargeWithMarginalRelief(
      taxableIncome,
      taxAfterRebate,
      isNewRegime,
      (inc) => calculateBaseTaxForRegime(inc, regimeConfig, ageCategory)
    );

    // Health & Education Cess (4%)
    const taxAndSurcharge = taxAfterRebate + surchargeResult.surchargeAmount;
    const cess = (taxAndSurcharge * 4) / 100;

    const totalTaxPayable = Math.round(taxAndSurcharge + cess);
    const monthlyTDS = Math.round(totalTaxPayable / 12);
    const takeHomeIncome = Math.max(0, income - totalTaxPayable);
    const monthlyTakeHome = Math.round(takeHomeIncome / 12);

    return {
      grossIncome: income,
      standardDeduction: stdDed,
      chapter6ADeductions,
      totalDeductions,
      taxableIncome,
      baseTax,
      rebate87A,
      marginalRelief87A,
      taxAfterRebate,
      surchargeRate: surchargeResult.rate,
      surchargeAmount: surchargeResult.surchargeAmount,
      surchargeMarginalRelief: surchargeResult.marginalRelief,
      cess,
      totalTaxPayable,
      monthlyTDS,
      takeHomeIncome,
      monthlyTakeHome,
      slabBreakdown
    };
  };

  // Computation Results for both Regimes
  const calculations = useMemo(() => {
    const fyConfig = TAX_CONFIG[financialYear];
    const userDeds = { sec80C, sec80D, sec80CCD1B, sec24b, hraExemption, otherDeductions };

    const newRegimeRes = calculateRegimeTax(grossIncome, fyConfig.newRegime, true, userDeds);
    const oldRegimeRes = calculateRegimeTax(grossIncome, fyConfig.oldRegime, false, userDeds);

    const diff = Math.abs(newRegimeRes.totalTaxPayable - oldRegimeRes.totalTaxPayable);
    let recommendation = '';
    let betterRegime: 'new' | 'old' | 'equal' = 'equal';

    if (newRegimeRes.totalTaxPayable < oldRegimeRes.totalTaxPayable) {
      betterRegime = 'new';
      recommendation = `🎉 New Tax Regime saves you ${formatCurrency(diff)} tax annually!`;
    } else if (oldRegimeRes.totalTaxPayable < newRegimeRes.totalTaxPayable) {
      betterRegime = 'old';
      recommendation = `🎉 Old Tax Regime saves you ${formatCurrency(diff)} tax annually!`;
    } else {
      betterRegime = 'equal';
      recommendation = `⚖️ Both regimes result in the exact same tax liability (${formatCurrency(newRegimeRes.totalTaxPayable)}).`;
    }

    return {
      newRegime: newRegimeRes,
      oldRegime: oldRegimeRes,
      diff,
      betterRegime,
      recommendation,
      fyConfig
    };
  }, [grossIncome, financialYear, incomeType, ageCategory, sec80C, sec80D, sec80CCD1B, sec24b, hraExemption, otherDeductions]);

  // Selected Active Regime Result for Chart & Breakdown Table
  const activeResult = activeTab === 'old' ? calculations.oldRegime : calculations.newRegime;

  const pieData = [
    { name: "Take-Home Income", value: activeResult.takeHomeIncome, color: "#10b981" },
    { name: "Total Tax Paid", value: activeResult.totalTaxPayable, color: "#f43f5e" }
  ];

  const handleCopy = () => {
    const text = `Income Tax Computation (${calculations.fyConfig.label}):
Gross Income: ${formatCurrency(grossIncome)}
New Regime Tax: ${formatCurrency(calculations.newRegime.totalTaxPayable)} (Monthly TDS: ${formatCurrency(calculations.newRegime.monthlyTDS)})
Old Regime Tax: ${formatCurrency(calculations.oldRegime.totalTaxPayable)} (Monthly TDS: ${formatCurrency(calculations.oldRegime.monthlyTDS)})
Recommendation: ${calculations.recommendation}
Calculated via ToolWala AI Income Tax Calculator: ${window.location.href}`;
    
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const article = toolArticles['income-tax-calculator'];

  return (
    <ToolVisibilityGuard slug="income-tax-calculator">
      <div className="relative min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-white transition-colors duration-300 overflow-hidden font-sans">
        {/* Background Gradients */}
        <MeshGradient />
        <FloatingParticles />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-24">
          
          {/* Navigation */}
          <div className="flex items-center justify-between mb-8">
            <Link 
              href="/tools" 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-white/10 transition-all shadow-sm"
            >
              <ChevronLeft className="w-4 h-4" /> Back to Tools
            </Link>

            <div className="flex items-center gap-3">
              <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" /> Privacy-First Browser Calculation
              </span>
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-700 dark:text-gray-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-white/10 transition-all shadow-sm cursor-pointer"
                title="Reset Calculator"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Reset
              </button>
            </div>
          </div>

          {/* Header Title Banner */}
          <div className="text-center max-w-3xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-4 shadow-sm">
              <Calculator className="w-4 h-4" /> FY 2026-27 (AY 2027-28) Official Slabs
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-3">
              Income Tax Calculator <span className="text-emerald-600 dark:text-emerald-400">(India)</span>
            </h1>
            <p className="text-slate-600 dark:text-gray-400 text-sm sm:text-base font-medium leading-relaxed">
              Compare New vs Old Tax Regime liability instantly in real-time. Includes Union Budget FY 2026-27 verified slabs, Section 87A marginal relief, and statutory deduction limits.
            </p>
          </div>

          {/* Main 2-Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
            
            {/* Left Inputs Panel (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-white/10 p-6 sm:p-7 rounded-[2rem] shadow-xl backdrop-blur-xl space-y-6">
                
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-4">
                  <h3 className="text-base font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-emerald-500" /> Income Parameters
                  </h3>
                  <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    {calculations.fyConfig.ayLabel}
                  </span>
                </div>

                {/* Financial Year Selector */}
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-700 dark:text-gray-300">
                    Financial Year (Assessment Year)
                  </label>
                  <select
                    value={financialYear}
                    onChange={(e) => setFinancialYear(e.target.value as FinancialYear)}
                    className="w-full bg-slate-100 dark:bg-black/50 border border-slate-300 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-emerald-500 cursor-pointer shadow-sm"
                  >
                    <option value="2026-2027">FY 2026-27 (AY 2027-28) — Latest Budget</option>
                    <option value="2025-2026">FY 2025-26 (AY 2026-27)</option>
                    <option value="2024-2025">FY 2024-25 (AY 2025-26)</option>
                  </select>
                </div>

                {/* Income Type Selector */}
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-700 dark:text-gray-300">
                    Income Category
                  </label>
                  <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl">
                    <button
                      onClick={() => setIncomeType('salaried')}
                      className={`py-2.5 px-3 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                        incomeType === 'salaried'
                          ? 'bg-emerald-500 text-white shadow-md'
                          : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      Salaried / Pension
                    </button>
                    <button
                      onClick={() => setIncomeType('business')}
                      className={`py-2.5 px-3 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                        incomeType === 'business'
                          ? 'bg-emerald-500 text-white shadow-md'
                          : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      Self-Employed / Other
                    </button>
                  </div>
                </div>

                {/* Age Category Selector */}
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-700 dark:text-gray-300">
                    Individual Age Category
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'below60', label: '< 60 Yrs', sub: 'General' },
                      { id: 'senior', label: '60 - 80 Yrs', sub: 'Senior' },
                      { id: 'superSenior', label: '> 80 Yrs', sub: 'Super Sr.' }
                    ].map(item => (
                      <button
                        key={item.id}
                        onClick={() => setAgeCategory(item.id as AgeCategory)}
                        className={`py-2.5 px-2 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                          ageCategory === item.id
                            ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-extrabold shadow-sm'
                            : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-gray-400 hover:border-slate-300 dark:hover:border-white/20'
                        }`}
                      >
                        <span className="text-xs font-black uppercase">{item.label}</span>
                        <span className="text-[10px] opacity-75 font-semibold">{item.sub}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Gross Annual Income Input Slider */}
                <InputSlider
                  label="Gross Annual Income"
                  min={100000}
                  max={10000000}
                  step={25000}
                  value={grossIncome}
                  onChange={setGrossIncome}
                  icon={DollarSign}
                  helperText="Total income before any exemptions or deductions."
                  presets={[
                    { label: "₹7 Lakhs", value: 700000 },
                    { label: "₹12 Lakhs", value: 1200000 },
                    { label: "₹15 Lakhs", value: 1500000 },
                    { label: "₹24 Lakhs", value: 2400000 },
                    { label: "₹50 Lakhs", value: 5000000 }
                  ]}
                />

                {/* Old Regime Deductions Accordion */}
                <div className="border-t border-slate-100 dark:border-white/5 pt-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-emerald-500" /> Old Regime Deductions & Exemptions
                    </h4>
                    <span className="text-[10px] font-bold text-slate-500 dark:text-gray-400">
                      Applied to Old Regime Only
                    </span>
                  </div>

                  <div className="space-y-4 p-4 rounded-2xl bg-slate-50/80 dark:bg-black/30 border border-slate-200/80 dark:border-white/5">
                    {/* Section 80C */}
                    <InputSlider
                      label="Section 80C (EPF, PPF, ELSS, LIC)"
                      min={0}
                      max={200000}
                      step={5000}
                      value={sec80C}
                      onChange={setSec80C}
                      limit={DEDUCTION_LIMITS.sec80C}
                      helperText="Statutory deduction limit: ₹1,50,000 per financial year."
                    />

                    {/* Section 80D */}
                    <InputSlider
                      label="Section 80D (Health Insurance)"
                      min={0}
                      max={100000}
                      step={2500}
                      value={sec80D}
                      onChange={setSec80D}
                      limit={ageCategory === 'below60' ? DEDUCTION_LIMITS.sec80DGeneral : DEDUCTION_LIMITS.sec80DSenior}
                      helperText={`Max ₹25,000 for general / ₹50,000 for senior citizens.`}
                    />

                    {/* Section 80CCD(1B) NPS */}
                    <InputSlider
                      label="Section 80CCD(1B) (NPS Extra)"
                      min={0}
                      max={100000}
                      step={5000}
                      value={sec80CCD1B}
                      onChange={setSec80CCD1B}
                      limit={DEDUCTION_LIMITS.sec80CCD1B}
                      helperText="Additional NPS tax benefit limit: ₹50,000."
                    />

                    {/* Section 24(b) Home Loan Interest */}
                    <InputSlider
                      label="Section 24(b) (Home Loan Interest)"
                      min={0}
                      max={400000}
                      step={10000}
                      value={sec24b}
                      onChange={setSec24b}
                      limit={DEDUCTION_LIMITS.sec24b}
                      helperText="Max ₹2,00,000 deduction on self-occupied home loan interest."
                    />

                    {/* HRA Exemption */}
                    <InputSlider
                      label="HRA Exemption Amount"
                      min={0}
                      max={500000}
                      step={5000}
                      value={hraExemption}
                      onChange={setHraExemption}
                      helperText="Calculate minimum of Actual HRA, Rent paid - 10% salary, or 50%/40% basic."
                    />

                    {/* Other Deductions */}
                    <InputSlider
                      label="Other Exemptions / 80E / 80G"
                      min={0}
                      max={300000}
                      step={5000}
                      value={otherDeductions}
                      onChange={setOtherDeductions}
                      helperText="Education loan interest (80E), donations (80G), savings interest (80TTA/TTB)."
                    />
                  </div>
                </div>

              </div>
            </div>

            {/* Right Comparison & Results Panel (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Recommendation Banner */}
              <motion.div 
                key={calculations.betterRegime + calculations.diff}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-5 sm:p-6 rounded-[2rem] border shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 ${
                  calculations.betterRegime === 'new'
                    ? 'bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-500/15 border-emerald-500/30 text-emerald-900 dark:text-emerald-200'
                    : calculations.betterRegime === 'old'
                    ? 'bg-gradient-to-r from-blue-500/15 via-indigo-500/10 to-blue-500/15 border-blue-500/30 text-blue-900 dark:text-blue-200'
                    : 'bg-slate-100 dark:bg-white/5 border-slate-300 dark:border-white/10 text-slate-900 dark:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 font-black text-xl shadow-md ${
                    calculations.betterRegime === 'new'
                      ? 'bg-emerald-500 text-white'
                      : calculations.betterRegime === 'old'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700 text-white'
                  }`}>
                    {calculations.betterRegime === 'new' ? '⚡' : calculations.betterRegime === 'old' ? '🏛️' : '⚖️'}
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-80 block">Recommendation</span>
                    <h3 className="text-base sm:text-lg font-black tracking-tight">{calculations.recommendation}</h3>
                  </div>
                </div>

                <button
                  onClick={handleCopy}
                  className="px-4 py-2.5 rounded-xl bg-white/90 dark:bg-white/10 border border-slate-200 dark:border-white/10 hover:bg-white text-xs font-black uppercase tracking-wider text-slate-800 dark:text-white transition-all shadow-sm shrink-0 flex items-center gap-1.5 cursor-pointer"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy Summary'}
                </button>
              </motion.div>

              {/* Side-by-Side Comparison Matrix */}
              <div className="bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-white/10 p-6 sm:p-7 rounded-[2rem] shadow-xl backdrop-blur-xl space-y-6">
                
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-4">
                  <h3 className="text-base font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                    <TrendingDown className="w-4 h-4 text-emerald-500" /> Regime Comparison Matrix
                  </h3>
                  <div className="flex items-center gap-1 bg-slate-100 dark:bg-black/40 p-1 rounded-xl border border-slate-200 dark:border-white/10">
                    <button
                      onClick={() => setActiveTab('compare')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold uppercase transition-all ${
                        activeTab === 'compare' ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-600 dark:text-gray-400'
                      }`}
                    >
                      Side-by-Side
                    </button>
                    <button
                      onClick={() => setActiveTab('new')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold uppercase transition-all ${
                        activeTab === 'new' ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-600 dark:text-gray-400'
                      }`}
                    >
                      New Regime
                    </button>
                    <button
                      onClick={() => setActiveTab('old')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold uppercase transition-all ${
                        activeTab === 'old' ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-600 dark:text-gray-400'
                      }`}
                    >
                      Old Regime
                    </button>
                  </div>
                </div>

                {/* Table Breakdown */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[500px]">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-white/10 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-gray-500">
                        <th className="py-3 px-2">Tax Computation Component</th>
                        <th className={`py-3 px-2 text-right ${activeTab === 'old' ? 'opacity-40' : ''}`}>
                          New Tax Regime <span className="text-[9px] text-emerald-500 font-extrabold">(Default)</span>
                        </th>
                        <th className={`py-3 px-2 text-right ${activeTab === 'new' ? 'opacity-40' : ''}`}>
                          Old Tax Regime <span className="text-[9px] text-blue-500 font-extrabold">(Optional)</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-xs font-bold">
                      
                      <tr>
                        <td className="py-3 px-2 text-slate-600 dark:text-gray-400 font-medium">Gross Annual Income</td>
                        <td className="py-3 px-2 text-right font-mono text-slate-900 dark:text-white">{formatCurrency(grossIncome)}</td>
                        <td className="py-3 px-2 text-right font-mono text-slate-900 dark:text-white">{formatCurrency(grossIncome)}</td>
                      </tr>

                      <tr>
                        <td className="py-3 px-2 text-slate-600 dark:text-gray-400 font-medium">Less: Standard Deduction</td>
                        <td className="py-3 px-2 text-right font-mono text-emerald-600 dark:text-emerald-400">-{formatCurrency(calculations.newRegime.standardDeduction)}</td>
                        <td className="py-3 px-2 text-right font-mono text-blue-600 dark:text-blue-400">-{formatCurrency(calculations.oldRegime.standardDeduction)}</td>
                      </tr>

                      <tr>
                        <td className="py-3 px-2 text-slate-600 dark:text-gray-400 font-medium">Less: Sec 80C, 80D, 24(b) Deductions</td>
                        <td className="py-3 px-2 text-right font-mono text-slate-400 dark:text-gray-600">₹0 (Not Allowed)</td>
                        <td className="py-3 px-2 text-right font-mono text-blue-600 dark:text-blue-400">-{formatCurrency(calculations.oldRegime.chapter6ADeductions)}</td>
                      </tr>

                      <tr className="bg-slate-50 dark:bg-white/[0.02]">
                        <td className="py-3 px-2 text-slate-900 dark:text-white font-black uppercase text-[11px]">Net Taxable Income</td>
                        <td className="py-3 px-2 text-right font-mono text-slate-900 dark:text-white font-black text-sm">{formatCurrency(calculations.newRegime.taxableIncome)}</td>
                        <td className="py-3 px-2 text-right font-mono text-slate-900 dark:text-white font-black text-sm">{formatCurrency(calculations.oldRegime.taxableIncome)}</td>
                      </tr>

                      <tr>
                        <td className="py-3 px-2 text-slate-600 dark:text-gray-400 font-medium">Tax Calculated as per Slabs</td>
                        <td className="py-3 px-2 text-right font-mono text-slate-900 dark:text-white">{formatCurrency(calculations.newRegime.baseTax)}</td>
                        <td className="py-3 px-2 text-right font-mono text-slate-900 dark:text-white">{formatCurrency(calculations.oldRegime.baseTax)}</td>
                      </tr>

                      <tr>
                        <td className="py-3 px-2 text-slate-600 dark:text-gray-400 font-medium flex items-center gap-1">
                          Less: Section 87A Tax Rebate
                          {calculations.newRegime.marginalRelief87A > 0 && (
                            <span className="text-[9px] font-black uppercase text-amber-500 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded">Marginal Relief</span>
                          )}
                        </td>
                        <td className="py-3 px-2 text-right font-mono text-emerald-600 dark:text-emerald-400">-{formatCurrency(calculations.newRegime.rebate87A)}</td>
                        <td className="py-3 px-2 text-right font-mono text-blue-600 dark:text-blue-400">-{formatCurrency(calculations.oldRegime.rebate87A)}</td>
                      </tr>

                      <tr>
                        <td className="py-3 px-2 text-slate-600 dark:text-gray-400 font-medium">
                          Surcharge {calculations.newRegime.surchargeRate > 0 ? `(${calculations.newRegime.surchargeRate}%)` : ''}
                        </td>
                        <td className="py-3 px-2 text-right font-mono text-slate-900 dark:text-white">+{formatCurrency(calculations.newRegime.surchargeAmount)}</td>
                        <td className="py-3 px-2 text-right font-mono text-slate-900 dark:text-white">+{formatCurrency(calculations.oldRegime.surchargeAmount)}</td>
                      </tr>

                      <tr>
                        <td className="py-3 px-2 text-slate-600 dark:text-gray-400 font-medium">Health & Education Cess (4%)</td>
                        <td className="py-3 px-2 text-right font-mono text-slate-900 dark:text-white">+{formatCurrency(calculations.newRegime.cess)}</td>
                        <td className="py-3 px-2 text-right font-mono text-slate-900 dark:text-white">+{formatCurrency(calculations.oldRegime.cess)}</td>
                      </tr>

                      <tr className="bg-emerald-500/10 dark:bg-emerald-500/15">
                        <td className="py-4 px-2 text-slate-900 dark:text-white font-black uppercase text-xs">Total Tax Payable</td>
                        <td className="py-4 px-2 text-right font-mono font-black text-base text-emerald-600 dark:text-emerald-400">{formatCurrency(calculations.newRegime.totalTaxPayable)}</td>
                        <td className="py-4 px-2 text-right font-mono font-black text-base text-blue-600 dark:text-blue-400">{formatCurrency(calculations.oldRegime.totalTaxPayable)}</td>
                      </tr>

                      <tr>
                        <td className="py-3 px-2 text-slate-600 dark:text-gray-400 font-medium">Monthly TDS Deduction</td>
                        <td className="py-3 px-2 text-right font-mono text-slate-900 dark:text-white">{formatCurrency(calculations.newRegime.monthlyTDS)} / mo</td>
                        <td className="py-3 px-2 text-right font-mono text-slate-900 dark:text-white">{formatCurrency(calculations.oldRegime.monthlyTDS)} / mo</td>
                      </tr>

                      <tr className="bg-slate-100 dark:bg-white/5">
                        <td className="py-3 px-2 text-slate-900 dark:text-white font-black uppercase text-xs">Net Take-Home Salary</td>
                        <td className="py-3 px-2 text-right font-mono text-slate-900 dark:text-white font-black text-sm">{formatCurrency(calculations.newRegime.takeHomeIncome)}</td>
                        <td className="py-3 px-2 text-right font-mono text-slate-900 dark:text-white font-black text-sm">{formatCurrency(calculations.oldRegime.takeHomeIncome)}</td>
                      </tr>

                    </tbody>
                  </table>
                </div>

                {/* Slabs Breakdown Table per active selection */}
                <div className="border-t border-slate-100 dark:border-white/5 pt-5 space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-emerald-500" /> Slab-Wise Tax Breakdown ({activeTab === 'old' ? 'Old Regime' : 'New Regime'})
                  </h4>

                  <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-white/10">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-100 dark:bg-white/5 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-400">
                          <th className="py-2.5 px-3">Tax Slab Range</th>
                          <th className="py-2.5 px-3">Tax Rate</th>
                          <th className="py-2.5 px-3 text-right">Taxable Amount in Slab</th>
                          <th className="py-2.5 px-3 text-right">Tax Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-white/5 font-semibold">
                        {activeResult.slabBreakdown.map((sb, idx) => (
                          <tr key={idx} className={sb.taxInSlab > 0 ? 'bg-emerald-500/5' : ''}>
                            <td className="py-2.5 px-3 text-slate-900 dark:text-white">{sb.label}</td>
                            <td className="py-2.5 px-3 text-slate-600 dark:text-gray-400">{sb.rate}%</td>
                            <td className="py-2.5 px-3 text-right font-mono text-slate-700 dark:text-gray-300">{formatCurrency(sb.taxableInSlab)}</td>
                            <td className="py-2.5 px-3 text-right font-mono text-slate-900 dark:text-white font-bold">{formatCurrency(sb.taxInSlab)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Donut Chart Visual Breakdown */}
                {mounted && (
                  <div className="border-t border-slate-100 dark:border-white/5 pt-5 space-y-4">
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                      <PieIcon className="w-4 h-4 text-emerald-500" /> Take-Home vs Tax Paid Split ({activeTab === 'old' ? 'Old Regime' : 'New Regime'})
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center bg-slate-50 dark:bg-white/[0.02] p-4 rounded-2xl border border-slate-200 dark:border-white/5">
                      <div className="h-48 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={pieData}
                              cx="50%"
                              cy="50%"
                              innerRadius={55}
                              outerRadius={75}
                              paddingAngle={4}
                              dataKey="value"
                            >
                              {pieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                              ))}
                            </Pie>
                            <Tooltip content={<CustomPieTooltip />} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>

                      <div className="space-y-3 font-semibold text-xs">
                        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-emerald-500" />
                            <span className="text-slate-900 dark:text-white">Annual Take-Home:</span>
                          </div>
                          <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                            {formatCurrency(activeResult.takeHomeIncome)}
                          </span>
                        </div>

                        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-rose-500" />
                            <span className="text-slate-900 dark:text-white">Total Income Tax:</span>
                          </div>
                          <span className="font-mono font-bold text-rose-600 dark:text-rose-400 text-sm">
                            {formatCurrency(activeResult.totalTaxPayable)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              </div>

              {/* Mandatory Disclaimer Box */}
              <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 text-xs font-semibold leading-relaxed flex items-start gap-3 shadow-sm">
                <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold uppercase tracking-wider mb-1">Official Disclaimer</p>
                  <p>
                    This calculator uses FY 2026-27 tax slabs as per Union Budget 2025-26 (unchanged in Budget 2026). Rates may change in future budgets — please verify with the official Income Tax Department website (incometax.gov.in) or a tax professional before filing.
                  </p>
                </div>
              </div>

            </div>

          </div>

          {/* Deep Dive Article / FAQ Section */}
          {article && (
            <div className="mt-16">
              <ToolArticle {...article} />
            </div>
          )}

        </div>
      </div>
    </ToolVisibilityGuard>
  );
}
