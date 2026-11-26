"use client";

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import {
  FileText, Download, Sparkles, RefreshCw, Copy, CheckCircle,
  AlertCircle, Building, User, Settings, AlignLeft, ChevronLeft,
  Palette, Type, Printer, Sliders, Briefcase, GraduationCap,
  PenTool, Eye, Check, ExternalLink, Globe, MapPin, Mail, Phone,
  ArrowRight, ArrowLeft
} from 'lucide-react';
import ToolArticle from '@/components/ToolArticle';
import { toolArticles } from '@/data/toolArticles';
import PdfToolIcon from '@/components/PdfToolIcon';

type ExperienceLevel = 'Fresher' | '1-2 years' | '3-5 years' | '5+ years';
type WritingTone = 'Professional' | 'Confident' | 'Friendly' | 'Short';
type TemplateId = 'modern' | 'executive' | 'split' | 'creative' | 'classic';
type FontStyle = 'sans' | 'serif' | 'mono';

interface CoverLetterData {
  name: string;
  email: string;
  phone: string;
  location: string;
  portfolio: string;
  jobTitle: string;
  companyName: string;
  hiringManager: string;
  companyAddress: string;
  experience: ExperienceLevel;
  skills: string;
  keyAchievement: string;
  whyCompany: string;
  jobDescription: string;
  tone: WritingTone;
}

const ACCENT_COLORS = [
  { id: 'navy', name: 'Executive Navy', hex: '#1E3A8A', light: '#EFF6FF', border: '#93C5FD' },
  { id: 'emerald', name: 'Emerald Forest', hex: '#065F46', light: '#ECFDF5', border: '#6EE7B7' },
  { id: 'indigo', name: 'Royal Indigo', hex: '#4338CA', light: '#EEF2FF', border: '#A5B4FC' },
  { id: 'burgundy', name: 'Burgundy Wine', hex: '#991B1B', light: '#FEF2F2', border: '#FCA5A5' },
  { id: 'slate', name: 'Charcoal Slate', hex: '#334155', light: '#F8FAFC', border: '#CBD5E1' },
  { id: 'teal', name: 'Deep Teal', hex: '#0F766E', light: '#F0FDFA', border: '#5EEAD4' },
];

const PRESETS: { title: string; desc: string; icon: any; data: CoverLetterData }[] = [
  {
    title: 'Senior Software Engineer',
    desc: 'Tech & Architecture',
    icon: Briefcase,
    data: {
      name: 'Alex Morgan',
      email: 'alex.morgan@example.com',
      phone: '+1 (555) 234-5678',
      location: 'San Francisco, CA',
      portfolio: 'alexmorgan.dev',
      jobTitle: 'Senior Frontend Engineer',
      companyName: 'TechFlow Innovations',
      hiringManager: 'Sarah Jenkins, Head of Engineering',
      companyAddress: '450 Mission St, San Francisco, CA',
      experience: '5+ years',
      skills: 'React, Next.js, TypeScript, Web Performance, Distributed Systems',
      keyAchievement: 'Architected a real-time analytics dashboard that reduced render latency by 42% across 2M+ active sessions.',
      whyCompany: 'I have followed TechFlow\'s contributions to open-source tooling for years and deeply admire your focus on high-performance web standards.',
      jobDescription: 'Seeking an experienced frontend engineer proficient in modern TypeScript, web state architecture, and accessible UI engineering.',
      tone: 'Confident',
    },
  },
  {
    title: 'Product Marketing Manager',
    desc: 'Growth & Strategy',
    icon: Sliders,
    data: {
      name: 'Elena Rostova',
      email: 'elena.rostova@example.com',
      phone: '+1 (555) 345-6789',
      location: 'New York, NY',
      portfolio: 'linkedin.com/in/elenarostova',
      jobTitle: 'Product Marketing Lead',
      companyName: 'FinPulse Software',
      hiringManager: 'David Vance, VP of Marketing',
      companyAddress: 'One World Trade, New York, NY',
      experience: '3-5 years',
      skills: 'Go-To-Market Strategy, B2B SaaS Positioning, User Segmentation, Product Launches',
      keyAchievement: 'Spearheaded the enterprise tier launch that grew inbound pipeline by 38% in the first two quarters.',
      whyCompany: 'Your customer-first ethos and recent expansion into frictionless cross-border payments make FinPulse the most exciting product in fintech.',
      jobDescription: 'Looking for a dynamic PMM to define product messaging, run collaborative launches, and articulate core user value propositions.',
      tone: 'Professional',
    },
  },
  {
    title: 'Junior Analyst / Graduate',
    desc: 'Entry-Level & Fresher',
    icon: GraduationCap,
    data: {
      name: 'Jordan Lee',
      email: 'jordan.lee@alumni.edu',
      phone: '+1 (555) 456-7890',
      location: 'Austin, TX',
      portfolio: 'github.com/jordan-analytics',
      jobTitle: 'Junior Data Analyst',
      companyName: 'Apex Analytics Group',
      hiringManager: 'Campus Recruiting Team',
      companyAddress: '100 Congress Ave, Austin, TX',
      experience: 'Fresher',
      skills: 'Python, SQL, Tableau, Statistical Modeling, Data Visualization',
      keyAchievement: 'Developed a predictive retention model for university housing data achieving an 89% accuracy rate during my senior honors project.',
      whyCompany: 'Apex is celebrated for its mentorship culture, and I am eager to apply my analytical foundation to high-impact client engagements.',
      jobDescription: 'Entry-level analyst to clean data pipelines, generate stakeholder reporting dashboards, and extract actionable insights.',
      tone: 'Friendly',
    },
  },
];

