import { NextRequest, NextResponse } from 'next/server';
import { getPublicBlogs } from '@/lib/blogs-server';
import { paginate, searchBlogs } from '@/lib/blog-utils';
import { BLOG_PAGE_SIZE } from '@/types/blog';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const q = searchParams.get('q') || '';
    const category = searchParams.get('category') || '';
    const page = Math.max(1, Number(searchParams.get('page')) || 1);
    const pageSize = Math.min(50, Number(searchParams.get('limit')) || BLOG_PAGE_SIZE);

    let blogs = await getPublicBlogs();

    if (category && category !== 'All') {
      blogs = blogs.filter((b) => b.category === category);
    }

    blogs = searchBlogs(blogs, q);
    const result = paginate(blogs, page, pageSize);

    return NextResponse.json({
      success: true,
      ...result,
      blogs: result.items,
      items: undefined,
    });
  } catch (err) {
    console.error('Public blogs API error:', err);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
