"use client";

import SectionTitle from '@/components/SectionTitle';
import { ShieldCheck, Lock, Trash2, EyeOff, Database, Globe, Cookie, UserCheck, Mail } from 'lucide-react';
import { useTranslation } from '@/components/I18nContext';

export default function PrivacyPolicyClient() {
  const { t } = useTranslation();

  return (
    <div className="bg-[#030712] min-h-screen py-24 relative overflow-hidden font-sans">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-blue-600/5 blur-[120px] -z-10" />
      
      <div className="mx-auto max-w-5xl px-6 lg:px-8 relative z-10">
        <SectionTitle 
          title={t('privacy.title', 'Privacy Policy')} 
          subtitle={t('privacy.effective_date', 'Effective Date: May 16, 2026')}
          centered
          as="h1"
        />
        
        <div className="mt-20 space-y-16">
          {/* Introduction */}
          <div className="glass p-10 rounded-[3rem] border border-white/5 relative overflow-hidden group">
            <div className="absolute inset-0 bg-blue-600/5 blur-[80px] -z-10" />
            <div className="flex items-center gap-4 mb-8">
              <ShieldCheck className="w-10 h-10 text-blue-500" />
              <h3 className="text-2xl font-black text-white tracking-tight uppercase">{t('privacy.commitment_title', 'Privacy Commitment')}</h3>
            </div>
            <p className="text-gray-400 font-medium leading-relaxed text-lg">
              {t('privacy.commitment_desc', 'At ToolWala AI, privacy is at the core of our engineering. We believe your data belongs to you. Our platform is designed to provide high-performance AI utilities while maintaining the highest standards of data protection and transparency.')}
            </p>
          </div>

          {/* Grid of Policy Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <PolicyCard 
              icon={<Lock />}
              title={t('privacy.browser_first_title', 'Browser-First Processing')}
              desc={t('privacy.browser_first_desc', 'Most of our tools utilize WebAssembly to process data entirely on your local device. Your images, text, and files never leave your browser unless explicitly required for cloud-based AI generation.')}
            />
            <PolicyCard 
              icon={<Database />}
              title={t('privacy.collection_title', 'Data Collection')}
              desc={t('privacy.collection_desc', 'We do not require account creation for basic tool usage. We only collect minimal information when you interact with our contact forms or opt-in for our premium waitlist.')}
            />
            <PolicyCard 
              icon={<Trash2 />}
              title={t('privacy.stateless_title', 'Stateless Architecture')}
              desc={t('privacy.stateless_desc', 'For tools that require our cloud AI models, data is processed in volatile memory and immediately purged upon completion. We do not store your original inputs or outputs.')}
            />
            <PolicyCard 
              icon={<EyeOff />}
              title={t('privacy.no_training_title', 'No Model Training')}
              desc={t('privacy.no_training_desc', 'Your data is never used to train, retrain, or improve our AI models. We use enterprise-grade APIs that guarantee data isolation for all user sessions.')}
            />
          </div>

          {/* Detailed Sections */}
          <div className="space-y-12">
            <DetailedSection 
              icon={<Globe />}
              title={t('privacy.analytics_title', 'Analytics and Tracking')}
              content={t('privacy.analytics_desc', 'We use privacy-centric analytics (like Google Analytics with IP anonymization) to understand site traffic and improve our tools. We do not track individual user behavior or share data with advertising networks.')}
            />
            
            <DetailedSection 
              icon={<Cookie />}
              title={t('privacy.cookies_title', 'Cookie Usage')}
              content={t('privacy.cookies_desc', 'We use essential cookies to remember your tool preferences (like dark mode or language settings). These cookies are functional only and do not contain personal identifiers.')}
            />

            <DetailedSection 
              icon={<UserCheck />}
              title={t('privacy.rights_title', 'User Rights (GDPR & CCPA)')}
              content={t('privacy.rights_desc', "Regardless of your location, you have the right to access, rectify, or delete any personal information we may hold. Since we store minimal data, most requests are handled instantly by clearing your browser's local storage.")}
            />
          </div>

          {/* Contact & Legal */}
          <div className="glass p-10 rounded-[3rem] border border-white/5 space-y-8 bg-white/[0.01]">
            <div className="flex items-center gap-4">
              <Mail className="w-6 h-6 text-blue-500" />
              <h4 className="text-white font-black uppercase tracking-widest text-sm">{t('privacy.inquiries_title', 'Privacy Inquiries')}</h4>
            </div>
            <p className="text-gray-400 font-medium leading-relaxed">
              {t('privacy.inquiries_desc', 'For any privacy-related questions, data deletion requests, or concerns about our processing methods, please contact our dedicated privacy team at:')}
            </p>
            <div className="flex items-center gap-3 text-blue-400 font-black tracking-wider text-xl">
              developtechx@gmail.com
            </div>
            <p className="text-xs text-gray-600 font-bold uppercase tracking-widest pt-4">
              © 2026 ToolWala AI. All Rights Reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function PolicyCard({ icon, title, desc }: { icon: any; title: string; desc: string }) {
  return (
    <div className="glass p-10 rounded-[2.5rem] border border-white/5 space-y-6 hover:border-blue-500/30 transition-all group">
      <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-blue-500 border border-white/10 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
        {icon}
      </div>
      <h4 className="text-xl font-black text-white uppercase tracking-tight">{title}</h4>
      <p className="text-gray-500 leading-relaxed font-medium">{desc}</p>
    </div>
  );
}

function DetailedSection({ icon, title, content }: { icon: any; title: string; content: string }) {
  return (
    <div className="flex gap-8 group">
      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-gray-500 border border-white/10 group-hover:text-blue-500 group-hover:border-blue-500/50 transition-all">
        {icon}
      </div>
      <div className="space-y-4">
        <h4 className="text-lg font-black text-white uppercase tracking-wider">{title}</h4>
        <p className="text-gray-400 font-medium leading-relaxed">{content}</p>
      </div>
    </div>
  );
}
