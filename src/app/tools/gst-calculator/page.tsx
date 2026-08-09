"use client";

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  ChevronLeft, ChevronDown, Calculator, RefreshCw, Activity, Wallet, Target, ShieldCheck, Zap, BookOpen, CheckCircle2, ArrowUp, Copy, Percent, AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MeshGradient, FloatingParticles } from '@/components/BackgroundEffects';
import ToolVisibilityGuard from '@/components/ToolVisibilityGuard';
import { toolsData } from '@/data/tools';
import { toolArticles } from '@/data/toolArticles';
import ToolArticle from '@/components/ToolArticle';

const SEO_TITLE = "Free GST Calculator Online - ToolWala AI";
const SEO_DESC = "Calculate GST amount, total price, and reverse GST instantly with free GST Calculator.";


const MAX_AMOUNT = 999999999999; // Max limit ₹1 Trillion (12 digits)

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(value);
};

const formatCompactCurrency = (value: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    notation: 'compact',
    maximumFractionDigits: 2
  }).format(value);
};

function numberToWordsINR(amount: number): string {
  if (!amount || isNaN(amount) || amount === 0) return "";

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

function NumberInput({ label, value, onChange, icon: Icon, suffix = "", helperText, placeholder = "" }: any) {
  const isMaxReached = value === MAX_AMOUNT;

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div className="flex items-center gap-2">
          <Icon className={`w-5 h-5 ${isMaxReached ? 'text-amber-500' : 'text-emerald-600 dark:text-emerald-400'}`} />
          <label className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">{label}</label>
        </div>
        <div className="relative flex items-center w-full sm:w-48">
          <input 
            type="number"
            min={0}
            max={MAX_AMOUNT}
            value={value}
            placeholder={placeholder}
            onChange={(e) => {
              if (e.target.value === '') {
                onChange('');
                return;
              }
              let val = Number(e.target.value);
              if (val > MAX_AMOUNT) val = MAX_AMOUNT;
              if (val < 0) val = 0;
              onChange(val);
            }}
            onBlur={() => {
              if (value !== '' && value < 0) onChange(0);
            }}
            className={`w-full bg-slate-100 dark:bg-black/40 border rounded-xl py-3 px-4 pr-10 text-slate-900 dark:text-white font-mono text-lg text-center focus:outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-white/20 shadow-inner dark:shadow-none ${
              isMaxReached 
                ? 'border-amber-500 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 font-bold' 
                : 'border-slate-300 dark:border-white/10 hover:border-slate-400 dark:hover:border-white/20 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50'
            }`}
          />
          {suffix && <span className="absolute right-4 text-slate-500 dark:text-gray-500 text-sm font-bold pointer-events-none">{suffix}</span>}
        </div>
      </div>
      
      {isMaxReached ? (
        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-300/80 dark:border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs font-semibold shadow-sm">
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <span>Maximum Limit Reached: Bas ₹99,999 Crore (₹1 Trillion) tak hi maximum enter kar sakte hain.</span>
        </div>
      ) : (
        <p className="text-xs text-slate-600 dark:text-gray-400 font-medium">{helperText}</p>
      )}
    </div>
  );
}

