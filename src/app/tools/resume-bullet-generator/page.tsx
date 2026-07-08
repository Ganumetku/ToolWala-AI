"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import {
  Sparkles, RefreshCw, Copy, CheckCircle, AlertCircle, ChevronLeft,
  Briefcase, Star, Clipboard, FileText, ArrowRight, Settings, Info,
  TrendingUp, Award, Zap, HelpCircle, Check, Trash2, Edit3, ShieldAlert
} from 'lucide-react';
import ToolArticle from '@/components/ToolArticle';
import { toolArticles } from '@/data/toolArticles';

interface GeneratedBullet {
  text: string;
  atsScore: number;
  strength: 'Excellent' | 'Good' | 'Needs Improvement';
  actionVerb: string;
  keywords: string[];
}

interface RewrittenOutput {
  rewrittenBullet: string;
  metrics: {
    impactScore: number;
    atsFriendliness: number;
    recruiterAppeal: number;
    readability: number;
    professionalTone: number;
    keywordStrength: number;
  };
  actionVerb: string;
  keywords: string[];
}

const COMMON_ROLES = [
  "Software Engineer", "Frontend Developer", "Backend Developer", "Full Stack Developer",
  "Data Analyst", "Product Manager", "Project Manager", "DevOps Engineer",
  "UI UX Designer", "Graphic Designer", "Digital Marketer", "SEO Specialist",
  "HR Executive", "Sales Representative", "Customer Success Manager", "Business Analyst",
  "Financial Analyst", "Accountant", "Content Writer", "QA Engineer"
];

const INDUSTRIES = [
  "IT & Tech", "Healthcare", "Finance & Banking", "Education", "Retail & Commerce",
  "Marketing & Ads", "Manufacturing", "Construction", "Hospitality", "Government",
  "Legal Services", "Automobile", "E-Commerce", "Real Estate"
];

const EXPERIENCES = ["Intern", "Fresher", "Junior", "Mid-Level", "Senior", "Lead", "Manager"];

const WRITING_STYLES = [
  { id: "Professional", label: "Professional", desc: "Balanced and clean tone" },
  { id: "ATS Optimized", label: "ATS Friendly", desc: "Keyword and parser focused" },
  { id: "Executive", label: "Executive", desc: "High-level strategic focus" },
  { id: "Technical", label: "Technical", desc: "Tool and stack intensive" },
  { id: "Achievement Focused", label: "Achievement Focused", desc: "Heavy on metrics" },
  { id: "Leadership", label: "Leadership", desc: "Spearheaded and mentored" },
  { id: "Results Driven", label: "Results Driven", desc: "Google X-Y-Z framework" },
  { id: "Concise", label: "Concise", desc: "Short and high impact" }
];

