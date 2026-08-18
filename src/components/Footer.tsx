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
    <footer className="bg-[#F7F8FC] dark:bg-[#030712] border-t border-[#E8ECF4] dark:border-white/5 pt-24 pb-12 relative overflow-hidden transition-colors duration-250">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-blue-50/50 dark:from-blue-950/10 to-transparent -z-10 pointer-events-none" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-16 lg:gap-12">
          
          <div className="lg:col-span-3 space-y-8">
            <Link href={localizeHref('/')} translate="no" data-no-translate className="flex items-center gap-3 group select-none no-translate notranslate">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white font-black text-2xl shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-transform group-hover:scale-110 group-hover:rotate-3 no-translate notranslate" translate="no" data-no-translate>
                T
              </div>
              <span translate="no" data-no-translate className="text-2xl font-black tracking-tighter text-gray-900 dark:text-white no-translate notranslate">
                ToolWala <span translate="no" data-no-translate className="text-blue-600 dark:text-blue-500 no-translate notranslate">AI</span>
              </span>
            </Link>
            
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed font-medium text-sm">
              {t('footer.tagline', 'Free utility tools that prioritize user privacy. Core tools run 100% locally in your browser, while AI features use secure encrypted processing with zero data retention.')}
            </p>

            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-white">{t('footer.subscribe_releases', 'Subscribe to Releases')}</h4>
              <form onSubmit={handleSubscribe} className="flex max-w-sm rounded-xl overflow-hidden bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 p-1.5 focus-within:border-blue-500/50 transition-colors">
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@email.com"
                  className="bg-transparent text-xs outline-none border-none py-2 px-3 flex-1 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-600 focus:ring-0"
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
              <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-4 py-2 rounded-full border border-emerald-500/20">
                <ShieldCheck className="w-3.5 h-3.5" />
                {t('footer.browser_native', 'Browser-Native')}
              </div>
              <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 bg-blue-500/10 px-4 py-2 rounded-full border border-blue-500/20">
                <Sparkles className="w-3.5 h-3.5 fill-blue-600 dark:fill-blue-400" />
                {t('footer.gdpr_compliant', 'GDPR Compliant')}
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-[0.2em]">{t('nav.categories', 'Categories')}</h3>
            <ul className="space-y-4">
              {localizedCategories.map((cat) => (
                <li key={cat.name}>
                  <Link 
                    href={cat.href} 
                    className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-white text-xs font-bold transition-colors block"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-[0.2em]">{t('footer.tools', 'Top Tools')}</h3>
            <ul className="space-y-4">
              {localizedTopTools.map((tool) => (
                <li key={tool.name}>
                  <Link 
                    href={tool.href} 
                    className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-white text-xs font-bold transition-colors block"
                  >
                    {tool.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-[0.2em]">{t('footer.gov_hubs', 'Gov Hubs')}</h3>
            <ul className="space-y-4">
              {localizedGovHubs.map((hub) => (
                <li key={hub.name}>
                  <Link 
                    href={hub.href} 
                    className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-white text-xs font-bold transition-colors block"
                  >
                    {hub.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="lg:col-span-1 space-y-6">
            <h3 className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-[0.2em]">{t('footer.sitemap', 'Sitemap')}</h3>
            <ul className="space-y-4">
              {localizedSitemap.map((item) => (
                <li key={item.name}>
                  <Link 
                    href={item.href} 
                    className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-white text-xs font-bold transition-colors block"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="lg:col-span-2 space-y-6 min-w-0">
            <h3 className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-[0.2em]">{t('footer.contact_header', 'Contact')}</h3>
            <a 
              href="mailto:developtechx@gmail.com" 
              className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 text-xs font-bold transition-all group whitespace-nowrap"
            >
              <div className="w-9 h-9 rounded-xl bg-black/5 dark:bg-white/5 flex items-center justify-center border border-black/10 dark:border-white/10 group-hover:bg-blue-600/10 group-hover:border-blue-600/20 transition-all shrink-0">
                <Mail className="w-4 h-4 text-gray-700 dark:text-gray-300" />
              </div>
              <span translate="no" data-no-translate className="notranslate font-bold text-xs">
                developtechx@gmail.com
              </span>
            </a>
 
            <div className="pt-2">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <span>100% Client-Side & Operational</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-20 pt-10 border-t border-gray-200 dark:border-white/5 flex flex-col lg:flex-row items-center justify-between gap-8 text-center lg:text-left select-none">
          <div className="space-y-4">
            <p className="text-xs text-gray-500 font-bold">
              &copy; {currentYear} <span translate="no" data-no-translate className="no-translate notranslate">ToolWala AI</span>. {t('footer.copyright_notice', 'All rights reserved.')}
            </p>
            <div className="flex flex-wrap justify-center lg:justify-start gap-4.5 text-[10px] font-black uppercase tracking-wider text-gray-500">
              <Link href={localizeHref('/privacy-policy')} prefetch={false} className="hover:text-gray-900 dark:hover:text-gray-400 transition-colors">{t('footer.privacy', 'Privacy Policy')}</Link>
              <Link href={localizeHref('/terms')} prefetch={false} className="hover:text-gray-900 dark:hover:text-gray-400 transition-colors">{t('footer.terms', 'Terms of Service')}</Link>
              <Link href={localizeHref('/disclaimer')} prefetch={false} className="hover:text-gray-900 dark:hover:text-gray-400 transition-colors">{t('footer.disclaimer', 'Disclaimer')}</Link>
              <Link href={localizeHref('/contact')} prefetch={false} className="hover:text-gray-900 dark:hover:text-gray-400 transition-colors">{t('footer.contact', 'Contact Support')}</Link>
            </div>
            
            {/* Horizontal Footer Language Selector Grid */}
            <div className="flex flex-wrap gap-4.5 justify-center lg:justify-start items-center pt-2">
              <Globe className="w-3.5 h-3.5 text-gray-400 dark:text-gray-600" />
              {activeLanguages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  translate="no"
                  className={`text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                    locale === lang.code
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-500 dark:text-gray-600 hover:text-gray-900 dark:hover:text-gray-400'
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
