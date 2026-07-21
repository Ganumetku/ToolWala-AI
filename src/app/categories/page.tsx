import { Metadata } from 'next';
import Link from 'next/link';
import { 
  ShieldCheck, HelpCircle, Layers, Grid, Zap, Shield, 
  Check, X, FileText, ImageIcon, Settings, Sparkles, Star, Clock, ChevronRight 
} from 'lucide-react';
import CategoriesIndexClient from './CategoriesIndexClient';
import { categoriesData, getToolsByCategory } from '@/data/categories';
import { toolsData } from '@/data/tools';
import { getTranslationServer } from '@/lib/i18n-server';
import { MeshGradient, FloatingParticles } from '@/components/BackgroundEffects';
import { hubsData } from '@/data/hubs';
import { landingPagesData } from '@/data/landingPages';
import { 
  buildBreadcrumbJsonLd, 
  buildFAQSchema, 
  buildWebPageSchema, 
  getLocalizedCanonicalUrl,
  getAlternateLanguages 
} from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  let locale = "en";
  try {
    const { headers } = await import('next/headers');
    const headerList = await headers();
    locale = headerList.get('x-locale') || 'en';
  } catch (e) {}

  const liveToolsCount = toolsData.filter(t => t.isVisible && t.status === 'published').length;

  let title = "Browse Free Online Tools by Category | ToolWala AI";
  let description = `Browse categorized directories of ${liveToolsCount}+ browser-local design, PDF, AI, document, resume, and developer tools. Fast, secure, and GDPR compliant.`;
  let ogDescription = "Secure browser-local AI utilities. Browse categorized directories for fast document processing, image optimization, and content creations.";

  if (locale === 'hi') {
    title = `सभी श्रेणियां ब्राउज़ करें - ${liveToolsCount}+ स्थानीय एआई टूल्स | टूलवाला AI`;
    description = `${liveToolsCount}+ ब्राउज़र-स्थानीय डिज़ाइन, पीडीएफ, एआई, दस्तावेज़, रिज्यूमे और डेवलपर टूल की वर्गीकृत निर्देशिकाएं ब्राउज़ करें। तेज़, सुरक्षित और जीडीपीआर अनुपालन।`;
    ogDescription = "सुरक्षित ब्राउज़र-स्थानीय एआई उपयोगिताएँ। तेज़ दस्तावेज़ प्रसंस्करण, छवि अनुकूलन और सामग्री निर्माण के लिए वर्गीकृत निर्देशिकाएं ब्राउज़ करें।";
  } else if (locale === 'es') {
    title = `Explorar todas las categorías - Más de ${liveToolsCount} utilidades locales de IA | ToolWala AI`;
    description = `Explore directorios categorizados de más de ${liveToolsCount} herramientas de diseño, PDF, IA, documentos, currículos y desarrollo locales en el navegador. Rápido, seguro y cumple con GDPR.`;
    ogDescription = "Utilidades de IA seguras locales en el navegador. Explore directorios categorizados para un procesamiento rápido de documentos, optimización de imagens y creación de contenido.";
  }

  const path = '/categories';
  const canonical = getLocalizedCanonicalUrl(path, locale);
  const languages = getAlternateLanguages(path);

  return {
    title,
    description,
    keywords: "tool categories, pdf tools, image tools, ai tools, document tools, resume tools, developer tools, social media tools",
    alternates: {
      canonical,
      languages
    },
    openGraph: {
      title,
      description: ogDescription,
      url: `https://toolwala.co/${locale === 'en' ? 'categories' : locale + '/categories'}/`,
      type: "website"
    }
  };
}

