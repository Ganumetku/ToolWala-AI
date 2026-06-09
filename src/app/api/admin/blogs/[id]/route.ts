import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/supabase/server';
import { jsonDb, type LocalBlogPost } from '@/lib/jsonDb';

export const dynamic = 'force-dynamic';

type RouteContext = { params: Promise<{ id: string }> };

function buildBlogFromBody(body: Record<string, unknown>, existing: LocalBlogPost): LocalBlogPost {
  const now = new Date().toISOString();
  const status = (body.status as LocalBlogPost['status']) ?? existing.status;
  const content = (body.content as string) ?? existing.content;
  const wordCount = content.split(/\s+/).filter(Boolean).length;
  const readingTime =
    (body.readingTime as string) ||
    existing.readingTime ||
    `${Math.max(1, Math.ceil(wordCount / 200))} min read`;

  return {
    ...existing,
    title: (body.title as string) ?? existing.title,
    slug: (body.slug as string) ?? existing.slug,
    excerpt: (body.excerpt as string) ?? existing.excerpt,
    content,
    thumbnail: (body.thumbnail as string) ?? existing.thumbnail,
    category: (body.category as string) ?? existing.category,
    tags: Array.isArray(body.tags) ? (body.tags as string[]) : existing.tags,
    featured: body.featured !== undefined ? Boolean(body.featured) : existing.featured,
    status,
    publishedAt:
      status === 'published'
        ? (body.publishedAt as string) || existing.publishedAt || now
        : (body.publishedAt as string) ?? existing.publishedAt ?? '',
    updatedAt: now,
    author: (body.author as LocalBlogPost['author']) ?? existing.author,
    seoMetadata:
      (body.seoMetadata as LocalBlogPost['seoMetadata']) ?? existing.seoMetadata ?? null,
    readingTime,
  };
}

export async function PUT(request: NextRequest, context: RouteContext) {
  if (!(await isAdmin(request))) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const body = await request.json();
    const blogs = jsonDb.getBlogs();
    const index = blogs.findIndex((b) => b.id === id);

    if (index === -1) {
      return NextResponse.json({ success: false, error: 'Blog post not found.' }, { status: 404 });
    }

    const nextSlug = (body.slug as string) ?? blogs[index].slug;
    if (blogs.some((b) => b.id !== id && b.slug === nextSlug)) {
      return NextResponse.json(
        { success: false, error: 'A post with this slug already exists.' },
        { status: 409 }
      );
    }

    const blog = buildBlogFromBody(body, blogs[index]);
    blogs[index] = blog;
    jsonDb.saveBlogs(blogs);

    return NextResponse.json({ success: true, blog });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  if (!(await isAdmin(request))) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const blogs = jsonDb.getBlogs();
    const filtered = blogs.filter((b) => b.id !== id);

    if (filtered.length === blogs.length) {
      return NextResponse.json({ success: false, error: 'Blog post not found.' }, { status: 404 });
    }

    jsonDb.saveBlogs(filtered);
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
