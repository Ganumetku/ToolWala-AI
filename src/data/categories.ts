import { Tool } from './tools';

export interface CategoryMetadata {
  id: string;
  slug: string;
  title: string;
  description: string;
  intro: string;
  icon: string;
  seoTitle: string;
  seoDescription: string;
  keywords: string[];
  faqs: { question: string; answer: string }[];
}

export const categoriesData: CategoryMetadata[] = [
  {
    id: "pdf-tools",
    slug: "pdf-tools",
    title: "PDF Tools",
    description: "Professional PDF suite to merge, split, compress, watermark, and convert documents locally.",
    intro: "A collection of 9+ high-performance PDF manipulation utilities designed to streamline your document workflows with complete security.",
    icon: "📄",
    seoTitle: "PDF Tools - Free Online PDF Editor, Splitter & Compressor | ToolWala AI",
    seoDescription: "Edit, merge, split, compress, watermark, protect, and scan PDF files locally. No subscription, no server uploads. Your data stays private.",
    keywords: ["pdf tools", "merge pdf", "split pdf", "compress pdf", "protect pdf", "watermark pdf", "pdf editor", "local pdf scanner"],
    faqs: [
      {
        question: "Are my PDF files secure on ToolWala AI?",
        answer: "Yes. All processing is executed 100% locally in your browser. Your documents never touch our servers or any cloud database."
      },
      {
        question: "Is this PDF toolkit completely free?",
        answer: "Absolutely. All document conversion, page sorting, split, and compression operations are fully free with no download caps."
      }
    ]
  },
  {
    id: "image-tools",
    slug: "image-tools",
    title: "Image Tools",
    description: "Automated background remover, passport photo resizer, and image optimizer.",
    intro: "Create standardized ID photos, extract subject cutouts, generate QR codes, and compress image file sizes instantly.",
    icon: "🖼️",
    seoTitle: "Image Tools & Photo Editors Online | ToolWala AI",
    seoDescription: "Standardize passport photos, crop Aadhaar cards, remove image backgrounds, and compress photos with local browser engines.",
    keywords: ["image tools", "crop passport photo", "aadhaar photo resizer", "bg remover", "image compressor", "color palette", "free image editor"],
    faqs: [
      {
        question: "Does the AI background remover run locally?",
        answer: "Yes. It leverages edge WebAssembly models from @imgly/background-removal inside your browser. No server uploads are required."
      },
      {
        question: "What formats does the Image Compressor support?",
        answer: "It supports JPG, JPEG, PNG, and WebP formats, compressing images up to 90% without losing visual clarity."
      }
    ]
  },
  {
    id: "ai-tools",
    slug: "ai-tools",
    title: "AI Tools",
    description: "Premium AI resume constructor, voice reader, and social caption generators.",
    intro: "Leverage advanced localized AI models to build ATS resumes, humanize text, and create engaging social media copy.",
    icon: "🤖",
    seoTitle: "AI Tools - AI Logo Maker, Resume Builder & Text Humanizer | ToolWala AI",
    seoDescription: "Supercharge your career and content creation with local AI logo generators, resume builders, and voice creators.",
    keywords: ["ai tools", "ai logo maker", "resume builder", "ai resume constructor", "ai text humanizer", "ai voice generator"],
    faqs: [
      {
        question: "Is the AI Resume Builder ATS-compliant?",
        answer: "Yes. All templates generated are structured specifically to be easily parsed and scored by Applicant Tracking Systems (ATS)."
      },
      {
        question: "How does the AI Text Humanizer work?",
        answer: "It scans AI-generated text structures to simplify vocabulary and adjust syntax, helping the text read more naturally and sound human-written."
      }
    ]
  },
  {
    id: "document-tools",
    slug: "document-tools",
    title: "Document Tools",
    description: "Invoice editors, cover letters, and standard business utilities.",
    intro: "Prepare templates, client invoices, and job applications with standardized document layout formats.",
    icon: "📁",
    seoTitle: "Document Tools - Invoice & Resume Builders | ToolWala AI",
    seoDescription: "Create professional business invoices, custom cover letters, and ATS resumes online in seconds.",
    keywords: ["document tools", "invoice generator", "billing utility", "cover letter creator", "ats resume template"],
    faqs: [
      {
        question: "Can I download invoices as professional PDFs?",
        answer: "Yes. Invoices compile instantly into standard print-ready PDF formats containing custom line items and tax templates."
      }
    ]
  },
  {
    id: "utility-tools",
    slug: "utility-tools",
    title: "Utility Tools",
    description: "Secure data extraction engines, converters, and other helpers.",
    intro: "Process OCR document scans and utility scripts instantly with secure client-side code.",
    icon: "⚙️",
    seoTitle: "Utility Tools - Online OCR & Secure Scanners | ToolWala AI",
    seoDescription: "Extract metadata and scan image files without sending anything to remote servers.",
    keywords: ["ocr to text", "extract text from screenshot", "utility tools"],
    faqs: [
      {
        question: "How does secure local OCR scan my files?",
        answer: "It runs Tesseract.js WASM engine entirely inside your local sandbox, keeping scanned image details protected."
      }
    ]
  },
  {
    id: "resume-career",
    slug: "resume-career",
    title: "Resume & Career",
    description: "ATS Resume constructors, cover letters, and application creators.",
    intro: "Create ATS-compliant layouts and custom cover letters to stand out in hiring pipelines.",
    icon: "💼",
    seoTitle: "Resume & Career - CV Builder & Cover Letter Creator | ToolWala AI",
    seoDescription: "Construct clean, ATS-scorable resumes and write custom job cover letters easily and for free.",
    keywords: ["resume builder", "ats cv layout", "cover letter generator", "career utilities"],
    faqs: [
      {
        question: "Is my personal career details stored?",
        answer: "Never. All fields typed are stored in local sandbox memory, ensuring absolute security and privacy."
      }
    ]
  },
  {
    id: "seo-tools",
    slug: "seo-tools",
    title: "SEO Tools",
    description: "Content optimizer helpers, OCR text parsers, and tag scanners.",
    intro: "Optimize tags and humanize blog copy for search engines and readabilities.",
    icon: "📈",
    seoTitle: "SEO Tools - AI Text Humanizer & Text Scanners | ToolWala AI",
    seoDescription: "Improve search rankings by humanizing AI structures and scanning document texts.",
    keywords: ["seo tools", "ai humanizer", "blog optimization", "extract tags"],
    faqs: [
      {
        question: "Can I rewrite AI copy for SEO optimization?",
        answer: "Yes, the AI Text Humanizer parses sentence flows to increase readability score and avoid generic phrasing patterns."
      }
    ]
  },
  {
    id: "developer-tools",
    slug: "developer-tools",
    title: "Developer Tools",
    description: "QR Code generators, script utilities, and helper tools.",
    intro: "Create vector QR codes and parse screenshots directly on client-side threads.",
    icon: "💻",
    seoTitle: "Developer Tools - QR Code Generator & local OCR | ToolWala AI",
    seoDescription: "Create static vector QR codes and translate images to editable code structures.",
    keywords: ["qr generator", "ocr parser", "developer utilities"],
    faqs: [
      {
        question: "Do generated QR codes have expiration caps?",
        answer: "No. The static vector files generated do not expire and will remain permanently active."
      }
    ]
  },
  {
    id: "social-media-tools",
    slug: "social-media-tools",
    title: "Social Media Tools",
    description: "Platform caption makers, AI voices, and background remover clips.",
    intro: "Create engaging social caption drafts and voice files for reels/shorts creators.",
    icon: "📱",
    seoTitle: "Social Media Tools - AI Voice Reader & Captions | ToolWala AI",
    seoDescription: "Design premium reel/shorts voice narrations and platform-optimized caption lines.",
    keywords: ["social media tools", "shorts voice generator", "instagram caption generator"],
    faqs: [
      {
        question: "Can I use generated AI voices in videos?",
        answer: "Yes, files generated are exported as high-fidelity audio streams suitable for video narration and editing."
      }
    ]
  },
  {
    id: "calculator-tools",
    slug: "calculator-tools",
    title: "Calculator Tools",
    description: "SIP, EMI, GST, Age, YouTube Money, and AdSense revenue calculators.",
    intro: "Fast, accurate, and secure client-side calculators for all your daily needs.",
    icon: "🧮",
    seoTitle: "Online Calculators - Age, SIP, EMI & More | ToolWala AI",
    seoDescription: "Free online calculators for age, finance, and various other metrics. Fast and fully private client-side processing.",
    keywords: ["calculators", "age calculator", "sip calculator", "emi calculator", "online calculator", "free calculator"],
    faqs: [
      {
        question: "Are these calculators accurate?",
        answer: "Yes, our calculators use precise mathematical functions and run entirely in your browser for instant and accurate results."
      }
    ]
  }
];

