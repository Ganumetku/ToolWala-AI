import { NextRequest, NextResponse } from 'next/server';
import {
  getPublicTools,
  getToolBySlug,
  processScheduledPublishes,
} from '@/lib/tools-server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    await processScheduledPublishes();

    const slug = request.nextUrl.searchParams.get('slug');

    if (slug) {
      const tool = await getToolBySlug(slug);
      if (!tool) {
        return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
      }
      return NextResponse.json(
        { success: true, tool },
        { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } }
      );
    }

    const tools = await getPublicTools();

    return NextResponse.json(
      { success: true, tools },
      { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } }
    );
  } catch (err) {
    console.error('Public tools API error:', err);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
