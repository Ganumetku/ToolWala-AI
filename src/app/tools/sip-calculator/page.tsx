"use client";

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  ChevronLeft, Calculator, TrendingUp, RefreshCw, ChevronDown, Activity, Wallet, Target, Info, ArrowRight, ShieldCheck, Clock, Zap, BookOpen, CheckCircle2, ArrowUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MeshGradient, FloatingParticles } from '@/components/BackgroundEffects';
import ToolVisibilityGuard from '@/components/ToolVisibilityGuard';
import { toolArticles } from '@/data/toolArticles';
import ToolArticle from '@/components/ToolArticle';

const SEO_DESC = "Calculate your SIP returns, total investment, estimated gains, and future wealth instantly with our free SIP Calculator.";

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(value);
};

const formatCompactCurrency = (value: number) => {
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

  const units = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", 
                 "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
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
  const decimalPart = Math.round((amount - integerPart) * 100);

  if (integerPart === 0 && decimalPart === 0) return "";

  let words = "";

  if (integerPart > 0) {
    let num = integerPart;

    const crore = Math.floor(num / 10000000);
    num %= 10000000;

    const lakh = Math.floor(num / 100000);
    num %= 100000;

    const thousand = Math.floor(num / 1000);
    num %= 1000;

    const remainder = num;

    let parts: string[] = [];

    if (crore > 0) {
      const croreWords = crore < 100 ? convertTwoDigits(crore) : convertThreeDigits(crore);
      parts.push(`${croreWords || crore} Crore`);
    }
    if (lakh > 0) {
      parts.push(`${convertTwoDigits(lakh)} Lakh`);
    }
    if (thousand > 0) {
      parts.push(`${convertTwoDigits(thousand)} Thousand`);
    }
    if (remainder > 0) {
      parts.push(convertThreeDigits(remainder));
    }

    words = parts.join(" ") + " Rupees";
  }

  if (decimalPart > 0) {
    const paiseWords = convertTwoDigits(decimalPart);
    if (words) {
      words += ` and ${paiseWords} Paise`;
    } else {
      words = `${paiseWords} Paise`;
    }
  }

  return words ? `${words} Only` : "";
}

