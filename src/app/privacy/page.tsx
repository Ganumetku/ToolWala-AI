"use client";

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, Lock, Cpu, CloudOff, WifiOff, Globe, 
  ArrowRight, Check, X, ChevronDown, HelpCircle, Inbox, Code, EyeOff
} from 'lucide-react';
import { useTranslation } from '@/components/I18nContext';
import { MeshGradient, FloatingParticles } from '@/components/BackgroundEffects';
import SectionTitle from '@/components/SectionTitle';

export default function PrivacyHubPage() {
  const { t, localizeHref } = useTranslation();
  const [activeStep, setActiveStep] = useState(1);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // Trust badges grid details
  const trustBadgesList = [
    {
      icon: <Cpu className="w-6 h-6 text-blue-600 dark:text-blue-400" />,
      title: t('privacy_hub.badges.on_device_title', 'Browser-Native Processing'),
      desc: t('privacy_hub.badges.on_device_desc', 'All PDF tools, image converters, crop editors, and calculators process files 100% locally on your machine.'),
    },
    {
      icon: <Lock className="w-6 h-6 text-purple-600 dark:text-purple-400" />,
      title: t('privacy_hub.badges.no_account_title', 'No Account Required'),
      desc: t('privacy_hub.badges.no_account_desc', 'Use our utilities immediately without signups, email walls, or mandatory personal data collection.'),
    },
    {
      icon: <WifiOff className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />,
      title: t('privacy_hub.badges.offline_title', 'Offline Capable'),
      desc: t('privacy_hub.badges.offline_desc', 'Core document and image tools keep running smoothly even if you disconnect from the internet after page load.'),
    },
    {
      icon: <Code className="w-6 h-6 text-amber-600 dark:text-yellow-400" />,
      title: t('privacy_hub.badges.wasm_title', 'WASM Sandboxed'),
      desc: t('privacy_hub.badges.wasm_desc', 'Local compilation modules execute in isolated browser threads for maximum security.'),
    },
    {
      icon: <EyeOff className="w-6 h-6 text-pink-600 dark:text-pink-400" />,
      title: t('privacy_hub.badges.zero_logs_title', 'Zero Document Logging'),
      desc: t('privacy_hub.badges.zero_logs_desc', 'We do not log, track, or save your document contents, file names, or private inputs to any database.'),
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />,
      title: t('privacy_hub.badges.regulatory_title', 'Privacy-First Architecture'),
      desc: t('privacy_hub.badges.regulatory_desc', 'Built with strict data minimization principles, helping users maintain full data sovereignty.'),
    }
  ];

  // Pipeline execution steps
  const pipelineSteps = [
    {
      id: 1,
      num: "01",
      title: t('privacy_hub.pipeline.step1_title', 'Local Memory Loading'),
      short: "Tab Memory",
      desc: t('privacy_hub.pipeline.step1_desc', 'When you select files for local document tools, your browser loads them directly into tab memory (RAM). Your files are not transmitted across the network.'),
      glow: "from-blue-500/20 to-transparent"
    },
    {
      id: 2,
      num: "02",
      title: t('privacy_hub.pipeline.step2_title', 'Client-Side Engine Load'),
      short: "WASM / JS Engine",
      desc: t('privacy_hub.pipeline.step2_desc', 'Processing scripts (compiled WebAssembly, Canvas, and JavaScript modules) run on your CPU/GPU to parse, crop, resize, or compress your files.'),
      glow: "from-purple-500/20 to-transparent"
    },
    {
      id: 3,
      num: "03",
      title: t('privacy_hub.pipeline.step3_title', 'Sandboxed Isolation'),
      short: "Isolated Memory",
      desc: t('privacy_hub.pipeline.step3_desc', 'All processing occurs within the isolated sandbox of your web browser tab, isolated from other web tabs and server databases.'),
      glow: "from-emerald-500/20 to-transparent"
    },
    {
      id: 4,
      num: "04",
      title: t('privacy_hub.pipeline.step4_title', 'Direct File Save'),
      short: "Instant Save",
      desc: t('privacy_hub.pipeline.step4_desc', 'Processed outputs are generated in browser RAM and saved directly to your device. No cloud storage queues or file retention involved.'),
      glow: "from-yellow-500/20 to-transparent"
    }
  ];

  // Table rows comparisons
  const comparisonRows = [
    {
      feature: t('privacy_hub.comparison.f1_name', 'Document Data Transmission'),
      toolwala: t('privacy_hub.comparison.f1_toolwala', '0% Uploaded for local document tools (Stays in browser RAM)'),
      traditional: t('privacy_hub.comparison.f1_traditional', '100% Uploaded to remote servers'),
      secure: true
    },
    {
      feature: t('privacy_hub.comparison.f2_name', 'Core Execution Method'),
      toolwala: t('privacy_hub.comparison.f2_toolwala', 'Browser-Native WebAssembly / Client CPU'),
      traditional: t('privacy_hub.comparison.f2_traditional', 'Remote server farm execution'),
      secure: true
    },
    {
      feature: t('privacy_hub.comparison.f3_name', 'Offline Functionality'),
      toolwala: t('privacy_hub.comparison.f3_toolwala', 'Supported for all document & image tools after page load'),
      traditional: t('privacy_hub.comparison.f3_traditional', 'Requires active internet & server connection'),
      secure: true
    },
    {
      feature: t('privacy_hub.comparison.f4_name', 'Database Logging & File Retention'),
      toolwala: t('privacy_hub.comparison.f4_toolwala', 'Zero file database retention (Cleared when tab closes)'),
      traditional: t('privacy_hub.comparison.f4_traditional', 'Stored in server temp folders for hours or days'),
      secure: true
    },
    {
      feature: t('privacy_hub.comparison.f5_name', 'Usage & Paywall Barriers'),
      toolwala: t('privacy_hub.comparison.f5_toolwala', 'Free & Unrestricted (Limited only by hardware)'),
      traditional: t('privacy_hub.comparison.f5_traditional', 'Strict file size & daily limit paywalls'),
      secure: true
    },
    {
      feature: t('privacy_hub.comparison.f6_name', 'Server Data Leak Risk'),
      toolwala: t('privacy_hub.comparison.f6_toolwala', 'Zero server file exposure for client-side utilities'),
      traditional: t('privacy_hub.comparison.f6_traditional', 'Exposed to cloud breaches & database leaks'),
      secure: true
    }
  ];

  const privacyFaqs = [
    {
      q: t('privacy_hub.faq.q1', 'How does ToolWala process document & image files without uploading them?'),
      a: t('privacy_hub.faq.a1', 'ToolWala uses client-side WebAssembly (WASM) and HTML5 engines. Instead of sending your documents to a server, the processing scripts run directly in your browser. Your files remain on your device.')
    },
    {
      q: t('privacy_hub.faq.q2', 'Do all tools work offline?'),
      a: t('privacy_hub.faq.a2', 'All document, PDF, image resizer, cropper, and calculator tools work 100% offline once the page has loaded. Generative AI tools (like AI voice synthesis or logo generation) require internet access to process prompts via secure, ephemeral API endpoints.')
    },
    {
      q: t('privacy_hub.faq.q3', 'Does ToolWala store any records of my files or data?'),
      a: t('privacy_hub.faq.a3', 'No. Files processed by client-side tools stay in your browser tab RAM and are discarded when you close the tab. For cloud AI tools, inputs are processed in volatile memory for real-time response generation and are not retained in any database.')
    },
    {
      q: t('privacy_hub.faq.q4', 'Are these privacy practices compliant with GDPR and CCPA?'),
      a: t('privacy_hub.faq.a4', 'Yes. By minimizing data collection and executing document tools locally on your device, ToolWala complies with global privacy principles including GDPR and CCPA. You maintain full data sovereignty.')
    }
  ];

  const currentStep = pipelineSteps.find(s => s.id === activeStep) || pipelineSteps[0];

  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC] dark:bg-[#030712] text-slate-900 dark:text-white relative overflow-hidden font-sans transition-colors duration-250">
      <MeshGradient />
      <FloatingParticles />

      {/* Hero Section */}
      <section className="relative pt-8 sm:pt-10 pb-16 sm:pb-20 overflow-hidden">
        <div className="container mx-auto px-6 lg:px-8 max-w-7xl text-center relative z-10">
          
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-xs font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-3 sm:mb-4 shadow-sm"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{t('privacy_hub.badge_title', 'PRIVACY-FIRST ASSURANCE')}</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight uppercase leading-[0.95] max-w-5xl mx-auto mb-3 sm:mb-4 text-slate-900 dark:text-white"
          >
            {t('privacy_hub.hero_title', 'Privacy by Default.')} <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600 dark:from-blue-400 dark:via-indigo-400 dark:to-emerald-400">
              Security by Design.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-slate-600 dark:text-gray-400 text-sm sm:text-base md:text-lg max-w-3xl mx-auto leading-relaxed mb-10 font-medium"
          >
            {t('privacy_hub.hero_desc', 'Unlike traditional web utilities that upload your sensitive documents to remote servers, ToolWala processes everything directly on your device. Zero cloud uploads, zero latency, complete peace of mind.')}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="flex justify-center"
          >
            <Link
              href={localizeHref('/tools')}
              className="group inline-flex items-center gap-2.5 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl text-xs font-black uppercase tracking-widest text-white shadow-[0_0_30px_rgba(37,99,235,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <span>{t('privacy_hub.cta_explore', 'Explore Secure Utilities')}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Trust Badges Grid */}
      <section className="py-16 relative">
        <div className="container mx-auto px-6 lg:px-8 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trustBadgesList.map((badge, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -4 }}
                className="p-8 rounded-[2.5rem] bg-white dark:bg-white/[0.01] border border-slate-200/80 dark:border-white/5 backdrop-blur-md shadow-xl dark:shadow-none transition-all flex flex-col items-start gap-4 relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 p-6 opacity-[0.03] dark:opacity-[0.02] group-hover:opacity-[0.08] transition-opacity">
                  <ShieldCheck className="w-24 h-24 text-slate-900 dark:text-white" />
                </div>
                <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 flex items-center justify-center shadow-xs">
                  {badge.icon}
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-wider">{badge.title}</h3>
                <p className="text-xs text-slate-600 dark:text-gray-500 font-semibold leading-relaxed group-hover:text-slate-900 dark:group-hover:text-gray-400 transition-colors">
                  {badge.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Sandbox Pipeline Explainer */}
      <section className="py-24 border-t border-slate-200/80 dark:border-white/5 bg-slate-100/50 dark:bg-black/10 relative transition-colors duration-250">
        <div className="container mx-auto px-6 lg:px-8 max-w-6xl">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <SectionTitle 
              title={t('privacy_hub.pipeline.title', 'On-Device Sandbox Pipeline')} 
              subtitle={t('privacy_hub.pipeline.subtitle', 'Click through each stage to see how files are isolated and processed entirely inside your active tab context.')}
              centered
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Steps Selector list */}
            <div className="lg:col-span-5 space-y-4">
              {pipelineSteps.map((step) => {
                const isActive = step.id === activeStep;
                return (
                  <button
                    key={step.id}
                    onClick={() => setActiveStep(step.id)}
                    className={`w-full p-6 rounded-[2rem] border text-left transition-all flex items-center gap-5 cursor-pointer relative overflow-hidden group
                      ${isActive 
                        ? 'bg-blue-600/10 border-blue-500/40 shadow-md shadow-blue-500/10' 
                        : 'bg-white dark:bg-white/[0.01] border-slate-200/80 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10 hover:bg-slate-50 dark:hover:bg-white/[0.02] shadow-sm'
                      }
                    `}
                  >
                    <div className={`w-10 h-10 rounded-xl font-black text-xs flex items-center justify-center border transition-all
                      ${isActive 
                        ? 'bg-blue-600 border-blue-500 text-white' 
                        : 'bg-slate-100 dark:bg-white/5 border-slate-200/80 dark:border-white/10 text-slate-500 dark:text-gray-500 group-hover:text-slate-900 dark:group-hover:text-white'
                      }
                    `}>
                      {step.num}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className={`text-sm font-black uppercase tracking-wider transition-colors
                        ${isActive ? 'text-blue-600 dark:text-white' : 'text-slate-700 dark:text-gray-400 group-hover:text-slate-900 dark:group-hover:text-white'}
                      `}>
                        {step.title}
                      </h4>
                      <p className="text-[10px] text-slate-500 dark:text-gray-500 font-bold uppercase tracking-widest mt-0.5">
                        {step.short}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Detailed description detail card */}
            <div className="lg:col-span-7 h-80 flex items-stretch">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="flex-1 p-8 sm:p-12 rounded-[3rem] bg-white dark:bg-gradient-to-br dark:from-white/[0.02] dark:to-transparent border border-slate-200/80 dark:border-white/5 shadow-xl dark:shadow-none relative overflow-hidden flex flex-col justify-center"
                >
                  <div className={`absolute top-0 right-0 w-80 h-80 bg-gradient-to-br ${currentStep.glow} blur-[80px] -z-10`} />
                  
                  <div className="flex items-center gap-4 mb-6">
                    <span className="text-5xl sm:text-6xl font-black text-blue-600/20 dark:text-blue-500/25 tracking-tighter leading-none">
                      {currentStep.num}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white leading-snug">
                      {currentStep.title}
                    </h3>
                  </div>
                  
                  <p className="text-sm sm:text-base text-slate-600 dark:text-gray-400 leading-relaxed font-medium">
                    {currentStep.desc}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

          </div>
        </div>
      </section>

      {/* Comparison Section (ToolWala vs Cloud Utilities) */}
      <section className="py-24 border-t border-slate-200/80 dark:border-white/5 relative">
        <div className="container mx-auto px-6 lg:px-8 max-w-5xl">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <SectionTitle 
              title={t('privacy_hub.comparison.title', 'How ToolWala Redefines Trust')} 
              subtitle={t('privacy_hub.comparison.subtitle', 'A direct comparison between browser-native processing and traditional cloud-hosted software.')}
              centered
            />
          </div>

          <div className="rounded-[3rem] border border-slate-200/80 dark:border-white/5 overflow-hidden backdrop-blur-md bg-white dark:bg-white/[0.01] shadow-xl dark:shadow-none">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b border-slate-200/80 dark:border-white/5 bg-slate-100/80 dark:bg-white/5 text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-gray-400">
                    <th className="p-6 font-black">{t('privacy_hub.comparison.col_feature', 'Security Feature')}</th>
                    <th className="p-6 font-black text-blue-600 dark:text-blue-400">{t('privacy_hub.comparison.col_toolwala', 'ToolWala AI')}</th>
                    <th className="p-6 font-black">{t('privacy_hub.comparison.col_traditional', 'Cloud Online Tools')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/80 dark:divide-white/5">
                  {comparisonRows.map((row, index) => (
                    <tr key={index} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01] transition-colors">
                      <td className="p-6 text-xs sm:text-sm font-bold text-slate-900 dark:text-gray-300">{row.feature}</td>
                      <td className="p-6">
                        <div className="flex items-center gap-2.5">
                          <div className="w-5 h-5 rounded-full bg-emerald-500/15 flex items-center justify-center text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex-shrink-0">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-xs sm:text-sm text-emerald-700 dark:text-emerald-400 font-extrabold">{row.toolwala}</span>
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="flex items-center gap-2.5">
                          <div className="w-5 h-5 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 dark:text-red-400 border border-red-500/20 flex-shrink-0">
                            <X className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-xs sm:text-sm text-slate-500 dark:text-gray-500 font-semibold">{row.traditional}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Security FAQs Section */}
      <section className="py-24 border-t border-slate-200/80 dark:border-white/5 bg-slate-100/50 dark:bg-black/10 relative transition-colors duration-250">
        <div className="container mx-auto px-6 lg:px-8 max-w-4xl">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4 border border-blue-200 dark:border-blue-500/20 shadow-sm">
              <HelpCircle className="w-3.5 h-3.5 animate-pulse" />
              <span>{t('article.supportCenter', 'Support Center')}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-slate-900 dark:text-white leading-none">
              Security & Privacy FAQ
            </h2>
          </div>

          <div className="space-y-4">
            {privacyFaqs.map((faq, index) => {
              const isOpen = activeFaq === index;
              return (
                <div 
                  key={index}
                  className={`border transition-all duration-300 rounded-[1.5rem] overflow-hidden 
                    ${isOpen 
                      ? 'bg-white dark:bg-white/[0.02] border-blue-500/30 shadow-md shadow-blue-500/10' 
                      : 'bg-white dark:bg-white/[0.01] border-slate-200/80 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10 shadow-sm'
                    }
                  `}
                >
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : index)}
                    className="w-full p-6 flex items-center justify-between text-left hover:bg-slate-50/50 dark:hover:bg-white/[0.01] transition-colors cursor-pointer"
                  >
                    <span className={`text-base font-black tracking-tight pr-6 transition-colors ${isOpen ? 'text-blue-600 dark:text-blue-400' : 'text-slate-900 dark:text-white'}`}>
                      {faq.q}
                    </span>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center border transition-all duration-300 flex-shrink-0
                      ${isOpen ? 'bg-blue-600 border-blue-600 text-white' : 'bg-slate-100 dark:bg-white/5 border-slate-200/80 dark:border-white/10 text-slate-500 dark:text-gray-500'}`}
                    >
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
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
                        <div className="px-6 pb-6 text-slate-600 dark:text-gray-400 font-semibold leading-relaxed text-sm font-sans border-t border-slate-200/80 dark:border-white/5 pt-4">
                          {faq.a}
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

      {/* Global CTA Section */}
      <section className="py-24 relative overflow-hidden border-t border-slate-200/80 dark:border-white/5">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[140px] pointer-events-none" />
        <div className="container mx-auto px-6 lg:px-8 max-w-4xl text-center relative z-10">
          <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-slate-900 dark:text-white mb-6">
            Ready to Experience True Data Sovereignty?
          </h2>
          <p className="text-slate-600 dark:text-gray-400 font-medium leading-relaxed max-w-2xl mx-auto mb-10 text-sm sm:text-base">
            {t('privacy_hub.cta_desc', 'Start using 50+ browser-native, secure, and fast utilities. No account registrations, no email requirements.')}
          </p>
          <Link
            href={localizeHref('/tools')}
            className="group inline-flex items-center gap-2 px-9 py-4.5 bg-slate-900 text-white dark:bg-white dark:text-black rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg active:scale-98"
          >
            <span>Launch Utilities Directory</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>
    </div>
  );
}
