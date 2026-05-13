import ToolCard from '@/components/ToolCard';
import SectionTitle from '@/components/SectionTitle';

const allTools = [
  {
    title: "Passport Photo Maker",
    description: "Create perfectly sized passport photos for any country with AI background removal.",
    icon: "📸",
    href: "/tools/passport-photo-maker",
    isPopular: true
  },
  {
    title: "Image Compressor",
    description: "Compress images up to 90% without losing visible quality. Fast and secure.",
    icon: "📉",
    href: "/tools/image-compressor",
    isPopular: true
  },
  {
    title: "QR Code Generator",
    description: "Create custom QR codes for URLs, text, WiFi, and more with your logo.",
    icon: "📱",
    href: "/tools/qr-code-generator",
    isPopular: false
  },
  {
    title: "PDF Tools",
    description: "Merge, split, compress, and convert PDF files easily and securely.",
    icon: "📄",
    href: "/tools/pdf-tools",
    isPopular: false
  },
  {
    title: "AI Logo Maker",
    description: "Generate unique logos for your brand or business using advanced AI.",
    icon: "🎨",
    href: "/tools/ai-logo-maker",
    isPopular: false
  },
  {
    title: "AI Resume Builder",
    description: "Create an ATS-friendly, professional resume in minutes with AI assistance.",
    icon: "📝",
    href: "/tools/resume-builder",
    isPopular: true
  },
  {
    title: "AI Caption Generator",
    description: "Create engaging, platform-optimized captions with AI. Perfect for Instagram, LinkedIn, and more.",
    icon: "✍️",
    href: "/tools/caption-generator",
    isPopular: true
  },
  {
    title: "AI Text Humanizer",
    description: "Make AI text sound more natural, clear, and human-friendly in seconds.",
    icon: "👤",
    href: "/tools/text-humanizer",
    isPopular: true
  },
  {
    title: "AI Voice Generator",
    description: "Transform text into lifelike speech with premium AI voices.",
    icon: "🎙️",
    href: "/tools/voice-generator",
    isPopular: true
  },
  {
    title: "Invoice Generator",
    description: "Create professional invoices in seconds. Download as PDF or send directly to clients.",
    icon: "🧾",
    href: "/tools/invoice-generator",
    isPopular: false
  }
];

export const metadata = {
  title: "All Tools | ToolWala AI",
  description: "Browse all our powerful, AI-driven utility tools designed to make your life easier.",
};

export default function ToolsPage() {
  return (
    <div className="bg-gray-50 min-h-screen py-16 sm:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <SectionTitle 
          title="All Tools" 
          subtitle="Explore our full collection of powerful utility tools. Everything you need to get the job done, all in one place."
        />
        
        <div className="mt-12 grid max-w-2xl grid-cols-1 gap-6 sm:gap-8 lg:max-w-none lg:grid-cols-3 xl:grid-cols-4">
          {allTools.map((tool) => (
            <ToolCard key={tool.href} {...tool} />
          ))}
        </div>
      </div>
    </div>
  );
}
