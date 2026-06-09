import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/supabase/server';
import { jsonDb, type LocalBlogPost } from '@/lib/jsonDb';

export const dynamic = 'force-dynamic';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function buildBlogFromBody(body: Record<string, unknown>, existing?: LocalBlogPost): LocalBlogPost {
  const now = new Date().toISOString();
  const status = (body.status as LocalBlogPost['status']) || existing?.status || 'draft';
  const title = (body.title as string) || existing?.title || '';
  const slug = (body.slug as string) || existing?.slug || slugify(title);
  const content = (body.content as string) || existing?.content || '';
  const wordCount = content.split(/\s+/).filter(Boolean).length;
  const readingTime =
    (body.readingTime as string) ||
    existing?.readingTime ||
    `${Math.max(1, Math.ceil(wordCount / 200))} min read`;

  return {
    id: existing?.id || crypto.randomUUID(),
    slug,
    title,
    excerpt: (body.excerpt as string) ?? existing?.excerpt ?? '',
    content,
    thumbnail: (body.thumbnail as string) ?? existing?.thumbnail ?? '',
    category: (body.category as string) ?? existing?.category ?? 'AI Tools',
    tags: Array.isArray(body.tags)
      ? (body.tags as string[])
      : existing?.tags ?? [],
    featured: body.featured !== undefined ? Boolean(body.featured) : (existing?.featured ?? false),
    status,
    publishedAt:
      status === 'published'
        ? (body.publishedAt as string) || existing?.publishedAt || now
        : (body.publishedAt as string) ?? existing?.publishedAt ?? '',
    createdAt: existing?.createdAt || now,
    updatedAt: now,
    author: (body.author as LocalBlogPost['author']) || existing?.author || {
      name: 'ToolWala Editorial',
    },
    seoMetadata:
      (body.seoMetadata as LocalBlogPost['seoMetadata']) ?? existing?.seoMetadata ?? null,
    readingTime,
  };
}

export async function GET(request: NextRequest) {
  if (!(await isAdmin(request))) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const blogs = jsonDb.getBlogs();
    return NextResponse.json({ success: true, blogs });
  } catch (err) {
    console.error('Admin blogs GET error:', err);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!(await isAdmin(request))) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();

    if (!body.title || !body.slug || !body.content || !body.excerpt) {
      return NextResponse.json(
        { success: false, error: 'Title, slug, excerpt, and content are required.' },
        { status: 400 }
      );
    }

    const blogs = jsonDb.getBlogs();
    const slug = String(body.slug).trim();

    if (blogs.some((b) => b.slug === slug)) {
      return NextResponse.json(
        { success: false, error: 'A post with this slug already exists.' },
        { status: 409 }
      );
    }

    const blog = buildBlogFromBody(body);
    blogs.push(blog);
    jsonDb.saveBlogs(blogs);

    return NextResponse.json({ success: true, blog });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
