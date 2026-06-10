import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { isAdmin } from '@/lib/supabase/server';
import { buildBlogFromBody, getAllBlogs, saveBlog } from '@/lib/blogs-server';

export const dynamic = 'force-dynamic';

function revalidateBlogPaths(slug?: string) {
  revalidatePath('/blog');
  revalidatePath('/sitemap.xml');
  if (slug) revalidatePath(`/blog/${slug}`);
}

export async function GET(request: NextRequest) {
  if (!(await isAdmin(request))) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const blogs = await getAllBlogs();
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

    const existing = await getAllBlogs();
    const slug = String(body.slug).trim();

    if (existing.some((b) => b.slug === slug)) {
      return NextResponse.json(
        { success: false, error: 'A post with this slug already exists.' },
        { status: 409 }
      );
    }

    const blog = await saveBlog(buildBlogFromBody(body));
    revalidateBlogPaths(blog.slug);

    return NextResponse.json({ success: true, blog });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
