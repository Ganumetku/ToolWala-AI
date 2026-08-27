"use client";

import Link from 'next/link';
import { 
  Zap, Rocket, Sparkles, CheckCircle2, ShieldCheck, Heart, 
  HelpCircle, ArrowRight, Lock, Check, Cpu
} from 'lucide-react';
import { MeshGradient, FloatingParticles } from '@/components/BackgroundEffects';
import { useTranslation } from '@/components/I18nContext';

export default function PricingPage() {
  const { t, localizeHref } = useTranslation();

  const freeFeatures = [
    "Unlimited access to all 50+ WebAssembly tools",
    "100% local browser processing — zero file uploads",
    "No registration or personal data required",
    "High-speed PDF conversion, merge & split",
    "AI image enhancement & background removal",
    "Full-featured document formatting & OCR text extraction",
    "No watermark and no arbitrary daily quotas",
    "All financial & math calculators with instant results"
  ];

  const proFeatures = [
    "Headless REST API access for automated pipelines",
    "Enterprise batch processing SDK (1000+ files/min)",
    "Custom self-hosted Docker on-premise deployment",
    "Dedicated SLA & priority technical support",
    "Custom branded exports & white-labeling"
  ];

  const faqs = [
    {
      q: "Why is ToolWala AI completely free to use?",
      a: "ToolWala AI uses WebAssembly (WASM) and modern web browser computing to process files entirely on your device. Because our servers do not store or process your documents, our infrastructure costs remain minimal, allowing us to keep all utility tools 100% free for everyone."
    },
    {
      q: "Are there any hidden limits, fees, or credit card requirements?",
      a: "No. You don't need to create an account, provide an email address, or enter credit card information. Every tool is available with zero daily limits."
    },
    {
      q: "Do you add watermarks to exported PDF or image files?",
      a: "Never. All converted PDFs, cropped photos, compressed documents, and generated assets are clean and 100% watermark-free."
    },
    {
      q: "Is my data stored or sold to third parties?",
      a: "No. Your documents never leave your computer or smartphone. All data processing occurs inside your active browser tab's sandbox RAM."
    }
  ];

  return (
    <div className="bg-[#F6F8FC] dark:bg-[#030712] min-h-screen pt-8 sm:pt-10 pb-20 relative overflow-hidden font-sans transition-colors duration-250">
      <MeshGradient />
      <FloatingParticles />

      {/* Background Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/5 rounded-full blur-[140px] pointer-events-none z-0" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl relative z-10">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-widest border border-blue-200 dark:border-blue-500/20 mb-3 sm:mb-4 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            Simple & Transparent
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight uppercase mb-3 sm:mb-4 leading-tight">
            Free Forever. No Hidden Fees.
          </h1>

          <p className="text-sm sm:text-base text-slate-600 dark:text-gray-400 font-medium max-w-2xl mx-auto leading-relaxed">
            Every single utility tool on ToolWala AI is 100% free, private, and powered by client-side browser technology.
          </p>

          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-[10px] sm:text-xs font-black text-slate-500 dark:text-gray-400 uppercase tracking-widest mt-5">
            <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-500" /> 100% Client-Side</span>
            <span className="flex items-center gap-1.5"><Heart className="w-4 h-4 text-rose-500" /> Community Supported</span>
            <span className="flex items-center gap-1.5"><Lock className="w-4 h-4 text-blue-500" /> Zero File Uploads</span>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto mb-20">
          
          {/* Free Forever Community Card */}
          <div className="relative rounded-[2.5rem] bg-white dark:bg-[#0f172a]/95 border-2 border-blue-600 shadow-2xl p-8 sm:p-10 flex flex-col justify-between">
            <div className="absolute -top-3.5 left-8 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1 rounded-full shadow-md">
              Most Popular / Default
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                    Free Community Plan
                  </h3>
                  <p className="text-xs font-bold text-slate-500 dark:text-gray-400 mt-0.5">
                    For individuals, students, creators & professionals
                  </p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <Rocket className="w-6 h-6" />
                </div>
              </div>

              <div className="my-6 pb-6 border-b border-slate-100 dark:border-white/5">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl sm:text-6xl font-black text-slate-900 dark:text-white tracking-tight">₹0</span>
                  <span className="text-xs font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 rounded-lg">
                    Free Forever
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-gray-400 font-medium mt-2">
                  No credit card, signup, or subscriptions required.
                </p>
              </div>

              <ul className="space-y-3.5 mb-8">
                {freeFeatures.map((feat, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm font-semibold text-slate-700 dark:text-gray-300">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Link
              href={localizeHref('/tools')}
              className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm uppercase tracking-widest text-center transition-all shadow-lg shadow-blue-500/25 active:scale-95 block"
            >
              Start Using Tools Now
            </Link>
          </div>

          {/* Developer / Enterprise Card */}
          <div className="relative rounded-[2.5rem] bg-white/70 dark:bg-[#0f172a]/60 border border-slate-200/90 dark:border-white/10 shadow-lg p-8 sm:p-10 flex flex-col justify-between backdrop-blur-md">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                    API & Developer SDK
                  </h3>
                  <p className="text-xs font-bold text-slate-500 dark:text-gray-400 mt-0.5">
                    For businesses and high-volume automated workflows
                  </p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400">
                  <Cpu className="w-6 h-6" />
                </div>
              </div>

              <div className="my-6 pb-6 border-b border-slate-100 dark:border-white/5">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">Custom</span>
                  <span className="text-xs font-black uppercase tracking-widest text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10 px-2.5 py-1 rounded-lg">
                    Coming Soon
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-gray-400 font-medium mt-2">
                  Enterprise API pipelines, self-hosted WASM packages, and batch tools.
                </p>
              </div>

              <ul className="space-y-3.5 mb-8">
                {proFeatures.map((feat, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm font-semibold text-slate-600 dark:text-gray-400">
                    <div className="w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Link
              href={localizeHref('/contact')}
              className="w-full py-4 rounded-2xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-900 dark:text-white font-black text-sm uppercase tracking-widest text-center transition-all border border-slate-200 dark:border-white/10 block"
            >
              Contact For Early Access
            </Link>
          </div>

        </div>

        {/* FAQs Section */}
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-gray-400 font-medium mt-1">
              Everything you need to know about our free pricing policy.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="p-6 rounded-2xl bg-white dark:bg-white/[0.02] border border-slate-200/90 dark:border-white/10 shadow-sm space-y-2">
                <h4 className="text-sm font-black text-slate-900 dark:text-white">
                  {faq.q}
                </h4>
                <p className="text-xs text-slate-600 dark:text-gray-400 leading-relaxed font-medium">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
