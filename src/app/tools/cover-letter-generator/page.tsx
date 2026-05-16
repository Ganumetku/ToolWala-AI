"use client";

import Link from 'next/link';
import { useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { 
  FileText, Download, Sparkles, RefreshCw, Copy, CheckCircle, 
  AlertCircle, Building, User, Settings, AlignLeft, ChevronLeft
} from 'lucide-react';
import ToolArticle from '@/components/ToolArticle';
import { toolArticles } from '@/data/toolArticles';

type CoverLetterData = {
  name: string;
  email: string;
  phone: string;
  jobTitle: string;
  companyName: string;
  experience: 'Fresher' | '1-2 years' | '3-5 years' | '5+ years';
  skills: string;
  whyCompany: string;
  tone: 'Professional' | 'Friendly' | 'Confident' | 'Short';
  jobDescription: string;
};

const initialData: CoverLetterData = {
  name: "Alex Morgan",
  email: "alex.morgan@example.com",
  phone: "+1 (555) 123-4567",
  jobTitle: "Senior Frontend Engineer",
  companyName: "TechFlow Innovations",
  experience: "5+ years",
  skills: "React, Next.js, TypeScript, TailwindCSS",
  whyCompany: "I admire your recent open-source contributions and your mission to build accessible web experiences.",
  tone: "Professional",
  jobDescription: ""
};

export default function CoverLetterGenerator() {
  const [data, setData] = useState<CoverLetterData>(initialData);
  const [generatedLetter, setGeneratedLetter] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize with a mock letter on mount
  useState(() => {
    setGeneratedLetter(createMockLetter(initialData));
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setData({ ...data, [e.target.name]: e.target.value });
    setError(null);
  };

  function createMockLetter(d: CoverLetterData) {
    const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    
    let opening = `I am writing to express my strong interest in the ${d.jobTitle} position at ${d.companyName}. `;
    if (d.tone === 'Friendly') opening = `I was incredibly excited to see the opening for the ${d.jobTitle} role at ${d.companyName}. `;
    if (d.tone === 'Confident') opening = `With my proven track record, I am the ideal candidate for the ${d.jobTitle} position at ${d.companyName}. `;
    
    let body = `As a professional with ${d.experience} of experience, I have developed a strong skill set in ${d.skills || 'my field'}, allowing me to deliver high-quality results. `;
    if (d.experience === 'Fresher') body = `As a recent graduate, I am eager to bring my strong foundational skills in ${d.skills || 'my field'} to your dynamic team. `;
    
    let why = d.whyCompany ? `I am particularly drawn to ${d.companyName} because ${d.whyCompany}. ` : `I have been following ${d.companyName}'s recent growth and am highly motivated by your mission. `;
    
    let closing = `I would welcome the opportunity to discuss how my background aligns with your needs. Thank you for your time and consideration.`;
    if (d.tone === 'Short') {
      body = `I bring ${d.experience} of experience specializing in ${d.skills}. `;
      why = d.whyCompany ? `I love ${d.companyName} because ${d.whyCompany}. ` : '';
      closing = `I look forward to discussing this opportunity with you.`;
    }

    return `${today}\n\nHiring Manager\n${d.companyName}\n\nDear Hiring Manager,\n\n${opening}${body}${why}\n\n${closing}\n\nSincerely,\n${d.name}\n${d.email} | ${d.phone}`;
  }

  const generateLetter = () => {
    if (!data.name.trim()) { setError("Full name is required."); return; }
    if (!data.jobTitle.trim()) { setError("Job title is required."); return; }
    if (!data.companyName.trim()) { setError("Company name is required."); return; }
    
    setError(null);
    setIsGenerating(true);
    
    // Simulate AI generation delay
    setTimeout(() => {
      setGeneratedLetter(createMockLetter(data));
      setIsGenerating(false);
    }, 1500);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resetForm = () => {
    setData({
      name: "", email: "", phone: "", jobTitle: "", companyName: "",
      experience: "Fresher", skills: "", whyCompany: "", tone: "Professional", jobDescription: ""
    });
    setGeneratedLetter("");
    setError(null);
  };

  const downloadPDF = async () => {
    if (!generatedLetter) return;
    setIsDownloading(true);

    try {
      const element = document.getElementById('letter-preview-container');
      if (!element) return;
      
      const originalWidth = element.style.width;
      const originalMinWidth = element.style.minWidth;
      const originalMaxWidth = element.style.maxWidth;
      element.style.width = '794px';
      element.style.minWidth = '794px';
      element.style.maxWidth = '794px';
      
      const canvas = await html2canvas(element, { scale: 2, useCORS: true, logging: false, windowWidth: 794 });
      
      element.style.width = originalWidth;
      element.style.minWidth = originalMinWidth;
      element.style.maxWidth = originalMaxWidth;
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${data.name.replace(/\s+/g, '_')}_Cover_Letter.pdf`);
    } catch (err) {
      console.error(err);
      setError("Failed to generate PDF.");
    } finally {
      setIsDownloading(false);
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
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-white tracking-tighter">AI Cover Letter Generator</h1>
                <p className="text-sm text-gray-400 font-medium mt-1">Generate highly tailored, professional cover letters in seconds.</p>
              </div>
            </div>
            <div className="flex gap-3 shrink-0">
              <button onClick={resetForm} className="px-4 py-2 text-xs font-black uppercase tracking-widest text-gray-400 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all">
                Clear All
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
        
        <div className="flex flex-col xl:flex-row gap-8 relative">
          
          {/* LEFT: FORM AREA */}
          <div className="w-full xl:w-[45%] lg:h-[calc(100vh-200px)] overflow-y-auto custom-scrollbar pr-0 lg:pr-4 space-y-6 pb-20">
            
            {/* Applicant Details */}
            <section className="glass p-6 rounded-2xl border border-white/5">
              <div className="flex items-center gap-2 mb-6 pb-4 border-b border-white/5">
                <User className="w-5 h-5 text-blue-500" />
                <h2 className="text-lg font-black text-white uppercase tracking-tight">Your Details</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="col-span-1 sm:col-span-2">
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Full Name *</label>
                  <input type="text" name="name" value={data.name} onChange={handleChange} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-sm text-white" placeholder="e.g. Jane Doe" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Email</label>
                  <input type="email" name="email" value={data.email} onChange={handleChange} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-sm text-white" placeholder="jane@example.com" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Phone</label>
                  <input type="text" name="phone" value={data.phone} onChange={handleChange} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-sm text-white" placeholder="+1 234 567 8900" />
                </div>
              </div>
            </section>

            {/* Target Job */}
            <section className="glass p-6 rounded-2xl border border-white/5">
              <div className="flex items-center gap-2 mb-6 pb-4 border-b border-white/5">
                <Building className="w-5 h-5 text-blue-500" />
                <h2 className="text-lg font-black text-white uppercase tracking-tight">Target Role</h2>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Job Title *</label>
                    <input type="text" name="jobTitle" value={data.jobTitle} onChange={handleChange} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-sm text-white" placeholder="e.g. Frontend Engineer" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Company Name *</label>
                    <input type="text" name="companyName" value={data.companyName} onChange={handleChange} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-sm text-white" placeholder="e.g. Acme Corp" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Job Description (Optional)</label>
                  <textarea 
                    name="jobDescription"
                    rows={4} 
                    value={data.jobDescription} 
                    onChange={handleChange} 
                    className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-sm text-white resize-none custom-scrollbar" 
                    placeholder="Paste the job description for a highly targeted letter..." 
                  />
                </div>
              </div>
            </section>

            {/* Generation Settings */}
            <section className="glass p-6 rounded-2xl border border-white/5">
              <div className="flex items-center gap-2 mb-6 pb-4 border-b border-white/5">
                <Settings className="w-5 h-5 text-blue-500" />
                <h2 className="text-lg font-black text-white uppercase tracking-tight">Customization</h2>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Experience Level</label>
                    <select name="experience" value={data.experience} onChange={handleChange} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-sm text-white">
                      <option className="bg-[#0f172a]">Fresher</option>
                      <option className="bg-[#0f172a]">1-2 years</option>
                      <option className="bg-[#0f172a]">3-5 years</option>
                      <option className="bg-[#0f172a]">5+ years</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Tone</label>
                    <select name="tone" value={data.tone} onChange={handleChange} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-sm text-white">
                      <option className="bg-[#0f172a]">Professional</option>
                      <option className="bg-[#0f172a]">Friendly</option>
                      <option className="bg-[#0f172a]">Confident</option>
                      <option className="bg-[#0f172a]">Short</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Key Skills</label>
                  <input type="text" name="skills" value={data.skills} onChange={handleChange} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-sm text-white" placeholder="React, Python, Project Management..." />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Why this company?</label>
                  <textarea 
                    name="whyCompany"
                    rows={2} 
                    value={data.whyCompany} 
                    onChange={handleChange} 
                    className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-sm text-white resize-none custom-scrollbar" 
                    placeholder="E.g. I love your company culture and recent product launches..." 
                  />
                </div>
              </div>

              <button 
                onClick={generateLetter}
                disabled={isGenerating}
                className="w-full mt-8 flex items-center justify-center gap-3 px-6 py-4 text-sm font-black uppercase tracking-widest text-white bg-blue-600 rounded-xl hover:bg-blue-500 transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(37,99,235,0.3)] active:scale-95"
              >
                {isGenerating ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                {isGenerating ? 'Drafting Letter...' : 'Generate Letter'}
              </button>
            </section>

          </div>

          {/* RIGHT: PREVIEW AREA */}
          <div className="w-full xl:w-[55%] flex flex-col">
            <div className="sticky top-6 flex flex-col gap-4">
              
              <div className="flex justify-between items-center glass p-4 rounded-2xl border border-white/5">
                <div className="flex items-center gap-3 text-white">
                  <AlignLeft className="w-5 h-5 text-blue-500" />
                  <h2 className="text-sm font-black uppercase tracking-widest">Live Preview</h2>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={copyToClipboard}
                    disabled={!generatedLetter || isGenerating}
                    className="flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-gray-400 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all disabled:opacity-50"
                  >
                    {copied ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                  <button 
                    onClick={downloadPDF}
                    disabled={!generatedLetter || isGenerating || isDownloading}
                    className="hidden sm:flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white bg-blue-600 rounded-xl hover:bg-blue-500 transition-all disabled:opacity-50 shadow-[0_0_15px_rgba(37,99,235,0.2)]"
                  >
                    {isDownloading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                    PDF
                  </button>
                </div>
              </div>
              
              {/* Live Preview Document Wrapper */}
              <div className="w-full overflow-x-auto max-w-full bg-[#0f172a] p-4 sm:p-10 rounded-[2.5rem] border border-white/5 shadow-2xl relative custom-scrollbar">
                
                {isGenerating && (
                  <div className="absolute inset-0 z-10 bg-[#030712]/60 backdrop-blur-sm flex items-center justify-center rounded-[2.5rem]">
                    <div className="glass p-8 rounded-3xl shadow-2xl flex flex-col items-center gap-4 border border-white/10">
                      <RefreshCw className="w-10 h-10 text-blue-500 animate-spin" />
                      <p className="text-xs font-black uppercase tracking-widest text-white">Generating...</p>
                    </div>
                  </div>
                )}

                {/* A4 Container */}
                <div 
                  id="letter-preview-container" 
                  className="bg-white mx-auto relative shadow-2xl"
                  style={{ 
                    width: '100%', 
                    maxWidth: '794px', 
                    minWidth: 'min(794px, 100%)', 
                    minHeight: '1123px', 
                    padding: 'clamp(40px, 8vw, 80px)',
                    fontFamily: '"Times New Roman", Times, serif',
                    color: '#000000'
                  }}
                >
                  <div className="whitespace-pre-wrap text-[16px] leading-relaxed">
                    {generatedLetter || (
                      <div className="flex flex-col items-center justify-center h-full text-gray-300 mt-40 gap-6">
                        <FileText className="w-20 h-20 opacity-10" />
                        <p className="font-serif italic text-xl">Your professional letter will appear here...</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Mobile Download Button */}
              <div className="sm:hidden">
                <button 
                  onClick={downloadPDF}
                  disabled={!generatedLetter || isGenerating || isDownloading}
                  className="w-full flex items-center justify-center gap-3 px-6 py-5 text-sm font-black uppercase tracking-widest text-white bg-blue-600 rounded-2xl hover:bg-blue-500 transition-all disabled:opacity-50 shadow-xl"
                >
                  {isDownloading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                  Download PDF
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* SEO Article Section */}
      <ToolArticle {...toolArticles['cover-letter-generator']} />
    </div>
  );
}
