"use client";

import Link from 'next/link';
import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, UploadCloud, Trash2, Shield, RefreshCw, AlertTriangle,
  CheckCircle2, ChevronLeft, ArrowRight, Sparkles, Copy, Check,
  FileDown, Printer, Share2, Info, Lock, BookOpen, Briefcase, Award,
  Activity, Zap, User, Mail, Phone, MapPin, AlertCircle,
  ThumbsUp, CheckSquare, HelpCircle, Compass
} from 'lucide-react';
import { toast } from 'sonner';

// Custom SVG Icons to avoid lucide-react version compatibility issues
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
import ToolArticle from '@/components/ToolArticle';
import { toolArticles } from '@/data/toolArticles';
import { MeshGradient } from '@/components/BackgroundEffects';
import { useTranslation } from '@/components/I18nContext';

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

const WEAK_VERBS: Record<string, string> = {
  "helped": "Spearheaded or Coordinated",
  "did": "Executed or Accomplished",
  "worked on": "Engineered or Devised",
  "responsible for": "Orchestrated or Managed",
  "assisted": "Facilitated or Collaborated",
  "handled": "Administered or Directed",
  "made": "Formulated or Authored",
  "led": "Championed or Directed",
  "managed": "Orchestrated or Supervised",
  "designed": "Architected or Conceptualized",
  "developed": "Engineered or Formulated",
  "used": "Leveraged or Employed"
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

// ----------------------------------------------------------------------
// DATA TYPES
// ----------------------------------------------------------------------

type AnalysisResult = {
  overallScore: number;
  formattingScore: number;
  keywordScore: number;
  skillsScore: number;
  experienceScore: number;
  educationScore: number;
  readabilityScore: number;
  
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
  };

  // Formatting warnings
  warnings: {
    id: string;
    title: string;
    description: string;
    severity: 'critical' | 'warning' | 'info';
  }[];

  // Suggestions
  suggestions: string[];

  // Action verbs
  weakVerbsFound: { word: string; suggestion: string }[];
  actionVerbsCount: number;

  // Insights
  experienceLevel: 'Junior' | 'Mid-Level' | 'Senior' | 'Executive';
  readTime: number; // in minutes
  wordCount: number;
  pageCount: number;
  topSkills: string[];
  missingSkills: string[];
};