export default function CoverLetterGenerator() {
  const [data, setData] = useState<CoverLetterData>(PRESETS[0].data);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [template, setTemplate] = useState<TemplateId>('modern');
  const [accentColor, setAccentColor] = useState(ACCENT_COLORS[0]);
  const [fontStyle, setFontStyle] = useState<FontStyle>('sans');

  const [generatedLetter, setGeneratedLetter] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isEditingDirectly, setIsEditingDirectly] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize with initial generated letter
  useEffect(() => {
    setGeneratedLetter(createLocalCoverLetter(PRESETS[0].data));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
  };

  const loadPreset = (preset: typeof PRESETS[0]) => {
    setData(preset.data);
    const letter = createLocalCoverLetter(preset.data);
    setGeneratedLetter(letter);
    setError(null);
  };

  function createLocalCoverLetter(d: CoverLetterData): string {
    const today = new Date().toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });

    const manager = d.hiringManager.trim() || 'Hiring Manager';
    const company = d.companyName.trim() || 'your organization';
    const role = d.jobTitle.trim() || 'this position';

    let salutation = `Dear ${manager},`;
    if (!d.hiringManager.trim()) {
      salutation = `Dear Hiring Team at ${company},`;
    }

    // Opening Hook
    let hook = `I am writing to express my strong enthusiasm for the ${role} opening at ${company}. `;
    if (d.tone === 'Confident') {
      hook = `With a consistent track record of delivering measurable results in ${d.skills ? d.skills.split(',')[0].trim() : 'engineering'}, I am eager to bring my capabilities to the ${role} position at ${company}. `;
    } else if (d.tone === 'Friendly') {
      hook = `I was delighted to discover the ${role} opening at ${company}. Having followed your recent milestones, I knew immediately that this was an opportunity where my background and energy could make an authentic difference. `;
    } else if (d.tone === 'Short') {
      hook = `I am applying for the ${role} position at ${company}. `;
    }

    // Body Paragraph 1: Experience & Skills
    let expText = `Over ${d.experience} in the field`;
    if (d.experience === 'Fresher') expText = 'Throughout my rigorous academic training and hands-on projects';
    else if (d.experience === '5+ years') expText = 'With over five years of dedicated professional experience';

    let body1 = `${expText}, I have developed deep expertise in ${d.skills || 'core industry methodologies'}. I pride myself on solving complex problems with pragmatic, scalable solutions. `;
    if (d.keyAchievement) {
      body1 += `In my recent work, I ${d.keyAchievement.trim().replace(/\.$/, '')}, which reinforced my commitment to operational excellence. `;
    }

    // Body Paragraph 2: Tailoring to Company
    let body2 = '';
    if (d.whyCompany) {
      body2 = `What excites me most about ${company} is that ${d.whyCompany.trim().replace(/\.$/, '')}. I thrive in collaborative environments where ownership and high standards are paramount, and your team's mission directly mirrors my professional values. `;
    } else {
      body2 = `I am particularly motivated by ${company}'s forward-thinking approach and collaborative reputation. I am confident that my technical proficiency and proactive mindset will allow me to integrate smoothly and deliver value from day one. `;
    }

    // Closing CTA
    let closing = `I would welcome the opportunity to discuss in greater detail how my qualifications and enthusiasm align with your goals for the ${role}. Thank you very much for your time and consideration.`;
    if (d.tone === 'Short') {
      closing = `I look forward to the possibility of discussing this role with you. Thank you for your consideration.`;
    }

    return `${today}\n\n${manager}\n${company}\n${d.companyAddress ? d.companyAddress + '\n' : ''}\n${salutation}\n\n${hook}${body1}\n\n${body2}\n\n${closing}\n\nSincerely,\n\n${d.name || 'Your Name'}`;
  }

  // Navigation handlers with validation
  const goToStep = (step: number) => {
    if (step > currentStep) {
      if (currentStep === 1 && !data.name.trim()) {
        setError('Please provide your full name before proceeding.');
        return;
      }
      if (currentStep === 2 && (!data.jobTitle.trim() || !data.companyName.trim())) {
        setError('Job title and company name are required to continue.');
        return;
      }
    }
    setError(null);
    setCurrentStep(step);
  };

  const handleGenerate = async () => {
    if (!data.name.trim()) {
      setError('Please provide your full name.');
      setCurrentStep(1);
      return;
    }
    if (!data.jobTitle.trim()) {
      setError('Please specify the target job title.');
      setCurrentStep(2);
      return;
    }
    if (!data.companyName.trim()) {
      setError('Please specify the company name.');
      setCurrentStep(2);
      return;
    }

    setError(null);
    setIsGenerating(true);

    try {
      const response = await fetch('/api/ai/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: 'cover-letter-generator',
          inputs: {
            applicantName: data.name,
            email: data.email,
            phone: data.phone,
            location: data.location,
            portfolio: data.portfolio,
            jobTitle: data.jobTitle,
            companyName: data.companyName,
            hiringManager: data.hiringManager,
            companyAddress: data.companyAddress,
            experience: data.experience,
            skills: data.skills,
            keyAchievement: data.keyAchievement,
            whyCompany: data.whyCompany,
            jobDescription: data.jobDescription,
            tone: data.tone,
          },
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.output && result.output.trim().length > 50) {
          const cleaned = result.output
            .replace(/^```[a-z]*\n/i, '')
            .replace(/\n```$/, '')
            .trim();
          setGeneratedLetter(cleaned);
          setIsGenerating(false);
          return;
        }
      }

      // Smooth graceful fallback to intelligent local template
      const fallbackLetter = createLocalCoverLetter(data);
      setGeneratedLetter(fallbackLetter);
    } catch (err) {
      console.warn('AI service offline, using client generator:', err);
      const fallbackLetter = createLocalCoverLetter(data);
      setGeneratedLetter(fallbackLetter);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resetForm = () => {
    setData({
      name: '',
      email: '',
      phone: '',
      location: '',
      portfolio: '',
      jobTitle: '',
      companyName: '',
      hiringManager: '',
      companyAddress: '',
      experience: 'Fresher',
      skills: '',
      keyAchievement: '',
      whyCompany: '',
      jobDescription: '',
      tone: 'Professional',
    });
    setGeneratedLetter('');
    setError(null);
    setCurrentStep(1);
  };

  const downloadPDF = async () => {
    if (!generatedLetter) return;
    setIsDownloading(true);

    try {
      const element = document.getElementById('letter-preview-sheet');
      if (!element) return;

      const originalWidth = element.style.width;
      const originalMinWidth = element.style.minWidth;
      const originalMaxWidth = element.style.maxWidth;

      element.style.width = '794px';
      element.style.minWidth = '794px';
      element.style.maxWidth = '794px';

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        windowWidth: 794,
      });

      element.style.width = originalWidth;
      element.style.minWidth = originalMinWidth;
      element.style.maxWidth = originalMaxWidth;

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      const safeName = (data.name.trim() || 'Cover_Letter').replace(/\s+/g, '_');
      pdf.save(`${safeName}_Cover_Letter.pdf`);
    } catch (err) {
      console.error(err);
      setError('Failed to generate PDF. You can also use the Print button to save as PDF.');
    } finally {
      setIsDownloading(false);
    }
  };

  const printDocument = () => {
    window.print();
  };

  const wordCount = generatedLetter.trim() ? generatedLetter.trim().split(/\s+/).length : 0;
  const readingTime = Math.max(1, Math.round(wordCount / 200));

  const fontClass =
    fontStyle === 'serif'
      ? 'font-serif'
      : fontStyle === 'mono'
      ? 'font-mono'
      : 'font-sans';

  const STEPS = [
    { step: 1, title: 'Your Details', subtitle: 'Name & Contact' },
    { step: 2, title: 'Target Role', subtitle: 'Company & Role' },
    { step: 3, title: 'Story & Tone', subtitle: 'Skills & AI Voice' },
  ];

  return (
    <div className="bg-[#F8FAFC] dark:bg-[#030712] min-h-screen py-10 relative overflow-hidden transition-colors font-sans">
      {/* Background Ambience */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gradient-to-b from-blue-500/10 via-indigo-500/5 to-transparent blur-[140px] -z-10 pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
        {/* Navigation Breadcrumb */}
        <Link
          href="/tools/"
          className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-blue-600 transition-colors mb-6 group"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Directory
        </Link>

        {/* HERO HEADER */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-3xl p-6 sm:p-8 mb-8 border border-slate-200/80 dark:border-white/10 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-start sm:items-center gap-4">
              <PdfToolIcon toolId="cover-letter-generator" size="xl" className="shrink-0" />
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                    AI Cover Letter Generator
                  </h1>
                  <span className="px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-full">
                    Free • Step-by-Step
                  </span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 font-medium mt-1">
                  Guided 3-step wizard to craft tailored, ATS-friendly cover letters in seconds.
                </p>
              </div>
            </div>

            {/* Quick Preset Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mr-1">
                Try Examples:
              </span>
              {PRESETS.map((preset) => (
                <button
                  key={preset.title}
                  type="button"
                  onClick={() => loadPreset(preset)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/10 transition-all flex items-center gap-1.5"
                >
                  <preset.icon className="w-3.5 h-3.5 text-blue-500" />
                  {preset.title.split(' ')[0]}
                </button>
              ))}
              <button
                type="button"
                onClick={resetForm}
                className="px-3 py-1.5 text-xs font-bold rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors ml-auto"
              >
                Clear
              </button>
            </div>
          </div>

          {error && (
            <div className="mt-4 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 p-3.5 rounded-2xl flex items-center gap-3 border border-red-200 dark:border-red-900/50 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* MAIN BUILDER WORKSPACE */}
        <div className="flex flex-col lg:flex-row gap-8 items-start mb-16">

          {/* LEFT: STEP-BY-STEP GUIDED WIZARD */}
          <div className="w-full lg:w-[46%] space-y-6">

            {/* STEP PROGRESS INDICATOR TABS */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-3 border border-slate-200 dark:border-white/10 shadow-sm">
              <div className="grid grid-cols-3 gap-2">
                {STEPS.map((s) => {
                  const isActive = currentStep === s.step;
                  const isCompleted = currentStep > s.step;
                  return (
                    <button
                      key={s.step}
                      type="button"
                      onClick={() => goToStep(s.step)}
                      className={`flex flex-col sm:flex-row items-center gap-2 p-2.5 rounded-2xl transition-all text-left ${
                        isActive
                          ? 'bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 text-blue-700 dark:text-blue-300 shadow-xs'
                          : isCompleted
                          ? 'bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50'
                          : 'text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5'
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 transition-all ${
                          isActive
                            ? 'bg-blue-600 text-white shadow-xs shadow-blue-500/40'
                            : isCompleted
                            ? 'bg-emerald-500 text-white'
                            : 'bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {isCompleted ? '✓' : s.step}
                      </div>
                      <div className="min-w-0 text-center sm:text-left">
                        <p className="text-xs font-bold truncate leading-tight">{s.title}</p>
                        <p className="text-[10px] opacity-75 hidden sm:block truncate">{s.subtitle}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Progress bar line */}
              <div className="w-full bg-slate-100 dark:bg-white/5 h-1.5 rounded-full mt-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full transition-all duration-300 rounded-full"
                  style={{ width: `${(currentStep / 3) * 100}%` }}
                />
              </div>
            </div>

            {/* STEP 1: APPLICANT CONTACT INFO */}
            {currentStep === 1 && (
              <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-white/10 shadow-sm animate-fade-in">
                <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-slate-100 dark:border-white/5">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs">
                    1
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">Your Contact Details</h2>
                    <p className="text-xs text-slate-400">Step 1 of 3: How the employer can reach you</p>
                  </div>
                </div>

                <div className="space-y-3.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={data.name}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-900 outline-none text-sm text-slate-900 dark:text-white transition-all"
                      placeholder="e.g. Alex Morgan"
                      autoFocus
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                        Email Address
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={data.email}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-900 outline-none text-sm text-slate-900 dark:text-white transition-all"
                        placeholder="alex@example.com"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                        Phone Number
                      </label>
                      <input
                        type="text"
                        name="phone"
                        value={data.phone}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-900 outline-none text-sm text-slate-900 dark:text-white transition-all"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                        City, Country / State
                      </label>
                      <input
                        type="text"
                        name="location"
                        value={data.location}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-900 outline-none text-sm text-slate-900 dark:text-white transition-all"
                        placeholder="e.g. San Francisco, CA"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                        Portfolio / LinkedIn URL
                      </label>
                      <input
                        type="text"
                        name="portfolio"
                        value={data.portfolio}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-900 outline-none text-sm text-slate-900 dark:text-white transition-all"
                        placeholder="linkedin.com/in/alex"
                      />
                    </div>
                  </div>
                </div>

                {/* Step 1 Footer Action */}
                <div className="mt-8 pt-4 border-t border-slate-100 dark:border-white/5 flex justify-end">
                  <button
                    type="button"
                    onClick={() => goToStep(2)}
                    className="px-6 py-3 rounded-2xl font-bold text-sm text-white bg-blue-600 hover:bg-blue-500 active:scale-[0.99] transition-all shadow-md shadow-blue-500/20 flex items-center gap-2"
                  >
                    <span>Next: Target Role</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </section>
            )}

            {/* STEP 2: TARGET ROLE & COMPANY */}
            {currentStep === 2 && (
              <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-white/10 shadow-sm animate-fade-in">
                <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-slate-100 dark:border-white/5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs">
                    2
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">Target Position & Company</h2>
                    <p className="text-xs text-slate-400">Step 2 of 3: Details about the role and recipient</p>
                  </div>
                </div>

                <div className="space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                        Target Job Title *
                      </label>
                      <input
                        type="text"
                        name="jobTitle"
                        value={data.jobTitle}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-900 outline-none text-sm text-slate-900 dark:text-white transition-all"
                        placeholder="e.g. Senior Frontend Engineer"
                        autoFocus
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                        Company Name *
                      </label>
                      <input
                        type="text"
                        name="companyName"
                        value={data.companyName}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-900 outline-none text-sm text-slate-900 dark:text-white transition-all"
                        placeholder="e.g. TechFlow Innovations"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                        Hiring Manager / Team Title
                      </label>
                      <input
                        type="text"
                        name="hiringManager"
                        value={data.hiringManager}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-900 outline-none text-sm text-slate-900 dark:text-white transition-all"
                        placeholder="e.g. Sarah Jenkins (or Hiring Team)"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                        Company Address / Location
                      </label>
                      <input
                        type="text"
                        name="companyAddress"
                        value={data.companyAddress}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-900 outline-none text-sm text-slate-900 dark:text-white transition-all"
                        placeholder="e.g. San Francisco, CA"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                      Job Description (Optional – for ATS Keyword Match)
                    </label>
                    <textarea
                      name="jobDescription"
                      rows={3}
                      value={data.jobDescription}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-900 outline-none text-sm text-slate-900 dark:text-white transition-all resize-none"
                      placeholder="Paste key requirements or excerpt from the job listing for automatic keyword integration..."
                    />
                  </div>
                </div>

                {/* Step 2 Footer Navigation */}
                <div className="mt-8 pt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => goToStep(1)}
                    className="px-5 py-2.5 rounded-2xl font-bold text-xs text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 transition-all flex items-center gap-1.5"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => goToStep(3)}
                    className="px-6 py-3 rounded-2xl font-bold text-sm text-white bg-blue-600 hover:bg-blue-500 active:scale-[0.99] transition-all shadow-md shadow-blue-500/20 flex items-center gap-2"
                  >
                    <span>Next: Story & Tone</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </section>
            )}

            {/* STEP 3: STORY, SKILLS & AI TONE */}
            {currentStep === 3 && (
              <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-white/10 shadow-sm animate-fade-in">
                <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-slate-100 dark:border-white/5">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-xs">
                    3
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">Your Story & AI Tone</h2>
                    <p className="text-xs text-slate-400">Step 3 of 3: Achievements, skills, and voice</p>
                  </div>
                </div>

                <div className="space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                        Experience Level
                      </label>
                      <select
                        name="experience"
                        value={data.experience}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm text-slate-900 dark:text-white"
                      >
                        <option value="Fresher" className="bg-white dark:bg-slate-900">Fresher / Graduate</option>
                        <option value="1-2 years" className="bg-white dark:bg-slate-900">1-2 years (Entry)</option>
                        <option value="3-5 years" className="bg-white dark:bg-slate-900">3-5 years (Mid-Level)</option>
                        <option value="5+ years" className="bg-white dark:bg-slate-900">5+ years (Senior/Lead)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                        Writing Tone
                      </label>
                      <select
                        name="tone"
                        value={data.tone}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm text-slate-900 dark:text-white"
                      >
                        <option value="Professional" className="bg-white dark:bg-slate-900">Professional & Balanced</option>
                        <option value="Confident" className="bg-white dark:bg-slate-900">Confident & High-Impact</option>
                        <option value="Friendly" className="bg-white dark:bg-slate-900">Friendly & Conversational</option>
                        <option value="Short" className="bg-white dark:bg-slate-900">Short & Direct (3 Paras)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                      Core Skills & Technologies
                    </label>
                    <input
                      type="text"
                      name="skills"
                      value={data.skills}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm text-slate-900 dark:text-white"
                      placeholder="e.g. React, Next.js, Cloud Services, Team Leadership"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                      Notable Achievement (Optional)
                    </label>
                    <textarea
                      name="keyAchievement"
                      rows={2}
                      value={data.keyAchievement}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm text-slate-900 dark:text-white resize-none"
                      placeholder="e.g. Led redesign project increasing conversion by 28%..."
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                      Why this company specifically?
                    </label>
                    <textarea
                      name="whyCompany"
                      rows={2}
                      value={data.whyCompany}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm text-slate-900 dark:text-white resize-none"
                      placeholder="e.g. I admire your team's open-source contributions and product ergonomics..."
                    />
                  </div>
                </div>

                {/* Step 3 Navigation & Generate Trigger */}
                <div className="mt-8 pt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between gap-3 flex-wrap">
                  <button
                    type="button"
                    onClick={() => goToStep(2)}
                    className="px-5 py-2.5 rounded-2xl font-bold text-xs text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 transition-all flex items-center gap-1.5"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="px-6 py-3.5 rounded-2xl font-black text-sm tracking-wide text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-600 active:scale-[0.99] transition-all shadow-lg shadow-blue-500/25 flex items-center gap-2.5 disabled:opacity-50"
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Crafting Letter...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Generate Cover Letter</span>
                      </>
                    )}
                  </button>
                </div>
              </section>
            )}
          </div>

          {/* RIGHT: LIVE PREVIEW & DESIGN CONTROLS */}
          <div className="w-full lg:w-[54%] sticky top-6 space-y-4">

            {/* Template & Style Customization Bar (Kickresume Style) */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 border border-slate-200 dark:border-white/10 shadow-sm space-y-3.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-white/5">
                <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
                  <Palette className="w-4 h-4 text-blue-500" />
                  <span>Design & Template</span>
                </div>

                <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                  <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-white/5 font-bold">
                    {wordCount} words
                  </span>
                  <span>•</span>
                  <span>~{readingTime} min read</span>
                </div>
              </div>

              {/* Template Selectors */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {[
                  { id: 'modern', label: 'Modern' },
                  { id: 'executive', label: 'Executive' },
                  { id: 'split', label: 'Two-Tone' },
                  { id: 'creative', label: 'Creative' },
                  { id: 'classic', label: 'Classic' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setTemplate(item.id as TemplateId)}
                    className={`px-3 py-2 text-xs font-bold rounded-xl border transition-all text-center ${
                      template === item.id
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-500/20'
                        : 'bg-slate-50 dark:bg-white/5 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:bg-slate-100'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Accent Color & Font Controls */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                {/* Accent Colors */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">Color:</span>
                  {ACCENT_COLORS.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      title={c.name}
                      onClick={() => setAccentColor(c)}
                      className={`w-6 h-6 rounded-full transition-all border-2 flex items-center justify-center ${
                        accentColor.id === c.id ? 'scale-110 border-white shadow-md' : 'border-transparent opacity-80 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: c.hex }}
                    >
                      {accentColor.id === c.id && <Check className="w-3 h-3 text-white" />}
                    </button>
                  ))}
                </div>

                {/* Typography switcher */}
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-white/5 p-1 rounded-xl border border-slate-200 dark:border-white/10">
                  <button
                    type="button"
                    onClick={() => setFontStyle('sans')}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                      fontStyle === 'sans' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-sans' : 'text-slate-500'
                    }`}
                  >
                    Sans
                  </button>
                  <button
                    type="button"
                    onClick={() => setFontStyle('serif')}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                      fontStyle === 'serif' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-serif' : 'text-slate-500'
                    }`}
                  >
                    Serif
                  </button>
                  <button
                    type="button"
                    onClick={() => setFontStyle('mono')}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                      fontStyle === 'mono' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-mono' : 'text-slate-500'
                    }`}
                  >
                    Mono
                  </button>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-white/5 flex-wrap">
                <button
                  type="button"
                  onClick={() => setIsEditingDirectly(!isEditingDirectly)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl border flex items-center gap-1.5 transition-all ${
                    isEditingDirectly
                      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                      : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:bg-slate-200'
                  }`}
                >
                  <PenTool className="w-3.5 h-3.5" />
                  <span>{isEditingDirectly ? 'Editing On' : 'Edit Text'}</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={copyToClipboard}
                    className="px-3 py-1.5 text-xs font-bold rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/10 transition-all flex items-center gap-1.5"
                  >
                    {copied ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied!' : 'Copy'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={printDocument}
                    className="px-3 py-1.5 text-xs font-bold rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/10 transition-all flex items-center gap-1.5"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print</span>
                  </button>

                  <button
                    type="button"
                    onClick={downloadPDF}
                    disabled={isDownloading || !generatedLetter}
                    className="px-4 py-1.5 text-xs font-black rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {isDownloading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                    <span>Download PDF</span>
                  </button>
                </div>
              </div>
            </div>

            {/* LIVE DOCUMENT PREVIEW CONTAINER (A4 SHEET) */}
            <div className="overflow-x-auto p-4 sm:p-6 bg-slate-200/70 dark:bg-slate-950/80 rounded-3xl border border-slate-300 dark:border-white/5 shadow-inner">
              <div
                id="letter-preview-sheet"
                className={`bg-white text-slate-900 mx-auto shadow-2xl relative transition-all ${fontClass}`}
                style={{
                  width: '100%',
                  maxWidth: '794px',
                  minHeight: '1080px',
                  padding: 'clamp(36px, 6vw, 64px)',
                }}
              >
                {/* TEMPLATE VARIANT 1: MODERN MINIMALIST */}
                {template === 'modern' && (
                  <div>
                    {/* Top Accent Strip */}
                    <div className="h-2 w-full rounded-full mb-8" style={{ backgroundColor: accentColor.hex }} />

                    {/* Applicant Header */}
                    <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pb-6 border-b border-slate-200">
                      <div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950">
                          {data.name || 'Your Full Name'}
                        </h1>
                        <p className="text-sm font-semibold tracking-wide uppercase mt-1" style={{ color: accentColor.hex }}>
                          {data.jobTitle || 'Target Job Title'}
                        </p>
                      </div>

                      {/* Contact Info Grid */}
                      <div className="text-right text-xs text-slate-500 space-y-0.5">
                        {data.email && <p>{data.email}</p>}
                        {data.phone && <p>{data.phone}</p>}
                        {data.location && <p>{data.location}</p>}
                        {data.portfolio && <p className="font-medium text-slate-700">{data.portfolio}</p>}
                      </div>
                    </div>
                  </div>
                )}

                {/* TEMPLATE VARIANT 2: EXECUTIVE BORDER */}
                {template === 'executive' && (
                  <div className="relative pl-6 border-l-4 mb-6" style={{ borderColor: accentColor.hex }}>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-950">
                      {data.name || 'Your Full Name'}
                    </h1>
                    <p className="text-sm font-semibold uppercase tracking-wider text-slate-600 mt-1">
                      {data.jobTitle || 'Target Job Title'}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-3">
                      {data.email && <span>{data.email}</span>}
                      {data.phone && <span>• {data.phone}</span>}
                      {data.location && <span>• {data.location}</span>}
                      {data.portfolio && <span>• {data.portfolio}</span>}
                    </div>
                  </div>
                )}

                {/* TEMPLATE VARIANT 3: TWO-TONE SPLIT */}
                {template === 'split' && (
                  <div className="p-6 -mx-8 -mt-8 sm:-mx-12 sm:-mt-12 mb-8 rounded-b-2xl border-b" style={{ backgroundColor: accentColor.light, borderColor: accentColor.border }}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h1 className="text-2xl sm:text-3xl font-black tracking-tight" style={{ color: accentColor.hex }}>
                          {data.name || 'Your Full Name'}
                        </h1>
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-700 mt-1">
                          {data.jobTitle || 'Target Job Title'}
                        </p>
                      </div>
                      <div className="text-xs text-slate-600 sm:text-right space-y-0.5">
                        {data.email && <p>{data.email}</p>}
                        {data.phone && <p>{data.phone}</p>}
                        {data.location && <p>{data.location}</p>}
                      </div>
                    </div>
                  </div>
                )}

                {/* TEMPLATE VARIANT 4: CREATIVE BADGE */}
                {template === 'creative' && (
                  <div className="pb-6 mb-6 border-b-2 border-slate-100">
                    <div className="inline-block px-3 py-1 rounded-full text-xs font-bold text-white mb-3" style={{ backgroundColor: accentColor.hex }}>
                      Application for {data.jobTitle || 'Target Role'}
                    </div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-950">
                      {data.name || 'Your Full Name'}
                    </h1>
                    <div className="flex flex-wrap gap-2 text-xs text-slate-600 mt-3">
                      {data.email && <span className="bg-slate-100 px-2 py-0.5 rounded-md">{data.email}</span>}
                      {data.phone && <span className="bg-slate-100 px-2 py-0.5 rounded-md">{data.phone}</span>}
                      {data.location && <span className="bg-slate-100 px-2 py-0.5 rounded-md">{data.location}</span>}
                      {data.portfolio && <span className="bg-slate-100 px-2 py-0.5 rounded-md">{data.portfolio}</span>}
                    </div>
                  </div>
                )}

                {/* TEMPLATE VARIANT 5: CLASSIC FORMAL */}
                {template === 'classic' && (
                  <div className="text-center pb-6 mb-8 border-b border-double border-slate-400">
                    <h1 className="text-2xl font-serif font-bold tracking-widest uppercase text-slate-950">
                      {data.name || 'Your Full Name'}
                    </h1>
                    <p className="text-xs font-sans uppercase tracking-wider text-slate-500 mt-1">
                      {data.jobTitle || 'Target Job Title'}
                    </p>
                    <p className="text-xs text-slate-600 mt-2">
                      {[data.email, data.phone, data.location, data.portfolio].filter(Boolean).join('  |  ')}
                    </p>
                  </div>
                )}

                {/* LETTER BODY CONTENT */}
                <div className="mt-6">
                  {isEditingDirectly ? (
                    <textarea
                      value={generatedLetter}
                      onChange={(e) => setGeneratedLetter(e.target.value)}
                      rows={22}
                      className="w-full p-4 border border-blue-400 rounded-xl bg-blue-50/20 focus:outline-none focus:ring-2 focus:ring-blue-500 text-[15px] leading-relaxed resize-y font-inherit text-slate-900"
                    />
                  ) : (
                    <div className="whitespace-pre-wrap text-[15px] sm:text-[15.5px] leading-relaxed text-slate-800 space-y-4">
                      {generatedLetter ? (
                        generatedLetter
                      ) : (
                        <div className="flex flex-col items-center justify-center py-32 text-slate-400 gap-3">
                          <FileText className="w-12 h-12 stroke-[1.5] opacity-30" />
                          <p className="text-sm font-medium">Click "Generate Cover Letter" to craft your document.</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SEO & COMPREHENSIVE GUIDE SECTION */}
      <ToolArticle preferArticleCopy {...toolArticles['cover-letter-generator']} />
    </div>
  );
}
