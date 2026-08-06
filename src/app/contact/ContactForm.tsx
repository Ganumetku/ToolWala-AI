"use client";

import { useState } from 'react';
import { Loader2, CheckCircle, AlertCircle, Send, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '@/components/I18nContext';

export default function ContactForm() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    message: '',
    honeypot: '', // Anti-spam honeypot field
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.honeypot) {
      setStatus('success');
      return;
    }

    setIsSubmitting(true);
    setStatus('idle');

    const promise = fetch('/api/contact/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email,
        message: formData.message,
        honeypot: formData.honeypot,
      }),
    }).then(async (response) => {
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Something went wrong');
      return data;
    });

    toast.promise(promise, {
      loading: t('contact.form_toast_sending', 'Transmitting your message...'),
      success: () => {
        setStatus('success');
        setFormData({ firstName: '', lastName: '', email: '', message: '', honeypot: '' });
        return t('contact.form_toast_success', 'Message sent successfully!');
      },
      error: (err) => {
        setStatus('error');
        return err.message || t('contact.form_toast_error', 'Failed to send message');
      },
      finally: () => setIsSubmitting(false),
    });
  };

  return (
    <div className="p-8 sm:p-12 font-sans bg-slate-50/70 dark:bg-slate-900/40 backdrop-blur-xl h-full flex flex-col justify-between">
      <AnimatePresence mode="wait">
        {status === 'success' ? (
          <motion.div 
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="text-center py-12 my-auto"
          >
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[2rem] bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 mb-8 border border-emerald-500/20 shadow-[0_0_40px_rgba(16,185,129,0.15)]">
              <CheckCircle className="h-10 w-10" />
            </div>
            <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-4 tracking-tight uppercase">{t('contact.form_received_title', 'Message Received')}</h3>
            <p className="text-slate-600 dark:text-slate-300 font-medium mb-10 max-w-sm mx-auto leading-relaxed text-sm">
              {t('contact.form_received_desc', "We've successfully received your transmission. Our team will analyze and respond within 24 standard business hours.")}
            </p>
            <button
              onClick={() => setStatus('idle')}
              className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 font-black uppercase tracking-[0.2em] text-[11px] hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{t('contact.form_send_another', 'Send Another Transmission')}</span>
            </button>
          </motion.div>
        ) : (
          <motion.form 
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onSubmit={handleSubmit} 
            className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2"
          >
            {/* Honeypot field (hidden from users) */}
            <div className="hidden" aria-hidden="true">
              <input
                type="text"
                name="honeypot"
                tabIndex={-1}
                autoComplete="off"
                value={formData.honeypot}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="firstName" className="block text-[11px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 ml-1">
                {t('contact.form_first_name', 'First Name')}
              </label>
              <input
                type="text"
                name="firstName"
                id="firstName"
                required
                value={formData.firstName}
                onChange={handleChange}
                placeholder="John"
                className="block w-full rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 px-5 py-3.5 text-slate-900 dark:text-white font-semibold focus:border-blue-600 dark:focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-xs"
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="lastName" className="block text-[11px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 ml-1">
                {t('contact.form_last_name', 'Last Name')}
              </label>
              <input
                type="text"
                name="lastName"
                id="lastName"
                required
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Doe"
                className="block w-full rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 px-5 py-3.5 text-slate-900 dark:text-white font-semibold focus:border-blue-600 dark:focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-xs"
                disabled={isSubmitting}
              />
            </div>

            <div className="sm:col-span-2 space-y-2">
              <label htmlFor="email" className="block text-[11px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 ml-1">
                {t('contact.form_email', 'Email Address')}
              </label>
              <input
                type="email"
                name="email"
                id="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="john@example.com"
                className="block w-full rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 px-5 py-3.5 text-slate-900 dark:text-white font-semibold focus:border-blue-600 dark:focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-xs"
                disabled={isSubmitting}
              />
            </div>

            <div className="sm:col-span-2 space-y-2">
              <label htmlFor="message" className="block text-[11px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 ml-1">
                {t('contact.form_message', 'Message Content')}
              </label>
              <textarea
                name="message"
                id="message"
                required
                rows={4}
                value={formData.message}
                onChange={handleChange}
                placeholder={t('contact.form_message_placeholder', 'How can we help you achieve your AI goals?')}
                className="block w-full rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 px-5 py-3.5 text-slate-900 dark:text-white font-semibold focus:border-blue-600 dark:focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 resize-none shadow-xs"
                disabled={isSubmitting}
              />
            </div>

            <div className="sm:col-span-2 mt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="group relative flex w-full items-center justify-center gap-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 text-center text-xs font-black uppercase tracking-[0.15em] shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/35 active:scale-[0.99] transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{t('contact.form_btn_sending', 'Transmitting...')}</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    <span>{t('contact.form_btn_send', 'Send Message')}</span>
                  </>
                )}
              </button>

              <div className="mt-6 flex items-center justify-center gap-6 text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> {t('contact.form_secure_protocol', 'Secure Protocol')}</div>
                <div className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> {t('contact.form_human_support', 'Human Support')}</div>
              </div>
            </div>

            {status === 'error' && (
              <div className="sm:col-span-2 mt-2 flex items-center gap-2 text-rose-600 dark:text-rose-400 text-xs font-bold uppercase tracking-wide bg-rose-50 dark:bg-rose-500/10 p-3 rounded-xl border border-rose-200 dark:border-rose-500/20">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{t('contact.form_error', 'Transmission Failure. Check connection and retry.')}</span>
              </div>
            )}
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

