export type ToolCategory = 
  | "All"
  | "Creative & Design"
  | "Document & PDF"
  | "AI Writing"
  | "Career Studio"
  | "Business Ops"
  | "Developer Utilities";

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
    category: "Creative & Design",
    isPopular: true,
    tags: ["photo", "passport", "background removal", "image", "visa", "id"]
  },
  {
    id: "color-palette-generator",
    title: "AI Color Palette Generator",
    description: "Generate color schemes, extract palettes from custom photos, lock tones, and export style templates.",
    icon: "🎨",
    href: "/tools/color-palette-generator",
    category: "Creative & Design",
    isPopular: true,
    tags: ["color", "palette", "generator", "extract", "harmony", "design", "css", "theme"]
  },
  {
    id: "image-compressor",
    title: "Image Compressor",
    description: "Compress images up to 90% without losing visible quality. Fast and secure.",
    icon: "📉",
    href: "/tools/image-compressor",
    category: "Creative & Design",
    isPopular: true,
    tags: ["compress", "image", "size", "reduce", "optimize", "jpg", "png", "webp"]
  },
  {
    id: "qr-code-generator",
    title: "QR Code Generator",
    description: "Create custom QR codes for URLs, text, WiFi, and more with your logo.",
    icon: "📱",
    href: "/tools/qr-code-generator",
    category: "Developer Utilities",
    isPopular: false,
    tags: ["qr", "code", "generator", "scan", "link", "wifi", "barcode"]
  },
  {
    id: "pdf-tools",
    title: "PDF Tools",
    description: "Merge, split, compress, and convert PDF files easily and securely.",
    icon: "📄",
    href: "/tools/pdf-tools",
    category: "Document & PDF",
    isPopular: false,
    tags: ["pdf", "merge", "split", "compress", "convert", "document"]
  },
  {
    id: "edit-pdf",
    title: "Edit PDF",
    description: "Add text to PDF, fill PDF forms, and download edited PDF online.",
    icon: "✍️",
    href: "/tools/pdf-tools/edit-pdf",
    category: "Document & PDF",
    isPopular: true,
    tags: ["pdf", "edit", "write", "annotate", "text", "form", "document"]
  },
  {
    id: "ai-logo-maker",
    title: "AI Logo Maker",
    description: "Generate unique logos for your brand or business using advanced AI.",
    icon: "🎨",
    href: "/tools/ai-logo-maker",
    category: "Creative & Design",
    isPopular: false,
    tags: ["logo", "design", "brand", "ai", "business", "icon"]
  },
  {
    id: "resume-builder",
    title: "AI Resume Builder",
    description: "Create an ATS-friendly, professional resume in minutes with AI assistance.",
    icon: "📝",
    href: "/tools/resume-builder",
    category: "Career Studio",
    isPopular: true,
    tags: ["resume", "cv", "career", "job", "ats", "builder"]
  },
  {
    id: "caption-generator",
    title: "AI Caption Generator",
    description: "Create engaging, platform-optimized captions with AI. Perfect for Instagram, LinkedIn, and more.",
    icon: "✍️",
    href: "/tools/caption-generator",
    category: "AI Writing",
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
    category: "Developer Utilities",
    isPopular: true,
    tags: ["voice", "audio", "speech", "tts", "text to speech", "ai"]
  },
  {
    id: "invoice-generator",
    title: "Invoice Generator",
    description: "Create professional invoices in seconds. Download as PDF or send directly to clients.",
    icon: "🧾",
    href: "/tools/invoice-generator",
    category: "Business Ops",
    isPopular: false,
    tags: ["invoice", "billing", "receipt", "business", "pdf", "payment"]
  },
  {
    id: "background-remover",
    title: "AI Background Remover",
    description: "Remove image backgrounds automatically in seconds with high precision.",
    icon: "🖼️",
    href: "/tools/bg-remover",
    category: "Creative & Design",
    isPopular: true,
    tags: ["background", "remove", "transparent", "png", "image", "cutout"]
  },
  {
    id: "cover-letter-generator",
    title: "AI Cover Letter Generator",
    description: "Generate tailored, professional cover letters optimized for any job application.",
    icon: "✉️",
    href: "/tools/cover-letter-generator",
    category: "Career Studio",
    isPopular: true,
    tags: ["cover letter", "career", "job", "application", "writing", "ai"]
  },
  {
    id: "ocr-to-text",
    title: "OCR Image to Text",
    description: "Extract text from images, screenshots, and scanned documents instantly using client-side OCR.",
    icon: "🔍",
    href: "/tools/ocr-to-text",
    category: "Document & PDF",
    isPopular: true,
    tags: ["ocr", "image to text", "extractor", "scan", "screenshot", "read text"]
  }
];

export const toolCategories: ToolCategory[] = [
  "All",
  "Creative & Design",
  "Document & PDF",
  "AI Writing",
  "Career Studio",
  "Business Ops",
  "Developer Utilities"
];
