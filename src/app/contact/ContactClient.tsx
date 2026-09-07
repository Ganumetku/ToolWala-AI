"use client";

import { useState } from 'react';
import { Mail, ShieldCheck, Clock, Globe, Copy, Check, MessageSquareText } from 'lucide-react';
import ContactForm from './ContactForm';
import { useTranslation } from '@/components/I18nContext';
import { toast } from 'sonner';

export default function ContactClient() {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('developtechx@gmail.com');
    setCopied(true);
    toast.success(t('contact.copied_toast', 'Email address copied to clipboard!'));
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-[#F8FAFC] dark:bg-[#030712] min-h-screen pt-8 sm:pt-10 pb-20 relative overflow-hidden font-sans transition-colors duration-250">
      {/* Background Glow Accents */}
      <div className="absolute top-0 right-0 w-full h-[500px] bg-gradient-to-b from-blue-500/10 via-indigo-500/5 to-transparent blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600/5 blur-[100px] pointer-events-none -z-10" />

      <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white mb-3 uppercase leading-tight">
            {t('contact.title', 'Get in Touch')}
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-gray-400 font-medium leading-relaxed">
            {t('contact.subtitle', 'Have questions or feedback? Our team is here to help you scale your productivity.')}
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
          
          {/* Left Side: Contact Info Card */}
          <div className="lg:col-span-5 flex">
            <div className="w-full bg-white dark:bg-slate-900/60 backdrop-blur-xl p-7 sm:p-9 rounded-[2.5rem] border border-slate-200/80 dark:border-white/10 flex flex-col justify-between relative overflow-hidden shadow-xl shadow-slate-200/50 dark:shadow-2xl dark:shadow-black/50">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl -z-10" />
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
                    {t('contact.channels_title', 'Contact Channels')}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300 text-sm font-medium leading-relaxed">
                    {t('contact.channels_desc', 'We aim to respond to all inquiries within 24-48 business hours. You can reach us directly via email or submit the form.')}
                  </p>
                </div>

                {/* Standout Primary Direct Email Card */}
                <div className="p-5 rounded-2xl bg-blue-50/80 dark:bg-blue-600/10 border border-blue-200/80 dark:border-blue-500/20 space-y-3 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 text-xs font-black uppercase tracking-wider">
                      <Mail className="w-4 h-4" />
                      <span>{t('contact.email_card_title', 'Official Email Support')}</span>
                    </div>
                    <button 
                      type="button"
                      onClick={handleCopyEmail}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white dark:bg-white/10 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-500 text-slate-600 dark:text-gray-300 text-xs font-bold border border-slate-200/80 dark:border-white/10 transition-all cursor-pointer shadow-2xs"
                      title="Copy email address"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? t('common.copied', 'Copied!') : t('common.copy', 'Copy')}</span>
                    </button>
                  </div>

                  <a 
                    href="mailto:developtechx@gmail.com" 
                    className="text-lg sm:text-xl font-black text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors block break-all tracking-tight"
                  >
                    developtechx@gmail.com
                  </a>

                  <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                    {t('contact.email_card_desc', 'Single direct inbox covering all inquiries & departments:')}
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/90 dark:bg-white/5 border border-slate-200/70 dark:border-white/10 text-[11px] font-bold text-slate-700 dark:text-slate-300 shadow-2xs">
                      🛠️ {t('contact.general_support', 'General Support')}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/90 dark:bg-white/5 border border-slate-200/70 dark:border-white/10 text-[11px] font-bold text-slate-700 dark:text-slate-300 shadow-2xs">
                      🤝 {t('contact.business_inquiries', 'Business & API')}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/90 dark:bg-white/5 border border-slate-200/70 dark:border-white/10 text-[11px] font-bold text-slate-700 dark:text-slate-300 shadow-2xs">
                      ⚖️ {t('contact.legal_privacy', 'Legal & Privacy')}
                    </span>
                  </div>
                </div>

                {/* Complementary Support Channels */}
                <div className="space-y-4 pt-1">
                  <ContactItem 
                    icon={<MessageSquareText className="w-5 h-5" />}
                    title={t('contact.form_inquiry_title', 'Online Priority Form')}
                    value={t('contact.form_inquiry_value', 'Direct Web Message')}
                    desc={t('contact.form_inquiry_desc', 'Fill out the form on the right for automatic ticket routing to our engineering team.')}
                  />
                  <ContactItem 
                    icon={<ShieldCheck className="w-5 h-5" />}
                    title={t('contact.privacy_guarantee_title', 'Data Privacy & Security')}
                    value={t('contact.privacy_guarantee_value', '100% Client-Side Protection')}
                    desc={t('contact.privacy_guarantee_desc', 'Your files are processed securely in your browser and never retained on any server.')}
                  />
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-100 dark:border-white/10 grid grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 flex-shrink-0" /> 
                    <span>{t('contact.response_time', 'Response Time')}</span>
                  </div>
                  <p className="text-slate-900 dark:text-white font-black text-sm">~24 Hours</p>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <Globe className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 flex-shrink-0" /> 
                    <span>{t('contact.availability', 'Availability')}</span>
                  </div>
                  <p className="text-slate-900 dark:text-white font-black text-sm">{t('contact.avail_days', 'Mon - Fri')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Contact Form Card */}
          <div className="lg:col-span-7 flex">
            <div className="w-full bg-white dark:bg-slate-900/60 backdrop-blur-xl rounded-[2.5rem] border border-slate-200/80 dark:border-white/10 overflow-hidden shadow-xl shadow-slate-200/50 dark:shadow-2xl dark:shadow-black/50">
              <ContactForm />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function ContactItem({ icon, title, value, desc }: { icon: any; title: string; value: string; desc: string }) {
  return (
    <div className="flex gap-4 group items-start">
      <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-500/20 group-hover:bg-blue-600 group-hover:text-white dark:group-hover:bg-blue-500 dark:group-hover:text-white transition-all duration-300 shadow-2xs">
        {icon}
      </div>
      <div className="space-y-0.5 min-w-0">
        <h4 className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">{title}</h4>
        <p className="text-sm sm:text-base font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">{value}</p>
        <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}
