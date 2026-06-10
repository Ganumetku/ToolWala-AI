import { NextRequest, NextResponse } from 'next/server';
import { incrementBlogView } from '@/lib/blogs-server';

export const dynamic = 'force-dynamic';

type RouteContext = { params: Promise<{ slug: string }> };

export async function POST(_request: NextRequest, context: RouteContext) {
  try {
    const { slug } = await context.params;
    await incrementBlogView(slug);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
