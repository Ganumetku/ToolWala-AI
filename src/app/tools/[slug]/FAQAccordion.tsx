"use client";

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FAQAccordionProps {
  question: string;
  answer: string;
}

export default function FAQAccordion({ question, answer }: FAQAccordionProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`border transition-all duration-300 rounded-[1.125rem] overflow-hidden ${
      isOpen 
        ? 'bg-white dark:bg-white/[0.03] border-blue-500/40 shadow-[0_10px_35px_rgba(15,23,42,0.06)]' 
        : 'bg-white dark:bg-white/[0.01] border-[#E6ECF5] dark:border-white/5 shadow-[0_4px_20px_rgba(15,23,42,0.03)] hover:-translate-y-0.5'
    }`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-6 sm:p-8 flex items-center justify-between text-left hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors cursor-pointer"
      >
        <span className={`text-base sm:text-lg font-black tracking-tight pr-6 transition-colors ${
          isOpen ? 'text-blue-600 dark:text-blue-400' : 'text-slate-900 dark:text-white'
        }`}>
          {question}
        </span>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-300 ${
          isOpen ? 'bg-blue-600 border-blue-600 text-white' : 'bg-blue-50 dark:bg-white/5 border-blue-100 dark:border-white/10 text-blue-600 dark:text-gray-400'
        }`}>
          <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
          >
            <div className="px-6 sm:px-8 pb-6 sm:pb-8 text-slate-600 dark:text-gray-400 font-medium leading-relaxed text-sm sm:text-base font-sans">
              <div className="h-px w-12 bg-blue-500/30 mb-5" />
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
