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
      question: t('faq.q1', 'Are my files uploaded to any server?'),
      answer: t('faq.a1', 'Supported PDF and image tools process files directly in your web browser without uploading them to a server. For text-based AI tools such as the AI Cover Letter Generator, entered details are sent to an AI service to generate content.')
    },
    {
      question: t('faq.q2', 'Is ToolWala free to use?'),
      answer: t('faq.a2', 'Yes. Supported PDF, image and utility tools on ToolWala are free to use without subscription fees or paywalls.')
    },
    {
      question: t('faq.q3', 'Do I need to create an account to use the tools?'),
      answer: t('faq.a3', 'No. You can use supported free tools on ToolWala without creating an account or providing personal details. Simply open a tool, process your file and download the result.')
    },
    {
      question: t('faq.q4', 'What file formats are supported?'),
      answer: t('faq.a4', 'ToolWala supports common document and image formats including PDF, JPG, PNG, and WebP. Certain tools also support HEIC, Word (DOCX), Excel (XLSX), and PowerPoint (PPTX) conversions.')
    },
    {
      question: t('faq.q5', 'What is the maximum file size I can process?'),
      answer: t('faq.a5', "Supported file sizes depend on the selected tool, your browser and your device's available memory. Larger files may take longer to process or exceed device limitations.")
    },
    {
      question: t('faq.q6', 'How does browser-based processing protect my privacy?'),
      answer: t('faq.a6', 'Traditional online converters upload your files to remote cloud servers for processing. Supported browser-based tools perform calculations locally on your device, meaning files stay on your computer or phone rather than being transferred over the network.')
    }
  ];

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  };

  return (
    <section className="py-24 relative overflow-hidden bg-gray-50/50 dark:bg-black/20 border-b border-gray-200 dark:border-white/5 transition-colors duration-250">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 max-w-4xl">
        
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-widest border border-blue-200 dark:border-blue-500/20 mb-4">
            <HelpCircle className="w-3.5 h-3.5" />
            {t('faq.support_center', 'SUPPORT CENTER')}
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight">
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
                    ? "border-blue-500/30 dark:border-white/15 bg-white dark:bg-white/[0.03] shadow-[0_4px_16px_rgba(37,99,235,0.06)]" 
                    : "border-slate-200/70 dark:border-white/5 bg-white dark:bg-[#0f172a] shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:border-slate-300 dark:hover:border-white/10 hover:shadow-[0_4px_12px_rgba(0,0,0,0.04)]"
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
