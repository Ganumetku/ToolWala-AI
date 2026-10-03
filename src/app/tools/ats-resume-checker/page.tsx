"use client";

import Link from 'next/link';
import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, UploadCloud, Trash2, Shield, RefreshCw, AlertTriangle,
  CheckCircle2, ChevronLeft, ArrowRight, Sparkles, Copy, Check,
  FileDown, Printer, Share2, Info, Lock, BookOpen, Briefcase, Award,
  Activity, Zap, User, Mail, Phone, MapPin, AlertCircle,
  ThumbsUp, CheckSquare, HelpCircle, Compass, Eye, ShieldAlert, AwardIcon
} from 'lucide-react';
import { toast } from 'sonner';
import ToolArticle from '@/components/ToolArticle';
import { toolArticles } from '@/data/toolArticles';
import { MeshGradient } from '@/components/BackgroundEffects';
import { useTranslation } from '@/components/I18nContext';
import PdfToolIcon from '@/components/PdfToolIcon';

// ----------------------------------------------------------------------
// CONSTANTS & DICTIONARIES
// ----------------------------------------------------------------------

const TARGET_ROLE_EXAMPLES = [
  "Software Engineer",
  "Frontend Developer",
  "Data Analyst",
  "Graphic Designer",
  "Product Manager",
  "Digital Marketing",
  "HR Executive",
  "Accountant",
  "Sales Executive"
];

const TECHNICAL_SKILLS = [
  "react", "next.js", "angular", "vue", "javascript", "typescript", "node.js", "express",
  "python", "django", "flask", "fastapi", "java", "spring", "c++", "c#", ".net", "go",
  "golang", "ruby", "rails", "php", "laravel", "sql", "postgresql", "mysql", "mongodb",
  "redis", "graphql", "aws", "azure", "gcp", "docker", "kubernetes", "git", "ci/cd",
  "terraform", "linux", "html", "css", "tailwind", "bootstrap", "sass", "webpack",
  "vite", "redux", "jest", "cypress", "machine learning", "nlp", "computer vision",
  "tensorflow", "pytorch", "pandas", "numpy", "tableau", "power bi", "seo", "sem",
  "google analytics", "ui/ux", "figma", "sketch", "photoshop", "illustrator",
  "agile", "scrum", "jira"
];

const SOFT_SKILLS = [
  "leadership", "communication", "teamwork", "collaboration", "problem solving",
  "critical thinking", "time management", "adaptability", "conflict resolution",
  "public speaking", "mentoring", "negotiation", "creativity", "interpersonal",
  "organization", "work ethic"
];

const WEAK_VERBS: Record<string, string[]> = {
  "worked": ["developed", "implemented", "executed", "engineered"],
  "helped": ["spearheaded", "coordinated", "facilitated", "partnered"],
  "did": ["executed", "accomplished", "delivered", "championed"],
  "responsible for": ["orchestrated", "managed", "supervised", "directed"],
  "assisted": ["facilitated", "collaborated", "supported"],
  "handled": ["administered", "steered", "directed", "oversaw"],
  "made": ["formulated", "authored", "designed", "created"],
  "led": ["championed", "orchestrated", "steered", "guided"],
  "managed": ["orchestrated", "supervised", "oversaw", "directed"],
  "designed": ["architected", "conceptualized", "pioneered"],
  "developed": ["engineered", "formulated", "constructed"],
  "used": ["leveraged", "employed", "utilized", "deployed"]
};

const ACTION_VERBS = [
  "managed", "developed", "designed", "led", "implemented", "optimized", "created",
  "delivered", "improved", "automated", "spearheaded", "coordinated", "formulated",
  "streamlined", "orchestrated", "engineered", "executed", "architected", "pioneered",
  "transformed", "achieved", "exceeded", "maximized", "minimized", "collaborated"
];

const GUIDES = [
  {
    id: "ats-works",
    title: "How ATS Works",
    icon: "⚙️",
    summary: "Understand the technology behind Applicant Tracking Systems and how they scan and rank resumes.",
    content: `
### What is an ATS?
An Applicant Tracking System (ATS) is software used by employers to collect, organize, and filter job applications. Instead of reading every resume, recruiters use the ATS to search for keywords matching the job description and screen out unqualified candidates.

### The Parsing Process
When you submit a resume, the ATS uses a parser to convert it into structured plain text. The parser tries to identify:
1. **Contact details** (Name, email, phone, location)
2. **Sections** (Work Experience, Education, Skills)
3. **Roles & Timelines** (Job titles, company names, start/end dates)

### Why Resumes Get Rejected
- **Unreadable Formats:** Graphics, icons, tables, and columns can confuse the parser, causing it to scramble or miss important text.
- **Keyword Mismatch:** If your resume lacks the specific skills listed in the job description, you will receive a low relevance score.
- **Complex Templates:** Text boxes and header/footer content are often completely ignored by older ATS systems.
    `
  },
  {
    id: "writing-tips",
    title: "Resume Writing Tips",
    icon: "✍️",
    summary: "Write a high-impact, professional resume that resonates with both machines and humans.",
    content: `
### Keep it Clean and Structured
- **Use a single column:** Multi-column layouts look great to humans but are the #1 cause of ATS parsing errors.
- **Stick to standard sections:** Use clear headings like "Professional Experience", "Education", and "Skills". Avoid creative labels like "Where I've Been" or "My Toolbox".
- **Choose standard fonts:** Stick to Arial, Calibri, Times New Roman, Garamond, or Georgia.

### Highlight Achievements, Not Just Duties
Instead of writing a list of day-to-day responsibilities, focus on the impact you made.
- *Weak:* "Responsible for managing social media accounts."
- *Strong:* "Grew social media engagement by 45% over 6 months by executing a targeted content strategy."

### The STAR Method
When detailing project accomplishments, structure them using the STAR method:
- **S**ituation: The context of the problem.
- **T**ask: What you needed to achieve.
- **A**ction: The specific steps you took.
- **R**esults: The quantifiable outcome (e.g. saved 15 hours/week, increased conversions by 12%).
    `
  },
  {
    id: "keywords-guide",
    title: "Resume Keywords",
    icon: "🔑",
    summary: "How to extract keywords from job descriptions and place them naturally in your resume.",
    content: `
### The Power of Keywords
ATS ranking algorithms work like a search engine. If a recruiter searches for "React Developer", resumes containing "React" multiple times will rank higher. However, you must avoid "keyword stuffing" (listing words repeatedly without context), as human recruiters will immediately reject it.

### How to Find Keywords
1. **Review the Job Description:** Read the job posting and highlight nouns, hard skills, certifications, and tools.
2. **Prioritize Frequency:** Skills listed multiple times or in the "Required Qualifications" section carry the most weight.
3. **Match Spellings Exactly:** If the job description asks for "Project Management", don't write "Managing Projects". Use the exact phrasing.

### Where to Place Keywords
- **Skills Section:** Create a dedicated bulleted grid of core skills at the top or bottom of your resume.
- **Work History:** Integrate keywords naturally into your bullet points, demonstrating *how* you used each skill.
- **Professional Summary:** Include 2-3 target keywords in your opening statement.
    `
  },
  {
    id: "formatting-guide",
    title: "Resume Formatting Guide",
    icon: "📏",
    summary: "Standard margins, typography, file extensions, and page limits to pass automated audits.",
    content: `
### File Format Rules
- **PDF vs. DOCX:** Both are widely accepted. Modern ATS parse PDF files perfectly, but if you are applying to an older portal, a DOCX file is the safest fallback. Always check the application page instructions.
- **Max File Size:** Keep file size below 5MB to ensure it loads instantly.

### Geometry & Layout Guidelines
- **Margins:** Standard 0.5-inch to 1-inch margins on all sides.
- **Spacing:** Use 1.0 to 1.15 line spacing. Avoid dense walls of text.
- **Section Breaks:** Use standard vertical line spacing to separate sections instead of colored background banners or tables.
- **Text Boxes:** Never wrap contact info or skills in text boxes. Most parsers treat text boxes as images and ignore the content completely.
- **Tables:** Avoid nesting tables. If you must use a table, keep it simple and borderless.
    `
  },
  {
    id: "linkedin-tips",
    title: "LinkedIn Profile Tips",
    icon: "💼",
    summary: "Align your resume with your public LinkedIn profile and optimize for social recruiter searches.",
    content: `
### Consistency is Key
Recruiters will cross-reference your resume with your LinkedIn profile. Discrepancies in dates, job titles, or company names raise red flags.

### Profile Optimization Steps
1. **Customize Your Headline:** Don't just list your job title. Write an impact statement, e.g. "Software Engineer | Specializing in high-performance Next.js apps & UX optimization".
2. **Write a Conversational Summary:** Use the "About" section to tell your career story in the first person. Express your passion, key skills, and what you're looking for.
3. **Turn on 'Open to Work':** Signal to recruiters that you are actively seeking opportunities, either publicly or just to recruiters.
4. **Collect Recommendations:** Ask previous managers or colleagues to write short recommendations on your profile to build social proof.
    `
  },
  {
    id: "interview-prep",
    title: "Interview Preparation",
    icon: "🤝",
    summary: "Prepare for your interview using your optimized resume as a guide.",
    content: `
### Know Your Resume
Every line, project, and bullet point on your resume is fair game during an interview. Be prepared to explain the technical details and business outcomes of anything you've written.

### Standard Interview Checklists
- **Elevator Pitch:** Prepare a 60-second summary answering "Tell me about yourself" that highlights your top 3 achievements.
- **STAR Stories:** Have 4-5 stories ready that illustrate conflict resolution, overcoming technical challenges, leadership, and successful delivery.
- **Ask Strategic Questions:** At the end of the interview, ask questions that show your interest, e.g. "What does success look like in this role during the first 90 days?" or "What is the biggest challenge the team is currently facing?"
    `
  }
];

// Custom local SVG Icons
function GithubIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} suppressHydrationWarning xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/>
    </svg>
  );
}

function LinkedinIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} suppressHydrationWarning xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/>
    </svg>
  );
}

// ----------------------------------------------------------------------
// DATA TYPES
// ----------------------------------------------------------------------

type AnalysisResult = {
  overallScore: number;
  formattingScore: number;
  atsStructureScore: number;
  contactScore: number;
  experienceScore: number;
  projectsScore: number;
  skillsScore: number;
  educationScore: number;
  keywordScore: number | null; // N/A if JD missing
  
  // Section checklist
  sections: {
    summary: boolean;
    skills: boolean;
    experience: boolean;
    projects: boolean;
    certifications: boolean;
    education: boolean;
    languages: boolean;
    achievements: boolean;
  };

  // Contacts detected
  contacts: {
    name: string | null;
    email: string | null;
    phone: string | null;
    linkedin: string | null;
    github: string | null;
    portfolio: string | null;
  };

  // Keywords (if JD is provided)
  keywords: {
    matched: string[];
    missing: string[];
    recommended: string[];
    density: number;
    techMatched: string[];
    softMatched: string[];
    missingTech: string[];
    missingSoft: string[];
    missingVerbs: string[];
    resumeMatchPercentage: number;
  };

  // Formatting warnings & general audits
  warnings: {
    id: string;
    title: string;
    description: string;
    severity: 'critical' | 'warning' | 'info';
  }[];

  // Suggestions list
  suggestions: string[];

  // Action verbs
  weakVerbsFound: { word: string; suggestions: string[] }[];
  actionVerbsCount: number;

  // Insights audits
  experienceLevel: 'Junior' | 'Mid-Level' | 'Senior' | 'Executive';
  readTime: number; // in minutes
  wordCount: number;
  pageCount: number;
  topSkills: string[];
  missingSkills: string[];
  
  // Extra Insights
  bulletConsistency: boolean;
  dateFormattingInconsistent: boolean;
  sectionOrderCorrect: boolean;
  whiteSpaceRatio: 'Optimal' | 'Low' | 'High';
  readabilityLevel: 'Easy' | 'Intermediate' | 'Difficult';
  isOnePage: boolean;
  isAtsFriendly: boolean;
};

