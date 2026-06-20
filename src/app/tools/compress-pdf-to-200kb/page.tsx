"use client";

import Link from 'next/link';
import { ChevronLeft, ArrowRight, ShieldCheck, Sparkles, HelpCircle } from 'lucide-react';
import { useTranslation } from '@/components/I18nContext';
import { MeshGradient } from '@/components/BackgroundEffects';
import FAQAccordion from '@/app/tools/[slug]/FAQAccordion';

export default function CompressPdfTo200Kb() {
  const { t, localizeHref } = useTranslation();

  const faqs = [
    {
      question: "How can I compress PDF to 200KB online for free?",
      answer: "ToolWala's browser-local PDF Compressor runs directly on your device. It reduces the size of images, embeds compressed fonts, and strips metadata streams to bring the overall file size below 200KB."
    },
    {
      question: "Will my PDF's quality degrade significantly?",
      answer: "No. The compressor balances compression parameters to keep images legible and vectors (like text and lines) crisp and sharp, ensuring it meets official guidelines without looking blurry."
    },
    {
      question: "Does it work on mobile phones?",
      answer: "Yes, it is fully responsive and compatible with all mobile browsers (Chrome, Safari) on iOS and Android."
    }
  ];

  return (
    <div className="bg-[#030712] min-h-screen py-24 relative overflow-hidden font-sans">
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
              Recruitment Portal Compliance Tool
            </div>
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white uppercase leading-tight">
              Compress PDF to 200KB <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">
                Online & Free
              </span>
            </h1>
            <p className="text-base sm:text-lg text-gray-400 font-medium leading-relaxed">
              Reduce PDF file size to 200KB locally in your browser. Perfect for official recruitment forms, government portals, EPFO uploads, and visa applications.
            </p>

            <div className="pt-6">
              <Link
                href={localizeHref("/tools/compress-pdf")}
                className="inline-flex items-center justify-center gap-3 px-10 py-5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase tracking-[0.2em] rounded-2xl transition-all shadow-[0_0_30px_rgba(37,99,235,0.4)] hover:scale-105 active:scale-95 cursor-pointer font-sans"
              >
                Go to PDF Compressor
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Secure notification */}
          <div className="flex items-center gap-4 bg-emerald-500/5 border border-emerald-500/10 p-5 rounded-2xl max-w-2xl mx-auto">
            <ShieldCheck className="w-8 h-8 text-emerald-400 shrink-0" />
            <div className="text-xs text-gray-400 leading-relaxed font-sans">
              <strong>100% Browser-Native:</strong> Your documents are optimized directly on your device. We never copy, upload, or process your files on our servers.
            </div>
          </div>

          {/* SEO rich text */}
          <section className="space-y-6 pt-6 border-t border-white/5">
            <h2 className="text-2xl font-black text-white uppercase tracking-tight">How to Compress PDF to 200KB</h2>
            <p className="text-sm text-gray-400 leading-relaxed font-sans">
              Many official Indian recruitment systems (such as SSC, UPSC, and state government portals) and banking consoles enforce a strict upload file size limit of 200KB. Uploading files that exceed this file size throws a portal validation error. With ToolWala, you can compress your PDF down to 200KB in seconds without leaving your computer:
            </p>
            <ol className="list-decimal pl-6 text-sm text-gray-400 space-y-2 font-sans">
              <li>Click the **Go to PDF Compressor** button above to open the main optimizer tool.</li>
              <li>Drag and drop your PDF document or browse your files locally.</li>
              <li>Select the target compression parameters to automatically lower resolutions and strip unused font subsets.</li>
              <li>Download the resulting file under 200KB instantly.</li>
            </ol>
          </section>

          {/* FAQs */}
          <section className="space-y-6 pt-6 border-t border-white/5">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-blue-400" />
              <h3 className="text-xl font-black text-white uppercase tracking-tight">Frequently Asked Questions</h3>
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
