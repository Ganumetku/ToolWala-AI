import { toolsData, Tool } from '@/data/tools';

export type ToolOverride = Partial<Pick<Tool, 'status' | 'isVisible' | 'featured' | 'trending' | 'popular' | 'publishDate'>>;

// Get overrides from local storage (Client-side only)
export function getAdminOverrides(): Record<string, ToolOverride> {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem('toolVisibilityOverrides') || '{}');
  } catch {
    return {};
  }
}

export function saveAdminOverride(toolId: string, override: ToolOverride) {
  if (typeof window === 'undefined') return;
  const current = getAdminOverrides();
  current[toolId] = { ...current[toolId], ...override };
  localStorage.setItem('toolVisibilityOverrides', JSON.stringify(current));
}

// Get all tools merged with local admin overrides
export function getAdminTools(baseTools: Tool[] = toolsData): Tool[] {
  const overrides = getAdminOverrides();
  return baseTools.map(tool => {
    const override = overrides[tool.id];
    if (!override) return tool;
    return { ...tool, ...override };
  });
}

// Determine if a tool should be visible to public users
export function isToolLive(tool: Tool): boolean {
  if (tool.isVisible !== true) return false;
  if (tool.status === 'published') return true;
  if (tool.status === 'scheduled') {
    if (!tool.publishDate) return false;
    return new Date(tool.publishDate) <= new Date();
  }
  return false;
}

// Get only live tools
export function getPublicTools(baseTools: Tool[] = toolsData): Tool[] {
  const liveTools = getAdminTools(baseTools).filter(isToolLive);
  console.log("Live Tools", liveTools);
  return liveTools;
}

// Get scheduled tools
export function getScheduledTools(baseTools: Tool[] = toolsData): Tool[] {
  return getAdminTools(baseTools).filter(t => t.status === 'scheduled');
}

// Get public featured tools
export function getFeaturedTools(baseTools: Tool[] = toolsData): Tool[] {
  return getPublicTools(baseTools).filter(t => t.featured);
}

// Get tools by category
export function getToolsByCategory(category: string, baseTools: Tool[] = toolsData): Tool[] {
  const liveTools = getPublicTools(baseTools);
  if (category === "All") return liveTools;
  return liveTools.filter(t => t.category === category);
}

// Get related tools by slug
export function getRelatedTools(slugs: string[], baseTools: Tool[] = toolsData): Tool[] {
  const liveTools = getPublicTools(baseTools);
  return liveTools.filter(t => slugs.includes(t.slug));
}
