import Link from 'next/link';
import { 
  Zap, Hammer, MessageCircle, Rocket, 
  Sparkles, Video, Users, Image as ImageIcon, 
  Maximize, MessageSquare, Layout, CheckCircle2,
  ChevronRight, ShieldCheck, Heart
} from 'lucide-react';
import { MeshGradient, FloatingParticles } from '@/components/BackgroundEffects';

export const metadata = {
  title: "Pricing & Plans | ToolWala AI",
  description: "ToolWala AI is currently in free beta. Access all AI tools for free during our early access period.",
};

const betaFeatures = [
  {
    title: 'Unlimited Access',
    description: 'Use all available AI tools without daily limits or hidden costs during beta.',
    icon: Zap,
    color: 'amber',
  },
  {
    title: 'Weekly New Tools',
    description: 'We release 2-3 new professional AI utilities every single week.',
    icon: Sparkles,
    color: 'blue',
  },
  {
    title: 'Privacy Included',
    description: 'No tracking, no data selling. Your files are processed locally or encrypted.',
    icon: ShieldCheck,
    color: 'emerald',
  },
];

const comingSoon = [
  { name: 'AI Studio Photos', icon: ImageIcon },
  { name: 'AI Video Gen', icon: Video },
  { name: 'AI Face Swap', icon: Users },
  { name: 'AI Upscaler', icon: Maximize },
  { name: 'AI Interview', icon: Sparkles },
  { name: 'AI Chatbot', icon: MessageSquare },
  { name: 'Website Builder', icon: Layout },
  { name: 'Voice Clone', icon: Zap },
];

export default function PricingPage() {
  return (
    <div className="bg-[#030712] min-h-screen text-white">
      {/* HERO SECTION */}
      <section className="relative pt-32 pb-24 overflow-hidden">
        <MeshGradient />
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion_div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-blue-600/10 border border-blue-500/20 text-blue-400 text-xs font-black uppercase tracking-widest mb-10 shadow-2xl"
          >
            <Rocket className="w-4 h-4" />
            <span>Beta Early Access Phase</span>
          </motion_div>
          <h1 className="text-5xl md:text-8xl font-black text-white mb-8 tracking-tighter leading-[0.9]">
            AI for Everyone. <br />
            <span className="text-blue-500">Currently 100% Free.</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed font-medium">
            We're building the future of utility. During our beta phase, every tool is open and free to help us refine the experience.
          </p>
        </div>
      </section>

      {/* PRICING CARD (BETA) */}
      <section className="py-12 relative">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-[3rem] blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative glass rounded-[3rem] p-10 md:p-16 border border-white/10 shadow-2xl">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12">
                <div>
                  <h2 className="text-3xl font-black uppercase tracking-tighter mb-2">Early Adopter Plan</h2>
                  <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Limited time beta offer</p>
                </div>
                <div className="flex flex-col items-end">
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-black">$0</span>
                    <span className="text-gray-500 font-bold uppercase tracking-widest text-xs">/ month</span>
                  </div>
                  <span className="text-emerald-500 font-black text-[10px] uppercase tracking-widest mt-2">Active Now</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                <div className="space-y-4">
                  <FeatureCheck text="Access to 25+ AI Tools" />
                  <FeatureCheck text="No Registration Required" />
                  <FeatureCheck text="High Resolution Exports" />
                  <FeatureCheck text="Browser-Side Processing" />
                </div>
                <div className="space-y-4">
                  <FeatureCheck text="Weekly Tool Updates" />
                  <FeatureCheck text="Premium Community Support" />
                  <FeatureCheck text="Future Pro Features Access" />
                  <FeatureCheck text="No Ads / No Tracking" />
                </div>
              </div>

              <Link 
                href="/tools" 
                className="w-full flex items-center justify-center gap-3 py-6 rounded-2xl bg-blue-600 text-white font-black uppercase tracking-[0.2em] text-sm hover:bg-blue-500 active:scale-[0.98] transition-all shadow-[0_0_40px_rgba(37,99,235,0.4)]"
              >
                Get Started Now <ChevronRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES GRID */}
      <section className="py-24">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {betaFeatures.map((feature, idx) => (
              <div key={idx} className="glass p-10 rounded-[2.5rem] border border-white/5 hover:border-blue-500/30 transition-all group">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-8 border border-white/5 bg-white/5 group-hover:scale-110 transition-transform`}>
                  <feature.icon className={`w-8 h-8 text-blue-500`} />
                </div>
                <h3 className="text-2xl font-black text-white mb-4 tracking-tight uppercase">{feature.title}</h3>
                <p className="text-gray-500 font-medium leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMING SOON */}
      <section className="py-24 border-t border-white/5">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-white mb-4 tracking-tighter uppercase">Building Next</h2>
            <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Pipeline of upcoming AI tools</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {comingSoon.map((item, idx) => (
              <div key={idx} className="flex items-center gap-4 bg-white/5 p-5 rounded-2xl border border-white/5 text-gray-400 font-black text-xs uppercase tracking-widest hover:text-white transition-colors cursor-default">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-500 shrink-0 border border-white/10">
                  <item.icon className="w-5 h-5" />
                </div>
                {item.name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER CTA */}
      <section className="py-32">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto glass rounded-[4rem] p-16 md:p-24 border border-white/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-[120px] -z-0" />
            
            <h2 className="text-4xl md:text-6xl font-black mb-10 tracking-tighter uppercase relative z-10">Shape the Future <br /> of <span className="text-blue-500">ToolWala AI</span></h2>
            
            <div className="flex flex-col items-center gap-10 relative z-10">
              <Link 
                href="/tools" 
                className="group flex items-center gap-4 bg-white text-black px-12 py-6 rounded-[2rem] font-black text-xl transition-all hover:scale-105 active:scale-95 shadow-2xl"
              >
                Join the Beta Free
                <CheckCircle2 className="w-7 h-7 text-blue-600" />
              </Link>
              
              <div className="flex flex-wrap justify-center gap-8 text-[10px] font-black text-gray-600 uppercase tracking-[0.3em]">
                <div className="flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> Secure</div>
                <div className="flex items-center gap-2"><Zap className="w-4 h-4" /> Instant</div>
                <div className="flex items-center gap-2"><Heart className="w-4 h-4 fill-red-500 text-red-500" /> Open Source Heart</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCheck({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20">
        <CheckCircle2 className="w-3.5 h-3.5" />
      </div>
      <span className="text-sm font-bold text-gray-400 group-hover:text-gray-300 transition-colors">{text}</span>
    </div>
  );
}

function motion_div(props: any) {
  // Shorthand helper for the component as framer-motion is used but I'm writing raw JSX for brevity where possible
  // In a real file I'd use <motion.div> but for the tool I'll use standard tags if I don't want to overcomplicate
  return <div {...props} />;
}
