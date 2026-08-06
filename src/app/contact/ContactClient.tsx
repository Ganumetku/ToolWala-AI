"use client";

import SectionTitle from '@/components/SectionTitle';
import { Mail, ShieldCheck, Sparkles, Clock, Globe } from 'lucide-react';
import ContactForm from './ContactForm';
import { useTranslation } from '@/components/I18nContext';

export default function ContactClient() {
  const { t } = useTranslation();

  return (
    <div className="bg-[#F8FAFC] dark:bg-[#030712] min-h-screen py-16 sm:py-24 relative overflow-hidden font-sans transition-colors duration-250">
      {/* Background Glow Accents */}
      <div className="absolute top-0 right-0 w-full h-[500px] bg-gradient-to-b from-blue-500/10 via-indigo-500/5 to-transparent blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600/5 blur-[100px] pointer-events-none -z-10" />

      <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
        <SectionTitle 
          title={t('contact.title', 'Get in Touch')} 
          subtitle={t('contact.subtitle', 'Have questions or feedback? Our team is here to help you scale your productivity.')}
          centered
          as="h1"
        />
        
        <div className="mt-12 sm:mt-16 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
          
          {/* Left Side: Contact Info Card */}
          <div className="lg:col-span-5 flex">
            <div className="w-full bg-white dark:bg-slate-900/60 backdrop-blur-xl p-8 sm:p-10 rounded-[2.5rem] border border-slate-200/80 dark:border-white/10 flex flex-col justify-between relative overflow-hidden shadow-xl shadow-slate-200/50 dark:shadow-2xl dark:shadow-black/50">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl -z-10" />
              
              <div className="space-y-8">
                <div className="space-y-3">
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase">{t('contact.channels_title', 'Contact Channels')}</h3>
                  <p className="text-slate-600 dark:text-slate-300 text-sm font-medium leading-relaxed">
                    {t('contact.channels_desc', 'We aim to respond to all inquiries within 24-48 business hours. For urgent technical support, please use the support email below.')}
                  </p>
                </div>

                <div className="space-y-6">
                  <ContactItem 
                    icon={<Mail className="w-5 h-5" />}
                    title={t('contact.general_support', 'General Support')}
                    value="developtechx@gmail.com"
                    desc={t('contact.general_support_desc', 'For help with tools and general questions.')}
                  />
                  <ContactItem 
                    icon={<Sparkles className="w-5 h-5" />}
                    title={t('contact.business_inquiries', 'Business Inquiries')}
                    value="developtechx@gmail.com"
                    desc={t('contact.business_inquiries_desc', 'For collaborations and API access.')}
                  />
                  <ContactItem 
                    icon={<ShieldCheck className="w-5 h-5" />}
                    title={t('contact.legal_privacy', 'Legal & Privacy')}
                    value="developtechx@gmail.com"
                    desc={t('contact.legal_privacy_desc', 'For data requests and legal matters.')}
                  />
                </div>
              </div>

              <div className="pt-8 mt-8 border-t border-slate-100 dark:border-white/10 grid grid-cols-2 gap-6">
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
    <div className="flex gap-4 sm:gap-5 group items-start">
      <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-500/20 group-hover:bg-blue-600 group-hover:text-white dark:group-hover:bg-blue-500 dark:group-hover:text-white transition-all duration-300 shadow-xs">
        {icon}
      </div>
      <div className="space-y-0.5">
        <h4 className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">{title}</h4>
        <p className="text-base sm:text-lg font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors break-all">{value}</p>
        <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">{desc}</p>
      </div>
    </div>
  );
}

