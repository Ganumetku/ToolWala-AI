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
    const { title, slug, content, published, seoMetadata } = body;

    if (!title || !slug || !content) {
      return NextResponse.json({ success: false, error: 'Title, slug, and content are required' }, { status: 400 });
    }

    if (prisma) {
      // Clean up old SEO metadata
      await prisma.seoMetadata.deleteMany({ where: { blogPostId: id } });

      const updatedBlog = await prisma.blogPost.update({
        where: { id },
        data: {
          title,
          slug,
          content,
          published: !!published,
          seoMetadata: seoMetadata ? {
            create: {
              title: seoMetadata.title || title,
              description: seoMetadata.description || '',
              keywords: seoMetadata.keywords || ''
            }
          } : undefined
        },
        include: { seoMetadata: true }
      });

      return NextResponse.json({ success: true, blog: updatedBlog });
    } else {
      const blogs = jsonDb.getBlogs();
      const idx = blogs.findIndex(b => b.id === id);
      if (idx === -1) {
        return NextResponse.json({ success: false, error: 'Blog not found' }, { status: 404 });
      }

      blogs[idx] = {
        ...blogs[idx],
        title,
        slug,
        content,
        published: !!published,
        seoMetadata: seoMetadata ? {
          title: seoMetadata.title || title,
          description: seoMetadata.description || '',
          keywords: seoMetadata.keywords || ''
        } : null,
        updatedAt: new Date().toISOString()
      };

      jsonDb.saveBlogs(blogs);
      return NextResponse.json({ success: true, blog: blogs[idx] });
    }
  } catch (error) {
    console.error('Failed to update blog:', error);
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
      await prisma.blogPost.delete({ where: { id } });
      return NextResponse.json({ success: true, message: 'Blog deleted from DB' });
    } else {
      const blogs = jsonDb.getBlogs();
      const filtered = blogs.filter(b => b.id !== id);
      jsonDb.saveBlogs(filtered);
      return NextResponse.json({ success: true, message: 'Blog deleted from JSON' });
    }
  } catch (error) {
    console.error('Failed to delete blog:', error);
    return NextResponse.json({ success: false, error: 'Database deletion failure' }, { status: 500 });
  }
}
