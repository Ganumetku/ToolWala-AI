/** Homepage shows only these tools. Edit this list to change Top Picks. */
export const HOMEPAGE_TOP_TOOL_IDS = [
  'merge-pdf',
  'compress-pdf',
  'edit-pdf',
  'pdf-to-word-converter',
  'word-to-pdf-converter',
  'image-compressor',
  'bg-remover',
  'passport-photo-maker',
  'resume-builder',
  'jpg-to-pdf',
] as const;

export const HOMEPAGE_TOP_PICK_IDS = new Set<string>([
  ...HOMEPAGE_TOP_TOOL_IDS,
  'background-remover',
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