export default function GstCalculatorPage() {
  const [mounted, setMounted] = useState(false);
  const [faqExpanded, setFaqExpanded] = useState<number | null>(null);

  // States
  const [amount, setAmount] = useState<number | ''>(10000);
  const [rate, setRate] = useState<number | ''>(18);
  const [isCustomRate, setIsCustomRate] = useState<boolean>(false);
  const [mode, setMode] = useState<'add' | 'remove'>('add');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleReset = () => {
    setAmount(10000);
    setRate(18);
    setIsCustomRate(false);
    setMode('add');
  };

  const applyExample = (exAmount: number, exRate: number, exMode: 'add' | 'remove') => {
    setAmount(exAmount);
    setRate(exRate);
    setMode(exMode);
    setIsCustomRate(![3, 5, 12, 18, 28].includes(exRate));
  };

  const results = useMemo(() => {
    const P = Number(amount) || 0;
    const R = Number(rate) || 0;

    if (P === 0 || R === 0) {
      return { original: P, gst: 0, total: P };
    }

    if (mode === 'add') {
      const gst = (P * R) / 100;
      const total = P + gst;
      return {
        original: P,
        gst: gst,
        total: total
      };
    } else {
      const original = P / (1 + (R / 100));
      const gst = P - original;
      return {
        original: original,
        gst: gst,
        total: P
      };
    }
  }, [amount, rate, mode]);

  const handleCopy = async () => {
    try {
      const words = numberToWordsINR(results.total);
      const text = `Calculation Mode: ${mode === 'add' ? 'Add GST (Exclusive)' : 'Remove GST (Inclusive)'}\nBase Rate: ${rate}%\n\nOriginal Amount: ${formatCurrency(results.original)}\nGST Amount: ${formatCurrency(results.gst)}\nTotal Amount: ${formatCurrency(results.total)}${words ? `\nAmount in Words: ${words}` : ''}\n\nCalculated via ToolWala AI`;
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

  const relatedTools = toolsData.filter(t => ['emi-calculator', 'sip-calculator', 'age-calculator'].includes(t.slug));

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    'name': 'GST Calculator',
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
      q: "What is GST?",
      a: "GST stands for Goods and Services Tax. It is an indirect tax which has replaced many indirect taxes in India such as the excise duty, VAT, services tax, etc. It is levied on the supply of goods and services."
    },
    {
      q: "What does 'Add GST' (Exclusive) mean?",
      a: "It means the amount you entered does not include the GST. The calculator will compute the GST amount and add it to your entered amount to give the final total price."
    },
    {
      q: "What does 'Remove GST' (Inclusive) mean?",
      a: "It means the amount you entered already includes the GST. The calculator will perform a reverse calculation to find the original base price of the item and the exact tax amount embedded in the total."
    },
    {
      q: "What are the common GST slabs in India?",
      a: "The standard GST rates in India are 3% (for gold), 5%, 12%, 18%, and 28%. Some essential items are fully exempt (0%)."
    },
    {
      q: "Is this calculator free to use?",
      a: "Yes! ToolWala AI's GST Calculator is 100% free, highly secure, and works entirely in your browser without saving any financial data to external servers."
    }
  ];

  if (!mounted) {
    return <div className="min-h-screen bg-[#F6F8FC] dark:bg-[#030712]" />;
  }

  return (
    <ToolVisibilityGuard slug="gst-calculator">
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
            className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-widest text-slate-500 dark:text-gray-500 hover:text-emerald-600 dark:hover:text-emerald-500 transition-colors mb-10 group"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Directory
          </Link>

          {/* Hero Section */}
          <div className="text-center max-w-4xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 dark:bg-white/5 border border-emerald-200/60 dark:border-white/10 backdrop-blur-md text-emerald-600 dark:text-emerald-400 text-xs font-black tracking-widest mb-6 shadow-sm hover:border-emerald-500/30 transition-colors">
              <span>🧾 Smart Tax Planning Tool</span>
            </div>
            
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 dark:text-white mb-2 uppercase leading-none">
              GST Calculator
            </h1>
            
            <h2 className="text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 dark:from-emerald-400 dark:via-teal-400 dark:to-cyan-400 mb-6 uppercase tracking-wide">
              Calculate Goods & Services Tax Instantly
            </h2>
            
            <p className="text-sm sm:text-base text-slate-600 dark:text-gray-400 leading-relaxed font-medium mb-8 max-w-2xl mx-auto">
              Easily compute the tax amount and total price. Supports both adding exclusive GST and reverse calculating inclusive GST.
            </p>

            <div className="flex flex-wrap justify-center gap-4 sm:gap-8 text-[10px] sm:text-xs font-black text-slate-600 dark:text-gray-500 uppercase tracking-widest mb-10">
              <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-500" /> 100% Private</span>
              <span className="flex items-center gap-1.5"><Zap className="w-4 h-4 text-emerald-600 dark:text-emerald-500" /> Instant Results</span>
              <span className="flex items-center gap-1.5"><Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-500" /> High Precision</span>
            </div>

            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <button 
                onClick={scrollToCalculator}
                className="w-full sm:w-auto px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black uppercase tracking-widest text-sm rounded-full transition-transform hover:scale-105 active:scale-95 shadow-lg shadow-emerald-500/20"
              >
                Start Calculating
              </button>
              <button 
                onClick={scrollToLearnMore}
                className="w-full sm:w-auto px-8 py-4 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-800 dark:text-white font-black uppercase tracking-widest text-sm rounded-full transition-transform hover:scale-105 active:scale-95 border border-slate-200 dark:border-white/10"
              >
                How It Works
              </button>
            </div>
          </div>

          <div id="calculator-section" className="flex flex-col lg:flex-row gap-8 mb-16 pt-8">
            
            {/* Inputs Panel */}
            <div className="w-full lg:w-5/12 space-y-6 shrink-0">
              <div className="glass rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl dark:shadow-2xl p-6 sm:p-8 bg-white dark:bg-white/[0.01]">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-4 mb-8">
                  <div className="flex items-center gap-2">
                    <Calculator className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">Calculation Details</h3>
                  </div>
                  <button 
                    onClick={handleReset}
                    className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-gray-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                  >
                    <RefreshCw className="w-3 h-3" /> Reset
                  </button>
                </div>

                <div className="space-y-8">
                  {/* Calculation Mode Toggle */}
                  <div className="space-y-3">
                    <label className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white block">Mode</label>
                    <div className="flex bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl p-1.5 gap-1 w-full">
                      <button 
                        onClick={() => setMode('add')}
                        className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${mode === 'add' ? 'bg-emerald-500 text-slate-950 font-black shadow-lg shadow-emerald-500/20' : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-white/5'}`}
                      >
                        Add GST (+GST)
                      </button>
                      <button 
                        onClick={() => setMode('remove')}
                        className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${mode === 'remove' ? 'bg-emerald-500 text-slate-950 font-black shadow-lg shadow-emerald-500/20' : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-white/5'}`}
                      >
                        Remove GST (-GST)
                      </button>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-gray-400 font-medium mt-2">
                      {mode === 'add' ? "Calculates and adds tax on top of your base amount." : "Extracts tax from a total amount to find the base price."}
                    </p>
                  </div>

                  <NumberInput 
                    label="Amount" 
                    helperText="Enter the amount to calculate GST for."
                    icon={Wallet}
                    value={amount} 
                    onChange={setAmount}
                    suffix="₹"
                    placeholder="10000"
                  />

                  {/* GST Rate Selection */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Percent className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      <label className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white block">GST Rate</label>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {[3, 5, 12, 18, 28].map(r => (
                        <button
                          key={r}
                          onClick={() => {
                            setRate(r);
                            setIsCustomRate(false);
                          }}
                          className={`px-4 py-2 text-sm font-bold rounded-xl border transition-all ${rate === r && !isCustomRate ? 'bg-emerald-500/10 dark:bg-emerald-500/20 border-emerald-500/50 text-emerald-700 dark:text-emerald-400 font-extrabold shadow-sm' : 'bg-slate-100 dark:bg-white/[0.02] border-slate-200 dark:border-white/10 hover:border-emerald-500/40 text-slate-700 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white'}`}
                        >
                          {r}%
                        </button>
                      ))}
                      <button
                        onClick={() => setIsCustomRate(true)}
                        className={`px-4 py-2 text-sm font-bold rounded-xl border transition-all ${isCustomRate ? 'bg-emerald-500/10 dark:bg-emerald-500/20 border-emerald-500/50 text-emerald-700 dark:text-emerald-400 font-extrabold shadow-sm' : 'bg-slate-100 dark:bg-white/[0.02] border-slate-200 dark:border-white/10 hover:border-emerald-500/40 text-slate-700 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white'}`}
                      >
                        Custom
                      </button>
                    </div>
                    
                    {/* Custom Rate Input */}
                    <AnimatePresence>
                      {isCustomRate && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0, marginTop: 0 }}
                          animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
                          exit={{ opacity: 0, height: 0, marginTop: 0 }}
                          className="relative flex items-center w-full"
                        >
                          <input 
                            type="number"
                            min={0}
                            step={0.1}
                            value={rate}
                            placeholder="e.g. 15"
                            onChange={(e) => {
                              const val: number | '' = e.target.value === '' ? '' : Number(e.target.value);
                              setRate(val);
                            }}
                            className="w-full bg-slate-100 dark:bg-black/40 border border-slate-300 dark:border-white/10 hover:border-slate-400 dark:hover:border-white/20 rounded-xl py-3 px-4 pr-10 text-slate-900 dark:text-white font-mono text-lg text-left focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all placeholder:text-slate-400 dark:placeholder:text-white/20 shadow-inner dark:shadow-none"
                          />
                          <span className="absolute right-4 text-slate-500 dark:text-gray-500 text-sm font-bold pointer-events-none">%</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                </div>
              </div>

              {/* Quick Examples */}
              <div className="glass rounded-3xl border border-slate-200 dark:border-white/5 p-6 bg-white dark:bg-white/[0.01]">
                <h3 className="text-xs font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-4">Quick Examples</h3>
                <div className="space-y-2">
                  <button onClick={() => applyExample(50000, 18, 'add')} className="w-full text-left px-4 py-3 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-white/10 flex justify-between items-center group">
                    <span className="text-sm font-bold text-slate-700 dark:text-gray-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">Laptop (₹50k + 18%)</span>
                    <ChevronLeft className="w-4 h-4 rotate-180 text-slate-400 dark:text-gray-600 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors" />
                  </button>
                  <button onClick={() => applyExample(1000, 5, 'add')} className="w-full text-left px-4 py-3 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-white/10 flex justify-between items-center group">
                    <span className="text-sm font-bold text-slate-700 dark:text-gray-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">Food Bill (₹1k + 5%)</span>
                    <ChevronLeft className="w-4 h-4 rotate-180 text-slate-400 dark:text-gray-600 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors" />
                  </button>
                  <button onClick={() => applyExample(15000, 12, 'remove')} className="w-full text-left px-4 py-3 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-white/10 flex justify-between items-center group">
                    <span className="text-sm font-bold text-slate-700 dark:text-gray-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">Phone (₹15k incl. 12%)</span>
                    <ChevronLeft className="w-4 h-4 rotate-180 text-slate-400 dark:text-gray-600 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors" />
                  </button>
                </div>
              </div>
            </div>

            {/* Results Panel */}
            <div className="w-full lg:w-7/12 flex flex-col gap-6">
              
              <div className="glass rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl dark:shadow-2xl overflow-hidden bg-white dark:bg-white/[0.01] relative group h-full flex flex-col">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none transition-transform group-hover:scale-110 duration-700" />
                
                <div className="p-8 sm:p-10 relative z-10 flex-grow flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-2">
                      <Target className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">🎯 Result Summary</span>
                    </div>
                    <button 
                      onClick={handleCopy}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-xs font-bold text-slate-700 dark:text-gray-300 transition-colors border border-slate-200 dark:border-white/10"
                    >
                      {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied ? 'Copied!' : 'Share'}
                    </button>
                  </div>

                  <div className="mb-10 text-center px-2">
                    <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-2 block">Total Amount</span>
                    <motion.div 
                      key={results.total}
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className={`font-black text-transparent bg-clip-text bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 dark:from-white dark:via-gray-100 dark:to-gray-400 tracking-tight leading-tight break-all max-w-full overflow-hidden ${
                        formatCurrency(results.total).length > 20 ? 'text-2xl sm:text-3xl lg:text-4xl' :
                        formatCurrency(results.total).length > 14 ? 'text-3xl sm:text-4xl lg:text-5xl' :
                        formatCurrency(results.total).length > 10 ? 'text-4xl sm:text-5xl lg:text-6xl' :
                        'text-5xl sm:text-6xl lg:text-7xl'
                      }`}
                    >
                      {formatCurrency(results.total)}
                    </motion.div>
                    
                    {results.total > 0 && (
                      <motion.div 
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200/80 dark:border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-xs sm:text-sm font-bold shadow-sm max-w-full leading-relaxed"
                      >
                        <span className="text-sm">🔤</span>
                        <span>{numberToWordsINR(results.total)}</span>
                      </motion.div>
                    )}

                    {results.total > 99999999 && (
                      <span className="text-xs font-bold text-slate-500 dark:text-gray-400 mt-2 block">
                        (~ {formatCompactCurrency(results.total)})
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 dark:bg-black/40 border border-slate-200/80 dark:border-white/5 rounded-3xl p-4 sm:p-6 shadow-inner dark:shadow-none">
                    <div className="bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-2xl p-4 sm:p-6 flex flex-col items-center justify-center text-center shadow-sm dark:shadow-none min-w-0 w-full overflow-hidden">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-400 mb-2 block">Original Base Amount</span>
                      <span className="text-base sm:text-lg md:text-xl font-black text-slate-900 dark:text-white break-all max-w-full overflow-hidden text-center">{formatCurrency(results.original)}</span>
                      {results.original > 99999999 && (
                        <span className="text-[10px] font-semibold text-slate-400 dark:text-gray-500 mt-1 block">
                          (~ {formatCompactCurrency(results.original)})
                        </span>
                      )}
                    </div>
                    <div className="bg-emerald-500/[0.04] dark:bg-emerald-500/[0.02] border border-emerald-500/20 dark:border-emerald-500/10 rounded-2xl p-4 sm:p-6 flex flex-col items-center justify-center text-center shadow-sm dark:shadow-none min-w-0 w-full overflow-hidden">
                      <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700 dark:text-emerald-500/70 mb-2 block">Total GST ({rate}%)</span>
                      <span className="text-base sm:text-lg md:text-xl font-black text-emerald-600 dark:text-emerald-400 break-all max-w-full overflow-hidden text-center">{formatCurrency(results.gst)}</span>
                      {results.gst > 99999999 && (
                        <span className="text-[10px] font-semibold text-emerald-600/70 dark:text-emerald-500/60 mt-1 block">
                          (~ {formatCompactCurrency(results.gst)})
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-6 flex items-center justify-center gap-2">
                    <div className="h-1.5 flex-1 bg-slate-200 dark:bg-white/[0.05] rounded-full overflow-hidden flex">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(results.original / results.total) * 100}%` }}
                        className="h-full bg-blue-500"
                      />
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(results.gst / results.total) * 100}%` }}
                        className="h-full bg-emerald-500"
                      />
                    </div>
                  </div>
                  <div className="flex justify-between mt-2 px-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">Base {results.total ? Math.round((results.original / results.total) * 100) : 0}%</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Tax {results.total ? Math.round((results.gst / results.total) * 100) : 0}%</span>
                  </div>

                </div>
              </div>

            </div>
          </div>

          {/* Educational Content Section */}
          <section id="learn-more-section" className="py-20 border-t border-slate-200 dark:border-white/5 mt-16 pt-24 scroll-mt-10">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 dark:bg-white/5 border border-emerald-200/60 dark:border-white/10 backdrop-blur-md text-emerald-600 dark:text-emerald-400 text-xs font-black tracking-widest mb-6 shadow-sm">
                <BookOpen className="w-4 h-4" />
                <span>GST Guide</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight uppercase mb-6">
                📚 How to Use the GST Calculator
              </h2>
              <p className="text-slate-600 dark:text-gray-400 text-base sm:text-lg font-medium leading-relaxed">
                Learn the difference between adding and removing GST to ensure your invoices and calculations are perfectly accurate.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
              <div className="glass rounded-[2rem] border border-slate-200 dark:border-white/5 p-8 bg-white dark:bg-white/[0.01] hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors shadow-sm dark:shadow-none">
                <h3 className="text-xl font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-4">Adding GST (+GST)</h3>
                <p className="text-slate-600 dark:text-gray-300 leading-relaxed font-medium mb-4">
                  Use this when you know the base price of a product and need to apply the tax to find the final selling price.
                </p>
                <div className="bg-slate-100 dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-xl p-4 text-sm font-mono text-slate-700 dark:text-gray-400">
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">Formula:</span><br />
                  GST Amount = Base Price × (Rate / 100)<br />
                  Total Price = Base Price + GST Amount
                </div>
              </div>
              
              <div className="glass rounded-[2rem] border border-slate-200 dark:border-white/5 p-8 bg-white dark:bg-white/[0.01] hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors shadow-sm dark:shadow-none">
                <h3 className="text-xl font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-4">Removing GST (-GST)</h3>
                <p className="text-slate-600 dark:text-gray-300 leading-relaxed font-medium mb-4">
                  Use this when you have the final receipt or total price and need to backward-calculate how much of it was tax.
                </p>
                <div className="bg-slate-100 dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-xl p-4 text-sm font-mono text-slate-700 dark:text-gray-400">
                  <span className="text-blue-600 dark:text-blue-400 font-bold">Formula:</span><br />
                  Base Price = Total Price / [1 + (Rate / 100)]<br />
                  GST Amount = Total Price - Base Price
                </div>
              </div>
            </div>

            <div className="max-w-3xl mx-auto space-y-8 mb-20">
              <div className="text-center">
                <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase mb-2">Frequently Asked Questions</h3>
                <p className="text-xs text-slate-500 dark:text-gray-500 font-bold uppercase tracking-wider mb-8">Everything you need to know about GST</p>
              </div>
              <div className="space-y-4">
                {faqs.map((faq, index) => {
                  const isExpanded = faqExpanded === index;
                  return (
                    <div key={index} className="glass rounded-2xl border border-slate-200 dark:border-white/5 bg-white dark:bg-white/[0.01] overflow-hidden shadow-sm dark:shadow-none">
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
                            <div className="px-5.5 pb-5.5 pt-0.5 border-t border-slate-100 dark:border-white/5 text-xs text-slate-600 dark:text-gray-400 leading-relaxed font-semibold font-sans">
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
                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase mb-8 text-center">Related Calculators</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
                  {relatedTools.map(tool => (
                    <Link key={tool.slug} href={tool.href} className="glass rounded-2xl border border-slate-200 dark:border-white/5 p-6 bg-white dark:bg-white/[0.01] hover:bg-slate-50 dark:hover:bg-white/[0.05] transition-all group shadow-sm dark:shadow-none">
                      <div className="flex items-center gap-4 mb-3">
                        <span className="text-3xl group-hover:scale-110 transition-transform">{tool.icon}</span>
                        <h4 className="text-lg font-black text-slate-900 dark:text-white">{tool.title}</h4>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-gray-400 font-medium">{tool.description}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <div className="text-center py-12 border-t border-slate-200 dark:border-white/5 mt-16">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-8">Ready to compute your tax?</h3>
              <button 
                onClick={scrollToCalculator}
                className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black uppercase tracking-widest text-sm rounded-full transition-transform hover:scale-105 flex items-center justify-center gap-2 mx-auto shadow-lg shadow-emerald-500/20"
              >
                <ArrowUp className="w-5 h-5" />
                Back to Top
              </button>
            </div>
          </section>

        </div>

        {toolArticles['gst-calculator'] && (
          <ToolArticle {...toolArticles['gst-calculator']} />
        )}
      </div>
    </ToolVisibilityGuard>
  );
}
