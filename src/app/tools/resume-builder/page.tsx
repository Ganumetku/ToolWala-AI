"use client";

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { 
  FileText, Download, Sparkles, Trash2, Plus, AlertCircle, 
  CheckCircle, RefreshCw, Briefcase, GraduationCap, Code, 
  User, LayoutTemplate, Target, TrendingUp, AlertTriangle,
  ChevronLeft
} from 'lucide-react';
import ToolArticle from '@/components/ToolArticle';
import { toolArticles } from '@/data/toolArticles';

type Experience = { id: string, company: string, role: string, start: string, end: string, desc: string };
type Education = { id: string, degree: string, institute: string, year: string };
type Project = { id: string, name: string, desc: string, tech: string };

type ATSScore = {
  score: number;
  strengths: string[];
  missing: string[];
  suggestions: string[];
  keywordMatchPercent: number;
};

export default function ResumeBuilder() {
  // ------------------------------------
  // STATE
  // ------------------------------------
  const [personal, setPersonal] = useState({
    name: "Alex Morgan",
    title: "Senior Full Stack Engineer",
    email: "alex.morgan@example.com",
    phone: "+1 (555) 123-4567",
    location: "San Francisco, CA",
    linkedin: "linkedin.com/in/alexmorgan",
    portfolio: "alexmorgan.dev"
  });

  const [targetJob, setTargetJob] = useState({
    title: "Senior Full Stack Engineer",
    description: "Looking for an experienced engineer proficient in React, Node.js, Next.js, and cloud platforms like AWS. Must have a track record of optimizing database queries, mentoring junior developers, and building scalable microservices. Familiarity with Docker and PostgreSQL is a plus."
  });

  const [summary, setSummary] = useState("Results-driven Senior Full Stack Engineer with over 6 years of experience building scalable web applications. Proficient in React, Node.js, and cloud architecture. Passionate about solving complex problems and mentoring junior developers to elevate team performance.");

  const [experience, setExperience] = useState<Experience[]>([
    {
      id: '1',
      company: "TechFlow Innovations",
      role: "Senior Software Engineer",
      start: "Jan 2021",
      end: "Present",
      desc: "Led the migration of a legacy monolithic architecture to microservices, improving system uptime by 99.9%.\nMentored a team of 5 junior developers and established code review best practices.\nReduced database query times by 40% through indexing and caching optimization."
    },
    {
      id: '2',
      company: "Creative Solutions Inc.",
      role: "Frontend Developer",
      start: "Jun 2018",
      end: "Dec 2020",
      desc: "Developed responsive web interfaces using React and Redux for 10+ enterprise clients.\nIntegrated RESTful APIs and optimized front-end performance, scoring 95+ on Lighthouse.\nCollaborated with UX designers to implement accessible components."
    }
  ]);

  const [education, setEducation] = useState<Education[]>([
    {
      id: '1',
      degree: "B.S. Computer Science",
      institute: "University of California, Berkeley",
      year: "2014 - 2018"
    }
  ]);

  const [skills, setSkills] = useState("JavaScript, TypeScript, React, Next.js, Node.js, Express, Python, PostgreSQL, MongoDB, Docker, AWS");

  const [projects, setProjects] = useState<Project[]>([
    {
      id: '1',
      name: "E-commerce Dashboard",
      desc: "A comprehensive dashboard for merchants to track sales, manage inventory, and analyze customer behavior in real-time.",
      tech: "React, Next.js, TailwindCSS, Firebase"
    }
  ]);

  const [atsScore, setAtsScore] = useState<ATSScore>({ score: 0, strengths: [], missing: [], suggestions: [], keywordMatchPercent: 0 });

  // UI States
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // ------------------------------------
  // ATS SCORE CALCULATION
  // ------------------------------------
  useEffect(() => {
    const actionVerbs = ['built', 'developed', 'managed', 'improved', 'designed', 'led', 'created', 'optimized', 'implemented', 'integrated', 'achieved', 'delivered', 'reduced', 'increased'];
    let score = 0;
    const strengths: string[] = [];
    const missing: string[] = [];
    const suggestions: string[] = [];

    // Contact Details (Max 10)
    if (personal.name && personal.email && personal.phone && personal.linkedin) {
      score += 10;
      strengths.push("Contact details are complete");
    } else {
      score += 5;
      missing.push("Incomplete contact details");
      suggestions.push("Add LinkedIn and Phone Number for better reachability");
    }

    // Summary (Max 5)
    if (summary.trim().length > 50) {
      score += 5;
      strengths.push("Professional summary included");
    } else {
      missing.push("Missing or very short summary");
      suggestions.push("Add a professional summary highlighting your career goals");
    }

    // Skills (Max 10)
    const skillCount = skills.split(',').filter(s => s.trim().length > 0).length;
    if (skillCount >= 5) {
      score += 10;
      strengths.push(`Good number of skills listed (${skillCount})`);
    } else if (skillCount > 0) {
      score += 5;
      suggestions.push("Add at least 5 relevant skills");
    } else {
      missing.push("No skills listed");
    }

    // Experience (Max 15)
    if (experience.length > 0) {
      score += 15;
      strengths.push("Work experience included");
    } else {
      missing.push("No work experience");
      suggestions.push("Add work experience, even if it's internships or volunteering");
    }

    // Education (Max 5)
    if (education.length > 0) {
      score += 5;
      strengths.push("Education details included");
    } else {
      missing.push("No education details");
    }

    // Projects (Max 5)
    if (projects.length > 0) {
      score += 5;
      strengths.push("Personal/Professional projects included");
    }

    // Action Words Match (Max 20)
    let actionMatchCount = 0;
    const fullText = (experience.map(e => e.desc).join(' ') + ' ' + projects.map(p => p.desc).join(' ')).toLowerCase();
    actionVerbs.forEach(verb => {
      if (fullText.includes(verb)) actionMatchCount++;
    });
    
    const actionPoints = Math.min(20, actionMatchCount * 4);
    score += actionPoints;
    if (actionMatchCount >= 5) {
      strengths.push("Strong use of action verbs in bullet points");
    } else {
      suggestions.push("Start experience bullet points with action verbs (e.g. Built, Led, Optimized)");
    }

    // Keyword Match (Max 30)
    let keywordMatchPercent = 0;
    if (targetJob.description.trim().length > 10) {
      const jobWords = targetJob.description.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(w => w.length > 3);
      const resumeText = (skills + ' ' + fullText + ' ' + summary).toLowerCase();
      
      let matchCount = 0;
      const uniqueJobWords = Array.from(new Set(jobWords));
      uniqueJobWords.forEach(word => {
        if (resumeText.includes(word)) matchCount++;
      });
      
      keywordMatchPercent = uniqueJobWords.length > 0 ? Math.round((matchCount / uniqueJobWords.length) * 100) : 0;
      score += Math.round((keywordMatchPercent / 100) * 30);
      
      if (keywordMatchPercent > 60) {
        strengths.push("Excellent keyword match with target job");
      } else if (keywordMatchPercent > 0) {
        suggestions.push("Add more keywords from the job description to your skills and experience");
      }
    } else {
      // Partial free points if no job description so score isn't overly harsh
      score += 15; 
      suggestions.push("Paste a target job description to get keyword optimization insights");
    }

    setAtsScore({ 
      score: Math.min(100, score), 
      strengths, 
      missing, 
      suggestions, 
      keywordMatchPercent 
    });
  }, [personal, summary, experience, education, skills, projects, targetJob]);

  // ------------------------------------
  // HANDLERS
  // ------------------------------------
  const handlePersonalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPersonal({ ...personal, [e.target.name]: e.target.value });
    setError(null);
  };

  const generateAISummary = () => {
    setIsGenerating(true);
    setSuccess(null);
    // Simulate AI generation
    setTimeout(() => {
      const jobTitle = targetJob.title || personal.title || "Professional";
      const keySkills = skills.split(',').slice(0, 3).join(', ') || "modern technologies";
      const newSummary = `Results-driven ${jobTitle} with a proven track record of delivering high-quality results. Adept at leveraging ${keySkills} to solve complex challenges and drive impactful projects from conception to deployment. Strong communicator and team player, dedicated to continuous learning and elevating team performance.`;
      setSummary(newSummary);
      setIsGenerating(false);
      setSuccess("AI Summary generated successfully!");
      setTimeout(() => setSuccess(null), 3000);
    }, 1500);
  };

  const generateId = () => Math.random().toString(36).substr(2, 9);

  // Experience
  const addExperience = () => {
    setExperience([...experience, { id: generateId(), company: "", role: "", start: "", end: "", desc: "" }]);
  };
  const updateExperience = (id: string, field: keyof Experience, value: string) => {
    setExperience(experience.map(exp => exp.id === id ? { ...exp, [field]: value } : exp));
  };
  const removeExperience = (id: string) => setExperience(experience.filter(exp => exp.id !== id));

  // Education
  const addEducation = () => {
    setEducation([...education, { id: generateId(), degree: "", institute: "", year: "" }]);
  };
  const updateEducation = (id: string, field: keyof Education, value: string) => {
    setEducation(education.map(edu => edu.id === id ? { ...edu, [field]: value } : edu));
  };
  const removeEducation = (id: string) => setEducation(education.filter(edu => edu.id !== id));

  // Projects
  const addProject = () => {
    setProjects([...projects, { id: generateId(), name: "", desc: "", tech: "" }]);
  };
  const updateProject = (id: string, field: keyof Project, value: string) => {
    setProjects(projects.map(proj => proj.id === id ? { ...proj, [field]: value } : proj));
  };
  const removeProject = (id: string) => setProjects(projects.filter(proj => proj.id !== id));

  const resetForm = () => {
    setPersonal({ name: "", title: "", email: "", phone: "", location: "", linkedin: "", portfolio: "" });
    setTargetJob({ title: "", description: "" });
    setSummary("");
    setExperience([]);
    setEducation([]);
    setSkills("");
    setProjects([]);
    setError(null);
    setSuccess(null);
  };

  const downloadPDF = async () => {
    if (!personal.name.trim() || !personal.email.trim()) {
      setError("Full name and email are required to download your resume.");
      return;
    }
    if (!skills.trim()) {
      setError("Please add at least one skill to your resume.");
      return;
    }
    setError(null);
    setIsDownloading(true);

    try {
      const element = document.getElementById('resume-preview-container');
      if (!element) return;
      
      // Temporarily force exact A4 width for the PDF render so it doesn't wrap awkwardly on small screens
      const originalWidth = element.style.width;
      const originalMinWidth = element.style.minWidth;
      const originalMaxWidth = element.style.maxWidth;
      element.style.width = '794px';
      element.style.minWidth = '794px';
      element.style.maxWidth = '794px';
      
      const canvas = await html2canvas(element, { scale: 2, useCORS: true, logging: false, windowWidth: 794 });
      
      // Restore original responsive widths
      element.style.width = originalWidth;
      element.style.minWidth = originalMinWidth;
      element.style.maxWidth = originalMaxWidth;
      
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${personal.name.replace(/\s+/g, '_')}_Resume.pdf`);
      
      setSuccess("Resume downloaded successfully!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error(err);
      setError("Failed to generate PDF. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  const getScoreColorClass = (score: number) => {
    if (score >= 80) return "text-emerald-500";
    if (score >= 60) return "text-amber-500";
    return "text-red-500";
  };

  const getScoreBgClass = (score: number) => {
    if (score >= 80) return "bg-emerald-50 border-emerald-100";
    if (score >= 60) return "bg-amber-50 border-amber-100";
    return "bg-red-50 border-red-100";
  };

  return (
    <div className="bg-[#030712] min-h-screen py-24 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-blue-600/5 blur-[120px] -z-10" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-[1400px] relative z-10">
        <Link href="/tools" className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-widest text-gray-500 hover:text-blue-500 transition-colors mb-10 group">
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Directory
        </Link>
        
        {/* HEADER */}
        <div className="glass rounded-[2.5rem] border border-white/5 p-8 sm:p-10 mb-10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="flex items-center gap-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-[0_0_25px_rgba(37,99,235,0.4)] shrink-0">
                <FileText className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-white tracking-tighter">AI Resume Builder & ATS Checker</h1>
                <p className="text-gray-400 font-medium mt-1">Create an ATS-friendly resume and optimize it against your target job instantly.</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-4 shrink-0">
              <button onClick={resetForm} className="px-6 py-3.5 text-[10px] font-black uppercase tracking-widest text-gray-400 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all">
                Clear All
              </button>
              <button 
                onClick={downloadPDF}
                disabled={isDownloading}
                className="flex items-center gap-3 px-8 py-3.5 text-[10px] font-black uppercase tracking-widest text-white bg-blue-600 rounded-2xl hover:bg-blue-500 transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(37,99,235,0.3)] active:scale-95"
              >
                {isDownloading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                {isDownloading ? 'Generating PDF...' : 'Download PDF'}
              </button>
            </div>
          </div>
          
          {(error || success) && (
            <div className="mt-8 animate-fade-in">
              {error && (
                <div className="bg-red-500/10 text-red-400 p-5 rounded-[2rem] flex items-start gap-4 border border-red-500/20">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <p className="text-sm font-medium">{error}</p>
                </div>
              )}
              {success && (
                <div className="bg-emerald-500/10 text-emerald-400 p-5 rounded-[2rem] flex items-start gap-4 border border-emerald-500/20">
                  <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <p className="text-sm font-medium">{success}</p>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="flex flex-col xl:flex-row gap-10 relative items-start">
          
          {/* LEFT: FORM AREA */}
          <div className="w-full xl:w-[45%] xl:h-[calc(100vh-180px)] overflow-y-auto custom-scrollbar-hidden pr-0 space-y-8 pb-32">
            
            {/* A. Personal Details */}
            <section className="glass rounded-[2rem] border border-white/5 p-8">
              <div className="flex items-center gap-3 mb-8 pb-6 border-b border-white/5">
                <User className="w-5 h-5 text-blue-500" />
                <h2 className="text-xl font-black text-white tracking-tight">Personal Details</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="col-span-1 sm:col-span-2">
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Full Name *</label>
                  <input type="text" name="name" value={personal.name} onChange={handlePersonalChange} className="w-full px-5 py-3.5 border border-white/10 rounded-2xl bg-white/5 text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 outline-none text-sm font-bold transition-all" placeholder="e.g. Alex Morgan" />
                </div>
                <div className="col-span-1 sm:col-span-2">
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Job Title</label>
                  <input type="text" name="title" value={personal.title} onChange={handlePersonalChange} className="w-full px-5 py-3.5 border border-white/10 rounded-2xl bg-white/5 text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 outline-none text-sm font-bold transition-all" placeholder="e.g. Senior Full Stack Engineer" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Email *</label>
                  <input type="email" name="email" value={personal.email} onChange={handlePersonalChange} className="w-full px-5 py-3.5 border border-white/10 rounded-2xl bg-white/5 text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 outline-none text-sm font-bold transition-all" placeholder="alex@example.com" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Phone</label>
                  <input type="text" name="phone" value={personal.phone} onChange={handlePersonalChange} className="w-full px-5 py-3.5 border border-white/10 rounded-2xl bg-white/5 text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 outline-none text-sm font-bold transition-all" placeholder="+1 (555) 000-0000" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Location</label>
                  <input type="text" name="location" value={personal.location} onChange={handlePersonalChange} className="w-full px-5 py-3.5 border border-white/10 rounded-2xl bg-white/5 text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 outline-none text-sm font-bold transition-all" placeholder="San Francisco, CA" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">LinkedIn</label>
                  <input type="text" name="linkedin" value={personal.linkedin} onChange={handlePersonalChange} className="w-full px-5 py-3.5 border border-white/10 rounded-2xl bg-white/5 text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 outline-none text-sm font-bold transition-all" placeholder="linkedin.com/in/username" />
                </div>
                <div className="col-span-1 sm:col-span-2">
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Portfolio / Website</label>
                  <input type="text" name="portfolio" value={personal.portfolio} onChange={handlePersonalChange} className="w-full px-5 py-3.5 border border-white/10 rounded-2xl bg-white/5 text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 outline-none text-sm font-bold transition-all" placeholder="portfolio.dev" />
                </div>
              </div>
            </section>

            {/* B. Target Job */}
            <section className="glass rounded-[2rem] border border-blue-500/10 p-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 bg-blue-600/20 text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] px-5 py-2 rounded-bl-[1.5rem] border-l border-b border-white/5">
                ATS Optimizer
              </div>
              <div className="flex items-center gap-3 mb-8 pb-6 border-b border-white/5">
                <Target className="w-5 h-5 text-blue-400" />
                <h2 className="text-xl font-black text-white tracking-tight">Target Job Info</h2>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Job Title</label>
                  <input type="text" value={targetJob.title} onChange={e => setTargetJob({...targetJob, title: e.target.value})} className="w-full px-5 py-3.5 border border-white/10 rounded-2xl bg-white/5 text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 outline-none text-sm font-bold transition-all" placeholder="e.g. Senior Frontend Engineer" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Full Job Description</label>
                  <textarea 
                    rows={5} 
                    value={targetJob.description} 
                    onChange={e => setTargetJob({...targetJob, description: e.target.value})} 
                    className="w-full px-5 py-4 border border-white/10 rounded-2xl bg-white/5 text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 outline-none text-sm font-bold transition-all resize-none custom-scrollbar shadow-2xl" 
                    placeholder="Paste the target job description here to see real-time ATS keyword match..." 
                  />
                  <div className="flex items-start gap-2 mt-4 text-[10px] font-bold text-blue-400/60 uppercase tracking-widest leading-loose">
                    <Sparkles className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>Paste description to unlock keyword matching & scoring.</span>
                  </div>
                </div>
              </div>
            </section>

            {/* C. Professional Summary */}
            <section className="glass rounded-[2rem] border border-white/5 p-8">
              <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <LayoutTemplate className="w-5 h-5 text-blue-500" />
                  <h2 className="text-xl font-black text-white tracking-tight">Summary</h2>
                </div>
                <button 
                  onClick={generateAISummary}
                  disabled={isGenerating}
                  className="flex items-center gap-2 px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded-xl hover:bg-blue-500/20 transition-all disabled:opacity-50 active:scale-95"
                >
                  {isGenerating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  {isGenerating ? 'Drafting...' : 'AI Enhance'}
                </button>
              </div>
              <textarea 
                rows={4}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Briefly pitch your professional value..."
                className="w-full px-5 py-4 border border-white/10 rounded-2xl bg-white/5 text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 outline-none text-sm font-bold transition-all resize-none custom-scrollbar"
              />
            </section>

            {/* D. Work Experience */}
            <section className="glass rounded-[2rem] border border-white/5 p-8">
              <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <Briefcase className="w-5 h-5 text-blue-500" />
                  <h2 className="text-xl font-black text-white tracking-tight">Work History</h2>
                </div>
                <button onClick={addExperience} className="flex items-center gap-2 px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-gray-400 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all active:scale-95">
                  <Plus className="w-3.5 h-3.5" /> Add New
                </button>
              </div>
              
              <div className="space-y-10">
                {experience.length === 0 && <p className="text-sm text-gray-500 text-center py-10 font-bold uppercase tracking-widest opacity-50">No Experience Listed</p>}
                
                {experience.map((exp, index) => (
                  <div key={exp.id} className="relative p-6 border border-white/5 rounded-[2rem] bg-white/[0.02] group/item">
                    <button onClick={() => removeExperience(exp.id)} className="absolute -top-3 -right-3 bg-[#030712] border border-white/10 text-gray-500 hover:text-red-400 p-2.5 rounded-full shadow-2xl transition-all z-10 hover:scale-110 active:scale-90">
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                      <div className="col-span-1 sm:col-span-2">
                        <input type="text" value={exp.role} onChange={e => updateExperience(exp.id, 'role', e.target.value)} placeholder="Role / Job Title" className="w-full px-4 py-3 border border-white/10 rounded-xl bg-[#030712] text-white focus:ring-1 focus:ring-blue-500 outline-none text-sm font-bold" />
                      </div>
                      <div>
                        <input type="text" value={exp.company} onChange={e => updateExperience(exp.id, 'company', e.target.value)} placeholder="Company Name" className="w-full px-4 py-3 border border-white/10 rounded-xl bg-[#030712] text-white focus:ring-1 focus:ring-blue-500 outline-none text-sm font-bold" />
                      </div>
                      <div className="flex gap-2">
                        <input type="text" value={exp.start} onChange={e => updateExperience(exp.id, 'start', e.target.value)} placeholder="Start (e.g. Jan 2021)" className="w-full px-4 py-3 border border-white/10 rounded-xl bg-[#030712] text-white focus:ring-1 focus:ring-blue-500 outline-none text-sm font-bold" />
                        <input type="text" value={exp.end} onChange={e => updateExperience(exp.id, 'end', e.target.value)} placeholder="End (e.g. Present)" className="w-full px-4 py-3 border border-white/10 rounded-xl bg-[#030712] text-white focus:ring-1 focus:ring-blue-500 outline-none text-sm font-bold" />
                      </div>
                    </div>
                    <textarea 
                      rows={4} 
                      value={exp.desc} 
                      onChange={e => updateExperience(exp.id, 'desc', e.target.value)} 
                      placeholder="List achievements. Start with action verbs: Developed, Built, Led..." 
                      className="w-full px-4 py-3 border border-white/10 rounded-xl bg-[#030712] text-white focus:ring-1 focus:ring-blue-500 outline-none text-sm font-medium resize-none custom-scrollbar" 
                    />
                  </div>
                ))}
              </div>
            </section>

            {/* E. Education */}
            <section className="glass rounded-[2rem] border border-white/5 p-8">
              <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <GraduationCap className="w-5 h-5 text-blue-500" />
                  <h2 className="text-xl font-black text-white tracking-tight">Education</h2>
                </div>
                <button onClick={addEducation} className="flex items-center gap-2 px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-gray-400 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all active:scale-95">
                  <Plus className="w-3.5 h-3.5" /> Add New
                </button>
              </div>
              
              <div className="space-y-6">
                {education.length === 0 && <p className="text-sm text-gray-500 text-center py-10 font-bold uppercase tracking-widest opacity-50">No Education Listed</p>}
                
                {education.map(edu => (
                  <div key={edu.id} className="relative p-6 border border-white/5 rounded-[2rem] bg-white/[0.02] grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button onClick={() => removeEducation(edu.id)} className="absolute -top-3 -right-3 bg-[#030712] border border-white/10 text-gray-500 hover:text-red-400 p-2.5 rounded-full shadow-2xl transition-all z-10 hover:scale-110 active:scale-90">
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="col-span-1 sm:col-span-2">
                      <input type="text" value={edu.degree} onChange={e => updateEducation(edu.id, 'degree', e.target.value)} placeholder="Degree / Program" className="w-full px-4 py-3 border border-white/10 rounded-xl bg-[#030712] text-white focus:ring-1 focus:ring-blue-500 outline-none text-sm font-bold" />
                    </div>
                    <div>
                      <input type="text" value={edu.institute} onChange={e => updateEducation(edu.id, 'institute', e.target.value)} placeholder="University / School" className="w-full px-4 py-3 border border-white/10 rounded-xl bg-[#030712] text-white focus:ring-1 focus:ring-blue-500 outline-none text-sm font-bold" />
                    </div>
                    <div>
                      <input type="text" value={edu.year} onChange={e => updateEducation(edu.id, 'year', e.target.value)} placeholder="Year (e.g. 2018 - 2022)" className="w-full px-4 py-3 border border-white/10 rounded-xl bg-[#030712] text-white focus:ring-1 focus:ring-blue-500 outline-none text-sm font-bold" />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* F. Skills */}
            <section className="glass rounded-[2rem] border border-white/5 p-8">
              <div className="flex items-center gap-3 mb-8 pb-6 border-b border-white/5">
                <Code className="w-5 h-5 text-blue-500" />
                <h2 className="text-xl font-black text-white tracking-tight">Core Competencies *</h2>
              </div>
              <textarea 
                rows={3}
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="React, TypeScript, Node.js, Project Management..."
                className="w-full px-5 py-4 border border-white/10 rounded-2xl bg-white/5 text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 outline-none text-sm font-bold transition-all resize-none custom-scrollbar"
              />
              <p className="text-[10px] font-bold text-gray-500 mt-4 uppercase tracking-widest ml-1 opacity-60">Separate skills with commas for optimal ATS parsing.</p>
            </section>

            {/* G. Projects */}
            <section className="glass rounded-[2rem] border border-white/5 p-8">
              <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <LayoutTemplate className="w-5 h-5 text-blue-500" />
                  <h2 className="text-xl font-black text-white tracking-tight">Projects</h2>
                </div>
                <button onClick={addProject} className="flex items-center gap-2 px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-gray-400 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all active:scale-95">
                  <Plus className="w-3.5 h-3.5" /> Add New
                </button>
              </div>
              
              <div className="space-y-6">
                {projects.length === 0 && <p className="text-sm text-gray-500 text-center py-10 font-bold uppercase tracking-widest opacity-50">No Projects Listed</p>}
                
                {projects.map(proj => (
                  <div key={proj.id} className="relative p-6 border border-white/5 rounded-[2rem] bg-white/[0.02] space-y-4">
                    <button onClick={() => removeProject(proj.id)} className="absolute -top-3 -right-3 bg-[#030712] border border-white/10 text-gray-500 hover:text-red-400 p-2.5 rounded-full shadow-2xl transition-all z-10 hover:scale-110 active:scale-90">
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <input type="text" value={proj.name} onChange={e => updateProject(proj.id, 'name', e.target.value)} placeholder="Project Name" className="w-full px-4 py-3 border border-white/10 rounded-xl bg-[#030712] text-white focus:ring-1 focus:ring-blue-500 outline-none text-sm font-bold" />
                      </div>
                      <div>
                        <input type="text" value={proj.tech} onChange={e => updateProject(proj.id, 'tech', e.target.value)} placeholder="Tech Stack" className="w-full px-4 py-3 border border-white/10 rounded-xl bg-[#030712] text-white focus:ring-1 focus:ring-blue-500 outline-none text-sm font-bold" />
                      </div>
                    </div>
                    <textarea 
                      rows={3} 
                      value={proj.desc} 
                      onChange={e => updateProject(proj.id, 'desc', e.target.value)} 
                      placeholder="Briefly describe the project's impact..." 
                      className="w-full px-4 py-3 border border-white/10 rounded-xl bg-[#030712] text-white focus:ring-1 focus:ring-blue-500 outline-none text-sm font-medium resize-none custom-scrollbar" 
                    />
                  </div>
                ))}
              </div>
            </section>

          </div>

          {/* RIGHT: ATS SCORE & LIVE PREVIEW */}
          <div className="w-full xl:w-[55%] flex flex-col gap-10 xl:sticky xl:top-6">
            
            {/* ATS Score Dashboard */}
            <div className={`glass rounded-[2.5rem] p-10 border transition-all duration-700 shadow-2xl ${
              atsScore.score >= 80 ? 'border-emerald-500/20 bg-emerald-500/[0.02]' : 
              atsScore.score >= 60 ? 'border-amber-500/20 bg-amber-500/[0.02]' : 
              'border-red-500/20 bg-red-500/[0.02]'
            }`}>
              <div className="flex justify-between items-center mb-10">
                <h2 className="text-xl font-black text-white flex items-center gap-3 tracking-tight">
                  <TrendingUp className={`w-6 h-6 ${
                    atsScore.score >= 80 ? 'text-emerald-400' : 
                    atsScore.score >= 60 ? 'text-amber-400' : 
                    'text-red-400'
                  }`} /> Real-time ATS Analysis
                </h2>
                <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10 shadow-xl">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Live Feedback</span>
                </div>
              </div>
              
              <div className="flex flex-col md:flex-row gap-12 items-center md:items-start">
                
                {/* Score Circle */}
                <div className="relative w-44 h-44 flex-shrink-0">
                  <svg className="w-full h-full transform -rotate-90 filter drop-shadow-[0_0_15px_rgba(37,99,235,0.2)]" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="44" className="text-white/[0.02]" strokeWidth="8" stroke="currentColor" fill="none" />
                    <circle 
                      cx="50" cy="50" r="44" 
                      className={
                        atsScore.score >= 80 ? 'text-emerald-400' : 
                        atsScore.score >= 60 ? 'text-amber-400' : 
                        'text-red-400'
                      } 
                      strokeWidth="8" 
                      strokeDasharray="276.46" 
                      strokeDashoffset={276.46 - (276.46 * atsScore.score) / 100} 
                      strokeLinecap="round" 
                      stroke="currentColor" 
                      fill="none" 
                      style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1), stroke 0.8s ease' }} 
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-5xl font-black text-white tracking-tighter">{atsScore.score}</span>
                    <span className="text-[10px] uppercase font-black text-gray-500 tracking-[0.2em] mt-1">Score</span>
                  </div>
                </div>

                {/* Quick Stats & Bars */}
                <div className="w-full space-y-8">
                  <div>
                    <div className="flex justify-between items-end mb-3">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Keyword Alignment</span>
                      <span className="text-base font-black text-white tracking-tight">{atsScore.keywordMatchPercent}% Match</span>
                    </div>
                    <div className="w-full h-3 bg-white/[0.02] rounded-full overflow-hidden border border-white/5 shadow-2xl">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(37,99,235,0.3)] ${atsScore.keywordMatchPercent > 60 ? 'bg-emerald-500' : atsScore.keywordMatchPercent > 30 ? 'bg-amber-500' : 'bg-red-500'}`} 
                        style={{ width: `${Math.max(5, atsScore.keywordMatchPercent)}%` }} 
                      />
                    </div>
                    <p className="text-[10px] font-bold text-gray-500 mt-4 leading-relaxed uppercase tracking-widest opacity-60">Syncing with target job description...</p>
                  </div>
                  
                  <div className="flex flex-wrap gap-3">
                    <div className="px-5 py-3 bg-white/[0.03] border border-white/5 rounded-2xl shadow-xl flex items-center gap-3">
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-black text-gray-300 uppercase tracking-widest">{atsScore.strengths.length} Wins</span>
                    </div>
                    <div className="px-5 py-3 bg-white/[0.03] border border-white/5 rounded-2xl shadow-xl flex items-center gap-3">
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                      <span className="text-xs font-black text-gray-300 uppercase tracking-widest">{atsScore.suggestions.length + atsScore.missing.length} Gaps</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detailed Insights */}
              <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-10 pt-10 border-t border-white/5">
                <div className="space-y-5">
                  <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" /> Optimization Wins
                  </h4>
                  <ul className="text-xs text-gray-300 space-y-3.5 font-bold">
                    {atsScore.strengths.length === 0 && <li className="text-gray-600 italic tracking-widest font-black uppercase text-[10px]">Awaiting Data...</li>}
                    {atsScore.strengths.slice(0, 5).map((s, i) => (
                      <li key={i} className="flex items-start gap-3 bg-emerald-500/5 p-3 rounded-xl border border-emerald-500/10 transition-all hover:bg-emerald-500/10">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" /> 
                        <span className="leading-relaxed opacity-80">{s}</span>
                      </li>
                    ))}
                    {atsScore.strengths.length > 5 && <li className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] pl-4">+ {atsScore.strengths.length - 5} more metrics</li>}
                  </ul>
                </div>
                <div className="space-y-5">
                  <h4 className="text-[10px] font-black text-amber-400 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" /> Growth Areas
                  </h4>
                  <ul className="text-xs text-gray-300 space-y-3.5 font-bold">
                    {atsScore.missing.length === 0 && atsScore.suggestions.length === 0 && <li className="text-gray-600 italic tracking-widest font-black uppercase text-[10px]">Fully Optimized</li>}
                    {[...atsScore.missing, ...atsScore.suggestions].slice(0, 5).map((s, i) => (
                      <li key={i} className="flex items-start gap-3 bg-amber-500/5 p-3 rounded-xl border border-amber-500/10 transition-all hover:bg-amber-500/10">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" /> 
                        <span className="leading-relaxed opacity-80">{s}</span>
                      </li>
                    ))}
                    {([...atsScore.missing, ...atsScore.suggestions].length > 5) && <li className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] pl-4">+ {([...atsScore.missing, ...atsScore.suggestions].length - 5)} points</li>}
                  </ul>
                </div>
              </div>
            </div>
            
            {/* Live Preview Document Wrapper */}
            <div className="w-full overflow-x-auto max-w-full bg-[#030712] p-6 sm:p-12 rounded-[3rem] border border-white/5 shadow-[0_0_50px_rgba(0,0,0,0.5)] custom-scrollbar relative">
              <div className="absolute top-6 left-1/2 -translate-x-1/2 text-[10px] font-black text-gray-600 uppercase tracking-[0.4em] z-20 pointer-events-none">
                Interactive Preview
              </div>
              
              {/* A4 Resume Container */}
              <div 
                id="resume-preview-container" 
                className="bg-white mx-auto relative shadow-[0_30px_60px_-12px_rgba(0,0,0,0.4)] overflow-hidden"
                style={{ 
                  width: '100%', 
                  maxWidth: '794px', 
                  minWidth: 'min(794px, 100%)', // Responsive scaling for mobile
                  minHeight: '1123px', // Standard A4 height
                  padding: 'clamp(30px, 6vw, 60px)',
                  fontFamily: '"Inter", "system-ui", sans-serif',
                  color: '#111827' // gray-900
                }}
              >
                {/* Header */}
                <div className="text-center border-b-[3px] border-gray-900 pb-8 mb-8">
                  <h1 className="text-4xl font-black text-gray-900 uppercase tracking-tighter leading-none">{personal.name || 'Your Name'}</h1>
                  <p className="text-xl font-bold text-gray-700 mt-3 uppercase tracking-[0.15em]">{personal.title}</p>
                  <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 mt-5 text-[12px] text-gray-500 font-bold uppercase tracking-widest">
                    {personal.email && <span className="hover:text-blue-600 transition-colors">{personal.email}</span>}
                    {personal.phone && <span>• {personal.phone}</span>}
                    {personal.location && <span>• {personal.location}</span>}
                    {personal.linkedin && <span className="hover:text-blue-600 transition-colors">• {personal.linkedin}</span>}
                    {personal.portfolio && <span className="hover:text-blue-600 transition-colors">• {personal.portfolio}</span>}
                  </div>
                </div>
                
                {/* Summary */}
                {summary && (
                  <div className="mb-10">
                    <h2 className="text-[14px] font-black text-gray-900 uppercase border-b-2 border-gray-100 pb-2 mb-4 tracking-[0.2em]">Professional Profile</h2>
                    <p className="text-[13px] text-gray-800 leading-relaxed text-justify font-medium">{summary}</p>
                  </div>
                )}
                
                {/* Experience */}
                {experience.length > 0 && (
                  <div className="mb-10">
                    <h2 className="text-[14px] font-black text-gray-900 uppercase border-b-2 border-gray-100 pb-2 mb-5 tracking-[0.2em]">Professional Experience</h2>
                    <div className="space-y-8">
                      {experience.map(exp => (
                        <div key={exp.id}>
                          <div className="flex justify-between items-baseline mb-2">
                            <div>
                              <h3 className="text-[15px] font-black text-gray-900 tracking-tight">{exp.role}</h3>
                              <p className="text-[13px] text-gray-800 font-black uppercase tracking-wider mt-0.5">{exp.company}</p>
                            </div>
                            <span className="text-[12px] text-gray-500 font-black uppercase tracking-widest whitespace-nowrap bg-gray-50 px-3 py-1 rounded-full">{exp.start} {exp.start && exp.end ? '—' : ''} {exp.end}</span>
                          </div>
                          {exp.desc && (
                            <ul className="list-disc list-inside text-[13px] text-gray-700 space-y-2 mt-3 pl-2">
                              {exp.desc.split('\n').filter(line => line.trim() !== '').map((line, i) => (
                                <li key={i} className="leading-relaxed"><span className="-ml-1 font-medium">{line.replace(/^- /, '')}</span></li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Projects */}
                {projects.length > 0 && (
                  <div className="mb-10">
                    <h2 className="text-[14px] font-black text-gray-900 uppercase border-b-2 border-gray-100 pb-2 mb-5 tracking-[0.2em]">Key Projects</h2>
                    <div className="space-y-6">
                      {projects.map(proj => (
                        <div key={proj.id}>
                          <div className="flex items-baseline gap-3 mb-2">
                            <h3 className="text-[15px] font-black text-gray-900 tracking-tight">{proj.name}</h3>
                            {proj.tech && <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest bg-gray-50 px-2 py-0.5 rounded border border-gray-100">{proj.tech}</span>}
                          </div>
                          <p className="text-[13px] text-gray-700 leading-relaxed font-medium">{proj.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Skills */}
                {skills && (
                  <div className="mb-10">
                    <h2 className="text-[14px] font-black text-gray-900 uppercase border-b-2 border-gray-100 pb-2 mb-4 tracking-[0.2em]">Skills & Technologies</h2>
                    <div className="flex flex-wrap gap-2">
                      {skills.split(',').filter(s => s.trim()).map((skill, i) => (
                        <span key={i} className="text-[11px] font-black uppercase tracking-widest text-gray-800 bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200">
                          {skill.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Education */}
                {education.length > 0 && (
                  <div>
                    <h2 className="text-[14px] font-black text-gray-900 uppercase border-b-2 border-gray-100 pb-2 mb-5 tracking-[0.2em]">Academic Background</h2>
                    <div className="space-y-5">
                      {education.map(edu => (
                        <div key={edu.id} className="flex justify-between items-baseline">
                          <div>
                            <h3 className="text-[14px] font-black text-gray-900 tracking-tight">{edu.degree}</h3>
                            <p className="text-[13px] text-gray-600 font-bold uppercase tracking-wider mt-0.5">{edu.institute}</p>
                          </div>
                          <span className="text-[12px] text-gray-400 font-black tracking-tighter uppercase">{edu.year}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SEO Article Section */}
      <ToolArticle {...toolArticles['resume-builder']} />
    </div>
  );
}