function InputSlider({ label, min, max, step, value, onChange, icon: Icon, suffix = "", helperText, presets, placeholder = "", showInWords = false }: any) {
  const isOverLimit = typeof value === 'number' && value > max;
  const wordsText = showInWords && typeof value === 'number' && value > 0 ? numberToWordsINR(value) : '';

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div className="flex items-center gap-2">
          <Icon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <label className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">{label}</label>
        </div>
        <div className="relative flex items-center w-full sm:w-40">
          <input 
            type="number"
            min={min}
            max={max}
            value={value}
            placeholder={placeholder}
            onChange={(e) => {
              let valStr = e.target.value;
              const maxLen = max ? max.toString().length : 10;
              if (valStr.length > maxLen) {
                valStr = valStr.slice(0, maxLen);
              }
              let val = valStr === '' ? '' : Number(valStr);
              if (typeof val === 'number' && val > max) {
                val = max;
              }
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
          {suffix && <span className="absolute right-4 text-slate-500 dark:text-gray-500 text-sm font-bold pointer-events-none">{suffix}</span>}
        </div>
      </div>

      {isOverLimit && (
        <p className="text-xs text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1">
          ⚠️ Maximum limit is {suffix === '₹' ? formatCurrency(max) : `${max}${suffix}`}
        </p>
      )}

      {wordsText && (
        <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-sm">
          <span className="font-bold text-emerald-800 dark:text-emerald-400 shrink-0">🔤 In Words:</span>
          <span className="font-bold truncate">{wordsText}</span>
        </div>
      )}
      
      <p className="text-xs text-slate-600 dark:text-gray-400 font-medium">{helperText}</p>
      
      <div className="relative w-full h-2 bg-slate-200 dark:bg-white/5 rounded-full overflow-hidden mt-2">
        <motion.div 
          className="absolute top-0 left-0 h-full bg-emerald-500 pointer-events-none" 
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100))}%` }} 
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
        />
        <input 
          type="range"
          min={min}
          max={max}
          step={step}
          value={Math.min(value, max)}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>

      {presets && (
        <div className="flex flex-wrap gap-2 pt-3">
          {presets.map((preset: any) => (
            <button
              key={preset.value}
              onClick={() => onChange(preset.value)}
              className="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 dark:border-white/5 bg-slate-100 dark:bg-white/[0.02] hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-500/30 text-slate-700 dark:text-gray-400 transition-all"
            >
              {preset.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Custom Tooltip for Recharts
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass rounded-xl border border-white/10 p-4 bg-black/80 backdrop-blur-md">
        <p className="text-sm font-black text-slate-900 dark:text-white mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex justify-between gap-6 items-center text-xs font-semibold">
            <span style={{ color: entry.color }}>{entry.name}:</span>
            <span className="text-white font-mono">{formatCurrency(entry.value)}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function SipCalculatorPage() {
  const [mounted, setMounted] = useState(false);
  const [faqExpanded, setFaqExpanded] = useState<number | null>(null);

  // States
  const [monthlyInvestment, setMonthlyInvestment] = useState<number>(1600);
  const [annualRate, setAnnualRate] = useState<number>(12);
  const [years, setYears] = useState<number>(10);
  const [compareMode, setCompareMode] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleReset = () => {
    setMonthlyInvestment(1600);
    setAnnualRate(12);
    setYears(10);
  };

  const scrollToCalculator = () => {
    document.getElementById('calculator-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToLearnMore = () => {
    document.getElementById('learn-more-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const results = useMemo(() => {
    const expectedReturn = annualRate || 0;
    const timePeriod = years || 0;

    if (monthlyInvestment === 0 || timePeriod === 0) {
      return { totalInvestment: 0, estimatedReturns: 0, futureValue: 0, percentageReturn: 0 };
    }

    if (expectedReturn === 0) {
      const total = monthlyInvestment * timePeriod * 12;
      return { totalInvestment: total, estimatedReturns: 0, futureValue: total, percentageReturn: 0 };
    }

    const annualRateDec = expectedReturn / 100;
    const monthlyRate = Math.pow(1 + annualRateDec, 1 / 12) - 1;
    const months = timePeriod * 12;

    const futureValue =
      monthlyInvestment *
      ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) *
      (1 + monthlyRate);

    const investedAmount = monthlyInvestment * months;
    const estimatedReturns = futureValue - investedAmount;
    const percentageReturn = (estimatedReturns / investedAmount) * 100;

    return {
      totalInvestment: Math.round(investedAmount),
      estimatedReturns: Math.round(estimatedReturns),
      futureValue: Math.round(futureValue),
      percentageReturn: percentageReturn.toFixed(1)
    };
  }, [monthlyInvestment, annualRate, years]);

  const chartData = useMemo(() => {
    const data = [];
    const annualRateDec = annualRate / 100;
    const monthlyRate = Math.pow(1 + annualRateDec, 1 / 12) - 1;

    for (let i = 1; i <= years; i++) {
      const currentMonths = i * 12;
      const currentInvested = monthlyInvestment * currentMonths;
      let fv = 0;
      
      if (annualRate > 0) {
        fv = monthlyInvestment * ((Math.pow(1 + monthlyRate, currentMonths) - 1) / monthlyRate) * (1 + monthlyRate);
      } else {
        fv = currentInvested;
      }
      
      data.push({
        year: `Year ${i}`,
        Invested: Math.round(currentInvested),
        Total: Math.round(fv)
      });
    }
    return data;
  }, [monthlyInvestment, annualRate, years]);

  const timelineMilestones = useMemo(() => {
    return [
      { year: 2, data: chartData.find(d => d.year === "Year 2") },
      { year: Math.floor(years / 2), data: chartData.find(d => d.year === `Year ${Math.floor(years / 2)}`) },
      { year: years, data: chartData[chartData.length - 1] }
    ].filter(m => m.year > 0 && m.data);
  }, [chartData, years]);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    'name': 'SIP Calculator',
    'description': SEO_DESC,
    'applicationCategory': 'FinanceApplication',
    'operatingSystem': 'All',
    'offers': {
      '@type': 'Offer',
      'price': '0',
      'priceCurrency': 'USD'
    }
  };

  const faqs = [
    {
      q: "What is SIP?",
      a: "A Systematic Investment Plan (SIP) is a facility offered by mutual funds that allows you to invest a fixed amount of money at regular intervals (usually monthly) in a mutual fund scheme. This helps in building long-term wealth through compounding without needing a large initial lump sum."
    },
    {
      q: "Is SIP safe?",
      a: "SIPs are an investment in mutual funds, which are subject to market risks. While they are not entirely risk-free like fixed deposits, investing via SIP over a long term (5-10+ years) significantly averages out market volatility and historically provides much higher returns."
    },
    {
      q: "Can I stop SIP anytime?",
      a: "Yes, you can pause or completely stop your SIP anytime without any penalty. Unlike traditional insurance policies, mutual fund SIPs are extremely flexible. You can also withdraw your money anytime (subject to lock-in periods for ELSS funds)."
    },
    {
      q: "What is the minimum SIP amount?",
      a: "You can start a Systematic Investment Plan with as little as ₹500 per month in most mutual fund schemes in India. This makes SIP an incredibly affordable wealth creation tool for everyone."
    },
    {
      q: "How much should I invest in SIP?",
      a: "A good rule of thumb is to invest at least 20% of your monthly income. However, the exact amount depends on your financial goals, current expenses, and the time horizon you have to achieve your target wealth. Use our SIP Calculator above to experiment with numbers."
    },
    {
      q: "Can SIP make me rich?",
      a: "Yes, absolutely! The secret to getting rich via SIP is the 'Power of Compounding' and 'Patience'. By consistently investing even small amounts over long periods, the returns generated start generating their own returns, leading to exponential wealth creation."
    }
  ];

  if (!mounted) {
    return <div className="min-h-screen bg-[#F6F8FC] dark:bg-[#030712]" />;
  }

  return (
    <ToolVisibilityGuard slug="sip-calculator">
      <div className="bg-[#F6F8FC] dark:bg-[#030712] min-h-screen py-24 relative overflow-hidden font-sans transition-colors duration-250 font-sans">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        
        <MeshGradient />
        <FloatingParticles />
        
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-emerald-500/5 rounded-full blur-[140px] pointer-events-none z-0" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl relative z-10">
          
          <Link 
            href="/tools" 
            className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-widest text-gray-500 hover:text-emerald-500 transition-colors mb-10 group"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Directory
          </Link>

          <div className="text-center max-w-4xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-emerald-400 text-xs font-black tracking-widest mb-6 shadow-2xl hover:border-emerald-500/30 transition-colors">
              <span>📈 Smart Investment Planning Tool</span>
            </div>
            
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 dark:text-white mb-2 uppercase leading-none">
              SIP Calculator
            </h1>
            
            <h2 className="text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 mb-6 uppercase tracking-wide">
              Plan Your Future Wealth with SIP
            </h2>
            
            <p className="text-sm sm:text-base text-gray-400 leading-relaxed font-medium mb-8 max-w-2xl mx-auto">
              Calculate your SIP returns, total investment, estimated gains, and future wealth instantly with our free SIP Calculator.
            </p>

            {/* Stats Row */}
            <div className="flex flex-wrap justify-center gap-4 sm:gap-8 text-[10px] sm:text-xs font-black text-gray-500 uppercase tracking-widest mb-10">
              <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-500" /> Beginner Friendly</span>
              <span className="flex items-center gap-1.5"><Zap className="w-4 h-4 text-emerald-500" /> Real-Time Calculation</span>
              <span className="flex items-center gap-1.5"><Activity className="w-4 h-4 text-emerald-500" /> Mobile Responsive</span>
              <span className="flex items-center gap-1.5"><TrendingUp className="w-4 h-4 text-emerald-500" /> Free to Use</span>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <button 
                onClick={scrollToCalculator}
                className="w-full sm:w-auto px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black uppercase tracking-widest text-sm rounded-full transition-transform hover:scale-105 active:scale-95 shadow-lg shadow-emerald-500/20"
              >
                Calculate SIP Returns
              </button>
              <button 
                onClick={scrollToLearnMore}
                className="w-full sm:w-auto px-8 py-4 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-900 dark:text-white font-black uppercase tracking-widest text-sm rounded-full transition-transform hover:scale-105 active:scale-95 border border-slate-200 dark:border-white/10 shadow-sm"
              >
                Learn How SIP Works
              </button>
            </div>
          </div>

          <div id="calculator-section" className="flex flex-col lg:flex-row gap-8 mb-16 pt-8">
            
            {/* Inputs Panel */}
            <div className="w-full lg:w-5/12 space-y-6 shrink-0">
              <div className="glass rounded-[2.5rem] border border-slate-200/80 dark:border-white/5 shadow-2xl p-6 sm:p-8 bg-white dark:bg-white/[0.01]">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/5 pb-4 mb-8">
                  <div className="flex items-center gap-2">
                    <Calculator className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">Investment Plan</h3>
                  </div>
                  <button 
                    onClick={handleReset}
                    className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-gray-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                  >
                    <RefreshCw className="w-3 h-3" /> Reset
                  </button>
                </div>

                <div className="space-y-10">
                  <InputSlider 
                    label="Monthly Investment" 
                    helperText="How much will you invest every month?"
                    icon={Wallet}
                    min={500} 
                    max={10000000} 
                    step={500} 
                    value={monthlyInvestment} 
                    onChange={setMonthlyInvestment}
                    suffix="₹"
                    placeholder="5000"
                    showInWords={true}
                    presets={[
                      { label: "₹5K", value: 5000 },
                      { label: "₹10K", value: 10000 },
                      { label: "₹25K", value: 25000 },
                      { label: "₹50K", value: 50000 },
                      { label: "₹1L", value: 100000 },
                      { label: "₹5L", value: 500000 },
                    ]}
                  />
                  
                  <InputSlider 
                    label="Expected Return" 
                    helperText="Average annual return expected from your investment."
                    icon={TrendingUp}
                    min={1} 
                    max={30} 
                    step={0.1} 
                    value={annualRate} 
                    onChange={setAnnualRate}
                    suffix="%"
                    placeholder="12"
                    presets={[
                      { label: "8%", value: 8 },
                      { label: "10%", value: 10 },
                      { label: "12%", value: 12 },
                      { label: "15%", value: 15 },
                    ]}
                  />

                  <InputSlider 
                    label="Time Period" 
                    helperText="How long do you plan to stay invested?"
                    icon={Clock}
                    min={1} 
                    max={40} 
                    step={1} 
                    value={years} 
                    onChange={setYears}
                    suffix="Yrs"
                    placeholder="10"
                    presets={[
                      { label: "5 Yrs", value: 5 },
                      { label: "10 Yrs", value: 10 },
                      { label: "15 Yrs", value: 15 },
                      { label: "20 Yrs", value: 20 },
                    ]}
                  />
                </div>

              </div>
            </div>

            {/* Results Panel */}
            <div className="w-full lg:w-7/12 flex flex-col gap-6">
              
              <div className="glass rounded-[2.5rem] border border-slate-200/80 dark:border-white/5 shadow-2xl overflow-hidden bg-white dark:bg-white/[0.01] relative group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none transition-transform group-hover:scale-110 duration-700" />
                
                <div className="p-8 sm:p-10 relative z-10">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-2">
                      <Target className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">🎯 Wealth Created</span>
                    </div>
                  </div>

                  <div className="mb-8">
                    <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-2 block">Future Value</span>
                    <motion.div 
                      key={results.futureValue}
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-5xl sm:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-600 dark:from-white dark:to-gray-400 tracking-tight leading-none"
                    >
                      {formatCurrency(results.futureValue)}
                    </motion.div>

                    {results.futureValue > 0 && (
                      <div className="mt-3 inline-flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold text-emerald-700 dark:text-emerald-300 shadow-sm">
                        <span className="text-emerald-800 dark:text-emerald-400">🔤 Value in Words:</span>
                        <span>{numberToWordsINR(results.futureValue)}</span>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-200/80 dark:border-white/5">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-500 mb-1 block">You Invested</span>
                      <span className="text-xl sm:text-2xl font-black text-blue-600 dark:text-blue-400">{formatCurrency(results.totalInvestment)}</span>
                      {results.totalInvestment > 0 && (
                        <p className="text-[11px] font-bold text-blue-600 dark:text-blue-400 mt-1">
                          {numberToWordsINR(results.totalInvestment)}
                        </p>
                      )}
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-500 mb-1 block">You Earned</span>
                      <span className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">{formatCurrency(results.estimatedReturns)}</span>
                      {results.estimatedReturns > 0 && (
                        <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                          {numberToWordsINR(results.estimatedReturns)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="glass rounded-[2rem] border border-slate-200/80 dark:border-white/5 p-6 bg-slate-50 dark:bg-gradient-to-r dark:from-blue-500/5 dark:to-emerald-500/5 flex flex-col sm:flex-row items-center justify-between gap-6 cursor-pointer hover:bg-slate-100 dark:hover:bg-white/[0.03] transition-colors shadow-md dark:shadow-none" onClick={() => setCompareMode(!compareMode)}>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-white/5 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5 text-slate-600 dark:text-gray-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-500">Without Investing</p>
                    <p className="text-lg font-black text-slate-800 dark:text-gray-300">{formatCurrency(results.totalInvestment)}</p>
                    <p className="text-xs text-red-600 dark:text-red-400 font-bold mt-0.5">₹0 Growth</p>
                  </div>
                </div>
                
                <div className="hidden sm:block">
                  <ArrowRight className="w-5 h-5 text-slate-400 dark:text-gray-600" />
                </div>
                
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                    <Zap className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-500">With SIP</p>
                    <p className="text-lg font-black text-slate-900 dark:text-white">{formatCurrency(results.futureValue)}</p>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">Huge Benefit!</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="glass rounded-2xl border border-slate-200/80 dark:border-white/5 p-5 bg-white dark:bg-white/[0.01] shadow-sm dark:shadow-none">
                  <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-2">📈 Wealth Growth</p>
                  <p className="text-sm font-semibold text-slate-700 dark:text-gray-300 leading-relaxed">
                    Returns are <span className="text-slate-900 dark:text-white font-bold">{results.percentageReturn}%</span> of your investment.
                  </p>
                </div>
                <div className="glass rounded-2xl border border-slate-200/80 dark:border-white/5 p-5 bg-white dark:bg-white/[0.01] shadow-sm dark:shadow-none">
                  <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-2">💰 Monthly Habit</p>
                  <p className="text-sm font-semibold text-slate-700 dark:text-gray-300 leading-relaxed">
                    Investing <span className="text-slate-900 dark:text-white font-bold">₹{monthlyInvestment}/mo</span> creates <span className="text-slate-900 dark:text-white font-bold">{formatCompactCurrency(results.futureValue)}</span> over {years} years.
                  </p>
                </div>
              </div>

            </div>
          </div>

          <div className="glass rounded-[2.5rem] border border-slate-200/80 dark:border-white/5 shadow-2xl p-6 sm:p-10 bg-white dark:bg-white/[0.01] mb-16">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Year-wise Growth Chart</h3>
                <p className="text-sm text-gray-400 font-medium mt-1">See how your money compounds over time.</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500/50" />
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Invested</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500/50" />
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Value</span>
                </div>
              </div>
            </div>

            <div className="h-[300px] sm:h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorInvested" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis 
                    dataKey="year" 
                    stroke="#ffffff40" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false}
                    tickMargin={10}
                    minTickGap={20}
                  />
                  <YAxis 
                    stroke="#ffffff40" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false}
                    tickFormatter={(value) => `₹${(value / 100000).toFixed(1)}L`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area 
                    type="monotone" 
                    dataKey="Total" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorTotal)" 
                    animationDuration={1500}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="Invested" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorInvested)" 
                    animationDuration={1500}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-12 pt-10 border-t border-white/5">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-6 text-center">Growth Timeline Milestones</p>
              <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-10">
                {timelineMilestones.map((milestone: any, index: number) => (
                  <div key={index} className="flex flex-col items-center bg-white/[0.02] border border-white/5 rounded-2xl p-4 w-full sm:w-48 text-center">
                    <span className="text-xs font-black uppercase tracking-widest text-emerald-400 mb-2">{milestone.data.year}</span>
                    <span className="text-xl font-black text-white">{formatCompactCurrency(milestone.data.Total)}</span>
                    <span className="text-[10px] font-semibold text-gray-500 mt-1">Value</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Educational Content Section */}
          <section id="learn-more-section" className="py-20 border-t border-white/5 mt-16 pt-24 scroll-mt-10">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-emerald-400 text-xs font-black tracking-widest mb-6">
                <BookOpen className="w-4 h-4" />
                <span>Comprehensive Guide</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight uppercase mb-6">
                📚 Learn How SIP Works
              </h2>
              <p className="text-gray-400 text-base sm:text-lg font-medium leading-relaxed">
                Understand SIP investing, compounding, and long-term wealth creation. Mastering the SIP Calculator starts with understanding the fundamentals of Mutual Fund SIP.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
              <div className="glass rounded-[2rem] border border-slate-200/80 dark:border-white/5 p-8 bg-white dark:bg-white/[0.01] hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors shadow-md dark:shadow-none">
                <h3 className="text-xl font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-4">What is SIP?</h3>
                <p className="text-slate-700 dark:text-gray-300 leading-relaxed font-medium">
                  SIP (Systematic Investment Plan) allows you to invest a fixed amount regularly (monthly or quarterly) in mutual funds. Instead of trying to time the market with a lump sum, a SIP Calculator helps you plan disciplined investments, reducing market volatility risks and building wealth over time.
                </p>
              </div>
              
              <div className="glass rounded-[2rem] border border-slate-200/80 dark:border-white/5 p-8 bg-white dark:bg-white/[0.01] hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors shadow-md dark:shadow-none">
                <h3 className="text-xl font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-4">How SIP Works?</h3>
                <ul className="space-y-4 text-slate-700 dark:text-gray-300 font-medium">
                  <li className="flex gap-3 items-start"><CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" /> <span><strong>Monthly Investment:</strong> A fixed amount is auto-debited from your bank.</span></li>
                  <li className="flex gap-3 items-start"><CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" /> <span><strong>Compounding:</strong> Reinvesting your returns generates explosive long-term growth.</span></li>
                  <li className="flex gap-3 items-start"><CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" /> <span><strong>Rupee Cost Averaging:</strong> You buy more units when markets are down and fewer when markets are up.</span></li>
                </ul>
              </div>
              
              <div className="glass rounded-[2rem] border border-slate-200/80 dark:border-white/5 p-8 bg-white dark:bg-white/[0.01] hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors shadow-md dark:shadow-none">
                <h3 className="text-xl font-black text-purple-600 dark:text-purple-400 uppercase tracking-widest mb-4">Benefits of SIP</h3>
                <ul className="space-y-4 text-slate-700 dark:text-gray-300 font-medium">
                  <li className="flex gap-3 items-center"><CheckCircle2 className="w-5 h-5 text-purple-600 dark:text-purple-400 shrink-0" /> Disciplined investing habit</li>
                  <li className="flex gap-3 items-center"><CheckCircle2 className="w-5 h-5 text-purple-600 dark:text-purple-400 shrink-0" /> Affordable investing (start with ₹500)</li>
                  <li className="flex gap-3 items-center"><CheckCircle2 className="w-5 h-5 text-purple-600 dark:text-purple-400 shrink-0" /> Power of compounding</li>
                  <li className="flex gap-3 items-center"><CheckCircle2 className="w-5 h-5 text-purple-600 dark:text-purple-400 shrink-0" /> Reduced market timing risk</li>
                </ul>
              </div>
              
              <div className="glass rounded-[2rem] border border-slate-200/80 dark:border-white/5 p-8 bg-white dark:bg-white/[0.01] hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors shadow-md dark:shadow-none">
                <h3 className="text-xl font-black text-orange-600 dark:text-orange-400 uppercase tracking-widest mb-4">Who Should Invest?</h3>
                <ul className="space-y-4 text-slate-700 dark:text-gray-300 font-medium">
                  <li className="flex gap-3 items-center"><CheckCircle2 className="w-5 h-5 text-orange-600 dark:text-orange-400 shrink-0" /> <strong>Students:</strong> Build early capital</li>
                  <li className="flex gap-3 items-center"><CheckCircle2 className="w-5 h-5 text-orange-600 dark:text-orange-400 shrink-0" /> <strong>Working Professionals:</strong> Wealth accumulation</li>
                  <li className="flex gap-3 items-center"><CheckCircle2 className="w-5 h-5 text-orange-600 dark:text-orange-400 shrink-0" /> <strong>Parents:</strong> Child education or marriage funds</li>
                  <li className="flex gap-3 items-center"><CheckCircle2 className="w-5 h-5 text-orange-600 dark:text-orange-400 shrink-0" /> <strong>Retirement Planners:</strong> Build a retirement corpus</li>
                </ul>
              </div>
            </div>

            <div className="mb-20 glass rounded-[3rem] border border-slate-200/80 dark:border-emerald-500/20 p-8 sm:p-12 relative overflow-hidden bg-white dark:bg-transparent shadow-xl dark:shadow-none">
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
              <h3 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-8 relative z-10 text-center">
                The Power of Compounding 🚀
              </h3>
              <p className="text-center text-slate-600 dark:text-gray-400 font-medium mb-12 max-w-2xl mx-auto relative z-10">
                Einstein called it the 8th wonder of the world! See what happens when you invest a disciplined ₹5,000 every month at an expected 12% return for 20 years. Use our SIP Calculator to test your own numbers.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 relative z-10">
                <div className="bg-slate-100 dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-[2rem] p-8 text-center hover:bg-slate-200 dark:hover:bg-black/70 transition-colors">
                  <p className="text-xs font-black text-slate-500 dark:text-gray-500 uppercase tracking-widest mb-3">Invested Amount</p>
                  <p className="text-3xl sm:text-4xl font-black text-blue-600 dark:text-blue-400">₹12,00,000</p>
                </div>
                <div className="bg-slate-100 dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-[2rem] p-8 text-center hover:bg-slate-200 dark:hover:bg-black/70 transition-colors">
                  <p className="text-xs font-black text-slate-500 dark:text-gray-500 uppercase tracking-widest mb-3">Estimated Returns</p>
                  <p className="text-3xl sm:text-4xl font-black text-emerald-600 dark:text-emerald-400">₹37,95,740</p>
                </div>
                <div className="bg-emerald-50 dark:bg-black/50 border border-emerald-500/30 rounded-[2rem] p-8 text-center dark:bg-gradient-to-t dark:from-emerald-500/10 dark:to-transparent shadow-xl dark:shadow-emerald-500/5">
                  <p className="text-xs font-black text-emerald-700 dark:text-emerald-500 uppercase tracking-widest mb-3">Total Wealth</p>
                  <p className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">₹49,95,740</p>
                </div>
              </div>
            </div>

            <div className="mb-20">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white text-center uppercase tracking-widest mb-8">Quick SIP Tips 💡</h3>
              <div className="flex flex-wrap justify-center gap-4">
                <span className="glass px-6 py-4 rounded-full text-sm font-bold text-slate-700 dark:text-gray-300 flex items-center gap-2 border border-slate-200/80 dark:border-white/10 hover:border-emerald-500/30 transition-colors shadow-sm"><Zap className="w-4 h-4 text-amber-500 dark:text-yellow-400" /> Start early</span>
                <span className="glass px-6 py-4 rounded-full text-sm font-bold text-slate-700 dark:text-gray-300 flex items-center gap-2 border border-slate-200/80 dark:border-white/10 hover:border-emerald-500/30 transition-colors shadow-sm"><Zap className="w-4 h-4 text-amber-500 dark:text-yellow-400" /> Invest regularly</span>
                <span className="glass px-6 py-4 rounded-full text-sm font-bold text-slate-700 dark:text-gray-300 flex items-center gap-2 border border-slate-200/80 dark:border-white/10 hover:border-emerald-500/30 transition-colors shadow-sm"><Zap className="w-4 h-4 text-amber-500 dark:text-yellow-400" /> Stay invested long term</span>
                <span className="glass px-6 py-4 rounded-full text-sm font-bold text-slate-700 dark:text-gray-300 flex items-center gap-2 border border-slate-200/80 dark:border-white/10 hover:border-emerald-500/30 transition-colors shadow-sm"><Zap className="w-4 h-4 text-amber-500 dark:text-yellow-400" /> Increase SIP yearly</span>
              </div>
            </div>

            <div className="max-w-3xl mx-auto space-y-8 mb-20">
              <div className="text-center">
                <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase mb-2">Frequently Asked Questions</h3>
                <p className="text-xs text-slate-500 dark:text-gray-500 font-bold uppercase tracking-wider mb-8">Everything you need to know about Mutual Fund SIP</p>
              </div>
              <div className="space-y-4">
                {faqs.map((faq, index) => {
                  const isExpanded = faqExpanded === index;
                  return (
                    <div key={index} className="glass rounded-2xl border border-slate-200/80 dark:border-white/5 bg-white dark:bg-white/[0.01] overflow-hidden shadow-sm dark:shadow-none">
                      <button
                        onClick={() => setFaqExpanded(isExpanded ? null : index)}
                        className="w-full flex items-center justify-between p-5.5 text-left focus:outline-none cursor-pointer"
                      >
                        <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                          {faq.q}
                        </span>
                        <ChevronDown className={`w-4 h-4 text-slate-400 dark:text-gray-500 transition-transform duration-300 flex-shrink-0 ml-4 ${isExpanded ? 'rotate-180 text-emerald-600 dark:text-emerald-400' : ''}`} />
                      </button>

                      <AnimatePresence initial={false}>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2, ease: "easeInOut" }}
                          >
                            <div className="px-5.5 pb-5.5 pt-0.5 border-t border-slate-200 dark:border-white/5 text-xs text-slate-600 dark:text-gray-400 leading-relaxed font-semibold font-sans">
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

            <div className="text-center py-12 border-t border-white/5">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-8">Ready to calculate your SIP?</h3>
              <button 
                onClick={scrollToCalculator}
                className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase tracking-widest text-sm rounded-full transition-transform hover:scale-105 flex items-center justify-center gap-2 mx-auto shadow-lg shadow-emerald-500/20"
              >
                <ArrowUp className="w-5 h-5" />
                Calculate SIP Returns
              </button>
            </div>
          </section>

        </div>

        {toolArticles['sip-calculator'] && (
          <ToolArticle {...toolArticles['sip-calculator']} />
        )}
      </div>
    </ToolVisibilityGuard>
  );
}