export default function AtsResumeChecker() {
  const { t, locale, localizeHref } = useTranslation();
  
  // Script loaded flag
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
        lib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${lib.version}/build/pdf.worker.min.mjs`;
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
  // RESUME SCORING & AUDIT ENGINE
  // ----------------------------------------------------------------------

  const analyzeResume = (
    resumeText: string,
    pdfLines: any[],
    totalPages: number,
    jdRawText: string
  ): AnalysisResult => {
    const cleanText = resumeText.replace(/\s+/g, ' ');
    const lowerText = cleanText.toLowerCase();

    // 1. Email matching
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
    const emailMatch = cleanText.match(emailRegex);
    const email = emailMatch ? emailMatch[0] : null;

    // 2. Phone matching
    const phoneRegex = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
    const phoneMatch = cleanText.match(phoneRegex);
    const phone = phoneMatch ? phoneMatch[0] : null;

    // 3. Links matching
    const linkedinRegex = /linkedin\.com\/in\/[a-zA-Z0-9_-]+/i;
    const linkedinMatch = cleanText.match(linkedinRegex);
    const linkedin = linkedinMatch ? linkedinMatch[0] : null;

    const githubRegex = /github\.com\/[a-zA-Z0-9_-]+/i;
    const githubMatch = cleanText.match(githubRegex);
    const github = githubMatch ? githubMatch[0] : null;

    // Find other links that could be portfolios
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = cleanText.match(urlRegex) || [];
    const portfolioUrl = urls.find(url => !url.includes("linkedin.com") && !url.includes("github.com")) || null;

    // 4. Name extraction heuristic
    // Find the first 3 lines, clean and guess candidate name
    const lines = resumeText.split("\n").map(l => l.trim()).filter(l => l.length > 0);
    let name: string | null = null;
    
    // Check first 3 lines for clean capitalizing
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
    // Fallback: If no match, grab first line that doesn't contain contact info
    if (!name && lines.length > 0) {
      name = lines.find(l => !l.includes("@") && !l.includes("+") && l.split(" ").length >= 2 && l.split(" ").length <= 4) || "Candidate Name";
    }

    // 5. Section checklists
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

    // 6. Formatting audits (geometry-based if PDF coordinates are loaded)
    const warnings: AnalysisResult['warnings'] = [];
    let formattingScore = 100;

    // Warning: Columns Detection
    let hasColumns = false;
    if (pdfLines.length > 0) {
      // Find lines that lie on similar Y but have different X bands
      const yMap: Record<number, any[]> = {};
      pdfLines.forEach(l => {
        const roundedY = Math.round(l.y / 15) * 15; // group in 15pt margins
        if (!yMap[roundedY]) yMap[roundedY] = [];
        yMap[roundedY].push(l);
      });

      let splitLines = 0;
      Object.keys(yMap).forEach(y => {
        const lineGroup = yMap[Number(y)];
        if (lineGroup.length >= 2) {
          // Check if elements are widely separated horizontally
          const xCoords = lineGroup.map(item => item.x).sort((a, b) => a - b);
          const maxDiff = xCoords[xCoords.length - 1] - xCoords[0];
          if (maxDiff > 200) splitLines++;
        }
      });

      if (splitLines > 5) {
        hasColumns = true;
        warnings.push({
          id: 'columns',
          title: 'Multi-Column Layout Detected',
          description: 'Your resume uses a multi-column formatting grid. Many legacy Applicant Tracking Systems parse text left-to-right globally, which scrambles content order across columns.',
          severity: 'warning'
        });
        formattingScore -= 20;
      }
    }

    // Warning: Tables/Grid elements
    const tableKeywords = /table|row|column|cell/i;
    if (tableKeywords.test(lowerText) || (pdfLines.length > 0 && !hasColumns && pdfLines.filter(l => l.text.includes(" | ") || l.text.includes("  ")).length > 10)) {
      warnings.push({
        id: 'tables',
        title: 'Potential Tables or Grid Layouts',
        description: 'Using table cells, structural borders, or heavy vertical dividers to format elements can lead to text blocks fusing together in parsing databases.',
        severity: 'warning'
      });
      formattingScore -= 10;
    }

    // Warning: Icons / Heavy Graphics
    const specialCharsCount = (lowerText.match(/[^a-zA-Z0-9\s,.\-@_()]/g) || []).length;
    if (specialCharsCount > 15) {
      warnings.push({
        id: 'graphics',
        title: 'Excessive Special Characters / Icons',
        description: 'Large quantities of graphical symbols, rating stars, progress graphics, or complex glyphs can break encoding when converted to plain text by the ATS parser.',
        severity: 'warning'
      });
      formattingScore -= 10;
    }

    // Warning: PDF page length check
    if (totalPages > 2) {
      warnings.push({
        id: 'page-length',
        title: 'Resume Length Exceeds 2 Pages',
        description: 'Recruiters prefer standard 1-to-2 page resumes. Longer files reduce parsing density and may be flagged for lack of conciseness.',
        severity: 'info'
      });
      formattingScore -= 5;
    }

    // Bounds check
    formattingScore = Math.max(30, formattingScore);

    // 7. Word Count & Readability checks
    const words = resumeText.split(/\s+/).filter(w => w.length > 0);
    const wordCount = words.length;
    const readTime = Math.max(1, Math.round(wordCount / 200));

    let readabilityScore = 100;
    if (wordCount < 250) {
      readabilityScore -= 25;
      warnings.push({
        id: 'short-content',
        title: 'Thin Content Density',
        description: 'Your resume has fewer than 250 words. It lacks the keyword density and details needed to match search terms.',
        severity: 'critical'
      });
    } else if (wordCount > 1200) {
      readabilityScore -= 15;
      warnings.push({
        id: 'long-content',
        title: 'Excessive Text Density',
        description: 'Your resume exceeds 1200 words. Try to trim descriptive padding and consolidate job tasks to improve speed-reading index score.',
        severity: 'info'
      });
    }

    // 8. Action Verbs Checks
    const verbsFound = ACTION_VERBS.filter(v => lowerText.includes(v));
    const actionVerbsCount = verbsFound.length;

    // Check for weak verbs that could be replaced
    const weakVerbsFound: { word: string; suggestion: string }[] = [];
    Object.keys(WEAK_VERBS).forEach(weak => {
      const regex = new RegExp(`\\b${weak}\\b`, 'i');
      if (regex.test(lowerText)) {
        weakVerbsFound.push({
          word: weak.charAt(0).toUpperCase() + weak.slice(1),
          suggestion: WEAK_VERBS[weak]
        });
      }
    });

    let experienceScore = 50;
    if (sections.experience) experienceScore += 20;
    if (verbsFound.length >= 6) experienceScore += 15;
    // Check for quantifiable metric numbers e.g. "20%", "$10k", "5x"
    const hasMetrics = /[\d]+[%$]|increased|decreased|saved|reduced/i.test(lowerText);
    if (hasMetrics) {
      experienceScore += 15;
    } else {
      warnings.push({
        id: 'metrics',
        title: 'Missing Quantifiable Achievements',
        description: 'We could not detect measurable outcomes (percentages, currencies, metrics) in your experience text. Add metrics to build recruiter trust.',
        severity: 'warning'
      });
    }

    // 9. Education Score
    let educationScore = 40;
    if (sections.education) educationScore += 30;
    if (sections.certifications) educationScore += 30;

    // 10. Skills Score
    const foundTech = TECHNICAL_SKILLS.filter(s => lowerText.includes(s));
    const foundSoft = SOFT_SKILLS.filter(s => lowerText.includes(s));
    const totalSkillsFound = foundTech.length + foundSoft.length;

    let skillsScore = Math.min(100, Math.round((totalSkillsFound / 12) * 100));
    if (skillsScore < 50) {
      warnings.push({
        id: 'low-skills',
        title: 'Low Skill Keywords Count',
        description: 'We detected very few technical or soft skill keywords. Create a clear "Skills" section to list your core toolsets.',
        severity: 'warning'
      });
    }

    // 11. Experience level estimation
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
    } else {
      if (lowerText.includes("junior") || lowerText.includes("intern")) experienceLevel = 'Junior';
      else if (lowerText.includes("senior") || lowerText.includes("lead")) experienceLevel = 'Senior';
      else if (lowerText.includes("director") || lowerText.includes("vp") || lowerText.includes("executive")) experienceLevel = 'Executive';
    }

    // 12. Keywords Overlap (if JD is provided)
    let keywordScore = 75; // baseline default if no JD is matched
    const matched: string[] = [];
    const missing: string[] = [];
    let recommended: string[] = [];
    let density = 0;
    
    const techMatched: string[] = [];
    const softMatched: string[] = [];

    if (jdRawText && jdRawText.trim().length > 0) {
      const cleanJd = jdRawText.toLowerCase().replace(/[^a-zA-Z0-9\s#+.]/g, ' ');
      const jdWords = cleanJd.split(/\s+/).filter(w => w.length > 2);
      
      // Filter out common stop words
      const stopWords = ["the", "and", "for", "with", "this", "that", "from", "your", "will", "have", "been", "must", "with", "about"];
      const jdKeywords = Array.from(new Set(jdWords.filter(w => !stopWords.includes(w))));

      // Find overlapping terms in skills list
      const combinedSkillsList = [...TECHNICAL_SKILLS, ...SOFT_SKILLS];
      const jdSpecificSkills = combinedSkillsList.filter(skill => jdRawText.toLowerCase().includes(skill));

      jdSpecificSkills.forEach(skill => {
        if (lowerText.includes(skill)) {
          matched.push(skill);
          if (TECHNICAL_SKILLS.includes(skill)) techMatched.push(skill);
          if (SOFT_SKILLS.includes(skill)) softMatched.push(skill);
        } else {
          missing.push(skill);
        }
      });

      // Recommended skills related to target role or jd
      recommended = combinedSkillsList
        .filter(s => !matched.includes(s) && !missing.includes(s))
        .slice(0, 5);

      // Score calculation
      if (jdSpecificSkills.length > 0) {
        keywordScore = Math.round((matched.length / jdSpecificSkills.length) * 100);
      } else {
        keywordScore = 90; // Default if JD text is too generic
      }

      // Keyword Density (percentage of skills matched vs total words)
      density = parseFloat(((matched.length * 2) / (wordCount || 1) * 100).toFixed(1));
    } else {
      // General role-based defaults if targetRole matches
      const target = targetRole.toLowerCase();
      const roleKeywords = TECHNICAL_SKILLS.filter(s => target.includes(s) || s === target);
      if (roleKeywords.length > 0) {
        roleKeywords.forEach(k => {
          if (lowerText.includes(k)) matched.push(k);
          else missing.push(k);
        });
        recommended = TECHNICAL_SKILLS.filter(s => !matched.includes(s) && !missing.includes(s)).slice(0, 5);
      } else {
        recommended = ["React", "SQL", "Project Management", "Python", "Communication"];
      }
    }

    // 13. Suggestions list
    const suggestions: string[] = [];
    if (!email) suggestions.push("Add a professional email address (e.g. name@domain.com) in contact section.");
    if (!phone) suggestions.push("Provide a direct phone number for recruiters to call.");
    if (!linkedin) suggestions.push("Add your custom LinkedIn profile link to build social proof.");
    if (!sections.summary) suggestions.push("Include a brief Professional Summary or Profile objective at the top.");
    if (!sections.skills) suggestions.push("Create a clear technical Skills section for scanning databases.");
    if (!sections.projects) suggestions.push("List 2-3 personal or professional projects to show hands-on experience.");
    if (verbsFound.length < 5) suggestions.push("Incorporate stronger action verbs (e.g., spearheaded, engineered) in job details.");
    if (!hasMetrics) suggestions.push("Add quantifiable metrics (percentages, savings, currency value) to highlight job impact.");
    if (hasColumns) suggestions.push("Adopt a clean, single-column resume template to prevent parsing overlaps.");
    if (missing.length > 0) {
      suggestions.push(`Include missing target keywords: ${missing.slice(0, 3).join(', ')}.`);
    }

    // 14. Calculate Overall Weighted Score
    // Formatting: 15%, Keyword: 30%, Skills: 20%, Experience: 15%, Education: 10%, Readability: 10%
    const overallScore = Math.round(
      (formattingScore * 0.15) +
      (keywordScore * 0.3) +
      (skillsScore * 0.2) +
      (experienceScore * 0.15) +
      (educationScore * 0.1) +
      (readabilityScore * 0.1)
    );

    return {
      overallScore,
      formattingScore,
      keywordScore,
      skillsScore,
      experienceScore,
      educationScore,
      readabilityScore,
      sections,
      contacts: { name, email, phone, linkedin, github, portfolio: portfolioUrl },
      keywords: { matched, missing, recommended, density, techMatched, softMatched },
      warnings,
      suggestions: suggestions.slice(0, 5),
      weakVerbsFound,
      actionVerbsCount,
      experienceLevel,
      readTime,
      wordCount,
      pageCount: totalPages || 1,
      topSkills: foundTech.slice(0, 6),
      missingSkills: missing.slice(0, 6)
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
    
    // Step 0: Upload / Reading file
    setProcessingStep(0);
    setUploadProgress(20);

    try {
      let extractedResumeText = "";
      let pdfLines: any[] = [];
      let totalPages = 1;

      // Extract text based on file format
      const ext = resumeFile.name.split('.').pop()?.toLowerCase();
      
      // Simulate reading progress delay
      await new Promise(r => setTimeout(r, 600));
      setUploadProgress(50);
      setProcessingStep(1); // Parsing document text layers

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

      setUploadProgress(80);
      setProcessingStep(2); // Running layout audits
      await new Promise(r => setTimeout(r, 650));

      // Extract Job Description if uploaded as file
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

      setProcessingStep(3); // Checking keywords and semantic matches
      await new Promise(r => setTimeout(r, 700));
      setUploadProgress(100);

      // Perform Core Analysis Heuristics
      const analysis = analyzeResume(extractedResumeText, pdfLines, totalPages, jobDescContent);
      setResult(analysis);
      toast.success("Resume analysis completed successfully!");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to process resume file. Make sure it is not corrupted.");
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
    toast.success("Tool link copied to clipboard. Share it with your colleagues!");
  };

  const handlePrint = () => {
    window.print();
  };

  // Custom visual components
  const scoreColors = (score: number) => {
    if (score >= 80) return { text: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', stroke: '#10b981', gradient: 'from-emerald-500 to-teal-500' };
    if (score >= 60) return { text: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20', stroke: '#f59e0b', gradient: 'from-amber-500 to-orange-500' };
    return { text: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500/20', stroke: '#f43f5e', gradient: 'from-rose-500 to-pink-500' };
  };

  return (
    <div className="bg-[#030712] min-h-screen py-10 relative overflow-hidden font-sans print:bg-white print:text-black">
      {/* Background Grid Pattern & Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-blue-600/5 blur-[120px] -z-10 print:hidden" />
      <div className="absolute top-0 left-0 right-0 h-full bg-grid-pattern opacity-[0.02] -z-20 print:hidden" />

      {/* Structured SEO schemas */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchema) }}
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10 print:px-0">
        
        {/* Back Link */}
        <Link
          href="/tools"
          className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-widest text-gray-500 hover:text-blue-500 transition-colors mb-10 group print:hidden"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Directory
        </Link>

        {/* ====================================================
            HEADER
            ==================================================== */}
        <div className="glass rounded-[2rem] p-6 sm:p-8 mb-8 border border-white/5 print:hidden">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)] shrink-0">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-white tracking-tighter">ATS Resume Checker</h1>
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
            UPLOAD & SETTINGS CONTAINER (HIDDEN WHEN RESULTS LOADED)
            ==================================================== */}
        <AnimatePresence>
          {!result && !isProcessing && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 print:hidden"
            >
              {/* LEFT: UPLOAD BOX */}
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
                  className={`glass rounded-3xl p-8 border-2 border-dashed transition-all flex flex-col items-center justify-center text-center group min-h-[360px] relative ${
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
                        <p className="text-white font-bold text-lg truncate px-4">{resumeFile.name}</p>
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
                        <UploadCloud className="w-10 h-10" />
                      </div>
                      <div>
                        <button
                          onClick={() => resumeInputRef.current?.click()}
                          className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:scale-[1.02] active:scale-95"
                        >
                          Browse Resume File
                        </button>
                        <p className="text-sm text-gray-400 font-medium mt-4">Drag and drop your file here, or browse from device</p>
                      </div>
                      <div className="flex flex-wrap justify-center gap-2 pt-2">
                        <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase bg-white/5 border border-white/10 text-gray-400">PDF (.pdf)</span>
                        <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase bg-white/5 border border-white/10 text-gray-400">DOCX (.docx)</span>
                        <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase bg-white/5 border border-white/10 text-gray-400">TXT (.txt)</span>
                        <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase bg-white/5 border border-white/10 text-gray-400">MAX 10 MB</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Secure & Privacy Banner */}
                <div className="glass p-5 rounded-2xl border border-white/5 flex items-start gap-4">
                  <div className="p-2.5 bg-blue-500/10 text-blue-500 rounded-xl border border-blue-500/20 shrink-0">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-sm">Privacy-First Guarantee</h4>
                    <p className="text-xs text-gray-400 mt-1 leading-relaxed">Your resume is parsed locally in browser memory. Files are not uploaded, saved, or logged on our servers, ensuring your previous roles and contacts stay completely private.</p>
                  </div>
                </div>
              </div>

              {/* RIGHT: JOB SETTINGS BOX */}
              <div className="lg:col-span-5 space-y-6">
                <div className="glass p-6 rounded-3xl border border-white/5 space-y-5">
                  <h3 className="text-white font-black text-lg tracking-tight uppercase border-b border-white/5 pb-3">Target Details</h3>
                  
                  {/* Optional Target Role */}
                  <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Target Job Role (Optional)</label>
                    <input
                      type="text"
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                      placeholder="e.g. Senior Frontend Engineer"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-sm text-white"
                    />
                    
                    {/* Examples list */}
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
                        if (e.target.value) setJdFile(null); // clear file if text entered
                      }}
                      rows={5}
                      placeholder="Paste the job description copy to check formatting matches and missing keywords..."
                      className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-sm text-white resize-none custom-scrollbar"
                    />
                  </div>

                  {/* OR Upload Job Description File */}
                  <div className="relative flex items-center justify-center border-t border-white/5 pt-4">
                    <span className="absolute bg-[#0b1021] px-3 text-[10px] font-black text-gray-500 uppercase tracking-widest">OR</span>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Upload Job Description File</label>
                    <div
                      onDragOver={(e) => { e.preventDefault(); setIsDraggingOverJd(true); }}
                      onDragLeave={() => setIsDraggingOverJd(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDraggingOverJd(false);
                        const file = e.dataTransfer.files?.[0];
                        if (file) handleJdFileSelect(file);
                      }}
                      className={`px-4 py-4 rounded-xl border border-dashed transition-all text-center flex flex-col items-center justify-center cursor-pointer ${
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

                  {/* Submit Button */}
                  <button
                    onClick={processResumeAnalysis}
                    disabled={!resumeFile}
                    className="w-full flex items-center justify-center gap-3 px-6 py-4 text-xs font-black uppercase tracking-widest text-white bg-blue-600 rounded-xl hover:bg-blue-500 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(37,99,235,0.3)] active:scale-95 duration-200"
                  >
                    <Sparkles className="w-4 h-4 animate-pulse" />
                    <span>Audit Resume Now</span>
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
                  <FileText className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">Processing Resume...</h3>
                  <p className="text-xs text-gray-400 mt-1">Please wait, analyzing document layouts and keywords.</p>
                </div>
              </div>

              {/* Progress Steps */}
              <div className="space-y-4 max-w-sm mx-auto w-full">
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    processingStep >= 1 ? 'bg-emerald-500 text-white' : 'bg-white/10 text-gray-400'
                  }`}>
                    {processingStep >= 1 ? <Check className="w-3 h-3" /> : '1'}
                  </div>
                  <span className={`text-xs ${processingStep >= 1 ? 'text-white font-bold' : 'text-gray-400'}`}>Reading text layer...</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    processingStep >= 2 ? 'bg-emerald-500 text-white' : 'bg-white/10 text-gray-400'
                  }`}>
                    {processingStep >= 2 ? <Check className="w-3 h-3" /> : '2'}
                  </div>
                  <span className={`text-xs ${processingStep >= 2 ? 'text-white font-bold' : 'text-gray-400'}`}>Auditing layout bounds...</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    processingStep >= 3 ? 'bg-emerald-500 text-white' : 'bg-white/10 text-gray-400'
                  }`}>
                    {processingStep >= 3 ? <Check className="w-3 h-3" /> : '3'}
                  </div>
                  <span className={`text-xs ${processingStep >= 3 ? 'text-white font-bold' : 'text-gray-400'}`}>Matching JD keywords...</span>
                </div>
              </div>

              {/* Custom Loading Bar */}
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
            VISUAL DASHBOARD REPORT (SHOWN AFTER PROCESSING)
            ==================================================== */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              {/* DASHBOARD TOP ACTIONS */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/5 border border-white/5 p-4 rounded-2xl print:hidden">
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs text-gray-400 font-medium">Successfully audited resume for {result.contacts.name || "Job Candidate"}</span>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    onClick={handlePrint}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-white bg-blue-600 rounded-xl hover:bg-blue-500 transition-all shadow-[0_0_15px_rgba(37,99,235,0.2)]"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Download Report</span>
                  </button>
                  <button
                    onClick={copyShareLink}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-gray-400 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Share Report</span>
                  </button>
                </div>
              </div>

              {/* PRINT ONLY REPORT HEADER CARD */}
              <div className="hidden print:block border-b border-gray-200 pb-6 mb-8 text-black bg-white">
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-3xl font-bold tracking-tight">ATS Resume Compatibility Report</h1>
                    <p className="text-sm text-gray-500 mt-1">Generated by ToolWala AI Resume Auditor</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{result.contacts.name || "Job Candidate"}</p>
                    <p className="text-xs text-gray-500">{result.contacts.email || "Email missing"}</p>
                    <p className="text-xs text-gray-500">{result.contacts.phone || "Phone missing"}</p>
                  </div>
                </div>
              </div>

              {/* GRID: CORE BREAKDOWN OVERVIEW */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* LEFT COLUMN: COMPATIBILITY SCORE RING & STATS */}
                <div className="lg:col-span-4 space-y-6">
                  
                  {/* Score Card */}
                  <div className="glass p-6 rounded-3xl border border-white/5 flex flex-col items-center justify-center text-center relative print:border-gray-200 print:text-black">
                    <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-6">Compatibility Score</h3>
                    
                    {/* SVG CIRCULAR PROGRESS GAUGE */}
                    <div className="relative w-44 h-44 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90">
                        {/* Track ring */}
                        <circle
                          cx="88"
                          cy="88"
                          r="76"
                          className="stroke-white/5 fill-transparent"
                          strokeWidth="12"
                        />
                        {/* Animated Score progress ring */}
                        <motion.circle
                          cx="88"
                          cy="88"
                          r="76"
                          className="fill-transparent"
                          stroke={scoreColors(result.overallScore).stroke}
                          strokeWidth="12"
                          strokeDasharray="478"
                          initial={{ strokeDashoffset: 478 }}
                          animate={{ strokeDashoffset: 478 - (478 * result.overallScore) / 100 }}
                          transition={{ duration: 1.5, ease: "easeOut" }}
                          strokeLinecap="round"
                        />
                      </svg>
                      {/* Score values absolute block */}
                      <div className="absolute text-center">
                        <span className="text-4xl font-black tracking-tighter text-white print:text-black">{result.overallScore}</span>
                        <span className="text-xs text-gray-500 block font-semibold">of 100</span>
                      </div>
                    </div>

                    <div className="mt-6">
                      <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider ${scoreColors(result.overallScore).bg} ${scoreColors(result.overallScore).text} border ${scoreColors(result.overallScore).border}`}>
                        {result.overallScore >= 80 ? 'ATS Compatible' : result.overallScore >= 60 ? 'Needs Optimization' : 'Low Compatibility'}
                      </span>
                    </div>

                    <p className="text-xs text-gray-400 mt-5 leading-relaxed">
                      {result.overallScore >= 80 ? 'Your resume is highly optimized for applicant tracking filters. Formatting and keyword densities are in line with standards.' : result.overallScore >= 60 ? 'Your resume will pass basic scanners, but some formatting fixes and targeted keywords are needed to ensure high ranks.' : 'Critical issues detected. Legacy ATS parsers are highly likely to break text layers or discard your resume.'}
                    </p>
                  </div>

                  {/* Section completeness block */}
                  <div className="glass p-6 rounded-3xl border border-white/5 print:border-gray-200">
                    <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4">Section Check</h3>
                    <div className="grid grid-cols-2 gap-3.5">
                      {Object.keys(result.sections).map((key) => {
                        const hasSec = result.sections[key as keyof typeof result.sections];
                        return (
                          <div key={key} className="flex items-center gap-2 bg-white/5 border border-white/5 px-3 py-2 rounded-xl">
                            {hasSec ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                            ) : (
                              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                            )}
                            <span className="text-xs font-bold text-white capitalize truncate print:text-black">
                              {key === 'summary' ? 'Summary' : key}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Contact Info checklist */}
                  <div className="glass p-6 rounded-3xl border border-white/5 print:border-gray-200">
                    <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4">Contact Info Audits</h3>
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
                            <span className="text-emerald-500 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded text-[10px] uppercase">Found</span>
                          ) : (
                            <span className="text-rose-500 font-bold bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded text-[10px] uppercase">Missing</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                {/* RIGHT COLUMN: DETAIL TABS & BREAKDOWN PANELS */}
                <div className="lg:col-span-8 space-y-6">

                  {/* TABS MENU NAVIGATION */}
                  <div className="flex gap-1 overflow-x-auto pb-1.5 border-b border-white/5 scrollbar-thin print:hidden">
                    {[
                      { id: 'overview', name: 'Overview' },
                      { id: 'keywords', name: 'Keywords' },
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

                  {/* TABS CONTAINER BODY */}
                  <div className="space-y-6">

                    {/* OVERVIEW TAB */}
                    {activeTab === 'overview' && (
                      <div className="space-y-6">
                        
                        {/* Score breakdown metrics */}
                        <div className="glass p-6 rounded-3xl border border-white/5 print:border-gray-200">
                          <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-6">Audited Scores Breakdown</h3>
                          <div className="space-y-5">
                            {[
                              { name: 'Formatting & Layout Structure', score: result.formattingScore },
                              { name: 'Keyword Relevancy Match', score: result.keywordScore },
                              { name: 'Technical & Soft Skills Index', score: result.skillsScore },
                              { name: 'Experience & Action Metrics', score: result.experienceScore },
                              { name: 'Academic & Certificate Credentials', score: result.educationScore },
                              { name: 'Readability & Word Spacing', score: result.readabilityScore }
                            ].map((bar, idx) => (
                              <div key={idx} className="space-y-2">
                                <div className="flex justify-between text-xs">
                                  <span className="text-gray-300 font-bold print:text-black">{bar.name}</span>
                                  <span className={`font-black ${scoreColors(bar.score).text}`}>{bar.score}/100</span>
                                </div>
                                <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden border border-white/5">
                                  <div
                                    className={`h-full bg-gradient-to-r ${scoreColors(bar.score).gradient}`}
                                    style={{ width: `${bar.score}%` }}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Top Actionable recommendations cards */}
                        <div className="glass p-6 rounded-3xl border border-white/5 print:border-gray-200">
                          <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4">Actionable Recommendations</h3>
                          <div className="space-y-3">
                            {result.suggestions.length > 0 ? (
                              result.suggestions.map((suggestion, idx) => (
                                <div key={idx} className="flex items-start gap-3.5 bg-white/5 border border-white/5 p-4 rounded-2xl">
                                  <div className="w-6 h-6 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-500 flex items-center justify-center text-xs font-bold shrink-0">
                                    {idx + 1}
                                  </div>
                                  <p className="text-xs text-gray-300 font-medium leading-relaxed print:text-black">{suggestion}</p>
                                </div>
                              ))
                            ) : (
                              <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl text-emerald-400">
                                <ThumbsUp className="w-5 h-5 shrink-0" />
                                <span className="text-xs font-bold">Excellent job! We have no critical adjustments to suggest for your resume.</span>
                              </div>
                            )}
                          </div>
                        </div>

                      </div>
                    )}

                    {/* KEYWORDS TAB */}
                    {activeTab === 'keywords' && (
                      <div className="space-y-6">
                        
                        {/* Keyword density panel */}
                        <div className="glass p-6 rounded-3xl border border-white/5 print:border-gray-200">
                          <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
                            <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest">Job Keyword Metrics</h3>
                            {jdText || jdFile ? (
                              <span className="text-[10px] font-black uppercase bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2 py-0.5 rounded">Custom Match Active</span>
                            ) : (
                              <span className="text-[10px] font-black uppercase bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2 py-0.5 rounded">Generic Defaults</span>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                            <div className="space-y-3">
                              <p className="text-xs text-gray-400 leading-relaxed">
                                {jdText || jdFile 
                                  ? 'We compared your resume text directly against the job requirements you pasted. Matching keywords improves your ranking in ATS recruiter searches.'
                                  : 'To get a custom keyword alignment score, paste a target job description in the settings panel. Currently showing generic industry skills overlap.'
                                }
                              </p>
                              <div className="pt-2">
                                <div className="flex justify-between text-xs mb-1">
                                  <span className="text-gray-400">Target Keyword Density</span>
                                  <span className="text-white font-bold">{result.keywords.density}%</span>
                                </div>
                                <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                                  <div className="bg-blue-500 h-full" style={{ width: `${Math.min(100, result.keywords.density * 5)}%` }} />
                                </div>
                                <span className="text-[9px] text-gray-500 mt-1 block">Optimal keyword density ranges from 2% to 6%.</span>
                              </div>
                            </div>
                            
                            {/* Stats rings */}
                            <div className="flex justify-center gap-6">
                              <div className="text-center">
                                <div className="text-3xl font-black text-emerald-500">{result.keywords.matched.length}</div>
                                <div className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-wider">Matched Keys</div>
                              </div>
                              <div className="text-center">
                                <div className="text-3xl font-black text-rose-500">{result.keywords.missing.length}</div>
                                <div className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-wider">Missing Keys</div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Keyword list breakdown grids */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          
                          {/* Matched Keywords */}
                          <div className="glass p-5 rounded-3xl border border-white/5 print:border-gray-200">
                            <h4 className="text-xs font-black text-emerald-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 shrink-0" />
                              <span>Matched Keywords ({result.keywords.matched.length})</span>
                            </h4>
                            {result.keywords.matched.length > 0 ? (
                              <div className="flex flex-wrap gap-1.5">
                                {result.keywords.matched.map((key) => (
                                  <span key={key} className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 capitalize">
                                    {key}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs text-gray-500 italic">No skills overlap matches found.</p>
                            )}
                          </div>

                          {/* Missing Keywords */}
                          <div className="glass p-5 rounded-3xl border border-white/5 print:border-gray-200">
                            <h4 className="text-xs font-black text-rose-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                              <AlertCircle className="w-4 h-4 shrink-0" />
                              <span>Missing Keywords ({result.keywords.missing.length})</span>
                            </h4>
                            {result.keywords.missing.length > 0 ? (
                              <div className="flex flex-wrap gap-1.5">
                                {result.keywords.missing.map((key) => (
                                  <span key={key} className="px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-500/10 border border-rose-500/20 text-rose-400 capitalize">
                                    {key}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs text-gray-500 italic">No missing keywords detected. Great matching!</p>
                            )}
                          </div>

                        </div>

                        {/* Recommended Keywords */}
                        <div className="glass p-5 rounded-3xl border border-white/5 print:border-gray-200">
                          <h4 className="text-xs font-black text-blue-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Zap className="w-4 h-4 shrink-0" />
                            <span>Recommended Skill Additions</span>
                          </h4>
                          <div className="flex flex-wrap gap-1.5">
                            {result.keywords.recommended.map((key) => (
                              <span key={key} className="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-500/10 border border-blue-500/20 text-blue-400 capitalize">
                                {key}
                              </span>
                            ))}
                          </div>
                        </div>

                      </div>
                    )}

                    {/* WARNINGS & LAYOUT TAB */}
                    {activeTab === 'formatting' && (
                      <div className="space-y-6">
                        
                        {/* Warnings lists */}
                        <div className="glass p-6 rounded-3xl border border-white/5 print:border-gray-200">
                          <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4">ATS Compatibility Warning Checks</h3>
                          {result.warnings.length > 0 ? (
                            <div className="space-y-4">
                              {result.warnings.map((warn, index) => (
                                <div key={index} className="flex items-start gap-4 bg-white/5 border border-white/5 p-4 rounded-2xl">
                                  <div className={`p-2 rounded-xl shrink-0 border ${
                                    warn.severity === 'critical' 
                                      ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' 
                                      : warn.severity === 'warning'
                                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                      : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                  }`}>
                                    <AlertTriangle className="w-5 h-5" />
                                  </div>
                                  <div className="space-y-1">
                                    <h4 className="text-white font-bold text-sm print:text-black">{warn.title}</h4>
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
                                <h4 className="text-white font-bold">No Formatting Errors Found</h4>
                                <p className="text-xs text-gray-500 mt-1">Your resume document follows the correct linear layout structure for ATS algorithms.</p>
                              </div>
                            </div>
                          )}
                        </div>

                      </div>
                    )}

                    {/* ACTION VERBS TAB */}
                    {activeTab === 'verbs' && (
                      <div className="space-y-6">
                        
                        {/* Verb counter card */}
                        <div className="glass p-6 rounded-3xl border border-white/5 print:border-gray-200">
                          <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4">Verb Audit Summary</h3>
                          <div className="flex items-center gap-5">
                            <div className="text-3xl font-black text-white">{result.actionVerbsCount}</div>
                            <div>
                              <p className="text-xs text-gray-400 leading-relaxed">
                                Action verbs show ownership and deliver outcomes. We detected {result.actionVerbsCount} strong verbs in your descriptions. Target at least 5 distinct action verbs.
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Weak verbs found and suggested changes */}
                        <div className="glass p-6 rounded-3xl border border-white/5 print:border-gray-200">
                          <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4">Weak Verb Replacements</h3>
                          {result.weakVerbsFound.length > 0 ? (
                            <div className="divide-y divide-white/5">
                              {result.weakVerbsFound.map((item, idx) => (
                                <div key={idx} className="py-4 flex justify-between items-center gap-4 first:pt-0 last:pb-0">
                                  <div>
                                    <span className="text-rose-400 font-bold bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 rounded-lg text-xs">{item.word}</span>
                                    <span className="text-gray-400 text-xs ml-3">detected in text</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-gray-500 text-xs">Replace with:</span>
                                    <span className="text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg text-xs">{item.suggestion}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-6 space-y-2">
                              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                              <h4 className="text-white text-sm font-bold">Excellent Action Verbs Usage</h4>
                              <p className="text-xs text-gray-500">No weak or repetitive responsibility verbs detected in your resume.</p>
                            </div>
                          )}
                        </div>

                      </div>
                    )}

                    {/* RESUME INSIGHTS TAB */}
                    {activeTab === 'insights' && (
                      <div className="space-y-6">
                        
                        {/* Core metric stats grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                          <div className="glass p-4 rounded-2xl border border-white/5 text-center">
                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-wider">Word Count</span>
                            <div className="text-xl font-black text-white mt-1.5">{result.wordCount}</div>
                          </div>
                          <div className="glass p-4 rounded-2xl border border-white/5 text-center">
                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-wider">Page Count</span>
                            <div className="text-xl font-black text-white mt-1.5">{result.pageCount}</div>
                          </div>
                          <div className="glass p-4 rounded-2xl border border-white/5 text-center">
                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-wider">Read Time</span>
                            <div className="text-xl font-black text-white mt-1.5">{result.readTime} min</div>
                          </div>
                          <div className="glass p-4 rounded-2xl border border-white/5 text-center">
                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-wider">Estimated Level</span>
                            <div className="text-xl font-black text-white mt-1.5">{result.experienceLevel}</div>
                          </div>
                        </div>

                        {/* Top skills lists */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="glass p-5 rounded-3xl border border-white/5 print:border-gray-200">
                            <h4 className="text-xs font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                              <span>Detected Primary Skills</span>
                            </h4>
                            <div className="flex flex-wrap gap-1.5">
                              {result.topSkills.map((s) => (
                                <span key={s} className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-lg text-xs font-bold text-gray-300 capitalize">{s}</span>
                              ))}
                            </div>
                          </div>
                          <div className="glass p-5 rounded-3xl border border-white/5 print:border-gray-200">
                            <h4 className="text-xs font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                              <span>Top Missing Skills</span>
                            </h4>
                            <div className="flex flex-wrap gap-1.5">
                              {result.missingSkills.length > 0 ? (
                                result.missingSkills.map((s) => (
                                  <span key={s} className="px-2.5 py-1 bg-red-500/5 border border-red-500/10 text-red-400 rounded-lg text-xs font-bold capitalize">{s}</span>
                                ))
                              ) : (
                                <span className="text-xs text-gray-500 italic">No missing critical tools flagged.</span>
                              )}
                            </div>
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
            FEATURED INTERACTIVE RESOURCES & ARTICLES (GUIDES)
            ==================================================== */}
        <div className="mt-20 space-y-6 print:hidden">
          <div className="border-b border-white/5 pb-4">
            <h2 className="text-xl font-black text-white tracking-tight uppercase">Featured ATS & Career Knowledge Hub</h2>
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
                  <h3 className="text-white font-bold text-sm tracking-tight group-hover:text-blue-400 transition-colors">{guide.title}</h3>
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
            {/* Modal background glass backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveGuide(null)}
              className="absolute inset-0 bg-[#030712]/80 backdrop-blur-md"
            />
            {/* Modal slider panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 220 }}
              className="relative w-full max-w-2xl h-full bg-[#090d1a] border-l border-white/10 p-6 sm:p-8 overflow-y-auto custom-scrollbar flex flex-col justify-between"
            >
              <div className="space-y-6">
                {/* Header info */}
                <div className="flex justify-between items-start border-b border-white/5 pb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{activeGuide.icon}</span>
                    <h3 className="text-white font-black text-lg uppercase tracking-tight">{activeGuide.title}</h3>
                  </div>
                  <button
                    onClick={() => setActiveGuide(null)}
                    className="p-2 hover:bg-white/5 rounded-xl border border-transparent hover:border-white/10 text-gray-400 hover:text-white transition-all text-xs font-black uppercase tracking-wider"
                  >
                    Close
                  </button>
                </div>

                {/* Content body markdown conversion */}
                <div className="prose prose-invert prose-xs text-xs text-gray-300 font-medium leading-relaxed space-y-4">
                  {activeGuide.content.split('\n\n').map((paragraph, index) => {
                    if (paragraph.startsWith('### ')) {
                      return <h4 key={index} className="text-white font-black text-sm uppercase tracking-wider pt-2">{paragraph.replace('### ', '')}</h4>;
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

              {/* Bottom guide footer */}
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
          /* Ensure circular gauges display color stroke */
          svg circle {
            print-color-adjust: exact !important;
            -webkit-print-color-adjust: exact !important;
          }
          /* Custom layout overrides */
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
