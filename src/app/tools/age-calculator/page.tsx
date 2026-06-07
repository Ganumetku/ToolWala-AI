"use client";

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  ChevronLeft, Calendar, Clock, Activity, Target, Heart, 
  HelpCircle, ChevronDown, CalendarDays, Calculator, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MeshGradient, FloatingParticles } from '@/components/BackgroundEffects';
import ToolVisibilityGuard from '@/components/ToolVisibilityGuard';

const SEO_DESC = "Calculate your exact age in years, months, days, total weeks and next birthday instantly with ToolWala AI.";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

function Dropdown({ value, onChange, options, placeholder, label }: any) {
  return (
    <div className="space-y-1.5 relative">
      <span className="text-[10px] font-bold uppercase text-gray-500 pl-1 tracking-wider">{label}</span>
      <div className="relative group">
        <select 
          value={value} 
          onChange={onChange}
          className="w-full bg-black/40 hover:bg-black/60 border border-white/10 group-hover:border-white/20 rounded-xl py-3.5 pl-4 pr-10 text-white font-semibold text-sm focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 appearance-none transition-all cursor-pointer"
        >
          <option value="" disabled className="bg-gray-900 text-gray-500">{placeholder}</option>
          {options.map((opt: any) => (
            <option key={opt.value} value={opt.value} className="bg-gray-900 text-white">
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none group-hover:text-gray-400 transition-colors" />
      </div>
    </div>
  );
}

function DateSelector({
  label,
  icon: Icon,
  day, setDay,
  month, setMonth,
  year, setYear,
  onToday, onClear
}: any) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 121 }, (_, i) => currentYear - i); // Last 120 years
  
  const dayOptions = Array.from({ length: 31 }, (_, i) => ({ value: String(i + 1), label: String(i + 1) }));
  const monthOptions = MONTHS.map((m, i) => ({ value: String(i), label: m }));
  const yearOptions = years.map(y => ({ value: String(y), label: String(y) }));

  return (
    <div className="space-y-4 bg-white/[0.02] border border-white/5 rounded-2xl p-5 hover:bg-white/[0.04] transition-colors">
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-gray-400" />
          <label className="text-xs font-black uppercase tracking-widest text-gray-300 block">{label}</label>
        </div>
        <div className="flex gap-3">
          <button onClick={onToday} className="text-[10px] uppercase font-bold text-blue-400 hover:text-blue-300 transition-colors">Today</button>
          <button onClick={onClear} className="text-[10px] uppercase font-bold text-gray-500 hover:text-red-400 transition-colors">Clear</button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Dropdown 
          label="Day" 
          placeholder="Select day" 
          value={day} 
          onChange={(e: any) => setDay(e.target.value)} 
          options={dayOptions} 
        />
        <Dropdown 
          label="Month" 
          placeholder="Select month" 
          value={month} 
          onChange={(e: any) => setMonth(e.target.value)} 
          options={monthOptions} 
        />
        <Dropdown 
          label="Year" 
          placeholder="Select year" 
          value={year} 
          onChange={(e: any) => setYear(e.target.value)} 
          options={yearOptions} 
        />
      </div>
    </div>
  );
}

