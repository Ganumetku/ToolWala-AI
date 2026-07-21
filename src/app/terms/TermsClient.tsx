"use client";

import SectionTitle from '@/components/SectionTitle';
import { FileText, Scale, AlertCircle, RefreshCcw, ShieldAlert, Cpu, UserCheck, Gavel } from 'lucide-react';
import { useTranslation } from '@/components/I18nContext';

export default function TermsClient() {
  const { t } = useTranslation();

  return (
    <div className="bg-[#F8FAFC] dark:bg-[#030712] min-h-screen py-24 relative overflow-hidden font-sans transition-colors duration-250">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-blue-500/5 blur-[120px] -z-10" />
      
      <div className="mx-auto max-w-5xl px-6 lg:px-8 relative z-10">
        <SectionTitle 
          title={t('terms.title', 'Terms of Service')} 
          subtitle={t('terms.last_updated', 'Last updated: May 16, 2026')}
          centered
          as="h1"
        />
        
        <div className="mt-20 space-y-16">
          {/* Agreement Summary */}
          <div className="bg-white dark:bg-slate-900/60 backdrop-blur-xl p-8 sm:p-10 rounded-[2.5rem] border border-gray-200 dark:border-white/10 shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-500/20 shrink-0">
                <Gavel className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight uppercase">{t('terms.agreement_title', 'User Agreement')}</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300 font-medium leading-relaxed text-base sm:text-lg">
              {t('terms.agreement_desc', 'By accessing or using ToolWala AI, you signify your agreement to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services. We provide a platform for AI-powered productivity, and these rules ensure it remains safe and effective for everyone.')}
            </p>
          </div>

          {/* Key Terms Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <TermCard 
              icon={<Cpu className="w-7 h-7" />}
              title={t('terms.license_title', 'Usage License')}
              desc={t('terms.license_desc', 'We grant you a personal, non-exclusive, non-transferable license to use our tools. Commercial use is permitted for outputs generated (e.g., resumes, logos), but redistribution of our underlying software or API access is strictly prohibited.')}
            />
            <TermCard 
              icon={<ShieldAlert className="w-7 h-7" />}
              title={t('terms.conduct_title', 'Prohibited Conduct')}
              desc={t('terms.conduct_desc', 'You agree not to use our tools for any illegal purposes, including the generation of harmful, deceptive, or infringing content. Automated scraping or bot-driven requests to our platform are strictly forbidden.')}
            />
            <TermCard 
              icon={<UserCheck className="w-7 h-7" />}
              title={t('terms.ownership_title', 'Content Ownership')}
              desc={t('terms.ownership_desc', 'You retain 100% of the intellectual property rights to the content you generate using our tools. ToolWala AI does not claim ownership or license over your original creations or processed data.')}
            />
            <TermCard 
              icon={<RefreshCcw className="w-7 h-7" />}
              title={t('terms.modifications_title', 'Service Modifications')}
              desc={t('terms.modifications_desc', 'As a platform in continuous development, we reserve the right to modify, suspend, or discontinue any feature or tool without prior notice. We strive for stability but do not guarantee 100% uptime.')}
            />
          </div>

          {/* Detailed Clauses */}
          <div className="space-y-12">
            <DetailedClause 
              icon={<AlertCircle className="w-6 h-6" />}
              title={t('terms.accuracy_title', 'AI Output Accuracy')}
              content={t('terms.accuracy_desc', 'ToolWala AI leverages advanced artificial intelligence. While we aim for high accuracy, AI models can produce incorrect or biased information. Users are responsible for verifying all outputs before use in professional or legal contexts.')}
            />

            <DetailedClause 
              icon={<Scale className="w-6 h-6" />}
              title={t('terms.liability_title', 'Limitation of Liability')}
              content={t('terms.liability_desc', 'ToolWala AI and its creators shall not be liable for any indirect, incidental, or consequential damages resulting from the use or inability to use our tools, including loss of data or business interruption.')}
            />

            <DetailedClause 
              icon={<FileText className="w-6 h-6" />}
              title={t('terms.beta_title', 'Beta Features')}
              content={t('terms.beta_desc', "Some tools are marked as 'Beta'. These are provided for testing purposes and may contain bugs. Use of beta features is at the user's own risk.")}
            />
          </div>

          {/* Termination & Contact */}
          <div className="bg-white dark:bg-slate-900/60 backdrop-blur-xl p-8 sm:p-10 rounded-[2.5rem] border border-gray-200 dark:border-white/10 space-y-6 text-gray-600 dark:text-gray-300 font-medium shadow-sm">
             <h4 className="text-gray-900 dark:text-white font-black uppercase tracking-widest text-sm">{t('terms.law_title', 'Governing Law')}</h4>
             <p className="text-sm leading-relaxed">{t('terms.law_desc', 'These terms are governed by and construed in accordance with international digital service standards. Any disputes shall be handled through arbitration before legal proceedings.')}</p>
             <p className="pt-4 border-t border-gray-100 dark:border-white/10 text-gray-500 dark:text-gray-400 text-xs font-semibold">{t('terms.questions', 'Questions about these terms? Contact us at {email}').replace('{email}', 'developtechx@gmail.com')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function TermCard({ icon, title, desc }: { icon: any; title: string; desc: string }) {
  return (
    <div className="bg-white dark:bg-slate-900/60 backdrop-blur-xl p-8 sm:p-10 rounded-[2.5rem] border border-gray-200 dark:border-white/10 space-y-6 hover:border-blue-500/40 dark:hover:border-blue-500/40 transition-all duration-300 group shadow-sm hover:shadow-md">
      <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-500/20 group-hover:bg-blue-600 group-hover:text-white dark:group-hover:bg-blue-500 dark:group-hover:text-white transition-all duration-300">
        {icon}
      </div>
      <h4 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">{title}</h4>
      <p className="text-gray-600 dark:text-gray-300 leading-relaxed font-medium text-base">{desc}</p>
    </div>
  );
}

function DetailedClause({ icon, title, content }: { icon: any; title: string; content: string }) {
  return (
    <div className="flex gap-6 sm:gap-8 group">
      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-500/20 group-hover:bg-blue-600 group-hover:text-white dark:group-hover:bg-blue-500 dark:group-hover:text-white transition-all">
        {icon}
      </div>
      <div className="space-y-3 text-left">
        <h4 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-wider">{title}</h4>
        <p className="text-gray-600 dark:text-gray-300 font-medium leading-relaxed">{content}</p>
      </div>
    </div>
  );
}
