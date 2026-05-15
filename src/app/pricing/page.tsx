"use client";

import Link from 'next/link';
import { 
  Zap, Hammer, MessageCircle, Rocket, 
  Sparkles, Video, Users, Image as ImageIcon, 
  Maximize, MessageSquare, Layout, CheckCircle2,
  ChevronRight, ShieldCheck, Heart
} from 'lucide-react';
import { motion } from 'framer-motion';
import { MeshGradient, FloatingParticles } from '@/components/BackgroundEffects';

const betaFeatures = [
  { name: 'AI BG Removal', icon: ImageIcon },
  { name: 'Text Humanizer', icon: MessageCircle },
  { name: 'Logo Studio', icon: Hammer },
  { name: 'Voice Lab', icon: Video },
  { name: 'QR Art', icon: Users },
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
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-blue-600/10 border border-blue-500/20 text-blue-400 text-xs font-black uppercase tracking-widest mb-10 shadow-2xl"
          >
            <Rocket className="w-4 h-4" />
            <span>Beta Early Access Phase</span>
          </motion.div>
          <h1 className="text-5xl md:text-8xl font-black text-white mb-8 tracking-tighter leading-[0.9]">
            AI for Everyone. <br />
            <span className="text-blue-500">Currently 100% Free.</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed font-medium">
            We're building the future of utility. During our beta phase, every tool is open and free to help us refine the experience.
          </p>
        </div>
      </section>

      {/* PRICING CARDS */}
      <section className="pb-32 relative z-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            
            {/* Beta Card */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative group"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
              <div className="relative bg-[#080c18] border border-white/10 rounded-3xl p-10 h-full flex flex-col">
                <div className="mb-8">
                  <h3 className="text-2xl font-black text-white mb-2">Beta Explorer</h3>
                  <p className="text-gray-400 font-bold">Help us shape the future</p>
                </div>
                
                <div className="mb-10 flex items-baseline gap-2">
                  <span className="text-6xl font-black text-white">$0</span>
                  <span className="text-gray-500 font-black uppercase tracking-widest text-xs">/ forever beta</span>
                </div>
                
                <div className="space-y-4 mb-12 flex-grow">
                  <FeatureCheck text="Unlimited AI Background Removal" />
                  <FeatureCheck text="Full AI Text Humanizer Access" />
                  <FeatureCheck text="Logo Design Studio (High Res)" />
                  <FeatureCheck text="Beta Priority Support" />
                  <FeatureCheck text="Early access to new releases" />
                </div>
                
                <Link href="/tools" className="w-full py-5 px-8 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-center transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:scale-[1.02] active:scale-95">
                  Start Creating Now
                </Link>
              </div>
            </motion.div>

            {/* Pro Card (Coming Soon) */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="relative bg-[#080c18]/50 border border-white/5 rounded-3xl p-10 h-full flex flex-col backdrop-blur-sm">
                <div className="absolute top-8 right-8">
                  <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/40 text-[10px] font-black uppercase tracking-widest">
                    Coming Soon
                  </span>
                </div>
                
                <div className="mb-8">
                  <h3 className="text-2xl font-black text-white/50 mb-2">Pro Creator</h3>
                  <p className="text-gray-500 font-bold">Advanced features for power users</p>
                </div>
                
                <div className="mb-10 flex items-baseline gap-2">
                  <span className="text-6xl font-black text-white/20">$??</span>
                  <span className="text-gray-600 font-black uppercase tracking-widest text-xs">/ monthly</span>
                </div>
                
                <div className="space-y-4 mb-12 flex-grow opacity-30">
                  <FeatureCheck text="Bulk Image Processing" />
                  <FeatureCheck text="API Access for Developers" />
                  <FeatureCheck text="Custom AI Model Training" />
                  <FeatureCheck text="Team Collaboration Tools" />
                  <FeatureCheck text="Commercial Usage Rights" />
                </div>
                
                <button disabled className="w-full py-5 px-8 rounded-2xl bg-white/5 text-white/20 font-black cursor-not-allowed border border-white/5">
                  Waitlist Opening Soon
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FEATURE GRID */}
      <section className="py-32 bg-white/[0.02]">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-black text-white mb-16 tracking-tight">
            What's included in <span className="text-blue-500">Free Beta?</span>
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {betaFeatures.map((feature, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                className="p-6 rounded-2xl bg-[#080c18] border border-white/5 hover:border-blue-500/30 transition-all group"
              >
                <feature.icon className="w-8 h-8 text-blue-500 mb-4 mx-auto group-hover:scale-110 transition-transform" />
                <span className="block text-sm font-black text-gray-400 group-hover:text-white">{feature.name}</span>
              </motion.div>
            ))}
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
