"use client";

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  ChevronLeft, Calculator, TrendingUp, RefreshCw, ChevronDown, Activity, Wallet, Target, Info, ArrowRight, ShieldCheck, Clock, Zap, BookOpen, CheckCircle2, ArrowUp, Share2, Copy, Home, Car, User, GraduationCap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { MeshGradient, FloatingParticles } from '@/components/BackgroundEffects';
import ToolVisibilityGuard from '@/components/ToolVisibilityGuard';
import { toolsData } from '@/data/tools';
import { toolArticles } from '@/data/toolArticles';
import ToolArticle from '@/components/ToolArticle';

const SEO_DESC = "Calculate loan EMI, total interest, and total payment instantly for home loan, car loan, personal loan and more.";

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
    if (hundred > 0) {
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
      parts.push(`${croreWords} Crore`);
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
              let val = e.target.value === '' ? '' : Number(e.target.value);
              onChange(val);
            }}
            onBlur={() => {
              if (value !== '' && value < min) onChange(min);
              if (value !== '' && value > max) onChange(max);
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

const CustomPieTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="glass rounded-xl border border-white/10 p-4 bg-black/80 backdrop-blur-md">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: data.color }}></div>
          <p className="text-sm font-black text-slate-900 dark:text-white">{data.name}</p>
        </div>
        <p className="text-slate-900 dark:text-white font-mono text-lg font-bold">{formatCurrency(data.value)}</p>
      </div>
    );
  }
  return null;
};

