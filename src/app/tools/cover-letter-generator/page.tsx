"use client";

import Link from 'next/link';
import { useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { 
  FileText, Download, Sparkles, RefreshCw, Copy, CheckCircle, 
  AlertCircle, Building, User, Settings, AlignLeft
} from 'lucide-react';

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
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <Link href="/tools" className="text-sm font-medium text-blue-600 hover:text-blue-700 mb-6 inline-flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to all tools
        </Link>
        
        {/* HEADER */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600 shrink-0">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">AI Cover Letter Generator</h1>
                <p className="text-sm text-gray-500 mt-1">Generate highly tailored, professional cover letters in seconds.</p>
              </div>
            </div>
            <div className="flex gap-3 shrink-0">
              <button onClick={resetForm} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                Clear All
              </button>
            </div>
          </div>
          
          {error && (
            <div className="mt-6 bg-red-50 text-red-700 p-4 rounded-xl flex items-start gap-3 border border-red-100 animate-fade-in">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}
        </div>
        
        <div className="flex flex-col xl:flex-row gap-8 relative">
          
          {/* LEFT: FORM AREA */}
          <div className="w-full xl:w-[45%] lg:h-[calc(100vh-200px)] overflow-y-auto custom-scrollbar pr-0 lg:pr-4 space-y-6 pb-20">
            
            {/* Applicant Details */}
            <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-100">
                <User className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-bold text-gray-900">Your Details</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="col-span-1 sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Full Name *</label>
                  <input type="text" name="name" value={data.name} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow outline-none text-sm" placeholder="e.g. Jane Doe" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Email</label>
                  <input type="email" name="email" value={data.email} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow outline-none text-sm" placeholder="jane@example.com" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Phone</label>
                  <input type="text" name="phone" value={data.phone} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow outline-none text-sm" placeholder="+1 234 567 8900" />
                </div>
              </div>
            </section>

            {/* Target Job */}
            <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-100">
                <Building className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-bold text-gray-900">Target Role</h2>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Job Title *</label>
                    <input type="text" name="jobTitle" value={data.jobTitle} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow outline-none text-sm" placeholder="e.g. Frontend Engineer" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Company Name *</label>
                    <input type="text" name="companyName" value={data.companyName} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow outline-none text-sm" placeholder="e.g. Acme Corp" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Job Description (Optional)</label>
                  <textarea 
                    name="jobDescription"
                    rows={3} 
                    value={data.jobDescription} 
                    onChange={handleChange} 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow outline-none text-sm resize-none custom-scrollbar" 
                    placeholder="Paste the job description for a highly targeted letter..." 
                  />
                </div>
              </div>
            </section>

            {/* Generation Settings */}
            <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-100">
                <Settings className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-bold text-gray-900">Letter Customization</h2>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Experience Level</label>
                    <select name="experience" value={data.experience} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-shadow outline-none text-sm">
                      <option>Fresher</option>
                      <option>1-2 years</option>
                      <option>3-5 years</option>
                      <option>5+ years</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Tone</label>
                    <select name="tone" value={data.tone} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-shadow outline-none text-sm">
                      <option>Professional</option>
                      <option>Friendly</option>
                      <option>Confident</option>
                      <option>Short</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Key Skills</label>
                  <input type="text" name="skills" value={data.skills} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow outline-none text-sm" placeholder="React, Python, Project Management..." />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Why this company?</label>
                  <textarea 
                    name="whyCompany"
                    rows={2} 
                    value={data.whyCompany} 
                    onChange={handleChange} 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow outline-none text-sm resize-none custom-scrollbar" 
                    placeholder="E.g. I love your company culture and recent product launches..." 
                  />
                </div>
              </div>

              <button 
                onClick={generateLetter}
                disabled={isGenerating}
                className="w-full mt-6 flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 shadow-md"
              >
                {isGenerating ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                {isGenerating ? 'Drafting Letter...' : 'Generate Cover Letter'}
              </button>
            </section>

          </div>

          {/* RIGHT: PREVIEW AREA */}
          <div className="w-full xl:w-[55%] flex flex-col">
            <div className="sticky top-6 flex flex-col gap-4">
              
              <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center gap-2 text-gray-800">
                  <AlignLeft className="w-5 h-5 text-blue-500" />
                  <h2 className="text-base font-bold">Live Preview</h2>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={copyToClipboard}
                    disabled={!generatedLetter || isGenerating}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-gray-700 bg-gray-100 border border-gray-200 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                  >
                    {copied ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied!' : 'Copy Text'}
                  </button>
                  <button 
                    onClick={downloadPDF}
                    disabled={!generatedLetter || isGenerating || isDownloading}
                    className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 shadow-sm"
                  >
                    {isDownloading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                    PDF
                  </button>
                </div>
              </div>
              
              {/* Live Preview Document Wrapper */}
              <div className="w-full overflow-x-auto max-w-full bg-gray-200/50 p-4 sm:p-6 rounded-2xl border border-gray-200 shadow-inner custom-scrollbar relative">
                
                {isGenerating && (
                  <div className="absolute inset-0 z-10 bg-white/50 backdrop-blur-sm flex items-center justify-center rounded-2xl">
                    <div className="bg-white p-6 rounded-2xl shadow-xl flex flex-col items-center gap-4">
                      <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
                      <p className="text-sm font-bold text-gray-800">Crafting your cover letter...</p>
                    </div>
                  </div>
                )}

                {/* A4 Container */}
                <div 
                  id="letter-preview-container" 
                  className="bg-white mx-auto relative shadow-sm"
                  style={{ 
                    width: '100%', 
                    maxWidth: '794px', 
                    minWidth: 'min(794px, 100%)', // Responsive scaling for mobile
                    minHeight: '1123px', // Standard A4 height
                    padding: 'clamp(30px, 6vw, 60px)',
                    fontFamily: '"Times New Roman", Times, serif', // Classic cover letter font
                    color: '#000000'
                  }}
                >
                  <div className="whitespace-pre-wrap text-[15px] leading-relaxed">
                    {generatedLetter || (
                      <div className="flex flex-col items-center justify-center h-full text-gray-400 mt-40 gap-4">
                        <FileText className="w-16 h-16 opacity-20" />
                        <p>Fill out the form and click Generate</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Mobile Download Button (Visible only on small screens) */}
              <div className="sm:hidden">
                <button 
                  onClick={downloadPDF}
                  disabled={!generatedLetter || isGenerating || isDownloading}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 shadow-md"
                >
                  {isDownloading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                  {isDownloading ? 'Generating PDF...' : 'Download PDF'}
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
