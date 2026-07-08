"use client";

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { Menu, X, Rocket, Sparkles, Globe, ChevronDown } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { toolsData } from '@/data/tools';
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

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const langDropdownRef = useRef<HTMLDivElement>(null);
  
  const pathname = usePathname();
  const { t, locale, enabledLocales, localizeHref } = useTranslation();

  // Filter languages to only show the enabled ones in priority order
  const activeLanguages = enabledLocales
    .map(code => LANGUAGES.find(lang => lang.code === code))
    .filter((lang): lang is typeof LANGUAGES[0] => !!lang);
  const currentLanguage = LANGUAGES.find(lang => lang.code === locale) || LANGUAGES[0];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target as Node)) {
        setIsLangDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (pathname && pathname.includes('/tools')) {
      const parts = pathname.split('/');
      const ALL_LANG_CODES = ['hi', 'es', 'fr', 'de', 'pt', 'ar', 'id'];
      const cleanHref = ALL_LANG_CODES.includes(parts[1])
        ? '/' + parts.slice(2).join('/')
        : pathname;

      const matchedTool = toolsData.find(tool => tool.href === cleanHref || tool.href + '/' === cleanHref);
      if (matchedTool) {
        try {
          const key = 'recentlyUsedTools';
          const recent = JSON.parse(localStorage.getItem(key) || '[]');
          const updated = [matchedTool.id, ...recent.filter((id: string) => id !== matchedTool.id)].slice(0, 4);
          localStorage.setItem(key, JSON.stringify(updated));
        } catch (e) {
          console.error('Error saving recent tools:', e);
        }
      }
    }
  }, [pathname]);

  const handleLanguageChange = (newLocale: string) => {
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
    localStorage.setItem('preferredLocale', newLocale);

    // Compute the new pathname
    const currentPathname = window.location.pathname;
    const pathnameParts = currentPathname.split('/');
    
    // Check if first segment is a supported locale (excluding English)
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
    // Maintain trailing slash config (trailingSlash: true)
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

  const pdfSuiteTools = [
    { name: 'Merge PDF', href: '/tools/merge-pdf', icon: '🔀' },
    { name: 'Split PDF', href: '/tools/split-pdf', icon: '✂️' },
    { name: 'Compress PDF', href: '/tools/compress-pdf', icon: '📉' },
    { name: 'PDF to JPG', href: '/tools/pdf-to-jpg', icon: '🖼️' },
    { name: 'JPG to PDF', href: '/tools/jpg-to-pdf', icon: '🖼️' },
    { name: 'Word to PDF', href: '/tools/word-to-pdf-converter', icon: '📄' },
    { name: 'PDF to Word', href: '/tools/pdf-to-word-converter', icon: '📝' },
    { name: 'Crop PDF', href: '/tools/crop-pdf', icon: '✂️' },
    { name: 'Rotate PDF', href: '/tools/rotate-pdf', icon: '🔄' },
    { name: 'Watermark PDF', href: '/tools/watermark-pdf', icon: '🎨' },
    { name: 'Unlock PDF', href: '/tools/unlock-pdf', icon: '🔓' },
    { name: 'Protect PDF', href: '/tools/protect-pdf', icon: '🔒' },
    { name: 'Remove Pages', href: '/tools/remove-pages', icon: '🗑️' },
    { name: 'Organize PDF', href: '/tools/organize-pdf', icon: '🧩' },
    { name: 'OCR PDF', href: '/tools/pdf-ocr', icon: '🔍' },
  ];

  const navigation = [
    { name: t('nav.home', 'Home'), href: '/' },
    { name: t('nav.tools', 'Tools'), href: '/tools' },
    { 
      name: t('nav.pdf_suite', 'PDF Suite'), 
      href: '#', 
      submenu: pdfSuiteTools 
    },
    { name: t('nav.categories', 'Categories'), href: '/categories' },
    { name: t('nav.pricing', 'Pricing'), href: '/pricing' },
    { name: t('nav.privacy', 'Privacy Hub'), href: '/privacy' },
    { name: t('nav.blog', 'Blog'), href: '/blog' },
    { name: t('nav.about', 'About'), href: '/about' },
    { name: t('nav.contact', 'Contact Us'), href: '/contact' },
  ];

  const [isPdfDropdownOpen, setIsPdfDropdownOpen] = useState(false);
  const [isMobilePdfOpen, setIsMobilePdfOpen] = useState(false);
  const pdfDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target as Node)) {
        setIsLangDropdownOpen(false);
      }
      if (pdfDropdownRef.current && !pdfDropdownRef.current.contains(event.target as Node)) {
        setIsPdfDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header 
      className={`sticky top-0 z-50 w-full transition-all duration-500 ${
        isScrolled 
          ? 'glass border-b border-white/5 py-3.5 sm:py-3' 
          : 'bg-[#030712]/85 backdrop-blur-md border-b border-white/5 py-3.5 sm:bg-transparent sm:backdrop-blur-none sm:border-b-0 sm:py-6'
      }`}
    >
      <div className="container mx-auto flex items-center justify-between px-3 sm:px-4 lg:px-4 xl:px-6 gap-2 xl:gap-4 2xl:gap-8">
        <div className="flex items-center gap-1 sm:gap-2">
          <Link href={localizeHref('/')} translate="no" data-no-translate className="flex items-center gap-2 sm:gap-3 group whitespace-nowrap shrink-0 no-translate notranslate">
            <div className="flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-xl sm:rounded-2xl bg-blue-600 text-white font-black text-xl sm:text-2xl transition-all group-hover:scale-110 group-hover:rotate-3 shadow-[0_0_20px_rgba(37,99,235,0.4)] relative overflow-hidden no-translate notranslate" translate="no" data-no-translate>
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
              T
            </div>
            <span translate="no" data-no-translate className="text-lg sm:text-2xl font-black tracking-tighter text-white whitespace-nowrap no-translate notranslate">
              ToolWala <span translate="no" data-no-translate className="text-blue-500 no-translate notranslate">AI</span>
            </span>
          </Link>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-0.5 2xl:gap-1 bg-white/5 p-1 rounded-full border border-white/10 backdrop-blur-md">
          {navigation.map((item) => {
            if (item.submenu) {
              const hasActiveSub = item.submenu.some(sub => pathname === localizeHref(sub.href));
              return (
                <div className="relative" key={item.name} ref={pdfDropdownRef}>
                  <button
                    onClick={() => setIsPdfDropdownOpen(!isPdfDropdownOpen)}
                    className={`px-2 xl:px-3 2xl:px-5 py-2 rounded-full text-[9px] min-[1100px]:text-[10px] 2xl:text-xs font-black uppercase tracking-wider 2xl:tracking-widest transition-all whitespace-nowrap flex items-center gap-1 cursor-pointer select-none ${
                      isPdfDropdownOpen || hasActiveSub
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {item.name}
                    <ChevronDown className={`w-3 h-3 xl:w-3.5 xl:h-3.5 transition-transform duration-300 ${isPdfDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isPdfDropdownOpen && (
                    <div className="absolute left-1/2 -translate-x-1/2 mt-4 w-[600px] rounded-3xl border border-white/10 bg-[#090d16]/98 p-6 shadow-[0_10px_50px_rgba(0,0,0,0.8)] backdrop-blur-xl animate-fade-in z-50 grid grid-cols-3 gap-3">
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[1px] w-24 bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
                      {item.submenu.map((sub) => {
                        const slug = sub.href.split('/').pop() || '';
                        return (
                          <Link
                            key={sub.href}
                            href={localizeHref(sub.href)}
                            onClick={() => setIsPdfDropdownOpen(false)}
                            className="flex items-center gap-2.5 p-3 rounded-xl hover:bg-white/5 transition-all group"
                          >
                            <span className="text-base group-hover:scale-110 transition-transform">{sub.icon}</span>
                            <span className="text-[10px] font-black text-gray-300 group-hover:text-blue-400 transition-colors uppercase truncate">
                              {t(`tools.${slug}.title`, sub.name)}
                            </span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            const localizedHrefValue = localizeHref(item.href);
            const isActive = pathname === localizedHrefValue || 
              (item.href !== '/' && pathname?.startsWith(localizedHrefValue));
            return (
              <Link 
                key={item.name} 
                href={localizedHrefValue} 
                className={`px-2 xl:px-3 2xl:px-5 py-2 rounded-full text-[9px] min-[1100px]:text-[10px] 2xl:text-xs font-black uppercase tracking-wider 2xl:tracking-widest transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="hidden lg:flex items-center gap-1.5 xl:gap-2 2xl:gap-4">
          {/* Custom Premium Language Dropdown */}
          <div className="relative" ref={langDropdownRef}>
            <button
              onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
              className="flex items-center gap-1 xl:gap-1.5 2xl:gap-2.5 rounded-full bg-white/5 hover:bg-white/10 px-2 xl:px-2.5 2xl:px-4 py-2 text-[9px] min-[1100px]:text-[10px] 2xl:text-xs font-bold text-gray-300 hover:text-white border border-white/10 hover:border-blue-500/30 transition-all select-none cursor-pointer whitespace-nowrap shrink-0"
            >
              <Globe className="w-3 xl:w-3.5 xl:h-3.5 h-3.5 text-blue-500" />
              <span translate="no" className="whitespace-nowrap">{currentLanguage.flag} {currentLanguage.name}</span>
              <ChevronDown className={`w-3 xl:w-3.5 xl:h-3.5 h-3.5 text-gray-500 transition-transform duration-300 ${isLangDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isLangDropdownOpen && (
              <div className="absolute right-0 mt-2.5 w-56 rounded-2xl border border-white/10 bg-[#090d16]/98 p-2.5 shadow-[0_10px_40px_rgba(0,0,0,0.6)] backdrop-blur-xl animate-fade-in z-50">
                <div className="absolute top-0 right-8 h-[1px] w-12 bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
                <div className="text-[9px] font-black uppercase tracking-widest text-gray-500 px-3.5 py-2">{t('nav.select_language', 'Select Language')}</div>
                <div className="space-y-1">
                  {activeLanguages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        handleLanguageChange(lang.code);
                        setIsLangDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        locale === lang.code
                          ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20'
                          : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                      }`}
                    >
                      <span className="flex items-center gap-2.5">
                        <span className="text-base leading-none">{lang.flag}</span>
                        <span translate="no">{lang.name}</span>
                      </span>
                      {locale === lang.code && <span className="h-1.5 w-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_#2563eb]" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Link 
            href={localizeHref('/tools')} 
            className="group relative flex items-center gap-1 xl:gap-1.5 2xl:gap-2 rounded-full bg-white px-2.5 xl:px-4 2xl:px-7 py-2 text-[10px] min-[1100px]:text-[11px] 2xl:text-sm font-black text-black hover:scale-105 active:scale-95 transition-all shadow-xl hover:shadow-white/10 overflow-hidden whitespace-nowrap shrink-0"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <Rocket className="w-3.5 h-3.5 xl:w-4 xl:h-4 relative z-10" suppressHydrationWarning />
            <span className="relative z-10 whitespace-nowrap">{t('nav.start_free', 'Start Free')}</span>
          </Link>
        </div>
 
        {/* Mobile menu button */}
        <div className="lg:hidden flex items-center gap-2">
          {/* Quick Lang Indicator for mobile */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 border border-white/10 text-sm leading-none shrink-0"
          >
            {currentLanguage.flag}
          </button>
          
          <button
            type="button"
            className="text-white hover:text-blue-400 focus:outline-none p-2 bg-white/5 rounded-lg border border-white/10 backdrop-blur-md transition-all h-9 w-9 flex items-center justify-center shrink-0"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <span className="sr-only">Open main menu</span>
            {isMobileMenuOpen ? (
              <X className="h-4 w-4" aria-hidden="true" suppressHydrationWarning />
            ) : (
              <Menu className="h-4 w-4" aria-hidden="true" suppressHydrationWarning />
            )}
          </button>
        </div>
      </div>
 
      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-[64px] bottom-0 z-50 bg-[#030712]/98 backdrop-blur-2xl animate-fade-in border-t border-white/5 overflow-y-auto pb-10">
          <div className="flex flex-col p-6 gap-4">
            {navigation.map((item) => {
              if (item.submenu) {
                return (
                  <div className="space-y-2" key={item.name}>
                    <button
                      onClick={() => setIsMobilePdfOpen(!isMobilePdfOpen)}
                      className="w-full flex items-center justify-between p-4.5 rounded-2xl text-lg font-black bg-white/5 border border-white/5 text-white"
                    >
                      <span>{item.name}</span>
                      <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isMobilePdfOpen ? 'rotate-180 text-blue-500' : ''}`} />
                    </button>
                    {isMobilePdfOpen && (
                      <div className="grid grid-cols-2 gap-2 p-2 bg-black/20 border border-white/5 rounded-2xl animate-fade-in">
                        {item.submenu.map((sub) => {
                          const slug = sub.href.split('/').pop() || '';
                          return (
                            <Link
                              key={sub.href}
                              href={localizeHref(sub.href)}
                              onClick={() => {
                                setIsMobileMenuOpen(false);
                                setIsMobilePdfOpen(false);
                              }}
                              className="flex items-center gap-2.5 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all"
                            >
                              <span className="text-base">{sub.icon}</span>
                              <span className="text-xs font-black text-gray-300 uppercase truncate">
                                {t(`tools.${slug}.title`, sub.name)}
                              </span>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              const localizedHrefValue = localizeHref(item.href);
              const isActive = pathname === localizedHrefValue || 
                (item.href !== '/' && pathname?.startsWith(localizedHrefValue));
              return (
                <Link
                  key={item.name}
                  href={localizedHrefValue}
                  className={`flex items-center justify-between p-4.5 rounded-2xl text-lg font-black transition-all ${
                    isActive
                      ? 'bg-blue-600/10 text-blue-500 border border-blue-500/20' 
                      : 'text-white bg-white/5 border border-white/5'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                  <Sparkles className={`w-4 h-4 ${isActive ? 'text-blue-500' : 'text-transparent'}`} suppressHydrationWarning />
                </Link>
              );
            })}

            {/* Mobile Language Selector Grid */}
            <div className="mt-4 p-5 rounded-2xl bg-white/[0.01] border border-white/5 space-y-4">
              <div className="text-[10px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-blue-500" /> {t('nav.select_language', 'Select Language')}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {activeLanguages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      handleLanguageChange(lang.code);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`flex items-center gap-2 p-3 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                      locale === lang.code
                        ? 'bg-blue-600/10 text-blue-400 border-blue-500/20 shadow-[0_0_15px_rgba(37,99,235,0.1)]'
                        : 'bg-white/5 text-gray-400 border-transparent hover:text-white'
                    }`}
                  >
                    <span className="text-base leading-none">{lang.flag}</span>
                    <span className="truncate" translate="no">{lang.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-white/5">
              <Link 
                href={localizeHref('/tools')} 
                className="flex items-center justify-center gap-3 rounded-2xl bg-blue-600 p-4.5 text-lg font-black text-white shadow-2xl shadow-blue-500/20 active:scale-[0.98] transition-all"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Rocket className="w-5 h-5" suppressHydrationWarning />
                {t('nav.get_started_free', 'Get Started Free')}
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

