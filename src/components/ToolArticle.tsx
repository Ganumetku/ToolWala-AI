"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Sparkles, CheckCircle2, HelpCircle, ArrowRight } from 'lucide-react';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import ShareButtons from './ShareButtons';
import { toolsData } from '@/data/tools';

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
  
  // Resolve related tools dynamically from toolsData if none provided
  const resolvedRelatedTools = useMemo(() => {
    if (relatedTools && relatedTools.length > 0) return relatedTools;
    
    // Attempt to locate matching tool category
    const currentTool = toolsData.find(t => 
      t.title.toLowerCase().includes(title.toLowerCase()) || 
      title.toLowerCase().includes(t.title.toLowerCase())
    );
    
    const category = currentTool?.category;
    if (!category) {
      // Fallback: take popular tools
      return toolsData
        .filter(t => t.popular && t.isVisible)
        .slice(0, 4)
        .map(t => ({ name: t.title, href: t.href }));
    }

    return toolsData
      .filter(t => t.category === category && t.isVisible && !t.title.toLowerCase().includes(title.toLowerCase()))
      .slice(0, 4)
      .map(t => ({ name: t.title, href: t.href }));
  }, [title, relatedTools]);

  return (
    <section className="py-24 relative overflow-hidden bg-[#030712] border-t border-white/5">
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
            <div className="text-center mb-16 space-y-6">
              <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-4 leading-[1.1] uppercase">
                Mastering the <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
                  {title}
                </span>
              </h2>
              <p className="text-lg text-gray-400 leading-relaxed font-medium max-w-3xl mx-auto italic">
                "{intro}"
              </p>
              
              <div className="flex justify-center pt-4">
                <ShareButtons title={title} />
              </div>
            </div>

            {/* Content Sections */}
            <div className="space-y-24">
              {/* What is it */}
              <div className="relative group">
                <div className="absolute -inset-8 bg-gradient-to-r from-blue-600/5 to-purple-600/5 rounded-[3rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                <div className="relative">
                  <h3 className="text-2xl font-black text-white mb-6 flex items-center gap-3 uppercase tracking-tight">
                    <span className="w-8 h-8 rounded-lg bg-blue-600/20 flex items-center justify-center text-blue-400 text-sm">01</span>
                    What is {title}?
                  </h3>
                  <p className="text-gray-400 leading-relaxed text-base font-sans">
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
                      whileHover={{ x: 6 }}
                      className="flex gap-6 p-6 rounded-[1.5rem] bg-white/[0.01] border border-white/5 hover:border-blue-500/20 hover:bg-white/[0.03] transition-all group"
                    >
                      <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-black">
                        {i + 1}
                      </div>
                      <p className="text-gray-300 font-medium leading-relaxed font-sans text-sm sm:text-base">{step}</p>
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
                    <div key={i} className="p-8 rounded-[2rem] bg-white/[0.01] border border-white/5 hover:border-blue-500/20 hover:bg-white/[0.03] transition-all group relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-10 transition-opacity">
                         <Sparkles className="w-12 h-12 text-white" />
                      </div>
                      <h4 className="text-white font-black mb-4 uppercase tracking-widest text-xs flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                        {feature.title}
                      </h4>
                      <p className="text-gray-500 text-xs sm:text-sm leading-relaxed font-semibold group-hover:text-gray-400 transition-colors font-sans">
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
                      <li key={i} className="flex items-start gap-4 text-gray-400 font-medium font-sans text-sm sm:text-base">
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
                      <li key={i} className="bg-white/[0.01] px-6 py-4 rounded-2xl border border-white/5 text-gray-300 text-xs sm:text-sm font-bold flex items-center justify-between group hover:bg-white/[0.03] transition-all">
                         <span className="font-sans leading-relaxed">{useCase}</span>
                         <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-blue-500 transition-colors" />
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Why ToolWala */}
              <div className="relative p-8 sm:p-10 rounded-[2rem] bg-white/[0.01] border border-white/5 overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />
                <div className="relative">
                  <h3 className="text-2xl font-black text-white mb-6 uppercase tracking-tight">Why Choose ToolWala AI?</h3>
                  <p className="text-gray-400 leading-relaxed text-base font-sans">
                    {whyChoose}
                  </p>
                </div>
              </div>

              {/* FAQs */}
              {faqs && faqs.length > 0 && (
                <div>
                  <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-blue-500/10 text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4">
                      <HelpCircle className="w-3.5 h-3.5" />
                      Support Center
                    </div>
                    <h3 className="text-3xl font-black text-white tracking-tighter uppercase">Common Questions</h3>
                  </div>
                  <div className="space-y-4 max-w-3xl mx-auto">
                    {faqs.map((faq, i) => (
                      <FAQItem key={i} question={faq.question} answer={faq.answer} />
                    ))}
                  </div>
                </div>
              )}

              {/* Conclusion */}
              <div className="p-8 sm:p-12 rounded-[2rem] bg-gradient-to-br from-blue-600/10 via-transparent to-transparent border border-blue-500/15 text-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />
                <h3 className="text-3xl font-black text-white mb-6 uppercase tracking-tight">Final Verdict</h3>
                <p className="text-gray-300 leading-relaxed text-base sm:text-lg font-medium max-w-2xl mx-auto relative z-10 font-sans">
                  {conclusion}
                </p>
              </div>

              {/* Related Tools Engine */}
              {resolvedRelatedTools.length > 0 && (
                <div className="pt-20 border-t border-white/5">
                  <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em] mb-10 text-center select-none">Recommended Utilities</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {resolvedRelatedTools.map((tool, i) => (
                      <Link 
                        key={i} 
                        href={tool.href}
                        className="p-5 rounded-2xl bg-white/[0.01] border border-white/5 hover:border-blue-500/20 hover:bg-blue-600/5 hover:shadow-[0_0_20px_rgba(37,99,235,0.1)] transition-all flex flex-col justify-between group h-32"
                      >
                        <span className="text-xs sm:text-sm font-black text-gray-300 group-hover:text-white transition-colors uppercase leading-tight">
                          {tool.name}
                        </span>
                        <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest flex items-center gap-1 select-none">
                          Try Tool
                          <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                        </span>
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
    <div className={`border transition-all duration-300 rounded-[1.5rem] overflow-hidden ${isOpen ? 'bg-white/[0.02] border-blue-500/20 shadow-[0_0_30px_rgba(37,99,235,0.02)]' : 'bg-white/[0.01] border-white/5'}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-6 flex items-center justify-between text-left hover:bg-white/[0.01] transition-colors cursor-pointer"
      >
        <span className={`text-base font-black tracking-tight pr-6 transition-colors ${isOpen ? 'text-blue-400' : 'text-white'}`}>{question}</span>
        <div className={`w-7 h-7 rounded-full flex items-center justify-center border transition-all duration-300 ${isOpen ? 'bg-blue-500 border-blue-500 text-white' : 'bg-white/5 border-white/10 text-gray-500'}`}>
          <ChevronDown 
            className={`w-3.5 h-3.5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
          />
        </div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
          >
            <div className="px-6 pb-6 text-gray-400 font-semibold leading-relaxed text-sm font-sans">
              <div className="h-px w-8 bg-blue-500/20 mb-4" />
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
