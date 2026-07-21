"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { BlogFaq } from "@/types/blog";

interface BlogFaqSectionProps {
  faqs: BlogFaq[];
}

export default function BlogFaqSection({ faqs }: BlogFaqSectionProps) {
  const [openId, setOpenId] = useState<string | null>(faqs[0]?.id ?? null);

  if (!faqs.length) return null;

  const sorted = [...faqs].sort((a, b) => a.order - b.order);

  return (
    <section className="mt-12 pt-10 border-t border-gray-200 dark:border-white/5 space-y-6">
      <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-widest">Frequently Asked Questions</h3>
      <div className="space-y-3">
        {sorted.map((faq) => {
          const isOpen = openId === faq.id;
          return (
            <div
              key={faq.id}
              className="rounded-2xl border border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-white/[0.02] overflow-hidden"
            >
              <button
                type="button"
                onClick={() => setOpenId(isOpen ? null : faq.id)}
                className="w-full flex items-center justify-between gap-4 p-5 text-left cursor-pointer hover:bg-gray-100 dark:hover:bg-white/[0.02] transition-colors"
                aria-expanded={isOpen}
              >
                <span className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight">{faq.question}</span>
                <ChevronDown
                  className={`w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
                />
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <p className="px-5 pb-5 text-sm text-gray-600 dark:text-gray-400 font-medium leading-relaxed">{faq.answer}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
}