export default async function CategoriesIndexPage() {
  const { t, locale } = await getTranslationServer();

  // Compute live initial tools list (published & visible)
  const initialMergedTools = toolsData.filter(t => t.isVisible && t.status === 'published');
  
  // Calculate tool count for each category
  const initialCategoryCounts = categoriesData.reduce((acc, cat) => {
    const list = getToolsByCategory(cat.id, initialMergedTools);
    acc[cat.id] = list.length;
    return acc;
  }, {} as Record<string, number>);

  const canonicalUrl = getLocalizedCanonicalUrl('/categories', locale);
  
  // SEO Schemas
  const breadcrumbItems = [
    { name: t('nav.home', 'Home'), href: locale === 'en' ? '/' : `/${locale}` },
    { name: t('nav.categories', 'Categories'), href: locale === 'en' ? '/categories' : `/${locale}/categories` }
  ];

  const collectionPageSchema = {
    '@type': 'CollectionPage',
    '@id': `${canonicalUrl}#collection`,
    'url': canonicalUrl,
    'name': t('categories.seo_title', 'Browse Free Online Tools by Category | ToolWala AI'),
    'description': t('categories.seo_desc', 'Browse categorized directories of 25+ browser-local design, PDF, AI, document, resume, and developer tools. Fast, secure, and GDPR compliant.').replace('25+', `${initialMergedTools.length}+`).replace('25', initialMergedTools.length.toString()),
    'isPartOf': {
      '@type': 'WebSite',
      '@id': 'https://toolwala.co/#website',
      'url': 'https://toolwala.co',
      'name': 'ToolWala AI'
    },
    'about': {
      '@type': 'Thing',
      'name': t('categories.title_main', 'Browse Categories')
    },
    'mainEntity': {
      '@type': 'ItemList',
      'numberOfItems': categoriesData.length,
      'itemListElement': categoriesData.map((cat, index) => ({
        '@type': 'ListItem',
        'position': index + 1,
        'url': `https://toolwala.co${locale === 'en' ? '' : '/' + locale}/categories/${cat.slug}/`
      }))
    }
  };

  const faqs = [
    {
      question: t('categories.faq.q1', 'What makes ToolWala’s categories hub unique?'),
      answer: t('categories.faq.a1', 'ToolWala organizes all client-side tools into logical, specialized folders (such as PDF, image processing, or developer helpers). Each category acts as a complete, crawlable sub-directory containing related local utilities.')
    },
    {
      question: t('categories.faq.q2', 'Why is local browser-native processing safer than traditional online converters?'),
      answer: t('categories.faq.a2', 'Traditional online document suites upload your confidential files to remote web servers where they can be logged or leaked. ToolWala processes files completely on your device’s local CPU using WebAssembly and HTML5 canvas layers, meaning your files never leave your system.')
    },
    {
      question: t('categories.faq.q3', 'Are there any usage limits or hidden fees on category pages?'),
      answer: t('categories.faq.a3', 'No. Every tool listed in our categories is 100% free and requires no account signup, subscription, or software downloads. You can process as many files as you need without restrictions.')
    },
    {
      question: t('categories.faq.q4', 'Do these tools work offline?'),
      answer: t('categories.faq.a4', 'Yes. Once you load a category page and open a tool, the application code resides inside your browser cache. You can completely disconnect your internet and continue compiling resumes, resizing photos, or numbering pages locally.')
    }
  ];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      buildWebPageSchema(
        t('categories.seo_title', 'Browse Free Online Tools by Category | ToolWala AI'),
        t('categories.seo_desc', 'Browse categorized directories of 25+ browser-local design, PDF, AI, document, resume, and developer tools. Fast, secure, and GDPR compliant.').replace('25+', `${initialMergedTools.length}+`).replace('25', initialMergedTools.length.toString()),
        canonicalUrl,
        locale
      ),
      buildBreadcrumbJsonLd(breadcrumbItems),
      collectionPageSchema,
      buildFAQSchema(faqs)
    ]
  };

  // Structured popular/recent arrays
  const popularCategories = categoriesData.slice(0, 4);
  const recentCategories = [
    categoriesData.find(c => c.id === 'pdf-tools'),
    categoriesData.find(c => c.id === 'image-tools'),
    categoriesData.find(c => c.id === 'calculator-tools')
  ].filter((c): c is typeof categoriesData[0] => !!c);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="bg-slate-50/50 dark:bg-[#030712] min-h-screen py-24 relative overflow-hidden font-sans text-gray-900 dark:text-white transition-colors duration-250">
        <MeshGradient />
        <FloatingParticles />

        {/* Glow grid background */}
        <div className="absolute top-0 left-0 w-full h-[600px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-500/5 dark:from-blue-900/10 via-transparent to-transparent pointer-events-none z-0" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
          
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-600 dark:text-gray-500 mb-10">
            <Link href={locale === 'en' ? '/' : `/${locale}`} className="hover:text-blue-600 dark:hover:text-blue-500 transition-colors">
              {t('nav.home', 'Home')}
            </Link>
            <span className="text-gray-400 dark:text-gray-600">/</span>
            <span className="text-gray-800 dark:text-gray-400">{t('nav.categories', 'Categories')}</span>
          </nav>

          {/* Header Hero */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-black uppercase tracking-widest border border-blue-200 dark:border-blue-500/20 mb-6">
              <Grid className="w-3.5 h-3.5" />
              {t('categories.hub_badge', 'Categorized Hub')}
            </div>
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-gray-900 dark:text-white mb-6 uppercase leading-none">
              Browse Free Online Tools <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400">
                by Category
              </span>
            </h1>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
              {t('categories.subtitle', 'Explore our comprehensive, categorized directory of 25+ browser-local AI utilities. Secure, private, and sub-second fast.').replace('25+', `${initialMergedTools.length}+`).replace('25', initialMergedTools.length.toString())}
            </p>
          </div>

          {/* Core Categories Search & Grid (Pre-rendered and Client-Interactive) */}
          <div className="mb-24">
            <CategoriesIndexClient 
              initialCategoryCounts={initialCategoryCounts}
              initialMergedTools={initialMergedTools}
            />
          </div>

          {/* Unique Content Section (H2 / H3 SEO Rich Content) */}
          <section className="glass rounded-[2.5rem] border border-gray-200 dark:border-white/5 p-8 sm:p-14 bg-white/80 dark:bg-white/[0.01] shadow-2xl mb-16 space-y-10 text-left">
            <div className="max-w-4xl space-y-6">
              <h2 className="text-2xl sm:text-3xl font-black uppercase text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                The Ultimate Browser-Native Category Hub
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed font-sans">
                Welcome to the ToolWala category hub, a structured collection of digital utilities built entirely for the modern, privacy-conscious user. Finding document helpers, image compression setups, or developer assistants shouldn't force you into a frustrating choice between subscribing to expensive platforms or uploading confidential documents to remote cloud storage.
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed font-sans">
                At ToolWala, we have created dedicated directories containing browser-local tools. Each folder is optimized for quick navigation, ensuring you can access operations directly without page reloads. Whether you need to sign a PDF contract, size Aadhaar photos, or generate static QR codes, you can discover all tools categorized by their function below.
              </p>
            </div>

            <hr className="border-gray-200 dark:border-white/5" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-4">
                <h3 className="text-lg font-black uppercase text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  Uncompromising Sandbox Security
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed font-sans">
                  Unlike traditional online tool ecosystems that store files on third-party databases, our utilities execute entirely in your browser. We compile advanced engines into WebAssembly (WASM) threads, allowing your device's local CPU to manage calculations. Your files never cross the network, guaranteeing 100% data sovereignty.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-black uppercase text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  Lightning-Fast Local Performance
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed font-sans">
                  By removing the server upload and download loop, our processing happens instantaneously. Large files are processed directly in your active tab memory. Once loaded, the category tools can even be accessed offline, making them ideal for professionals working on sensitive documents without reliable network connections.
                </p>
              </div>
            </div>
          </section>

          {/* Quick-Link Highlight Sections (Most Popular & Recently Updated) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16 text-left">
            
            {/* Popular Categories */}
            <div className="lg:col-span-7 glass rounded-[2.5rem] border border-gray-200 dark:border-white/5 p-8 bg-white/80 dark:bg-white/[0.01] shadow-2xl flex flex-col justify-between">
              <div>
                <h2 className="text-xl font-black uppercase tracking-tight text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" /> Most Popular Categories
                </h2>
                <p className="text-xs text-gray-600 dark:text-gray-500 mb-6 font-semibold">
                  Most frequently visited tool categories for daily operations.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {popularCategories.map(cat => (
                    <Link
                      key={cat.id}
                      href={locale === 'en' ? `/categories/${cat.slug}` : `/${locale}/categories/${cat.slug}`}
                      className="p-5 border border-gray-200 dark:border-white/5 hover:border-blue-500/30 bg-gray-50 dark:bg-white/[0.02] hover:bg-gray-100 dark:hover:bg-blue-600/5 rounded-2xl flex items-center justify-between group transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{cat.icon}</span>
                        <div className="text-left">
                          <span className="text-xs font-black text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 uppercase tracking-tight block">
                            {t('categories.' + cat.title, cat.title)}
                          </span>
                          <span className="text-[10px] text-gray-500 font-bold block mt-0.5">
                            {initialCategoryCounts[cat.id] || 0} Tools
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-500 group-hover:translate-x-0.5 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-all" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Recently Updated Categories */}
            <div className="lg:col-span-5 glass rounded-[2.5rem] border border-gray-200 dark:border-white/5 p-8 bg-white/80 dark:bg-white/[0.01] shadow-2xl flex flex-col justify-between">
              <div>
                <h2 className="text-xl font-black uppercase tracking-tight text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" /> Recently Updated
                </h2>
                <p className="text-xs text-gray-600 dark:text-gray-500 mb-6 font-semibold">
                  Categories with new tools added recently.
                </p>
                <div className="space-y-3">
                  {recentCategories.map(cat => (
                    <Link
                      key={cat.id}
                      href={locale === 'en' ? `/categories/${cat.slug}` : `/${locale}/categories/${cat.slug}`}
                      className="p-4 border border-gray-200 dark:border-white/5 hover:border-blue-500/30 bg-gray-50 dark:bg-white/[0.02] hover:bg-gray-100 dark:hover:bg-blue-600/5 rounded-2xl flex items-center justify-between group transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{cat.icon}</span>
                        <div>
                          <span className="text-xs font-black text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 uppercase tracking-tight block">
                            {t('categories.' + cat.title, cat.title)}
                          </span>
                          <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider block mt-0.5">
                            Active Updates
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-500 group-hover:translate-x-0.5 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-all" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* Government Portal & Exam Compliance Hubs */}
          <section className="glass rounded-[2.5rem] border border-gray-200 dark:border-white/5 p-8 sm:p-14 bg-white/80 dark:bg-white/[0.01] shadow-2xl mb-16 text-left">
            <div className="max-w-3xl mb-10">
              <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-gray-900 dark:text-white mb-4 flex items-center gap-2.5">
                <Layers className="w-6 h-6 text-blue-600 dark:text-blue-400" /> Government & Exam Compliance Hubs
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed font-sans">
                Are you preparing documents for Indian recruitment systems, biometric updates, or passport applications? Explore our dedicated compliance hubs containing tools and guidelines customized to meet official specifications.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {hubsData.map((hub) => (
                <Link
                  key={hub.slug}
                  href={locale === 'en' ? `/hubs/${hub.slug}` : `/${locale}/hubs/${hub.slug}`}
                  className="p-6 rounded-2xl border border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-[#0b0f19]/40 hover:border-blue-500/20 hover:bg-gray-100 dark:hover:bg-blue-500/[0.01] transition-all group flex flex-col justify-between cursor-pointer animate-in fade-in"
                >
                  <div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/10 border border-blue-500/10 text-xl mb-4 group-hover:scale-110 transition-transform">
                      {hub.icon}
                    </div>
                    <h3 className="text-sm font-black text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 uppercase tracking-tight mb-2 transition-colors">
                      {hub.title.split(' | ')[0].split(' - ')[0]}
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-500 font-medium leading-relaxed mb-4 line-clamp-2">
                      {hub.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors pt-2 border-t border-gray-200 dark:border-white/5">
                    Explore Hub
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Quick Sizing & Format Landing Pages */}
          <section className="glass rounded-[2.5rem] border border-gray-200 dark:border-white/5 p-8 sm:p-14 bg-white/80 dark:bg-white/[0.01] shadow-2xl mb-16 text-left">
            <div className="max-w-3xl mb-10">
              <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-gray-900 dark:text-white mb-4 flex items-center gap-2.5">
                <Sparkles className="w-6 h-6 text-amber-500 dark:text-amber-400" /> Specialized Sizing & Format Guides
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed font-sans">
                Quickly resize and format your passport photos, scanned signatures, and PDF certificates to target limits (20KB, 50KB, 100KB, 200KB, 300KB, 500KB, 1MB) online for free.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {landingPagesData.map((lp) => (
                <Link
                  key={lp.slug}
                  href={locale === 'en' ? `/landing/${lp.slug}` : `/${locale}/landing/${lp.slug}`}
                  className="p-4 rounded-xl border border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-[#0b0f19]/30 hover:border-blue-500/20 hover:bg-gray-100 dark:hover:bg-blue-500/[0.01] transition-all group flex items-center justify-between cursor-pointer"
                >
                  <div className="text-left pr-4">
                    <span className="text-xs font-black text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 uppercase tracking-tight line-clamp-1 transition-colors">
                      {lp.h1}
                    </span>
                    <span className="text-[9px] text-gray-500 font-bold block mt-1 uppercase tracking-wider">
                      {lp.badgeText}
                    </span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-500 group-hover:translate-x-0.5 group-hover:text-gray-900 dark:group-hover:text-white transition-all flex-shrink-0" />
                </Link>
              ))}
            </div>
          </section>

          {/* Privacy First Section (Table comparing ToolWala vs cloud alternatives) */}
          <section className="glass rounded-[2.5rem] border border-gray-200 dark:border-white/5 p-8 sm:p-14 bg-white/80 dark:bg-white/[0.01] shadow-2xl mb-16 text-left">
            <div className="max-w-3xl mb-10">
              <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-gray-900 dark:text-white mb-4 flex items-center gap-2.5">
                <Shield className="w-6 h-6 text-emerald-600 dark:text-emerald-400" /> Privacy-First Browser Processing
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed font-sans">
                Our main differentiator is security. Standard online tool categories require you to upload your files, identity details, or invoices to their host servers. This exposes you to database hacks, file scrapes, and privacy policy leaks. ToolWala performs all transformations inside your browser cache.
              </p>
            </div>

            <div className="overflow-x-auto border border-gray-200 dark:border-white/10 rounded-2xl font-sans">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-white/10 bg-gray-100 dark:bg-white/5">
                    <th className="p-4 font-bold uppercase tracking-wider text-xs text-gray-600 dark:text-gray-400">Security Metrics</th>
                    <th className="p-4 font-bold uppercase tracking-wider text-xs text-blue-600 dark:text-blue-400">ToolWala Local Sandbox</th>
                    <th className="p-4 font-bold uppercase tracking-wider text-xs text-gray-600 dark:text-gray-400">Traditional Cloud Tools</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-white/5 text-sm">
                  <tr>
                    <td className="p-4 font-semibold text-gray-900 dark:text-white">File Uploads</td>
                    <td className="p-4 text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-2">
                      <X className="w-4 h-4 text-red-500 shrink-0" /> None (Runs locally)
                    </td>
                    <td className="p-4 text-gray-600 dark:text-gray-400">Yes (Requires network transit)</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-semibold text-gray-900 dark:text-white">Data Retention</td>
                    <td className="p-4 text-emerald-600 dark:text-emerald-400 font-semibold">0% Saved (Volatile Memory)</td>
                    <td className="p-4 text-gray-600 dark:text-gray-400">Often kept for logs/model training</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-semibold text-gray-900 dark:text-white">Processing Speeds</td>
                    <td className="p-4 text-emerald-600 dark:text-emerald-400 font-semibold">Instant (CPU bound)</td>
                    <td className="p-4 text-gray-600 dark:text-gray-400">Slow (Upload + Queue + Download)</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-semibold text-gray-900 dark:text-white">Offline Use</td>
                    <td className="p-4 text-emerald-600 dark:text-emerald-400 font-semibold">Supported (Cached routes)</td>
                    <td className="p-4 text-gray-600 dark:text-gray-400">Not supported</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-semibold text-gray-900 dark:text-white">Cost & Paywalls</td>
                    <td className="p-4 text-emerald-600 dark:text-emerald-400 font-semibold">100% Free / No Limits</td>
                    <td className="p-4 text-gray-600 dark:text-gray-400">Monthly subscription models</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* How ToolWala Works Section */}
          <section className="glass rounded-[2.5rem] border border-gray-200 dark:border-white/5 p-8 sm:p-14 bg-white/80 dark:bg-white/[0.01] shadow-2xl mb-16 text-left font-sans">
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-gray-900 dark:text-white mb-10 text-center">
              How ToolWala Works
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  step: "01",
                  title: "Browse Directory",
                  desc: "Select a category folder (such as PDF, Image, AI, or Finance) and choose your target tool."
                },
                {
                  step: "02",
                  title: "Import File",
                  desc: "Drag and drop your file. It mounts in browser cache instantly without any cloud network delays."
                },
                {
                  step: "03",
                  title: "Process & Save",
                  desc: "Perform adjustments (crops, stamps, or resizing) and click save to download directly to your hardware."
                }
              ].map(item => (
                <div key={item.step} className="p-6 border border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-white/[0.01] rounded-3xl relative overflow-hidden group">
                  <div className="text-5xl font-black text-blue-500/10 group-hover:text-blue-500/20 absolute -top-2 -right-2 transition-colors">
                    {item.step}
                  </div>
                  <h3 className="text-base font-black uppercase tracking-tight text-gray-900 dark:text-white mb-2 relative z-10">
                    {item.title}
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed font-sans relative z-10">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* FAQ Accordion Section (CSS-only details/summary accordions) */}
          <section className="glass rounded-[2.5rem] border border-gray-200 dark:border-white/5 p-8 sm:p-14 bg-white/80 dark:bg-white/[0.01] shadow-2xl text-left">
            <div className="max-w-2xl mb-10">
              <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <HelpCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" /> Frequently Asked Questions
              </h2>
              <p className="text-xs text-gray-600 dark:text-gray-500 font-semibold">
                Common questions about our online category directory.
              </p>
            </div>

            <div className="space-y-4 max-w-4xl">
              {faqs.map((faq, i) => (
                <details key={i} className="group border-b border-gray-200 dark:border-white/10 pb-5">
                  <summary className="flex items-center justify-between text-base font-black text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer list-none uppercase tracking-tight py-4 [&::-webkit-details-marker]:hidden">
                    <span>{faq.question}</span>
                    <span className="text-gray-500 group-open:rotate-180 transition-transform duration-300">▼</span>
                  </summary>
                  <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed pt-2 font-sans">
                    {faq.answer}
                  </div>
                </details>
              ))}
            </div>
          </section>

        </div>
      </div>
    </>
  );
}
