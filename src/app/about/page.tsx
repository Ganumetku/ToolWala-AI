import SectionTitle from '@/components/SectionTitle';
import Link from 'next/link';
import { Sparkles, ShieldCheck, Zap, Heart, ChevronRight } from 'lucide-react';
import { MeshGradient } from '@/components/BackgroundEffects';

export const metadata = {
  title: "About Our Mission | ToolGPT AI",
  description: "Learn more about ToolGPT AI and our mission to build powerful AI utility tools.",
};

export default function AboutPage() {
  return (
    <div className="bg-[#030712] min-h-screen py-24 relative overflow-hidden">
      <MeshGradient />
      
      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div>
            <SectionTitle 
              title="About ToolGPT AI" 
              subtitle="Democratizing artificial intelligence through simple, powerful, and secure browser utilities."
            />
            
            <div className="space-y-10">
              <div className="glass p-8 rounded-[2.5rem] border border-white/5 relative group">
                <div className="flex items-center gap-6 mb-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-black text-white tracking-tight uppercase">The Vision</h3>
                </div>
                <p className="text-gray-400 font-medium leading-relaxed">
                  ToolGPT AI was born from a frustration with clunky software and expensive subscriptions for simple daily tasks. We envisioned a world where premium AI tools are accessible instantly, without barriers.
                </p>
              </div>

              <div className="glass p-8 rounded-[2.5rem] border border-white/5 relative group">
                <div className="flex items-center gap-6 mb-4">
                  <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                    <ShieldCheck className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-black text-white tracking-tight uppercase">Privacy Guarantee</h3>
                </div>
                <p className="text-gray-400 font-medium leading-relaxed">
                  We process as much as possible directly in your browser. Your data is your own. We never train our models on your files, and we never store your personal content on our servers.
                </p>
              </div>

              <div className="glass p-8 rounded-[2.5rem] border border-white/5 relative group">
                <div className="flex items-center gap-6 mb-4">
                  <div className="w-12 h-12 bg-amber-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-black text-white tracking-tight uppercase">Built for Speed</h3>
                </div>
                <p className="text-gray-400 font-medium leading-relaxed">
                  Our platform is optimized for performance. By leveraging WebAssembly and Edge AI, we deliver results in milliseconds, not minutes.
                </p>
              </div>
            </div>
            
            <div className="mt-16">
              <Link
                href="/tools"
                className="inline-flex items-center gap-3 bg-blue-600 text-white px-10 py-5 rounded-[2rem] font-black uppercase tracking-widest text-sm hover:bg-blue-500 transition-all shadow-2xl shadow-blue-500/20 active:scale-95"
              >
                Explore our tools <ChevronRight className="w-5 h-5" />
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-10 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="relative glass rounded-[4rem] p-12 border border-white/10 aspect-square flex flex-col items-center justify-center text-center">
               <div className="w-32 h-32 bg-white/5 rounded-[2.5rem] flex items-center justify-center mb-8 border border-white/5">
                 <Heart className="w-16 h-16 text-blue-500 animate-pulse fill-blue-500/10" />
               </div>
               <h3 className="text-4xl font-black text-white tracking-tighter uppercase mb-4">50,000+</h3>
               <p className="text-gray-500 font-black uppercase tracking-[0.4em] text-xs">Users Empowered Monthly</p>
               
               <div className="mt-12 flex -space-x-4">
                 {[...Array(5)].map((_, i) => (
                   <div key={i} className="w-12 h-12 rounded-full border-4 border-[#030712] bg-gray-800 flex items-center justify-center text-[10px] font-black">
                     U{i+1}
                   </div>
                 ))}
                 <div className="w-12 h-12 rounded-full border-4 border-[#030712] bg-blue-600 flex items-center justify-center text-[10px] font-black">
                   +50k
                 </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
