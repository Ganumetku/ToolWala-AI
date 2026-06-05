export type ToolCategory = 
  | "All"
  | "PDF Tools"
  | "Image Tools"
  | "AI Tools"
  | "Document Tools"
  | "Utility Tools"
  | "Resume & Career"
  | "SEO Tools"
  | "Developer Tools"
  | "Social Media Tools";

export interface Tool {
  id: string;
  title: string;
  description: string;
  icon: string;
  href: string;
  slug: string;
  category: ToolCategory;
  featured: boolean;
  trending: boolean;
  popular: boolean;
  tags: string[];
}

export const toolsData: Tool[] = [
  {
    id: "passport-photo-maker",
    title: "Passport Photo Maker",
    description: "Create perfectly sized passport photos for any country with AI background removal.",
    icon: "📸",
    href: "/tools/passport-photo-maker",
    slug: "passport-photo-maker",
    category: "Image Tools",
    featured: true,
    trending: true,
    popular: true,
    tags: ["photo", "passport", "background removal", "image", "visa", "id"]
  },
  {
    id: "color-palette-generator",
    title: "AI Color Palette Generator",
    description: "Generate color schemes, extract palettes from custom photos, lock tones, and export style templates.",
    icon: "🎨",
    href: "/tools/color-palette-generator",
    slug: "color-palette-generator",
    category: "Image Tools",
    featured: false,
    trending: false,
    popular: true,
    tags: ["color", "palette", "generator", "extract", "harmony", "design", "css", "theme"]
  },
  {
    id: "image-compressor",
    title: "Image Compressor",
    description: "Compress images up to 90% without losing visible quality. Fast and secure.",
    icon: "📉",
    href: "/tools/image-compressor",
    slug: "image-compressor",
    category: "Image Tools",
    featured: true,
    trending: true,
    popular: true,
    tags: ["compress", "image", "size", "reduce", "optimize", "jpg", "png", "webp"]
  },
  {
    id: "qr-code-generator",
    title: "QR Code Generator",
    description: "Create custom QR codes for URLs, text, WiFi, and more with your logo.",
    icon: "📱",
    href: "/tools/qr-code-generator",
    slug: "qr-code-generator",
    category: "Developer Tools",
    featured: false,
    trending: false,
    popular: false,
    tags: ["qr", "code", "generator", "scan", "link", "wifi", "barcode"]
  },
  {
    id: "pdf-tools",
    title: "PDF Tools",
    description: "Merge, split, compress, and convert PDF files easily and securely.",
    icon: "📄",
    href: "/tools/pdf-tools",
    slug: "pdf-tools",
    category: "PDF Tools",
    featured: false,
    trending: false,
    popular: false,
    tags: ["pdf", "merge", "split", "compress", "convert", "document"]
  },
  {
    id: "edit-pdf",
    title: "Edit PDF",
    description: "Add text to PDF, fill PDF forms, and download edited PDF online.",
    icon: "✍️",
    href: "/tools/pdf-tools/edit-pdf",
    slug: "edit-pdf",
    category: "PDF Tools",
    featured: false,
    trending: true,
    popular: true,
    tags: ["pdf", "edit", "write", "annotate", "text", "form", "document"]
  },
  {
    id: "merge-pdf",
    title: "Merge PDF",
    description: "Combine multiple PDF documents into a single professional-grade file quickly and securely.",
    icon: "🔀",
    href: "/tools/merge-pdf",
    slug: "merge-pdf",
    category: "PDF Tools",
    featured: true,
    trending: true,
    popular: true,
    tags: ["pdf", "merge", "combine", "join", "document"]
  },
  {
    id: "split-pdf",
    title: "Split PDF",
    description: "Extract specific pages or split your PDF documents into multiple files instantly.",
    icon: "✂️",
    href: "/tools/split-pdf",
    slug: "split-pdf",
    category: "PDF Tools",
    featured: false,
    trending: true,
    popular: true,
    tags: ["pdf", "split", "extract", "divide", "document"]
  },
  {
    id: "jpg-to-pdf",
    title: "JPG to PDF",
    description: "Convert JPG, JPEG, and PNG images into a single PDF document quickly and securely.",
    icon: "🖼️",
    href: "/tools/jpg-to-pdf",
    slug: "jpg-to-pdf",
    category: "PDF Tools",
    featured: false,
    trending: false,
    popular: true,
    tags: ["jpg", "pdf", "png", "convert", "image to pdf", "document"]
  },
  {
    id: "pdf-to-jpg",
    title: "PDF to JPG",
    description: "Convert PDF documents into high-quality JPG images directly in your browser. Fast, secure, and free.",
    icon: "🖼️",
    href: "/tools/pdf-to-jpg",
    slug: "pdf-to-jpg",
    category: "PDF Tools",
    featured: false,
    trending: false,
    popular: true,
    tags: ["pdf", "jpg", "convert", "pdf to image", "jpeg", "extract", "document"]
  },
  {
    id: "protect-pdf",
    title: "Protect PDF",
    description: "Password-protect your PDF files with secure client-side encryption. Keep your documents private.",
    icon: "🔒",
    href: "/tools/protect-pdf",
    slug: "protect-pdf",
    category: "PDF Tools",
    featured: false,
    trending: true,
    popular: false,
    tags: ["pdf", "protect", "encrypt", "password", "lock", "security", "document"]
  },
  {
    id: "unlock-pdf",
    title: "Unlock PDF",
    description: "Remove passwords and security restrictions from your PDF files instantly. 100% private.",
    icon: "🔓",
    href: "/tools/unlock-pdf",
    slug: "unlock-pdf",
    category: "PDF Tools",
    featured: false,
    trending: true,
    popular: false,
    tags: ["pdf", "unlock", "decrypt", "remove password", "security", "document"]
  },
  {
    id: "watermark-pdf",
    title: "Add Watermark to PDF",
    description: "Add text or image watermarks to your PDF files. Customize opacity, rotation, size, and positions.",
    icon: "🎨",
    href: "/tools/watermark-pdf",
    slug: "watermark-pdf",
    category: "PDF Tools",
    featured: false,
    trending: true,
    popular: false,
    tags: ["pdf", "watermark", "edit", "overlay", "stamp", "protect", "document"]
  },
  {
    id: "organize-pdf",
    title: "Organize PDF Pages",
    description: "Reorder, rotate, duplicate, or delete pages in your PDF documents visually and securely.",
    icon: "🧩",
    href: "/tools/organize-pdf",
    slug: "organize-pdf",
    category: "PDF Tools",
    featured: false,
    trending: true,
    popular: false,
    tags: ["pdf", "organize", "reorder", "delete page", "rotate pdf", "duplicate page", "document"]
  },
  {
    id: "pdf-ocr",
    title: "PDF OCR Scanner",
    description: "Extract text from scanned PDF files and images locally in your browser using secure OCR.",
    icon: "🔍",
    href: "/tools/pdf-ocr",
    slug: "pdf-ocr",
    category: "PDF Tools",
    featured: true,
    trending: true,
    popular: true,
    tags: ["pdf", "ocr", "scanner", "extract text", "scanned pdf", "image to text", "document"]
  },
  {
    id: "aadhaar-photo-resizer",
    title: "Aadhaar Photo Resizer",
    description: "Resize, crop, and compress passport photos for Aadhaar, UIDAI, and official government updates.",
    icon: "🪪",
    href: "/tools/aadhaar-photo-resizer",
    slug: "aadhaar-photo-resizer",
    category: "Image Tools",
    featured: true,
    trending: true,
    popular: true,
    tags: ["aadhaar", "photo", "resizer", "crop", "compress", "passport photo", "uidai", "kyc", "image"]
  },
  {
    id: "ai-logo-maker",
    title: "AI Logo Maker",
    description: "Generate unique logos for your brand or business using advanced AI.",
    icon: "🎨",
    href: "/tools/ai-logo-maker",
    slug: "ai-logo-maker",
    category: "AI Tools",
    featured: true,
    trending: true,
    popular: true,
    tags: ["logo", "design", "brand", "ai", "business", "icon"]
  },
  {
    id: "resume-builder",
    title: "AI Resume Builder",
    description: "Create an ATS-friendly, professional resume in minutes with AI assistance.",
    icon: "📝",
    href: "/tools/resume-builder",
    slug: "resume-builder",
    category: "Resume & Career",
    featured: true,
    trending: true,
    popular: true,
    tags: ["resume", "cv", "career", "job", "ats", "builder"]
  },
  {
    id: "caption-generator",
    title: "AI Caption Generator",
    description: "Create engaging, platform-optimized captions with AI. Perfect for Instagram, LinkedIn, and more.",
    icon: "✍️",
    href: "/tools/caption-generator",
    slug: "caption-generator",
    category: "Social Media Tools",
    featured: false,
    trending: false,
    popular: true,
    tags: ["caption", "social media", "instagram", "linkedin", "ai", "writing", "post"]
  },
  {
    id: "text-humanizer",
    title: "AI Text Humanizer",
    description: "Make AI text sound more natural, clear, and human-friendly in seconds.",
    icon: "👤",
    href: "/tools/text-humanizer",
    slug: "text-humanizer",
    category: "AI Tools",
    featured: true,
    trending: true,
    popular: true,
    tags: ["text", "humanize", "ai", "writing", "natural", "rewrite"]
  },
  {
    id: "voice-generator",
    title: "AI Voice Generator",
    description: "Transform text into lifelike speech with premium AI voices.",
    icon: "🎙️",
    href: "/tools/voice-generator",
    slug: "voice-generator",
    category: "AI Tools",
    featured: false,
    trending: true,
    popular: true,
    tags: ["voice", "audio", "speech", "tts", "text to speech", "ai"]
  },
  {
    id: "invoice-generator",
    title: "Invoice Generator",
    description: "Create professional invoices in seconds. Download as PDF or send directly to clients.",
    icon: "🧾",
    href: "/tools/invoice-generator",
    slug: "invoice-generator",
    category: "Document Tools",
    featured: false,
    trending: false,
    popular: false,
    tags: ["invoice", "billing", "receipt", "business", "pdf", "payment"]
  },
  {
    id: "background-remover",
    title: "AI Background Remover",
    description: "Remove image backgrounds automatically in seconds with high precision.",
    icon: "🖼️",
    href: "/tools/bg-remover",
    slug: "bg-remover",
    category: "Image Tools",
    featured: true,
    trending: true,
    popular: true,
    tags: ["background", "remove", "transparent", "png", "image", "cutout"]
  },
  {
    id: "cover-letter-generator",
    title: "AI Cover Letter Generator",
    description: "Generate tailored, professional cover letters optimized for any job application.",
    icon: "✉️",
    href: "/tools/cover-letter-generator",
    slug: "cover-letter-generator",
    category: "Resume & Career",
    featured: false,
    trending: true,
    popular: true,
    tags: ["cover letter", "career", "job", "application", "writing", "ai"]
  },
  {
    id: "ocr-to-text",
    title: "OCR Image to Text",
    description: "Extract text from images, screenshots, and scanned documents instantly using client-side OCR.",
    icon: "🔍",
    href: "/tools/ocr-to-text",
    slug: "ocr-to-text",
    category: "Utility Tools",
    featured: false,
    trending: false,
    popular: true,
    tags: ["ocr", "image to text", "extractor", "scan", "screenshot", "read text"]
  }
];

export const toolCategories: ToolCategory[] = [
  "All",
  "PDF Tools",
  "Image Tools",
  "AI Tools",
  "Document Tools",
  "Utility Tools",
  "Resume & Career",
  "SEO Tools",
  "Developer Tools",
  "Social Media Tools"
];
