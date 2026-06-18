"use client";

import React, { createContext, useContext } from 'react';
import { getTranslation, localizeHref } from '@/lib/i18n';

interface I18nContextType {
  locale: string;
  messages: any;
  enabledLocales: string[];
  t: (key: string, fallback?: any) => any;
  localizeHref: (href: string) => string;
}

const I18nContext = createContext<I18nContextType | null>(null);

export function I18nProvider({
  locale,
  messages,
  enabledLocales,
  children,
}: {
  locale: string;
  messages: any;
  enabledLocales: string[];
  children: React.ReactNode;
}) {
  const t = (key: string, fallback?: any) => {
    const val = getTranslation(messages, key, fallback);
    return val !== undefined ? val : key;
  };

  const localizedLink = (href: string) => {
    return localizeHref(href, locale);
  };

  return (
    <I18nContext.Provider value={{ locale, messages, enabledLocales, t, localizeHref: localizedLink }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(I18nContext);
  if (!context) {
    return {
      locale: 'en',
      messages: {},
      enabledLocales: ['en', 'hi', 'es', 'fr', 'de', 'pt', 'ar', 'id'],
      t: (key: string, fallback?: any) => fallback !== undefined ? fallback : key,
      localizeHref: (href: string) => href,
    };
  }
  return context;
}
export { I18nContext };
