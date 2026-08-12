"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  ChevronLeft, Calculator, DollarSign, ShieldCheck, RefreshCw, 
  Copy, CheckCircle2, AlertCircle, Info, Heart, Award, Sparkles, 
  BookOpen, Target, Sliders, ArrowRight, Zap, HelpCircle, Check,
  TrendingDown, FileText, ChevronDown, ChevronUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { MeshGradient, FloatingParticles } from '@/components/BackgroundEffects';
import ToolVisibilityGuard from '@/components/ToolVisibilityGuard';
import { toolArticles } from '@/data/toolArticles';
import ToolArticle from '@/components/ToolArticle';
import { 
  TAX_CONFIG, getSurchargeRate, AgeCategory, FinancialYear, TaxSlab, RegimeConfig 
} from '@/lib/taxConstants';

const SEO_DESC = "Calculate your Indian Income Tax for FY 2024-25 & FY 2025-26 with New vs Old Regime comparison, slab breakdowns, and Section 80C/80D deductions.";

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

// Input Slider Component with Prominent Draggable Circle Handle Knob
function InputSlider({ 
  label, min, max, step, value, onChange, icon: Icon, suffix = "₹", 
  helperText, presets, placeholder = "" 
}: any) {
  const isOverLimit = typeof value === 'number' && value > max;
  const numVal = typeof value === 'number' ? value : min;
  const pct = Math.min(100, Math.max(0, ((numVal - min) / (max - min)) * 100));

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div className="flex items-center gap-2">
          <Icon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
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
              if (typeof val === 'number' && val > max) val = max;
              onChange(val);
            }}
            onBlur={() => {
              if (value !== '' && value < min) onChange(min);
              if (value !== '' && typeof value === 'number' && value > max) onChange(max);
            }}
            className={`w-full bg-slate-100 dark:bg-black/40 border ${
              isOverLimit ? 'border-amber-500 ring-2 ring-amber-500/20' : 'border-slate-300 dark:border-white/10'
            } hover:border-slate-400 dark:hover:border-white/20 rounded-xl py-3 px-4 pr-10 text-slate-900 dark:text-white font-mono text-lg text-center focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all placeholder:text-slate-400 dark:placeholder:text-white/20 shadow-inner dark:shadow-none`}
          />
          {suffix && <span className="absolute right-4 text-slate-500 dark:text-emerald-400 text-sm font-extrabold pointer-events-none">{suffix}</span>}
        </div>
      </div>

      {isOverLimit && (
        <p className="text-xs text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1">
          ⚠️ Maximum limit is {formatCurrency(max)}
        </p>
      )}

      {value > 0 && (
        <div className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/30 px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-sm">
          <span className="font-bold text-emerald-800 dark:text-emerald-400 shrink-0">🔤 In Words:</span>
          <span className="font-bold truncate text-slate-900 dark:text-white">{numberToWordsINR(Number(value))}</span>
        </div>
      )}
      
      <p className="text-xs text-slate-600 dark:text-gray-400 font-medium">{helperText}</p>
      
      {/* Interactive Slider Track */}
      <div className="relative w-full py-3 cursor-pointer group select-none">
        <div className="w-full h-2.5 bg-slate-200 dark:bg-white/10 rounded-full relative overflow-hidden shadow-inner">
          <motion.div 
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full" 
            animate={{ width: `${pct}%` }} 
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        </div>

        {/* Draggable Circle Handle Knob */}
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
              className="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 hover:bg-emerald-500/20 dark:hover:bg-emerald-500/20 hover:text-emerald-700 dark:hover:text-emerald-300 text-slate-700 dark:text-slate-200 transition-all shadow-sm"
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

  // Settings
  const [financialYear, setFinancialYear] = useState<FinancialYear>('2024-2025');
  const [ageCategory, setAgeCategory] = useState<AgeCategory>('below60');
  const [activeTab, setActiveTab] = useState<'compare' | 'new' | 'old'>('compare');

  // Gross Salary
  const [grossIncome, setGrossIncome] = useState<number>(1200000); // Default ₹12 Lakhs

  // Old Regime Deductions
  const [sec80C, setSec80C] = useState<number>(150000); // Max 1.5L
  const [sec80D, setSec80D] = useState<number>(25000);  // Health Ins
  const [sec24b, setSec24b] = useState<number>(0);      // Home Loan Interest
  const [sec80CCD1B, setSec80CCD1B] = useState<number>(0); // NPS
  const [hraExemption, setHraExemption] = useState<number>(0);
  const [otherDeductions, setOtherDeductions] = useState<number>(0);

  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleReset = () => {
    setGrossIncome(1200000);
    setFinancialYear('2024-2025');
    setAgeCategory('below60');
    setSec80C(150000);
    setSec80D(25000);
    setSec24b(0);
    setSec80CCD1B(0);
    setHraExemption(0);
    setOtherDeductions(0);
  };

  // Computation Logic for a Specific Regime
  const calculateRegimeTax = (
    income: number, 
    regimeConfig: RegimeConfig, 
    isNewRegime: boolean,
    userDeductions: { sec80C: number; sec80D: number; sec24b: number; sec80CCD1B: number; hraExemption: number; otherDeductions: number }
  ) => {
    const stdDed = regimeConfig.standardDeduction;

    let totalDeductions = stdDed;
    if (!isNewRegime) {
      // Capped deductions for Old Regime
      const capped80C = Math.min(150000, userDeductions.sec80C || 0);
      const capped80D = Math.min(ageCategory === 'below60' ? 25000 : 50000, userDeductions.sec80D || 0);
      const capped24b = Math.min(200000, userDeductions.sec24b || 0);
      const capped80CCD = Math.min(50000, userDeductions.sec80CCD1B || 0);
      const hra = userDeductions.hraExemption || 0;
      const other = userDeductions.otherDeductions || 0;

      totalDeductions += capped80C + capped80D + capped24b + capped80CCD + hra + other;
    }

    const taxableIncome = Math.max(0, income - totalDeductions);

    // Calculate Slab-by-Slab Tax
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

    // Apply Section 87A Rebate
    let rebate87A = 0;
    if (taxableIncome <= regimeConfig.rebate87ALimit) {
      rebate87A = Math.min(baseTax, regimeConfig.rebate87AMaxAmount);
    }

    const taxAfterRebate = Math.max(0, baseTax - rebate87A);

    // Calculate Surcharge
    const surchargeRate = getSurchargeRate(taxableIncome, isNewRegime);
    const surchargeAmount = (taxAfterRebate * surchargeRate) / 100;

    // Calculate Health & Education Cess (4%)
    const taxAndSurcharge = taxAfterRebate + surchargeAmount;
    const cess = (taxAndSurcharge * 4) / 100;

    const totalTaxPayable = Math.round(taxAndSurcharge + cess);
    const monthlyTDS = Math.round(totalTaxPayable / 12);
    const takeHomeIncome = Math.max(0, income - totalTaxPayable);

    return {
      grossIncome: income,
      standardDeduction: stdDed,
      totalDeductions,
      taxableIncome,
      baseTax,
      rebate87A,
      taxAfterRebate,
      surchargeRate,
      surchargeAmount,
      cess,
      totalTaxPayable,
      monthlyTDS,
      takeHomeIncome,
      slabBreakdown
    };
  };

  // Computation Results for both Regimes
  const calculations = useMemo(() => {
    const config = TAX_CONFIG[financialYear];
    const userDeds = { sec80C, sec80D, sec24b, sec80CCD1B, hraExemption, otherDeductions };

    const newRegimeRes = calculateRegimeTax(grossIncome, config.newRegime, true, userDeds);
    const oldRegimeRes = calculateRegimeTax(grossIncome, config.oldRegime, false, userDeds);

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
      recommendation
    };
  }, [grossIncome, financialYear, ageCategory, sec80C, sec80D, sec24b, sec80CCD1B, hraExemption, otherDeductions]);

  // Selected Active Regime Result for Charts
  const activeResult = activeTab === 'old' ? calculations.oldRegime : calculations.newRegime;

  const pieData = [
    { name: "Take-Home Income", value: activeResult.takeHomeIncome, color: "#10b981" },
    { name: "Total Tax Paid", value: activeResult.totalTaxPayable, color: "#f43f5e" }
  ];

  const handleCopy = () => {
    const text = `Income Tax Computation (FY ${financialYear}):
Gross Income: ${formatCurrency(grossIncome)}
New Regime Tax: ${formatCurrency(calculations.newRegime.totalTaxPayable)} (Monthly TDS: ${formatCurrency(calculations.newRegime.monthlyTDS)})
Old Regime Tax: ${formatCurrency(calculations.oldRegime.totalTaxPayable)} (Monthly TDS: ${formatCurrency(calculations.oldRegime.monthlyTDS)})
Recommendation: ${calculations.recommendation}
Calculated via ToolWala AI: ${window.location.href}`;
    
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
          
          {/* Top Breadcrumbs */}
          <div className="flex items-center justify-between mb-8">
            <Link 
              href="/tools" 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-white/10 transition-all shadow-sm"
            >
              <ChevronLeft className="w-4 h-4" /> Back to Tools
            </Link>

            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold shadow-sm">
              <ShieldCheck className="w-4 h-4" /> 100% Client-Side & Private
            </span>
          </div>

          {/* Hero Header */}
          <div className="text-center max-w-3xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-4 shadow-sm">
              <Calculator className="w-4 h-4" />
              <span>Calculator Tools</span>
            </div>
            
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 dark:text-white mb-3 uppercase leading-none">
              Income Tax Calculator
            </h1>
            <p className="text-emerald-600 dark:text-emerald-400 text-sm sm:text-base font-extrabold uppercase tracking-widest mb-4">
              India • FY {financialYear} • New vs Old Tax Regime
            </p>
            <p className="text-slate-600 dark:text-gray-400 text-sm sm:text-base font-medium leading-relaxed max-w-2xl mx-auto">
              {SEO_DESC}
            </p>

            {/* Feature Badges */}
            <div className="flex flex-wrap justify-center items-center gap-3 sm:gap-6 mt-6">
              <span className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-gray-400 bg-white/60 dark:bg-white/5 px-3 py-1.5 rounded-full border border-slate-200 dark:border-white/5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Private & Secure
              </span>
              <span className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-gray-400 bg-white/60 dark:bg-white/5 px-3 py-1.5 rounded-full border border-slate-200 dark:border-white/5">
                <Zap className="w-3.5 h-3.5 text-emerald-500" /> Instant Comparison
              </span>
              <span className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-gray-400 bg-white/60 dark:bg-white/5 px-3 py-1.5 rounded-full border border-slate-200 dark:border-white/5">
                <Target className="w-3.5 h-3.5 text-emerald-500" /> Union Budget Slabs
              </span>
            </div>
          </div>

          {/* Tax Saving Recommendation Banner */}
          <div className="mb-10 max-w-4xl mx-auto">
            <div className="glass rounded-2xl border border-emerald-500/30 p-5 bg-emerald-500/10 text-emerald-900 dark:text-emerald-300 flex items-center justify-between shadow-lg">
              <div className="flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="text-sm sm:text-base font-black tracking-wide">{calculations.recommendation}</span>
              </div>
            </div>
          </div>

          {/* Calculator Main Section */}
          <div id="calculator-section" className="flex flex-col lg:flex-row gap-8 mb-16">
            
            {/* Input Form Panel */}
            <div className="w-full lg:w-5/12 space-y-6 shrink-0">
              <div className="glass rounded-[2.5rem] border border-slate-200/80 dark:border-white/5 shadow-2xl p-6 sm:p-8 bg-white dark:bg-white/[0.01]">
                
                {/* Header & Reset */}
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/5 pb-4 mb-6">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">Income & Deductions</h3>
                  </div>
                  <button 
                    onClick={handleReset}
                    className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                  >
                    <RefreshCw className="w-3 h-3" /> Reset
                  </button>
                </div>

                {/* Financial Year & Age Selectors */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                  {/* FY Selector */}
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-500 mb-2 block">Financial Year</span>
                    <select
                      value={financialYear}
                      onChange={(e) => setFinancialYear(e.target.value as FinancialYear)}
                      className="w-full bg-slate-100 dark:bg-black/40 border border-slate-300 dark:border-white/10 rounded-xl py-3 px-3 text-slate-900 dark:text-white font-bold text-xs focus:outline-none focus:border-emerald-500/50 cursor-pointer"
                    >
                      <option value="2024-2025">FY 2024-25 (AY 2025-26)</option>
                      <option value="2025-2026">FY 2025-26 (AY 2026-27)</option>
                    </select>
                  </div>

                  {/* Age Category Selector */}
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-500 mb-2 block">Age Category</span>
                    <select
                      value={ageCategory}
                      onChange={(e) => setAgeCategory(e.target.value as AgeCategory)}
                      className="w-full bg-slate-100 dark:bg-black/40 border border-slate-300 dark:border-white/10 rounded-xl py-3 px-3 text-slate-900 dark:text-white font-bold text-xs focus:outline-none focus:border-emerald-500/50 cursor-pointer"
                    >
                      <option value="below60">Below 60 Years</option>
                      <option value="senior">60 to 80 Yrs (Senior)</option>
                      <option value="superSenior">Above 80 Yrs (Super Sr)</option>
                    </select>
                  </div>
                </div>

                {/* Gross Annual Income Input Slider */}
                <div className="mb-8">
                  <InputSlider 
                    label="Gross Annual Income"
                    helperText="Enter your total annual income from Salary, Business, House Property, & Investments."
                    icon={DollarSign}
                    min={100000}
                    max={5000000} // Up to 50 Lakhs on slider (manual input up to 10Cr)
                    step={10000}
                    value={grossIncome}
                    onChange={setGrossIncome}
                    suffix="₹"
                    placeholder="1200000"
                    presets={[
                      { label: "₹5L", value: 500000 },
                      { label: "₹10L", value: 1000000 },
                      { label: "₹15L", value: 1500000 },
                      { label: "₹25L", value: 2500000 },
                      { label: "₹50L", value: 5000000 },
                    ]}
                  />
                </div>

                {/* Old Tax Regime Deductions Section */}
                <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-white/5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">Old Regime Deductions & Exemptions</span>
                    <span className="text-[10px] font-bold text-slate-500 dark:text-gray-400">(Editable for Old Regime)</span>
                  </div>

                  {/* Section 80C */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-700 dark:text-gray-300">Section 80C (PPF, EPF, ELSS, LIC)</span>
                      <span className="text-slate-500 dark:text-gray-400 font-mono text-[11px]">Max ₹1,50,000</span>
                    </div>
                    <div className="relative flex items-center">
                      <input 
                        type="number"
                        min={0}
                        max={150000}
                        value={sec80C}
                        onChange={(e) => setSec80C(Math.min(150000, Math.max(0, Number(e.target.value) || 0)))}
                        className="w-full bg-slate-100 dark:bg-black/40 border border-slate-300 dark:border-white/10 rounded-xl py-2 px-3 text-slate-900 dark:text-white font-mono text-sm focus:outline-none focus:border-emerald-500/50"
                      />
                      <span className="absolute right-3 text-xs font-extrabold text-slate-500 dark:text-emerald-400">₹</span>
                    </div>
                  </div>

                  {/* Section 80D */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-700 dark:text-gray-300">Section 80D (Health Insurance)</span>
                      <span className="text-slate-500 dark:text-gray-400 font-mono text-[11px]">Max ₹{ageCategory === 'below60' ? '25,000' : '50,000'}</span>
                    </div>
                    <div className="relative flex items-center">
                      <input 
                        type="number"
                        min={0}
                        max={ageCategory === 'below60' ? 25000 : 50000}
                        value={sec80D}
                        onChange={(e) => setSec80D(Math.min(ageCategory === 'below60' ? 25000 : 50000, Math.max(0, Number(e.target.value) || 0)))}
                        className="w-full bg-slate-100 dark:bg-black/40 border border-slate-300 dark:border-white/10 rounded-xl py-2 px-3 text-slate-900 dark:text-white font-mono text-sm focus:outline-none focus:border-emerald-500/50"
                      />
                      <span className="absolute right-3 text-xs font-extrabold text-slate-500 dark:text-emerald-400">₹</span>
                    </div>
                  </div>

                  {/* Section 24b Home Loan Interest */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-700 dark:text-gray-300">Section 24b (Home Loan Interest)</span>
                      <span className="text-slate-500 dark:text-gray-400 font-mono text-[11px]">Max ₹2,00,000</span>
                    </div>
                    <div className="relative flex items-center">
                      <input 
                        type="number"
                        min={0}
                        max={200000}
                        value={sec24b}
                        onChange={(e) => setSec24b(Math.min(200000, Math.max(0, Number(e.target.value) || 0)))}
                        className="w-full bg-slate-100 dark:bg-black/40 border border-slate-300 dark:border-white/10 rounded-xl py-2 px-3 text-slate-900 dark:text-white font-mono text-sm focus:outline-none focus:border-emerald-500/50"
                      />
                      <span className="absolute right-3 text-xs font-extrabold text-slate-500 dark:text-emerald-400">₹</span>
                    </div>
                  </div>

                  {/* HRA Exemption */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-700 dark:text-gray-300">HRA Exemption Amount</span>
                    </div>
                    <div className="relative flex items-center">
                      <input 
                        type="number"
                        min={0}
                        value={hraExemption}
                        onChange={(e) => setHraExemption(Math.max(0, Number(e.target.value) || 0))}
                        className="w-full bg-slate-100 dark:bg-black/40 border border-slate-300 dark:border-white/10 rounded-xl py-2 px-3 text-slate-900 dark:text-white font-mono text-sm focus:outline-none focus:border-emerald-500/50"
                      />
                      <span className="absolute right-3 text-xs font-extrabold text-slate-500 dark:text-emerald-400">₹</span>
                    </div>
                  </div>

                </div>

              </div>
            </div>

            {/* Side-by-Side Results & Breakdown Panel */}
            <div className="w-full lg:w-7/12 flex flex-col gap-6">
              
              {/* Regime Mode View Tabs */}
              <div className="glass rounded-2xl border border-slate-200/80 dark:border-white/5 p-2 bg-white dark:bg-white/[0.01] shadow-md">
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setActiveTab('compare')}
                    className={`py-2.5 text-xs font-extrabold uppercase tracking-wider rounded-xl transition-all ${
                      activeTab === 'compare' 
                        ? 'bg-emerald-500 text-white shadow-md' 
                        : 'text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-white/5'
                    }`}
                  >
                    Compare Both
                  </button>
                  <button
                    onClick={() => setActiveTab('new')}
                    className={`py-2.5 text-xs font-extrabold uppercase tracking-wider rounded-xl transition-all ${
                      activeTab === 'new' 
                        ? 'bg-emerald-500 text-white shadow-md' 
                        : 'text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-white/5'
                    }`}
                  >
                    New Regime
                  </button>
                  <button
                    onClick={() => setActiveTab('old')}
                    className={`py-2.5 text-xs font-extrabold uppercase tracking-wider rounded-xl transition-all ${
                      activeTab === 'old' 
                        ? 'bg-emerald-500 text-white shadow-md' 
                        : 'text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-white/5'
                    }`}
                  >
                    Old Regime
                  </button>
                </div>
              </div>

              {/* Side-by-Side Comparison Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* New Regime Card */}
                <div className={`glass rounded-[2.5rem] border p-6 sm:p-8 shadow-2xl relative overflow-hidden transition-all ${
                  calculations.betterRegime === 'new' 
                    ? 'border-emerald-500/50 bg-emerald-500/5 dark:bg-emerald-500/10 ring-2 ring-emerald-500/20' 
                    : 'border-slate-200/80 dark:border-white/5 bg-white dark:bg-white/[0.01]'
                }`}>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">New Tax Regime</span>
                    {calculations.betterRegime === 'new' && (
                      <span className="px-3 py-1 rounded-full bg-emerald-500 text-white text-[10px] font-black uppercase tracking-wider shadow-sm">
                        Recommended
                      </span>
                    )}
                  </div>

                  <div className="mb-6">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-gray-400 block mb-1">Total Tax Payable</span>
                    <p className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white font-mono">
                      {formatCurrency(calculations.newRegime.totalTaxPayable)}
                    </p>
                    <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
                      Monthly TDS: {formatCurrency(calculations.newRegime.monthlyTDS)} / mo
                    </p>
                  </div>

                  <div className="space-y-2 pt-4 border-t border-slate-200 dark:border-white/10 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-gray-400">Standard Deduction:</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">{formatCurrency(calculations.newRegime.standardDeduction)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-gray-400">Taxable Income:</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">{formatCurrency(calculations.newRegime.taxableIncome)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-gray-400">Take-Home Salary:</span>
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(calculations.newRegime.takeHomeIncome)}</span>
                    </div>
                  </div>
                </div>

                {/* Old Regime Card */}
                <div className={`glass rounded-[2.5rem] border p-6 sm:p-8 shadow-2xl relative overflow-hidden transition-all ${
                  calculations.betterRegime === 'old' 
                    ? 'border-emerald-500/50 bg-emerald-500/5 dark:bg-emerald-500/10 ring-2 ring-emerald-500/20' 
                    : 'border-slate-200/80 dark:border-white/5 bg-white dark:bg-white/[0.01]'
                }`}>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">Old Tax Regime</span>
                    {calculations.betterRegime === 'old' && (
                      <span className="px-3 py-1 rounded-full bg-emerald-500 text-white text-[10px] font-black uppercase tracking-wider shadow-sm">
                        Recommended
                      </span>
                    )}
                  </div>

                  <div className="mb-6">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-gray-400 block mb-1">Total Tax Payable</span>
                    <p className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white font-mono">
                      {formatCurrency(calculations.oldRegime.totalTaxPayable)}
                    </p>
                    <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mt-1">
                      Monthly TDS: {formatCurrency(calculations.oldRegime.monthlyTDS)} / mo
                    </p>
                  </div>

                  <div className="space-y-2 pt-4 border-t border-slate-200 dark:border-white/10 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-gray-400">Total Deductions:</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">{formatCurrency(calculations.oldRegime.totalDeductions)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-gray-400">Taxable Income:</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">{formatCurrency(calculations.oldRegime.taxableIncome)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-gray-400">Take-Home Salary:</span>
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(calculations.oldRegime.takeHomeIncome)}</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Pie Chart & Slab-wise Breakdown */}
              <div className="glass rounded-[2.5rem] border border-slate-200/80 dark:border-white/5 p-6 sm:p-8 bg-white dark:bg-white/[0.01] shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">
                    Slab-wise Breakdown & Salary Split ({activeTab === 'old' ? 'Old Regime' : 'New Regime'})
                  </span>
                  <button 
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-xs font-bold text-slate-700 dark:text-gray-300 transition-colors border border-slate-200 dark:border-white/10 shadow-sm"
                  >
                    {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied!' : 'Share Summary'}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  
                  {/* Slab Breakdown Table */}
                  <div className="space-y-3">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-500 block mb-2">Tax Calculation By Slabs</span>
                    
                    {activeResult.slabBreakdown.map((s, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200/60 dark:border-white/5">
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white block">{s.label}</span>
                          <span className="text-[10px] font-semibold text-slate-500 dark:text-gray-400 font-mono">{s.rate}% Tax Rate</span>
                        </div>
                        <span className="font-mono font-bold text-slate-900 dark:text-white">
                          {formatCurrency(s.taxInSlab)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Salary vs Tax Recharts Donut Pie */}
                  <div className="h-[220px] w-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          innerRadius={65}
                          outerRadius={85}
                          paddingAngle={5}
                          dataKey="value"
                          stroke="none"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomPieTooltip />} wrapperStyle={{ zIndex: 1000, outline: 'none' }} />
                      </PieChart>
                    </ResponsiveContainer>

                    {/* Center Text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-400">Take-Home</span>
                      <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 font-mono">
                        {grossIncome > 0 ? Math.round((activeResult.takeHomeIncome / grossIncome) * 100) : 0}%
                      </span>
                    </div>
                  </div>

                </div>
              </div>

              {/* Tax Disclaimer Box */}
              <div className="glass rounded-2xl border border-amber-300/60 dark:border-amber-500/20 p-4 bg-amber-50/60 dark:bg-amber-500/10 text-amber-900 dark:text-amber-300 flex items-start gap-3 text-xs font-medium shadow-sm">
                <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <p>
                  <strong>Tax Disclaimer:</strong> This calculator is for estimation and educational purposes only based on official Income Tax Department slab rates. Please consult a qualified Chartered Accountant (CA) or tax professional for actual filing.
                </p>
              </div>

            </div>

          </div>

          {/* Educational Content & FAQs */}
          <section id="learn-more-section" className="py-16 border-t border-slate-200 dark:border-white/5 mt-16 pt-16">
            
            {/* Header */}
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-emerald-600 dark:text-emerald-400 text-xs font-black tracking-widest mb-4">
                <BookOpen className="w-4 h-4" />
                <span>Tax Planning Guide</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight uppercase mb-4">
                📚 New vs Old Tax Regime Guide
              </h2>
              <p className="text-slate-600 dark:text-gray-400 text-base sm:text-lg font-medium leading-relaxed">
                Understand tax slabs, section 87A rebates, standard deductions, and tax-saving strategies.
              </p>
            </div>

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
              <div className="glass rounded-[2rem] border border-slate-200/80 dark:border-white/5 p-8 bg-white dark:bg-white/[0.01] shadow-md">
                <h3 className="text-lg font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-3">
                  🌟 New Tax Regime
                </h3>
                <p className="text-xs text-slate-600 dark:text-gray-300 font-medium leading-relaxed">
                  Offers lower slab rates and a ₹75,000 Standard Deduction. Tax is completely ZERO for income up to ₹7 Lakhs under Section 87A rebate.
                </p>
              </div>

              <div className="glass rounded-[2rem] border border-slate-200/80 dark:border-white/5 p-8 bg-white dark:bg-white/[0.01] shadow-md">
                <h3 className="text-lg font-black text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-3">
                  📑 Old Tax Regime
                </h3>
                <p className="text-xs text-slate-600 dark:text-gray-300 font-medium leading-relaxed">
                  Allows claiming deductions under Section 80C (PPF/ELSS), 80D (Health Insurance), HRA, and Section 24b Home Loan Interest.
                </p>
              </div>

              <div className="glass rounded-[2rem] border border-slate-200/80 dark:border-white/5 p-8 bg-white dark:bg-white/[0.01] shadow-md">
                <h3 className="text-lg font-black text-purple-600 dark:text-purple-400 uppercase tracking-wider mb-3">
                  ⚖️ Section 87A Rebate
                </h3>
                <p className="text-xs text-slate-600 dark:text-gray-300 font-medium leading-relaxed">
                  Provides a 100% tax rebate for taxable income up to ₹7,00,000 under the New Regime (rebate up to ₹25,000) and ₹5,00,000 under the Old Regime.
                </p>
              </div>
            </div>

            {/* Article */}
            {article && <ToolArticle {...article} />}

          </section>

        </div>
      </div>
    </ToolVisibilityGuard>
  );
}
