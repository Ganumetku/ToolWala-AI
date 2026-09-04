import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import PublicLayoutWrapper from "@/components/PublicLayoutWrapper";
import PwaInstallPrompt from "@/components/PwaInstallPrompt";

export const dynamic = 'force-dynamic';

import { Toaster } from 'sonner';
import GoogleAnalytics from "@/components/analytics/google-analytics";
import { headers } from 'next/headers';
import { I18nProvider } from '@/components/I18nContext';
import LocaleDomTranslator from '@/components/LocaleDomTranslator';
import { ThemeProvider } from '@/components/ThemeContext';
import TopProgressBar from '@/components/TopProgressBar';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  let locale = "en";
  let originalPathname = "/";
  try {
    const headerList = await headers();
    locale = headerList.get('x-locale') || 'en';
    originalPathname = headerList.get('x-original-pathname') || '/';
  } catch (e) {
    // fallback
  }

  const siteUrl = "https://toolwala.co";
  const parts = originalPathname.split('/');
  const cleanPath = ['hi', 'es', 'fr', 'de', 'pt', 'ar', 'id'].includes(parts[1])
    ? '/' + parts.slice(2).join('/')
    : originalPathname;
  
  const cleanPathNoSlash = cleanPath.replace(/\/$/, '') || '/';
  
  const languages: Record<string, string> = {
    'x-default': `${siteUrl}${cleanPathNoSlash === '/' ? '' : cleanPathNoSlash}/`,
    'en': `${siteUrl}${cleanPathNoSlash === '/' ? '' : cleanPathNoSlash}/`
  };
  
  const { getEnabledLocales, getLanguagesConfig } = await import('@/lib/languages');
  const enabledLocales = getEnabledLocales();
  const config = getLanguagesConfig();
  
  enabledLocales.forEach((loc) => {
    if (loc !== 'en' && config[loc]?.seo_enabled) {
      languages[loc] = `${siteUrl}/${loc}${cleanPathNoSlash === '/' ? '' : cleanPathNoSlash}/`;
    }
  });

  // Dynamic Metadata overrides for Client Pages that cannot export metadata
  let toolTitle = "";
  let toolDesc = "";
  
  if (cleanPathNoSlash.startsWith('/tools/')) {
    try {
      const slug = cleanPathNoSlash.replace(/^\/tools\//, '').replace(/\/$/, '');
      if (slug && slug !== 'pdf-tools') {
        const { getToolTranslationWithFallback } = await import('@/lib/tool-translation-service');
        const translation = await getToolTranslationWithFallback(slug, locale);

        if (translation.seoTitle || translation.title) {
          toolTitle = translation.seoTitle || (translation.title.includes('ToolWala') ? translation.title : `${translation.title} – Free & 100% Private | ToolWala AI`);
          toolDesc = translation.seoDescription || translation.description;
        } else {
          const { toolsData } = await import('@/data/tools');
          const matchedStaticTool = toolsData.find(t => t.slug === slug || t.href.replace(/\/$/, '') === cleanPathNoSlash);
          
          if (matchedStaticTool) {
            toolTitle = `${matchedStaticTool.title} – Free & 100% Private | ToolWala AI`;
            toolDesc = matchedStaticTool.description;
          } else {
            const { findToolBySlugServer } = await import('@/lib/tools-server');
            const dbTool = await findToolBySlugServer(slug);
            if (dbTool) {
              toolTitle = dbTool.seoMetadata?.title || `${dbTool.title} – Free & 100% Private | ToolWala AI`;
              toolDesc = dbTool.seoMetadata?.description || dbTool.description;
            } else {
              const formattedTitle = slug
                .split('-')
                .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                .join(' ');
              toolTitle = `Free ${formattedTitle} Online – 100% Private & Fast | ToolWala AI`;
              toolDesc = `Free online ${formattedTitle} tool by ToolWala AI. Fast, secure, and 100% browser-based with no file uploads to servers.`;
            }
          }
        }
      }
    } catch (e) {
      console.error("Error generating dynamic layout metadata for tools:", e);
    }
  }

  let pricingTitle = "";
  let pricingDesc = "";
  if (cleanPathNoSlash === '/pricing') {
    if (locale === 'hi') {
      pricingTitle = "मूल्य निर्धारण योजनाएं | टूलवाला AI";
      pricingDesc = "टूलवाला AI मूल्य निर्धारण योजनाएं देखें। हमारे प्रारंभिक बीटा चरण के दौरान हर उपकरण 100% मुफ़्त है।";
    } else if (locale === 'es') {
      pricingTitle = "Planes de precios | ToolWala AI";
      pricingDesc = "Vea los planes de precios de ToolWala AI. Cada herramienta es 100% gratuita durante nuestra fase beta de acceso anticipado.";
    } else if (locale === 'pt') {
      pricingTitle = "Planos de Preço | ToolWala AI";
      pricingDesc = "Veja os planos de preços da ToolWala AI. Cada ferramenta é 100% gratuita durante nossa fase beta de acesso antecipado.";
    } else if (locale === 'fr') {
      pricingTitle = "Plans tarifaires | ToolWala AI";
      pricingDesc = "Consultez les tarifs de ToolWala AI. Chaque outil est 100% gratuit pendant notre phase bêta d'accès anticipé.";
    } else if (locale === 'de') {
      pricingTitle = "Preise & Tarife | ToolWala AI";
      pricingDesc = "Sehen Sie sich die Preispläne von ToolWala AI an. Jedes Tool ist während unserer Early-Access-Beta-Phase zu 100 % kostenlos.";
    } else if (locale === 'id') {
      pricingTitle = "Paket Harga | ToolWala AI";
      pricingDesc = "Lihat paket harga ToolWala AI. Setiap alat 100% gratis selama fase beta akses awal kami.";
    } else if (locale === 'ar') {
      pricingTitle = "خطط الأسعار | ToolWala AI";
      pricingDesc = "عرض خطط أسعار ToolWala AI. كل أداة مجانية بنسبة 100% خلال مرحلة الوصول المبكر التجريبية.";
    } else {
      pricingTitle = "Pricing Plans | ToolWala AI";
      pricingDesc = "View ToolWala AI pricing plans. Every tool is 100% free during our early access beta phase.";
    }
  }

  let loginTitle = "";
  let loginDesc = "";
  if (cleanPathNoSlash === '/login') {
    if (locale === 'hi') {
      loginTitle = "लॉगिन करें | टूलवाला AI";
      loginDesc = "अपने टूलवाला AI खाते में लॉग इन करें।";
    } else if (locale === 'es') {
      loginTitle = "Iniciar sesión | ToolWala AI";
      loginDesc = "Inicie sesión en su cuenta de ToolWala AI.";
    } else if (locale === 'pt') {
      loginTitle = "Entrar | ToolWala AI";
      loginDesc = "Faça login em sua conta ToolWala AI.";
    } else if (locale === 'fr') {
      loginTitle = "Connexion | ToolWala AI";
      loginDesc = "Connectez-vous à votre compte ToolWala AI.";
    } else if (locale === 'de') {
      loginTitle = "Anmelden | ToolWala AI";
      loginDesc = "Melden Sie sich bei Ihrem ToolWala AI-Konto an.";
    } else if (locale === 'id') {
      loginTitle = "Masuk | ToolWala AI";
      loginDesc = "Masuk ke akun ToolWala AI Anda.";
    } else if (locale === 'ar') {
      loginTitle = "تسجيل الدخول | ToolWala AI";
      loginDesc = "سجل الدخول إلى حسابك في ToolWala AI.";
    } else {
      loginTitle = "Sign In | ToolWala AI";
      loginDesc = "Log in to your ToolWala AI account.";
    }
  }

  const finalTitle = toolTitle || pricingTitle || loginTitle || "";
  const finalDesc = toolDesc || pricingDesc || loginDesc || "";

  const defaultTitle = "ToolWala AI – Free Online PDF, Image & AI Tools";
  const defaultDesc = "ToolWala AI offers fast and free AI tools for image editing, QR codes, resumes, PDFs, voice generation, captions, and more. Simple, powerful, and easy to use.";

  const titleObj = finalTitle ? { default: finalTitle, template: "%s | ToolWala AI" } : {
    default: defaultTitle,
    template: "%s | ToolWala AI"
  };
  const descriptionStr = finalDesc || defaultDesc;

  const shouldNoindex = cleanPathNoSlash.startsWith('/admin') ||
                        cleanPathNoSlash.startsWith('/login') ||
                        cleanPathNoSlash.startsWith('/auth');

  const robotsRule = shouldNoindex
    ? { index: false, follow: false }
    : {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          "max-video-preview": -1,
          "max-image-preview": "large" as const,
          "max-snippet": -1,
        },
      };

  return {
    title: titleObj,
    description: descriptionStr,
    keywords: [
      "AI tools",
      "image tools",
      "PDF tools",
      "QR generator",
      "AI resume builder",
      "AI caption generator",
      "image compressor",
      "background remover",
      "ToolWala AI"
    ],
    authors: [{ name: "ToolWala AI" }],
    creator: "ToolWala AI",
    publisher: "ToolWala AI",
    metadataBase: new URL("https://toolwala.co"),
    alternates: {
      canonical: `${siteUrl}${originalPathname.endsWith('/') ? originalPathname : originalPathname + '/'}`,
      languages
    },
    openGraph: {
      type: "website",
      locale: locale === 'en' ? 'en_US' : `${locale}_${locale.toUpperCase()}`,
      url: `${siteUrl}${originalPathname}`,
      siteName: "ToolWala AI",
      title: finalTitle || defaultTitle,
      description: descriptionStr,
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: finalTitle || defaultTitle,
        }
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: finalTitle || defaultTitle,
      description: descriptionStr,
      images: ["/og-image.png"],
    },
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "any" },
        { url: "/icon.png", type: "image/png", sizes: "32x32" },
        { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
        { url: "/icon-512.png", type: "image/png", sizes: "512x512" },
      ],
      apple: [
        { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
      ],
    },
    manifest: "/manifest.json",
    robots: robotsRule,
  };
}

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://toolwala.co/#organization",
      "name": "ToolWala AI",
      "url": "https://toolwala.co",
      "logo": {
        "@type": "ImageObject",
        "@id": "https://toolwala.co/#logo",
        "url": "https://toolwala.co/icon-512.png",
        "contentUrl": "https://toolwala.co/icon-512.png",
        "caption": "ToolWala AI Logo",
        "inLanguage": "en-US",
        "width": 512,
        "height": 512
      }
    },
    {
      "@type": "WebSite",
      "@id": "https://toolwala.co/#website",
      "url": "https://toolwala.co",
      "name": "ToolWala AI",
      "description": "ToolWala AI offers fast and free AI tools for image editing, QR codes, resumes, PDFs, voice generation, captions, and more. Simple, powerful, and easy to use.",
      "publisher": {
        "@id": "https://toolwala.co/#organization"
      },
      "potentialAction": [
        {
          "@type": "SearchAction",
          "target": {
            "@type": "EntryPoint",
            "urlTemplate": "https://toolwala.co/?search={search_term_string}"
          },
          "query-input": "required name=search_term_string"
        }
      ],
      "inLanguage": "en-US"
    }
  ]
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // NOTE: syncLanguagesDbToJSON() intentionally NOT called here.
  // Running a DB sync on every single SSR request is wasteful and writes to disk
  // (which doesn't work in serverless anyway). Trigger this via a cron job,
  // webhook, or the admin panel instead.

  let locale = "en";
  try {
    const headerList = await headers();
    locale = headerList.get('x-locale') || 'en';
  } catch (e) {
    // fallback
  }

  const { loadTranslations } = await import('@/lib/i18n');
  const messages = await loadTranslations(locale);

  // Load tool translations from dynamic database CMS
  try {
    const { getAllToolTranslations } = await import('@/lib/tool-translation-service');
    const dbTranslations = await getAllToolTranslations(locale);
    messages.tools = {
      ...messages.tools,
      ...dbTranslations
    };
  } catch (err) {
    console.error(`Failed to inject dynamic tool translations:`, err);
  }

  // If the locale is disabled, redirect/fallback to English
  const { getEnabledLocales } = await import('@/lib/languages');
  const enabledLocales = getEnabledLocales();
  if (locale !== 'en' && !enabledLocales.includes(locale)) {
    let originalPathname = "/";
    try {
      const headerList = await headers();
      originalPathname = headerList.get('x-original-pathname') || '/';
    } catch (e) {
      // fallback
    }
    const parts = originalPathname.split('/');
    const cleanPath = '/' + parts.slice(2).join('/');
    const redirectUrl = cleanPath.endsWith('/') ? cleanPath : `${cleanPath}/`;
    
    const { permanentRedirect } = await import('next/navigation');
    permanentRedirect(redirectUrl);
  }

  return (
    <html
      lang={locale}
      dir={locale === 'ar' ? 'rtl' : 'ltr'}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://www.googletagmanager.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('theme');
                  if (saved === 'dark') {
                    document.documentElement.classList.add('dark');
                    document.documentElement.classList.remove('light');
                  } else {
                    document.documentElement.classList.add('light');
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-[#F6F8FC] dark:bg-[#030712] text-[#111827] dark:text-white">
        <ThemeProvider>
          <TopProgressBar />
          <GoogleAnalytics />
          <Toaster position="top-center" richColors />
          <PwaInstallPrompt />
          <I18nProvider locale={locale} messages={messages} enabledLocales={enabledLocales}>
            <LocaleDomTranslator>
              <PublicLayoutWrapper>{children}</PublicLayoutWrapper>
            </LocaleDomTranslator>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

