"use client";

import Link from 'next/link';
import { useState } from 'react';
import { Mail, ShieldCheck, Heart, Sparkles, Send, Globe } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from '@/components/I18nContext';

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'id', name: 'Bahasa Indonesia', flag: '🇮🇩' },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState("");
  
  const { t, locale, enabledLocales, localizeHref } = useTranslation();

  const activeLanguages = LANGUAGES.filter(lang => enabledLocales.includes(lang.code));

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast.error(t('footer.subscribe_error', 'Please enter a valid email address.'));
      return;
    }
    toast.success(t('footer.subscribe_success', 'Subscribed successfully! Welcome to the ToolWala community ⚡'));
    setEmail("");
  };

  const handleLanguageChange = (newLocale: string) => {
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
    localStorage.setItem('preferredLocale', newLocale);

    const currentPathname = window.location.pathname;
    const pathnameParts = currentPathname.split('/');
    const currentLocalePrefix = pathnameParts[1];
    const ALL_LOCALES = ['hi', 'es', 'fr', 'de', 'pt', 'ar', 'id'];
    const isCurrentLocalePrefixed = ALL_LOCALES.includes(currentLocalePrefix);

    let newPathname = currentPathname;
    if (newLocale === 'en') {
      if (isCurrentLocalePrefixed) {
        newPathname = '/' + pathnameParts.slice(2).join('/');
      }
    } else {
      if (isCurrentLocalePrefixed) {
        pathnameParts[1] = newLocale;
        newPathname = pathnameParts.join('/');
      } else {
        newPathname = `/${newLocale}${currentPathname}`;
      }
    }

    if (!newPathname.endsWith('/') && currentPathname.endsWith('/')) {
      newPathname += '/';
    }
    if (newPathname.endsWith('/') && !currentPathname.endsWith('/')) {
      newPathname = newPathname.slice(0, -1);
    }
    if (newPathname === '') {
      newPathname = '/';
    }

    const search = window.location.search;
    window.location.href = newPathname + search;
  };

  const categories = [
    { name: "AI Tools", href: "/categories/ai-tools/" },
    { name: "Image Tools", href: "/categories/image-tools/" },
    { name: "PDF Tools", href: "/categories/pdf-tools/" },
    { name: "Calculator Tools", href: "/categories/calculator-tools/" },
    { name: "Developer Tools", href: "/categories/developer-tools/" },
    { name: "Utility Tools", href: "/categories/utility-tools/" }
  ];

  const topTools = [
    { name: "Aadhaar Masking Tool", href: "/tools/aadhaar-masking-tool/" },
    { name: "Aadhaar Photo Resizer", href: "/tools/aadhaar-photo-resizer/" },
    { name: "Background Remover", href: "/tools/bg-remover/" },
    { name: "Image Compressor", href: "/tools/image-compressor/" },
    { name: "Passport Photo Maker", href: "/tools/passport-photo-maker/" },
    { name: "AI Resume Builder", href: "/tools/resume-builder/" }
  ];

  const govHubs = [
    { name: "UPSC Exam Hub", href: "/hubs/upsc-exam-utilities/" },
    { name: "SSC Exam Hub", href: "/hubs/ssc-exam-utilities/" },
    { name: "Aadhaar Card Hub", href: "/hubs/aadhaar-utilities/" },
    { name: "PAN Card Hub", href: "/hubs/pan-card-utilities/" },
    { name: "Passport Seva Hub", href: "/hubs/passport-seva-utilities/" }
  ];

  const sitemap = [
    { name: "All Utilities", href: "/tools/" },
    { name: "Browse Folders", href: "/categories/" },
    { name: "Pricing Beta", href: "/pricing/" },
    { name: "Privacy Hub", href: "/privacy/" },
    { name: "Insights Blog", href: "/blog/" },
    { name: "Platform Guide", href: "/about/" }
  ];

  const localizedCategories = categories.map((cat) => ({
    name: t(`categories.${cat.name}`, cat.name),
    href: localizeHref(cat.href)
  }));

  const localizedTopTools = topTools.map((tool) => {
    const match = tool.href.match(/\/tools\/([^\/]+)\/?/);
    const key = match ? match[1] : '';
    const name = key ? t(`tools.${key}.title`, tool.name) : tool.name;
    return {
      name,
      href: localizeHref(tool.href)
    };
  });

  const localizedGovHubs = govHubs.map((hub) => ({
    name: t(`hubs.${hub.name}`, hub.name),
    href: localizeHref(hub.href)
  }));

  const localizedSitemap = sitemap.map((item) => {
    let key = '';
    if (item.href === '/tools/') key = 'nav.tools';
    else if (item.href === '/categories/') key = 'nav.categories';
    else if (item.href === '/pricing/') key = 'nav.pricing';
    else if (item.href === '/privacy/') key = 'nav.privacy';
    else if (item.href === '/blog/') key = 'nav.blog';
    else if (item.href === '/about/') key = 'nav.about';
    
    const name = key ? t(key, item.name) : item.name;
    return {
      name,
      href: localizeHref(item.href)
    };
  });

  return (
    <footer className="bg-[#030712] border-t border-white/5 pt-24 pb-12 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-blue-950/10 to-transparent -z-10 pointer-events-none" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-16 lg:gap-12">
          
          <div className="lg:col-span-3 space-y-8">
            <Link href={localizeHref('/')} translate="no" data-no-translate className="flex items-center gap-3 group select-none no-translate notranslate">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white font-black text-2xl shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-transform group-hover:scale-110 group-hover:rotate-3 no-translate notranslate" translate="no" data-no-translate>
                T
              </div>
              <span translate="no" data-no-translate className="text-2xl font-black tracking-tighter text-white no-translate notranslate">
                ToolWala <span translate="no" data-no-translate className="text-blue-500 no-translate notranslate">AI</span>
              </span>
            </Link>
            
            <p className="text-gray-400 leading-relaxed font-medium text-sm">
              {t('footer.tagline', 'Free AI utilities that run 100% locally in your browser. No registration, no latency, no server uploads. Experience privacy-first processing.')}
            </p>

            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-white">{t('footer.subscribe_releases', 'Subscribe to Releases')}</h4>
              <form onSubmit={handleSubscribe} className="flex max-w-sm rounded-xl overflow-hidden bg-white/5 border border-white/10 p-1.5 focus-within:border-blue-500/50 transition-colors">
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@email.com"
                  className="bg-transparent text-xs outline-none border-none py-2 px-3 flex-1 text-white placeholder-gray-600 focus:ring-0"
                />
                <button 
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 p-2 rounded-lg text-white transition-colors flex items-center justify-center cursor-pointer"
                  aria-label="Subscribe"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
            
            <div className="flex flex-wrap gap-2.5">
              <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-4 py-2 rounded-full border border-emerald-500/20">
                <ShieldCheck className="w-3.5 h-3.5" />
                {t('footer.browser_native', 'Browser-Native')}
              </div>
              <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-blue-400 bg-blue-500/10 px-4 py-2 rounded-full border border-blue-500/20">
                <Sparkles className="w-3.5 h-3.5 fill-blue-400" />
                {t('footer.gdpr_compliant', 'GDPR Compliant')}
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">{t('nav.categories', 'Categories')}</h3>
            <ul className="space-y-4">
              {localizedCategories.map((cat) => (
                <li key={cat.name}>
                  <Link 
                    href={cat.href} 
                    className="text-gray-400 hover:text-white text-xs font-bold transition-colors block"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">{t('footer.tools', 'Top Tools')}</h3>
            <ul className="space-y-4">
              {localizedTopTools.map((tool) => (
                <li key={tool.name}>
                  <Link 
                    href={tool.href} 
                    className="text-gray-400 hover:text-white text-xs font-bold transition-colors block"
                  >
                    {tool.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">{t('footer.gov_hubs', 'Gov Hubs')}</h3>
            <ul className="space-y-4">
              {localizedGovHubs.map((hub) => (
                <li key={hub.name}>
                  <Link 
                    href={hub.href} 
                    className="text-gray-400 hover:text-white text-xs font-bold transition-colors block"
                  >
                    {hub.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="lg:col-span-1 space-y-6">
            <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">{t('footer.sitemap', 'Sitemap')}</h3>
            <ul className="space-y-4">
              {localizedSitemap.map((item) => (
                <li key={item.name}>
                  <Link 
                    href={item.href} 
                    className="text-gray-400 hover:text-white text-xs font-bold transition-colors block"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">{t('footer.contact_header', 'Contact')}</h3>
            <a href="mailto:developtechx@gmail.com" className="flex items-center gap-2 text-gray-300 hover:text-blue-400 text-xs font-black transition-all group">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-blue-600/10 group-hover:border-blue-600/20 transition-all shrink-0">
                <Mail className="w-4 h-4" />
              </div>
              <span className="truncate">developtechx@gmail.com</span>
            </a>
 
            <div className="space-y-3.5 pt-4">
              <h4 className="text-[10px] font-black uppercase tracking-wider text-gray-500">{t('footer.social_connect', 'Social Connect')}</h4>
              <div className="flex gap-2">
                <SocialLink href="#" icon={<TwitterIcon className="w-4 h-4" />} label="Twitter" />
                <SocialLink href="#" icon={<GithubIcon className="w-4 h-4" />} label="GitHub" />
                <SocialLink href="#" icon={<LinkedinIcon className="w-4 h-4" />} label="LinkedIn" />
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-20 pt-10 border-t border-white/5 flex flex-col lg:flex-row items-center justify-between gap-8 text-center lg:text-left select-none">
          <div className="space-y-4">
            <p className="text-xs text-gray-500 font-bold">
              &copy; {currentYear} <span translate="no" data-no-translate className="no-translate notranslate">ToolWala AI</span>. {t('footer.copyright_notice', 'All rights reserved.')}
            </p>
            <div className="flex flex-wrap justify-center lg:justify-start gap-4.5 text-[10px] font-black uppercase tracking-wider text-gray-600">
              <Link href={localizeHref('/privacy-policy')} prefetch={false} className="hover:text-gray-400 transition-colors">{t('footer.privacy', 'Privacy Policy')}</Link>
              <Link href={localizeHref('/terms')} prefetch={false} className="hover:text-gray-400 transition-colors">{t('footer.terms', 'Terms of Service')}</Link>
              <Link href={localizeHref('/disclaimer')} prefetch={false} className="hover:text-gray-400 transition-colors">{t('footer.disclaimer', 'Disclaimer')}</Link>
              <Link href={localizeHref('/contact')} prefetch={false} className="hover:text-gray-400 transition-colors">{t('footer.contact', 'Contact Support')}</Link>
            </div>
            
            {/* Horizontal Footer Language Selector Grid */}
            <div className="flex flex-wrap gap-4.5 justify-center lg:justify-start items-center pt-2">
              <Globe className="w-3.5 h-3.5 text-gray-600" />
              {activeLanguages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  translate="no"
                  className={`text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                    locale === lang.code
                      ? 'text-blue-400'
                      : 'text-gray-600 hover:text-gray-400'
                  }`}
                >
                  {lang.flag} {lang.name}
                </button>
              ))}
            </div>
          </div>
          
          <p className="flex items-center gap-2 text-xs text-gray-500 font-bold">
            {t('footer.made_with', 'Made with')} <Heart className="w-3.5 h-3.5 fill-red-500 text-red-500 animate-pulse" /> {t('footer.for_community', 'for the AI community')}
          </p>
        </div>
      </div>
    </footer>
  );
}

function SocialLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <a 
      href={href} 
      className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 border border-white/5 transition-all active:scale-90"
      aria-label={label}
    >
      {icon}
    </a>
  );
}

function TwitterIcon(props: any) {
  return (
    <svg {...props} suppressHydrationWarning xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
    </svg>
  );
}

function GithubIcon(props: any) {
  return (
    <svg {...props} suppressHydrationWarning xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/>
    </svg>
  );
}

function LinkedinIcon(props: any) {
  return (
    <svg {...props} suppressHydrationWarning xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/>
    </svg>
  );
}
