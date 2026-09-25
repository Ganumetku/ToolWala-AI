import { toolsData, type Tool } from '@/data/tools';

/** Inverse pairs so convert-A pages always suggest convert-B. */
export const COMPLEMENTARY_TOOL_SLUGS: Record<string, string[]> = {
  'pdf-to-word-converter': ['word-to-pdf-converter', 'pdf-to-excel-converter', 'compress-pdf'],
  'word-to-pdf-converter': ['pdf-to-word-converter', 'jpg-to-pdf', 'merge-pdf'],
  'pdf-to-excel-converter': ['excel-to-pdf-converter', 'pdf-to-word-converter'],
  'excel-to-pdf-converter': ['pdf-to-excel-converter', 'word-to-pdf-converter'],
  'pdf-to-jpg': ['jpg-to-pdf', 'compress-pdf', 'image-compressor'],
  'jpg-to-pdf': ['pdf-to-jpg', 'merge-pdf', 'image-compressor'],
  'merge-pdf': ['split-pdf', 'compress-pdf', 'organize-pdf'],
  'split-pdf': ['merge-pdf', 'remove-pages', 'organize-pdf'],
  'compress-pdf': ['merge-pdf', 'image-compressor', 'jpg-to-pdf'],
  'edit-pdf': ['sign-pdf', 'watermark-pdf', 'organize-pdf'],
  'sign-pdf': ['edit-pdf', 'protect-pdf'],
  'unlock-pdf': ['protect-pdf', 'compress-pdf'],
  'protect-pdf': ['unlock-pdf', 'sign-pdf'],
  'image-compressor': ['bg-remover', 'jpg-to-pdf', 'passport-photo-maker'],
  'bg-remover': ['image-compressor', 'passport-photo-maker', 'jpg-to-pdf'],
  'passport-photo-maker': ['image-compressor', 'ssc-photo-resize', 'signature-resize'],
  'resume-builder': ['ats-resume-checker', 'cover-letter-generator', 'pdf-to-word-converter'],
  'ats-resume-checker': ['resume-builder', 'cover-letter-generator'],
  'cover-letter-generator': ['resume-builder', 'ats-resume-checker'],
};

export function getRelatedTools(currentSlug: string, limit = 6): Tool[] {
  const clean = currentSlug.replace(/\/$/, '');
  const current = toolsData.find((t) => t.slug === clean || t.id === clean);
  if (!current) return [];

  const pairSlugs = new Set(COMPLEMENTARY_TOOL_SLUGS[current.slug] || COMPLEMENTARY_TOOL_SLUGS[current.id] || []);

  const scored = toolsData
    .filter((t) => t.isVisible && t.status === 'published' && t.slug !== current.slug && t.id !== current.id)
    .map((tool) => {
      let score = 0;
      if (pairSlugs.has(tool.slug) || pairSlugs.has(tool.id)) score += 100;
      if (tool.category === current.category) score += 40;
      const shared = tool.tags.filter((tag) =>
        current.tags.some((ct) => ct.toLowerCase() === tag.toLowerCase())
      );
      score += shared.length * 10;
      if (tool.popular) score += 5;
      if (tool.trending) score += 5;
      return { tool, score };
    })
    .sort((a, b) => b.score - a.score);

  const picked: Tool[] = [];
  const seen = new Set<string>();
  for (const slug of pairSlugs) {
    const match = toolsData.find((t) => (t.slug === slug || t.id === slug) && t.isVisible);
    if (match && !seen.has(match.id)) {
      picked.push(match);
      seen.add(match.id);
    }
  }
  for (const row of scored) {
    if (picked.length >= limit) break;
    if (seen.has(row.tool.id)) continue;
    picked.push(row.tool);
    seen.add(row.tool.id);
  }
  return picked.slice(0, limit);
}