export default function EmiCalculatorPage() {
  const [mounted, setMounted] = useState(false);
  const [faqExpanded, setFaqExpanded] = useState<number | null>(null);

  // States
  const [loanAmount, setLoanAmount] = useState<number>(5000000);
  const [interestRate, setInterestRate] = useState<number>(8.5);
  const [tenure, setTenure] = useState<number>(20);
  const [tenureType, setTenureType] = useState<'years' | 'months'>('years');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleReset = () => {
    setLoanAmount(5000000);
    setInterestRate(8.5);
    setTenure(20);
    setTenureType('years');
  };

  const applyPreset = (type: 'home' | 'car' | 'personal' | 'education') => {
    switch (type) {
      case 'home':
        setLoanAmount(5000000);
        setInterestRate(8.5);
        setTenure(20);
        setTenureType('years');
        break;
      case 'car':
        setLoanAmount(800000);
        setInterestRate(9.5);
        setTenure(5);
        setTenureType('years');
        break;
      case 'personal':
        setLoanAmount(500000);
        setInterestRate(12.5);
        setTenure(3);
        setTenureType('years');
        break;
      case 'education':
        setLoanAmount(1500000);
        setInterestRate(10.5);
        setTenure(7);
        setTenureType('years');
        break;
    }
  };

  const results = useMemo(() => {
    const P = loanAmount || 0;
    const R = interestRate || 0;
    const T = tenure || 0;

    if (P === 0 || R === 0 || T === 0) {
      return {
        emi: 0,
        totalInterest: 0,
        totalPayment: P,
        schedule: []
      };
    }

    const r = R / 12 / 100;
    const n = tenureType === 'years' ? T * 12 : T;

    // EMI = P * r * (1+r)^n / ((1+r)^n - 1)
    const emi = P * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
    const totalPayment = emi * n;
    const totalInterest = totalPayment - P;

    // Generate Schedule
    let balance = P;
    let schedule = [];
    let currentYear = new Date().getFullYear();
    let yearlyPrincipal = 0;
    let yearlyInterest = 0;
    
    for (let m = 1; m <= n; m++) {
      let interestForMonth = balance * r;
      let principalForMonth = emi - interestForMonth;
      yearlyInterest += interestForMonth;
      yearlyPrincipal += principalForMonth;
      balance -= principalForMonth;
      
      if (m % 12 === 0 || m === n) {
        schedule.push({
          year: currentYear++,
          principal: Math.round(yearlyPrincipal),
          interest: Math.round(yearlyInterest),
          balance: Math.round(Math.max(0, balance))
        });
        yearlyPrincipal = 0;
        yearlyInterest = 0;
      }
    }

    return {
      emi: Math.round(emi),
      totalInterest: Math.round(totalInterest),
      totalPayment: Math.round(totalPayment),
      schedule
    };
  }, [loanAmount, interestRate, tenure, tenureType]);

  const pieData = [
    { name: 'Principal Amount', value: loanAmount, color: '#3b82f6' },
    { name: 'Total Interest', value: results.totalInterest, color: '#10b981' }
  ];

  const handleCopy = async () => {
    try {
      const text = `Loan Amount: ${formatCurrency(loanAmount)}\nInterest Rate: ${interestRate}%\nTenure: ${tenure} ${tenureType}\n\nMonthly EMI: ${formatCurrency(results.emi)}\nTotal Interest: ${formatCurrency(results.totalInterest)}\nTotal Payment: ${formatCurrency(results.totalPayment)}\n\nCalculated via ToolWala AI`;
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const scrollToCalculator = () => {
    document.getElementById('calculator-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToLearnMore = () => {
    document.getElementById('learn-more-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const relatedTools = toolsData.filter(t => ['sip-calculator', 'age-calculator'].includes(t.slug));

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    'name': 'EMI Calculator',
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
      q: "What is an EMI?",
      a: "EMI stands for Equated Monthly Installment. It is a fixed payment amount made by a borrower to a lender at a specified date each calendar month. EMIs are used to pay off both interest and principal each month so that over a specified number of years, the loan is fully paid off."
    },
    {
      q: "How is EMI calculated?",
      a: "EMI is calculated using the formula: EMI = [P x R x (1+R)^N]/[(1+R)^N-1], where P is the principal loan amount, R is the rate of interest calculated on a monthly basis, and N is the loan tenure in months."
    },
    {
      q: "Does EMI change during the loan tenure?",
      a: "For a fixed-rate loan, the EMI remains the same throughout the loan tenure. For a floating-rate loan, the EMI can change if the lender revises the base interest rate."
    },
    {
      q: "Can I prepay my loan to reduce EMI?",
      a: "Yes, making a part-prepayment towards your loan principal will reduce your outstanding balance. After prepayment, you can either choose to reduce your monthly EMI or reduce your loan tenure while keeping the same EMI."
    },
    {
      q: "Is it better to have a shorter or longer loan tenure?",
      a: "A shorter tenure means higher monthly EMIs but significantly lower total interest paid over the life of the loan. A longer tenure reduces your monthly EMI burden but increases the total interest you end up paying to the bank."
    }
  ];

  if (!mounted) {
    return <div className="min-h-screen bg-[#F6F8FC] dark:bg-[#030712]" />;
  }

  return (
    <ToolVisibilityGuard slug="emi-calculator">
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

          {/* Hero Section */}
          <div className="text-center max-w-4xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-emerald-400 text-xs font-black tracking-widest mb-6 shadow-2xl hover:border-emerald-500/30 transition-colors">
              <span>📈 Smart Loan Planning Tool</span>
            </div>
            
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 dark:text-white mb-2 uppercase leading-none">
              EMI Calculator
            </h1>
            
            <h2 className="text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 mb-6 uppercase tracking-wide">
              Plan Your Loans & Mortgages
            </h2>
            
            <p className="text-sm sm:text-base text-gray-400 leading-relaxed font-medium mb-8 max-w-2xl mx-auto">
              Calculate loan EMI, total interest, and total payment instantly for home loan, car loan, personal loan and more.
            </p>

            <div className="flex flex-wrap justify-center gap-4 sm:gap-8 text-[10px] sm:text-xs font-black text-gray-500 uppercase tracking-widest mb-10">
              <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-500" /> Secure & Private</span>
              <span className="flex items-center gap-1.5"><Zap className="w-4 h-4 text-emerald-500" /> Real-Time Results</span>
              <span className="flex items-center gap-1.5"><Activity className="w-4 h-4 text-emerald-500" /> Highly Accurate</span>
              <span className="flex items-center gap-1.5"><TrendingUp className="w-4 h-4 text-emerald-500" /> Free Forever</span>
            </div>

            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <button 
                onClick={scrollToCalculator}
                className="w-full sm:w-auto px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black uppercase tracking-widest text-sm rounded-full transition-transform hover:scale-105 active:scale-95 shadow-lg shadow-emerald-500/20"
              >
                Calculate EMI Now
              </button>
              <button 
                onClick={scrollToLearnMore}
                className="w-full sm:w-auto px-8 py-4 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-900 dark:text-white font-black uppercase tracking-widest text-sm rounded-full transition-transform hover:scale-105 active:scale-95 border border-slate-200 dark:border-white/10 shadow-sm"
              >
                Learn How EMI Works
              </button>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <button onClick={() => applyPreset('home')} className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 hover:border-emerald-500/50 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 text-slate-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all font-bold text-sm shadow-sm">
              <Home className="w-4 h-4" /> Home Loan
            </button>
            <button onClick={() => applyPreset('car')} className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 hover:border-emerald-500/50 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 text-slate-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all font-bold text-sm shadow-sm">
              <Car className="w-4 h-4" /> Car Loan
            </button>
            <button onClick={() => applyPreset('personal')} className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 hover:border-emerald-500/50 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 text-slate-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all font-bold text-sm shadow-sm">
              <User className="w-4 h-4" /> Personal Loan
            </button>
            <button onClick={() => applyPreset('education')} className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 hover:border-emerald-500/50 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 text-slate-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all font-bold text-sm shadow-sm">
              <GraduationCap className="w-4 h-4" /> Edu Loan
            </button>
          </div>

          <div id="calculator-section" className="flex flex-col lg:flex-row gap-8 mb-16 pt-8">
            
            {/* Inputs Panel */}
            <div className="w-full lg:w-5/12 space-y-6 shrink-0">
              <div className="glass rounded-[2.5rem] border border-slate-200/80 dark:border-white/5 shadow-2xl p-6 sm:p-8 bg-white dark:bg-white/[0.01]">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/5 pb-4 mb-8">
                  <div className="flex items-center gap-2">
                    <Calculator className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">Loan Details</h3>
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
                    label="Loan Amount" 
                    helperText="Total amount you wish to borrow."
                    icon={Wallet}
                    min={10000} 
                    max={500000000} 
                    step={10000} 
                    value={loanAmount} 
                    onChange={setLoanAmount}
                    suffix="₹"
                    placeholder="5000000"
                    showInWords={true}
                    presets={[
                      { label: "₹1L", value: 100000 },
                      { label: "₹10L", value: 1000000 },
                      { label: "₹50L", value: 5000000 },
                      { label: "₹1Cr", value: 10000000 },
                      { label: "₹5Cr", value: 50000000 },
                    ]}
                  />
                  
                  <InputSlider 
                    label="Interest Rate" 
                    helperText="Annual interest rate charged by the bank."
                    icon={TrendingUp}
                    min={1} 
                    max={30} 
                    step={0.1} 
                    value={interestRate} 
                    onChange={setInterestRate}
                    suffix="%"
                    placeholder="12"
                    presets={[
                      { label: "7.5%", value: 7.5 },
                      { label: "8.5%", value: 8.5 },
                      { label: "10.5%", value: 10.5 },
                      { label: "12%", value: 12 },
                    ]}
                  />

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        <label className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">Loan Tenure</label>
                      </div>
                      
                      <div className="flex bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-lg p-1">
                        <button 
                          onClick={() => {
                            if (tenureType !== 'years') {
                              setTenureType('years');
                              setTenure(Math.max(1, Math.round(tenure / 12)));
                            }
                          }}
                          className={`px-3 py-1 rounded-md text-xs font-bold transition-colors ${tenureType === 'years' ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-extrabold' : 'text-slate-600 dark:text-gray-500 hover:text-slate-900 dark:hover:text-white'}`}
                        >
                          Years
                        </button>
                        <button 
                          onClick={() => {
                            if (tenureType !== 'months') {
                              setTenureType('months');
                              setTenure(tenure * 12);
                            }
                          }}
                          className={`px-3 py-1 rounded-md text-xs font-bold transition-colors ${tenureType === 'months' ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-extrabold' : 'text-slate-600 dark:text-gray-500 hover:text-slate-900 dark:hover:text-white'}`}
                        >
                          Months
                        </button>
                      </div>
                    </div>

                    <div className="relative flex items-center mb-2">
                      <input 
                        type="number"
                        min={1}
                        max={tenureType === 'years' ? 30 : 360}
                        value={tenure}
                        placeholder="10"
                        onChange={(e) => {
                          let val = e.target.value === '' ? '' : Number(e.target.value);
                          setTenure(val as number);
                        }}
                        onBlur={() => {
                          const min = 1;
                          const max = tenureType === 'years' ? 30 : 360;
                          if ((tenure as any) !== '' && tenure < min) setTenure(min);
                          if ((tenure as any) !== '' && tenure > max) setTenure(max);
                        }}
                        className="w-full bg-slate-100 dark:bg-black/40 border border-slate-300 dark:border-white/10 hover:border-slate-400 dark:hover:border-white/20 rounded-xl py-3 px-4 pr-16 text-slate-900 dark:text-white font-mono text-lg text-center focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all placeholder:text-slate-400 dark:placeholder:text-white/20 shadow-inner dark:shadow-none"
                      />
                      <span className="absolute right-5 text-slate-500 dark:text-gray-500 text-sm font-bold pointer-events-none uppercase">{tenureType === 'years' ? 'Yrs' : 'Mos'}</span>
                    </div>

                    <div className="relative w-full h-2 bg-slate-200 dark:bg-white/5 rounded-full overflow-hidden mt-4">
                      <motion.div 
                        className="absolute top-0 left-0 h-full bg-emerald-500 pointer-events-none" 
                        initial={{ width: 0 }}
                        animate={{ width: `${((tenure - 1) / ((tenureType === 'years' ? 30 : 360) - 1)) * 100}%` }} 
                        transition={{ type: "spring", stiffness: 100, damping: 20 }}
                      />
                      <input 
                        type="range"
                        min={1}
                        max={tenureType === 'years' ? 30 : 360}
                        step={1}
                        value={tenure}
                        onChange={(e) => setTenure(Number(e.target.value))}
                        className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
                      />
                    </div>
                  </div>

                </div>

              </div>
            </div>

            {/* Results Panel */}
            <div className="w-full lg:w-7/12 flex flex-col gap-6">
              
              <div className="glass rounded-[2.5rem] border border-slate-200/80 dark:border-white/5 shadow-2xl overflow-hidden bg-white dark:bg-white/[0.01] relative group h-full flex flex-col">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none transition-transform group-hover:scale-110 duration-700" />
                
                <div className="p-8 sm:p-10 relative z-10 flex-grow flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-2">
                      <Target className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">🎯 EMI Details</span>
                    </div>
                    <button 
                      onClick={handleCopy}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-xs font-bold text-slate-700 dark:text-gray-300 transition-colors border border-slate-200 dark:border-white/10 shadow-sm"
                    >
                      {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied ? 'Copied!' : 'Share'}
                    </button>
                  </div>

                  <div className="mb-10 text-center">
                    <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-2 block">Monthly EMI</span>
                    <motion.div 
                      key={results.emi}
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-6xl sm:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-600 dark:from-white dark:to-gray-400 tracking-tight leading-none"
                    >
                      {formatCurrency(results.emi)}
                    </motion.div>

                    {results.emi > 0 && (
                      <div className="mt-3 inline-flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold text-emerald-700 dark:text-emerald-300 shadow-sm">
                        <span className="text-emerald-800 dark:text-emerald-400">🔤 EMI in Words:</span>
                        <span>{numberToWordsINR(results.emi)}</span>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 items-center bg-slate-50 dark:bg-black/40 border border-slate-200/80 dark:border-white/5 rounded-3xl p-6 shadow-inner dark:shadow-none">
                    <div className="space-y-6">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-500 flex items-center gap-2 mb-1"><div className="w-2 h-2 rounded-full bg-blue-500" /> Principal Amount</span>
                        <span className="text-2xl font-black text-slate-900 dark:text-white">{formatCurrency(loanAmount)}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-500 flex items-center gap-2 mb-1"><div className="w-2 h-2 rounded-full bg-emerald-500" /> Total Interest</span>
                        <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{formatCurrency(results.totalInterest)}</span>
                      </div>
                      <div className="pt-4 border-t border-slate-200 dark:border-white/10">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-gray-400 mb-1 block">Total Amount Payable</span>
                        <span className="text-xl font-black text-slate-900 dark:text-white">{formatCurrency(results.totalPayment)}</span>
                        {results.totalPayment > 0 && (
                          <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                            {numberToWordsINR(results.totalPayment)}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="h-[200px] w-full relative">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieData}
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                          >
                            {pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <RechartsTooltip content={<CustomPieTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none flex-col">
                        <span className="text-[10px] font-bold text-slate-500 dark:text-gray-500 uppercase tracking-widest">Interest</span>
                        <span className="text-lg font-black text-slate-900 dark:text-white">{results.totalPayment > 0 ? Math.round((results.totalInterest / results.totalPayment) * 100) : 0}%</span>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

            </div>
          </div>

          {/* Repayment Schedule */}
          {results.schedule.length > 0 && (
            <div className="glass rounded-[2.5rem] border border-slate-200/80 dark:border-white/5 shadow-2xl p-6 sm:p-10 bg-white dark:bg-white/[0.01] mb-16 overflow-hidden">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8">
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2"><BookOpen className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /> Repayment Schedule</h3>
                  <p className="text-sm text-slate-600 dark:text-gray-400 font-medium mt-1">Yearly breakdown of your principal and interest payments.</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-white/10">
                      <th className="py-4 px-4 text-xs font-black text-slate-600 dark:text-gray-500 uppercase tracking-widest">Year</th>
                      <th className="py-4 px-4 text-xs font-black text-slate-600 dark:text-gray-500 uppercase tracking-widest text-right">Principal Paid</th>
                      <th className="py-4 px-4 text-xs font-black text-slate-600 dark:text-gray-500 uppercase tracking-widest text-right">Interest Paid</th>
                      <th className="py-4 px-4 text-xs font-black text-slate-600 dark:text-gray-500 uppercase tracking-widest text-right">Total Payment</th>
                      <th className="py-4 px-4 text-xs font-black text-slate-600 dark:text-gray-500 uppercase tracking-widest text-right">Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.schedule.map((row, idx) => (
                      <tr key={idx} className="border-b border-slate-200/60 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                        <td className="py-4 px-4 text-sm font-bold text-slate-900 dark:text-white">{row.year}</td>
                        <td className="py-4 px-4 text-sm font-mono text-blue-600 dark:text-blue-400 text-right">{formatCurrency(row.principal)}</td>
                        <td className="py-4 px-4 text-sm font-mono text-emerald-600 dark:text-emerald-400 text-right">{formatCurrency(row.interest)}</td>
                        <td className="py-4 px-4 text-sm font-mono text-slate-700 dark:text-gray-300 text-right">{formatCurrency(row.principal + row.interest)}</td>
                        <td className="py-4 px-4 text-sm font-mono text-slate-900 dark:text-white font-bold text-right">{formatCurrency(row.balance)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Educational Content Section */}
          <section id="learn-more-section" className="py-20 border-t border-slate-200/80 dark:border-white/5 mt-16 pt-24 scroll-mt-10">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 backdrop-blur-md text-emerald-600 dark:text-emerald-400 text-xs font-black tracking-widest mb-6 shadow-sm">
                <BookOpen className="w-4 h-4" />
                <span>Comprehensive Guide</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight uppercase mb-6">
                📚 Learn How EMI Works
              </h2>
              <p className="text-slate-600 dark:text-gray-400 text-base sm:text-lg font-medium leading-relaxed">
                Understand EMI math, principal reduction, and smart borrowing strategies before taking your next big loan.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
              <div className="glass rounded-[2rem] border border-slate-200/80 dark:border-white/5 p-8 bg-white dark:bg-white/[0.01] hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors shadow-md dark:shadow-none">
                <h3 className="text-xl font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-4">What is EMI?</h3>
                <p className="text-slate-700 dark:text-gray-300 leading-relaxed font-medium">
                  Equated Monthly Installment (EMI) is the fixed payment amount you make to a bank or lender on a specific date each month. It helps you pay off the principal loan amount and the accrued interest over a specified tenure without a massive financial burden at once.
                </p>
              </div>
              
              <div className="glass rounded-[2rem] border border-slate-200/80 dark:border-white/5 p-8 bg-white dark:bg-white/[0.01] hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors shadow-md dark:shadow-none">
                <h3 className="text-xl font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-4">How EMI is Calculated?</h3>
                <p className="text-slate-700 dark:text-gray-300 leading-relaxed font-medium mb-4">EMI depends on three major factors:</p>
                <ul className="space-y-3 text-slate-700 dark:text-gray-300 font-medium">
                  <li className="flex gap-3 items-start"><CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" /> <span><strong>Principal (P):</strong> The initial amount you borrow.</span></li>
                  <li className="flex gap-3 items-start"><CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" /> <span><strong>Interest Rate (R):</strong> The cost of borrowing the money.</span></li>
                  <li className="flex gap-3 items-start"><CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" /> <span><strong>Tenure (N):</strong> The total time (months/years) given to repay.</span></li>
                </ul>
              </div>
            </div>

            <div className="max-w-3xl mx-auto space-y-8 mb-20">
              <div className="text-center">
                <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase mb-2">Frequently Asked Questions</h3>
                <p className="text-xs text-slate-500 dark:text-gray-500 font-bold uppercase tracking-wider mb-8">Everything you need to know about Loans & EMIs</p>
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
                            exit={{ height: "auto", opacity: 0 }}
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
            
            {/* Related Tools */}
            {relatedTools.length > 0 && (
              <div className="mt-20">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase mb-8 text-center">Related Financial Tools</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
                  {relatedTools.map(tool => (
                    <Link key={tool.slug} href={tool.href} className="glass rounded-2xl border border-white/5 p-6 bg-white/[0.01] hover:bg-white/[0.05] transition-all group">
                      <div className="flex items-center gap-4 mb-3">
                        <span className="text-3xl group-hover:scale-110 transition-transform">{tool.icon}</span>
                        <h4 className="text-lg font-black text-slate-900 dark:text-white">{tool.title}</h4>
                      </div>
                      <p className="text-sm text-gray-400 font-medium">{tool.description}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <div className="text-center py-12 border-t border-white/5 mt-16">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-8">Ready to calculate your EMI?</h3>
              <button 
                onClick={scrollToCalculator}
                className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase tracking-widest text-sm rounded-full transition-transform hover:scale-105 flex items-center justify-center gap-2 mx-auto shadow-lg shadow-emerald-500/20"
              >
                <ArrowUp className="w-5 h-5" />
                Back to Calculator
              </button>
            </div>
          </section>

        </div>

        {toolArticles['emi-calculator'] && (
          <ToolArticle {...toolArticles['emi-calculator']} />
        )}
      </div>
    </ToolVisibilityGuard>
  );
}