export default function ResumeBulletGenerator() {
  // Navigation tabs state
  const [activeTab, setActiveTab] = useState<'generate' | 'improve'>('generate');

  // Input states (Generate Tab)
  const [jobTitle, setJobTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [responsibilities, setResponsibilities] = useState('');
  const [experience, setExperience] = useState('Mid-Level');
  const [industry, setIndustry] = useState('IT & Tech');
  const [writingStyle, setWritingStyle] = useState('Professional');
  const [bulletCount, setBulletCount] = useState(5);

  // Input states (Improve Tab)
  const [originalBullet, setOriginalBullet] = useState('');
  const [targetJobTitle, setTargetJobTitle] = useState('');
  const [improveStyle, setImproveStyle] = useState('ATS Optimized');

  // Outputs state
  const [bullets, setBullets] = useState<GeneratedBullet[]>([]);
  const [rewrittenOutput, setRewrittenOutput] = useState<RewrittenOutput | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);

  // Page UX states
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [showRoleSuggestions, setShowRoleSuggestions] = useState(false);

  // FAQ states
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Load favorites from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('toolwala_favorite_bullets');
    if (saved) {
      try {
        setFavorites(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Save favorites helper
  const toggleFavorite = (bulletText: string) => {
    let updated: string[];
    if (favorites.includes(bulletText)) {
      updated = favorites.filter(f => f !== bulletText);
    } else {
      updated = [...favorites, bulletText];
    }
    setFavorites(updated);
    localStorage.setItem('toolwala_favorite_bullets', JSON.stringify(updated));
  };

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleCopyAll = () => {
    const allText = activeTab === 'generate'
      ? bullets.map(b => `• ${b.text}`).join('\n')
      : rewrittenOutput ? `• ${rewrittenOutput.rewrittenBullet}` : '';
    
    if (allText) {
      navigator.clipboard.writeText(allText);
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    }
  };

  const handleClear = () => {
    setJobTitle('');
    setCompanyName('');
    setResponsibilities('');
    setOriginalBullet('');
    setTargetJobTitle('');
    setBullets([]);
    setRewrittenOutput(null);
    setError(null);
  };

  // Call API to generate bullets
  const handleGenerate = async () => {
    if (!jobTitle.trim()) {
      setError("Job Title is required to align matching keywords.");
      return;
    }
    if (!responsibilities.trim()) {
      setError("Please describe what tasks or responsibilities you worked on.");
      return;
    }

    setError(null);
    setIsGenerating(true);

    const promptTemplate = `
You are an expert executive resume writer and recruiter. Generate {{count}} resume bullet points for:
Job Title: {{jobTitle}}
Company: {{companyName}}
Industry: {{industry}}
Experience Level: {{experience}}
Style: {{style}}
Responsibilities/Tasks: {{responsibilities}}

Guidelines for each bullet point:
1. Start with a strong action verb (e.g. Developed, Designed, Spearheaded, Implemented).
2. Follow the Google X-Y-Z formula: "Accomplished [X] as measured by [Y], by doing [Z]".
3. Incorporate quantifiable metrics, achievements, and business impact.
4. Integrate keywords, tools, and technical skills appropriate for a {{jobTitle}} in the {{industry}} industry.
5. Do NOT include placeholders, brackets, or generic templates. Generate fully written, final, professional bullet points.
6. Output raw JSON format matching this schema:
{
  "bullets": [
    {
      "text": "The full generated bullet point",
      "atsScore": 85,
      "strength": "Excellent",
      "actionVerb": "Developed",
      "keywords": ["React", "Next.js", "Page Load Speed"]
    }
  ]
}
Return ONLY valid JSON. Do not include markdown code block formatting in your output, just return the raw JSON object string.
`;

    try {
      const response = await fetch('/api/ai/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: 'resume-bullet-generator',
          provider: 'gemini',
          inputs: {
            count: bulletCount,
            jobTitle,
            companyName: companyName || 'A Leading Enterprise',
            industry,
            experience,
            style: writingStyle,
            responsibilities
          },
          promptTemplate
        })
      });

      const resData = await response.json();
      if (!resData.success) {
        throw new Error(resData.error || "Failed to generate AI bullets.");
      }

      // Safe parse output
      let cleaned = resData.output.trim();
      if (cleaned.startsWith('```json')) cleaned = cleaned.replace(/^```json/, '');
      if (cleaned.endsWith('```')) cleaned = cleaned.replace(/```$/, '');
      cleaned = cleaned.trim();

      const parsed = JSON.parse(cleaned);
      if (parsed && Array.isArray(parsed.bullets)) {
        setBullets(parsed.bullets);
      } else {
        throw new Error("Invalid output structure received.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Something went wrong while connecting to our AI engine. Please verify inputs and try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Call API to improve bullet point
  const handleImprove = async (bulletToImprove?: string) => {
    const textToImprove = bulletToImprove || originalBullet;
    if (!textToImprove.trim()) {
      setError("Please paste a bullet point to rewrite.");
      return;
    }

    setError(null);
    setIsGenerating(true);
    if (bulletToImprove) {
      setActiveTab('improve');
      setOriginalBullet(bulletToImprove);
    }

    const improvePromptTemplate = `
You are an expert recruiter. Rewrite the following resume bullet point to make it more professional, ATS-friendly, and achievement-focused.
Original Bullet: {{originalBullet}}
Target Job Title: {{targetJobTitle}}
Tone/Style: {{style}}

Guidelines:
1. Rewrite it to be professional, using a strong action verb at the start.
2. Focus on achievements, results, and business value.
3. Remove weak/passive wording.
4. Calculate and output metrics for the rewritten bullet.
5. Output raw JSON format matching this schema:
{
  "rewrittenBullet": "The improved bullet point text",
  "metrics": {
    "impactScore": 85,
    "atsFriendliness": 90,
    "recruiterAppeal": 88,
    "readability": 92,
    "professionalTone": 95,
    "keywordStrength": 85
  },
  "actionVerb": "Optimized",
  "keywords": ["list", "of", "suggested", "keywords"]
}
Return ONLY valid JSON. Do not include markdown code block formatting in your output, just return the raw JSON object string.
`;

    try {
      const response = await fetch('/api/ai/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: 'resume-bullet-generator',
          provider: 'gemini',
          inputs: {
            originalBullet: textToImprove,
            targetJobTitle: targetJobTitle || 'Professional Role',
            style: improveStyle
          },
          promptTemplate: improvePromptTemplate
        })
      });

      const resData = await response.json();
      if (!resData.success) {
        throw new Error(resData.error || "Failed to rewrite bullet.");
      }

      let cleaned = resData.output.trim();
      if (cleaned.startsWith('```json')) cleaned = cleaned.replace(/^```json/, '');
      if (cleaned.endsWith('```')) cleaned = cleaned.replace(/```$/, '');
      cleaned = cleaned.trim();

      const parsed = JSON.parse(cleaned);
      if (parsed && parsed.rewrittenBullet) {
        setRewrittenOutput(parsed);
      } else {
        throw new Error("Invalid rewrite format.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Could not rewrite the bullet point. Please simplify the text and try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Export options
  const downloadTXT = () => {
    const list = activeTab === 'generate' ? bullets.map(b => `• ${b.text}`) : rewrittenOutput ? [`• ${rewrittenOutput.rewrittenBullet}`] : [];
    if (list.length === 0) return;
    const blob = new Blob([list.join('\n\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ToolWala_Resume_Bullets.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const downloadPDF = () => {
    const list = activeTab === 'generate' ? bullets.map(b => b.text) : rewrittenOutput ? [rewrittenOutput.rewrittenBullet] : [];
    if (list.length === 0) return;

    try {
      const doc = new jsPDF();
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(22);
      doc.setTextColor(37, 99, 235); // Blue-600
      doc.text("ToolWala AI", 20, 25);
      
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139); // Slate-500
      doc.text("Resume Bullet Points Generator — Report", 20, 32);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 37);
      doc.line(20, 42, 190, 42);

      doc.setFont("Helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(15, 23, 42); // Slate-900
      doc.text("Quantified ATS Bullet Points:", 20, 52);

      doc.setFont("Helvetica", "normal");
      doc.setFontSize(11);
      doc.setTextColor(51, 65, 85); // Slate-700
      
      let yOffset = 62;
      list.forEach((text) => {
        const splitText = doc.splitTextToSize(`•  ${text}`, 160);
        doc.text(splitText, 20, yOffset);
        yOffset += (splitText.length * 6) + 6;
      });

      doc.save("ToolWala_Resume_Bullets.pdf");
    } catch (err) {
      console.error(err);
      setError("Failed to compile and download PDF.");
    }
  };

  return (
    <div className="bg-[#030712] min-h-screen py-10 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-blue-600/5 blur-[120px] -z-10" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
        <Link href="/tools" className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-widest text-gray-500 hover:text-blue-500 transition-colors mb-10 group">
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Directory
        </Link>

        {/* HEADER */}
        <div className="glass rounded-[2rem] p-6 sm:p-8 mb-8 border border-white/5">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)] shrink-0">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-white tracking-tighter">Resume Bullet Generator</h1>
                <p className="text-sm text-gray-400 font-medium mt-1">Generate recruiter-approved, metric-rich Google X-Y-Z formula bullets.</p>
              </div>
            </div>
            <div className="flex gap-3 shrink-0">
              <button onClick={handleClear} className="px-4 py-2 text-xs font-black uppercase tracking-widest text-gray-400 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all">
                Clear Form
              </button>
            </div>
          </div>

          {error && (
            <div className="mt-6 bg-red-500/10 text-red-400 p-4 rounded-xl flex items-start gap-3 border border-red-500/20 animate-fade-in">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}
        </div>

        {/* TABS CONTAINER */}
        <div className="flex gap-2 p-1.5 bg-white/5 rounded-2xl border border-white/5 mb-8 w-fit">
          <button
            onClick={() => { setActiveTab('generate'); setError(null); }}
            className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              activeTab === 'generate'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Generate Bullets
          </button>
          <button
            onClick={() => { setActiveTab('improve'); setError(null); }}
            className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              activeTab === 'improve'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            AI Improve Mode
          </button>
        </div>

        {/* MAIN SaaS GRID */}
        <div className="flex flex-col xl:flex-row gap-8">
          
          {/* LEFT PANEL: INPUT FORM */}
          <div className="w-full xl:w-[45%] space-y-6">
            
            {activeTab === 'generate' ? (
              <div className="glass p-6 rounded-3xl border border-white/5 space-y-6">
                
                {/* Job Title with recommendations */}
                <div className="relative">
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Job Title *</label>
                  <div className="relative">
                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="text"
                      value={jobTitle}
                      onChange={(e) => { setJobTitle(e.target.value); setShowRoleSuggestions(true); }}
                      onFocus={() => setShowRoleSuggestions(true)}
                      className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-sm text-white"
                      placeholder="e.g. Senior Frontend Engineer"
                    />
                  </div>
                  
                  {showRoleSuggestions && (
                    <div className="absolute z-20 left-0 right-0 mt-2 bg-[#0b0f19] border border-white/10 rounded-xl shadow-2xl max-h-48 overflow-y-auto custom-scrollbar">
                      {COMMON_ROLES.filter(r => r.toLowerCase().includes(jobTitle.toLowerCase())).map((role) => (
                        <button
                          key={role}
                          onClick={() => { setJobTitle(role); setShowRoleSuggestions(false); }}
                          className="w-full text-left px-4 py-2.5 text-xs text-gray-300 hover:bg-white/5 hover:text-white transition-colors border-b border-white/5 last:border-0"
                        >
                          {role}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Company Name & Experience Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Company (Optional)</label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-sm text-white"
                      placeholder="e.g. Google"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Experience Level</label>
                    <select
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-sm text-white"
                    >
                      {EXPERIENCES.map(lvl => (
                        <option key={lvl} value={lvl} className="bg-[#0b0f19]">{lvl}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Industry Selector */}
                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Industry</label>
                  <select
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-sm text-white"
                  >
                    {INDUSTRIES.map(ind => (
                      <option key={ind} value={ind} className="bg-[#0b0f19]">{ind}</option>
                    ))}
                  </select>
                </div>

                {/* Raw Responsibilities */}
                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">What did you do? (Describe simply) *</label>
                  <textarea
                    rows={5}
                    value={responsibilities}
                    onChange={(e) => setResponsibilities(e.target.value)}
                    className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-sm text-white resize-none custom-scrollbar"
                    placeholder="E.g. I worked on Next.js website speeds, fixed client APIs, and managed 3 developers."
                  />
                  <div className="flex justify-between items-center mt-2 px-1">
                    <span className="text-[10px] text-gray-500 font-medium">Simple language triggers best results</span>
                    <button
                      type="button"
                      onClick={() => setResponsibilities("Led backend migration of user authentication APIs to OAuth 2.0, decreasing sign-in failure rates and boosting system performance.")}
                      className="text-[10px] text-blue-500 hover:text-blue-400 font-bold uppercase tracking-wider"
                    >
                      Load Sample
                    </button>
                  </div>
                </div>

                {/* Style & Count Options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Writing Style</label>
                    <select
                      value={writingStyle}
                      onChange={(e) => setWritingStyle(e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-sm text-white"
                    >
                      {WRITING_STYLES.map(style => (
                        <option key={style.id} value={style.id} className="bg-[#0b0f19]">{style.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Bullet Count</label>
                    <select
                      value={bulletCount}
                      onChange={(e) => setBulletCount(Number(e.target.value))}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-sm text-white"
                    >
                      {[3, 5, 10, 15].map(cnt => (
                        <option key={cnt} value={cnt} className="bg-[#0b0f19]">{cnt} Bullets</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Primary Button */}
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 text-xs font-black uppercase tracking-widest text-white bg-blue-600 rounded-xl hover:bg-blue-500 transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(37,99,235,0.3)] active:scale-95"
                >
                  {isGenerating ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                  {isGenerating ? 'Drafting Achievements...' : 'Generate Resume Bullets'}
                </button>

              </div>
            ) : (
              <div className="glass p-6 rounded-3xl border border-white/5 space-y-6">
                
                {/* Paste original bullet */}
                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Paste Your Existing Bullet *</label>
                  <textarea
                    rows={5}
                    value={originalBullet}
                    onChange={(e) => setOriginalBullet(e.target.value)}
                    className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-sm text-white resize-none custom-scrollbar"
                    placeholder="E.g. I was responsible for writing test code and finding web site bugs."
                  />
                </div>

                {/* Job Title Option */}
                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Target Job Title (Optional)</label>
                  <input
                    type="text"
                    value={targetJobTitle}
                    onChange={(e) => setTargetJobTitle(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-sm text-white"
                    placeholder="e.g. Senior QA Engineer"
                  />
                </div>

                {/* Writing Style */}
                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Improve Mode Focus</label>
                  <select
                    value={improveStyle}
                    onChange={(e) => setImproveStyle(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-sm text-white"
                  >
                    <option value="ATS Optimized" className="bg-[#0b0f19]">ATS friendly rewrite</option>
                    <option value="Professional" className="bg-[#0b0f19]">Professional Tone</option>
                    <option value="Achievement Focused" className="bg-[#0b0f19]">Result & Metrics Focus</option>
                    <option value="Executive" className="bg-[#0b0f19]">Executive & Leadership Tone</option>
                  </select>
                </div>

                {/* Submit button */}
                <button
                  onClick={() => handleImprove()}
                  disabled={isGenerating}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 text-xs font-black uppercase tracking-widest text-white bg-blue-600 rounded-xl hover:bg-blue-500 transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(37,99,235,0.3)] active:scale-95"
                >
                  {isGenerating ? <RefreshCw className="w-5 h-5 animate-spin" /> : <TrendingUp className="w-5 h-5" />}
                  {isGenerating ? 'Optimizing Viñeta...' : 'Enhance My Bullet Point'}
                </button>

              </div>
            )}

            {/* Privacy notice block */}
            <div className="glass p-4.5 rounded-2xl border border-white/5 flex gap-3 text-gray-500">
              <Info className="w-5 h-5 text-gray-500 shrink-0 mt-0.5" />
              <p className="text-[10px] leading-normal font-semibold">
                <strong>Local & Secure:</strong> ToolWala AI does not store, log, or track your resume inputs or generated bulletins. All requests are processed securely via encrypted sessions.
              </p>
            </div>

          </div>

          {/* RIGHT PANEL: LIVE PREVIEW & RESULTS */}
          <div className="w-full xl:w-[55%] flex flex-col space-y-6">
            
            {/* Top Toolbar Actions */}
            <div className="flex justify-between items-center glass p-4 rounded-2xl border border-white/5">
              <div className="flex items-center gap-2.5">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <h3 className="text-xs font-black uppercase tracking-widest text-white">Live Workspace</h3>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={handleCopyAll}
                  disabled={(activeTab === 'generate' ? bullets.length === 0 : !rewrittenOutput) || isGenerating}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-gray-400 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all disabled:opacity-30"
                >
                  {copiedAll ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  Copy All
                </button>
                <button
                  onClick={downloadTXT}
                  disabled={(activeTab === 'generate' ? bullets.length === 0 : !rewrittenOutput) || isGenerating}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-gray-400 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all disabled:opacity-30"
                >
                  <FileText className="w-3.5 h-3.5" />
                  TXT
                </button>
                <button
                  onClick={downloadPDF}
                  disabled={(activeTab === 'generate' ? bullets.length === 0 : !rewrittenOutput) || isGenerating}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-white bg-blue-600 rounded-lg hover:bg-blue-500 transition-all disabled:opacity-30 shadow-md"
                >
                  Export PDF
                </button>
              </div>
            </div>

            {/* Content Output Screen */}
            <div className="flex-1 min-h-[400px] rounded-3xl border border-white/5 bg-white/[0.01] p-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/[0.02] to-purple-600/[0.02] pointer-events-none" />

              {isGenerating && (
                <div className="absolute inset-0 z-20 bg-[#030712]/75 backdrop-blur-sm flex items-center justify-center">
                  <div className="glass p-8 rounded-3xl border border-white/10 shadow-2xl flex flex-col items-center gap-4 text-center max-w-xs">
                    <RefreshCw className="w-10 h-10 text-blue-500 animate-spin" />
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider text-white">AI Engine Running</h4>
                      <p className="text-[10px] text-gray-500 mt-1">Applying recruiter keywords and Google X-Y-Z calculations...</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'generate' ? (
                /* GENERATE RESULTS LIST */
                bullets.length > 0 ? (
                  <div className="space-y-6">
                    {bullets.map((bullet, idx) => (
                      <div key={idx} className="glass p-5 rounded-2xl border border-white/5 hover:border-blue-500/25 transition-all duration-300 relative group">
                        
                        {/* Bullet Card Header (ATS badge & actions) */}
                        <div className="flex items-center justify-between gap-4 mb-3 border-b border-white/5 pb-2.5">
                          <div className="flex items-center gap-3">
                            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-black tracking-widest uppercase border ${
                              bullet.atsScore >= 80 
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                                : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            }`}>
                              ATS Score: {bullet.atsScore}
                            </span>
                            <span className="hidden sm:inline-block text-[9px] font-black tracking-wider text-gray-500 uppercase">
                              Verb: <strong className="text-blue-400">{bullet.actionVerb}</strong>
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleImprove(bullet.text)}
                              title="Improve this bullet point"
                              className="p-1.5 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => toggleFavorite(bullet.text)}
                              title={favorites.includes(bullet.text) ? "Remove from Favorites" : "Add to Favorites"}
                              className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                            >
                              <Star className={`w-3.5 h-3.5 ${favorites.includes(bullet.text) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-400 hover:text-white'}`} />
                            </button>
                            <button
                              onClick={() => handleCopy(bullet.text, idx)}
                              className="p-1.5 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors relative"
                            >
                              {copiedIndex === idx ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>

                        {/* Bullet Text */}
                        <p className="text-xs text-white leading-relaxed font-medium">
                          {bullet.text}
                        </p>

                        {/* Suggested Keywords tags */}
                        {bullet.keywords && bullet.keywords.length > 0 && (
                          <div className="mt-4 flex flex-wrap gap-1.5">
                            {bullet.keywords.map((kw, kwIdx) => (
                              <span key={kwIdx} className="text-[8px] font-black uppercase tracking-wider bg-white/5 border border-white/5 text-gray-400 px-2 py-0.5 rounded-md">
                                {kw}
                              </span>
                            ))}
                          </div>
                        )}

                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center h-[350px] text-gray-500 gap-4">
                    <FileText className="w-16 h-16 opacity-10" />
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider text-white">Generate Your Achievements</h4>
                      <p className="text-[10px] text-gray-500 mt-1.5 max-w-xs">Fill out the left form, select a custom tone, and trigger professional bullet generation.</p>
                    </div>
                  </div>
                )
              ) : (
                /* IMPROVE MODE OUTPUT VIEW */
                rewrittenOutput ? (
                  <div className="space-y-6">
                    
                    {/* Metrics grid dashboard */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 bg-white/[0.02] p-4.5 rounded-2xl border border-white/5">
                      {[
                        { label: "Impact Score", val: rewrittenOutput.metrics.impactScore, color: "text-blue-400" },
                        { label: "ATS Compatibility", val: rewrittenOutput.metrics.atsFriendliness, color: "text-emerald-400" },
                        { label: "Recruiter Appeal", val: rewrittenOutput.metrics.recruiterAppeal, color: "text-purple-400" },
                        { label: "Readability Score", val: rewrittenOutput.metrics.readability, color: "text-pink-400" },
                        { label: "Professional Tone", val: rewrittenOutput.metrics.professionalTone, color: "text-indigo-400" },
                        { label: "Keyword Strength", val: rewrittenOutput.metrics.keywordStrength, color: "text-cyan-400" }
                      ].map((m, mIdx) => (
                        <div key={mIdx} className="space-y-1.5 bg-black/20 p-3 rounded-xl border border-white/5">
                          <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest block">{m.label}</span>
                          <div className="flex items-center justify-between gap-2">
                            <span className={`text-base font-black ${m.color}`}>{m.val}%</span>
                          </div>
                          {/* Mini Progress Bar */}
                          <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500" style={{ width: `${m.val}%`, backgroundColor: m.color.includes('blue') ? '#3b82f6' : m.color.includes('emerald') ? '#10b981' : m.color.includes('purple') ? '#a855f7' : m.color.includes('pink') ? '#ec4899' : m.color.includes('indigo') ? '#6366f1' : '#06b6d4' }} />
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Output comparison block */}
                    <div className="space-y-4">
                      
                      <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                        <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest block mb-1.5">Original bullet</span>
                        <p className="text-xs text-gray-400 font-medium italic">"{originalBullet}"</p>
                      </div>

                      <div className="glass p-5 rounded-2xl border border-blue-500/30 shadow-[0_0_25px_rgba(37,99,235,0.15)] relative">
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-[8px] font-black text-blue-400 uppercase tracking-widest">Enhanced bullet point</span>
                          
                          <div className="flex gap-2">
                            <button
                              onClick={() => toggleFavorite(rewrittenOutput.rewrittenBullet)}
                              className="p-1 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white"
                            >
                              <Star className={`w-3.5 h-3.5 ${favorites.includes(rewrittenOutput.rewrittenBullet) ? 'text-yellow-500 fill-yellow-500' : ''}`} />
                            </button>
                            <button
                              onClick={() => handleCopy(rewrittenOutput.rewrittenBullet, 99)}
                              className="p-1 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white"
                            >
                              {copiedIndex === 99 ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>

                        <p className="text-xs text-white leading-relaxed font-bold">
                          {rewrittenOutput.rewrittenBullet}
                        </p>

                        {/* Keyword tagging */}
                        {rewrittenOutput.keywords && rewrittenOutput.keywords.length > 0 && (
                          <div className="mt-4 flex flex-wrap gap-1.5">
                            {rewrittenOutput.keywords.map((kw, kwIdx) => (
                              <span key={kwIdx} className="text-[8px] font-black uppercase tracking-wider bg-white/5 border border-white/5 text-gray-400 px-2 py-0.5 rounded-md">
                                {kw}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                    </div>

                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center h-[350px] text-gray-500 gap-4">
                    <TrendingUp className="w-16 h-16 opacity-10" />
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider text-white font-serif">Paste & Optimize</h4>
                      <p className="text-[10px] text-gray-500 mt-1.5 max-w-xs">Enter an existing weak bullet point on the left and have the AI re-write it with recruiters' action keywords.</p>
                    </div>
                  </div>
                )
              )}

            </div>

            {/* FAVORITES SHELF */}
            {favorites.length > 0 && (
              <div className="glass p-5 rounded-3xl border border-white/5">
                <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-2">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <h4 className="text-xs font-black uppercase tracking-wider text-white">Your Starred Bullets ({favorites.length})</h4>
                  </div>
                  <button
                    onClick={() => { setFavorites([]); localStorage.removeItem('toolwala_favorite_bullets'); }}
                    className="text-[9px] font-black uppercase tracking-widest text-red-400 hover:text-red-300 transition-colors"
                  >
                    Clear All
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                  {favorites.map((fav, favIdx) => (
                    <div key={favIdx} className="bg-white/[0.02] border border-white/5 p-3 rounded-xl flex items-start justify-between gap-3 text-[11px] text-gray-300">
                      <p className="leading-relaxed">{fav}</p>
                      <button
                        onClick={() => toggleFavorite(fav)}
                        className="text-gray-500 hover:text-red-400 p-0.5 shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>

        {/* FAQs SECTION */}
        <div className="mt-20 max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-500 block mb-2">FAQ SUPPORT</span>
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight uppercase">Resume Bullet Generator FAQs</h3>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "How does the Resume Bullet Generator work?",
                a: "Our generator uses advanced AI models to convert simple inputs (like a job title and raw tasks) into professional, recruiter-approved resume bullet points following the Google X-Y-Z formula: Accomplished [X], as measured by [Y], by doing [Z]."
              },
              {
                q: "Are the generated bullets ATS-friendly?",
                a: "Yes, absolutely. The bullets start with strong action verbs, use standard professional vocabulary, and are structured to allow corporate Applicant Tracking Systems (ATS) to parse your achievements easily."
              },
              {
                q: "Can I edit the generated bullets?",
                a: "Yes, you can edit them directly in the workspace, favorite them to save, or use the 'AI Improve' feature to refine any specific bullet point further."
              },
              {
                q: "Can I generate bullets for freshers or interns?",
                a: "Yes. Simply select 'Intern' or 'Fresher' in the Experience Level selector, and our AI will adapt the achievements and results to match academic projects, internships, or volunteer work."
              },
              {
                q: "Is this tool free and secure?",
                a: "Yes, the tool is 100% free with no limits. We respect your privacy: all calculations and outputs are processed securely and we never store your resume content or personal details on our servers."
              }
            ].map((faq, idx) => (
              <div key={idx} className="glass rounded-xl border border-white/5 overflow-hidden transition-all duration-300">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between p-5 text-left text-xs font-black text-white uppercase tracking-wider"
                >
                  {faq.q}
                  <HelpCircle className={`w-4.5 h-4.5 transition-transform duration-300 ${openFaq === idx ? 'rotate-180 text-blue-500' : 'text-gray-500'}`} />
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-5 text-xs text-gray-400 leading-relaxed font-medium border-t border-white/5 pt-3.5">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* SEO Article Section */}
      <ToolArticle {...toolArticles['resume-bullet-generator']} />
    </div>
  );
}
