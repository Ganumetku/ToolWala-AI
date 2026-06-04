import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft, ShieldCheck, Sparkles, HelpCircle, Layers, ChevronDown } from 'lucide-react';
import { prisma } from '@/lib/db';
import { jsonDb } from '@/lib/jsonDb';
import ToolFormRenderer from '@/components/ToolFormRenderer';
import { MeshGradient } from '@/components/BackgroundEffects';
import FAQAccordion from './FAQAccordion';

export const revalidate = 0; // Disable server cache for instant CMS updates

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  let tool: any = null;

  if (prisma) {
    tool = await prisma.tool.findUnique({
      where: { slug },
      include: { seoMetadata: true }
    });
  } else {
    const tools = jsonDb.getTools();
    tool = tools.find(t => t.slug === slug);
  }

  if (!tool) {
    return {
      title: 'Tool Not Found | ToolWala AI'
    };
  }

  const title = tool.seoMetadata?.title || `${tool.title} | ToolWala AI`;
  const description = tool.seoMetadata?.description || tool.description;
  const keywords = tool.seoMetadata?.keywords || '';

  return {
    title,
    description,
    keywords,
    openGraph: {
      title,
      description,
      type: 'website',
      url: `https://toolwala.co/tools/${slug}`,
      images: tool.thumbnail ? [{ url: tool.thumbnail }] : []
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: tool.thumbnail ? [tool.thumbnail] : []
    }
  };
}

export default async function DynamicToolPage({ params }: PageProps) {
  const { slug } = await params;
  let tool: any = null;
  let relatedTools: any[] = [];

  if (prisma) {
    tool = await prisma.tool.findUnique({
      where: { slug },
      include: {
        inputs: { orderBy: { order: 'asc' } },
        faqs: { orderBy: { order: 'asc' } },
        articles: true,
        category: true
      }
    });

    if (tool) {
      relatedTools = await prisma.tool.findMany({
        where: {
          categoryId: tool.categoryId,
          NOT: { id: tool.id },
          published: true
        },
        take: 4,
        select: { title: true, slug: true }
      });
    }
  } else {
    const tools = jsonDb.getTools();
    tool = tools.find(t => t.slug === slug);
    if (tool) {
      relatedTools = tools
        .filter(t => t.categorySlug === tool.categorySlug && t.id !== tool.id && t.published)
        .slice(0, 4)
        .map(t => ({ title: t.title, slug: t.slug }));
    }
  }

  if (!tool) {
    notFound();
  }

  // Schema Markup (LD-JSON)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    'name': tool.title,
    'description': tool.description,
    'applicationCategory': 'BusinessApplication',
    'operatingSystem': 'All',
    'offers': {
      '@type': 'Offer',
      'price': '0',
      'priceCurrency': 'USD'
    }
  };

  return (
    <div className="bg-[#030712] min-h-screen py-24 relative overflow-hidden">
      {/* Dynamic structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Background Glow */}
      <MeshGradient />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
        
        {/* Navigation link */}
        <Link 
          href="/tools" 
          className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-widest text-gray-500 hover:text-blue-500 transition-colors mb-10 group"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Directory
        </Link>
        
        {/* Main Tool Container */}
        <div className="glass rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl mb-16">
          
          {/* Header Banner */}
          <div className="p-8 sm:p-12 border-b border-white/5 bg-white/[0.02]">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div className="flex items-center gap-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-blue-600 text-white shadow-[0_0_30px_rgba(37,99,235,0.4)] text-2xl font-bold">
                  {tool.icon || '🔧'}
                </div>
                <div>
                  <h1 className="text-3xl font-black text-white tracking-tighter uppercase">{tool.title}</h1>
                  <p className="text-gray-400 font-medium mt-1 font-sans">{tool.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Secure Processing</span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">100% Server Managed</span>
                </div>
                <ShieldCheck className="w-8 h-8 text-emerald-500/50" />
              </div>
            </div>
          </div>
          
          {/* Form Compiler Area */}
          <div className="p-8 sm:p-12 bg-black/[0.15]">
            <ToolFormRenderer
              toolId={tool.id}
              slug={tool.slug}
              inputsSchema={tool.inputs}
              ctaText={tool.ctaButtonText}
            />
          </div>
        </div>

        {/* Dynamic Deep-Dive Article */}
        {tool.articles && tool.articles.length > 0 && (
          <section className="py-16 border-t border-white/5">
            <div className="max-w-4xl mx-auto space-y-10">
              <div className="flex items-center gap-4 justify-center mb-10">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
                  <Sparkles className="w-4 h-4 text-blue-400" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">Tutorial & Overview</span>
                </div>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              </div>

              {tool.articles.map((art: any, i: number) => (
                <div key={i} className="glass p-8 sm:p-12 rounded-[2.5rem] border border-white/5 bg-white/[0.01]">
                  <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tighter uppercase mb-6">{art.title}</h2>
                  <div className="text-gray-400 text-sm font-medium leading-relaxed font-sans whitespace-pre-wrap">
                    {art.content}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Dynamic FAQ List */}
        {tool.faqs && tool.faqs.length > 0 && (
          <section className="py-16 border-t border-white/5">
            <div className="max-w-3xl mx-auto space-y-8">
              <div className="text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-blue-500/10 text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4">
                  <HelpCircle className="w-3.5 h-3.5" /> Support Center
                </div>
                <h3 className="text-3xl font-black text-white tracking-tighter uppercase">Frequently Asked Questions</h3>
              </div>

              <div className="space-y-4">
                {tool.faqs.map((faq: any, i: number) => (
                  <FAQAccordion key={i} question={faq.question} answer={faq.answer} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Dynamic Related Tools list */}
        {relatedTools.length > 0 && (
          <section className="py-16 border-t border-white/5 text-center">
            <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em] mb-10">Recommended Category Utilities</h4>
            <div className="flex flex-wrap justify-center gap-4">
              {relatedTools.map((rt: any, i: number) => (
                <Link 
                  key={i} 
                  href={`/tools/${rt.slug}`}
                  className="px-8 py-4 rounded-2xl bg-white/[0.02] border border-white/5 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-white hover:bg-blue-600 hover:border-blue-600 hover:shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all transform hover:-translate-y-1"
                >
                  {rt.title}
                </Link>
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  );
}
