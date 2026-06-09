import { toolsData, Tool } from '@/data/tools';
import { dbToTool as dbToolToTool } from '@/lib/tool-service';
import {
  fetchToolsAdmin,
  processScheduledPublishesAdmin,
  seedStaticToolsAdmin,
} from '@/lib/tool-service-admin';
import { supabaseAdmin } from '@/lib/supabase-admin';
import type { DbTool } from '@/types/database';

export { dbToTool as dbToolToTool } from '@/lib/tool-service';

/** LIVE rule: status === published AND isVisible === true (or auto-published scheduled) */
export function isToolLive(tool: Tool): boolean {
  if (tool.isVisible !== true) return false;

  if (tool.status === 'published') return true;

  if (tool.status === 'scheduled') {
    if (!tool.publishDate) return false;
    return new Date(tool.publishDate) <= new Date();
  }

  return false;
}

/** Merge static seed tools with DB overrides (DB wins on slug conflict) */
export async function getMergedTools(): Promise<Tool[]> {
  try {
    return await fetchToolsAdmin();
  } catch {
    return toolsData;
  }
}

export async function getPublicTools(): Promise<Tool[]> {
  const all = await getMergedTools();
  return all.filter(isToolLive);
}

export async function getAdminTools(): Promise<Tool[]> {
  return getMergedTools();
}

export async function getToolBySlug(slug: string): Promise<Tool | null> {
  try {
    const { data } = await supabaseAdmin
      .from('tools')
      .select('*')
      .eq('slug', slug)
      .single();

    if (data) return dbToolToTool(data as DbTool);
  } catch {
    // fall through
  }

  return toolsData.find((t) => t.slug === slug) ?? null;
}

export async function getFeaturedTools(): Promise<Tool[]> {
  const publicTools = await getPublicTools();
  return publicTools.filter((t) => t.featured);
}

export async function getToolsByCategory(category: string): Promise<Tool[]> {
  const publicTools = await getPublicTools();
  if (category === 'All') return publicTools;
  return publicTools.filter((t) => t.category === category);
}

export async function getRelatedTools(slugs: string[]): Promise<Tool[]> {
  const publicTools = await getPublicTools();
  return publicTools.filter((t) => slugs.includes(t.slug));
}

/** Auto-publish scheduled tools whose time has passed */
export async function processScheduledPublishes(): Promise<number> {
  try {
    return await processScheduledPublishesAdmin();
  } catch {
    return 0;
  }
}

/** Seed static tools into Supabase (idempotent upsert by slug) */
export async function seedStaticTools(): Promise<{ seeded: number; errors: string[] }> {
  try {
    return await seedStaticToolsAdmin();
  } catch (err) {
    return { seeded: 0, errors: [err instanceof Error ? err.message : 'Seed failed'] };
  }
}
