import Link from 'next/link';
import ToolCard from '@/components/ToolCard';
import SectionTitle from '@/components/SectionTitle';

const popularTools = [
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

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white pt-24 pb-32 sm:pt-32 sm:pb-40">
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
          <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#eff6ff] to-[#bfdbfe] opacity-50 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="mx-auto max-w-4xl font-display text-5xl font-bold tracking-tight text-slate-900 sm:text-7xl">
            Powerful AI tools for your <span className="relative whitespace-nowrap text-blue-600">everyday tasks</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg tracking-tight text-slate-700">
            Boost your productivity with ToolWala AI. From image processing to PDF manipulation, get everything done in one place, instantly.
          </p>
          
          {/* Search Bar */}
          <div className="mx-auto mt-10 max-w-2xl flex items-center justify-center">
            <div className="relative w-full max-w-xl">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="text"
                className="block w-full rounded-full border-0 py-4 pl-10 pr-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-lg sm:leading-6"
                placeholder="Search for tools (e.g., 'Compress image', 'QR code')"
              />
            </div>
            <button className="ml-4 rounded-full bg-blue-600 px-8 py-4 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-colors">
              Search
            </button>
          </div>
          
          <div className="mt-10 flex justify-center gap-x-6">
            <Link href="/tools" className="text-sm font-semibold leading-6 text-gray-900 hover:text-blue-600 flex items-center transition-colors">
              Browse all tools <span aria-hidden="true" className="ml-1">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Popular Tools Section */}
      <section className="bg-gray-50 py-24 sm:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle 
            title="Popular Tools" 
            subtitle="Explore our most frequently used AI-powered utilities designed to save you time."
            centered
          />
          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-6 sm:gap-8 lg:mt-20 lg:max-w-none lg:grid-cols-4">
            {popularTools.map((tool) => (
              <ToolCard key={tool.href} {...tool} />
            ))}
          </div>
        </div>
      </section>

      {/* Why Use ToolWala AI */}
      <section className="bg-white py-24 sm:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-y-16 lg:grid-cols-2 lg:gap-x-16 lg:items-center">
            <div>
              <SectionTitle 
                title="Why choose ToolWala AI?" 
                subtitle="We combine powerful AI models with intuitive interfaces to provide the best tools for your workflow."
              />
              <dl className="mt-10 max-w-xl space-y-8 text-base leading-7 text-gray-600 lg:max-w-none">
                <div className="relative pl-9">
                  <dt className="inline font-semibold text-gray-900">
                    <svg className="absolute left-1 top-1 h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                    </svg>
                    Lightning Fast.
                  </dt>
                  <dd className="inline ml-1">Processed instantly in your browser or through our optimized servers.</dd>
                </div>
                <div className="relative pl-9">
                  <dt className="inline font-semibold text-gray-900">
                    <svg className="absolute left-1 top-1 h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                    </svg>
                    Secure & Private.
                  </dt>
                  <dd className="inline ml-1">Your files are automatically deleted after processing. We never store your data.</dd>
                </div>
                <div className="relative pl-9">
                  <dt className="inline font-semibold text-gray-900">
                    <svg className="absolute left-1 top-1 h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                    </svg>
                    Always Free to Try.
                  </dt>
                  <dd className="inline ml-1">Generous free tiers for all our tools so you can experience the value first.</dd>
                </div>
              </dl>
            </div>
            <div className="relative lg:col-start-2">
              <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-2xl bg-blue-50">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-indigo-50 opacity-90"></div>
                <div className="relative flex flex-col items-center gap-4 text-blue-600">
                  <svg className="h-32 w-32 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                  <span className="text-2xl font-bold">AI Powered Engine</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
