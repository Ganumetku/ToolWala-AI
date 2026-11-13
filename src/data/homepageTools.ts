/** Homepage shows only these tools. Edit this list to change the grid. */
export const HOMEPAGE_TOP_TOOL_IDS = [
  'jpg-to-pdf',
  'merge-pdf',
  'compress-pdf',
  'aadhaar-pdf-compressor',
  'passport-photo-maker',
  'ssc-photo-resize',
  'cover-letter-generator',
  'image-compressor',
] as const;

/** Keep this tiny — a badge on every card means nothing. */
export const HOMEPAGE_TOP_PICK_IDS = new Set<string>([
  'jpg-to-pdf',
  'aadhaar-pdf-compressor',
  'passport-photo-maker',
]);

export const DIRECTORY_FILTERS = [
  { id: 'All', label: 'All Tools' },
  { id: 'PDF Tools', label: 'PDF Tools' },
  { id: 'Image Tools', label: 'Image Tools' },
  { id: 'AI Tools', label: 'AI Tools' },
  { id: 'Govt & Exam', label: 'Govt & Exam' },
  { id: 'Calculator Tools', label: 'Calculator Tools' },
] as const;

export const DIRECTORY_PAGE_SIZE = 20;

const GOVT_TAGS = new Set([
  'govt',
  'exam',
  'aadhaar',
  'pan',
  'ssc',
  'upsc',
  'resizer',
  'government',
]);

export function matchesDirectoryFilter(
  tool: { category: string; tags: string[] },
  filterId: string
): boolean {
  if (filterId === 'All') return true;
  if (filterId === 'Govt & Exam') {
    return (
      tool.category === 'Document Tools' ||
      tool.tags.some((tag) => GOVT_TAGS.has(tag.toLowerCase()))
    );
  }
  return tool.category === filterId;
}
