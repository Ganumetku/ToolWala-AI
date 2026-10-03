"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  ChevronLeft, Scale, User, Calendar, Activity, RefreshCw, 
  Copy, CheckCircle2, AlertCircle, Info, Heart, ShieldCheck, 
  ChevronDown, ChevronUp, Award, Sparkles, BookOpen, Target,
  Sliders, ArrowRight, Zap, HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MeshGradient, FloatingParticles } from '@/components/BackgroundEffects';
import ToolVisibilityGuard from '@/components/ToolVisibilityGuard';
import { toolArticles } from '@/data/toolArticles';
import ToolArticle from '@/components/ToolArticle';
import PdfToolIcon from '@/components/PdfToolIcon';

const SEO_DESC = "Calculate your Body Mass Index (BMI), WHO weight category, ideal healthy weight range, and fitness insights instantly with ToolWala AI's 100% private BMI Calculator.";

// WHO BMI Categories
type BMICategoryKey = 'underweight' | 'normal' | 'overweight' | 'obese1' | 'obese2' | 'obese3';

interface BMICategoryInfo {
  label: string;
  rangeText: string;
  color: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  badgeBg: string;
  icon: string;
  description: string;
  healthTip: string;
}

const CATEGORY_MAP: Record<BMICategoryKey, BMICategoryInfo> = {
  underweight: {
    label: "Underweight",
    rangeText: "< 18.5",
    color: "#06b6d4",
    bgColor: "bg-cyan-500/10 dark:bg-cyan-500/20",
    borderColor: "border-cyan-500/30",
    textColor: "text-cyan-600 dark:text-cyan-400",
    badgeBg: "bg-cyan-50 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-500/30",
    icon: "⚡",
    description: "Your BMI is below the healthy range. You may need to gain weight safely.",
    healthTip: "Focus on nutrient-dense foods, healthy fats, protein-rich diets, and strength training to build muscle mass safely."
  },
  normal: {
    label: "Normal Weight",
    rangeText: "18.5 – 24.9",
    color: "#10b981",
    bgColor: "bg-emerald-500/10 dark:bg-emerald-500/20",
    borderColor: "border-emerald-500/30",
    textColor: "text-emerald-600 dark:text-emerald-400",
    badgeBg: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30",
    icon: "🌟",
    description: "Great job! Your weight is in the ideal healthy WHO range.",
    healthTip: "Maintain your healthy lifestyle with a balanced diet, stay hydrated, and aim for 150+ minutes of physical activity weekly."
  },
  overweight: {
    label: "Overweight",
    rangeText: "25 – 29.9",
    color: "#f59e0b",
    bgColor: "bg-amber-500/10 dark:bg-amber-500/20",
    borderColor: "border-amber-500/30",
    textColor: "text-amber-600 dark:text-amber-400",
    badgeBg: "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-500/30",
    icon: "⚠️",
    description: "Your weight is slightly above the recommended range for your height.",
    healthTip: "Incorporate regular cardio exercise, reduce sugary drinks and processed foods, and focus on portion control."
  },
  obese1: {
    label: "Obese (Class I)",
    rangeText: "30 – 34.9",
    color: "#ef4444",
    bgColor: "bg-rose-500/10 dark:bg-rose-500/20",
    borderColor: "border-rose-500/30",
    textColor: "text-rose-600 dark:text-rose-400",
    badgeBg: "bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-500/30",
    icon: "🚨",
    description: "Your BMI indicates Class I Obesity. Taking action can improve health markers.",
    healthTip: "Consider consulting a nutritionist or healthcare professional for a tailored weight management plan."
  },
  obese2: {
    label: "Obese (Class II)",
    rangeText: "35 – 39.9",
    color: "#dc2626",
    bgColor: "bg-red-500/10 dark:bg-red-500/20",
    borderColor: "border-red-500/30",
    textColor: "text-red-600 dark:text-red-400",
    badgeBg: "bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-300 border-red-200 dark:border-red-500/30",
    icon: "🚨",
    description: "Your BMI indicates Class II Obesity. Increased health risk observed.",
    healthTip: "Prioritize structured physical activity, stress management, and medical guidance to lower cardiovascular risks."
  },
  obese3: {
    label: "Severe Obesity (Class III)",
    rangeText: "40+",
    color: "#b91c1c",
    bgColor: "bg-red-900/20",
    borderColor: "border-red-600/40",
    textColor: "text-red-700 dark:text-red-400",
    badgeBg: "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300 border-red-300 dark:border-red-700/40",
    icon: "🛑",
    description: "Your BMI indicates High Risk Class III Obesity.",
    healthTip: "We strongly recommend speaking with a healthcare professional to establish a safe, medically supervised plan."
  }
};