export function getToolsByCategory(categoryId: string, allTools: Tool[]): Tool[] {
  switch (categoryId) {
    case 'pdf-tools':
      return allTools.filter(t => 
        ['merge-pdf', 'split-pdf', 'jpg-to-pdf', 'pdf-to-jpg', 'protect-pdf', 'unlock-pdf', 'watermark-pdf', 'pdf-ocr', 'organize-pdf', 'edit-pdf', 'pdf-tools', 'pdf-to-word-converter'].includes(t.id)
      );
    case 'image-tools':
      return allTools.filter(t => 
        ['bg-remover', 'passport-photo-maker', 'aadhaar-photo-resizer', 'image-compressor', 'color-palette-generator'].includes(t.id)
      );
    case 'ai-tools':
      return allTools.filter(t => 
        ['ai-logo-maker', 'resume-builder', 'caption-generator', 'text-humanizer', 'voice-generator', 'cover-letter-generator'].includes(t.id)
      );
    case 'document-tools':
      return allTools.filter(t => 
        ['invoice-generator', 'resume-builder', 'cover-letter-generator'].includes(t.id)
      );
    case 'utility-tools':
      return allTools.filter(t => 
        ['ocr-to-text'].includes(t.id)
      );
    case 'resume-career':
      return allTools.filter(t => 
        ['resume-builder', 'cover-letter-generator'].includes(t.id)
      );
    case 'seo-tools':
      return allTools.filter(t => 
        ['text-humanizer', 'ocr-to-text', 'caption-generator'].includes(t.id)
      );
    case 'developer-tools':
      return allTools.filter(t => 
        ['qr-code-generator', 'ocr-to-text'].includes(t.id)
      );
    case 'social-media-tools':
      return allTools.filter(t => 
        ['caption-generator', 'voice-generator', 'bg-remover', 'youtube-money-calculator'].includes(t.id)
      );
    case 'calculator-tools':
      return allTools.filter(t => 
        ['age-calculator', 'sip-calculator', 'emi-calculator', 'gst-calculator', 'youtube-money-calculator', 'adsense-revenue-calculator'].includes(t.id)
      );
    default:
      return [];
  }
}
