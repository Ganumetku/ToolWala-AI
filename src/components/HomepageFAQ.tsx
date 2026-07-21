"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HelpCircle, ChevronDown } from "lucide-react";
import { useTranslation } from "@/components/I18nContext";

export default function HomepageFAQ() {
  const { t } = useTranslation();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggleAccordion = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const faqs = [
    {
      question: t('faq.q1', 'How does ToolWala AI process files without uploading them?'),
      answer: t('faq.a1', 'ToolWala AI uses modern browser-native technologies like WebAssembly (WASM), WebGL, and JavaScript canvas operations. When you select an image or a PDF, the file is read directly from your local disk into your browser\'s private sandbox memory. The computation (like cropping, compressing, or background removal) runs on your local CPU/GPU threads, meaning your files never leave your computer.')
    },
    {
      question: t('faq.q2', 'Can I use these tools offline?'),
      answer: t('faq.a2', 'Yes! Once you have loaded a tool page (like the Background Remover or Aadhaar Resizer) while online, the assets and models are cached by your browser. You can disconnect from the internet and continue using the core processing features offline, as no server communication is required.')
    },
    {
      question: t('faq.q3', 'Is ToolWala AI completely free to use?'),
      answer: t('faq.a3', 'ToolWala AI is currently in free beta. All tools, generators, and compressors are available at zero cost, without registration, limits, or subscription traps.')
    },
    {
      question: t('faq.q4', 'Are my documents secure and compliant with data laws?'),
      answer: t('faq.a4', 'Because we process all files locally in your browser memory and do not upload them to external cloud servers, we are inherently GDPR compliant and follow the highest standards of data safety. Your private documents (resumes, signatures, Aadhaar photos, invoices) are completely confidential.')
    },
    {
      question: t('faq.q5', 'How do I standardise my passport/Aadhaar photos under target sizes?'),
      answer: t('faq.a5', 'Simply upload your photo into the Resizer. Our algorithm locates the face, aligns it to standard ID crop positions, and lets you select official templates. When downloading, you can choose to compress the output dynamically under 20KB, 50KB, or 100KB limits.')
    }
  ];

  return (
    <section className="py-24 relative overflow-hidden bg-slate-50/50 dark:bg-black/20 border-b border-gray-200 dark:border-white/5 transition-colors duration-250">
      {/* Background Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-blue-500/5 dark:bg-indigo-600/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 max-w-4xl">
        
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-widest border border-blue-200 dark:border-blue-500/20 mb-4">
            <HelpCircle className="w-3.5 h-3.5" />
            {t('faq.support_center', 'SUPPORT CENTER')}
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-gray-900 dark:text-white tracking-tight uppercase">
            {t('faq.title', 'Frequently Asked Questions')}
          </h2>
          <p className="text-gray-600 dark:text-gray-500 mt-4 font-medium">
            {t('faq.subtitle', 'Answers to common questions regarding local processing, file security, and specifications.')}
          </p>
        </div>

        {/* FAQs List */}
        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isExpanded = expandedIndex === index;
            return (
              <div 
                key={index} 
                className={`overflow-hidden rounded-2xl border transition-all duration-300 ${
                  isExpanded 
                    ? "border-blue-500/40 bg-white dark:bg-white/[0.02] shadow-md dark:shadow-[0_0_30px_rgba(37,99,235,0.02)]" 
                    : "border-gray-200 dark:border-white/5 bg-white dark:bg-[#0f172a] shadow-sm hover:border-gray-300 dark:hover:border-white/10"
                }`}
              >
                <button
                  onClick={() => toggleAccordion(index)}
                  className="w-full flex items-center justify-between p-6 sm:p-8 text-left focus:outline-none cursor-pointer"
                >
                  <span className={`text-base sm:text-lg font-black tracking-tight pr-6 transition-colors ${
                    isExpanded ? "text-blue-600 dark:text-blue-400" : "text-gray-900 dark:text-white"
                  }`}>
                    {faq.question}
                  </span>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-300 shrink-0 ${
                    isExpanded 
                      ? "bg-blue-600 border-blue-600 text-white" 
                      : "bg-blue-50 dark:bg-white/5 border-blue-100 dark:border-white/10 text-blue-600 dark:text-gray-400"
                  }`}>
                    <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`} />
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                    >
                      <div className="px-6 sm:px-8 pb-8 text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed font-semibold">
                        <div className="h-px w-10 bg-blue-500/20 mb-6" />
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
