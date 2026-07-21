"use client";

import { useState } from "react";
import { Mail } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "@/components/I18nContext";

interface BlogNewsletterProps {
  compact?: boolean;
}

export default function BlogNewsletter({ compact = false }: BlogNewsletterProps) {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      const res = await fetch("/api/contact/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Newsletter Subscriber",
          email,
          message: "Opt-in to ToolWala Insights newsletter.",
        }),
      });
      if (res.ok) {
        toast.success(t('blog.newsletter_success', 'Welcome to ToolWala Insights!'));
        setEmail("");
      } else {
        toast.error(t('blog.newsletter_failed', 'Subscription failed. Please try again.'));
      }
    } catch {
      toast.error(t('blog.newsletter_error', 'Something went wrong.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`glass rounded-[2rem] border border-gray-200 dark:border-white/5 bg-gradient-to-b from-blue-600/[0.05] to-transparent relative overflow-hidden ${
        compact ? "p-6" : "p-6 sm:p-8"
      }`}
    >
      <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/10 rounded-full blur-2xl" />
      <div className="space-y-4 relative z-10">
        <Mail className="w-8 h-8 text-blue-600 dark:text-blue-500" />
        <h3 className={`font-black text-gray-900 dark:text-white uppercase tracking-tight leading-none ${compact ? "text-base" : "text-lg"}`}>
          {t('blog.newsletter_heading', 'Subscribe to ToolWala Insights')}
        </h3>
        <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold leading-relaxed">
          {t('blog.newsletter_sub', 'Get browser-native AI updates, new tool launches, and deep-dive guides. No spam.')}
        </p>
        <form onSubmit={handleSubmit} className="space-y-3 pt-2">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('blog.newsletter_placeholder', 'you@email.com')}
            className="w-full bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-2xl px-4 py-3.5 text-xs font-bold text-gray-900 dark:text-white outline-none focus:border-blue-500/50 placeholder-gray-400 dark:placeholder-gray-600"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 text-[10px] font-black uppercase tracking-widest text-white bg-blue-600 hover:bg-blue-500 rounded-2xl transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)] cursor-pointer disabled:opacity-50"
          >
            {loading ? t('blog.newsletter_joining', 'Joining...') : t('blog.newsletter_join', 'Join Newsletter')}
          </button>
        </form>
      </div>
    </div>
  );
}
