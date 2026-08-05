"use client";

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Terminal, Lock, User, Sparkles, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { MeshGradient, FloatingParticles } from '@/components/BackgroundEffects';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/admin';
  const errorParam = searchParams.get('error');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (errorParam === 'unauthorized') {
    toast.error('You do not have admin access.');
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter email and password');
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        toast.error(error.message || 'Invalid credentials');
        setIsLoading(false);
        return;
      }

      if (!data.user) {
        toast.error('Authentication failed');
        setIsLoading(false);
        return;
      }

      // Verify admin via server API (bypasses client RLS issues)
      const verifyRes = await fetch('/api/auth/verify-admin/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ access_token: data.session?.access_token }),
      });

      const verifyData = await verifyRes.json();

      if (!verifyRes.ok || !verifyData.success) {
        await supabase.auth.signOut();
        toast.error(verifyData.error || 'Unauthorized. Admin access required.');
        setIsLoading(false);
        return;
      }

      toast.success('Admin authenticated successfully! Entering console...');
      router.replace(redirect);
      router.refresh();
    } catch (err) {
      const isFetchError =
        err instanceof TypeError && String(err.message).includes('fetch');
      toast.error(
        isFetchError
          ? 'Cannot reach Supabase. Fix NEXT_PUBLIC_SUPABASE_URL in .env.local, then restart server.'
          : 'Unable to connect. Check your configuration.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#F6F8FC] dark:bg-[#030712] px-4 py-12 transition-colors duration-250 font-sans">
      <MeshGradient />
      <FloatingParticles />

      {/* Decorative ambient background glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-blue-500/10 dark:bg-blue-600/15 rounded-full blur-[140px] pointer-events-none -z-10" />

      <motion.div
        initial={{ opacity: 0, y: 25, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md bg-white/85 dark:bg-[#0f172a]/85 backdrop-blur-2xl p-8 sm:p-10 rounded-[2.5rem] border border-slate-200/90 dark:border-white/10 shadow-[0_20px_50px_rgba(15,23,42,0.08)] dark:shadow-[0_25px_60px_rgba(0,0,0,0.6)] relative z-10 text-slate-900 dark:text-white"
      >
        {/* Header Section */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30 mb-5 relative group">
            <Terminal className="w-8 h-8 group-hover:scale-110 transition-transform" />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight bg-gradient-to-r from-slate-900 via-blue-900 to-slate-800 dark:from-white dark:via-blue-100 dark:to-slate-300 bg-clip-text text-transparent uppercase">
            ToolWala Admin
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-[11px] font-extrabold mt-1.5 tracking-wider uppercase">
            Authenticate Administrator Profile
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          {/* Email Input */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest ml-1">
              Email Address
            </label>
            <div className="flex items-center gap-3 bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 focus-within:border-blue-600 dark:focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 rounded-2xl px-4.5 py-3.5 transition-all">
              <User className="w-4.5 h-4.5 text-slate-400 dark:text-slate-500 shrink-0" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@toolwala.co"
                className="bg-transparent text-sm border-none outline-none text-slate-900 dark:text-white w-full placeholder-slate-400 dark:placeholder-slate-500 font-semibold"
                disabled={isLoading}
                autoComplete="email"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest ml-1">
              Password
            </label>
            <div className="flex items-center gap-3 bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 focus-within:border-blue-600 dark:focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 rounded-2xl px-4.5 py-3.5 transition-all">
              <Lock className="w-4.5 h-4.5 text-slate-400 dark:text-slate-500 shrink-0" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-transparent text-sm border-none outline-none text-slate-900 dark:text-white w-full placeholder-slate-400 dark:placeholder-slate-500 font-semibold"
                disabled={isLoading}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1 cursor-pointer"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2.5 px-8 py-4 text-xs font-black uppercase tracking-widest text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:from-blue-500 hover:to-indigo-500 rounded-2xl transition-all shadow-[0_4px_25px_rgba(37,99,235,0.35)] active:scale-[0.98] disabled:opacity-50 cursor-pointer mt-2"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Sparkles className="w-4 h-4" /> Sign In To Console
              </>
            )}
          </button>
        </form>

        {/* Security badge footer */}
        <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-8 pt-6 border-t border-slate-100 dark:border-white/5">
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>256-Bit Encrypted Admin Session</span>
        </div>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F6F8FC] dark:bg-[#030712] flex items-center justify-center">
          <div className="h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
