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
    <section className="mt-12 pt-10 border-t border-slate-200 dark:border-white/10 space-y-6">
      <div className="flex items-center gap-3">
        <span className="w-1.5 h-6 rounded-full bg-blue-600 dark:bg-blue-500" />
        <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          Frequently Asked Questions
        </h3>
      </div>
      <div className="space-y-3">
        {sorted.map((faq) => {
          const isOpen = openId === faq.id;
          return (
            <div
              key={faq.id}
              className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-white/[0.02] overflow-hidden transition-all hover:border-blue-500/30"
            >
              <button
                type="button"
                onClick={() => setOpenId(isOpen ? null : faq.id)}
                className="w-full flex items-center justify-between gap-4 p-5 text-left cursor-pointer hover:bg-slate-100/70 dark:hover:bg-white/[0.04] transition-colors"
                aria-expanded={isOpen}
              >
                <span className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white tracking-normal leading-snug">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
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
                    <p className="px-5 pb-5 text-sm sm:text-[15px] text-slate-600 dark:text-slate-300 font-normal leading-relaxed">
                      {faq.answer}
                    </p>
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
