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
    <div className={`border transition-all duration-300 rounded-[2rem] overflow-hidden ${
      isOpen 
        ? 'bg-blue-50/50 dark:bg-white/[0.03] border-blue-500/30 shadow-sm' 
        : 'bg-white dark:bg-white/[0.01] border-gray-200 dark:border-white/5 shadow-sm'
    }`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-8 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors"
      >
        <span className={`text-lg font-black tracking-tight pr-8 transition-colors ${
          isOpen ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'
        }`}>
          {question}
        </span>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-300 ${
          isOpen ? 'bg-blue-600 border-blue-600 text-white' : 'bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400'
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
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <div className="px-8 pb-8 text-gray-400 font-medium leading-relaxed text-base">
              <div className="h-px w-12 bg-blue-500/30 mb-6" />
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
