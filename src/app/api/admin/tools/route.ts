import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { jsonDb, LocalTool } from '@/lib/jsonDb';

export async function GET() {
  try {
    if (prisma) {
      const tools = await prisma.tool.findMany({
        include: {
          category: true,
          inputs: { orderBy: { order: 'asc' } },
          faqs: { orderBy: { order: 'asc' } },
          articles: true,
          seoMetadata: true
        },
        orderBy: { createdAt: 'desc' }
      });
      return NextResponse.json({ success: true, tools });
    } else {
      const tools = jsonDb.getTools();
      return NextResponse.json({ success: true, tools });
    }
  } catch (error) {
    console.error('Failed to get tools:', error);
    return NextResponse.json({ success: false, error: 'Database fetch failure' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      title,
      slug,
      description,
      longDesc,
      categoryName,
      isPopular,
      isFeatured,
      isTrending,
      published,
      icon,
      thumbnail,
      toolType,
      apiTypeId,
      promptTemplate,
      ctaButtonText,
      inputs = [],
      faqs = [],
      articles = [],
      seoMetadata = null
    } = body;

    if (!title || !slug) {
      return NextResponse.json({ success: false, error: 'Title and slug are required' }, { status: 400 });
    }

    const categorySlug = categoryName.toLowerCase().replace(/ /g, '-').replace(/[^\w-]/g, '');

    if (prisma) {
      // 1. Prisma create with relations
      const newTool = await prisma.tool.create({
        data: {
          title,
          slug,
          description,
          longDesc,
          category: {
            connectOrCreate: {
              where: { slug: categorySlug },
              create: { name: categoryName, slug: categorySlug }
            }
          },
          isPopular: !!isPopular,
          isFeatured: !!isFeatured,
          isTrending: !!isTrending,
          published: !!published,
          icon: icon || '🔧',
          thumbnail,
          toolType: toolType || 'AI Text Tool',
          apiTypeId: apiTypeId || null,
          promptTemplate,
          ctaButtonText: ctaButtonText || 'Generate',
          inputs: {
            create: inputs.map((inp: any, idx: number) => ({
              name: inp.name,
              label: inp.label,
              placeholder: inp.placeholder || '',
              type: inp.type || 'text',
              required: !!inp.required,
              defaultValue: inp.defaultValue || '',
              options: inp.options || '',
              helperText: inp.helperText || '',
              order: inp.order !== undefined ? inp.order : idx
            }))
          },
          faqs: {
            create: faqs.map((faq: any, idx: number) => ({
              question: faq.question,
              answer: faq.answer,
              order: faq.order !== undefined ? faq.order : idx
            }))
          },
          articles: {
            create: articles.map((art: any) => ({
              title: art.title,
              content: art.content
            }))
          },
          seoMetadata: seoMetadata ? {
            create: {
              title: seoMetadata.title || title,
              description: seoMetadata.description || description,
              keywords: seoMetadata.keywords || ''
            }
          } : undefined
        },
        include: {
          category: true,
          inputs: true,
          faqs: true,
          articles: true,
          seoMetadata: true
        }
      });
      return NextResponse.json({ success: true, tool: newTool });
    } else {
      // 2. JSON Fallback
      const tools = jsonDb.getTools();
      if (tools.some(t => t.slug === slug)) {
        return NextResponse.json({ success: false, error: 'Slug already exists' }, { status: 400 });
      }

      const localNewTool: LocalTool = {
        id: 't-' + Date.now(),
        slug,
        title,
        description,
        longDesc,
        categoryName,
        categorySlug,
        isPopular: !!isPopular,
        isFeatured: !!isFeatured,
        isTrending: !!isTrending,
        published: !!published,
        icon: icon || '🔧',
        thumbnail,
        toolType: toolType || 'AI Text Tool',
        apiTypeId,
        promptTemplate,
        ctaButtonText: ctaButtonText || 'Generate',
        inputs: inputs.map((inp: any, idx: number) => ({
          id: 'inp-' + idx + '-' + Date.now(),
          name: inp.name,
          label: inp.label,
          placeholder: inp.placeholder,
          type: inp.type,
          required: !!inp.required,
          defaultValue: inp.defaultValue,
          options: inp.options,
          helperText: inp.helperText,
          order: inp.order !== undefined ? inp.order : idx
        })),
        faqs: faqs.map((faq: any, idx: number) => ({
          id: 'faq-' + idx + '-' + Date.now(),
          question: faq.question,
          answer: faq.answer,
          order: faq.order !== undefined ? faq.order : idx
        })),
        articles: articles.map((art: any, idx: number) => ({
          id: 'art-' + idx + '-' + Date.now(),
          title: art.title,
          content: art.content
        })),
        seoMetadata: seoMetadata ? {
          title: seoMetadata.title || title,
          description: seoMetadata.description || description,
          keywords: seoMetadata.keywords || ''
        } : null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      tools.push(localNewTool);
      jsonDb.saveTools(tools);
      return NextResponse.json({ success: true, tool: localNewTool });
    }
  } catch (error) {
    console.error('Failed to create tool:', error);
    return NextResponse.json({ success: false, error: 'Database creation failure' }, { status: 500 });
  }
}
