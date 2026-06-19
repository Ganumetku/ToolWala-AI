import { toolsData, Tool } from '@/data/tools';

export type ToolOverride = Partial<
  Pick<Tool, 'status' | 'isVisible' | 'featured' | 'trending' | 'popular' | 'publishDate'>
>;

/** LIVE rule: status === published AND isVisible === true (scheduled auto-publishes when date passes) */
export function isToolLive(tool: Tool): boolean {
  if (tool.isVisible !== true) return false;
  if (tool.status === 'published') return true;
  if (tool.status === 'scheduled') {
    if (!tool.publishDate) return false;
    return new Date(tool.publishDate) <= new Date();
  }
  return false;
}

let publicToolsCachePromise: Promise<Tool[]> | null = null;
let publicToolsCacheTimestamp = 0;
const CLIENT_CACHE_TTL = 30000; // 30 seconds

/** Client-side: fetch public tools from API with static fallback */
export async function fetchPublicTools(): Promise<Tool[]> {
  const now = Date.now();
  if (publicToolsCachePromise && (now - publicToolsCacheTimestamp < CLIENT_CACHE_TTL)) {
    return publicToolsCachePromise;
  }

  publicToolsCachePromise = (async () => {
    try {
      const res = await fetch('/api/tools/public/', { next: { revalidate: 60 } } as RequestInit);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.tools)) return data.tools;
      }
    } catch {
      // fall through to static
    }
    return toolsData.filter(isToolLive);
  })();

  publicToolsCacheTimestamp = now;
  return publicToolsCachePromise;
}

/** Client-side: fetch all tools (admin) from API with static fallback */
export async function fetchAdminTools(): Promise<Tool[]> {
  try {
    const res = await fetch('/api/admin/tools/');
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.tools)) return data.tools;
    }
  } catch {
    // fall through
  }
  return toolsData;
}

const toolBySlugCache: Record<string, { promise: Promise<Tool | null>; timestamp: number }> = {};

/** Client-side: fetch single tool by slug */
export async function fetchToolBySlug(slug: string): Promise<Tool | null> {
  const now = Date.now();
  if (toolBySlugCache[slug] && (now - toolBySlugCache[slug].timestamp < CLIENT_CACHE_TTL)) {
    return toolBySlugCache[slug].promise;
  }

  const promise = (async () => {
    try {
      const res = await fetch(`/api/tools/public/?slug=${encodeURIComponent(slug)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.tool) return data.tool;
      }
    } catch {
      // fall through
    }
    return toolsData.find((t) => t.slug === slug) ?? null;
  })();

  toolBySlugCache[slug] = { promise, timestamp: now };
  return promise;
}

/** Synchronous helpers using static data (SSR fallback / offline) */
export function getPublicTools(baseTools: Tool[] = toolsData): Tool[] {
  return baseTools.filter(isToolLive);
}

export function getAdminTools(baseTools: Tool[] = toolsData): Tool[] {
  return baseTools;
}

export function getToolBySlug(slug: string, baseTools: Tool[] = toolsData): Tool | null {
  return baseTools.find((t) => t.slug === slug) ?? null;
}

export function getFeaturedTools(baseTools: Tool[] = toolsData): Tool[] {
  return getPublicTools(baseTools).filter((t) => t.featured);
}

export function getToolsByCategory(category: string, baseTools: Tool[] = toolsData): Tool[] {
  const live = getPublicTools(baseTools);
  if (category === 'All') return live;
  return live.filter((t) => t.category === category);
}

export function getRelatedTools(slugs: string[], baseTools: Tool[] = toolsData): Tool[] {
  return getPublicTools(baseTools).filter((t) => slugs.includes(t.slug));
}

export function getScheduledTools(baseTools: Tool[] = toolsData): Tool[] {
  return baseTools.filter((t) => t.status === 'scheduled');
}

/** @deprecated Use API-backed admin updates instead */
export function saveAdminOverride(_toolId: string, _override: ToolOverride) {
  console.warn('saveAdminOverride is deprecated. Use /api/admin/tools PATCH instead.');
}

/** @deprecated */
export function getAdminOverrides(): Record<string, ToolOverride> {
  return {};
}
