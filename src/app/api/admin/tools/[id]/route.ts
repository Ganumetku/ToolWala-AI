import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/supabase/server';
import { updateToolAdmin, deleteToolAdmin } from '@/lib/tool-service-admin';
import type { ToolUpdateInput } from '@/lib/tool-service';

export const dynamic = 'force-dynamic';

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, context: RouteContext) {
  if (!(await isAdmin(request))) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const body = await request.json();

    const updates: ToolUpdateInput = {};
    if (body.status !== undefined) {
      updates.status = body.status;
      if (body.status === 'published') {
        updates.isVisible = true;
      } else if (body.status === 'draft' || body.status === 'archived') {
        updates.isVisible = false;
      }
    }

    if (body.isPublished !== undefined) updates.isVisible = body.isPublished;
    else if (body.published !== undefined) updates.isVisible = body.published;
    else if (body.isVisible !== undefined) updates.isVisible = body.isVisible;
    else if (body.is_visible !== undefined && updates.isVisible === undefined) updates.isVisible = body.is_visible;

    if (body.featured !== undefined) updates.featured = body.featured;
    if (body.isFeatured !== undefined && body.featured === undefined) updates.featured = body.isFeatured;
    if (body.popular !== undefined) updates.popular = body.popular;
    if (body.isPopular !== undefined && body.popular === undefined) updates.popular = body.isPopular;
    if (body.trending !== undefined) updates.trending = body.trending;
    if (body.isTrending !== undefined && body.trending === undefined) updates.trending = body.isTrending;

    if (body.publishDate !== undefined) updates.publishDate = body.publishDate;
    if (body.publish_date !== undefined && body.publishDate === undefined) updates.publishDate = body.publish_date;

    if (body.title !== undefined) updates.title = body.title;
    if (body.name !== undefined && body.title === undefined) updates.title = body.name;
    if (body.description !== undefined) updates.description = body.description;
    if (body.category !== undefined) updates.category = body.category;
    if (body.categoryName !== undefined && body.category === undefined) updates.category = body.categoryName;
    if (body.icon !== undefined) updates.icon = body.icon;

    const tool = await updateToolAdmin(id, updates);
    return NextResponse.json({ success: true, tool });
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
    await deleteToolAdmin(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
