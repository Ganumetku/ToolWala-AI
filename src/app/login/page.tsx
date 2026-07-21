"use client";

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Terminal, Lock, User, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/admin';
  const errorParam = searchParams.get('error');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
          ? 'Cannot reach Supabase. Fix NEXT_PUBLIC_SUPABASE_URL in .env.local (use your real project URL from Supabase → Settings → API), then restart npm run dev.'
          : 'Unable to connect. Check your configuration.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-50 dark:bg-[#030712] px-4">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 blur-[150px] -z-10" />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white dark:bg-gray-950 p-8 sm:p-10 rounded-[2.5rem] border border-slate-200/80 dark:border-white/10 shadow-2xl relative text-slate-900 dark:text-white"
      >
        <div className="flex flex-col items-center text-center mb-10">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-500/30 mb-6">
            <Terminal className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white uppercase">ToolWala Admin</h1>
          <p className="text-slate-500 dark:text-gray-500 text-xs font-semibold mt-1 tracking-wide">AUTHENTICATE ADMINISTRATOR PROFILE</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 dark:text-gray-400 uppercase tracking-widest ml-1">Email</label>
            <div className="flex items-center gap-3 bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 focus-within:border-blue-600 dark:focus-within:border-blue-500/50 rounded-2xl px-5 py-4 transition-all">
              <User className="w-4 h-4 text-slate-400 dark:text-gray-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@toolwala.co"
                className="bg-transparent text-sm border-none outline-none text-slate-900 dark:text-white w-full placeholder-slate-400 dark:placeholder-gray-600 font-semibold"
                disabled={isLoading}
                autoComplete="email"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 dark:text-gray-400 uppercase tracking-widest ml-1">Password</label>
            <div className="flex items-center gap-3 bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 focus-within:border-blue-600 dark:focus-within:border-blue-500/50 rounded-2xl px-5 py-4 transition-all">
              <Lock className="w-4 h-4 text-slate-400 dark:text-gray-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-transparent text-sm border-none outline-none text-slate-900 dark:text-white w-full placeholder-slate-400 dark:placeholder-gray-600 font-semibold"
                disabled={isLoading}
                autoComplete="current-password"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-3 px-8 py-4.5 text-sm font-black uppercase tracking-widest text-white bg-blue-600 hover:bg-blue-700 rounded-2xl transition-all shadow-md shadow-blue-500/20 active:scale-[0.98] disabled:opacity-50 cursor-pointer"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Sparkles className="w-4 h-4" /> Sign In
              </>
            )}
          </button>
        </form>

        <p className="text-center text-[10px] font-bold text-slate-400 dark:text-gray-600 mt-8 leading-relaxed">
          Authorized personnel only. Access logging is active.
        </p>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 dark:bg-[#030712] flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
