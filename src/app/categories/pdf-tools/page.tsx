import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { 
  ChevronRight, Sparkles, Layers, ShieldCheck, 
  Clock, Cpu, HelpCircle, ChevronDown, Grid, ArrowRight 
} from 'lucide-react';
import { categoriesData, getToolsByCategory } from '@/data/categories';
import { toolsData } from '@/data/tools';
import { MeshGradient, FloatingParticles } from '@/components/BackgroundEffects';
import CategorySidebar from '@/components/CategorySidebar';
import CategoryToolsGrid from './CategoryToolsGrid';
import { getTranslationServer } from '@/lib/i18n-server';
import { getPublicBlogs } from '@/lib/blogs-server';
import { getBlogTranslationWithFallback } from '@/lib/blog-translation-service';
import { 
  buildCategoryMetadata, 
  buildFAQSchema, 
  buildWebPageSchema, 
  buildBreadcrumbJsonLd, 
  getLocalizedCanonicalUrl 
} from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  const category = categoriesData.find((c) => c.slug === 'pdf-tools');
  if (!category) {
    return { title: 'Category Not Found - ToolWala AI' };
  }

  let locale = "en";
  try {
    const { headers } = await import('next/headers');
    const headerList = await headers();
    locale = headerList.get('x-locale') || 'en';
  } catch (e) {}

  let seoTitle = category.seoTitle;
  let seoDescription = category.seoDescription;

  try {
    const fs = await import('fs');
    const path = await import('path');
    const messagesPath = path.join(process.cwd(), 'messages', `${locale}.json`);
    const messages = JSON.parse(fs.readFileSync(messagesPath, 'utf8'));
    if (messages.categories?.[category.id]) {
      seoTitle = messages.categories[category.id].seoTitle || seoTitle;
      seoDescription = messages.categories[category.id].seoDescription || seoDescription;
    }
  } catch (e) {}

  return buildCategoryMetadata(seoTitle, seoDescription, category.slug, category.keywords, locale);
}

