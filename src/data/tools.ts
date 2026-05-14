export type ToolCategory = 
  | "All"
  | "Image"
  | "PDF"
  | "AI Writing"
  | "Career"
  | "Social Media"
  | "Business"
  | "Utility";

export interface Tool {
  id: string;
  title: string;
  description: string;
  icon: string;
  href: string;
  category: ToolCategory;
  isPopular: boolean;
  tags: string[];
}

export const toolsData: Tool[] = [
  {
    id: "passport-photo-maker",
    title: "Passport Photo Maker",
    description: "Create perfectly sized passport photos for any country with AI background removal.",
    icon: "📸",
    href: "/tools/passport-photo-maker",
    category: "Image",
    isPopular: true,
    tags: ["photo", "passport", "background removal", "image", "visa", "id"]
  },
  {
    id: "image-compressor",
    title: "Image Compressor",
    description: "Compress images up to 90% without losing visible quality. Fast and secure.",
    icon: "📉",
    href: "/tools/image-compressor",
    category: "Image",
    isPopular: true,
    tags: ["compress", "image", "size", "reduce", "optimize", "jpg", "png", "webp"]
  },
  {
    id: "qr-code-generator",
    title: "QR Code Generator",
    description: "Create custom QR codes for URLs, text, WiFi, and more with your logo.",
    icon: "📱",
    href: "/tools/qr-code-generator",
    category: "Utility",
    isPopular: false,
    tags: ["qr", "code", "generator", "scan", "link", "wifi", "barcode"]
  },
  {
    id: "pdf-tools",
    title: "PDF Tools",
    description: "Merge, split, compress, and convert PDF files easily and securely.",
    icon: "📄",
    href: "/tools/pdf-tools",
    category: "PDF",
    isPopular: false,
    tags: ["pdf", "merge", "split", "compress", "convert", "document"]
  },
  {
    id: "ai-logo-maker",
    title: "AI Logo Maker",
    description: "Generate unique logos for your brand or business using advanced AI.",
    icon: "🎨",
    href: "/tools/ai-logo-maker",
    category: "Business",
    isPopular: false,
    tags: ["logo", "design", "brand", "ai", "business", "icon"]
  },
  {
    id: "resume-builder",
    title: "AI Resume Builder",
    description: "Create an ATS-friendly, professional resume in minutes with AI assistance.",
    icon: "📝",
    href: "/tools/resume-builder",
    category: "Career",
    isPopular: true,
    tags: ["resume", "cv", "career", "job", "ats", "builder"]
  },
  {
    id: "caption-generator",
    title: "AI Caption Generator",
    description: "Create engaging, platform-optimized captions with AI. Perfect for Instagram, LinkedIn, and more.",
    icon: "✍️",
    href: "/tools/caption-generator",
    category: "Social Media",
    isPopular: true,
    tags: ["caption", "social media", "instagram", "linkedin", "ai", "writing", "post"]
  },
  {
    id: "text-humanizer",
    title: "AI Text Humanizer",
    description: "Make AI text sound more natural, clear, and human-friendly in seconds.",
    icon: "👤",
    href: "/tools/text-humanizer",
    category: "AI Writing",
    isPopular: true,
    tags: ["text", "humanize", "ai", "writing", "natural", "rewrite"]
  },
  {
    id: "voice-generator",
    title: "AI Voice Generator",
    description: "Transform text into lifelike speech with premium AI voices.",
    icon: "🎙️",
    href: "/tools/voice-generator",
    category: "Utility",
    isPopular: true,
    tags: ["voice", "audio", "speech", "tts", "text to speech", "ai"]
  },
  {
    id: "invoice-generator",
    title: "Invoice Generator",
    description: "Create professional invoices in seconds. Download as PDF or send directly to clients.",
    icon: "🧾",
    href: "/tools/invoice-generator",
    category: "Business",
    isPopular: false,
    tags: ["invoice", "billing", "receipt", "business", "pdf", "payment"]
  },
  {
    id: "background-remover",
    title: "AI Background Remover",
    description: "Remove image backgrounds automatically in seconds with high precision.",
    icon: "🖼️",
    href: "/tools/background-remover",
    category: "Image",
    isPopular: true,
    tags: ["background", "remove", "transparent", "png", "image", "cutout"]
  },
  {
    id: "cover-letter-generator",
    title: "AI Cover Letter Generator",
    description: "Generate tailored, professional cover letters optimized for any job application.",
    icon: "✉️",
    href: "/tools/cover-letter-generator",
    category: "Career",
    isPopular: true,
    tags: ["cover letter", "career", "job", "application", "writing", "ai"]
  }
];

export const toolCategories: ToolCategory[] = [
  "All",
  "Image",
  "PDF",
  "AI Writing",
  "Career",
  "Social Media",
  "Business",
  "Utility"
];
