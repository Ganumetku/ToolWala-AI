import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { jsonDb, LocalBlogPost } from '@/lib/jsonDb';

export async function GET() {
  try {
    if (prisma) {
      const blogs = await prisma.blogPost.findMany({
        include: { seoMetadata: true },
        orderBy: { createdAt: 'desc' }
      });
      return NextResponse.json({ success: true, blogs });
    } else {
      const blogs = jsonDb.getBlogs();
      return NextResponse.json({ success: true, blogs });
    }
  } catch (error) {
    console.error('Failed to get blogs:', error);
    return NextResponse.json({ success: false, error: 'Database fetch failure' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, slug, content, published, seoMetadata } = body;

    if (!title || !slug || !content) {
      return NextResponse.json({ success: false, error: 'Title, slug, and content are required' }, { status: 400 });
    }

    if (prisma) {
      const newBlog = await prisma.blogPost.create({
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
      return NextResponse.json({ success: true, blog: newBlog });
    } else {
      const blogs = jsonDb.getBlogs();
      if (blogs.some(b => b.slug === slug)) {
        return NextResponse.json({ success: false, error: 'Slug already exists' }, { status: 400 });
      }

      const localBlog: LocalBlogPost = {
        id: 'b-' + Date.now(),
        slug,
        title,
        content,
        published: !!published,
        seoMetadata: seoMetadata ? {
          title: seoMetadata.title || title,
          description: seoMetadata.description || '',
          keywords: seoMetadata.keywords || ''
        } : null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      blogs.push(localBlog);
      jsonDb.saveBlogs(blogs);
      return NextResponse.json({ success: true, blog: localBlog });
    }
  } catch (error) {
    console.error('Failed to create blog:', error);
    return NextResponse.json({ success: false, error: 'Database creation failure' }, { status: 500 });
  }
}
