import { supabase } from '@/lib/supabase';
import { toolsData, type Tool } from '@/data/tools';
import type { DbTool, ToolStatus } from '@/types/database';

// ---------------------------------------------------------------------------
// Shared mappers (safe for client + server)
// ---------------------------------------------------------------------------

export function resolveEffectiveStatus(row: DbTool): Tool['status'] {
  if (
    row.status === 'scheduled' &&
    row.publish_date &&
    new Date(row.publish_date) <= new Date()
  ) {
    return 'published';
  }
  return row.status as Tool['status'];
}

export function dbToTool(row: DbTool): Tool {
  const rawHref = row.href || `/tools/${row.slug}`;
  const href = rawHref.endsWith('/') ? rawHref : `${rawHref}/`;
  return {
    id: row.slug,
    title: row.name,
    description: row.description,
    icon: row.icon || '🔧',
    href,
    slug: row.slug,
    category: row.category as Tool['category'],
    featured: row.featured,
    trending: row.trending,
    popular: row.popular,
    tags: row.tags || [],
    status: resolveEffectiveStatus(row),
    isVisible: row.is_visible,
    publishDate: row.publish_date || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function toolToDbRow(
  tool: Partial<Tool> & { slug: string; title?: string; name?: string }
): Record<string, unknown> {
  const now = new Date().toISOString();
  const rawHref = tool.href ?? `/tools/${tool.slug}`;
  const href = rawHref.endsWith('/') ? rawHref : `${rawHref}/`;
  return {
    name: tool.title || tool.name || tool.slug,
    slug: tool.slug,
    description: tool.description ?? '',
    category: tool.category ?? 'Utility Tools',
    status: (tool.status ?? 'draft') as ToolStatus,
    is_visible: tool.isVisible ?? false,
    featured: tool.featured ?? false,
    popular: tool.popular ?? false,
    trending: tool.trending ?? false,
    publish_date: tool.publishDate ?? null,
    icon: tool.icon ?? '🔧',
    href,
    tags: tool.tags ?? [],
    updated_at: now,
  };
}

const EXCLUDED_TOOL_SLUGS = new Set([
  'pan-photo-tool',
  'signature-crop-tool',
  'aadhaar-photo-resizer',
  'aadhaar-photo-resize',
  'aadhar-card-cropper',
  'crop-aadhar-card',
  'pdf-tools',
]);

export function mergeToolsWithCatalog(dbTools: DbTool[]): Tool[] {
  const filteredDbTools = dbTools.filter((t) => !EXCLUDED_TOOL_SLUGS.has(t.slug));
  const dbMap = new Map(filteredDbTools.map((t) => [t.slug, dbToTool(t)]));
  const merged: Tool[] = [];

  for (const staticTool of toolsData) {
    merged.push(dbMap.get(staticTool.slug) ?? staticTool);
    dbMap.delete(staticTool.slug);
  }

  for (const tool of dbMap.values()) {
    merged.push(tool);
  }

  return merged.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export type ToolUpdateInput = Partial<
  Pick<
    Tool,
    | 'title'
    | 'description'
    | 'category'
    | 'status'
    | 'isVisible'
    | 'featured'
    | 'popular'
    | 'trending'
    | 'publishDate'
    | 'icon'
    | 'href'
    | 'tags'
  >
>;

export type CreateToolInput = {
  title: string;
  slug: string;
  description: string;
  category: Tool['category'];
  icon?: string;
  status?: Tool['status'];
  isVisible?: boolean;
};

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

function handleSupabaseError(error: { message: string } | null, context: string): never {
  const msg = error?.message || `Unknown error during ${context}`;
  console.error(`[ToolService] ${context}:`, msg);
  throw new Error(msg);
}

// ---------------------------------------------------------------------------
// Client-side operations (admin dashboard — uses @/lib/supabase + RLS)
// ---------------------------------------------------------------------------

/**
 * Fetch all tools merged with static catalog. Reads from Supabase `tools` table.
 */
export async function fetchTools(): Promise<Tool[]> {
  const { data, error } = await supabase
    .from('tools')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.warn('[ToolService] Supabase fetch failed, using static catalog:', error.message);
    console.log('Fetched tools:', toolsData);
    return toolsData;
  }

  const tools = mergeToolsWithCatalog((data as DbTool[]) || []);
  console.log('Fetched tools:', tools);
  return tools;
}

/**
 * Create a new tool in Supabase. Defaults: draft + hidden.
 */
export async function createTool(input: CreateToolInput): Promise<Tool> {
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

  const { data, error } = await supabase.from('tools').insert(row).select().single();

  if (error) handleSupabaseError(error, 'createTool');

  const tool = dbToTool(data as DbTool);
  console.log('Created tool:', tool);
  return tool;
}

/**
 * Update tool fields in Supabase (upserts if only in static catalog).
 */
export async function updateTool(slug: string, updates: ToolUpdateInput): Promise<Tool> {
  const dbUpdates = mapUpdateToDb(updates);

  const { data, error } = await supabase
    .from('tools')
    .update(dbUpdates)
    .eq('slug', slug)
    .select()
    .single();

  if (!error && data) {
    const tool = dbToTool(data as DbTool);
    console.log('Updated tool:', tool);
    return tool;
  }

  // Tool exists only in static catalog — upsert into DB
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

  const { data: upserted, error: upsertErr } = await supabase
    .from('tools')
    .upsert(upsertRow, { onConflict: 'slug' })
    .select()
    .single();

  if (upsertErr) handleSupabaseError(upsertErr, 'updateTool upsert');

  const tool = dbToTool(upserted as DbTool);
  console.log('Upserted tool:', tool);
  return tool;
}

/** Publish tool — status published + visible */
export async function publishTool(slug: string): Promise<Tool> {
  return updateTool(slug, { status: 'published', isVisible: true });
}

/** Unpublish tool — status draft + hidden */
export async function unpublishTool(slug: string): Promise<Tool> {
  return updateTool(slug, { status: 'draft', isVisible: false });
}

/** Toggle visibility without changing publish status */
export async function toggleVisibility(slug: string, isVisible: boolean): Promise<Tool> {
  return updateTool(slug, { isVisible });
}
