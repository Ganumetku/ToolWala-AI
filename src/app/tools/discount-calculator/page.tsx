"use client";

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  ChevronLeft, Calculator, RefreshCw, ShieldCheck, Zap, 
  Percent, Copy, Check, TrendingDown, Tag, 
  ArrowRight, Scale, ShoppingBag, Award, Sparkles, Plus, AlertCircle
} from 'lucide-react';
import { MeshGradient, FloatingParticles } from '@/components/BackgroundEffects';
import ToolVisibilityGuard from '@/components/ToolVisibilityGuard';
import { toolsData } from '@/data/tools';
import { toolArticles } from '@/data/toolArticles';
import ToolArticle from '@/components/ToolArticle';
import PdfToolIcon from '@/components/PdfToolIcon';

const SEO_TITLE = "Free Online Discount Calculator – Calculate Sale Price & Savings";
const SEO_DESC = "Calculate final sale price, discount amount, double successive discounts, and GST tax instantly. 100% free and private client-side discount calculator.";

const formatCurrency = (value: number) => {
  if (isNaN(value) || !isFinite(value)) return "₹0";
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(value);
};

const formatCompactCurrency = (value: number) => {
  if (isNaN(value) || !isFinite(value)) return "₹0";
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    notation: "compact",
    compactDisplay: "short"
  }).format(value);
};

function numberToWordsINR(amount: number): string {
  if (!amount || isNaN(amount) || amount <= 0) return "";
  if (amount > 100000000000) return "Amount Exceeds Supported Limit";

  const units = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", 
    "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"
  ];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  const convertTwoDigits = (n: number): string => {
    if (n < 20) return units[n];
    const unitDigit = n % 10;
    return `${tens[Math.floor(n / 10)]}${unitDigit ? " " + units[unitDigit] : ""}`;
  };

  const convertThreeDigits = (n: number): string => {
    const hundred = Math.floor(n / 100);
    const remainder = n % 100;
    let str = "";
    if (hundred > 0 && hundred < units.length) {
      str += `${units[hundred]} Hundred`;
    }
    if (remainder > 0) {
      if (str) str += " ";
      str += convertTwoDigits(remainder);
    }
    return str;
  };

  const integerPart = Math.floor(amount);
  if (integerPart === 0) return "";

  let num = integerPart;
  const crore = Math.floor(num / 10000000);
  num %= 10000000;
  const lakh = Math.floor(num / 100000);
  num %= 100000;
  const thousand = Math.floor(num / 1000);
  num %= 1000;
  const remainder = num;

  const parts: string[] = [];
  if (crore > 0) {
    const croreWords = crore < 100 ? convertTwoDigits(crore) : convertThreeDigits(crore);
    parts.push(`${croreWords || crore} Crore`);
  }
  if (lakh > 0) parts.push(`${convertTwoDigits(lakh)} Lakh`);
  if (thousand > 0) parts.push(`${convertTwoDigits(thousand)} Thousand`);
  if (remainder > 0) parts.push(convertThreeDigits(remainder));

  return parts.join(" ") + " Rupees";
}

type CalcMode = 'final-price' | 'discount-percent' | 'compare-deals';

