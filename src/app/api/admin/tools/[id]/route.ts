import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { jsonDb } from '@/lib/jsonDb';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
      // 1. Transaction to clean up and rewrite tool configuration
      await prisma.$transaction([
        prisma.toolInput.deleteMany({ where: { toolId: id } }),
        prisma.toolFaq.deleteMany({ where: { toolId: id } }),
        prisma.toolArticle.deleteMany({ where: { toolId: id } }),
        prisma.seoMetadata.deleteMany({ where: { toolId: id } }),
      ]);

      const updatedTool = await prisma.tool.update({
        where: { id },
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

      return NextResponse.json({ success: true, tool: updatedTool });
    } else {
      // 2. JSON Fallback
      const tools = jsonDb.getTools();
      const idx = tools.findIndex(t => t.id === id);
      if (idx === -1) {
        return NextResponse.json({ success: false, error: 'Tool not found' }, { status: 404 });
      }

      tools[idx] = {
        ...tools[idx],
        title,
        slug,
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
        inputs: inputs.map((inp: any, iidx: number) => ({
          id: inp.id || 'inp-' + iidx + '-' + Date.now(),
          name: inp.name,
          label: inp.label,
          placeholder: inp.placeholder,
          type: inp.type,
          required: !!inp.required,
          defaultValue: inp.defaultValue,
          options: inp.options,
          helperText: inp.helperText,
          order: inp.order !== undefined ? inp.order : iidx
        })),
        faqs: faqs.map((faq: any, fidx: number) => ({
          id: faq.id || 'faq-' + fidx + '-' + Date.now(),
          question: faq.question,
          answer: faq.answer,
          order: faq.order !== undefined ? faq.order : fidx
        })),
        articles: articles.map((art: any, aidx: number) => ({
          id: art.id || 'art-' + aidx + '-' + Date.now(),
          title: art.title,
          content: art.content
        })),
        seoMetadata: seoMetadata ? {
          title: seoMetadata.title || title,
          description: seoMetadata.description || description,
          keywords: seoMetadata.keywords || ''
        } : null,
        updatedAt: new Date().toISOString()
      };

      jsonDb.saveTools(tools);
      return NextResponse.json({ success: true, tool: tools[idx] });
    }
  } catch (error) {
    console.error('Failed to update tool:', error);
    return NextResponse.json({ success: false, error: 'Database update failure' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (prisma) {
      await prisma.tool.delete({ where: { id } });
      return NextResponse.json({ success: true, message: 'Tool deleted from DB' });
    } else {
      const tools = jsonDb.getTools();
      const filtered = tools.filter(t => t.id !== id);
      jsonDb.saveTools(filtered);
      return NextResponse.json({ success: true, message: 'Tool deleted from JSON' });
    }
  } catch (error) {
    console.error('Failed to delete tool:', error);
    return NextResponse.json({ success: false, error: 'Database deletion failure' }, { status: 500 });
  }
}
