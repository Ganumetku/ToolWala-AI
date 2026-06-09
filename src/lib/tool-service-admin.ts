/**
 * SERVER ONLY — Supabase admin tool operations.
 * Uses supabaseAdmin (service role). Import only in API routes / server code.
 */
import { supabaseAdmin } from '@/lib/supabase-admin';
import { toolsData } from '@/data/tools';
import type { Tool } from '@/data/tools';
import type { DbTool, ToolStatus } from '@/types/database';
import {
  dbToTool,
  mergeToolsWithCatalog,
  type CreateToolInput,
  type ToolUpdateInput,
} from '@/lib/tool-service';

function mapUpdateToDb(updates: ToolUpdateInput): Record<string, unknown> {
  const db: Record<string, unknown> = { updated_at: new Date().toISOString() };

  if (updates.title !== undefined) db.name = updates.title;
  if (updates.description !== undefined) db.description = updates.description;
  if (updates.category !== undefined) db.category = updates.category;
  if (updates.status !== undefined) db.status = updates.status;
  if (updates.isVisible !== undefined) db.is_visible = updates.isVisible;
  if (updates.featured !== undefined) db.featured = updates.featured;
  if (updates.popular !== undefined) db.popular = updates.popular;
  if (updates.trending !== undefined) db.trending = updates.trending;
  if (updates.publishDate !== undefined) db.publish_date = updates.publishDate || null;
  if (updates.icon !== undefined) db.icon = updates.icon;
  if (updates.href !== undefined) db.href = updates.href;
  if (updates.tags !== undefined) db.tags = updates.tags;

  return db;
}

export async function fetchToolsAdmin(): Promise<Tool[]> {
  const { data, error } = await supabaseAdmin
    .from('tools')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.warn('[ToolServiceAdmin] fetch failed:', error.message);
    return toolsData;
  }

  const tools = mergeToolsWithCatalog((data as DbTool[]) || []);
  console.log('Fetched tools (admin):', tools);
  return tools;
}

export async function createToolAdmin(input: CreateToolInput): Promise<Tool> {
  const now = new Date().toISOString();
  const row = {
    name: input.title,
    slug: input.slug,
    description: input.description,
    category: input.category,
    status: (input.status ?? 'draft') as ToolStatus,
    is_visible: input.isVisible ?? false,
    featured: false,
    popular: false,
    trending: false,
    publish_date: null,
    icon: input.icon ?? '🔧',
    href: `/tools/${input.slug}`,
    tags: [] as string[],
    created_at: now,
    updated_at: now,
  };

  const { data, error } = await supabaseAdmin.from('tools').insert(row).select().single();
  if (error) throw new Error(error.message);

  return dbToTool(data as DbTool);
}

export async function updateToolAdmin(slug: string, updates: ToolUpdateInput): Promise<Tool> {
  const dbUpdates = mapUpdateToDb(updates);

  const { data, error } = await supabaseAdmin
    .from('tools')
    .update(dbUpdates)
    .eq('slug', slug)
    .select()
    .single();

  if (!error && data) return dbToTool(data as DbTool);

  const staticTool = toolsData.find((t) => t.slug === slug);
  const upsertRow = {
    slug,
    name: updates.title || staticTool?.title || slug,
    description: updates.description || staticTool?.description || '',
    category: updates.category || staticTool?.category || 'Utility Tools',
    icon: updates.icon || staticTool?.icon || '🔧',
    href: updates.href || staticTool?.href || `/tools/${slug}`,
    tags: updates.tags || staticTool?.tags || [],
    featured: updates.featured ?? staticTool?.featured ?? false,
    popular: updates.popular ?? staticTool?.popular ?? false,
    trending: updates.trending ?? staticTool?.trending ?? false,
    status: (updates.status ?? staticTool?.status ?? 'draft') as ToolStatus,
    is_visible: updates.isVisible ?? staticTool?.isVisible ?? false,
    publish_date: updates.publishDate ?? staticTool?.publishDate ?? null,
    created_at: staticTool?.createdAt ?? new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { data: upserted, error: upsertErr } = await supabaseAdmin
    .from('tools')
    .upsert(upsertRow, { onConflict: 'slug' })
    .select()
    .single();

  if (upsertErr) throw new Error(upsertErr.message);
  return dbToTool(upserted as DbTool);
}

export async function publishToolAdmin(slug: string): Promise<Tool> {
  return updateToolAdmin(slug, { status: 'published', isVisible: true });
}

export async function unpublishToolAdmin(slug: string): Promise<Tool> {
  return updateToolAdmin(slug, { status: 'draft', isVisible: false });
}

export async function toggleVisibilityAdmin(slug: string, isVisible: boolean): Promise<Tool> {
  return updateToolAdmin(slug, { isVisible });
}

export async function processScheduledPublishesAdmin(): Promise<number> {
  const now = new Date().toISOString();

  const { data: dueTools } = await supabaseAdmin
    .from('tools')
    .select('id, slug')
    .eq('status', 'scheduled')
    .eq('is_visible', true)
    .lte('publish_date', now);

  if (!dueTools?.length) return 0;

  for (const tool of dueTools) {
    await supabaseAdmin
      .from('tools')
      .update({ status: 'published', updated_at: now })
      .eq('id', tool.id);
  }

  return dueTools.length;
}

export async function seedStaticToolsAdmin(): Promise<{ seeded: number; errors: string[] }> {
  let seeded = 0;
  const errors: string[] = [];

  for (const tool of toolsData) {
    const { error } = await supabaseAdmin.from('tools').upsert(
      {
        name: tool.title,
        slug: tool.slug,
        description: tool.description,
        category: tool.category,
        status: tool.status,
        is_visible: tool.isVisible,
        featured: tool.featured,
        popular: tool.popular,
        trending: tool.trending,
        publish_date: tool.publishDate || null,
        icon: tool.icon,
        href: tool.href,
        tags: tool.tags,
        created_at: tool.createdAt,
        updated_at: tool.updatedAt,
      },
      { onConflict: 'slug' }
    );

    if (error) errors.push(`${tool.slug}: ${error.message}`);
    else seeded++;
  }

  return { seeded, errors };
}
