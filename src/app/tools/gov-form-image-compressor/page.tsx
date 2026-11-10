"use client";

import Link from 'next/link';
import { ArrowRight, ImageDown, HelpCircle } from 'lucide-react';
import { useTranslation } from '@/components/I18nContext';
import FAQAccordion from '@/app/tools/[slug]/FAQAccordion';
import ToolLayout from '@/components/tools/ToolLayout';
import ToolHero from '@/components/tools/ToolHero';

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
    <ToolLayout>
      <div className="bg-[#FBFCFE] dark:bg-white/[0.02] border border-[#E6ECF5] dark:border-white/5 rounded-3xl overflow-hidden shadow-2xl mb-12">
        <ToolHero
          title="Government Form Image Compressor"
          description="Compress passport photos, scans, and signatures under official size constraints (20KB, 50KB) online."
          icon={<ImageDown className="w-6 h-6 sm:w-7 sm:h-7" />}
        />

        <div className="p-5 sm:p-10 space-y-10">
          <div className="text-center max-w-xl mx-auto py-8">
            <p className="text-slate-600 dark:text-gray-400 font-medium mb-6">
              Launch our high-performance image compression tool with custom KB size targeting for SSC, UPSC, IBPS, and state portals.
            </p>
            <Link
              href={localizeHref("/tools/image-compressor/")}
              className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase tracking-wider rounded-2xl transition-all shadow-[0_4px_20px_rgba(37,99,235,0.35)] hover:scale-105 active:scale-95 cursor-pointer font-sans"
            >
              Open Image Compressor
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* SEO rich text */}
          <section className="space-y-4 pt-6 border-t border-slate-200 dark:border-white/5">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">How to Compress Image for Government Portals</h2>
            <p className="text-sm text-slate-600 dark:text-gray-400 leading-relaxed">
              Indian recruitment dashboards (such as Staff Selection Commission - SSC, Union Public Service Commission - UPSC, banking, and state portals) enforce strict size limits for uploaded documents. If your passport photo or signature scan is larger than 20KB or 50KB, it will be rejected. ToolWala compresses your images quickly:
            </p>
            <ol className="list-decimal pl-6 text-sm text-slate-600 dark:text-gray-400 space-y-2">
              <li>Click the <strong>Open Image Compressor</strong> button above to launch the compressor utility.</li>
              <li>Upload your JPG, JPEG, or PNG passport photo or signature scan.</li>
              <li>Set the target maximum file size (e.g. 20KB or 50KB).</li>
              <li>Download the optimized, portal-compliant image file instantly.</li>
            </ol>
          </section>

          {/* FAQs */}
          <section className="space-y-4 pt-6 border-t border-slate-200 dark:border-white/5">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-blue-500" />
              <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Frequently Asked Questions</h3>
            </div>
            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <FAQAccordion key={i} question={faq.question} answer={faq.answer} />
              ))}
            </div>
          </section>
        </div>
      </div>
    </ToolLayout>
  );
}
