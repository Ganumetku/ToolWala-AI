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
      icon: <Cpu className="w-6 h-6 text-blue-400" />,
      title: t('privacy_hub.badges.on_device_title', '100% On-Device'),
      desc: t('privacy_hub.badges.on_device_desc', 'All parsing, compressing, and editing are executed on your machine.'),
    },
    {
      icon: <Lock className="w-6 h-6 text-purple-400" />,
      title: t('privacy_hub.badges.no_account_title', 'No Account Wall'),
      desc: t('privacy_hub.badges.no_account_desc', 'Use every feature immediately without giving away your email or personal info.'),
    },
    {
      icon: <WifiOff className="w-6 h-6 text-emerald-400" />,
      title: t('privacy_hub.badges.offline_title', 'Offline Functional'),
      desc: t('privacy_hub.badges.offline_desc', 'Disconnect from the internet completely; our core tools keep running.'),
    },
    {
      icon: <Code className="w-6 h-6 text-yellow-400" />,
      title: t('privacy_hub.badges.wasm_title', 'WASM Sandboxed'),
      desc: t('privacy_hub.badges.wasm_desc', 'C++/Rust code compiled to WebAssembly runs in an isolated browser thread.'),
    },
    {
      icon: <EyeOff className="w-6 h-6 text-pink-400" />,
      title: t('privacy_hub.badges.zero_logs_title', 'Zero Telemetry & Logs'),
      desc: t('privacy_hub.badges.zero_logs_desc', 'No database logs, no tracking of document names or private data.'),
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-cyan-400" />,
      title: t('privacy_hub.badges.regulatory_title', 'GDPR & HIPAA Ready'),
      desc: t('privacy_hub.badges.regulatory_desc', 'By design, no client information is collected or processed on third-party servers.'),
    }
  ];

  // Pipeline execution steps
  const pipelineSteps = [
    {
      id: 1,
      num: "01",
      title: t('privacy_hub.pipeline.step1_title', 'Local File Import'),
      short: "Import RAM",
      desc: t('privacy_hub.pipeline.step1_desc', 'You select your files. The browser loads them into local memory (RAM) directly inside the tab. No network packets are sent to the internet.'),
      glow: "from-blue-500/20 to-transparent"
    },
    {
      id: 2,
      num: "02",
      title: t('privacy_hub.pipeline.step2_title', 'WebAssembly Load'),
      short: "WASM Engine",
      desc: t('privacy_hub.pipeline.step2_desc', 'Heavy compilation engines (written in C++ or Rust) load directly as WebAssembly (WASM) modules. They execute locally on your processor.'),
      glow: "from-purple-500/20 to-transparent"
    },
    {
      id: 3,
      num: "03",
      title: t('privacy_hub.pipeline.step3_title', 'Sandboxed Execution'),
      short: "Sandbox Tab",
      desc: t('privacy_hub.pipeline.step3_desc', 'The processing runs inside the browser\'s isolated tab thread, completely separated from other tabs and your operating system\'s files.'),
      glow: "from-emerald-500/20 to-transparent"
    },
    {
      id: 4,
      num: "04",
      title: t('privacy_hub.pipeline.step4_title', 'Native Local Download'),
      short: "Direct Save",
      desc: t('privacy_hub.pipeline.step4_desc', 'The output file is written directly from RAM back to your device. The connection is instant and requires zero server queues.'),
      glow: "from-yellow-500/20 to-transparent"
    }
  ];

  // Table rows comparisons
  const comparisonRows = [
    {
      feature: t('privacy_hub.comparison.f1_name', 'Data Transmission'),
      toolwala: t('privacy_hub.comparison.f1_toolwala', '0% Uploaded (Stays in local RAM)'),
      traditional: t('privacy_hub.comparison.f1_traditional', '100% Uploaded to remote databases'),
      secure: true
    },
    {
      feature: t('privacy_hub.comparison.f2_name', 'Execution Method'),
      toolwala: t('privacy_hub.comparison.f2_toolwala', 'Browser-Native WebAssembly / CPU'),
      traditional: t('privacy_hub.comparison.f2_traditional', 'Remote server farm execution'),
      secure: true
    },
    {
      feature: t('privacy_hub.comparison.f3_name', 'Offline Mode'),
      toolwala: t('privacy_hub.comparison.f3_toolwala', 'Fully Supported (Works offline)'),
      traditional: t('privacy_hub.comparison.f3_traditional', 'Processing Works Offline After Initial Page Load'),
      secure: true
    },
    {
      feature: t('privacy_hub.comparison.f4_name', 'Database Logging & Retention'),
      toolwala: t('privacy_hub.comparison.f4_toolwala', 'None (Purged when you close tab)'),
      traditional: t('privacy_hub.comparison.f4_traditional', '1 hour to several days of storage logs'),
      secure: true
    },
    {
      feature: t('privacy_hub.comparison.f5_name', 'File Size & Usage Limits'),
      toolwala: t('privacy_hub.comparison.f5_toolwala', 'Unlimited (Constrained only by your system)'),
      traditional: t('privacy_hub.comparison.f5_traditional', 'Strict bandwidth/pricing paywalls'),
      secure: true
    },
    {
      feature: t('privacy_hub.comparison.f6_name', 'Security Risk Profile'),
      toolwala: t('privacy_hub.comparison.f6_toolwala', 'Zero network exposure / Zero risk'),
      traditional: t('privacy_hub.comparison.f6_traditional', 'Subject to API leaks & server hacking'),
      secure: true
    }
  ];

  const privacyFaqs = [
    {
      q: t('privacy_hub.faq.q1', 'How does ToolWala process files if they never leave my device?'),
      a: t('privacy_hub.faq.a1', 'ToolWala uses WebAssembly (WASM). Instead of sending your files to a server, we run the logic directly in your browser. Think of it like installing desktop software, except it runs instantly inside your browser tab without any installation required.')
    },
    {
      q: t('privacy_hub.faq.q2', 'Can I really use these tools without an internet connection?'),
      a: t('privacy_hub.faq.a2', 'Yes. Once you load the ToolWala page, you can disconnect from the internet and continue compressing images, merging PDFs, or humanizing text. The core tools execute 100% offline.')
    },
    {
      q: t('privacy_hub.faq.q3', 'Does ToolWala store any records of my files?'),
      a: t('privacy_hub.faq.a3', 'None. Because files stay in your browser\'s active RAM memory, they disappear completely when you close the tab. We don\'t have servers storing logs of your files, document names, or processed outputs.')
    },
    {
      q: t('privacy_hub.faq.q4', 'Are these tools compliant with enterprise standards (GDPR, CCPA)?'),
      a: t('privacy_hub.faq.a4', 'Yes, perfectly. Since there is zero data collection, zero transmission, and zero remote storage, there is no risk of violating GDPR, CCPA, or HIPAA. Data sovereignty is entirely maintained by the user.')
    }
  ];

  const currentStep = pipelineSteps.find(s => s.id === activeStep) || pipelineSteps[0];

  return (
    <div className="flex flex-col min-h-screen bg-[#030712] text-white relative overflow-hidden font-sans">
      <MeshGradient />
      <FloatingParticles />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="container mx-auto px-6 lg:px-8 max-w-7xl text-center relative z-10">
          
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-black uppercase tracking-widest text-blue-400 mb-6"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{t('privacy_hub.badge_title', 'PRIVACY-FIRST ASSURANCE')}</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight uppercase leading-[0.95] max-w-5xl mx-auto mb-6"
          >
            {t('privacy_hub.hero_title', 'Privacy by Default.')} <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-emerald-400">
              Security by Design.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-gray-400 text-sm sm:text-base md:text-lg max-w-3xl mx-auto leading-relaxed mb-10 font-medium"
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
                whileHover={{ y: -4, border: '1px solid rgba(59, 130, 246, 0.2)' }}
                className="p-8 rounded-[2.5rem] bg-white/[0.01] border border-white/5 backdrop-blur-md transition-all flex flex-col items-start gap-4 relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 p-6 opacity-[0.02] group-hover:opacity-[0.06] transition-opacity">
                  <ShieldCheck className="w-24 h-24 text-white" />
                </div>
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shadow-inner">
                  {badge.icon}
                </div>
                <h3 className="text-lg font-black text-white uppercase tracking-wider">{badge.title}</h3>
                <p className="text-xs text-gray-500 font-semibold leading-relaxed group-hover:text-gray-400 transition-colors">
                  {badge.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Sandbox Pipeline Explainer */}
      <section className="py-24 border-t border-white/5 bg-black/10 relative">
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
                        ? 'bg-blue-600/10 border-blue-500/30 shadow-[0_0_30px_rgba(59,130,246,0.05)]' 
                        : 'bg-white/[0.01] border-white/5 hover:border-white/10 hover:bg-white/[0.02]'
                      }
                    `}
                  >
                    <div className={`w-10 h-10 rounded-xl font-black text-xs flex items-center justify-center border transition-all
                      ${isActive 
                        ? 'bg-blue-600 border-blue-500 text-white' 
                        : 'bg-white/5 border-white/10 text-gray-500 group-hover:text-white'
                      }
                    `}>
                      {step.num}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className={`text-sm font-black uppercase tracking-wider transition-colors
                        ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'}
                      `}>
                        {step.title}
                      </h4>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">
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
                  className="flex-1 p-8 sm:p-12 rounded-[3rem] bg-gradient-to-br from-white/[0.02] to-transparent border border-white/5 relative overflow-hidden flex flex-col justify-center"
                >
                  <div className={`absolute top-0 right-0 w-80 h-80 bg-gradient-to-br ${currentStep.glow} blur-[80px] -z-10`} />
                  
                  <div className="flex items-center gap-4 mb-6">
                    <span className="text-5xl sm:text-6xl font-black text-blue-500/25 tracking-tighter leading-none">
                      {currentStep.num}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white leading-snug">
                      {currentStep.title}
                    </h3>
                  </div>
                  
                  <p className="text-sm sm:text-base text-gray-400 leading-relaxed font-medium">
                    {currentStep.desc}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

          </div>
        </div>
      </section>

      {/* Comparison Section (ToolWala vs Cloud Utilities) */}
      <section className="py-24 border-t border-white/5 relative">
        <div className="container mx-auto px-6 lg:px-8 max-w-5xl">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <SectionTitle 
              title={t('privacy_hub.comparison.title', 'How ToolWala Redefines Trust')} 
              subtitle={t('privacy_hub.comparison.subtitle', 'A direct comparison between browser-native processing and traditional cloud-hosted software.')}
              centered
            />
          </div>

          <div className="rounded-[3rem] border border-white/5 overflow-hidden backdrop-blur-md bg-white/[0.01]">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b border-white/5 bg-white/5 text-[10px] font-black uppercase tracking-widest text-gray-400">
                    <th className="p-6 font-black">{t('privacy_hub.comparison.col_feature', 'Security Feature')}</th>
                    <th className="p-6 font-black text-blue-400">{t('privacy_hub.comparison.col_toolwala', 'ToolWala AI')}</th>
                    <th className="p-6 font-black">{t('privacy_hub.comparison.col_traditional', 'Cloud Online Tools')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {comparisonRows.map((row, index) => (
                    <tr key={index} className="hover:bg-white/[0.01] transition-colors">
                      <td className="p-6 text-xs sm:text-sm font-bold text-gray-300">{row.feature}</td>
                      <td className="p-6">
                        <div className="flex items-center gap-2.5">
                          <div className="w-5 h-5 rounded-full bg-emerald-500/15 flex items-center justify-center text-emerald-400 border border-emerald-500/30 flex-shrink-0">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-xs sm:text-sm text-emerald-400 font-extrabold">{row.toolwala}</span>
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="flex items-center gap-2.5">
                          <div className="w-5 h-5 rounded-full bg-red-500/10 flex items-center justify-center text-red-400 border border-red-500/20 flex-shrink-0">
                            <X className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-xs sm:text-sm text-gray-500 font-semibold">{row.traditional}</span>
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
      <section className="py-24 border-t border-white/5 bg-black/10 relative">
        <div className="container mx-auto px-6 lg:px-8 max-w-4xl">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-blue-500/10 text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4">
              <HelpCircle className="w-3.5 h-3.5 animate-pulse" />
              <span>{t('article.supportCenter', 'Support Center')}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white leading-none">
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
                      ? 'bg-white/[0.02] border-blue-500/20 shadow-[0_0_30px_rgba(37,99,235,0.02)]' 
                      : 'bg-white/[0.01] border-white/5 hover:border-white/10'
                    }
                  `}
                >
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : index)}
                    className="w-full p-6 flex items-center justify-between text-left hover:bg-white/[0.01] transition-colors cursor-pointer"
                  >
                    <span className={`text-base font-black tracking-tight pr-6 transition-colors ${isOpen ? 'text-blue-400' : 'text-white'}`}>
                      {faq.q}
                    </span>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center border transition-all duration-300 flex-shrink-0
                      ${isOpen ? 'bg-blue-500 border-blue-500 text-white' : 'bg-white/5 border-white/10 text-gray-500'}`}
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
                        <div className="px-6 pb-6 text-gray-400 font-semibold leading-relaxed text-sm font-sans border-t border-white/5 pt-4">
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
      <section className="py-24 relative overflow-hidden border-t border-white/5">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[140px] pointer-events-none" />
        <div className="container mx-auto px-6 lg:px-8 max-w-4xl text-center relative z-10">
          <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight mb-6">
            Ready to Experience True Data Sovereignty?
          </h2>
          <p className="text-gray-400 font-medium leading-relaxed max-w-2xl mx-auto mb-10 text-sm sm:text-base">
            {t('privacy_hub.cta_desc', 'Start using 50+ browser-native, secure, and fast utilities. No account registrations, no email requirements.')}
          </p>
          <Link
            href={localizeHref('/tools')}
            className="group inline-flex items-center gap-2 px-9 py-4.5 bg-white text-black rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-all shadow-[0_4px_30px_rgba(255,255,255,0.1)] active:scale-98"
          >
            <span>Launch Utilities Directory</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>
    </div>
  );
}
