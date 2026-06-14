"use client";

import { useState } from 'react';
import { Loader2, CheckCircle, AlertCircle, Send, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export default function ContactForm() {
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
      loading: 'Transmitting your message...',
      success: () => {
        setStatus('success');
        setFormData({ firstName: '', lastName: '', email: '', message: '', honeypot: '' });
        return 'Message sent successfully!';
      },
      error: (err) => {
        setStatus('error');
        return err.message || 'Failed to send message';
      },
      finally: () => setIsSubmitting(false),
    });
  };

  return (
    <div className="bg-[#0f172a]/50 p-8 sm:p-12 backdrop-blur-xl">
      <AnimatePresence mode="wait">
        {status === 'success' ? (
          <motion.div 
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[2rem] bg-emerald-500/10 text-emerald-500 mb-8 border border-emerald-500/20 shadow-[0_0_40px_rgba(16,185,129,0.2)]">
              <CheckCircle className="h-10 w-10" />
            </div>
            <h3 className="text-3xl font-black text-white mb-4 tracking-tighter uppercase">Message Received</h3>
            <p className="text-gray-400 font-medium mb-10 max-w-sm mx-auto leading-relaxed">
              We've successfully received your transmission. Our team will analyze and respond within 24 standard business hours.
            </p>
            <button
              onClick={() => setStatus('idle')}
              className="text-blue-500 font-black uppercase tracking-[0.2em] text-[10px] hover:text-blue-400 transition-colors"
            >
              Send Another Transmission
            </button>
          </motion.div>
        ) : (
          <motion.form 
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onSubmit={handleSubmit} 
            className="grid grid-cols-1 gap-x-8 gap-y-8 sm:grid-cols-2"
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

            <div className="space-y-3">
              <label htmlFor="firstName" className="block text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">
                First Name
              </label>
              <input
                type="text"
                name="firstName"
                id="firstName"
                required
                value={formData.firstName}
                onChange={handleChange}
                placeholder="John"
                className="block w-full rounded-2xl bg-white/5 border border-white/5 px-6 py-4 text-white font-bold focus:border-blue-500/50 outline-none transition-all placeholder:text-gray-700"
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-3">
              <label htmlFor="lastName" className="block text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">
                Last Name
              </label>
              <input
                type="text"
                name="lastName"
                id="lastName"
                required
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Doe"
                className="block w-full rounded-2xl bg-white/5 border border-white/5 px-6 py-4 text-white font-bold focus:border-blue-500/50 outline-none transition-all placeholder:text-gray-700"
                disabled={isSubmitting}
              />
            </div>
            <div className="sm:col-span-2 space-y-3">
              <label htmlFor="email" className="block text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                id="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="john@example.com"
                className="block w-full rounded-2xl bg-white/5 border border-white/5 px-6 py-4 text-white font-bold focus:border-blue-500/50 outline-none transition-all placeholder:text-gray-700"
                disabled={isSubmitting}
              />
            </div>
            <div className="sm:col-span-2 space-y-3">
              <label htmlFor="message" className="block text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">
                Message Content
              </label>
              <textarea
                name="message"
                id="message"
                required
                rows={4}
                value={formData.message}
                onChange={handleChange}
                placeholder="How can we help you achieve your AI goals?"
                className="block w-full rounded-2xl bg-white/5 border border-white/5 px-6 py-4 text-white font-bold focus:border-blue-500/50 outline-none transition-all placeholder:text-gray-700 resize-none"
                disabled={isSubmitting}
              />
            </div>
            <div className="sm:col-span-2 mt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="group relative flex w-full items-center justify-center gap-4 rounded-[1.8rem] bg-blue-600 px-8 py-6 text-center text-sm font-black uppercase tracking-[0.2em] text-white shadow-2xl hover:bg-blue-500 active:scale-[0.98] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Transmitting...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    <span>Send Message</span>
                  </>
                )}
              </button>
              <div className="mt-8 flex items-center justify-center gap-6 text-[8px] font-black uppercase tracking-[0.3em] text-gray-600">
                <div className="flex items-center gap-2"><Sparkles className="w-3 h-3 text-blue-500" /> Secure Protocol</div>
                <div className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-emerald-500" /> Human Support</div>
              </div>
            </div>

            {status === 'error' && (
              <div className="sm:col-span-2 mt-4 flex items-center gap-2 text-red-500 text-[10px] font-black uppercase tracking-widest animate-pulse">
                <AlertCircle className="w-4 h-4" />
                <span>Transmission Failure. Check connection and retry.</span>
              </div>
            )}
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