export default function DiscountCalculatorPage() {
  const [mode, setMode] = useState<CalcMode>('final-price');

  // Mode 1: Find Final Price inputs
  const [originalPrice, setOriginalPrice] = useState<number | ''>(2500);
  const [discountPercent, setDiscountPercent] = useState<number>(30);
  
  // Extra feature toggles
  const [hasSecondDiscount, setHasSecondDiscount] = useState<boolean>(false);
  const [secondDiscountPercent, setSecondDiscountPercent] = useState<number>(10);
  
  const [hasTax, setHasTax] = useState<boolean>(false);
  const [taxPercent, setTaxPercent] = useState<number>(18);

  // Mode 2: Find Discount Percentage inputs (Reverse Mode)
  const [revOriginalPrice, setRevOriginalPrice] = useState<number | ''>(2000);
  const [revSalePrice, setRevSalePrice] = useState<number | ''>(1400);

  // Mode 3: Compare Two Deals inputs
  const [dealAPrice, setDealAPrice] = useState<number | ''>(2500);
  const [dealADiscount, setDealADiscount] = useState<number>(30);
  const [dealBPrice, setDealBPrice] = useState<number | ''>(2200);
  const [dealBDiscount, setDealBDiscount] = useState<number>(15);

  const [copied, setCopied] = useState<boolean>(false);

  // Quick Preset Buttons
  const PRESET_DISCOUNTS = [10, 20, 25, 30, 40, 50, 60, 70, 80];
  const TAX_PRESETS = [5, 12, 18, 28];

  // Calculations for Mode 1 (Find Final Price)
  const mode1Results = useMemo(() => {
    const rawPrice = Number(originalPrice) || 0;
    const d1 = Math.min(100, Math.max(0, Number(discountPercent) || 0));
    const d2 = hasSecondDiscount ? Math.min(100, Math.max(0, Number(secondDiscountPercent) || 0)) : 0;
    const taxRate = hasTax ? Math.max(0, Number(taxPercent) || 0) : 0;

    const firstSavings = rawPrice * (d1 / 100);
    const priceAfterFirst = Math.max(0, rawPrice - firstSavings);

    const secondSavings = hasSecondDiscount ? priceAfterFirst * (d2 / 100) : 0;
    const priceAfterDiscounts = Math.max(0, priceAfterFirst - secondSavings);

    const totalSavings = firstSavings + secondSavings;
    const effectiveDiscountPercent = rawPrice > 0 ? (totalSavings / rawPrice) * 100 : 0;

    const taxAmount = hasTax ? priceAfterDiscounts * (taxRate / 100) : 0;
    const finalPayablePrice = priceAfterDiscounts + taxAmount;

    return {
      originalPrice: rawPrice,
      firstDiscountAmount: firstSavings,
      secondDiscountAmount: secondSavings,
      totalSavings,
      effectiveDiscountPercent,
      priceAfterDiscounts,
      taxAmount,
      finalPayablePrice
    };
  }, [originalPrice, discountPercent, hasSecondDiscount, secondDiscountPercent, hasTax, taxPercent]);

  // Calculations for Mode 2 (Find Discount Percentage - Reverse)
  const mode2Results = useMemo(() => {
    const orig = Number(revOriginalPrice) || 0;
    const sale = Number(revSalePrice) || 0;

    const isValid = orig > 0 && sale >= 0 && sale <= orig;
    const totalSavings = isValid ? orig - sale : 0;
    const discountPct = isValid && orig > 0 ? (totalSavings / orig) * 100 : 0;
    const isHigher = orig > 0 && sale > orig;

    return {
      originalPrice: orig,
      salePrice: sale,
      totalSavings,
      discountPercent: discountPct,
      isValid,
      isHigher
    };
  }, [revOriginalPrice, revSalePrice]);

  // Calculations for Mode 3 (Compare Two Deals)
  const mode3Results = useMemo(() => {
    const pA = Number(dealAPrice) || 0;
    const dA = Math.min(100, Math.max(0, Number(dealADiscount) || 0));
    const savingsA = pA * (dA / 100);
    const finalA = pA - savingsA;

    const pB = Number(dealBPrice) || 0;
    const dB = Math.min(100, Math.max(0, Number(dealBDiscount) || 0));
    const savingsB = pB * (dB / 100);
    const finalB = pB - savingsB;

    let winner: 'A' | 'B' | 'EQUAL' = 'EQUAL';
    let diff = 0;
    let diffPercent = 0;

    if (finalA < finalB) {
      winner = 'A';
      diff = finalB - finalA;
      diffPercent = finalB > 0 ? (diff / finalB) * 100 : 0;
    } else if (finalB < finalA) {
      winner = 'B';
      diff = finalA - finalB;
      diffPercent = finalA > 0 ? (diff / finalA) * 100 : 0;
    }

    return {
      finalA,
      savingsA,
      finalB,
      savingsB,
      winner,
      diff,
      diffPercent
    };
  }, [dealAPrice, dealADiscount, dealBPrice, dealBDiscount]);

  // Handle Copy Result
  const handleCopy = async () => {
    try {
      let text = "";
      if (mode === 'final-price') {
        text = `ToolWala AI Discount Calculation:\n• Original Price: ${formatCurrency(mode1Results.originalPrice)}\n• Discount: ${discountPercent}%${hasSecondDiscount ? ` + Extra ${secondDiscountPercent}%` : ''} (Effective ${mode1Results.effectiveDiscountPercent.toFixed(1)}% Off)\n• Total Savings: ${formatCurrency(mode1Results.totalSavings)}\n${hasTax ? `• GST/Tax (${taxPercent}%): +${formatCurrency(mode1Results.taxAmount)}\n` : ''}• Final Price: ${formatCurrency(mode1Results.finalPayablePrice)}\n\nCalculated at toolwala.co/tools/discount-calculator/`;
      } else if (mode === 'discount-percent') {
        text = `ToolWala AI Reverse Discount Calculation:\n• Original Price: ${formatCurrency(mode2Results.originalPrice)}\n• Sale Price: ${formatCurrency(mode2Results.salePrice)}\n• Discount Percentage: ${mode2Results.discountPercent.toFixed(2)}% Off\n• Total You Save: ${formatCurrency(mode2Results.totalSavings)}\n\nCalculated at toolwala.co/tools/discount-calculator/`;
      } else {
        text = `ToolWala AI Deal Comparison:\n• Deal A: ${formatCurrency(Number(dealAPrice) || 0)} at ${dealADiscount}% Off = ${formatCurrency(mode3Results.finalA)}\n• Deal B: ${formatCurrency(Number(dealBPrice) || 0)} at ${dealBDiscount}% Off = ${formatCurrency(mode3Results.finalB)}\n• Result: ${mode3Results.winner === 'EQUAL' ? 'Both deals have the same price.' : `Deal ${mode3Results.winner} is cheaper by ${formatCurrency(mode3Results.diff)} (${mode3Results.diffPercent.toFixed(1)}%)`}\n\nCalculated at toolwala.co/tools/discount-calculator/`;
      }
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error("Failed to copy:", e);
    }
  };

  // Handle Reset
  const handleReset = () => {
    if (mode === 'final-price') {
      setOriginalPrice(2000);
      setDiscountPercent(20);
      setHasSecondDiscount(false);
      setSecondDiscountPercent(10);
      setHasTax(false);
      setTaxPercent(18);
    } else if (mode === 'discount-percent') {
      setRevOriginalPrice(2000);
      setRevSalePrice(1400);
    } else {
      setDealAPrice(2500);
      setDealADiscount(30);
      setDealBPrice(2200);
      setDealBDiscount(15);
    }
  };

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    'name': 'Discount Calculator',
    'description': SEO_DESC,
    'applicationCategory': 'FinanceApplication',
    'operatingSystem': 'All',
    'offers': {
      '@type': 'Offer',
      'price': '0',
      'priceCurrency': 'INR'
    }
  };

  const relatedTools = toolsData
    .filter(t => ['gst-calculator', 'emi-calculator', 'sip-calculator', 'income-tax-calculator'].includes(t.slug))
    .map(t => ({ name: t.title, href: t.href }));

  return (
    <ToolVisibilityGuard slug="discount-calculator">
      <div className="bg-[#F6F8FC] dark:bg-[#030712] min-h-screen py-20 relative overflow-hidden font-sans transition-colors duration-250">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        
        <MeshGradient />
        <FloatingParticles />
        
        {/* Background Radial Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-blue-500/5 rounded-full blur-[140px] pointer-events-none z-0" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl relative z-10">
          
          {/* Breadcrumb Navigation */}
          <Link 
            href="/tools" 
            className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors mb-8 group"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Directory
          </Link>

          {/* Header & Hero Title */}
          <div className="text-center max-w-3xl mx-auto mb-12">
            <PdfToolIcon toolId="discount-calculator" size="xl" className="mx-auto mb-4" />
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-widest border border-blue-200 dark:border-blue-500/20 mb-4 shadow-sm">
              <Percent className="w-3.5 h-3.5" />
              100% Private & Browser-Based
            </div>
            
            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight uppercase mb-3">
              Discount Calculator
            </h1>
            
            <p className="text-sm sm:text-base text-slate-600 dark:text-gray-400 font-medium max-w-2xl mx-auto leading-relaxed">
              Calculate sale price, instant savings, double successive discounts, and reverse discount percentages in real-time.
            </p>

            <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-[10px] sm:text-xs font-black text-slate-500 dark:text-gray-400 uppercase tracking-widest mt-6">
              <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-500" /> No Data Leaves Browser</span>
              <span className="flex items-center gap-1.5"><Zap className="w-4 h-4 text-amber-500" /> Real-Time Math</span>
              <span className="flex items-center gap-1.5"><Tag className="w-4 h-4 text-blue-500" /> Double Discounts</span>
            </div>
          </div>

          {/* Mode Selector Tabs */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex p-1.5 rounded-2xl bg-white dark:bg-white/5 border border-slate-200/90 dark:border-white/10 shadow-sm gap-1 max-w-full overflow-x-auto">
              <button
                type="button"
                onClick={() => setMode('final-price')}
                className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                  mode === 'final-price'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                    : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5'
                }`}
              >
                <Tag className="w-3.5 h-3.5" />
                Find Final Price
              </button>

              <button
                type="button"
                onClick={() => setMode('discount-percent')}
                className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                  mode === 'discount-percent'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                    : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5'
                }`}
              >
                <Percent className="w-3.5 h-3.5" />
                Find Discount %
              </button>

              <button
                type="button"
                onClick={() => setMode('compare-deals')}
                className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                  mode === 'compare-deals'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                    : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5'
                }`}
              >
                <Scale className="w-3.5 h-3.5" />
                Compare Two Deals
              </button>
            </div>
          </div>

          {/* MAIN CALCULATOR CONTAINER */}
          <div className="flex flex-col lg:flex-row gap-8 mb-16 items-start">
            
            {/* =========================================================================
                LEFT PANEL: INPUT FORMS
               ========================================================================= */}
            <div className="w-full lg:w-5/12 space-y-6 shrink-0">
              <div className="glass rounded-[2rem] border border-slate-200/80 dark:border-white/10 shadow-xl p-6 sm:p-8 bg-white dark:bg-[#0f172a]/95">
                
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-4 mb-6">
                  <div className="flex items-center gap-2">
                    <Calculator className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">
                      {mode === 'final-price' ? 'Price & Discount' : mode === 'discount-percent' ? 'Original & Sale Price' : 'Deal Comparison Inputs'}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="flex items-center gap-1 text-[11px] font-bold text-slate-400 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 transition-colors cursor-pointer"
                    title="Reset all fields"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Reset
                  </button>
                </div>

                {/* ----------------- MODE 1: FIND FINAL PRICE ----------------- */}
                {mode === 'final-price' && (
                  <div className="space-y-6">
                    {/* Original Price */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-gray-300">
                          Original Price (₹)
                        </label>
                        <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-2 py-0.5 rounded-md">
                          MRP / Tag Price
                        </span>
                      </div>
                      
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-base">₹</span>
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={originalPrice}
                          onChange={(e) => {
                            const val = e.target.value === '' ? '' : Math.max(0, Number(e.target.value));
                            setOriginalPrice(val);
                          }}
                          placeholder="e.g. 2500"
                          className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-2xl pl-9 pr-4 py-3.5 text-base sm:text-lg font-black text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none transition-all"
                        />
                      </div>
                      {Number(originalPrice) > 0 && (
                        <p className="text-[11px] font-medium text-slate-400 dark:text-gray-500 mt-1.5 pl-1 italic truncate">
                          {numberToWordsINR(Number(originalPrice))}
                        </p>
                      )}
                    </div>

                    {/* Primary Discount Percentage */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-gray-300">
                          Discount Percentage (%)
                        </label>
                        <span className="text-xs font-black text-blue-600 dark:text-blue-400">
                          {discountPercent}% OFF
                        </span>
                      </div>

                      <div className="relative mb-3">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={discountPercent}
                          onChange={(e) => {
                            const val = Math.min(100, Math.max(0, Number(e.target.value) || 0));
                            setDiscountPercent(val);
                          }}
                          className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-3 text-base font-black text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none transition-all pr-9"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
                      </div>

                      {/* Interactive Slider */}
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="1"
                        value={discountPercent}
                        onChange={(e) => setDiscountPercent(Number(e.target.value))}
                        className="w-full accent-blue-600 cursor-pointer h-2 bg-slate-200 dark:bg-white/10 rounded-lg"
                      />

                      {/* Quick Presets */}
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {PRESET_DISCOUNTS.map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => setDiscountPercent(preset)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-black transition-all cursor-pointer ${
                              discountPercent === preset
                                ? 'bg-blue-600 text-white shadow-sm'
                                : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-gray-400 hover:bg-slate-200 dark:hover:bg-white/10'
                            }`}
                          >
                            {preset}%
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Extra Feature: Successive / Double Discount Toggle */}
                    <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/5 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                            <Plus className="w-3.5 h-3.5 text-blue-500" />
                            Multiple / Successive Discount
                          </h4>
                          <p className="text-[10px] text-slate-500 dark:text-gray-400 font-medium mt-0.5">
                            Apply extra discount (e.g. 30% + extra 10% coupon)
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          id="second-discount-toggle"
                          checked={hasSecondDiscount}
                          onChange={(e) => setHasSecondDiscount(e.target.checked)}
                          className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600"
                        />
                      </div>

                      {hasSecondDiscount && (
                        <div className="pt-2 border-t border-slate-200/60 dark:border-white/5 animate-fade-in">
                          <div className="flex items-center justify-between mb-1.5">
                            <label className="text-[11px] font-bold text-slate-700 dark:text-gray-300">
                              Additional Discount (%)
                            </label>
                            <span className="text-[11px] font-black text-purple-600 dark:text-purple-400">
                              +{secondDiscountPercent}%
                            </span>
                          </div>
                          <div className="relative">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={secondDiscountPercent}
                              onChange={(e) => setSecondDiscountPercent(Math.min(100, Math.max(0, Number(e.target.value) || 0)))}
                              className="w-full bg-white dark:bg-black/30 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm font-bold text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none pr-8"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">%</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Extra Feature: Add GST / Tax Toggle */}
                    <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/5 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                            Add GST / Sales Tax
                          </h4>
                          <p className="text-[10px] text-slate-500 dark:text-gray-400 font-medium mt-0.5">
                            Calculate tax on top of discounted price
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          id="tax-toggle"
                          checked={hasTax}
                          onChange={(e) => setHasTax(e.target.checked)}
                          className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600"
                        />
                      </div>

                      {hasTax && (
                        <div className="pt-2 border-t border-slate-200/60 dark:border-white/5 animate-fade-in space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="text-[11px] font-bold text-slate-700 dark:text-gray-300">
                              GST / Tax Rate (%)
                            </label>
                            <span className="text-[11px] font-black text-amber-600 dark:text-amber-400">
                              {taxPercent}%
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={taxPercent}
                              onChange={(e) => setTaxPercent(Math.max(0, Number(e.target.value) || 0))}
                              className="w-24 bg-white dark:bg-black/30 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-1.5 text-sm font-bold text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none"
                            />
                            <div className="flex gap-1">
                              {TAX_PRESETS.map((tVal) => (
                                <button
                                  key={tVal}
                                  type="button"
                                  onClick={() => setTaxPercent(tVal)}
                                  className={`px-2 py-1 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                                    taxPercent === tVal
                                      ? 'bg-amber-500 text-white'
                                      : 'bg-slate-200/60 dark:bg-white/5 text-slate-700 dark:text-gray-400 hover:bg-slate-300 dark:hover:bg-white/10'
                                  }`}
                                >
                                  {tVal}%
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                  </div>
                )}

                {/* ----------------- MODE 2: FIND DISCOUNT PERCENTAGE (REVERSE) ----------------- */}
                {mode === 'discount-percent' && (
                  <div className="space-y-6">
                    {/* Original Price */}
                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-gray-300 mb-2">
                        Original / MRP Price (₹)
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-base">₹</span>
                        <input
                          type="number"
                          min="0"
                          value={revOriginalPrice}
                          onChange={(e) => setRevOriginalPrice(e.target.value === '' ? '' : Math.max(0, Number(e.target.value)))}
                          placeholder="e.g. 2000"
                          className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-2xl pl-9 pr-4 py-3.5 text-base sm:text-lg font-black text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none transition-all"
                        />
                      </div>
                    </div>

                    {/* Sale / Discounted Price */}
                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-gray-300 mb-2">
                        Discounted / Sale Price (₹)
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-base">₹</span>
                        <input
                          type="number"
                          min="0"
                          value={revSalePrice}
                          onChange={(e) => setRevSalePrice(e.target.value === '' ? '' : Math.max(0, Number(e.target.value)))}
                          placeholder="e.g. 1400"
                          className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-2xl pl-9 pr-4 py-3.5 text-base sm:text-lg font-black text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none transition-all"
                        />
                      </div>
                    </div>

                    {mode2Results.isHigher && (
                      <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs font-bold flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        Sale price cannot be higher than original price for a discount.
                      </div>
                    )}
                  </div>
                )}

                {/* ----------------- MODE 3: COMPARE TWO DEALS ----------------- */}
                {mode === 'compare-deals' && (
                  <div className="space-y-6">
                    {/* Deal A Card */}
                    <div className="p-4 rounded-2xl bg-blue-50/40 dark:bg-blue-500/5 border border-blue-200/80 dark:border-blue-500/15 space-y-3">
                      <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">
                        Deal Option A
                      </span>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] font-bold uppercase text-slate-600 dark:text-gray-400 mb-1 block">
                            Price (₹)
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={dealAPrice}
                            onChange={(e) => setDealAPrice(e.target.value === '' ? '' : Math.max(0, Number(e.target.value)))}
                            className="w-full bg-white dark:bg-black/30 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm font-black text-slate-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold uppercase text-slate-600 dark:text-gray-400 mb-1 block">
                            Discount (%)
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={dealADiscount}
                            onChange={(e) => setDealADiscount(Math.min(100, Math.max(0, Number(e.target.value) || 0)))}
                            className="w-full bg-white dark:bg-black/30 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm font-black text-slate-900 dark:text-white"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Deal B Card */}
                    <div className="p-4 rounded-2xl bg-purple-50/40 dark:bg-purple-500/5 border border-purple-200/80 dark:border-purple-500/15 space-y-3">
                      <span className="text-[10px] font-black uppercase tracking-widest text-purple-600 dark:text-purple-400">
                        Deal Option B
                      </span>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] font-bold uppercase text-slate-600 dark:text-gray-400 mb-1 block">
                            Price (₹)
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={dealBPrice}
                            onChange={(e) => setDealBPrice(e.target.value === '' ? '' : Math.max(0, Number(e.target.value)))}
                            className="w-full bg-white dark:bg-black/30 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm font-black text-slate-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold uppercase text-slate-600 dark:text-gray-400 mb-1 block">
                            Discount (%)
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={dealBDiscount}
                            onChange={(e) => setDealBDiscount(Math.min(100, Math.max(0, Number(e.target.value) || 0)))}
                            className="w-full bg-white dark:bg-black/30 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm font-black text-slate-900 dark:text-white"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* =========================================================================
                RIGHT PANEL: RESULTS BREAKDOWN & SAVINGS VISUALIZER
               ========================================================================= */}
            <div className="w-full lg:w-7/12 space-y-6">
              
              {/* Main Results Card */}
              <div className="glass rounded-[2rem] border border-slate-200/80 dark:border-white/10 shadow-xl p-6 sm:p-8 bg-white dark:bg-[#0f172a]/95 relative overflow-hidden">
                
                {/* Header with Copy Button */}
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-4 mb-6">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">
                      Calculation Breakdown
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-600/10 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 text-xs font-bold transition-all border border-blue-200 dark:border-blue-500/20 cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? "Copied!" : "Copy Result"}
                  </button>
                </div>

                {/* ----------------- MODE 1 RESULTS ----------------- */}
                {mode === 'final-price' && (
                  <div className="space-y-6">
                    
                    {/* Primary Highlight Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Final Price Card */}
                      <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20">
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-80 block mb-1">
                          {hasTax ? 'Final Price (Inc. Tax)' : 'Final Sale Price'}
                        </span>
                        <div className="text-3xl sm:text-4xl font-black tracking-tight mb-1">
                          {formatCurrency(mode1Results.finalPayablePrice)}
                        </div>
                        <p className="text-[11px] opacity-90 font-medium">
                          {numberToWordsINR(mode1Results.finalPayablePrice)}
                        </p>
                      </div>

                      {/* Total Savings Card */}
                      <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
                            Total You Save
                          </span>
                          <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full">
                            <Sparkles className="w-2.5 h-2.5" />
                            {mode1Results.effectiveDiscountPercent.toFixed(1)}% OFF
                          </span>
                        </div>
                        <div className="text-3xl sm:text-4xl font-black tracking-tight text-emerald-600 dark:text-emerald-400 mb-1">
                          {formatCurrency(mode1Results.totalSavings)}
                        </div>
                        <p className="text-[11px] font-medium text-emerald-700/80 dark:text-emerald-400/80">
                          {numberToWordsINR(mode1Results.totalSavings)}
                        </p>
                      </div>
                    </div>

                    {/* Savings Visual Progress Bar */}
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/5 space-y-2">
                      <div className="flex justify-between text-xs font-black text-slate-700 dark:text-gray-300">
                        <span>You Pay: {formatCurrency(mode1Results.finalPayablePrice)}</span>
                        <span className="text-emerald-600 dark:text-emerald-400">
                          Save: {formatCurrency(mode1Results.totalSavings)} ({mode1Results.effectiveDiscountPercent.toFixed(1)}%)
                        </span>
                      </div>

                      <div className="w-full h-3.5 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden flex">
                        <div 
                          className="h-full bg-blue-600 transition-all duration-300 rounded-l-full"
                          style={{ width: `${Math.min(100, Math.max(0, 100 - mode1Results.effectiveDiscountPercent))}%` }}
                          title={`You Pay: ${formatCurrency(mode1Results.finalPayablePrice)}`}
                        />
                        <div 
                          className="h-full bg-emerald-500 transition-all duration-300 rounded-r-full"
                          style={{ width: `${Math.min(100, Math.max(0, mode1Results.effectiveDiscountPercent))}%` }}
                          title={`You Save: ${formatCurrency(mode1Results.totalSavings)}`}
                        />
                      </div>
                    </div>

                    {/* Step-by-Step Flow List */}
                    <div className="space-y-2.5 pt-2">
                      <div className="flex justify-between items-center text-xs font-bold p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02]">
                        <span className="text-slate-600 dark:text-gray-400">Original List Price</span>
                        <span className="text-slate-900 dark:text-white font-black">{formatCurrency(mode1Results.originalPrice)}</span>
                      </div>

                      <div className="flex justify-between items-center text-xs font-bold p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-500/5 text-emerald-700 dark:text-emerald-400">
                        <span className="flex items-center gap-1.5">
                          <TrendingDown className="w-3.5 h-3.5" />
                          Primary Discount ({discountPercent}%)
                        </span>
                        <span className="font-black">- {formatCurrency(mode1Results.firstDiscountAmount)}</span>
                      </div>

                      {hasSecondDiscount && (
                        <div className="flex justify-between items-center text-xs font-bold p-3 rounded-xl bg-purple-50/50 dark:bg-purple-500/5 text-purple-700 dark:text-purple-400">
                          <span className="flex items-center gap-1.5">
                            <TrendingDown className="w-3.5 h-3.5" />
                            Additional Discount (+{secondDiscountPercent}%)
                          </span>
                          <span className="font-black">- {formatCurrency(mode1Results.secondDiscountAmount)}</span>
                        </div>
                      )}

                      {hasTax && (
                        <div className="flex justify-between items-center text-xs font-bold p-3 rounded-xl bg-amber-50/50 dark:bg-amber-500/5 text-amber-700 dark:text-amber-400">
                          <span>GST / Sales Tax (+{taxPercent}%)</span>
                          <span className="font-black">+ {formatCurrency(mode1Results.taxAmount)}</span>
                        </div>
                      )}

                      <div className="flex justify-between items-center text-sm font-black p-4 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white">
                        <span>Net Payable Amount</span>
                        <span className="text-blue-600 dark:text-blue-400 text-base">{formatCurrency(mode1Results.finalPayablePrice)}</span>
                      </div>
                    </div>

                  </div>
                )}

                {/* ----------------- MODE 2 RESULTS ----------------- */}
                {mode === 'discount-percent' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Discount Percentage Output */}
                      <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/20">
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-80 block mb-1">
                          Calculated Discount Rate
                        </span>
                        <div className="text-4xl font-black tracking-tight mb-1">
                          {mode2Results.discountPercent.toFixed(2)}%
                        </div>
                        <p className="text-[11px] opacity-90 font-medium">
                          Off Original MRP
                        </p>
                      </div>

                      {/* Total Amount Saved */}
                      <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20">
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700 dark:text-emerald-400 block mb-1">
                          Total Amount Saved
                        </span>
                        <div className="text-4xl font-black tracking-tight text-emerald-600 dark:text-emerald-400 mb-1">
                          {formatCurrency(mode2Results.totalSavings)}
                        </div>
                        <p className="text-[11px] font-medium text-emerald-700/80 dark:text-emerald-400/80">
                          {numberToWordsINR(mode2Results.totalSavings)}
                        </p>
                      </div>
                    </div>

                    {/* Summary Card */}
                    <div className="p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/5 space-y-3">
                      <div className="flex justify-between items-center text-xs font-bold">
                        <span className="text-slate-600 dark:text-gray-400">Original Price:</span>
                        <span className="text-slate-900 dark:text-white font-black">{formatCurrency(mode2Results.originalPrice)}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs font-bold">
                        <span className="text-slate-600 dark:text-gray-400">Discounted Price:</span>
                        <span className="text-slate-900 dark:text-white font-black">{formatCurrency(mode2Results.salePrice)}</span>
                      </div>
                      <div className="pt-2 border-t border-slate-200/60 dark:border-white/5 flex justify-between items-center text-xs font-black text-emerald-600 dark:text-emerald-400">
                        <span>You Saved:</span>
                        <span>{formatCurrency(mode2Results.totalSavings)} ({mode2Results.discountPercent.toFixed(2)}%)</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* ----------------- MODE 3 RESULTS (COMPARE DEALS) ----------------- */}
                {mode === 'compare-deals' && (
                  <div className="space-y-6">
                    {/* Deal Recommendation Banner */}
                    <div className={`p-5 rounded-2xl border flex items-center gap-3.5 ${
                      mode3Results.winner === 'A'
                        ? 'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/30 text-blue-900 dark:text-blue-200'
                        : mode3Results.winner === 'B'
                        ? 'bg-purple-50 dark:bg-purple-500/10 border-purple-200 dark:border-purple-500/30 text-purple-900 dark:text-purple-200'
                        : 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30 text-emerald-900 dark:text-emerald-200'
                    }`}>
                      <Award className="w-7 h-7 shrink-0 text-blue-600 dark:text-blue-400" />
                      <div>
                        <h4 className="text-sm font-black uppercase tracking-wider">
                          {mode3Results.winner === 'EQUAL' 
                            ? 'Both Deals Offer Exactly The Same Price!' 
                            : `🏆 Deal Option ${mode3Results.winner} is Cheaper!`}
                        </h4>
                        <p className="text-xs font-medium opacity-90 mt-0.5">
                          {mode3Results.winner === 'EQUAL' 
                            ? 'Both deals have an identical final cost.' 
                            : `You save an extra ${formatCurrency(mode3Results.diff)} (${mode3Results.diffPercent.toFixed(1)}%) by choosing Deal ${mode3Results.winner}.`}
                        </p>
                      </div>
                    </div>

                    {/* Side-by-Side Comparison Columns */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Deal A Summary */}
                      <div className={`p-5 rounded-2xl border ${
                        mode3Results.winner === 'A'
                          ? 'bg-blue-50/50 dark:bg-blue-500/10 border-blue-500 shadow-md'
                          : 'bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/5'
                      }`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-black uppercase text-blue-600 dark:text-blue-400">
                            Deal A
                          </span>
                          {mode3Results.winner === 'A' && (
                            <span className="text-[9px] font-black uppercase bg-blue-600 text-white px-2 py-0.5 rounded-full">
                              Best Choice
                            </span>
                          )}
                        </div>
                        <div className="text-2xl font-black text-slate-900 dark:text-white mb-2">
                          {formatCurrency(mode3Results.finalA)}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-gray-400 font-semibold space-y-1">
                          <p>MRP: {formatCurrency(Number(dealAPrice) || 0)}</p>
                          <p className="text-emerald-600 dark:text-emerald-400">Savings: {formatCurrency(mode3Results.savingsA)} ({dealADiscount}%)</p>
                        </div>
                      </div>

                      {/* Deal B Summary */}
                      <div className={`p-5 rounded-2xl border ${
                        mode3Results.winner === 'B'
                          ? 'bg-purple-50/50 dark:bg-purple-500/10 border-purple-500 shadow-md'
                          : 'bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/5'
                      }`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-black uppercase text-purple-600 dark:text-purple-400">
                            Deal B
                          </span>
                          {mode3Results.winner === 'B' && (
                            <span className="text-[9px] font-black uppercase bg-purple-600 text-white px-2 py-0.5 rounded-full">
                              Best Choice
                            </span>
                          )}
                        </div>
                        <div className="text-2xl font-black text-slate-900 dark:text-white mb-2">
                          {formatCurrency(mode3Results.finalB)}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-gray-400 font-semibold space-y-1">
                          <p>MRP: {formatCurrency(Number(dealBPrice) || 0)}</p>
                          <p className="text-emerald-600 dark:text-emerald-400">Savings: {formatCurrency(mode3Results.savingsB)} ({dealBDiscount}%)</p>
                        </div>
                      </div>
                    </div>

                  </div>
                )}

              </div>
            </div>

          </div>

          {/* SEO Article & FAQs Section */}
          <div className="mt-20">
            <ToolArticle 
              {...toolArticles['discount-calculator']}
              toolId="discount-calculator"
              relatedTools={relatedTools} 
            />
          </div>

        </div>
      </div>
    </ToolVisibilityGuard>
  );
}
