import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { isAdmin } from '@/lib/supabase/server';
import { buildBlogFromBody, deleteBlog, getAllBlogs, saveBlog } from '@/lib/blogs-server';

export const dynamic = 'force-dynamic';

type RouteContext = { params: Promise<{ id: string }> };

function revalidateBlogPaths(slug?: string) {
  revalidatePath('/blog');
  revalidatePath('/sitemap.xml');
  if (slug) revalidatePath(`/blog/${slug}`);
}

export async function PUT(request: NextRequest, context: RouteContext) {
  if (!(await isAdmin(request))) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const body = await request.json();
    const blogs = await getAllBlogs();
    const existing = blogs.find((b) => b.id === id);

    if (!existing) {
      return NextResponse.json({ success: false, error: 'Blog post not found.' }, { status: 404 });
    }

    const nextSlug = (body.slug as string) ?? existing.slug;
    if (blogs.some((b) => b.id !== id && b.slug === nextSlug)) {
      return NextResponse.json(
        { success: false, error: 'A post with this slug already exists.' },
        { status: 409 }
      );
    }

    const blog = await saveBlog(buildBlogFromBody(body, existing));
    revalidateBlogPaths(blog.slug);
    if (existing.slug !== blog.slug) revalidateBlogPaths(existing.slug);

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
    const blogs = await getAllBlogs();
    const existing = blogs.find((b) => b.id === id);

    const ok = await deleteBlog(id);
    if (!ok) {
      return NextResponse.json({ success: false, error: 'Blog post not found.' }, { status: 404 });
    }

    revalidateBlogPaths(existing?.slug);
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