export default function AtsResumeChecker() {
  const { t } = useTranslation();
  
  // Script loaded flags
  const [pdfjs, setPdfjs] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  // Form States
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [targetRole, setTargetRole] = useState("");
  const [jdText, setJdText] = useState("");
  const [jdFile, setJdFile] = useState<File | null>(null);

  // UI States
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDraggingOverResume, setIsDraggingOverResume] = useState(false);
  const [isDraggingOverJd, setIsDraggingOverJd] = useState(false);
  
  // Selected Tab in Dashboard
  const [activeTab, setActiveTab] = useState<'overview' | 'keywords' | 'formatting' | 'verbs' | 'insights'>('overview');

  // Dynamic Content Slider Modal
  const [activeGuide, setActiveGuide] = useState<typeof GUIDES[0] | null>(null);

  // Analysis Result
  const [result, setResult] = useState<AnalysisResult | null>(null);

  // Refs
  const resumeInputRef = useRef<HTMLInputElement>(null);
  const jdFileInputRef = useRef<HTMLInputElement>(null);

  // Load PDF.js worker client-side
  useEffect(() => {
    setMounted(true);
    const loadPdfjs = async () => {
      try {
        const lib = await import('pdfjs-dist');
        lib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
        setPdfjs(lib);
      } catch (err) {
        console.error("Failed to load pdfjs-dist:", err);
      }
    };
    loadPdfjs();
  }, []);

  // Handle Dynamic SEO schemas
  const jsonLdSchema = useMemo(() => {
    return {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "SoftwareApplication",
          "@id": "https://toolwala.co/tools/ats-resume-checker#software",
          "name": "ATS Resume Checker",
          "description": "Evaluate and audit your CV resume against modern Applicant Tracking System guidelines client-side for 100% data safety.",
          "applicationCategory": "BusinessApplication",
          "operatingSystem": "Web Browser",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
          }
        },
        {
          "@type": "FAQPage",
          "@id": "https://toolwala.co/tools/ats-resume-checker#faq",
          "mainEntity": GUIDES.map(g => ({
            "@type": "Question",
            "name": g.title,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": g.summary
            }
          }))
        }
      ]
    };
  }, []);

  // ----------------------------------------------------------------------
  // UTILITIES & HELPER PARSERS
  // ----------------------------------------------------------------------

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Extracts text from PDF
  const extractTextFromPdf = async (file: File): Promise<{ text: string; pages: number; lines: any[] }> => {
    if (!pdfjs) throw new Error("PDF parser engine not initialized.");
    const arrayBuffer = await file.arrayBuffer();
    const safeBuffer = arrayBuffer.slice(0);
    const loadingTask = pdfjs.getDocument({ data: safeBuffer });
    const doc = await loadingTask.promise;
    const totalPages = doc.numPages;
    let fullText = "";
    let extractedLines: any[] = [];

    for (let i = 1; i <= totalPages; i++) {
      const page = await doc.getPage(i);
      const textContent = await page.getTextContent();
      const items = textContent.items.map((item: any) => ({
        text: item.str,
        x: item.transform[4],
        y: item.transform[5],
        height: item.height || Math.abs(item.transform[3]) || 10
      }));

      // Sort by Y descending (top-to-bottom) then X ascending (left-to-right)
      items.sort((a: any, b: any) => {
        if (Math.abs(a.y - b.y) > 4) return b.y - a.y;
        return a.x - b.x;
      });

      // Group items on the same horizontal lines
      let pageLines: any[] = [];
      for (const item of items) {
        if (!item.text.trim()) continue;
        let added = false;
        for (let line of pageLines) {
          if (Math.abs(line.y - item.y) <= 4) {
            line.text += (line.text.endsWith(" ") || item.text.startsWith(" ") ? "" : " ") + item.text;
            line.items.push(item);
            added = true;
            break;
          }
        }
        if (!added) {
          pageLines.push({
            text: item.text,
            x: item.x,
            y: item.y,
            height: item.height,
            page: i,
            items: [item]
          });
        }
      }

      extractedLines = [...extractedLines, ...pageLines];
      fullText += pageLines.map(l => l.text).join("\n") + "\n";
    }

    return { text: fullText, pages: totalPages, lines: extractedLines };
  };

  // Extracts text from DOCX using JSZip and DOMParser
  const extractTextFromDocx = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const JSZip = (await import('jszip')).default;
    const zip = await JSZip.loadAsync(arrayBuffer);
    const docXmlText = await zip.file("word/document.xml")?.async("text");
    if (!docXmlText) throw new Error("Invalid DOCX structure: Missing word/document.xml.");
    
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(docXmlText, "text/xml");
    const paragraphs = xmlDoc.getElementsByTagName("w:p");
    let text = "";
    for (let i = 0; i < paragraphs.length; i++) {
      const textNodes = paragraphs[i].getElementsByTagName("w:t");
      let pText = "";
      for (let j = 0; j < textNodes.length; j++) {
        pText += textNodes[j].textContent || "";
      }
      text += pText + "\n";
    }
    return text;
  };

  // ----------------------------------------------------------------------
  // RESUME SCORING & AUDIT ENGINE (UPGRADED ALGORITHM)
  // ----------------------------------------------------------------------

  const analyzeResume = (
    resumeText: string,
    pdfLines: any[],
    totalPages: number,
    jdRawText: string
  ): AnalysisResult => {
    const cleanText = resumeText.replace(/\s+/g, ' ');
    const lowerText = cleanText.toLowerCase();

    // 1. Contact Information Regex Checks
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
    const emailMatch = cleanText.match(emailRegex);
    const email = emailMatch ? emailMatch[0] : null;

    const phoneRegex = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
    const phoneMatch = cleanText.match(phoneRegex);
    const phone = phoneMatch ? phoneMatch[0] : null;

    const linkedinRegex = /linkedin\.com\/in\/[a-zA-Z0-9_-]+/i;
    const linkedinMatch = cleanText.match(linkedinRegex);
    const linkedin = linkedinMatch ? linkedinMatch[0] : null;

    const githubRegex = /github\.com\/[a-zA-Z0-9_-]+/i;
    const githubMatch = cleanText.match(githubRegex);
    const github = githubMatch ? githubMatch[0] : null;

    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = cleanText.match(urlRegex) || [];
    const portfolioUrl = urls.find(url => !url.includes("linkedin.com") && !url.includes("github.com")) || null;

    // Name Extraction Heuristic
    const lines = resumeText.split("\n").map(l => l.trim()).filter(l => l.length > 0);
    let name: string | null = null;
    for (let i = 0; i < Math.min(3, lines.length); i++) {
      const line = lines[i];
      if (
        !emailRegex.test(line) &&
        !phoneRegex.test(line) &&
        !line.includes("http") &&
        line.split(" ").length >= 2 &&
        line.split(" ").length <= 4 &&
        /^[A-Z][a-z]+(\s+[A-Z][a-z]+)+$/.test(line)
      ) {
        name = line;
        break;
      }
    }
    if (!name && lines.length > 0) {
      name = lines.find(l => !l.includes("@") && !l.includes("+") && l.split(" ").length >= 2 && l.split(" ").length <= 4) || "Candidate Name";
    }

    // 2. Sections checklists
    const sections = {
      summary: /summary|profile|objective|about\s+me/i.test(lowerText),
      skills: /skills|abilities|core\s+competencies|expertise|tools/i.test(lowerText),
      experience: /experience|employment|work\s+history|career\s+history|professional\s+background/i.test(lowerText),
      projects: /projects|academic\s+projects|personal\s+projects/i.test(lowerText),
      certifications: /certifications|certificates|licenses|courses|awards/i.test(lowerText),
      education: /education|academic\s+history|degrees|credentials/i.test(lowerText),
      languages: /languages/i.test(lowerText),
      achievements: /achievements|accomplishments|publications/i.test(lowerText)
    };

    // 3. Formatting Audits
    const warnings: AnalysisResult['warnings'] = [];
    let formattingScore = 100;
    let hasColumns = false;

    if (pdfLines.length > 0) {
      const yMap: Record<number, any[]> = {};
      pdfLines.forEach(l => {
        const roundedY = Math.round(l.y / 15) * 15;
        if (!yMap[roundedY]) yMap[roundedY] = [];
        yMap[roundedY].push(l);
      });

      let splitLines = 0;
      Object.keys(yMap).forEach(y => {
        const lineGroup = yMap[Number(y)];
        if (lineGroup.length >= 2) {
          const xCoords = lineGroup.map(item => item.x).sort((a, b) => a - b);
          const maxDiff = xCoords[xCoords.length - 1] - xCoords[0];
          if (maxDiff > 200) splitLines++;
        }
      });

      if (splitLines > 5) {
        hasColumns = true;
        warnings.push({
          id: 'columns',
          title: 'Multi-Column Layout Grid',
          description: 'Your resume uses a multi-column formatting grid. Many legacy Applicant Tracking Systems parse text left-to-right globally, which scrambles content order across columns.',
          severity: 'warning'
        });
        formattingScore -= 20;
      }
    }

    // Table elements check
    const tableKeywords = /table|row|column|cell/i;
    if (tableKeywords.test(lowerText) || (pdfLines.length > 0 && !hasColumns && pdfLines.filter(l => l.text.includes(" | ") || l.text.includes("  ")).length > 10)) {
      warnings.push({
        id: 'tables',
        title: 'Potential Structured Tables',
        description: 'Using table cells, structural borders, or heavy vertical dividers to format elements can lead to text blocks fusing together in parsing databases.',
        severity: 'warning'
      });
      formattingScore -= 15;
    }

    // Special icons/glyphs checks
    const specialCharsCount = (lowerText.match(/[^a-zA-Z0-9\s,.\-@_()]/g) || []).length;
    if (specialCharsCount > 15) {
      warnings.push({
        id: 'graphics',
        title: 'Excessive Special Glyphs & Icons',
        description: 'Large quantities of graphical symbols, rating stars, progress graphics, or complex glyphs can break encoding when converted to plain text by the ATS parser.',
        severity: 'warning'
      });
      formattingScore -= 10;
    }

    // Length check
    if (totalPages > 2) {
      warnings.push({
        id: 'page-length',
        title: 'Resume Exceeds 2 Pages',
        description: 'Recruiters prefer standard 1-to-2 page resumes. Longer files reduce parsing density and may be flagged for lack of conciseness.',
        severity: 'info'
      });
      formattingScore -= 10;
    }
    formattingScore = Math.max(30, formattingScore);

    // 4. ATS Structure Score (Presence of Core Sections)
    let atsStructureScore = 0;
    if (sections.summary) atsStructureScore += 20;
    if (sections.experience) atsStructureScore += 25;
    if (sections.skills) atsStructureScore += 20;
    if (sections.education) atsStructureScore += 15;
    if (sections.projects) atsStructureScore += 10;
    if (sections.certifications) atsStructureScore += 5;
    if (sections.languages) atsStructureScore += 5;
    atsStructureScore = Math.max(10, atsStructureScore);

    // 5. Contact Information Score
    let contactScore = 0;
    if (name && name !== "Candidate Name") contactScore += 30;
    if (email) contactScore += 25;
    if (phone) contactScore += 20;
    if (linkedin) contactScore += 15;
    if (github) contactScore += 8;
    if (portfolioUrl) contactScore += 2;
    contactScore = Math.max(15, contactScore);

    // 6. Experience Quality Score (Action verbs, timelines, metrics)
    const verbsFound = ACTION_VERBS.filter(v => lowerText.includes(v));
    const actionVerbsCount = verbsFound.length;

    // Check for quantifiable metric numbers e.g. "20%", "$10k", "5x"
    const hasMetrics = /[\d]+[%$]|increased|decreased|saved|reduced/i.test(lowerText);
    
    let experienceScore = 0;
    if (sections.experience) experienceScore += 30;
    if (actionVerbsCount >= 6) experienceScore += 25;
    if (hasMetrics) experienceScore += 30;
    
    // Estimate experience level
    let experienceLevel: AnalysisResult['experienceLevel'] = 'Mid-Level';
    const yearsMatches = cleanText.match(/\b(19\d{2}|20\d{2})\b/g);
    if (yearsMatches && yearsMatches.length >= 2) {
      const years = yearsMatches.map(Number);
      const minYear = Math.min(...years);
      const maxYear = Math.max(...years);
      const span = maxYear - minYear;
      if (span <= 2) experienceLevel = 'Junior';
      else if (span <= 5) experienceLevel = 'Mid-Level';
      else if (span <= 10) experienceLevel = 'Senior';
      else experienceLevel = 'Executive';
      experienceScore += 15;
    } else {
      if (lowerText.includes("junior") || lowerText.includes("intern")) experienceLevel = 'Junior';
      else if (lowerText.includes("senior") || lowerText.includes("lead")) experienceLevel = 'Senior';
      else if (lowerText.includes("director") || lowerText.includes("vp") || lowerText.includes("executive")) experienceLevel = 'Executive';
      experienceScore += 10;
    }
    experienceScore = Math.max(10, experienceScore);

    // 7. Projects Score
    let projectsScore = 0;
    if (sections.projects) {
      projectsScore += 70;
      // Heuristic checks for items in projects
      const linesWithLinks = lines.filter(l => l.includes("http") || l.includes("github.com"));
      if (linesWithLinks.length > 0) projectsScore += 15;
      if (lines.length > 10) projectsScore += 15;
    } else {
      if (sections.experience) projectsScore = 60; // baseline fallback if heavy experience
      else projectsScore = 20;
    }
    projectsScore = Math.min(100, Math.max(20, projectsScore));

    // 8. Skills Score
    const foundTech = TECHNICAL_SKILLS.filter(s => lowerText.includes(s));
    const foundSoft = SOFT_SKILLS.filter(s => lowerText.includes(s));
    const totalSkillsFound = foundTech.length + foundSoft.length;
    let skillsScore = Math.min(100, Math.round((totalSkillsFound / 12) * 100));
    skillsScore = Math.max(30, skillsScore);

    // 9. Education Score
    let educationScore = 40;
    if (sections.education) educationScore += 40;
    if (sections.certifications) educationScore += 20;
    educationScore = Math.max(40, educationScore);

    // 10. Readability Score
    const words = resumeText.split(/\s+/).filter(w => w.length > 0);
    const wordCount = words.length;
    const readTime = Math.max(1, Math.round(wordCount / 200));

    let readabilityScore = 100;
    if (wordCount < 250) readabilityScore -= 30;
    else if (wordCount > 1000) readabilityScore -= 15;
    
    // Paragraph length heuristics
    const paragraphs = resumeText.split("\n\n");
    const longParagraphs = paragraphs.filter(p => p.split(/\s+/).length > 120);
    if (longParagraphs.length > 0) {
      readabilityScore -= 15;
      warnings.push({
        id: 'long-paragraphs',
        title: 'Long Text Paragraphs',
        description: 'We detected paragraphs containing more than 120 words. Long blocks of text reduce readability for recruiters and are difficult for ATS parsers to segment.',
        severity: 'warning'
      });
    }
    readabilityScore = Math.max(40, readabilityScore);

    // Dynamic Intelligent Warnings
    if (!sections.summary) {
      warnings.push({ id: 'no-summary', title: 'No Professional Summary', description: 'Your resume lacks a professional summary objective. ATS software expects an introductory summary explaining your value.', severity: 'warning' });
    }
    if (!linkedin) {
      warnings.push({ id: 'no-linkedin', title: 'No LinkedIn Profile URL', description: 'Adding your personalized LinkedIn profile URL provides credibility and allows social cross-referencing.', severity: 'warning' });
    }
    if (!github && (targetRole.toLowerCase().includes("developer") || targetRole.toLowerCase().includes("engineer"))) {
      warnings.push({ id: 'no-github', title: 'No GitHub Link', description: 'Technical resumes should include a link to personal repository code pages for portfolio reviews.', severity: 'info' });
    }
    if (!sections.certifications) {
      warnings.push({ id: 'no-certifications', title: 'No Certifications Listed', description: 'Including courses and industry certificates builds trust and matches key requirements.', severity: 'info' });
    }
    if (!hasMetrics) {
      warnings.push({ id: 'no-metrics', title: 'No Quantified Impact', description: 'Descriptions lack metrics (%, $). Bullet points should list measurable results to score experience strength.', severity: 'warning' });
    }

    // 11. Action Verbs Audit & Weak Verbs replacements
    const weakVerbsFound: { word: string; suggestions: string[] }[] = [];
    Object.keys(WEAK_VERBS).forEach(weak => {
      const regex = new RegExp(`\\b${weak}\\b`, 'i');
      if (regex.test(lowerText)) {
        weakVerbsFound.push({
          word: weak.charAt(0).toUpperCase() + weak.slice(1),
          suggestions: WEAK_VERBS[weak]
        });
      }
    });
    if (weakVerbsFound.length > 0) {
      warnings.push({
        id: 'weak-verbs',
        title: 'Weak / Repetitive Action Verbs',
        description: 'Using passive verbs (like "worked", "helped") decreases the perceived ownership of achievements. Upgrade to stronger verbs.',
        severity: 'info'
      });
    }

    // 12. Keywords & Job Description Matching
    let keywordScore: number | null = null;
    const matched: string[] = [];
    const missing: string[] = [];
    let recommended: string[] = [];
    let density = 0;
    
    const techMatched: string[] = [];
    const softMatched: string[] = [];
    const missingTech: string[] = [];
    const missingSoft: string[] = [];
    const missingVerbs: string[] = [];
    let resumeMatchPercentage = 0;

    if (jdRawText && jdRawText.trim().length > 0) {
      const cleanJd = jdRawText.toLowerCase().replace(/[^a-zA-Z0-9\s#+.]/g, ' ');
      const jdWords = cleanJd.split(/\s+/).filter(w => w.length > 2);
      
      const stopWords = ["the", "and", "for", "with", "this", "that", "from", "your", "will", "have", "been", "must", "with", "about"];
      const jdKeywords = Array.from(new Set(jdWords.filter(w => !stopWords.includes(w))));

      const combinedSkillsList = [...TECHNICAL_SKILLS, ...SOFT_SKILLS];
      const jdSpecificSkills = combinedSkillsList.filter(skill => jdRawText.toLowerCase().includes(skill));

      jdSpecificSkills.forEach(skill => {
        if (lowerText.includes(skill)) {
          matched.push(skill);
          if (TECHNICAL_SKILLS.includes(skill)) techMatched.push(skill);
          if (SOFT_SKILLS.includes(skill)) softMatched.push(skill);
        } else {
          missing.push(skill);
          if (TECHNICAL_SKILLS.includes(skill)) missingTech.push(skill);
          if (SOFT_SKILLS.includes(skill)) missingSoft.push(skill);
        }
      });

      // Find missing action verbs from job description
      ACTION_VERBS.forEach(verb => {
        if (jdRawText.toLowerCase().includes(verb) && !lowerText.includes(verb)) {
          missingVerbs.push(verb);
        }
      });

      // Recommended additions
      recommended = combinedSkillsList
        .filter(s => !matched.includes(s) && !missing.includes(s))
        .slice(0, 5);

      if (jdSpecificSkills.length > 0) {
        keywordScore = Math.round((matched.length / jdSpecificSkills.length) * 100);
        resumeMatchPercentage = Math.round((matched.length / (jdSpecificSkills.length || 1)) * 100);
      } else {
        keywordScore = 80;
        resumeMatchPercentage = 80;
      }
      density = parseFloat(((matched.length * 2) / (wordCount || 1) * 100).toFixed(1));
    } else {
      // Default: If targetRole provided, extract matching industry expectations
      const target = targetRole.toLowerCase();
      const roleKeywords = TECHNICAL_SKILLS.filter(s => target.includes(s) || s === target);
      if (roleKeywords.length > 0) {
        roleKeywords.forEach(k => {
          if (lowerText.includes(k)) matched.push(k);
          else missing.push(k);
        });
        recommended = TECHNICAL_SKILLS.filter(s => !matched.includes(s) && !missing.includes(s)).slice(0, 5);
      } else {
        recommended = ["React", "SQL", "Python", "Communication", "Management"];
      }
    }

    // 13. Personalized Recommendations
    const suggestions: string[] = [];
    if (!email) suggestions.push("Add your direct email address in the contact header.");
    if (!phone) suggestions.push("Add a contact phone number to avoid recruiter reachout blocks.");
    if (!linkedin) suggestions.push("Add LinkedIn profile URL link in headers.");
    if (github && !lowerText.includes("github.com")) suggestions.push("Add GitHub portfolio link to show code samples.");
    if (!sections.summary) suggestions.push("Add a Professional Summary section at the top of your resume.");
    if (weakVerbsFound.length > 0) suggestions.push("Use stronger action verbs to start your experience bullets.");
    if (!hasMetrics) suggestions.push("Mention quantified impact and add measurable achievements (e.g. percentages, sales).");
    if (hasColumns) suggestions.push("Convert your template layout to a single-column layout grid to fix formatting scan warnings.");
    if (!sections.certifications) suggestions.push("Include certifications and professional courses to validate skills.");
    if (missing.length > 0) {
      suggestions.push(`Integrate missing keywords: ${missing.slice(0, 3).join(', ')}.`);
    }

    // 14. Extra insights checks
    const bulletConsistency = lines.filter(l => l.startsWith("•") || l.startsWith("-")).length > 5;
    const dateFormattingInconsistent = !/\b(19\d{2}|20\d{2})\s*-\s*(19\d{2}|20\d{2}|present)\b/i.test(resumeText);
    const sectionOrderCorrect = lowerText.indexOf("experience") > lowerText.indexOf("summary") && lowerText.indexOf("education") > lowerText.indexOf("experience");
    const whiteSpaceRatio = (wordCount / (paragraphs.length || 1) < 40) ? 'Low' : (wordCount / (paragraphs.length || 1) > 90) ? 'High' : 'Optimal';
    const readabilityLevel = (wordCount / lines.length > 15) ? 'Difficult' : (wordCount / lines.length < 8) ? 'Easy' : 'Intermediate';
    const isOnePage = totalPages === 1;
    const isAtsFriendly = formattingScore >= 80;

    // 15. Overall Score Calculation (UPGRADED ALGORITHM RULES)
    let overallScore = 0;
    if (keywordScore !== null) {
      // JD is provided (includes Keyword score weight)
      overallScore = Math.round(
        (formattingScore * 0.15) +
        (atsStructureScore * 0.15) +
        (contactScore * 0.10) +
        (experienceScore * 0.15) +
        (projectsScore * 0.10) +
        (skillsScore * 0.15) +
        (educationScore * 0.10) +
        (keywordScore * 0.10)
      );
    } else {
      // JD is missing (re-distribute weight, Keyword Match: N/A)
      overallScore = Math.round(
        (formattingScore * 0.20) +
        (atsStructureScore * 0.20) +
        (contactScore * 0.15) +
        (experienceScore * 0.15) +
        (projectsScore * 0.10) +
        (skillsScore * 0.10) +
        (educationScore * 0.10)
      );
    }

    // Capping logic (Never fake scores. High optimization required for 90+)
    if (overallScore > 88 && (!linkedin || !hasMetrics || hasColumns || !sections.summary || (keywordScore !== null && keywordScore < 80))) {
      overallScore = 85;
    }

    return {
      overallScore,
      formattingScore,
      atsStructureScore,
      contactScore,
      experienceScore,
      projectsScore,
      skillsScore,
      educationScore,
      keywordScore,
      sections,
      contacts: { name, email, phone, linkedin, github, portfolio: portfolioUrl },
      keywords: { matched, missing, recommended, density, techMatched, softMatched, missingTech, missingSoft, missingVerbs, resumeMatchPercentage },
      warnings,
      suggestions: suggestions.slice(0, 6),
      weakVerbsFound,
      actionVerbsCount,
      experienceLevel,
      readTime,
      wordCount,
      pageCount: totalPages || 1,
      topSkills: foundTech.slice(0, 6),
      missingSkills: missing.slice(0, 6),
      
      bulletConsistency,
      dateFormattingInconsistent,
      sectionOrderCorrect,
      whiteSpaceRatio,
      readabilityLevel,
      isOnePage,
      isAtsFriendly
    };
  };

  // ----------------------------------------------------------------------
  // COMPONENT ACTIONS & HANDLERS
  // ----------------------------------------------------------------------

  const handleResumeFileSelect = (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Resume file size exceeds the 10 MB limit.");
      return;
    }
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['pdf', 'docx', 'txt'].includes(ext || '')) {
      toast.error("Unsupported file format. Please upload PDF, DOCX or TXT files.");
      return;
    }
    setResumeFile(file);
    toast.success(`Loaded resume: ${file.name}`);
  };

  const handleJdFileSelect = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Job Description file size exceeds 5 MB.");
      return;
    }
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['pdf', 'docx', 'txt'].includes(ext || '')) {
      toast.error("Unsupported file format. Please upload PDF, DOCX or TXT files.");
      return;
    }
    setJdFile(file);
    toast.success(`Loaded Job Description: ${file.name}`);
  };

  const processResumeAnalysis = async () => {
    if (!resumeFile) {
      toast.error("Please upload a resume file first.");
      return;
    }

    setIsProcessing(true);
    setResult(null);
    setActiveTab('overview');
    
    // Skeleton processing simulation progress steps
    setProcessingStep(0);
    setUploadProgress(15);

    try {
      let extractedResumeText = "";
      let pdfLines: any[] = [];
      let totalPages = 1;

      const ext = resumeFile.name.split('.').pop()?.toLowerCase();
      
      await new Promise(r => setTimeout(r, 600));
      setUploadProgress(40);
      setProcessingStep(1); // Reading layout lines

      if (ext === 'pdf') {
        const parsed = await extractTextFromPdf(resumeFile);
        extractedResumeText = parsed.text;
        pdfLines = parsed.lines;
        totalPages = parsed.pages;
      } else if (ext === 'docx') {
        extractedResumeText = await extractTextFromDocx(resumeFile);
      } else {
        extractedResumeText = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve((e.target?.result as string) || "");
          reader.onerror = (err) => reject(err);
          reader.readAsText(resumeFile);
        });
      }

      setUploadProgress(70);
      setProcessingStep(2); // Auditing structures
      await new Promise(r => setTimeout(r, 650));

      let jobDescContent = jdText;
      if (jdFile) {
        const jdExt = jdFile.name.split('.').pop()?.toLowerCase();
        if (jdExt === 'pdf') {
          const parsedJd = await extractTextFromPdf(jdFile);
          jobDescContent = parsedJd.text;
        } else if (jdExt === 'docx') {
          jobDescContent = await extractTextFromDocx(jdFile);
        } else {
          jobDescContent = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve((e.target?.result as string) || "");
            reader.onerror = (err) => reject(err);
            reader.readAsText(jdFile);
          });
        }
      }

      setProcessingStep(3); // Matching skills densities
      await new Promise(r => setTimeout(r, 700));
      setUploadProgress(100);

      // Auditing
      const analysis = analyzeResume(extractedResumeText, pdfLines, totalPages, jobDescContent);
      setResult(analysis);
      toast.success("Resume analysis completed successfully!");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to process resume file. Make sure it has readable text.");
    } finally {
      setIsProcessing(false);
    }
  };

  const resetState = () => {
    setResumeFile(null);
    setTargetRole("");
    setJdText("");
    setJdFile(null);
    setResult(null);
    if (resumeInputRef.current) resumeInputRef.current.value = "";
    if (jdFileInputRef.current) jdFileInputRef.current.value = "";
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("ATS Scanner tool link copied!");
  };

  const handlePrint = () => {
    window.print();
  };

  const scoreColors = (score: number) => {
    if (score >= 80) return { text: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', stroke: '#10b981', gradient: 'from-emerald-500 to-teal-500' };
    if (score >= 60) return { text: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20', stroke: '#f59e0b', gradient: 'from-amber-500 to-orange-500' };
    return { text: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500/20', stroke: '#f43f5e', gradient: 'from-rose-500 to-pink-500' };
  };

  return (
    <div className="bg-[#F6F8FC] dark:bg-[#030712] min-h-screen py-10 relative overflow-hidden font-sans print:bg-white print:text-black transition-colors duration-250 font-sans">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-blue-600/5 blur-[120px] -z-10 print:hidden" />
      <div className="absolute top-0 left-0 right-0 h-full bg-grid-pattern opacity-[0.02] -z-20 print:hidden" />

      {/* JSON-LD Schema scripts */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchema) }}
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10 print:px-0">
        
        {/* Back link */}
        <Link
          href="/tools"
          className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-widest text-gray-500 hover:text-blue-500 transition-colors mb-10 group print:hidden"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Directory
        </Link>

        {/* HEADER */}
        <div className="glass rounded-[2rem] p-6 sm:p-8 mb-8 border border-white/5 print:hidden">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <PdfToolIcon toolId="ats-resume-checker" size="xl" className="shrink-0" />
              <div>
                <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">ATS Resume Checker</h1>
                <p className="text-sm text-gray-400 font-medium mt-1">Audit formatting, check keywords, and optimize your resume for automated screening algorithms.</p>
              </div>
            </div>
            {result && (
              <div className="flex gap-3 shrink-0">
                <button
                  onClick={resetState}
                  className="px-4 py-2.5 text-xs font-black uppercase tracking-widest text-gray-400 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all"
                >
                  Clear Results
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ====================================================
            UPLOAD AREA (UPGRADED EMPY STATE LAYOUT)
            ==================================================== */}
        <AnimatePresence>
          {!result && !isProcessing && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 print:hidden"
            >
              {/* UPLOAD FORM PANEL */}
              <div className="lg:col-span-7 space-y-6">
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDraggingOverResume(true); }}
                  onDragLeave={() => setIsDraggingOverResume(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDraggingOverResume(false);
                    const file = e.dataTransfer.files?.[0];
                    if (file) handleResumeFileSelect(file);
                  }}
                  className={`glass rounded-3xl p-8 border-2 border-dashed transition-all flex flex-col items-center justify-center text-center group min-h-[380px] relative ${
                    isDraggingOverResume ? 'border-blue-500 bg-blue-500/5' : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  <input
                    type="file"
                    ref={resumeInputRef}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleResumeFileSelect(file);
                    }}
                    accept=".pdf,.docx,.txt"
                    className="hidden"
                  />
                  
                  {resumeFile ? (
                    <div className="space-y-6 w-full max-w-md">
                      <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center mx-auto text-blue-500 border border-blue-500/20">
                        <FileText className="w-8 h-8" />
                      </div>
                      <div>
                        <p className="text-slate-900 dark:text-white font-bold text-lg truncate px-4">{resumeFile.name}</p>
                        <p className="text-gray-400 text-xs mt-1">{formatBytes(resumeFile.size)}</p>
                      </div>
                      <div className="flex justify-center gap-3">
                        <button
                          onClick={() => resumeInputRef.current?.click()}
                          className="px-4 py-2 bg-white/5 border border-white/10 text-xs font-black uppercase tracking-wider text-gray-300 rounded-xl hover:bg-white/10 transition-all"
                        >
                          Replace File
                        </button>
                        <button
                          onClick={() => setResumeFile(null)}
                          className="p-2 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 rounded-xl transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-gray-400 group-hover:scale-105 group-hover:border-blue-500/30 group-hover:text-blue-400 transition-all duration-300">
                        <UploadCloud className="w-10 h-10 animate-pulse" />
                      </div>
                      <div>
                        <button
                          onClick={() => resumeInputRef.current?.click()}
                          className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:scale-[1.02] active:scale-95 duration-200"
                        >
                          Browse Resume File
                        </button>
                        <p className="text-sm text-gray-300 font-bold mt-4">Drag and drop your resume file here</p>
                        <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">Supports standard PDF, Word (.docx) and plain text (.txt) files up to 10MB.</p>
                      </div>
                      <div className="flex flex-wrap justify-center gap-2 pt-2">
                        <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase bg-white/5 border border-white/10 text-gray-400">PDF (.pdf)</span>
                        <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase bg-white/5 border border-white/10 text-gray-400">DOCX (.docx)</span>
                        <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase bg-white/5 border border-white/10 text-gray-400">TXT (.txt)</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Trust disclaimer badge banner */}
                <div className="glass p-5 rounded-2xl border border-white/5 flex items-start gap-4">
                  <div className="p-2.5 bg-blue-500/10 text-blue-500 rounded-xl border border-blue-500/20 shrink-0">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-slate-900 dark:text-white font-bold text-sm">Privacy Guaranteed</h4>
                    <p className="text-xs text-gray-400 mt-1 leading-relaxed">We audit your documents locally inside your browser memory. Resumes are not stored permanently or shared with server databases, protecting your identity.</p>
                  </div>
                </div>
              </div>

              {/* TARGET DETAILS & JD SETTINGS */}
              <div className="lg:col-span-5 space-y-6">
                <div className="glass p-6 rounded-3xl border border-white/5 space-y-5">
                  <h3 className="text-slate-900 dark:text-white font-black text-lg tracking-tight uppercase border-b border-white/5 pb-3">Target Role & JD</h3>
                  
                  {/* Optional Target Role */}
                  <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Target Job Role (Optional)</label>
                    <input
                      type="text"
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                      placeholder="e.g. Frontend Developer"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-sm text-white"
                    />
                    <div className="flex flex-wrap gap-1.5 mt-2.5">
                      {TARGET_ROLE_EXAMPLES.slice(0, 5).map((role) => (
                        <button
                          key={role}
                          onClick={() => setTargetRole(role)}
                          className="px-2 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[10px] font-semibold text-gray-400 hover:text-white transition-all"
                        >
                          + {role}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Optional Job Description text */}
                  <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Paste Job Description (Optional)</label>
                    <textarea
                      value={jdText}
                      onChange={(e) => {
                        setJdText(e.target.value);
                        if (e.target.value) setJdFile(null);
                      }}
                      rows={4}
                      placeholder="Paste job description requirements to calculate Keyword Match and scan for missing technology tags..."
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-sm text-white resize-none custom-scrollbar"
                    />
                  </div>

                  {/* OR Upload Job Description File */}
                  <div className="relative flex items-center justify-center border-t border-white/5 pt-2">
                    <span className="absolute bg-[#0b1021] px-3 text-[10px] font-black text-gray-500 uppercase tracking-widest">OR</span>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Upload JD File</label>
                    <div
                      onDragOver={(e) => { e.preventDefault(); setIsDraggingOverJd(true); }}
                      onDragLeave={() => setIsDraggingOverJd(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDraggingOverJd(false);
                        const file = e.dataTransfer.files?.[0];
                        if (file) handleJdFileSelect(file);
                      }}
                      className={`px-4 py-3 rounded-xl border border-dashed transition-all text-center flex flex-col items-center justify-center cursor-pointer ${
                        isDraggingOverJd ? 'border-blue-500 bg-blue-500/5' : 'border-white/10 hover:border-white/20'
                      }`}
                      onClick={() => jdFileInputRef.current?.click()}
                    >
                      <input
                        type="file"
                        ref={jdFileInputRef}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleJdFileSelect(file);
                        }}
                        accept=".pdf,.docx,.txt"
                        className="hidden"
                      />
                      {jdFile ? (
                        <div className="flex items-center gap-2 text-blue-500 font-bold text-xs truncate max-w-full">
                          <FileText className="w-4 h-4 shrink-0" />
                          <span>{jdFile.name}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-gray-400 text-xs font-medium">
                          <UploadCloud className="w-4 h-4 text-gray-500" />
                          <span>Select JD file (.pdf, .docx, .txt)</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Audit Button */}
                  <button
                    onClick={processResumeAnalysis}
                    disabled={!resumeFile}
                    className="w-full flex items-center justify-center gap-3 px-6 py-4 text-xs font-black uppercase tracking-widest text-white bg-blue-600 rounded-xl hover:bg-blue-500 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(37,99,235,0.3)] active:scale-95 duration-200"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Analyze Compatibility</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ====================================================
            LOADING SKELETON PROCESSOR
            ==================================================== */}
        <AnimatePresence>
          {isProcessing && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="glass rounded-3xl p-8 max-w-xl mx-auto border border-white/5 space-y-8 min-h-[380px] flex flex-col justify-center print:hidden"
            >
              <div className="text-center space-y-4">
                <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-2 border-blue-500/20" />
                  <div className="absolute inset-0 rounded-full border-2 border-t-blue-500 border-r-transparent border-l-transparent animate-spin" />
                  <FileText className="w-6 h-6 text-blue-500 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-slate-900 dark:text-white font-bold text-lg">Running ATS Diagnostic Scan...</h3>
                  <p className="text-xs text-gray-400 mt-1">Simulating Applicant Tracking System scanners locally.</p>
                </div>
              </div>

              {/* Progress Steps */}
              <div className="space-y-4 max-w-sm mx-auto w-full">
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    processingStep >= 1 ? 'bg-emerald-500 text-white animate-fade-in' : 'bg-white/10 text-gray-400'
                  }`}>
                    {processingStep >= 1 ? <Check className="w-3 h-3" /> : '1'}
                  </div>
                  <span className={`text-xs ${processingStep >= 1 ? 'text-white font-bold' : 'text-gray-400'}`}>
                    {processingStep >= 1 ? 'Extracted text layer successfully' : 'Reading document text layer...'}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    processingStep >= 2 ? 'bg-emerald-500 text-white' : 'bg-white/10 text-gray-400'
                  }`}>
                    {processingStep >= 2 ? <Check className="w-3 h-3" /> : '2'}
                  </div>
                  <span className={`text-xs ${processingStep >= 2 ? 'text-white font-bold' : 'text-gray-400'}`}>
                    {processingStep >= 2 ? 'Layout formatting audited' : 'Auditing margins, tables, and columns...'}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    processingStep >= 3 ? 'bg-emerald-500 text-white' : 'bg-white/10 text-gray-400'
                  }`}>
                    {processingStep >= 3 ? <Check className="w-3 h-3" /> : '3'}
                  </div>
                  <span className={`text-xs ${processingStep >= 3 ? 'text-white font-bold' : 'text-gray-400'}`}>
                    {processingStep >= 3 ? 'Skills index matched' : 'Mapping technology keywords...'}
                  </span>
                </div>
              </div>

              {/* Progress Line */}
              <div className="w-full bg-white/5 rounded-full h-1 border border-white/5 overflow-hidden">
                <div
                  className="bg-blue-600 h-full transition-all duration-500"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ====================================================
            UPGRADED PREMIUM ATS DASHBOARD
            ==================================================== */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              {/* TOP BAR ACTIONS */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/5 border border-white/5 p-4 rounded-2xl print:hidden">
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs text-gray-300 font-semibold">Audited: {result.contacts.name || "Job Resume Candidate"}</span>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    onClick={handlePrint}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-white bg-blue-600 rounded-xl hover:bg-blue-500 transition-all shadow-[0_0_15px_rgba(37,99,235,0.2)] active:scale-95 duration-200"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Download Report</span>
                  </button>
                  <button
                    onClick={copyShareLink}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-gray-400 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all active:scale-95 duration-200"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Share Results</span>
                  </button>
                </div>
              </div>

              {/* PRINT ONLY HEADER */}
              <div className="hidden print:block border-b border-gray-200 pb-6 mb-8 text-black bg-white">
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-3xl font-bold tracking-tight">ATS Resume Compatibility Report</h1>
                    <p className="text-sm text-gray-500 mt-1">Simulated Applicant Tracking System Scorecard</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{result.contacts.name || "Job Candidate"}</p>
                    <p className="text-xs text-gray-500">{result.contacts.email || "Email missing"}</p>
                    <p className="text-xs text-gray-500">{result.contacts.phone || "Phone missing"}</p>
                  </div>
                </div>
              </div>

              {/* DASHBOARD GRID */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* LEFT: Overall Score & Checklists */}
                <div className="lg:col-span-4 space-y-6">
                  
                  {/* Score circle gauge */}
                  <div className="glass p-6 rounded-3xl border border-white/5 flex flex-col items-center justify-center text-center relative print:border-gray-200 print:text-black">
                    <div className="absolute top-4 right-4 group print:hidden">
                      <HelpCircle className="w-4 h-4 text-gray-500 hover:text-white cursor-pointer" />
                      <div className="absolute right-0 bottom-6 w-52 p-3 rounded-lg bg-gray-900 border border-white/10 text-[10px] text-gray-400 hidden group-hover:block z-30 leading-relaxed font-semibold">
                        This is an estimate based on formatting, structure, contact listings, readability, and keywords. Strong resumes without job descriptions target 70-85%.
                      </div>
                    </div>

                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">ATS Compatibility</h3>
                    
                    <div className="relative w-44 h-44 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle
                          cx="88"
                          cy="88"
                          r="76"
                          className="stroke-white/5 fill-transparent"
                          strokeWidth="10"
                        />
                        <motion.circle
                          cx="88"
                          cy="88"
                          r="76"
                          className="fill-transparent"
                          stroke={scoreColors(result.overallScore).stroke}
                          strokeWidth="10"
                          strokeDasharray="478"
                          initial={{ strokeDashoffset: 478 }}
                          animate={{ strokeDashoffset: 478 - (478 * result.overallScore) / 100 }}
                          transition={{ duration: 1.5, ease: "easeOut" }}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute text-center">
                        <span className="text-4xl font-black tracking-tighter text-white print:text-black">{result.overallScore}</span>
                        <span className="text-xs text-gray-500 block font-semibold">Score</span>
                      </div>
                    </div>

                    <div className="mt-6">
                      <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider ${scoreColors(result.overallScore).bg} ${scoreColors(result.overallScore).text} border ${scoreColors(result.overallScore).border}`}>
                        {result.overallScore >= 80 ? 'Optimal' : result.overallScore >= 60 ? 'Optimize Formatting' : 'Formatting Critical'}
                      </span>
                    </div>

                    {/* Trust Note Disclaimer */}
                    <p className="text-[10px] text-gray-500 mt-6 leading-relaxed bg-white/5 p-3 rounded-xl border border-white/5 print:bg-gray-50 print:border-gray-200">
                      <strong>* Disclaimer:</strong> This ATS score is an estimate based on resume structure, formatting, completeness, and keyword relevance. Actual ATS systems may evaluate resumes differently depending on employer software.
                    </p>
                  </div>

                  {/* Section Checklist */}
                  <div className="glass p-6 rounded-3xl border border-white/5 print:border-gray-200">
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Core Sections</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {Object.keys(result.sections).map((key) => {
                        const hasSec = result.sections[key as keyof typeof result.sections];
                        return (
                          <div key={key} className="flex items-center gap-2 bg-white/5 border border-white/5 px-3 py-2 rounded-xl">
                            {hasSec ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            ) : (
                              <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                            )}
                            <span className="text-[10px] font-bold text-white capitalize truncate print:text-black">
                              {key === 'summary' ? 'Summary' : key}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Contact Info Checks */}
                  <div className="glass p-6 rounded-3xl border border-white/5 print:border-gray-200">
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Contact Info Checks</h3>
                    <div className="space-y-3">
                      {[
                        { label: 'Name', val: result.contacts.name, icon: User },
                        { label: 'Email Address', val: result.contacts.email, icon: Mail },
                        { label: 'Phone Number', val: result.contacts.phone, icon: Phone },
                        { label: 'LinkedIn URL', val: result.contacts.linkedin, icon: LinkedinIcon },
                        { label: 'GitHub Link', val: result.contacts.github, icon: GithubIcon },
                        { label: 'Portfolio Link', val: result.contacts.portfolio, icon: Compass }
                      ].map((item, index) => (
                        <div key={index} className="flex items-center justify-between text-xs py-1">
                          <div className="flex items-center gap-2 text-gray-400">
                            <item.icon className="w-3.5 h-3.5 text-gray-500" />
                            <span>{item.label}</span>
                          </div>
                          {item.val ? (
                            <span className="text-emerald-500 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded text-[9px] uppercase">Found</span>
                          ) : (
                            <span className="text-rose-500 font-bold bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded text-[9px] uppercase">Missing</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                {/* RIGHT: TAB PANEL AND DETAILS */}
                <div className="lg:col-span-8 space-y-6">
                  
                  {/* TAB MENU */}
                  <div className="flex gap-1 overflow-x-auto pb-1.5 border-b border-white/5 scrollbar-thin print:hidden">
                    {[
                      { id: 'overview', name: 'Overview' },
                      { id: 'keywords', name: 'Job Match' },
                      { id: 'formatting', name: 'Warnings' },
                      { id: 'verbs', name: 'Action Verbs' },
                      { id: 'insights', name: 'Insights' }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all ${
                          activeTab === tab.id
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-400 hover:text-white bg-white/5'
                        }`}
                      >
                        {tab.name}
                      </button>
                    ))}
                  </div>

                  {/* TAB BODY CONTROLLER */}
                  <div className="space-y-6">

                    {/* OVERVIEW TAB */}
                    {activeTab === 'overview' && (
                      <div className="space-y-6 animate-fade-in">
                        
                        {/* Conditional JD Missing Info Banner */}
                        {result.keywordScore === null && (
                          <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 p-4 rounded-2xl flex items-start gap-3.5 print:hidden">
                            <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
                            <div>
                              <h4 className="font-bold text-xs">Job Description Missing</h4>
                              <p className="text-[11px] text-gray-400 mt-1">Upload a Job Description to receive a more accurate ATS score. Currently evaluating generic formatting and completeness checklist values.</p>
                            </div>
                          </div>
                        )}

                        {/* Updated Score breakdown metrics */}
                        <div className="glass p-6 rounded-3xl border border-white/5 print:border-gray-200">
                          <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">Detailed Scores Breakdown</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
                            {[
                              { name: 'Formatting & Layout', score: result.formattingScore, tip: 'Checks document columns, tables, special char formatting guidelines.' },
                              { name: 'ATS Structure Compliance', score: result.atsStructureScore, tip: 'Audits presence of standard sections (Experience, Education, Skills).' },
                              { name: 'Contact Information Info', score: result.contactScore, tip: 'Checks presence of email, phone, name, LinkedIn, and Github links.' },
                              { name: 'Experience & Action Metrics', score: result.experienceScore, tip: 'Measures presence of achievements, action verbs, and timeline milestones.' },
                              { name: 'Projects Completeness', score: result.projectsScore, tip: 'Grades complexity and tool list parsed inside projects section.' },
                              { name: 'Technical & Soft Skills', score: result.skillsScore, tip: 'Evaluates quantity and density of skills found.' },
                              { name: 'Education & Certs Index', score: result.educationScore, tip: 'Grades education and certifications parsed.' },
                              { 
                                name: 'Job Keyword Match', 
                                score: result.keywordScore === null ? 'N/A' : result.keywordScore, 
                                tip: 'Compares resume keywords directly against job description.' 
                              }
                            ].map((bar, idx) => (
                              <div key={idx} className="space-y-2 relative group">
                                <div className="flex justify-between text-xs items-center">
                                  <div className="flex items-center gap-1">
                                    <span className="text-gray-300 font-bold print:text-black">{bar.name}</span>
                                    <div className="relative group/tip print:hidden">
                                      <Info className="w-3.5 h-3.5 text-gray-500 cursor-pointer" />
                                      <div className="absolute left-0 bottom-5 w-44 p-2 rounded-lg bg-gray-950 border border-white/10 text-[9px] text-gray-400 hidden group-hover/tip:block z-30 leading-normal font-semibold">
                                        {bar.tip}
                                      </div>
                                    </div>
                                  </div>
                                  <span className={`font-black ${
                                    typeof bar.score === 'string' ? 'text-gray-500' : scoreColors(bar.score).text
                                  }`}>
                                    {typeof bar.score === 'string' ? bar.score : `${bar.score}/100`}
                                  </span>
                                </div>
                                <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden border border-white/5">
                                  {typeof bar.score === 'string' ? (
                                    <div className="h-full bg-white/5 w-0" />
                                  ) : (
                                    <div
                                      className={`h-full bg-gradient-to-r ${scoreColors(bar.score).gradient}`}
                                      style={{ width: `${bar.score}%` }}
                                    />
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Top Actionable recommendations cards */}
                        <div className="glass p-6 rounded-3xl border border-white/5 print:border-gray-200">
                          <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Audited Improvements</h3>
                          <div className="space-y-3">
                            {result.suggestions.map((suggestion, idx) => (
                              <div key={idx} className="flex items-start gap-3 bg-white/5 border border-white/5 p-4 rounded-2xl">
                                <div className="w-5 h-5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-500 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                                  {idx + 1}
                                </div>
                                <p className="text-xs text-gray-300 font-semibold leading-relaxed print:text-black">{suggestion}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                      </div>
                    )}

                    {/* JOB DESCRIPTION MATCH TAB */}
                    {activeTab === 'keywords' && (
                      <div className="space-y-6 animate-fade-in">
                        
                        {result.keywordScore === null ? (
                          <div className="glass p-8 rounded-3xl border border-white/5 text-center space-y-4">
                            <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center mx-auto">
                              <Info className="w-6 h-6 animate-pulse" />
                            </div>
                            <div>
                              <h4 className="text-slate-900 dark:text-white font-bold">Upload Job Description for Keywords Match</h4>
                              <p className="text-xs text-gray-400 max-w-sm mx-auto mt-2 leading-relaxed">
                                To run detailed technology audits and match skills overlap percentage, upload a Job Description file or paste requirement text in the upload settings page.
                              </p>
                            </div>
                            <button
                              onClick={() => setResult(null)}
                              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all"
                            >
                              Add Job Description
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-6">
                            
                            {/* Skills matching summary card */}
                            <div className="glass p-6 rounded-3xl border border-white/5 print:border-gray-200">
                              <div className="flex justify-between items-center border-b border-white/5 pb-4 mb-6">
                                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Resume Match Percentage</h3>
                                <span className="text-3xl font-black text-emerald-500">{result.keywords.resumeMatchPercentage}%</span>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
                                <div className="bg-white/5 border border-white/5 p-4 rounded-2xl">
                                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Matched Keywords</span>
                                  <span className="text-2xl font-black text-emerald-500 block mt-1.5">{result.keywords.matched.length}</span>
                                </div>
                                <div className="bg-white/5 border border-white/5 p-4 rounded-2xl">
                                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Missing Technologies</span>
                                  <span className="text-2xl font-black text-rose-500 block mt-1.5">{result.keywords.missingTech.length}</span>
                                </div>
                                <div className="bg-white/5 border border-white/5 p-4 rounded-2xl">
                                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Missing Soft Skills</span>
                                  <span className="text-2xl font-black text-rose-500 block mt-1.5">{result.keywords.missingSoft.length}</span>
                                </div>
                              </div>
                            </div>

                            {/* Keywords Grid listings */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              
                              {/* Matched list */}
                              <div className="glass p-5 rounded-3xl border border-white/5 print:border-gray-200">
                                <h4 className="text-xs font-black text-emerald-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                                  <span>Matched Skills ({result.keywords.matched.length})</span>
                                </h4>
                                <div className="flex flex-wrap gap-1.5">
                                  {result.keywords.matched.map(k => (
                                    <span key={k} className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 capitalize">{k}</span>
                                  ))}
                                </div>
                              </div>

                              {/* Missing list */}
                              <div className="glass p-5 rounded-3xl border border-white/5 print:border-gray-200">
                                <h4 className="text-xs font-black text-rose-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                  <AlertCircle className="w-4 h-4 shrink-0" />
                                  <span>Missing Keywords ({result.keywords.missing.length})</span>
                                </h4>
                                <div className="flex flex-wrap gap-1.5">
                                  {result.keywords.missing.map(k => (
                                    <span key={k} className="px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-500/10 border border-rose-500/20 text-rose-400 capitalize">{k}</span>
                                  ))}
                                </div>
                              </div>

                            </div>

                            {/* Missing Action verbs list */}
                            {result.keywords.missingVerbs.length > 0 && (
                              <div className="glass p-5 rounded-3xl border border-white/5 print:border-gray-200">
                                <h4 className="text-xs font-black text-rose-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                  <AlertTriangle className="w-4 h-4 shrink-0" />
                                  <span>Missing Action Verbs From JD</span>
                                </h4>
                                <div className="flex flex-wrap gap-1.5">
                                  {result.keywords.missingVerbs.map(v => (
                                    <span key={v} className="px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-500/10 border border-rose-500/20 text-rose-400 capitalize">{v}</span>
                                  ))}
                                </div>
                              </div>
                            )}

                          </div>
                        )}

                      </div>
                    )}

                    {/* WARNINGS TAB */}
                    {activeTab === 'formatting' && (
                      <div className="space-y-6 animate-fade-in">
                        
                        <div className="glass p-6 rounded-3xl border border-white/5 print:border-gray-200">
                          <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Compliance Audit Warnings</h3>
                          {result.warnings.length > 0 ? (
                            <div className="space-y-4">
                              {result.warnings.map((warn, index) => (
                                <div key={index} className="flex items-start gap-4 bg-white/5 border border-white/5 p-4 rounded-2xl">
                                  <div className={`p-2 rounded-xl shrink-0 border ${
                                    warn.severity === 'critical' 
                                      ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' 
                                      : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                  }`}>
                                    <AlertTriangle className="w-5 h-5" />
                                  </div>
                                  <div className="space-y-1">
                                    <h4 className="text-slate-900 dark:text-white font-bold text-sm print:text-black">{warn.title}</h4>
                                    <p className="text-xs text-gray-400 leading-relaxed print:text-gray-700">{warn.description}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-10 space-y-3">
                              <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto">
                                <CheckCircle2 className="w-6 h-6" />
                              </div>
                              <div>
                                <h4 className="text-slate-900 dark:text-white font-bold">ATS Formatting Compliant</h4>
                                <p className="text-xs text-gray-500 mt-1">Your resume contains no elements that will break legacy scanner parsers.</p>
                              </div>
                            </div>
                          )}
                        </div>

                      </div>
                    )}

                    {/* ACTION VERBS TAB */}
                    {activeTab === 'verbs' && (
                      <div className="space-y-6 animate-fade-in">
                        
                        <div className="glass p-6 rounded-3xl border border-white/5 print:border-gray-200">
                          <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Weak Action Verbs Converters</h3>
                          <p className="text-xs text-gray-400 leading-relaxed mb-6">
                            Convert weak responsibility-based phrasing (like "Worked" or "Helped") into stronger, impact-driven verbs.
                          </p>

                          {result.weakVerbsFound.length > 0 ? (
                            <div className="space-y-4">
                              {result.weakVerbsFound.map((item, idx) => (
                                <div key={idx} className="bg-white/5 border border-white/5 p-4 rounded-2xl flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                                  <div>
                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Found Weak Verb</span>
                                    <span className="text-rose-400 font-bold text-sm block mt-1">{item.word}</span>
                                  </div>
                                  <div className="text-gray-500 font-bold text-lg hidden sm:block">↓</div>
                                  <div className="sm:text-right">
                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Recommended Replacements</span>
                                    <div className="flex flex-wrap sm:justify-end gap-1.5 mt-1.5">
                                      {item.suggestions.map(s => (
                                        <span key={s} className="px-2.5 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 text-[10px] font-black uppercase tracking-wider">{s}</span>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-8 space-y-3">
                              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                              <h4 className="text-slate-900 dark:text-white font-bold">Strong Action Verbs Found</h4>
                              <p className="text-xs text-gray-500">Your resume contains only action-oriented active verbs.</p>
                            </div>
                          )}
                        </div>

                      </div>
                    )}

                    {/* INSIGHTS TAB */}
                    {activeTab === 'insights' && (
                      <div className="space-y-6 animate-fade-in">
                        
                        <div className="glass p-6 rounded-3xl border border-white/5 print:border-gray-200">
                          <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">Document Insights Audits</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            
                            {[
                              { label: 'Resume Length Check', status: result.wordCount > 1000 ? 'Excessive content density' : result.wordCount < 250 ? 'Thin content density' : 'Optimal', check: result.wordCount >= 250 && result.wordCount <= 1000 },
                              { label: 'One Page Limits', status: result.isOnePage ? 'Compliant' : 'Exceeds one page', check: result.isOnePage },
                              { label: 'ATS Formatting Friendly', status: result.isAtsFriendly ? 'Yes' : 'Layout warnings detected', check: result.isAtsFriendly },
                              { label: 'Bullet Consistency list', status: result.bulletConsistency ? 'Consistent lists format' : 'Varying list elements', check: result.bulletConsistency },
                              { label: 'Timeline Dates Format', status: !result.dateFormattingInconsistent ? 'Consistent dates' : 'Inconsistent date lines', check: !result.dateFormattingInconsistent },
                              { label: 'Standard Section Order', status: result.sectionOrderCorrect ? 'Correct info layout' : 'Unconventional layout order', check: result.sectionOrderCorrect },
                              { label: 'Margin White Space Density', status: result.whiteSpaceRatio === 'Optimal' ? 'Optimal balance' : `${result.whiteSpaceRatio} density`, check: result.whiteSpaceRatio === 'Optimal' },
                              { label: 'Readability Metric Grade', status: `${result.readabilityLevel} complexity`, check: result.readabilityLevel !== 'Difficult' }
                            ].map((audit, idx) => (
                              <div key={idx} className="flex justify-between items-center text-xs py-3 border-b border-white/5 last:border-0">
                                <span className="text-gray-300 font-semibold">{audit.label}</span>
                                <div className="flex items-center gap-2">
                                  <span className={`font-bold ${audit.check ? 'text-emerald-500' : 'text-amber-500'}`}>{audit.status}</span>
                                  {audit.check ? (
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                  ) : (
                                    <AlertCircle className="w-4 h-4 text-amber-500" />
                                  )}
                                </div>
                              </div>
                            ))}

                          </div>
                        </div>

                      </div>
                    )}

                  </div>

                </div>

              </div>

            </motion.div>
          )}
        </AnimatePresence>

        {/* ====================================================
            FEATURED ARTICLES & GUIDES SLIDER
            ==================================================== */}
        <div className="mt-20 space-y-6 print:hidden">
          <div className="border-b border-white/5 pb-4">
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Featured ATS & Career Knowledge Hub</h2>
            <p className="text-xs text-gray-400 mt-1">Read expert guides on resume parsing algorithms, optimizing keywords, and passing recruiters' filters.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {GUIDES.map((guide) => (
              <div
                key={guide.id}
                onClick={() => setActiveGuide(guide)}
                className="glass p-6 rounded-2xl border border-white/5 hover:border-blue-500/30 transition-all hover:translate-y-[-2px] cursor-pointer group flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-lg shadow-inner group-hover:scale-105 transition-transform">
                    {guide.icon}
                  </div>
                  <h3 className="text-slate-900 dark:text-white font-bold text-sm tracking-tight group-hover:text-blue-400 transition-colors">{guide.title}</h3>
                  <p className="text-xs text-gray-400 leading-relaxed font-medium">{guide.summary}</p>
                </div>
                <div className="flex items-center gap-1.5 text-blue-500 text-xs font-black uppercase tracking-wider mt-4">
                  <span>Read Guide</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ====================================================
            SEO / TEXT DETAILS FOOTER COMPONENT
            ==================================================== */}
        <div className="mt-24 print:hidden">
          <ToolArticle
            title="ATS Resume Checker – Optimize Your Resume Online"
            intro="Audit your resume for compatibility with modern Applicant Tracking Systems (ATS). Detect formatting errors, scan keyword matches against job descriptions, and get actionable suggestions."
            whatItDoes="The ToolWala AI ATS Resume Checker is a local, privacy-first diagnostic tool that analyzes how resume screening systems read and rank your professional credentials. By extracting and auditing text geometry, active verb counts, and key skill densities directly inside your browser memory, the utility grades layout compliance and flags design issues before recruiters see your file. You get standard scoring algorithms, customizable job role keywords alignment checks, and detailed recommendations in real-time."
            howToUse={[
              "Select your resume file in PDF, DOCX, or TXT format and drag it into the upload box.",
              "Optionally input your target job title and paste the job description copy to run keyword density audits.",
              "The browser-native parser scans text coordinates and extracts structural markers.",
              "Review the visual score dashboard, warnings logs, action verb corrections, and resume metrics.",
              "Apply edits to fix layout errors, add missing skills, and print/download the full ATS report as a PDF."
            ]}
            keyFeatures={[
              { title: "100% Client-Side Processing", desc: "No file uploads or database storage. All document scanning runs locally in browser RAM to safeguard personal data." },
              { title: "Formatting Warnings Finder", desc: "Identifies complex column designs, border grids, non-ascii symbols, and font elements that scramble ATS parsers." },
              { title: "Job Description Alignment", desc: "Performs full semantic term comparisons to identify high-value missing tools and vocabulary tags." },
              { title: "Downloadable Score Report", desc: "Generates custom-styled, vector-drawn PDF summaries of the analysis using clean print style guides." }
            ]}
            benefits={[
              "Ensure your CV passes automated screening gateways without parsing syntax failures.",
              "Optimize keywords for high-ranking visibility on recruiters search queues.",
              "Locally analyze spelling formats and verb strengths without signing up for accounts.",
              "Ditch costly subscriptions and insecure server-upload tools."
            ]}
            whyChoose="We prioritize candidate privacy and digital sovereignty. Conventional tools copy your CV details onto remote databases. ToolWala AI processes layout audits offline in browser memory, preventing salary histories, email addresses, and phone contacts from leaking while compiling premium evaluation scores."
            useCases={[
              "Candidates submitting applications to large enterprises using automated tracking frameworks.",
              "Experienced professionals Pivoting roles and adjusting technical keyword densities.",
              "Students verifying formatting hierarchies on academic drafts.",
              "Job seekers printing score reports for career coaches or references."
            ]}
            faqs={[
              { question: "Is this resume scanner really free?", answer: "Yes. All auditing tools and PDF scorecard prints are 100% free with no hidden pay-to-export fees." },
              { question: "Why is local processing better?", answer: "Local processing guarantees safety. Resumes contain sensitive phone numbers, home addresses, and employment timelines. Auditing them in client RAM ensures no third-party can scrape or store your identity records." },
              { question: "What causes formatting warnings?", answer: "Multi-column grids, embedded tables, graphical symbols, text boxes, and headers/footers can scramble text sequencing during parsing audits, resulting in lower scores." },
              { question: "How does the PDF download work?", answer: "Clicking 'Download Report' opens the browser printer window styled as a professional multi-page document sheet, enabling you to save it directly as a vector-drawn PDF." }
            ]}
            conclusion="Secure your next interview by auditing your resume compatibility today. Clean your formatting, match critical keywords, and submit your applications with peace of mind."
            relatedTools={[
              { name: "AI Resume Builder", href: "/tools/resume-builder" },
              { name: "AI Cover Letter Generator", href: "/tools/cover-letter-generator" }
            ]}
          />
        </div>

      </div>

      {/* ====================================================
          MODAL: INTERACTIVE GUIDE OVERLAY SLIDER
          ==================================================== */}
      <AnimatePresence>
        {activeGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-end print:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveGuide(null)}
              className="absolute inset-0 bg-[#F6F8FC] dark:bg-[#030712]/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 220 }}
              className="relative w-full max-w-2xl h-full bg-[#090d1a] border-l border-white/10 p-6 sm:p-8 overflow-y-auto custom-scrollbar flex flex-col justify-between"
            >
              <div className="space-y-6">
                <div className="flex justify-between items-start border-b border-white/5 pb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{activeGuide.icon}</span>
                    <h3 className="text-slate-900 dark:text-white font-black text-lg uppercase tracking-tight">{activeGuide.title}</h3>
                  </div>
                  <button
                    onClick={() => setActiveGuide(null)}
                    className="p-2 hover:bg-white/5 rounded-xl border border-transparent hover:border-white/10 text-gray-400 hover:text-white transition-all text-xs font-black uppercase tracking-wider"
                  >
                    Close
                  </button>
                </div>

                <div className="prose prose-invert prose-xs text-xs text-gray-300 font-medium leading-relaxed space-y-4">
                  {activeGuide.content.split('\n\n').map((paragraph, index) => {
                    if (paragraph.startsWith('### ')) {
                      return <h4 key={index} className="text-slate-900 dark:text-white font-black text-sm uppercase tracking-wider pt-2">{paragraph.replace('### ', '')}</h4>;
                    }
                    if (paragraph.startsWith('- ')) {
                      return (
                        <ul key={index} className="list-disc pl-5 space-y-1">
                          {paragraph.split('\n').map((li, liIdx) => (
                            <li key={liIdx} className="text-gray-300">
                              {li.replace('- ', '').replace(/\*\*(.*?)\*\*/g, '$1')}
                            </li>
                          ))}
                        </ul>
                      );
                    }
                    return <p key={index} className="text-gray-400">{paragraph.replace(/\*\*(.*?)\*\*/g, '$1')}</p>;
                  })}
                </div>
              </div>

              <div className="border-t border-white/5 pt-6 mt-8 flex justify-between items-center text-xs">
                <span className="text-gray-500 font-semibold">ToolWala AI Career Guides</span>
                <button
                  onClick={() => setActiveGuide(null)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-wider rounded-xl transition-all"
                >
                  Done Reading
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ====================================================
          PRINT-ONLY CUSTOM CSS RULES SHEET
          ==================================================== */}
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
            color: black !important;
            font-size: 11pt !important;
            line-height: 1.4 !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:block {
            display: block !important;
          }
          .glass {
            background: transparent !important;
            backdrop-filter: none !important;
            border: 1px solid #e2e8f0 !important;
            box-shadow: none !important;
            color: black !important;
            border-radius: 12px !important;
            margin-bottom: 20px !important;
          }
          .text-white {
            color: black !important;
          }
          .text-gray-400, .text-gray-500 {
            color: #4a5568 !important;
          }
          .bg-white\\/5 {
            background: #f7fafc !important;
            border-color: #edf2f7 !important;
          }
          svg circle.stroke-white\\/5 {
            stroke: #edf2f7 !important;
          }
          svg circle {
            print-color-adjust: exact !important;
            -webkit-print-color-adjust: exact !important;
          }
          .grid {
            display: block !important;
          }
          .grid > div {
            width: 100% !important;
            margin-bottom: 20px !important;
            page-break-inside: avoid !important;
          }
          h3, h4 {
            color: black !important;
            border-bottom: 1px solid #edf2f7 !important;
            padding-bottom: 4px !important;
          }
        }
      `}</style>

    </div>
  );
}
