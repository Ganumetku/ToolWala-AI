"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Sparkles, CheckCircle2, HelpCircle, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';

interface FAQ {
  question: string;
  answer: string;
}

interface ToolArticleProps {
  title: string;
  intro: string;
  whatItDoes: string;
  howToUse: string[];
  keyFeatures: { title: string; desc: string }[];
  benefits: string[];
  whyChoose: string;
  useCases: string[];
  faqs: FAQ[];
  conclusion: string;
  relatedTools?: { name: string; href: string }[];
}

export default function ToolArticle({
  title,
  intro,
  whatItDoes,
  howToUse,
  keyFeatures,
  benefits,
  whyChoose,
  useCases,
  faqs,
  conclusion,
  relatedTools = []
}: ToolArticleProps) {
  return (
    <section className="py-24 relative overflow-hidden bg-[#030712]">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* Section Divider */}
          <div className="flex items-center gap-4 mb-20">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">Deep Dive Guide</span>
            </div>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          </div>

          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-8 leading-[1.1]">
                Mastering the <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
                  {title}
                </span>
              </h2>
              <p className="text-xl text-gray-400 leading-relaxed font-medium max-w-3xl mx-auto italic">
                "{intro}"
              </p>
            </div>

            {/* Content Sections */}
            <div className="space-y-24">
              {/* What is it */}
              <div className="relative group">
                <div className="absolute -inset-8 bg-gradient-to-r from-blue-600/5 to-purple-600/5 rounded-[3rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="relative">
                  <h3 className="text-2xl font-black text-white mb-6 flex items-center gap-3 uppercase tracking-tight">
                    <span className="w-8 h-8 rounded-lg bg-blue-600/20 flex items-center justify-center text-blue-400 text-sm">01</span>
                    What is {title}?
                  </h3>
                  <p className="text-gray-400 leading-relaxed text-lg">
                    {whatItDoes}
                  </p>
                </div>
              </div>

              {/* How to use */}
              <div>
                <h3 className="text-2xl font-black text-white mb-8 flex items-center gap-3 uppercase tracking-tight">
                  <span className="w-8 h-8 rounded-lg bg-blue-600/20 flex items-center justify-center text-blue-400 text-sm">02</span>
                  How to use {title}
                </h3>
                <div className="grid gap-4">
                  {howToUse.map((step, i) => (
                    <motion.div 
                      key={i}
                      whileHover={{ x: 10 }}
                      className="flex gap-6 p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-blue-500/30 hover:bg-white/[0.04] transition-all group"
                    >
                      <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-black">
                        {i + 1}
                      </div>
                      <p className="text-gray-300 font-medium leading-relaxed">{step}</p>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Key Features */}
              <div>
                <h3 className="text-2xl font-black text-white mb-10 flex items-center gap-3 uppercase tracking-tight">
                  <span className="w-8 h-8 rounded-lg bg-blue-600/20 flex items-center justify-center text-blue-400 text-sm">03</span>
                  Key Features
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {keyFeatures.map((feature, i) => (
                    <div key={i} className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 hover:border-white/10 hover:bg-white/[0.04] transition-all group relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                         <Sparkles className="w-12 h-12 text-white" />
                      </div>
                      <h4 className="text-white font-black mb-4 uppercase tracking-widest text-xs flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                        {feature.title}
                      </h4>
                      <p className="text-gray-500 text-sm leading-relaxed font-medium group-hover:text-gray-400 transition-colors">
                        {feature.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Benefits & Use Cases */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div>
                  <h3 className="text-2xl font-black text-white mb-8 flex items-center gap-3 uppercase tracking-tight">
                    <span className="w-8 h-8 rounded-lg bg-blue-600/20 flex items-center justify-center text-blue-400 text-sm">04</span>
                    Benefits
                  </h3>
                  <ul className="space-y-4 list-none p-0">
                    {benefits.map((benefit, i) => (
                      <li key={i} className="flex items-start gap-4 text-gray-400 font-medium">
                        <CheckCircle2 className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white mb-8 flex items-center gap-3 uppercase tracking-tight">
                    <span className="w-8 h-8 rounded-lg bg-blue-600/20 flex items-center justify-center text-blue-400 text-sm">05</span>
                    Use Cases
                  </h3>
                  <ul className="space-y-3 list-none p-0">
                    {useCases.map((useCase, i) => (
                      <li key={i} className="bg-white/[0.02] px-6 py-4 rounded-2xl border border-white/5 text-gray-300 text-sm font-bold flex items-center justify-between group hover:bg-white/[0.04] transition-all">
                         {useCase}
                         <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-blue-500 transition-colors" />
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Why ToolGPT */}
              <div className="relative p-10 rounded-[3rem] bg-white/[0.01] border border-white/5 overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full blur-3xl" />
                <div className="relative">
                  <h3 className="text-2xl font-black text-white mb-6 uppercase tracking-tight">Why Choose ToolGPT AI?</h3>
                  <p className="text-gray-400 leading-relaxed text-lg">
                    {whyChoose}
                  </p>
                </div>
              </div>

              {/* FAQs */}
              <div>
                <div className="text-center mb-12">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-blue-500/10 text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4">
                    <HelpCircle className="w-3.5 h-3.5" />
                    Support Center
                  </div>
                  <h3 className="text-4xl font-black text-white tracking-tighter uppercase">Common Questions</h3>
                </div>
                <div className="space-y-4 max-w-3xl mx-auto">
                  {faqs.map((faq, i) => (
                    <FAQItem key={i} question={faq.question} answer={faq.answer} />
                  ))}
                </div>
              </div>

              {/* Conclusion */}
              <div className="p-12 rounded-[4rem] bg-gradient-to-br from-blue-600/20 via-transparent to-transparent border border-blue-500/20 text-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-grid-pattern opacity-5" />
                <h3 className="text-3xl font-black text-white mb-6 uppercase tracking-tight">Final Verdict</h3>
                <p className="text-gray-300 leading-relaxed text-lg font-medium max-w-2xl mx-auto relative z-10">
                  {conclusion}
                </p>
              </div>

              {/* Related Tools */}
              {relatedTools.length > 0 && (
                <div className="pt-20 border-t border-white/5">
                  <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em] mb-10 text-center">Recommended Utilities</h4>
                  <div className="flex flex-wrap justify-center gap-4">
                    {relatedTools.map((tool, i) => (
                      <Link 
                        key={i} 
                        href={tool.href}
                        className="px-8 py-4 rounded-2xl bg-white/[0.02] border border-white/5 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-white hover:bg-blue-600 hover:border-blue-600 hover:shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all transform hover:-translate-y-1"
                      >
                        {tool.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`border transition-all duration-500 rounded-[2rem] overflow-hidden ${isOpen ? 'bg-white/[0.03] border-blue-500/30 shadow-[0_0_30px_rgba(37,99,235,0.05)]' : 'bg-white/[0.01] border-white/5'}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-8 flex items-center justify-between text-left hover:bg-white/[0.02] transition-colors"
      >
        <span className={`text-lg font-black tracking-tight pr-8 transition-colors ${isOpen ? 'text-blue-400' : 'text-white'}`}>{question}</span>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-500 ${isOpen ? 'bg-blue-500 border-blue-500 text-white' : 'bg-white/5 border-white/10 text-gray-500'}`}>
          <ChevronDown 
            className={`w-4 h-4 transition-transform duration-500 ${isOpen ? 'rotate-180' : ''}`} 
          />
        </div>
      </button>
      <AnimatePresence>
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
