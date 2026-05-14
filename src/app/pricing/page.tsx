import Link from 'next/link';
import { 
  Zap, Hammer, MessageCircle, Rocket, 
  Sparkles, Video, Users, Image as ImageIcon, 
  Maximize, MessageSquare, Layout, CheckCircle2 
} from 'lucide-react';

export const metadata = {
  title: "Pricing | ToolWala AI",
  description: "ToolWala AI is currently in free beta. Access all AI tools for free during our early access period.",
};

const betaFeatures = [
  {
    title: 'Unlimited access',
    description: 'Use all available AI tools without restrictions or hidden costs.',
    icon: Zap,
    iconColor: 'text-amber-500',
    iconBg: 'bg-amber-50',
  },
  {
    title: 'New tools every week',
    description: 'Passport maker, Resume ATS, Voice Generator, Caption AI and more.',
    icon: Hammer,
    iconColor: 'text-blue-500',
    iconBg: 'bg-blue-50',
  },
  {
    title: 'Help shape ToolWala AI',
    description: 'Your feedback directly helps us build better tools and features.',
    icon: MessageCircle,
    iconColor: 'text-emerald-500',
    iconBg: 'bg-emerald-50',
  },
];

const comingSoon = [
  { name: 'AI Studio Photos', icon: ImageIcon },
  { name: 'AI Video Tools', icon: Video },
  { name: 'AI Face Swap', icon: Users },
  { name: 'AI Image Upscaler', icon: Maximize },
  { name: 'AI Mock Interview', icon: Sparkles },
  { name: 'AI PDF Chat', icon: MessageSquare },
  { name: 'AI Website Builder', icon: Layout },
];

export default function PricingPage() {
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* HERO SECTION */}
      <section className="relative pt-20 pb-16 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gradient-to-b from-blue-50/50 to-transparent -z-10" />
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-bold mb-8 animate-fade-in">
            <Rocket className="w-4 h-4" />
            <span>BETA EARLY ACCESS</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-gray-900 mb-6 tracking-tight">
            🚀 ToolWala AI is currently <span className="text-blue-600">FREE</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            We're in early access beta. Use all AI tools free while we improve and add more powerful features.
          </p>
        </div>
      </section>

      {/* FEATURES GRID */}
      <section className="py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {betaFeatures.map((feature, idx) => (
              <div key={idx} className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className={`w-14 h-14 ${feature.iconBg} ${feature.iconColor} rounded-2xl flex items-center justify-center mb-6`}>
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMING SOON SECTION */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-gray-900 mb-4">Coming Soon</h2>
            <div className="w-20 h-1.5 bg-blue-600 mx-auto rounded-full" />
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {comingSoon.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm text-gray-700 font-bold text-sm">
                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 shrink-0">
                  <item.icon className="w-4 h-4" />
                </div>
                {item.name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BOTTOM CTA */}
      <section className="py-20 pb-32">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto bg-gray-900 rounded-[3rem] p-12 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl -z-0" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl -z-0" />
            
            <h2 className="text-3xl md:text-4xl font-black mb-8 relative z-10">Join ToolWala AI Early Users</h2>
            
            <div className="flex flex-col items-center gap-6 relative z-10">
              <Link 
                href="/tools" 
                className="group flex items-center gap-3 bg-blue-600 hover:bg-blue-500 text-white px-10 py-5 rounded-2xl font-black text-lg transition-all hover:scale-105 active:scale-95 shadow-xl shadow-blue-900/20"
              >
                Start Using Free
                <CheckCircle2 className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm font-bold text-gray-400 uppercase tracking-widest">
                <span>No signup</span>
                <span className="text-gray-700">•</span>
                <span>No credit card</span>
                <span className="text-gray-700">•</span>
                <span>Free beta access</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
