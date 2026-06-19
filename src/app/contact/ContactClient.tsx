"use client";

import SectionTitle from '@/components/SectionTitle';
import { Mail, ShieldCheck, Sparkles, Clock, Globe } from 'lucide-react';
import ContactForm from './ContactForm';
import { useTranslation } from '@/components/I18nContext';

export default function ContactClient() {
  const { t } = useTranslation();

  return (
    <div className="bg-[#030712] min-h-screen py-24 relative overflow-hidden font-sans">
      <div className="absolute top-0 right-0 w-full h-[500px] bg-blue-600/5 blur-[120px] -z-10" />
      
      <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
        <SectionTitle 
          title={t('contact.title', 'Get in Touch')} 
          subtitle={t('contact.subtitle', 'Have questions or feedback? Our team is here to help you scale your productivity.')}
          centered
          as="h1"
        />
        
        <div className="mt-20 grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Side: Contact Info */}
          <div className="lg:col-span-5 space-y-8">
            <div className="glass p-10 rounded-[3rem] border border-white/5 space-y-10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 blur-3xl -z-10" />
              
              <div className="space-y-6">
                <h3 className="text-2xl font-black text-white tracking-tight uppercase">{t('contact.channels_title', 'Contact Channels')}</h3>
                <p className="text-gray-400 font-medium leading-relaxed">
                  {t('contact.channels_desc', 'We aim to respond to all inquiries within 24-48 business hours. For urgent technical support, please use the support email below.')}
                </p>
              </div>

              <div className="space-y-8">
                <ContactItem 
                  icon={<Mail />}
                  title={t('contact.general_support', 'General Support')}
                  value="developtechx@gmail.com"
                  desc={t('contact.general_support_desc', 'For help with tools and general questions.')}
                />
                <ContactItem 
                  icon={<Sparkles />}
                  title={t('contact.business_inquiries', 'Business Inquiries')}
                  value="developtechx@gmail.com"
                  desc={t('contact.business_inquiries_desc', 'For collaborations and API access.')}
                />
                <ContactItem 
                  icon={<ShieldCheck />}
                  title={t('contact.legal_privacy', 'Legal & Privacy')}
                  value="developtechx@gmail.com"
                  desc={t('contact.legal_privacy_desc', 'For data requests and legal matters.')}
                />
              </div>

              <div className="pt-8 border-t border-white/5 grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-500 font-bold uppercase tracking-widest text-[10px]">
                    <Clock className="w-3 h-3" /> {t('contact.response_time', 'Response Time')}
                  </div>
                  <p className="text-white font-black text-sm">~24 Hours</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-500 font-bold uppercase tracking-widest text-[10px]">
                    <Globe className="w-3 h-3" /> {t('contact.availability', 'Availability')}
                  </div>
                  <p className="text-white font-black text-sm">{t('contact.avail_days', 'Mon - Fri')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Contact Form */}
          <div className="lg:col-span-7">
            <div className="glass rounded-[3rem] border border-white/5 h-full overflow-hidden">
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
    <div className="flex gap-6 group">
      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-blue-500 border border-white/10 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
        {icon}
      </div>
      <div className="space-y-1">
        <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{title}</h4>
        <p className="text-lg font-black text-white group-hover:text-blue-400 transition-colors">{value}</p>
        <p className="text-xs text-gray-600 font-medium">{desc}</p>
      </div>
    </div>
  );
}
