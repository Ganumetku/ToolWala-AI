import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/supabase/server';
import {
  fetchToolsAdmin,
  createToolAdmin,
  updateToolAdmin,
  processScheduledPublishesAdmin,
} from '@/lib/tool-service-admin';
import type { Tool } from '@/data/tools';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  if (!(await isAdmin(request))) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await processScheduledPublishesAdmin();
    const tools = await fetchToolsAdmin();
    return NextResponse.json({ success: true, tools });
  } catch (err) {
    console.error('Admin tools GET error:', err);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!(await isAdmin(request))) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const tool = await createToolAdmin({
      title: body.name || body.title,
      slug: body.slug,
      description: body.description || '',
      category: body.category || 'Utility Tools',
      icon: body.icon,
      status: body.status,
      isVisible: body.is_visible ?? body.isVisible ?? false,
    });

    return NextResponse.json({ success: true, tool });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

export async function PATCH(request: NextRequest) {
  if (!(await isAdmin(request))) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const slug = body.slug as string;
    if (!slug) {
      return NextResponse.json({ success: false, error: 'slug required' }, { status: 400 });
    }

    const updates: Partial<Tool> = {};
    if (body.status !== undefined) updates.status = body.status;
    if (body.is_visible !== undefined) updates.isVisible = body.is_visible;
    if (body.isVisible !== undefined) updates.isVisible = body.isVisible;
    if (body.featured !== undefined) updates.featured = body.featured;
    if (body.popular !== undefined) updates.popular = body.popular;
    if (body.trending !== undefined) updates.trending = body.trending;
    if (body.publish_date !== undefined) updates.publishDate = body.publish_date;
    if (body.publishDate !== undefined) updates.publishDate = body.publishDate;
    if (body.title !== undefined) updates.title = body.title;
    if (body.name !== undefined) updates.title = body.name;
    if (body.description !== undefined) updates.description = body.description;
    if (body.category !== undefined) updates.category = body.category;

    const tool = await updateToolAdmin(slug, updates);
    return NextResponse.json({ success: true, tool });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
