"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, User, Sparkles, ShieldCheck, RefreshCw, ShieldAlert, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { MeshGradient, FloatingParticles } from '@/components/BackgroundEffects';

function ControlAccessForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawRedirect = searchParams.get('redirect') || '/admin';
  // Sanitize: only allow same-origin relative paths (not //evil.com, javascript:, etc.)
  const redirect = /^\/(?!\/)/.test(rawRedirect) && !/^\/[a-z]+:/i.test(rawRedirect) ? rawRedirect : '/admin';
  const errorParam = searchParams.get('error');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [honeypot, setHoneypot] = useState(''); // Anti-bot honeypot
  
  // Security CAPTCHA Challenge State
  const [num1, setNum1] = useState<number>(0);
  const [num2, setNum2] = useState<number>(0);
  const [userCaptcha, setUserCaptcha] = useState<string>('');
  const [captchaVerified, setCaptchaVerified] = useState<boolean>(false);

  const [isLoading, setIsLoading] = useState(false);
  const [lockoutTimer, setLockoutTimer] = useState<number | null>(null);

  // Generate new random security CAPTCHA challenge
  const generateCaptcha = () => {
    const n1 = Math.floor(Math.random() * 9) + 1;
    const n2 = Math.floor(Math.random() * 9) + 1;
    setNum1(n1);
    setNum2(n2);
    setUserCaptcha('');
    setCaptchaVerified(false);
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  if (errorParam === 'unauthorized') {
    toast.error('You do not have admin privileges.');
  }

  const handleVerifyCaptcha = () => {
    const expected = num1 + num2;
    if (parseInt(userCaptcha.trim(), 10) === expected) {
      setCaptchaVerified(true);
      toast.success('Security CAPTCHA verified!');
    } else {
      toast.error('Incorrect CAPTCHA answer. Try again.');
      generateCaptcha();
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Honeypot Bot Trap Check
    if (honeypot) {
      toast.error('Bot detected.');
      return;
    }

    if (!email || !password) {
      toast.error('Please enter email and password');
      return;
    }

    const expectedCaptcha = num1 + num2;
    if (!captchaVerified && parseInt(userCaptcha.trim(), 10) !== expectedCaptcha) {
      toast.error('Please solve the Security CAPTCHA before signing in.');
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        toast.error(error.message || 'Invalid credentials');
        generateCaptcha();
        setIsLoading(false);
        return;
      }

      if (!data.user) {
        toast.error('Authentication failed');
        generateCaptcha();
        setIsLoading(false);
        return;
      }

      // 1. Fast direct profile check via browser Supabase client
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, status')
        .eq('id', data.user.id)
        .maybeSingle();

      if (profile?.role === 'admin' && profile?.status === 'active') {
        toast.success('Admin authenticated successfully! Entering console...');
        router.replace(redirect);
        router.refresh();
        return;
      }

      // 2. Fallback check via server API with 6s timeout
      const controller = new AbortController();
      const fetchTimer = setTimeout(() => controller.abort(), 6000);

      try {
        const verifyRes = await fetch('/api/auth/verify-admin/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ access_token: data.session?.access_token }),
          signal: controller.signal,
        });
        clearTimeout(fetchTimer);

        const verifyData = await verifyRes.json();

        if (verifyRes.status === 429) {
          await supabase.auth.signOut();
          toast.error(verifyData.error || 'Too many failed login attempts. Locked for 15 minutes.');
          setLockoutTimer(15 * 60);
          setIsLoading(false);
          return;
        }

        if (!verifyRes.ok || !verifyData.success) {
          await supabase.auth.signOut();
          toast.error(verifyData.error || 'Unauthorized. Admin access required.');
          generateCaptcha();
          setIsLoading(false);
          return;
        }

        toast.success('Admin authenticated successfully! Entering console...');
        router.replace(redirect);
        router.refresh();
      } catch (fetchErr) {
        // API timed out — do NOT redirect. Show error and let user retry.
        await supabase.auth.signOut();
        toast.error('Authentication timed out. Please try again.');
        generateCaptcha();
        setIsLoading(false);
        return;
      }
    } catch (err) {
      const isFetchError = err instanceof TypeError && String(err.message).includes('fetch');
      toast.error(
        isFetchError
          ? 'Cannot reach authentication server. Check connection.'
          : 'Unable to connect. Check configuration.'
      );
      generateCaptcha();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#F6F8FC] dark:bg-[#030712] px-4 py-12 transition-colors duration-250 font-sans">
      <MeshGradient />
      <FloatingParticles />

      {/* Ambient background glow accents */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-blue-500/10 dark:bg-blue-600/15 rounded-full blur-[140px] pointer-events-none -z-10" />

      <motion.div
        initial={{ opacity: 0, y: 25, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md bg-white/90 dark:bg-[#0f172a]/90 backdrop-blur-2xl p-8 sm:p-10 rounded-[2.5rem] border border-slate-200/90 dark:border-white/10 shadow-[0_20px_50px_rgba(15,23,42,0.08)] dark:shadow-[0_25px_60px_rgba(0,0,0,0.6)] relative z-10 text-slate-900 dark:text-white"
      >
        {/* Header Section */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-white font-black text-3xl shadow-[0_0_30px_rgba(37,99,235,0.4)] mb-5 relative group overflow-hidden transition-all group-hover:scale-105 group-hover:rotate-3 no-translate notranslate" translate="no" data-no-translate>
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
            T
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full z-10" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight bg-gradient-to-r from-slate-900 via-blue-900 to-slate-800 dark:from-white dark:via-blue-100 dark:to-slate-300 bg-clip-text text-transparent uppercase">
            Control Console
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-[11px] font-extrabold mt-1.5 tracking-wider uppercase flex items-center gap-1.5 justify-center">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            Secret Administrator Portal
          </p>
        </div>

        {/* Lockout Warning Banner if Rate Limited */}
        {lockoutTimer !== null && (
          <div className="mb-6 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 p-4 rounded-2xl flex items-center gap-3 text-rose-700 dark:text-rose-400 text-xs font-bold">
            <ShieldAlert className="w-5 h-5 shrink-0" />
            <div>
              <p>Security Lockout Active</p>
              <p className="text-[10px] font-semibold opacity-90">Too many failed login attempts. Retry in 15 minutes.</p>
            </div>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          {/* Honeypot field (Hidden from humans, traps automated bots) */}
          <div className="hidden" aria-hidden="true">
            <input
              type="text"
              name="honeypot"
              tabIndex={-1}
              autoComplete="off"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
            />
          </div>

          {/* Email Input */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest ml-1">
              Admin Email
            </label>
            <div className="flex items-center gap-3 bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 focus-within:border-blue-600 dark:focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 rounded-2xl px-4.5 py-3.5 transition-all">
              <User className="w-4.5 h-4.5 text-slate-400 dark:text-slate-500 shrink-0" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@toolwala.co"
                className="bg-transparent text-sm border-none outline-none text-slate-900 dark:text-white w-full placeholder-slate-400 dark:placeholder-slate-500 font-semibold"
                disabled={isLoading || lockoutTimer !== null}
                autoComplete="email"
                required
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest ml-1">
              Admin Password
            </label>
            <div className="flex items-center gap-3 bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 focus-within:border-blue-600 dark:focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 rounded-2xl px-4.5 py-3.5 transition-all">
              <Lock className="w-4.5 h-4.5 text-slate-400 dark:text-slate-500 shrink-0" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-transparent text-sm border-none outline-none text-slate-900 dark:text-white w-full placeholder-slate-400 dark:placeholder-slate-500 font-semibold"
                disabled={isLoading || lockoutTimer !== null}
                autoComplete="current-password"
                required
              />
            </div>
          </div>

          {/* Security CAPTCHA Challenge */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-white/5">
            <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 ml-1">
              <span>Security CAPTCHA Check</span>
              <button
                type="button"
                onClick={generateCaptcha}
                className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" /> Refresh Code
              </button>
            </div>

            <div className="flex items-center gap-3">
              {/* CAPTCHA Math Badge */}
              <div className="px-4 py-3 bg-blue-50 dark:bg-blue-600/10 border border-blue-200 dark:border-blue-500/20 rounded-2xl text-slate-900 dark:text-white font-black text-sm tracking-wider select-none shrink-0 no-translate notranslate" translate="no">
                {num1} + {num2} = ?
              </div>

              {/* CAPTCHA Input */}
              <input
                type="text"
                value={userCaptcha}
                onChange={(e) => {
                  setUserCaptcha(e.target.value);
                  if (parseInt(e.target.value.trim(), 10) === (num1 + num2)) {
                    setCaptchaVerified(true);
                  } else {
                    setCaptchaVerified(false);
                  }
                }}
                placeholder="Answer"
                className="w-full bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 focus-within:border-blue-600 dark:focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 rounded-2xl px-4 py-3 text-sm text-slate-900 dark:text-white font-bold placeholder-slate-400 dark:placeholder-slate-500 outline-none"
                disabled={isLoading || lockoutTimer !== null}
                required
              />

              {captchaVerified && (
                <CheckCircle className="w-6 h-6 text-emerald-500 shrink-0" />
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2.5 px-8 py-4 text-xs font-black uppercase tracking-widest text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:from-blue-500 hover:to-indigo-500 rounded-2xl transition-all shadow-[0_4px_25px_rgba(37,99,235,0.35)] active:scale-[0.98] disabled:opacity-50 cursor-pointer mt-4"
            disabled={isLoading || lockoutTimer !== null}
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
          <span>Rate Limited & 256-Bit Encrypted Portal</span>
        </div>
      </motion.div>
    </div>
  );
}

export default function ControlAccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F6F8FC] dark:bg-[#030712] flex items-center justify-center">
          <div className="h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ControlAccessForm />
    </Suspense>
  );
}
