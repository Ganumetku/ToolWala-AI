"use client";

import SectionTitle from '@/components/SectionTitle';
import Link from 'next/link';
import { Sparkles, ShieldCheck, Zap, Heart, ChevronRight } from 'lucide-react';
import { MeshGradient } from '@/components/BackgroundEffects';
import { useTranslation } from '@/components/I18nContext';

export default function AboutClient() {
  const { t, localizeHref } = useTranslation();

  return (
    <div className="bg-[#F8FAFC] dark:bg-[#030712] min-h-screen py-24 relative overflow-hidden font-sans transition-colors duration-250">
      <MeshGradient />
      
      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div>
            <SectionTitle 
              title={t('about.title', 'About ToolWala AI')} 
              subtitle={t('about.subtitle', 'Democratizing artificial intelligence through simple, powerful, and secure browser utilities.')}
              as="h1"
            />
            
            <div className="space-y-10">
              <div className="bg-white dark:bg-slate-900/60 backdrop-blur-xl p-8 rounded-[2.5rem] border border-gray-200 dark:border-white/10 relative group shadow-sm">
                <div className="flex items-center gap-6 mb-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight uppercase">{t('about.vision_title', 'The Vision')}</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300 font-medium leading-relaxed">
                  {t('about.vision_desc', 'ToolWala AI was born from a frustration with clunky software and expensive subscriptions for simple daily tasks. We envisioned a world where premium AI tools are accessible instantly, without barriers.')}
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900/60 backdrop-blur-xl p-8 rounded-[2.5rem] border border-gray-200 dark:border-white/10 relative group shadow-sm">
                <div className="flex items-center gap-6 mb-4">
                  <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
                    <ShieldCheck className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight uppercase">{t('about.privacy_title', 'Privacy Guarantee')}</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300 font-medium leading-relaxed">
                  {t('about.privacy_desc', 'Core utilities process 100% directly in your browser. For AI-assisted features, data is transmitted over encrypted channels, processed in-memory, and immediately discarded. We never store your files, retain logs, or train models on your content.')}
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900/60 backdrop-blur-xl p-8 rounded-[2.5rem] border border-gray-200 dark:border-white/10 relative group shadow-sm">
                <div className="flex items-center gap-6 mb-4">
                  <div className="w-12 h-12 bg-amber-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20 shrink-0">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight uppercase">{t('about.speed_title', 'Built for Speed')}</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300 font-medium leading-relaxed">
                  {t('about.speed_desc', 'Our platform is optimized for performance. By leveraging WebAssembly and Edge AI, we deliver results in milliseconds, not minutes.')}
                </p>
              </div>
            </div>
            
            <div className="mt-16">
              <Link
                href={localizeHref('/tools')}
                className="inline-flex items-center gap-3 bg-blue-600 text-white px-10 py-5 rounded-[2rem] font-black uppercase tracking-widest text-sm hover:bg-blue-700 transition-all shadow-md active:scale-95"
              >
                {t('about.explore_btn', 'Explore our tools')} <ChevronRight className="w-5 h-5" />
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-10 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="relative bg-white dark:bg-slate-900/60 backdrop-blur-xl rounded-[3rem] p-8 sm:p-12 border border-gray-200 dark:border-white/10 flex flex-col items-center justify-center text-center shadow-sm">
               <div className="w-24 h-24 sm:w-28 sm:h-28 bg-blue-50 dark:bg-blue-500/10 rounded-[2rem] flex items-center justify-center mb-6 border border-blue-100 dark:border-blue-500/20">
                 <ShieldCheck className="w-12 h-12 sm:w-14 sm:h-14 text-blue-600 dark:text-blue-400" />
               </div>
               <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest border border-emerald-200 dark:border-emerald-500/20 mb-3">
                 <Sparkles className="w-3 h-3" />
                 100% Browser Native
               </div>
               <h3 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight uppercase mb-3">
                 Trusted by Thousands Across India
               </h3>
               <p className="text-gray-600 dark:text-gray-400 font-medium text-xs sm:text-sm max-w-sm mx-auto leading-relaxed mb-8">
                 From students formatting exam forms to freelancers processing invoices — all files stay 100% safe on your device.
               </p>
               
               <div className="w-full grid grid-cols-3 gap-3 pt-6 border-t border-gray-200 dark:border-white/10">
                 <div className="p-3 rounded-2xl bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5">
                   <div className="text-xl sm:text-2xl font-black text-blue-600 dark:text-blue-400">50+</div>
                   <div className="text-[9px] sm:text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-0.5">Free Tools</div>
                 </div>
                 <div className="p-3 rounded-2xl bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5">
                   <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">0</div>
                   <div className="text-[9px] sm:text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-0.5">Server Uploads</div>
                 </div>
                 <div className="p-3 rounded-2xl bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5">
                   <div className="text-xl sm:text-2xl font-black text-purple-600 dark:text-purple-400">100%</div>
                   <div className="text-[9px] sm:text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-0.5">Private RAM</div>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