export default async function Page() {
  const category = categoriesData.find((c) => c.slug === 'pdf-tools');
  if (!category) {
    notFound();
  }

  const { t, locale } = await getTranslationServer();

  let seoTitle = category.seoTitle;
  let seoDescription = category.seoDescription;

  try {
    const fs = await import('fs');
    const path = await import('path');
    const messagesPath = path.join(process.cwd(), 'messages', `${locale}.json`);
    const messages = JSON.parse(fs.readFileSync(messagesPath, 'utf8'));
    if (messages.categories?.[category.id]) {
      seoTitle = messages.categories[category.id].seoTitle || seoTitle;
      seoDescription = messages.categories[category.id].seoDescription || seoDescription;
    }
  } catch (e) {}

  const categoryUrl = getLocalizedCanonicalUrl(`/categories/${category.slug}`, locale);

  const breadcrumbItems = [
    { name: t('nav.home', 'Home'), href: locale === 'en' ? '/' : `/${locale}` },
    { name: t('nav.categories', 'Categories'), href: locale === 'en' ? '/categories' : `/${locale}/categories` },
    { name: seoTitle, href: locale === 'en' ? `/categories/${category.slug}` : `/${locale}/categories/${category.slug}` }
  ];

  const categoryTools = getToolsByCategory(category.id, toolsData).filter(t => t.isVisible);

  // Find related public blog posts for this category
  const allBlogs = await getPublicBlogs();
  const matchedBlogs = allBlogs.filter(blog => 
    blog.category.toLowerCase() === category.title.toLowerCase() ||
    categoryTools.some(tool => blog.relatedToolSlugs?.includes(tool.slug)) ||
    blog.tags.some(tag => category.keywords.some(kw => kw.toLowerCase() === tag.toLowerCase()))
  ).slice(0, 3);

  const translatedBlogs = await Promise.all(
    matchedBlogs.map(b => getBlogTranslationWithFallback(b, locale))
  );

  const collectionPageSchema = {
    '@type': 'CollectionPage',
    '@id': `${categoryUrl}#collection`,
    'url': categoryUrl,
    'name': seoTitle,
    'description': seoDescription,
    'isPartOf': {
      '@type': 'WebSite',
      '@id': 'https://toolwala.co/#website',
      'url': 'https://toolwala.co',
      'name': 'ToolWala AI'
    },
    'about': {
      '@type': 'Thing',
      'name': category.title
    },
    'mainEntity': {
      '@type': 'ItemList',
      'numberOfItems': categoryTools.length,
      'itemListElement': categoryTools.map((tool, index) => ({
        '@type': 'ListItem',
        'position': index + 1,
        'url': `https://toolwala.co${locale === 'en' ? '' : '/' + locale}${tool.href}`
      }))
    }
  };

  const graph: any[] = [
    buildWebPageSchema(seoTitle, seoDescription, categoryUrl, locale),
    buildBreadcrumbJsonLd(breadcrumbItems),
    collectionPageSchema
  ];

  if (category.faqs && category.faqs.length > 0) {
    const faqSchema = buildFAQSchema(category.faqs.map((faq, index) => ({
      question: t(`categories.${category.id}.faq.q${index + 1}`, faq.question),
      answer: t(`categories.${category.id}.faq.a${index + 1}`, faq.answer)
    })));
    if (faqSchema) {
      graph.push(faqSchema);
    }
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': graph
  };

  const localizeHref = (href: string) => {
    if (locale === 'en') return href;
    return `/${locale}${href}`;
  };

  const popularTools = categoryTools.filter(tool => tool.popular).slice(0, 4);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <div className="min-h-screen bg-[#030712] text-white relative overflow-hidden font-sans">
        <MeshGradient />
        <FloatingParticles />

        <div className="absolute top-0 left-0 w-full h-[600px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-transparent pointer-events-none z-0" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-24 relative z-10">
          
          {/* Static Header with Breadcrumbs */}
          <div className="text-center max-w-4xl mx-auto mb-16">
            <nav className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500 mb-8">
              <Link href={localizeHref("/")} className="hover:text-white transition-colors">{t('nav.home', 'Home')}</Link>
              <ChevronRight className="w-3 h-3 text-gray-600" />
              <Link href={localizeHref("/categories")} className="hover:text-white transition-colors">{t('nav.categories', 'Categories')}</Link>
              <ChevronRight className="w-3 h-3 text-gray-600" />
              <span className="text-blue-400">{t(`categories.${category.title}`, category.title)}</span>
            </nav>

            <div className="inline-flex h-20 w-20 items-center justify-center rounded-[2rem] bg-gradient-to-br from-blue-600/10 to-purple-600/10 text-5xl border border-white/10 shadow-2xl mb-8 scale-100 hover:scale-105 transition-transform duration-300">
              {category.icon}
            </div>

            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white mb-6 uppercase leading-none">
              {t(`categories.${category.title}`, category.title)} <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
                {t('categories.local_utilities', 'Local Utilities')}
              </span>
            </h1>

            <p className="text-base sm:text-lg text-gray-400 leading-relaxed font-medium max-w-2xl mx-auto">
              {t('categories.' + category.id + '.intro', category.intro)}
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8 items-start mt-10">
            {/* Sidebar Navigation */}
            <CategorySidebar activeSlug={category.slug} />

            {/* Content Deck */}
            <div className="flex-1 w-full space-y-16">
              
              {/* 500+ Word Rich Intro and Quick Stats */}
              <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start bg-white/[0.02] border border-white/5 p-6 sm:p-8 rounded-[2.5rem] glass">
                <div className="lg:col-span-2 space-y-5 text-left">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">
                    <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">
                      {t('categories.hub_badge', 'Categorized Hub')}
                    </span>
                  </div>
                  
                  <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
                    {t(`categories.${category.id}.seoTitle`, category.seoTitle)}
                  </h2>

                  <div className="text-xs sm:text-sm text-gray-400 leading-relaxed font-medium space-y-4">
                    <p>
                      The Portable Document Format (PDF) has emerged as the global standard for exchanging documents across business, legal, financial, and educational sectors. However, editing, merging, or optimizing these files usually forces users into a frustrating trade-off: either purchase expensive, resource-heavy desktop software licenses or upload sensitive records to unverified cloud servers. Uploading contracts, tax sheets, and personal identification to external databases poses severe security vulnerabilities, including data logs storage, network interception, and privacy breaches that violate strict corporate standards or data protection laws like GDPR, HIPAA, and CCPA.
                    </p>
                    <p>
                      ToolWala AI's PDF Tools suite completely resolves this dilemma by delivering a professional-grade, comprehensive toolkit that runs entirely client-side inside your web browser sandbox. By utilizing high-performance WebAssembly compiles of leading PDF manipulation engines, all calculations and file transformations are performed locally on your device's CPU. This local-first architecture ensures that your documents never leave your browser window, giving you absolute data sovereignty.
                    </p>
                    <p>
                      Because there are no server-side communication lags, processing happens almost instantaneously—typically in under 120 milliseconds. Furthermore, this client-side paradigm eliminates file size limits and slow upload or download speeds, letting you process large reports without internet connection constraints. Even if you are offline in a remote location, the tools remain fully functional and ready to use.
                    </p>
                    <p>
                      Our feature-rich toolkit is logically grouped into specialized utilities to handle every aspect of your PDF workflow. In the Organize category, you can merge multiple files into a unified document using the <Link href={localizeHref("/tools/merge-pdf")} className="text-blue-400 hover:text-blue-300 font-extrabold underline decoration-blue-500/50 hover:decoration-blue-400 transition-colors">Merge PDF</Link> tool, extract specific chapters with <Link href={localizeHref("/tools/split-pdf")} className="text-blue-400 hover:text-blue-300 font-extrabold underline decoration-blue-500/50 hover:decoration-blue-400 transition-colors">Split PDF</Link>, visual-sort pages with <Link href={localizeHref("/tools/organize-pdf")} className="text-blue-400 hover:text-blue-300 font-extrabold underline decoration-blue-500/50 hover:decoration-blue-400 transition-colors">Organize PDF Pages</Link>, delete unwanted elements with <Link href={localizeHref("/tools/remove-pages")} className="text-blue-400 hover:text-blue-300 font-extrabold underline decoration-blue-500/50 hover:decoration-blue-400 transition-colors">Remove PDF Pages</Link>, or adjust document orientation using <Link href={localizeHref("/tools/rotate-pdf")} className="text-blue-400 hover:text-blue-300 font-extrabold underline decoration-blue-500/50 hover:decoration-blue-400 transition-colors">Rotate PDF</Link>.
                    </p>
                    <p>
                      For file size reduction and layout editing, the Optimize category offers <Link href={localizeHref("/tools/compress-pdf")} className="text-blue-400 hover:text-blue-300 font-extrabold underline decoration-blue-500/50 hover:decoration-blue-400 transition-colors">Compress PDF</Link> (reducing file sizes while keeping fonts and vectors visually lossless) and <Link href={localizeHref("/tools/crop-pdf")} className="text-blue-400 hover:text-blue-300 font-extrabold underline decoration-blue-500/50 hover:decoration-blue-400 transition-colors">Crop PDF</Link> (trimming page margins to remove unnecessary borders). Format conversion is handled locally in the Convert category. You can instantly transform image layouts into clean PDF files using <Link href={localizeHref("/tools/jpg-to-pdf")} className="text-blue-400 hover:text-blue-300 font-extrabold underline decoration-blue-500/50 hover:decoration-blue-400 transition-colors">JPG to PDF</Link>, convert document pages to image files using <Link href={localizeHref("/tools/pdf-to-jpg")} className="text-blue-400 hover:text-blue-300 font-extrabold underline decoration-blue-500/50 hover:decoration-blue-400 transition-colors">PDF to JPG</Link>, or convert text layers using our <Link href={localizeHref("/tools/word-to-pdf-converter")} className="text-blue-400 hover:text-blue-300 font-extrabold underline decoration-blue-500/50 hover:decoration-blue-400 transition-colors">Word to PDF Converter</Link> and <Link href={localizeHref("/tools/pdf-to-word-converter")} className="text-blue-400 hover:text-blue-300 font-extrabold underline decoration-blue-500/50 hover:decoration-blue-400 transition-colors">PDF to Word Converter</Link>.
                    </p>
                    <p>
                      For document customization and labeling, the <Link href={localizeHref("/tools/pdf-tools/edit-pdf")} className="text-blue-400 hover:text-blue-300 font-extrabold underline decoration-blue-500/50 hover:decoration-blue-400 transition-colors">Edit PDF</Link> tool allows you to add text overlays, fill forms, and annotate layouts, while the <Link href={localizeHref("/tools/watermark-pdf")} className="text-blue-400 hover:text-blue-300 font-extrabold underline decoration-blue-500/50 hover:decoration-blue-400 transition-colors">Watermark PDF</Link> tool lets you stamp corporate branding or opacity-controlled copyright notices. Security is built directly into the toolkit. You can protect sensitive files with encryption using <Link href={localizeHref("/tools/protect-pdf")} className="text-blue-400 hover:text-blue-300 font-extrabold underline decoration-blue-500/50 hover:decoration-blue-400 transition-colors">Protect PDF</Link>, or remove authorization restrictions and access passwords using <Link href={localizeHref("/tools/unlock-pdf")} className="text-blue-400 hover:text-blue-300 font-extrabold underline decoration-blue-500/50 hover:decoration-blue-400 transition-colors">Unlock PDF</Link>. Finally, the PDF Intelligence category leverages on-device neural networks with the <Link href={localizeHref("/tools/pdf-ocr")} className="text-blue-400 hover:text-blue-300 font-extrabold underline decoration-blue-500/50 hover:decoration-blue-400 transition-colors">PDF OCR Scanner</Link>, enabling you to extract search-optimized, editable text from scanned pages without transmitting anything to external API engines. Experience complete control over your document workflows with ToolWala AI. No subscription traps, no signups, and no hidden fees.
                    </p>
                  </div>
                </div>

                {/* Facts Quick Card */}
                <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-5 w-full text-left">
                  <h4 className="text-[11px] font-black uppercase tracking-widest text-gray-400 border-b border-white/5 pb-3">
                    {t('categories.folder_stats', 'Folder Quick Facts')}
                  </h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Layers className="w-3.5 h-3.5 text-blue-400" />
                        <span>Total Tools</span>
                      </div>
                      <span className="text-xs font-black text-white">{categoryTools.length} Tools</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <ShieldCheck className="w-3.5 h-3.5 text-green-400" />
                        <span>Security Status</span>
                      </div>
                      <span className="text-xs font-black text-green-400">100% Local</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Clock className="w-3.5 h-3.5 text-purple-400" />
                        <span>Execution Speed</span>
                      </div>
                      <span className="text-xs font-black text-purple-400">&lt; 120ms</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Cpu className="w-3.5 h-3.5 text-yellow-400" />
                        <span>Privacy Level</span>
                      </div>
                      <span className="text-xs font-black text-yellow-400">No Server Uploads</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* Popular Utilities Section */}
              {popularTools.length > 0 && (
                <section className="space-y-4 text-left">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-yellow-400" />
                    <h2 className="text-sm font-black uppercase tracking-widest text-white">
                      {t('categories.popular_shelf_title', 'Popular Utilities')}
                    </h2>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6">
                    {popularTools.map((tool) => (
                      <Link 
                        key={tool.id} 
                        href={localizeHref(tool.href)}
                        className="group flex flex-col justify-between p-5 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-blue-500/40 transition-all duration-300 glass"
                      >
                        <div>
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 text-2xl border border-white/5 group-hover:scale-105 transition-transform mb-4">
                            {tool.icon}
                          </div>
                          <h3 className="text-sm font-black text-white group-hover:text-blue-400 transition-colors uppercase leading-tight tracking-tight">
                            {t(`tools.${tool.id}.title`, tool.title)}
                          </h3>
                        </div>
                        <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest mt-4 inline-flex items-center gap-1">
                          Try Tool <ArrowRight className="w-3 h-3" />
                        </span>
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {/* Interactive Tools Search & Filter Deck */}
              <CategoryToolsGrid categoryTools={categoryTools} />

              {/* How It Works Steps Component */}
              <section className="space-y-8 bg-white/[0.01] border border-white/5 p-6 sm:p-8 rounded-[2.5rem] glass text-left">
                <div>
                  <h2 className="text-lg font-black uppercase tracking-tight text-white">
                    {t('categories.how_it_works_title', 'How It Works')}
                  </h2>
                  <p className="text-xs text-gray-500 font-semibold mt-1">
                    Start using tools inside this directory in three simple steps.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                  <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-[1px] bg-dashed bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none z-0" />

                  {category.howItWorks.map((step, idx) => (
                    <div key={idx} className="flex flex-col items-center text-center relative z-10 space-y-3">
                      <div className="w-12 h-12 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 font-black text-sm flex items-center justify-center shadow-lg shadow-blue-500/5">
                        {step.step || (idx + 1)}
                      </div>
                      <h4 className="text-sm font-black text-white uppercase tracking-wide">
                        {t(`categories.${category.id}.howItWorks[${idx}].title`, step.title)}
                      </h4>
                      <p className="text-xs text-gray-400 leading-relaxed font-semibold max-w-xs">
                        {t(`categories.${category.id}.howItWorks[${idx}].desc`, step.desc)}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Privacy-First / Why Use Section */}
              <section className="space-y-6 text-left">
                <div>
                  <h2 className="text-lg font-black uppercase tracking-tight text-white">
                    {t('categories.why_use_title', `Why Use These PDF Tools`)}
                  </h2>
                  <p className="text-xs text-gray-500 font-semibold mt-1">
                    Designed with security, speed, and standard compliance in mind.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {category.whyUse.map((benefit, idx) => (
                    <div 
                      key={idx} 
                      className="p-6 rounded-2xl bg-white/[0.01] border border-white/5 hover:border-white/10 transition-all hover:bg-white/[0.02] text-left"
                    >
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-xl mb-4 border border-white/5">
                        {benefit.icon}
                      </div>
                      <h4 className="text-sm font-black text-white uppercase tracking-wide mb-2">
                        {t(`categories.${category.id}.whyUse[${idx}].title`, benefit.title)}
                      </h4>
                      <p className="text-xs text-gray-400 leading-relaxed font-semibold">
                        {t(`categories.${category.id}.whyUse[${idx}].desc`, benefit.desc)}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              {/* FAQs Section (details-based interactive HTML accordion for crawlability) */}
              <section className="border-t border-white/5 pt-12 text-left">
                <div className="flex items-center gap-2 mb-8">
                  <HelpCircle className="w-4.5 h-4.5 text-blue-400" />
                  <h3 className="text-xs font-black uppercase tracking-widest text-white">
                    {t('categories.faq_title', 'Frequently Asked Questions')}
                  </h3>
                </div>

                <div className="space-y-4">
                  {category.faqs.map((faq, index) => (
                    <details 
                      key={index} 
                      className="group border border-white/5 bg-white/[0.01] rounded-2xl overflow-hidden [&_summary::-webkit-details-marker]:hidden"
                    >
                      <summary className="flex items-center justify-between p-5.5 text-left cursor-pointer focus:outline-none select-none">
                        <span className="text-xs sm:text-sm font-black text-white group-open:text-blue-400 hover:text-blue-400 transition-colors">
                          {t('categories.' + category.id + '.faq.q' + (index + 1), faq.question)}
                        </span>
                        <ChevronDown className="w-4 h-4 text-gray-500 transition-transform duration-300 group-open:rotate-180 group-open:text-blue-400" />
                      </summary>
                      <div className="px-5.5 pb-5.5 pt-0.5 border-t border-white/5 text-xs text-gray-400 leading-relaxed font-semibold">
                        {t('categories.' + category.id + '.faq.a' + (index + 1), faq.answer)}
                      </div>
                    </details>
                  ))}
                </div>
              </section>

              {/* Related Blogs Section */}
              {translatedBlogs.length > 0 && (
                <section className="border-t border-white/5 pt-12 text-left">
                  <div className="flex items-center gap-2 mb-8">
                    <Sparkles className="w-4.5 h-4.5 text-blue-400" />
                    <h3 className="text-xs font-black uppercase tracking-widest text-white">
                      {t('categories.related_blogs_title', 'Related Blog Insights')}
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {translatedBlogs.map((rBlog) => {
                      const formatReadingTime = (readingTime: string) => {
                        const match = readingTime.match(/(\d+)\s*min\s*read/i);
                        if (match) {
                          const mins = match[1];
                          return t('blog.minutes_read', `${mins} min read`).replace('{count}', mins);
                        }
                        return readingTime;
                      };
                      return (
                        <Link
                          key={rBlog.id}
                          href={localizeHref(`/blog/${rBlog.slug}`)}
                          className="p-6 rounded-[2rem] bg-white/[0.01] border border-white/5 hover:border-blue-500/20 hover:bg-blue-600/5 hover:shadow-[0_0_20px_rgba(37,99,235,0.1)] transition-all flex flex-col justify-between group h-52 text-left"
                        >
                          <div>
                            <span className="text-[9px] font-black uppercase tracking-widest text-blue-500">
                              {t(`categories.${rBlog.category}`, rBlog.category)}
                            </span>
                            <h4 className="text-sm font-black text-white uppercase group-hover:text-blue-400 transition-colors line-clamp-2 mt-2 leading-tight">
                              {rBlog.title}
                            </h4>
                            <p className="text-gray-400 text-xs font-medium line-clamp-2 mt-2 leading-relaxed">
                              {rBlog.excerpt}
                            </p>
                          </div>
                          <div className="flex items-center justify-between pt-4 mt-4 border-t border-white/5">
                            <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">
                              {formatReadingTime(rBlog.readingTime)}
                            </span>
                            <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest flex items-center gap-1 select-none">
                              {t('blog.read_post', 'Read Post')}
                              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                            </span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* Related Categories Grid */}
              <section className="border-t border-white/5 pt-12 text-left">
                <div className="flex items-center gap-2 mb-8">
                  <Grid className="w-4.5 h-4.5 text-blue-500" />
                  <h3 className="text-xs font-black uppercase tracking-widest text-white">
                    {t('categories.explore_other_folders', 'Explore Other Folders')}
                  </h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {categoriesData
                    .filter(c => c.slug !== 'pdf-tools')
                    .slice(0, 4)
                    .map((cat) => (
                      <Link
                        key={cat.id}
                        href={localizeHref(`/categories/${cat.slug}`)}
                        className="p-5 rounded-2xl bg-white/[0.01] border border-white/5 hover:border-blue-500/20 hover:bg-blue-600/5 transition-all group flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{cat.icon}</span>
                          <span className="text-xs font-black text-gray-300 group-hover:text-white uppercase truncate">
                            {t('categories.' + cat.title, cat.title)}
                          </span>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-gray-600 group-hover:text-blue-500 transition-colors shrink-0" />
                      </Link>
                    ))}
                </div>
              </section>

            </div>
          </div>

        </div>
      </div>
    </>
  );
}
