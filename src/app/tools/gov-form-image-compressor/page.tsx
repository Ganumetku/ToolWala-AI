"use client";

import Link from 'next/link';
import { ChevronLeft, ArrowRight, ShieldCheck, Sparkles, HelpCircle } from 'lucide-react';
import { useTranslation } from '@/components/I18nContext';
import { MeshGradient } from '@/components/BackgroundEffects';
import FAQAccordion from '@/app/tools/[slug]/FAQAccordion';

export default function GovFormImageCompressor() {
  const { t, localizeHref } = useTranslation();

  const faqs = [
    {
      question: "What is the typical image size limit for government forms in India?",
      answer: "Most portals (like SSC, UPSC, IBPS, and state recruitment systems) require photographs to be between 20KB and 50KB, and signatures to be between 10KB and 20KB."
    },
    {
      question: "Will my compressed photo look pixelated or blurry?",
      answer: "No. The optimizer compresses files using canvas-scaling ratios to keep dimensions compliant while reducing bytes, ensuring text remains sharp and face features clear."
    },
    {
      question: "Is it safe to upload my signature here?",
      answer: "Yes, 100% safe. Processing happens locally in your browser sandbox. Your signature or portrait image file never leaves your computer."
    }
  ];

  return (
    <div className="bg-[#F6F8FC] dark:bg-[#030712] min-h-screen py-24 relative overflow-hidden font-sans transition-colors duration-250 font-sans">
      <MeshGradient />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl relative z-10 text-left">
        <Link href="/tools" className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-widest text-gray-500 hover:text-blue-500 transition-colors mb-10 group cursor-pointer">
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Directory
        </Link>

        <div className="glass rounded-[2.5rem] border border-white/5 p-8 sm:p-14 bg-white/[0.01] shadow-2xl space-y-12">
          {/* Hero Header */}
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-blue-400 border border-blue-500/20 shadow-md">
              <Sparkles className="w-3.5 h-3.5" />
              Sarkari Result & Portal Helper
            </div>
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 dark:text-white uppercase leading-tight">
              Government Form Image Compressor <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">
                Online & Free
              </span>
            </h1>
            <p className="text-base sm:text-lg text-gray-400 font-medium leading-relaxed">
              Compress passport photos, scans, and signatures under official size constraints (20KB, 50KB) online. Entirely secure on your local device.
            </p>

            <div className="pt-6">
              <Link
                href={localizeHref("/tools/image-compressor")}
                className="inline-flex items-center justify-center gap-3 px-10 py-5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase tracking-[0.2em] rounded-2xl transition-all shadow-[0_0_30px_rgba(37,99,235,0.4)] hover:scale-105 active:scale-95 cursor-pointer font-sans"
              >
                Go to Image Compressor
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Secure notification */}
          <div className="flex items-center gap-4 bg-emerald-500/5 border border-emerald-500/10 p-5 rounded-2xl max-w-2xl mx-auto">
            <ShieldCheck className="w-8 h-8 text-emerald-400 shrink-0" />
            <div className="text-xs text-gray-400 leading-relaxed font-sans">
              <strong>100% Browser-Native:</strong> All image scaling and byte size reduction occurs locally inside browser cache. No photos are stored on our servers.
            </div>
          </div>

          {/* SEO rich text */}
          <section className="space-y-6 pt-6 border-t border-white/5">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">How to Compress Image for Government Portals</h2>
            <p className="text-sm text-gray-400 leading-relaxed font-sans">
              Indian recruitment dashboards (such as Staff Selection Commission - SSC, Union Public Service Commission - UPSC, banking, and state portals) enforce strict size limits for uploaded documents. If your passport photo or signature scan is larger than 20KB or 50KB, it will be rejected. ToolWala compresses your images quickly:
            </p>
            <ol className="list-decimal pl-6 text-sm text-gray-400 space-y-2 font-sans">
              <li>Click the **Go to Image Compressor** button above to launch the compressor utility.</li>
              <li>Upload your JPG, JPEG, or PNG passport photo or signature scan.</li>
              <li>Set the target maximum file size (e.g. 20KB or 50KB).</li>
              <li>Download the optimized, portal-compliant image file instantly.</li>
            </ol>
          </section>

          {/* FAQs */}
          <section className="space-y-6 pt-6 border-t border-white/5">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-blue-400" />
              <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Frequently Asked Questions</h3>
            </div>
            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <FAQAccordion key={i} question={faq.question} answer={faq.answer} />
              ))}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