// Helper: Custom Input Slider Component with Prominent Draggable Circle Handle
function InputSlider({ 
  label, min, max, step, value, onChange, icon: Icon, suffix = "", 
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
        <div className="relative flex items-center w-full sm:w-40">
          <input 
            type="number"
            min={min}
            max={max}
            value={value}
            placeholder={placeholder}
            onChange={(e) => {
              let valStr = e.target.value;
              const maxLen = max ? max.toString().length + 2 : 6;
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
          ⚠️ Maximum limit is {max} {suffix}
        </p>
      )}
      
      <p className="text-xs text-slate-600 dark:text-gray-400 font-medium">{helperText}</p>
      
      {/* Interactive Range Track with Draggable Circle Knob Handle */}
      <div className="relative w-full py-3 cursor-pointer group select-none">
        <div className="w-full h-2.5 bg-slate-200 dark:bg-white/10 rounded-full relative overflow-hidden shadow-inner">
          <motion.div 
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full" 
            animate={{ width: `${pct}%` }} 
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        </div>

        {/* Visible Circle Knob / Thumb */}
        <motion.div 
          className="absolute top-1/2 -translate-y-1/2 -ml-3.5 w-7 h-7 bg-white dark:bg-slate-900 border-2 border-emerald-500 rounded-full shadow-lg flex items-center justify-center pointer-events-none group-hover:scale-110 group-active:scale-95 transition-transform"
          animate={{ left: `${pct}%` }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm" />
        </motion.div>

        {/* Native Range Input for full touch / drag interactivity */}
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
              key={preset.label}
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

export default function BmiCalculatorPage() {
  const [mounted, setMounted] = useState(false);
  const [faqExpanded, setFaqExpanded] = useState<number | null>(null);

  // Unit Mode
  const [unitMode, setUnitMode] = useState<'metric' | 'imperial'>('metric');

  // Input States
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [age, setAge] = useState<number>(25);

  // Metric Inputs
  const [weightKg, setWeightKg] = useState<number>(70);
  const [heightCm, setHeightCm] = useState<number>(172);

  // Imperial Inputs
  const [weightLbs, setWeightLbs] = useState<number>(154);
  const [heightFt, setHeightFt] = useState<number>(5);
  const [heightIn, setHeightIn] = useState<number>(8);

  // UI state
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync unit values on toggle
  const handleUnitModeChange = (mode: 'metric' | 'imperial') => {
    if (mode === unitMode) return;
    if (mode === 'imperial') {
      // convert kg -> lbs
      setWeightLbs(Math.round(weightKg * 2.20462));
      // convert cm -> ft & in
      const totalInches = heightCm / 2.54;
      const ft = Math.floor(totalInches / 12);
      const inch = Math.round(totalInches % 12);
      setHeightFt(Math.max(1, Math.min(8, ft)));
      setHeightIn(Math.max(0, Math.min(11, inch)));
    } else {
      // convert lbs -> kg
      setWeightKg(Math.round(weightLbs / 2.20462));
      // convert ft & in -> cm
      const totalInches = (heightFt * 12) + heightIn;
      setHeightCm(Math.round(totalInches * 2.54));
    }
    setUnitMode(mode);
  };

  const handleReset = () => {
    setGender('male');
    setAge(25);
    setWeightKg(70);
    setHeightCm(172);
    setWeightLbs(154);
    setHeightFt(5);
    setHeightIn(8);
  };

  // Calculations
  const results = useMemo(() => {
    let weightInKg = 0;
    let heightInMeters = 0;
    let heightInInches = 0;

    if (unitMode === 'metric') {
      weightInKg = weightKg;
      heightInMeters = heightCm / 100;
      heightInInches = heightCm / 2.54;
    } else {
      weightInKg = weightLbs / 2.20462;
      heightInInches = (heightFt * 12) + heightIn;
      heightInMeters = (heightInInches * 2.54) / 100;
    }

    if (!weightInKg || !heightInMeters || heightInMeters <= 0 || weightInKg <= 0) {
      return {
        bmi: 0,
        categoryKey: 'normal' as BMICategoryKey,
        cat: CATEGORY_MAP['normal'],
        gaugePercentage: 50,
        minHealthyWeightKg: 0,
        maxHealthyWeightKg: 0,
        weightDiffKg: 0,
        bmiPrime: 0,
        ponderalIndex: 0,
        bsa: 0
      };
    }

    // BMI Formula = kg / (m^2)
    const bmiVal = weightInKg / (heightInMeters * heightInMeters);
    const bmiFormatted = Number(bmiVal.toFixed(1));

    // Determine Category
    let categoryKey: BMICategoryKey = 'normal';
    if (bmiVal < 18.5) categoryKey = 'underweight';
    else if (bmiVal < 25.0) categoryKey = 'normal';
    else if (bmiVal < 30.0) categoryKey = 'overweight';
    else if (bmiVal < 35.0) categoryKey = 'obese1';
    else if (bmiVal < 40.0) categoryKey = 'obese2';
    else categoryKey = 'obese3';

    const cat = CATEGORY_MAP[categoryKey];

    // Gauge Percentage (BMI range 10 to 45 scaled 0 to 100%)
    const minGaugeBMI = 12;
    const maxGaugeBMI = 42;
    const clampedBMI = Math.max(minGaugeBMI, Math.min(maxGaugeBMI, bmiVal));
    const gaugePercentage = Math.round(((clampedBMI - minGaugeBMI) / (maxGaugeBMI - minGaugeBMI)) * 100);

    // Healthy weight range (BMI 18.5 to 24.9)
    const minHealthyKg = 18.5 * (heightInMeters * heightInMeters);
    const maxHealthyKg = 24.9 * (heightInMeters * heightInMeters);

    // Difference to reach normal BMI
    let diffKg = 0;
    if (weightInKg < minHealthyKg) {
      diffKg = minHealthyKg - weightInKg; // Needs to gain
    } else if (weightInKg > maxHealthyKg) {
      diffKg = weightInKg - maxHealthyKg; // Needs to lose
    }

    // Advanced Metrics
    // BMI Prime = BMI / 25
    const bmiPrime = Number((bmiVal / 25.0).toFixed(2));
    // Ponderal Index = kg / (m^3)
    const ponderalIndex = Number((weightInKg / Math.pow(heightInMeters, 3)).toFixed(1));
    // Body Surface Area (Mosteller formula) = sqrt(height_cm * weight_kg / 3600)
    const heightInCm = heightInMeters * 100;
    const bsa = Number(Math.sqrt((heightInCm * weightInKg) / 3600).toFixed(2));

    return {
      bmi: bmiFormatted,
      categoryKey,
      cat,
      gaugePercentage,
      minHealthyWeightKg: Number(minHealthyKg.toFixed(1)),
      maxHealthyWeightKg: Number(maxHealthyKg.toFixed(1)),
      weightDiffKg: Number(diffKg.toFixed(1)),
      bmiPrime,
      ponderalIndex,
      bsa
    };
  }, [unitMode, weightKg, heightCm, weightLbs, heightFt, heightIn]);

  const handleCopy = () => {
    const text = `My BMI is ${results.bmi} (${results.cat.label}) calculated via ToolWala AI BMI Calculator! Check yours at ${window.location.href}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const article = toolArticles['bmi-calculator'];

  return (
    <ToolVisibilityGuard slug="bmi-calculator">
      <div className="relative min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-white transition-colors duration-300 overflow-hidden font-sans">
        {/* Background Gradients */}
        <MeshGradient />
        <FloatingParticles />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-24">
          
          {/* Top Breadcrumb Navigation */}
          <div className="flex items-center justify-between mb-8">
            <Link 
              href="/tools" 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-white/10 transition-all shadow-sm"
            >
              <ChevronLeft className="w-4 h-4" /> Back to Tools
            </Link>

            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold shadow-sm">
              <ShieldCheck className="w-4 h-4" /> 100% Private & Client-Side
            </span>
          </div>

          {/* Hero Header */}
          <div className="text-center max-w-3xl mx-auto mb-12">
            <PdfToolIcon toolId="bmi-calculator" size="xl" className="mx-auto mb-4" />
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-4 shadow-sm">
              <Scale className="w-4 h-4" />
              <span>Smart Fitness & Health Tool</span>
            </div>
            
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 dark:text-white mb-3 uppercase leading-none">
              BMI Calculator
            </h1>
            <p className="text-emerald-600 dark:text-emerald-400 text-sm sm:text-base font-extrabold uppercase tracking-widest mb-4">
              Calculate Body Mass Index & Ideal Healthy Weight
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
                <Zap className="w-3.5 h-3.5 text-emerald-500" /> Instant Results
              </span>
              <span className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-gray-400 bg-white/60 dark:bg-white/5 px-3 py-1.5 rounded-full border border-slate-200 dark:border-white/5">
                <Target className="w-3.5 h-3.5 text-emerald-500" /> WHO Standard Gauge
              </span>
            </div>
          </div>

          {/* Calculator Section */}
          <div id="calculator-section" className="flex flex-col lg:flex-row gap-8 mb-16">
            
            {/* Inputs Panel */}
            <div className="w-full lg:w-5/12 space-y-6 shrink-0">
              <div className="glass rounded-[2.5rem] border border-slate-200/80 dark:border-white/5 shadow-2xl p-6 sm:p-8 bg-white dark:bg-white/[0.01]">
                
                {/* Panel Header */}
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/5 pb-4 mb-6">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">Your Body Metrics</h3>
                  </div>
                  <button 
                    onClick={handleReset}
                    className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                  >
                    <RefreshCw className="w-3 h-3" /> Reset
                  </button>
                </div>

                {/* Unit Switcher */}
                <div className="mb-8">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-500 mb-2 block">Unit System</span>
                  <div className="grid grid-cols-2 p-1.5 bg-slate-100 dark:bg-black/40 rounded-2xl border border-slate-200 dark:border-white/10 relative">
                    <button
                      onClick={() => handleUnitModeChange('metric')}
                      className={`relative z-10 py-2.5 text-xs font-extrabold uppercase tracking-wider rounded-xl transition-all ${
                        unitMode === 'metric' ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      Metric (kg, cm)
                    </button>
                    <button
                      onClick={() => handleUnitModeChange('imperial')}
                      className={`relative z-10 py-2.5 text-xs font-extrabold uppercase tracking-wider rounded-xl transition-all ${
                        unitMode === 'imperial' ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      Imperial (lbs, ft+in)
                    </button>

                    {/* Active Background Pill */}
                    <motion.div
                      className="absolute inset-y-1.5 rounded-xl bg-white dark:bg-white/10 shadow-sm border border-slate-200 dark:border-white/10"
                      initial={false}
                      animate={{
                        left: unitMode === 'metric' ? '0.375rem' : '50%',
                        width: 'calc(50% - 0.375rem)'
                      }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  </div>
                </div>

                {/* Optional Controls: Gender & Age */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                  {/* Gender Selector */}
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-500 mb-2 block">Gender (Optional)</span>
                    <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-black/40 rounded-xl border border-slate-200 dark:border-white/10">
                      <button
                        onClick={() => setGender('male')}
                        className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${
                          gender === 'male' 
                            ? 'bg-white dark:bg-white/10 text-blue-600 dark:text-blue-400 shadow-sm font-black' 
                            : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        ♂️ Male
                      </button>
                      <button
                        onClick={() => setGender('female')}
                        className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${
                          gender === 'female' 
                            ? 'bg-white dark:bg-white/10 text-pink-600 dark:text-pink-400 shadow-sm font-black' 
                            : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        ♀️ Female
                      </button>
                    </div>
                  </div>

                  {/* Age Field */}
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-500 mb-2 block">Age (Years)</span>
                    <div className="relative flex items-center">
                      <input
                        type="number"
                        min={2}
                        max={120}
                        value={age}
                        onChange={(e) => setAge(Math.max(2, Math.min(120, Number(e.target.value) || 2)))}
                        className="w-full bg-slate-100 dark:bg-black/40 border border-slate-300 dark:border-white/10 rounded-xl py-2 px-3 text-slate-900 dark:text-white font-mono text-sm font-bold text-center focus:outline-none focus:border-emerald-500/50"
                      />
                      <span className="absolute right-3 text-xs font-bold text-slate-500 dark:text-gray-500 pointer-events-none">Yrs</span>
                    </div>
                  </div>
                </div>

                {/* Input Fields depending on Unit System */}
                <div className="space-y-8">
                  {unitMode === 'metric' ? (
                    <>
                      {/* Weight (kg) */}
                      <InputSlider 
                        label="Weight"
                        helperText="Enter your body weight in Kilograms (kg)."
                        icon={Scale}
                        min={10}
                        max={300}
                        step={0.5}
                        value={weightKg}
                        onChange={setWeightKg}
                        suffix="kg"
                        placeholder="70"
                        presets={[
                          { label: "50kg", value: 50 },
                          { label: "60kg", value: 60 },
                          { label: "70kg", value: 70 },
                          { label: "80kg", value: 80 },
                          { label: "90kg", value: 90 },
                          { label: "100kg", value: 100 },
                        ]}
                      />

                      {/* Height (cm) */}
                      <InputSlider 
                        label="Height"
                        helperText="Enter your standing height in Centimeters (cm)."
                        icon={Activity}
                        min={50}
                        max={250}
                        step={1}
                        value={heightCm}
                        onChange={setHeightCm}
                        suffix="cm"
                        placeholder="172"
                        presets={[
                          { label: "150cm", value: 150 },
                          { label: "160cm", value: 160 },
                          { label: "170cm", value: 170 },
                          { label: "180cm", value: 180 },
                          { label: "190cm", value: 190 },
                        ]}
                      />
                    </>
                  ) : (
                    <>
                      {/* Weight (lbs) */}
                      <InputSlider 
                        label="Weight"
                        helperText="Enter your body weight in Pounds (lbs)."
                        icon={Scale}
                        min={22}
                        max={660}
                        step={1}
                        value={weightLbs}
                        onChange={setWeightLbs}
                        suffix="lbs"
                        placeholder="154"
                        presets={[
                          { label: "110lbs", value: 110 },
                          { label: "130lbs", value: 130 },
                          { label: "150lbs", value: 150 },
                          { label: "180lbs", value: 180 },
                          { label: "220lbs", value: 220 },
                        ]}
                      />

                      {/* Height (Feet & Inches) */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Activity className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                          <label className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">Height (Ft & In)</label>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          {/* Feet */}
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-gray-500 pl-1">Feet</span>
                            <div className="relative flex items-center">
                              <input
                                type="number"
                                min={1}
                                max={8}
                                value={heightFt}
                                onChange={(e) => setHeightFt(Math.max(1, Math.min(8, Number(e.target.value) || 1)))}
                                className="w-full bg-slate-100 dark:bg-black/40 border border-slate-300 dark:border-white/10 rounded-xl py-3 px-4 text-slate-900 dark:text-white font-mono text-lg text-center focus:outline-none focus:border-emerald-500/50"
                              />
                              <span className="absolute right-4 text-xs font-bold text-slate-500 dark:text-emerald-400">ft</span>
                            </div>
                          </div>

                          {/* Inches */}
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-gray-500 pl-1">Inches</span>
                            <div className="relative flex items-center">
                              <input
                                type="number"
                                min={0}
                                max={11}
                                value={heightIn}
                                onChange={(e) => setHeightIn(Math.max(0, Math.min(11, Number(e.target.value) || 0)))}
                                className="w-full bg-slate-100 dark:bg-black/40 border border-slate-300 dark:border-white/10 rounded-xl py-3 px-4 text-slate-900 dark:text-white font-mono text-lg text-center focus:outline-none focus:border-emerald-500/50"
                              />
                              <span className="absolute right-4 text-xs font-bold text-slate-500 dark:text-emerald-400">in</span>
                            </div>
                          </div>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-gray-400 font-medium">Example: 5 ft 8 in = ~172 cm.</p>
                      </div>
                    </>
                  )}
                </div>

              </div>
            </div>

            {/* Results & Health Insights Panel */}
            <div className="w-full lg:w-7/12 flex flex-col gap-6">
              
              {/* Primary BMI Display Card */}
              <div className="glass rounded-[2.5rem] border border-slate-200/80 dark:border-white/5 shadow-2xl overflow-hidden bg-white dark:bg-white/[0.01] relative group h-full flex flex-col justify-between">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none transition-transform group-hover:scale-110 duration-700" />
                
                <div className="p-8 sm:p-10 relative z-10 flex-grow flex flex-col justify-between">
                  
                  {/* Top Bar */}
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-2">
                      <Target className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">🎯 BMI Results</span>
                    </div>
                    <button 
                      onClick={handleCopy}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-xs font-bold text-slate-700 dark:text-gray-300 transition-colors border border-slate-200 dark:border-white/10 shadow-sm"
                    >
                      {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied ? 'Copied!' : 'Share Score'}
                    </button>
                  </div>

                  {/* Main Score Number & Category Badge */}
                  <div className="mb-10 text-center px-2">
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-gray-400 mb-2 block">Your Body Mass Index</span>
                    
                    <motion.div 
                      key={results.bmi}
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-6xl sm:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-600 dark:from-white dark:via-emerald-100 dark:to-emerald-400 tracking-tight leading-none break-all drop-shadow-sm mb-4"
                    >
                      {results.bmi || "0.0"}
                    </motion.div>

                    {/* Category Status Badge */}
                    <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full border shadow-sm max-w-full" style={{ backgroundColor: `${results.cat.color}15`, borderColor: `${results.cat.color}40` }}>
                      <span className="text-base">{results.cat.icon}</span>
                      <span className="text-sm sm:text-base font-extrabold uppercase tracking-wider" style={{ color: results.cat.color }}>
                        {results.cat.label} ({results.cat.rangeText})
                      </span>
                    </div>
                  </div>

                  {/* Interactive Multi-Colored WHO Spectrum Gauge */}
                  <div className="space-y-3 mb-8 bg-slate-50 dark:bg-black/40 border border-slate-200/80 dark:border-white/5 rounded-3xl p-6 shadow-inner dark:shadow-none">
                    <div className="flex justify-between items-center text-xs font-bold text-slate-600 dark:text-gray-400 uppercase tracking-widest">
                      <span>WHO BMI Scale Gauge</span>
                      <span className="font-mono text-emerald-600 dark:text-emerald-400 font-extrabold">BMI {results.bmi}</span>
                    </div>

                    {/* Colored Spectrum Bar */}
                    <div className="relative w-full h-4 rounded-full overflow-hidden flex shadow-inner">
                      {/* Underweight */}
                      <div className="w-[20%] bg-cyan-500 h-full" title="Underweight (<18.5)" />
                      {/* Normal */}
                      <div className="w-[25%] bg-emerald-500 h-full" title="Normal (18.5 - 24.9)" />
                      {/* Overweight */}
                      <div className="w-[20%] bg-amber-500 h-full" title="Overweight (25 - 29.9)" />
                      {/* Obese */}
                      <div className="w-[35%] bg-rose-500 h-full" title="Obese (30+)" />
                    </div>

                    {/* Pointer Pin Knob Indicator */}
                    <div className="relative w-full h-5">
                      <motion.div 
                        className="absolute top-0 -ml-2.5 flex flex-col items-center"
                        animate={{ left: `${results.gaugePercentage}%` }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      >
                        {/* Upward Triangle Pin */}
                        <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[8px] border-b-slate-900 dark:border-b-white" />
                        <div className="w-3 h-3 rounded-full bg-slate-900 dark:bg-white shadow-md border-2 border-emerald-500" />
                      </motion.div>
                    </div>

                    {/* Scale Range Labels */}
                    <div className="grid grid-cols-4 text-[10px] sm:text-xs font-bold text-center pt-1 border-t border-slate-200 dark:border-white/5">
                      <span className="text-cyan-600 dark:text-cyan-400">Underweight<br/><span className="font-mono opacity-80">&lt;18.5</span></span>
                      <span className="text-emerald-600 dark:text-emerald-400">Normal<br/><span className="font-mono opacity-80">18.5-24.9</span></span>
                      <span className="text-amber-600 dark:text-amber-400">Overweight<br/><span className="font-mono opacity-80">25-29.9</span></span>
                      <span className="text-rose-600 dark:text-rose-400">Obese<br/><span className="font-mono opacity-80">30+</span></span>
                    </div>
                  </div>

                  {/* Ideal Healthy Weight Range & Advice Card */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    {/* Ideal Weight Range */}
                    <div className="bg-slate-50 dark:bg-black/40 border border-slate-200/80 dark:border-white/5 rounded-2xl p-5">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-500 block mb-1">Ideal Weight Range</span>
                      <p className="text-lg sm:text-xl font-black text-slate-900 dark:text-white font-mono">
                        {unitMode === 'metric' 
                          ? `${results.minHealthyWeightKg} kg – ${results.maxHealthyWeightKg} kg`
                          : `${Math.round(results.minHealthyWeightKg * 2.20462)} lbs – ${Math.round(results.maxHealthyWeightKg * 2.20462)} lbs`
                        }
                      </p>
                      
                      {/* Weight Adjustment Hint */}
                      {results.weightDiffKg === 0 ? (
                        <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-2 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> Perfect healthy weight range!
                        </p>
                      ) : results.categoryKey === 'underweight' ? (
                        <p className="text-xs font-bold text-cyan-600 dark:text-cyan-400 mt-2 flex items-center gap-1">
                          <ArrowRight className="w-3.5 h-3.5 shrink-0" /> Gain ~{unitMode === 'metric' ? `${results.weightDiffKg} kg` : `${Math.round(results.weightDiffKg * 2.20462)} lbs`} for Normal BMI
                        </p>
                      ) : (
                        <p className="text-xs font-bold text-amber-600 dark:text-amber-400 mt-2 flex items-center gap-1">
                          <ArrowRight className="w-3.5 h-3.5 shrink-0" /> Lose ~{unitMode === 'metric' ? `${results.weightDiffKg} kg` : `${Math.round(results.weightDiffKg * 2.20462)} lbs`} for Normal BMI
                        </p>
                      )}
                    </div>

                    {/* Personalized Health Tip */}
                    <div className="bg-slate-50 dark:bg-black/40 border border-slate-200/80 dark:border-white/5 rounded-2xl p-5">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-500 block mb-1">Health Insight</span>
                      <p className="text-xs text-slate-700 dark:text-gray-300 font-medium leading-relaxed">
                        {results.cat.healthTip}
                      </p>
                    </div>

                  </div>

                </div>
              </div>

              {/* Advanced Fitness Metrics Collapsible Section */}
              <div className="glass rounded-[2rem] border border-slate-200/80 dark:border-white/5 overflow-hidden bg-white dark:bg-white/[0.01] shadow-md dark:shadow-none">
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="w-full p-5 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">Advanced Fitness Indices (BMI Prime, Ponderal Index, BSA)</span>
                  </div>
                  {showAdvanced ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                </button>

                <AnimatePresence>
                  {showAdvanced && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-slate-200 dark:border-white/5 p-6 bg-slate-50/50 dark:bg-black/20"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                        {/* BMI Prime */}
                        <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-xl p-4 shadow-sm">
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-400 block mb-1">BMI Prime</span>
                          <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">{results.bmiPrime}</span>
                          <p className="text-[10px] text-slate-500 dark:text-gray-400 mt-1">&lt; 0.74 Under, 1.0 Upper Normal</p>
                        </div>

                        {/* Ponderal Index */}
                        <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-xl p-4 shadow-sm">
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-400 block mb-1">Ponderal Index</span>
                          <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">{results.ponderalIndex} <span className="text-xs">kg/m³</span></span>
                          <p className="text-[10px] text-slate-500 dark:text-gray-400 mt-1">Normal: 11 – 15 kg/m³</p>
                        </div>

                        {/* Body Surface Area */}
                        <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-xl p-4 shadow-sm">
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-400 block mb-1">Body Surface Area</span>
                          <span className="text-2xl font-black text-blue-600 dark:text-blue-400 font-mono">{results.bsa} <span className="text-xs">m²</span></span>
                          <p className="text-[10px] text-slate-500 dark:text-gray-400 mt-1">Mosteller Formula</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Medical Disclaimer Box */}
              <div className="glass rounded-2xl border border-amber-300/60 dark:border-amber-500/20 p-4 bg-amber-50/60 dark:bg-amber-500/10 text-amber-900 dark:text-amber-300 flex items-start gap-3 text-xs font-medium shadow-sm">
                <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <p>
                  <strong>Medical Disclaimer:</strong> This BMI tool is for educational and informational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment. Body composition, muscle density, bone structure, and medical history should be evaluated by a healthcare professional.
                </p>
              </div>

            </div>

          </div>

          {/* Educational Content & WHO Table Section */}
          <section id="learn-more-section" className="py-16 border-t border-slate-200 dark:border-white/5 mt-16 pt-16">
            
            {/* Header */}
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-emerald-600 dark:text-emerald-400 text-xs font-black tracking-widest mb-4">
                <BookOpen className="w-4 h-4" />
                <span>WHO Reference Standards</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight uppercase mb-4">
                📚 Official WHO Body Mass Index Categories
              </h2>
              <p className="text-slate-600 dark:text-gray-400 text-base sm:text-lg font-medium leading-relaxed">
                The World Health Organization (WHO) classifies adult weight status based on Body Mass Index (BMI).
              </p>
            </div>

            {/* WHO Table */}
            <div className="glass rounded-[2.5rem] border border-slate-200/80 dark:border-white/5 shadow-2xl p-6 sm:p-10 bg-white dark:bg-white/[0.01] mb-16 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-white/10">
                      <th className="py-4 px-4 text-xs font-black text-slate-600 dark:text-gray-400 uppercase tracking-widest">BMI Range (kg/m²)</th>
                      <th className="py-4 px-4 text-xs font-black text-slate-600 dark:text-gray-400 uppercase tracking-widest">WHO Category</th>
                      <th className="py-4 px-4 text-xs font-black text-slate-600 dark:text-gray-400 uppercase tracking-widest">Health Risk Level</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-200/60 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 px-4 text-sm font-mono font-bold text-cyan-600 dark:text-cyan-400">&lt; 18.5</td>
                      <td className="py-4 px-4 text-sm font-bold text-slate-900 dark:text-white">Underweight</td>
                      <td className="py-4 px-4 text-xs text-slate-600 dark:text-gray-400 font-medium">Increased risk of nutritional deficiency & osteoporosis</td>
                    </tr>
                    <tr className="border-b border-slate-200/60 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors bg-emerald-500/5">
                      <td className="py-4 px-4 text-sm font-mono font-black text-emerald-600 dark:text-emerald-400">18.5 – 24.9</td>
                      <td className="py-4 px-4 text-sm font-black text-emerald-700 dark:text-emerald-400">Normal Weight (Optimal)</td>
                      <td className="py-4 px-4 text-xs text-emerald-700 dark:text-emerald-300 font-bold">Lowest overall health risk</td>
                    </tr>
                    <tr className="border-b border-slate-200/60 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 px-4 text-sm font-mono font-bold text-amber-600 dark:text-amber-400">25.0 – 29.9</td>
                      <td className="py-4 px-4 text-sm font-bold text-slate-900 dark:text-white">Overweight</td>
                      <td className="py-4 px-4 text-xs text-slate-600 dark:text-gray-400 font-medium">Increased risk of heart disease & high blood pressure</td>
                    </tr>
                    <tr className="border-b border-slate-200/60 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 px-4 text-sm font-mono font-bold text-rose-600 dark:text-rose-400">30.0 – 34.9</td>
                      <td className="py-4 px-4 text-sm font-bold text-slate-900 dark:text-white">Obese (Class I)</td>
                      <td className="py-4 px-4 text-xs text-slate-600 dark:text-gray-400 font-medium">Moderate health risk</td>
                    </tr>
                    <tr className="border-b border-slate-200/60 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 px-4 text-sm font-mono font-bold text-red-600 dark:text-red-400">35.0 – 39.9</td>
                      <td className="py-4 px-4 text-sm font-bold text-slate-900 dark:text-white">Obese (Class II)</td>
                      <td className="py-4 px-4 text-xs text-slate-600 dark:text-gray-400 font-medium">Severe health risk</td>
                    </tr>
                    <tr className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 px-4 text-sm font-mono font-bold text-red-700 dark:text-red-400">&ge; 40.0</td>
                      <td className="py-4 px-4 text-sm font-bold text-slate-900 dark:text-white">Severe Obesity (Class III)</td>
                      <td className="py-4 px-4 text-xs text-slate-600 dark:text-gray-400 font-medium">Very high risk of chronic conditions</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Educational Article Section */}
            {article && <ToolArticle {...article} />}

          </section>

        </div>
      </div>
    </ToolVisibilityGuard>
  );
}
