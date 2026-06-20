"use client";

import Link from 'next/link';
import { ChevronLeft, ArrowRight, ShieldCheck, Sparkles, HelpCircle } from 'lucide-react';
import { useTranslation } from '@/components/I18nContext';
import { MeshGradient } from '@/components/BackgroundEffects';
import FAQAccordion from '@/app/tools/[slug]/FAQAccordion';

export default function AadhaarPhotoResize() {
  const { t, localizeHref } = useTranslation();

  const faqs = [
    {
      question: "What is the official photo size for Aadhaar card updates?",
      answer: "The official photo size specification is 35mm x 45mm (3.5cm x 4.5cm) with a file size limit typically below 100KB, and a plain white or light background."
    },
    {
      question: "Can I change the background color of my photo here?",
      answer: "Yes! The Aadhaar Photo Resizer tool features a built-in client-side AI background remover that lets you replace backgrounds with a clean, compliant white backdrop."
    },
    {
      question: "Is this tool free and safe?",
      answer: "ToolWala is 100% free with no signups. Because your photo is processed client-side in active browser memory, your biometric identity remains completely secure on your own device."
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
              UIDAI Portal Compliance Tool
            </div>
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white uppercase leading-tight">
              Aadhaar Photo Resize <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">
                Online & Free
              </span>
            </h1>
            <p className="text-base sm:text-lg text-gray-400 font-medium leading-relaxed">
              Format, crop, and resize photos to official UIDAI specifications online. Replace backgrounds and compress to under 100KB locally and securely.
            </p>

            <div className="pt-6">
              <Link
                href={localizeHref("/tools/aadhaar-photo-resizer")}
                className="inline-flex items-center justify-center gap-3 px-10 py-5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase tracking-[0.2em] rounded-2xl transition-all shadow-[0_0_30px_rgba(37,99,235,0.4)] hover:scale-105 active:scale-95 cursor-pointer font-sans"
              >
                Go to Aadhaar Photo Resizer
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Secure notification */}
          <div className="flex items-center gap-4 bg-emerald-500/5 border border-emerald-500/10 p-5 rounded-2xl max-w-2xl mx-auto">
            <ShieldCheck className="w-8 h-8 text-emerald-400 shrink-0" />
            <div className="text-xs text-gray-400 leading-relaxed font-sans">
              <strong>100% Browser-Native:</strong> Your personal identity photos are cropped and adjusted locally in your browser context. We never upload or save your biometric data.
            </div>
          </div>

          {/* SEO rich text */}
          <section className="space-y-6 pt-6 border-t border-white/5">
            <h2 className="text-2xl font-black text-white uppercase tracking-tight">How to Resize Photo for Aadhaar Card</h2>
            <p className="text-sm text-gray-400 leading-relaxed font-sans">
              Updating your Aadhaar card photo on the official UIDAI portal requires a photograph that adheres strictly to biometric criteria. Non-compliant dimensions or file sizes will lead to application rejections. With ToolWala, formatting is simple:
            </p>
            <ol className="list-decimal pl-6 text-sm text-gray-400 space-y-2 font-sans">
              <li>Click the **Go to Aadhaar Photo Resizer** button above to open the photo compiler.</li>
              <li>Upload your passport photo or portrait.</li>
              <li>The tool automatically applies the official 3.5 x 4.5 cm crop bounds.</li>
              <li>Enable background removal to generate a clean white or neutral gray backdrop.</li>
              <li>Download your print-ready Aadhaar photo instantly.</li>
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
