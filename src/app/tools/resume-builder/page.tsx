"use client";

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { 
  FileText, Download, Sparkles, Trash2, Plus, AlertCircle, 
  CheckCircle, RefreshCw, Briefcase, GraduationCap, Code, 
  User, LayoutTemplate, Target, TrendingUp, AlertTriangle
} from 'lucide-react';

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
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-[1400px]">
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
                <h1 className="text-2xl font-bold text-gray-900">AI Resume Builder & ATS Checker</h1>
                <p className="text-sm text-gray-500 mt-1">Create an ATS-friendly resume and optimize it against your target job instantly.</p>
              </div>
            </div>
            <div className="flex gap-3 shrink-0">
              <button onClick={resetForm} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                Clear All
              </button>
              <button 
                onClick={downloadPDF}
                disabled={isDownloading}
                className="flex items-center gap-2 px-5 py-2 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 shadow-sm"
              >
                {isDownloading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                {isDownloading ? 'Generating PDF...' : 'Download PDF'}
              </button>
            </div>
          </div>
          
          {(error || success) && (
            <div className="mt-6">
              {error && (
                <div className="bg-red-50 text-red-700 p-4 rounded-xl flex items-start gap-3 border border-red-100 animate-fade-in">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <p className="text-sm font-medium">{error}</p>
                </div>
              )}
              {success && (
                <div className="bg-emerald-50 text-emerald-800 p-4 rounded-xl flex items-start gap-3 border border-emerald-100 animate-fade-in">
                  <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <p className="text-sm font-medium">{success}</p>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="flex flex-col xl:flex-row gap-8 relative">
          
          {/* LEFT: FORM AREA */}
          <div className="w-full xl:w-[45%] lg:h-[calc(100vh-200px)] overflow-y-auto custom-scrollbar pr-0 lg:pr-4 space-y-6 pb-20">
            
            {/* A. Personal Details */}
            <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-100">
                <User className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-bold text-gray-900">Personal Details</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="col-span-1 sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Full Name *</label>
                  <input type="text" name="name" value={personal.name} onChange={handlePersonalChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow outline-none text-sm" placeholder="e.g. Jane Doe" />
                </div>
                <div className="col-span-1 sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Job Title</label>
                  <input type="text" name="title" value={personal.title} onChange={handlePersonalChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow outline-none text-sm" placeholder="e.g. Product Manager" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Email *</label>
                  <input type="email" name="email" value={personal.email} onChange={handlePersonalChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow outline-none text-sm" placeholder="jane@example.com" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Phone</label>
                  <input type="text" name="phone" value={personal.phone} onChange={handlePersonalChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow outline-none text-sm" placeholder="+1 234 567 8900" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Location</label>
                  <input type="text" name="location" value={personal.location} onChange={handlePersonalChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow outline-none text-sm" placeholder="City, Country" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">LinkedIn</label>
                  <input type="text" name="linkedin" value={personal.linkedin} onChange={handlePersonalChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow outline-none text-sm" placeholder="linkedin.com/in/janedoe" />
                </div>
                <div className="col-span-1 sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Portfolio / Website</label>
                  <input type="text" name="portfolio" value={personal.portfolio} onChange={handlePersonalChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow outline-none text-sm" placeholder="janedoe.com" />
                </div>
              </div>
            </section>

            {/* B. Target Job */}
            <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-blue-50 text-blue-700 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-bl-lg">ATS Optimization</div>
              <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-100">
                <Target className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-bold text-gray-900">Target Job</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Target Job Title</label>
                  <input type="text" value={targetJob.title} onChange={e => setTargetJob({...targetJob, title: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow outline-none text-sm" placeholder="e.g. Senior Frontend Engineer" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Job Description</label>
                  <textarea 
                    rows={4} 
                    value={targetJob.description} 
                    onChange={e => setTargetJob({...targetJob, description: e.target.value})} 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow outline-none text-sm resize-none custom-scrollbar" 
                    placeholder="Paste the job description here for ATS keyword optimization..." 
                  />
                  <p className="text-[11px] text-gray-500 mt-1.5 font-medium">Paste the job description to get a live ATS keyword match score on the right.</p>
                </div>
              </div>
            </section>

            {/* C. Professional Summary */}
            <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <LayoutTemplate className="w-5 h-5 text-blue-600" />
                  <h2 className="text-lg font-bold text-gray-900">Professional Summary</h2>
                </div>
                <button 
                  onClick={generateAISummary}
                  disabled={isGenerating}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50"
                >
                  {isGenerating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  {isGenerating ? 'Generating...' : 'AI Summary'}
                </button>
              </div>
              <textarea 
                rows={4}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Write a brief summary of your professional background..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow outline-none text-sm resize-none custom-scrollbar"
              />
            </section>

            {/* D. Work Experience */}
            <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-blue-600" />
                  <h2 className="text-lg font-bold text-gray-900">Work Experience</h2>
                </div>
                <button onClick={addExperience} className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-gray-100 border border-gray-200 rounded-lg hover:bg-gray-200 transition-colors">
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>
              
              <div className="space-y-6">
                {experience.length === 0 && <p className="text-sm text-gray-500 text-center py-4">No work experience added yet.</p>}
                
                {experience.map((exp, index) => (
                  <div key={exp.id} className="relative p-4 border border-gray-200 rounded-xl bg-gray-50/50">
                    <button onClick={() => removeExperience(exp.id)} className="absolute -top-2 -right-2 bg-white border border-gray-300 text-red-500 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-full shadow-sm transition-colors z-10">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                      <div>
                        <input type="text" value={exp.role} onChange={e => updateExperience(exp.id, 'role', e.target.value)} placeholder="Role / Job Title" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 outline-none text-sm font-medium" />
                      </div>
                      <div>
                        <input type="text" value={exp.company} onChange={e => updateExperience(exp.id, 'company', e.target.value)} placeholder="Company Name" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 outline-none text-sm" />
                      </div>
                      <div>
                        <input type="text" value={exp.start} onChange={e => updateExperience(exp.id, 'start', e.target.value)} placeholder="Start Date (e.g. Jan 2021)" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 outline-none text-sm" />
                      </div>
                      <div>
                        <input type="text" value={exp.end} onChange={e => updateExperience(exp.id, 'end', e.target.value)} placeholder="End Date (e.g. Present)" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 outline-none text-sm" />
                      </div>
                    </div>
                    <textarea 
                      rows={3} 
                      value={exp.desc} 
                      onChange={e => updateExperience(exp.id, 'desc', e.target.value)} 
                      placeholder="Bullet points. Start with action verbs like Developed, Built, Led..." 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 outline-none text-sm resize-none custom-scrollbar" 
                    />
                    <p className="text-xs text-gray-500 mt-1 font-medium">Tip: Press Enter for new bullet points in the preview.</p>
                  </div>
                ))}
              </div>
            </section>

            {/* E. Education */}
            <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-blue-600" />
                  <h2 className="text-lg font-bold text-gray-900">Education</h2>
                </div>
                <button onClick={addEducation} className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-gray-100 border border-gray-200 rounded-lg hover:bg-gray-200 transition-colors">
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>
              
              <div className="space-y-4">
                {education.length === 0 && <p className="text-sm text-gray-500 text-center py-4">No education added yet.</p>}
                
                {education.map(edu => (
                  <div key={edu.id} className="relative p-4 border border-gray-200 rounded-xl bg-gray-50/50 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button onClick={() => removeEducation(edu.id)} className="absolute -top-2 -right-2 bg-white border border-gray-300 text-red-500 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-full shadow-sm transition-colors z-10">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <div className="col-span-1 sm:col-span-2">
                      <input type="text" value={edu.degree} onChange={e => updateEducation(edu.id, 'degree', e.target.value)} placeholder="Degree / Course Name" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 outline-none text-sm font-medium" />
                    </div>
                    <div>
                      <input type="text" value={edu.institute} onChange={e => updateEducation(edu.id, 'institute', e.target.value)} placeholder="Institute Name" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 outline-none text-sm" />
                    </div>
                    <div>
                      <input type="text" value={edu.year} onChange={e => updateEducation(edu.id, 'year', e.target.value)} placeholder="Year (e.g. 2018 - 2022)" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 outline-none text-sm" />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* F. Skills */}
            <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-100">
                <Code className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-bold text-gray-900">Skills *</h2>
              </div>
              <textarea 
                rows={3}
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="React, TypeScript, Node.js, Project Management..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow outline-none text-sm resize-none custom-scrollbar"
              />
              <p className="text-xs text-gray-500 mt-2 font-medium">Enter your skills separated by commas.</p>
            </section>

            {/* G. Projects */}
            <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <LayoutTemplate className="w-5 h-5 text-blue-600" />
                  <h2 className="text-lg font-bold text-gray-900">Projects</h2>
                </div>
                <button onClick={addProject} className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-gray-100 border border-gray-200 rounded-lg hover:bg-gray-200 transition-colors">
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>
              
              <div className="space-y-4">
                {projects.length === 0 && <p className="text-sm text-gray-500 text-center py-4">No projects added yet.</p>}
                
                {projects.map(proj => (
                  <div key={proj.id} className="relative p-4 border border-gray-200 rounded-xl bg-gray-50/50 space-y-3">
                    <button onClick={() => removeProject(proj.id)} className="absolute -top-2 -right-2 bg-white border border-gray-300 text-red-500 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-full shadow-sm transition-colors z-10">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <input type="text" value={proj.name} onChange={e => updateProject(proj.id, 'name', e.target.value)} placeholder="Project Name" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 outline-none text-sm font-medium" />
                      </div>
                      <div>
                        <input type="text" value={proj.tech} onChange={e => updateProject(proj.id, 'tech', e.target.value)} placeholder="Tech Stack (e.g. React, Node.js)" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 outline-none text-sm" />
                      </div>
                    </div>
                    <textarea 
                      rows={2} 
                      value={proj.desc} 
                      onChange={e => updateProject(proj.id, 'desc', e.target.value)} 
                      placeholder="Briefly describe the project..." 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 outline-none text-sm resize-none custom-scrollbar" 
                    />
                  </div>
                ))}
              </div>
            </section>

          </div>

          {/* RIGHT: ATS SCORE & LIVE PREVIEW */}
          <div className="w-full xl:w-[55%] flex flex-col gap-6">
            
            {/* ATS Score Dashboard */}
            <div className={`bg-white p-6 rounded-2xl border ${getScoreBgClass(atsScore.score)} shadow-sm transition-colors duration-500`}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <TrendingUp className={`w-5 h-5 ${getScoreColorClass(atsScore.score)}`} /> Live ATS Score
                </h2>
                <span className="text-xs font-bold bg-white text-gray-700 px-3 py-1.5 rounded-full border border-gray-200 shadow-sm uppercase tracking-wide">
                  Real-time Analysis
                </span>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-8 items-center sm:items-start">
                
                {/* Score Circle */}
                <div className="relative w-36 h-36 flex-shrink-0">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" className="text-white drop-shadow-sm" strokeWidth="12" stroke="currentColor" fill="none" />
                    <circle 
                      cx="50" cy="50" r="42" 
                      className={getScoreColorClass(atsScore.score)} 
                      strokeWidth="12" 
                      strokeDasharray="263.89" 
                      strokeDashoffset={263.89 - (263.89 * atsScore.score) / 100} 
                      strokeLinecap="round" 
                      stroke="currentColor" 
                      fill="none" 
                      style={{ transition: 'stroke-dashoffset 1s ease-in-out, stroke 0.5s ease' }} 
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-black text-gray-900">{atsScore.score}</span>
                    <span className="text-[10px] uppercase font-bold text-gray-500 tracking-widest mt-0.5">out of 100</span>
                  </div>
                </div>

                {/* Quick Stats & Bars */}
                <div className="w-full space-y-5">
                  <div>
                    <div className="flex justify-between items-end mb-1.5">
                      <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Job Keyword Match</span>
                      <span className="text-sm font-black text-gray-900">{atsScore.keywordMatchPercent}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-white rounded-full overflow-hidden border border-gray-200 shadow-inner">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ${atsScore.keywordMatchPercent > 60 ? 'bg-emerald-500' : atsScore.keywordMatchPercent > 30 ? 'bg-amber-500' : 'bg-red-500'}`} 
                        style={{ width: `${Math.max(5, atsScore.keywordMatchPercent)}%` }} 
                      />
                    </div>
                    <p className="text-[11px] text-gray-500 mt-1.5 font-medium">Matching your skills against the Target Job description.</p>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <div className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg shadow-sm flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-xs font-bold text-gray-700">{atsScore.strengths.length} Strengths</span>
                    </div>
                    <div className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg shadow-sm flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                      <span className="text-xs font-bold text-gray-700">{atsScore.suggestions.length + atsScore.missing.length} Improvements</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detailed Insights */}
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-gray-200/60">
                <div>
                  <h4 className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4" /> Strong Points
                  </h4>
                  <ul className="text-xs text-gray-700 space-y-2 font-medium">
                    {atsScore.strengths.length === 0 && <li className="text-gray-500 italic">No strengths identified yet.</li>}
                    {atsScore.strengths.slice(0, 4).map((s, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-emerald-500 font-bold mt-0.5">•</span> 
                        <span className="leading-tight">{s}</span>
                      </li>
                    ))}
                    {atsScore.strengths.length > 4 && <li className="text-gray-500 pl-3 italic">+ {atsScore.strengths.length - 4} more</li>}
                  </ul>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" /> Recommendations
                  </h4>
                  <ul className="text-xs text-gray-700 space-y-2 font-medium">
                    {atsScore.missing.length === 0 && atsScore.suggestions.length === 0 && <li className="text-gray-500 italic">Resume looks well optimized!</li>}
                    {[...atsScore.missing, ...atsScore.suggestions].slice(0, 4).map((s, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-amber-500 font-bold mt-0.5">•</span> 
                        <span className="leading-tight">{s}</span>
                      </li>
                    ))}
                    {([...atsScore.missing, ...atsScore.suggestions].length > 4) && <li className="text-gray-500 pl-3 italic">+ {([...atsScore.missing, ...atsScore.suggestions].length - 4)} more</li>}
                  </ul>
                </div>
              </div>
            </div>
            
            {/* Live Preview Document Wrapper */}
            <div className="w-full overflow-x-auto max-w-full bg-gray-200/50 p-4 sm:p-6 rounded-2xl border border-gray-200 shadow-inner custom-scrollbar">
              
              {/* A4 Resume Container */}
              <div 
                id="resume-preview-container" 
                className="bg-white mx-auto relative shadow-sm"
                style={{ 
                  width: '100%', 
                  maxWidth: '794px', 
                  minWidth: 'min(794px, 100%)', // Responsive scaling for mobile
                  minHeight: '1123px', // Standard A4 height
                  padding: 'clamp(20px, 5vw, 50px)',
                  fontFamily: '"Inter", "system-ui", sans-serif',
                  color: '#1f2937' // gray-800
                }}
              >
                {/* Header */}
                <div className="text-center border-b-2 border-gray-800 pb-5 mb-6">
                  <h1 className="text-3xl font-black text-gray-900 uppercase tracking-widest">{personal.name || 'Your Name'}</h1>
                  <p className="text-lg font-medium text-gray-700 mt-1.5 uppercase tracking-wider">{personal.title}</p>
                  <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 mt-3 text-[13px] text-gray-600 font-medium">
                    {personal.email && <span>{personal.email}</span>}
                    {personal.phone && <span>• {personal.phone}</span>}
                    {personal.location && <span>• {personal.location}</span>}
                    {personal.linkedin && <span>• {personal.linkedin}</span>}
                    {personal.portfolio && <span>• {personal.portfolio}</span>}
                  </div>
                </div>
                
                {/* Summary */}
                {summary && (
                  <div className="mb-6">
                    <h2 className="text-[15px] font-bold text-gray-900 uppercase border-b border-gray-300 pb-1 mb-2 tracking-wide">Professional Summary</h2>
                    <p className="text-[13px] text-gray-800 leading-relaxed text-justify">{summary}</p>
                  </div>
                )}
                
                {/* Experience */}
                {experience.length > 0 && (
                  <div className="mb-6">
                    <h2 className="text-[15px] font-bold text-gray-900 uppercase border-b border-gray-300 pb-1 mb-3 tracking-wide">Work Experience</h2>
                    <div className="space-y-4">
                      {experience.map(exp => (
                        <div key={exp.id}>
                          <div className="flex justify-between items-baseline mb-1">
                            <div>
                              <h3 className="text-[14px] font-bold text-gray-900">{exp.role}</h3>
                              <p className="text-[13px] text-gray-700 font-semibold">{exp.company}</p>
                            </div>
                            <span className="text-[13px] text-gray-600 font-medium whitespace-nowrap">{exp.start} {exp.start && exp.end ? '—' : ''} {exp.end}</span>
                          </div>
                          {exp.desc && (
                            <ul className="list-disc list-inside text-[13px] text-gray-800 space-y-1 mt-1.5">
                              {exp.desc.split('\n').filter(line => line.trim() !== '').map((line, i) => (
                                <li key={i} className="leading-relaxed"><span className="-ml-1">{line.replace(/^- /, '')}</span></li>
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
                  <div className="mb-6">
                    <h2 className="text-[15px] font-bold text-gray-900 uppercase border-b border-gray-300 pb-1 mb-3 tracking-wide">Projects</h2>
                    <div className="space-y-3">
                      {projects.map(proj => (
                        <div key={proj.id}>
                          <div className="flex items-baseline gap-2 mb-1">
                            <h3 className="text-[14px] font-bold text-gray-900">{proj.name}</h3>
                            {proj.tech && <span className="text-[12px] text-gray-600 font-medium border-l border-gray-300 pl-2">{proj.tech}</span>}
                          </div>
                          {proj.desc && <p className="text-[13px] text-gray-800 leading-relaxed">{proj.desc}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Education */}
                {education.length > 0 && (
                  <div className="mb-6">
                    <h2 className="text-[15px] font-bold text-gray-900 uppercase border-b border-gray-300 pb-1 mb-3 tracking-wide">Education</h2>
                    <div className="space-y-3">
                      {education.map(edu => (
                        <div key={edu.id} className="flex justify-between items-baseline">
                          <div>
                            <h3 className="text-[14px] font-bold text-gray-900">{edu.degree}</h3>
                            <p className="text-[13px] text-gray-700 font-medium">{edu.institute}</p>
                          </div>
                          <span className="text-[13px] text-gray-600 font-medium whitespace-nowrap">{edu.year}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Skills */}
                {skills && (
                  <div>
                    <h2 className="text-[15px] font-bold text-gray-900 uppercase border-b border-gray-300 pb-1 mb-2 tracking-wide">Skills</h2>
                    <p className="text-[13px] text-gray-800 leading-relaxed font-medium">{skills}</p>
                  </div>
                )}
                
              </div>
            </div>
            
            {/* Mobile Download Button (Visible only on small screens) */}
            <div className="xl:hidden mt-2">
              <button 
                onClick={downloadPDF}
                disabled={isDownloading}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 shadow-md"
              >
                {isDownloading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                {isDownloading ? 'Generating PDF...' : 'Download Resume PDF'}
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
