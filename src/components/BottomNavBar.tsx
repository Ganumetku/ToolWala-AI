"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Sparkles, FileText, LayoutGrid } from 'lucide-react';
import { useTranslation } from '@/components/I18nContext';

export default function BottomNavBar() {
  const pathname = usePathname() || '';
  const { t, locale, localizeHref } = useTranslation();

  // Normalize pathname for active checking
  const cleanPath = pathname.endsWith('/') && pathname.length > 1 ? pathname.slice(0, -1) : pathname;

  const isHomeActive = 
    cleanPath === '' || 
    cleanPath === '/' || 
    cleanPath === `/${locale}` || 
    cleanPath === localizeHref('/');

  const isToolsActive = 
    (cleanPath.includes('/tools') && !cleanPath.includes('/pdf-tools')) || 
    cleanPath === localizeHref('/tools');

  const isPdfActive = 
    cleanPath.includes('/categories/pdf-tools') || 
    cleanPath.includes('/tools/pdf-tools') ||
    cleanPath.includes('/hubs/pdf-tools') ||
    cleanPath.includes('/tools/merge-pdf') ||
    cleanPath.includes('/tools/compress-pdf') ||
    cleanPath.includes('/tools/split-pdf') ||
    cleanPath.includes('/tools/pdf-to-word') ||
    cleanPath.includes('/tools/sign-pdf') ||
    cleanPath.includes('/tools/protect-pdf') ||
    cleanPath.includes('/tools/unlock-pdf') ||
    cleanPath.includes('/tools/crop-pdf') ||
    cleanPath.includes('/tools/aadhaar-pdf');

  const isCategoriesActive = 
    cleanPath.startsWith(localizeHref('/categories')) && 
    !cleanPath.includes('/pdf-tools');

  const navItems = [
    {
      id: 'home',
      label: t('nav.home', 'Home'),
      href: localizeHref('/'),
      icon: Home,
      isActive: isHomeActive,
    },
    {
      id: 'tools',
      label: t('nav.tools', 'Tools'),
      href: localizeHref('/tools'),
      icon: Sparkles,
      isActive: isToolsActive && !isPdfActive,
    },
    {
      id: 'pdf_suite',
      label: t('nav.pdf_suite', 'PDF Suite'),
      href: localizeHref('/categories/pdf-tools'),
      icon: FileText,
      isActive: isPdfActive,
    },
    {
      id: 'categories',
      label: t('nav.categories', 'Categories'),
      href: localizeHref('/categories'),
      icon: LayoutGrid,
      isActive: isCategoriesActive,
    },
  ];

  return (
    <nav 
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-[#090d16]/90 backdrop-blur-xl border-t border-slate-200/80 dark:border-white/10 shadow-[0_-4px_25px_rgba(0,0,0,0.08)] dark:shadow-[0_-8px_30px_rgba(0,0,0,0.6)] px-3 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all duration-200 active:scale-90 select-none group relative ${
                item.isActive 
                  ? 'text-blue-600 dark:text-blue-400 font-bold' 
                  : 'text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {/* Active Background Pill */}
              {item.isActive && (
                <span className="absolute inset-0 bg-blue-50 dark:bg-blue-500/10 rounded-2xl -z-10 animate-in fade-in zoom-in-95 duration-200" />
              )}

              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform duration-200 ${
                  item.isActive ? 'scale-110 stroke-[2.5]' : 'stroke-[1.75] group-hover:scale-105'
                }`} />
                
                {/* Active Indicator Glow Dot */}
                {item.isActive && (
                  <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-blue-600 dark:bg-blue-400 rounded-full shadow-[0_0_8px_#3b82f6]" />
                )}
              </div>

              <span className={`text-[10px] tracking-tight mt-1 transition-all truncate max-w-[70px] ${
                item.isActive ? 'font-black text-blue-600 dark:text-blue-400' : 'font-medium'
              }`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