export default function AgeCalculatorPage() {
  const [mounted, setMounted] = useState(false);
  
  // States for DOB
  const [dobDay, setDobDay] = useState('');
  const [dobMonth, setDobMonth] = useState('');
  const [dobYear, setDobYear] = useState('');

  // States for Compare Date
  const [compDay, setCompDay] = useState('');
  const [compMonth, setCompMonth] = useState('');
  const [compYear, setCompYear] = useState('');

  const [faqExpanded, setFaqExpanded] = useState<number | null>(null);

  useEffect(() => {
    setMounted(true);
    const today = new Date();
    setCompDay(String(today.getDate()));
    setCompMonth(String(today.getMonth()));
    setCompYear(String(today.getFullYear()));
    
    // Set default DOB 25 years ago
    const dob = new Date();
    dob.setFullYear(dob.getFullYear() - 25);
    setDobDay(String(dob.getDate()));
    setDobMonth(String(dob.getMonth()));
    setDobYear(String(dob.getFullYear()));
  }, []);

  const { results, errorMsg } = useMemo(() => {
    let errorMsg = null;
    let birthDate: Date | null = null;
    let targetDate: Date | null = null;

    // Validate DOB
    if (dobYear && dobMonth && dobDay) {
      const y = parseInt(dobYear);
      const m = parseInt(dobMonth);
      const d = parseInt(dobDay);
      const tempDate = new Date(y, m, d);
      
      if (tempDate.getFullYear() !== y || tempDate.getMonth() !== m || tempDate.getDate() !== d) {
        errorMsg = "Invalid Date of Birth selected (e.g., February 30 does not exist).";
      } else {
        const today = new Date();
        today.setHours(0,0,0,0);
        if (tempDate > today) {
          errorMsg = "Date of Birth cannot be a future date.";
        } else {
          birthDate = tempDate;
        }
      }
    }

    // Validate Compare Date
    if (!errorMsg && compYear && compMonth && compDay) {
      const y = parseInt(compYear);
      const m = parseInt(compMonth);
      const d = parseInt(compDay);
      const tempDate = new Date(y, m, d);
      
      if (tempDate.getFullYear() !== y || tempDate.getMonth() !== m || tempDate.getDate() !== d) {
        errorMsg = "Invalid Compare Date selected.";
      } else {
        targetDate = tempDate;
      }
    }

    if (!birthDate || !targetDate) {
      return { results: null, errorMsg: errorMsg || "Please select complete dates to calculate." };
    }

    if (birthDate > targetDate) {
      return { results: null, errorMsg: "Date of Birth cannot be greater than the Compare Date." };
    }

    // Calculation Logic
    let years = targetDate.getFullYear() - birthDate.getFullYear();
    let months = targetDate.getMonth() - birthDate.getMonth();
    let days = targetDate.getDate() - birthDate.getDate();

    if (days < 0) {
      months--;
      const lastMonth = new Date(targetDate.getFullYear(), targetDate.getMonth(), 0);
      days += lastMonth.getDate();
    }

    if (months < 0) {
      years--;
      months += 12;
    }

    // Next Birthday Calculation
    let nextBday = new Date(targetDate.getFullYear(), birthDate.getMonth(), birthDate.getDate());
    
    if (nextBday < targetDate || (nextBday.getTime() === targetDate.getTime() && (targetDate.getDate() > birthDate.getDate()))) {
      if (targetDate.getMonth() === birthDate.getMonth() && targetDate.getDate() === birthDate.getDate()) {
        nextBday = new Date(targetDate.getFullYear() + 1, birthDate.getMonth(), birthDate.getDate());
      } else {
        nextBday.setFullYear(nextBday.getFullYear() + 1);
      }
    }

    let nbMonths = nextBday.getMonth() - targetDate.getMonth();
    let nbYears = nextBday.getFullYear() - targetDate.getFullYear();
    let nbDays = nextBday.getDate() - targetDate.getDate();

    if (nbDays < 0) {
      nbMonths--;
      const prevMonth = new Date(nextBday.getFullYear(), nextBday.getMonth(), 0);
      nbDays += prevMonth.getDate();
    }
    if (nbMonths < 0) {
      nbYears--;
      nbMonths += 12;
    }
    if (nbYears > 0) {
      nbMonths += nbYears * 12;
    }

    const isBirthdayToday = targetDate.getMonth() === birthDate.getMonth() && targetDate.getDate() === birthDate.getDate();

    // Totals
    const utc1 = Date.UTC(birthDate.getFullYear(), birthDate.getMonth(), birthDate.getDate());
    const utc2 = Date.UTC(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
    const totalDays = Math.floor((utc2 - utc1) / (1000 * 60 * 60 * 24));
    
    const totalWeeks = Math.floor(totalDays / 7);
    const totalMonths = (years * 12) + months;

    return {
      errorMsg: null,
      results: {
        years,
        months,
        days,
        nextBdayMonths: nbMonths,
        nextBdayDays: nbDays,
        totalMonths,
        totalWeeks,
        totalDays,
        isBirthdayToday
      }
    };
  }, [dobDay, dobMonth, dobYear, compDay, compMonth, compYear]);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    'name': 'Age Calculator',
    'description': SEO_DESC,
    'applicationCategory': 'UtilityApplication',
    'operatingSystem': 'All',
    'offers': {
      '@type': 'Offer',
      'price': '0',
      'priceCurrency': 'USD'
    }
  };

  const faqs = [
    {
      q: "How does the age calculator calculate months and days?",
      a: "Our calculator computes the exact difference by simulating the calendar progression from your birth date to the target date. It considers leap years and the varying lengths of each month to ensure perfect chronological accuracy."
    },
    {
      q: "Can I calculate age for a past or future date?",
      a: "Yes! Simply change the 'Compare Date' field to any past or future date to instantly see what the exact age was or will be on that specific timeline."
    },
    {
      q: "Is my date of birth stored on your servers?",
      a: "No, never. This calculator runs entirely in your browser using secure client-side JavaScript. Your personal data never leaves your device."
    }
  ];

  if (!mounted) {
    return <div className="min-h-screen bg-[#030712]" />;
  }

  return (
    <ToolVisibilityGuard slug="age-calculator">
      <div className="bg-[#030712] min-h-screen py-24 relative overflow-hidden font-sans">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        
        <MeshGradient />
        <FloatingParticles />
        
        {/* Background glow shadow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-blue-500/5 rounded-full blur-[140px] pointer-events-none z-0" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl relative z-10">
          
          {/* Navigation link */}
          <Link 
            href="/tools" 
            className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-widest text-gray-500 hover:text-blue-500 transition-colors mb-10 group"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Directory
          </Link>

          {/* Hero Title Section */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-blue-400 text-xs font-black tracking-widest mb-6 shadow-2xl hover:border-blue-500/30 transition-colors">
              <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
              <span>⚡ Live Client-Side Calculation</span>
            </div>
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white mb-6 uppercase leading-none">
              Age <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
                Calculator
              </span>
            </h1>
            <p className="text-base sm:text-lg text-gray-400 leading-relaxed font-medium">
              Find your exact age in years, months, days, and track the countdown to your next birthday instantly.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
            
            {/* Left Panel: Inputs */}
            <div className="lg:col-span-5 space-y-6">
              <div className="glass rounded-[2.5rem] border border-white/5 shadow-2xl p-6 sm:p-8 bg-white/[0.01]">
                <div className="flex items-center gap-2 border-b border-white/5 pb-4 mb-6">
                  <Calculator className="w-5 h-5 text-blue-400" />
                  <h3 className="text-sm font-black uppercase tracking-widest text-white">Date Details</h3>
                </div>

                <div className="space-y-6">
                  <DateSelector 
                    label="Date of Birth"
                    icon={Calendar}
                    day={dobDay} setDay={setDobDay}
                    month={dobMonth} setMonth={setDobMonth}
                    year={dobYear} setYear={setDobYear}
                    onToday={() => {
                      const d = new Date();
                      setDobDay(String(d.getDate()));
                      setDobMonth(String(d.getMonth()));
                      setDobYear(String(d.getFullYear()));
                    }}
                    onClear={() => { setDobDay(''); setDobMonth(''); setDobYear(''); }}
                  />

                  <DateSelector 
                    label="Compare Date"
                    icon={Target}
                    day={compDay} setDay={setCompDay}
                    month={compMonth} setMonth={setCompMonth}
                    year={compYear} setYear={setCompYear}
                    onToday={() => {
                      const d = new Date();
                      setCompDay(String(d.getDate()));
                      setCompMonth(String(d.getMonth()));
                      setCompYear(String(d.getFullYear()));
                    }}
                    onClear={() => { setCompDay(''); setCompMonth(''); setCompYear(''); }}
                  />
                </div>

              </div>
            </div>

            {/* Right Panel: Results */}
            <div className="lg:col-span-7">
              {errorMsg ? (
                <div className="h-full glass rounded-[2.5rem] border border-red-500/20 bg-red-500/5 p-8 flex flex-col items-center justify-center text-center shadow-2xl">
                  <AlertCircle className="w-12 h-12 text-red-400 mb-4 opacity-70" />
                  <h3 className="text-sm font-black text-white uppercase tracking-wider mb-2">Invalid Selection</h3>
                  <p className="text-xs text-red-300 font-semibold">{errorMsg}</p>
                </div>
              ) : !results ? (
                <div className="h-full glass rounded-[2.5rem] border border-white/5 bg-white/[0.01] p-8 flex flex-col items-center justify-center text-center">
                  <Activity className="w-12 h-12 text-gray-500 mb-4 opacity-50 animate-pulse" />
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Calculating...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Main Age Card */}
                  <div className="glass rounded-[2.5rem] border border-white/5 shadow-2xl overflow-hidden bg-white/[0.01] relative group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none transition-transform group-hover:scale-110 duration-700" />
                    
                    <div className="p-8 sm:p-10 relative z-10">
                      <div className="flex items-center gap-2 mb-8">
                        <Activity className="w-5 h-5 text-blue-400" />
                        <span className="text-xs font-black uppercase tracking-widest text-gray-400">Chronological Age</span>
                      </div>

                      <div className="flex flex-wrap items-end gap-6 sm:gap-10">
                        <div className="flex flex-col">
                          <span className="text-6xl sm:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-400 leading-none">
                            {results.years}
                          </span>
                          <span className="text-sm font-black uppercase tracking-widest text-blue-400 mt-2">Years</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-5xl sm:text-6xl font-black text-white leading-none">
                            {results.months}
                          </span>
                          <span className="text-sm font-black uppercase tracking-widest text-indigo-400 mt-2">Months</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-5xl sm:text-6xl font-black text-white leading-none">
                            {results.days}
                          </span>
                          <span className="text-sm font-black uppercase tracking-widest text-purple-400 mt-2">Days</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Summary Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    
                    {/* Next Birthday Card */}
                    <div className="glass rounded-[2rem] border border-white/5 p-6 bg-gradient-to-br from-white/[0.02] to-transparent hover:bg-white/[0.04] transition-all duration-300">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-black uppercase tracking-widest text-gray-400">Next Birthday</span>
                        <CalendarDays className="w-5 h-5 text-emerald-400" />
                      </div>
                      
                      {results.isBirthdayToday ? (
                        <div className="flex items-center gap-3 mt-4">
                          <Heart className="w-8 h-8 text-rose-500 animate-pulse" />
                          <span className="text-xl font-black text-white tracking-wide uppercase">Happy Birthday!</span>
                        </div>
                      ) : (
                        <div className="flex items-baseline gap-2">
                          <span className="text-3xl font-black text-white">{results.nextBdayMonths}</span>
                          <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 mr-2">Mos</span>
                          <span className="text-3xl font-black text-white">{results.nextBdayDays}</span>
                          <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">Days</span>
                        </div>
                      )}
                    </div>

                    {/* Total Summary */}
                    <div className="glass rounded-[2rem] border border-white/5 p-6 bg-gradient-to-br from-white/[0.02] to-transparent">
                      <div className="space-y-4">
                        <div className="flex justify-between items-end border-b border-white/5 pb-3">
                          <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Total Months</span>
                          <span className="text-lg font-mono font-black text-white">{results.totalMonths.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-end border-b border-white/5 pb-3">
                          <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Total Weeks</span>
                          <span className="text-lg font-mono font-black text-white">{results.totalWeeks.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-end">
                          <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Total Days</span>
                          <span className="text-lg font-mono font-black text-white">{results.totalDays.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Dynamic FAQ Accordion */}
          <section className="py-16 border-t border-white/5 max-w-3xl mx-auto space-y-8">
            <div className="text-center">
              <h3 className="text-3xl font-black text-white tracking-tighter uppercase mb-2">Frequently Asked Questions</h3>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Everything you need to know about age calculation</p>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, index) => {
                const isExpanded = faqExpanded === index;
                return (
                  <div key={index} className="glass rounded-2xl border border-white/5 bg-white/[0.01] overflow-hidden">
                    <button
                      onClick={() => setFaqExpanded(isExpanded ? null : index)}
                      className="w-full flex items-center justify-between p-5.5 text-left focus:outline-none cursor-pointer"
                    >
                      <span className="text-xs sm:text-sm font-black text-white hover:text-blue-400 transition-colors">
                        {faq.q}
                      </span>
                      <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-300 flex-shrink-0 ml-4 ${isExpanded ? 'rotate-180 text-blue-400' : ''}`} />
                    </button>

                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2, ease: "easeInOut" }}
                        >
                          <div className="px-5.5 pb-5.5 pt-0.5 border-t border-white/5 text-xs text-gray-400 leading-relaxed font-semibold font-sans">
                            {faq.a}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </section>

        </div>
      </div>
    </ToolVisibilityGuard>
  );
}
