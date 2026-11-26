import type { Tool } from '@/data/tools';
import type { BlogPost } from '@/types/blog';
import { computeReadingTime, slugify } from '@/lib/blog-utils';

const SITE_NAME = 'ToolWala AI';

export interface TocItem {
  id: string;
  text: string;
  level: 2 | 3;
}

export interface BreadcrumbItem {
  name: string;
  href: string;
}

export interface SeoCheck {
  id: string;
  label: string;
  passed: boolean;
  weight: number;
  message: string;
  suggestion?: string;
}

export interface SeoScoreResult {
  score: number;
  grade: 'Poor' | 'Fair' | 'Good' | 'Excellent';
  checks: SeoCheck[];
}

/** SEO-friendly slug from title — strips stop words optionally, max length */
export function generateSeoSlug(title: string, maxLength = 80): string {
  const stopWords = new Set([
    'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been',
    'how', 'what', 'why', 'when', 'where', 'your', 'our', 'their',
  ]);

  let slug = title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .split(/\s+/)
    .filter((word, i) => i === 0 || !stopWords.has(word))
    .join('-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  if (slug.length > maxLength) {
    slug = slug.slice(0, maxLength).replace(/-[^-]*$/, '');
  }

  return slug || slugify(title);
}

/** Ensure slug is unique among existing slugs */
export function ensureUniqueSlug(baseSlug: string, existingSlugs: string[], excludeId?: string): string {
  const taken = new Set(
    existingSlugs.filter((_, i) => true) // all slugs passed in should exclude current via caller
  );

  if (!taken.has(baseSlug)) return baseSlug;

  let counter = 2;
  while (taken.has(`${baseSlug}-${counter}`)) counter++;
  return `${baseSlug}-${counter}`;
}

/** Extract TOC from HTML/markdown content (server-safe) */
export function extractTableOfContents(content: string): TocItem[] {
  const normalized = content
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>');

  const items: TocItem[] = [];
  const headingRegex = /<h([23])[^>]*(?:id="([^"]*)")?[^>]*>(.*?)<\/h\1>/gi;
  let match: RegExpExecArray | null;
  let idx = 0;

  while ((match = headingRegex.exec(normalized)) !== null) {
    const level = Number(match[1]) as 2 | 3;
    const text = match[3].replace(/<[^>]+>/g, '').trim();
    if (!text) continue;
    const id = match[2] || slugify(text) || `section-${idx}`;
    items.push({ id, text, level });
    idx++;
  }

  return items;
}

/** Add loading="lazy" and decoding="async" to img tags missing them */
export function injectLazyLoadingImages(html: string): string {
  return html.replace(/<img\b([^>]*?)>/gi, (full, attrs: string) => {
    if (/loading\s*=/i.test(attrs)) return full;
    const alt = /alt\s*=/i.test(attrs) ? '' : ' alt=""';
    return `<img${attrs}${alt} loading="lazy" decoding="async">`;
  });
}

/** Ensure h2/h3 have anchor ids for TOC */
export function injectHeadingIds(html: string): string {
  let idx = 0;
  return html.replace(/<h([23])([^>]*)>(.*?)<\/h\1>/gi, (full, level, attrs, inner) => {
    if (/id\s*=/i.test(attrs)) return full;
    const text = inner.replace(/<[^>]+>/g, '').trim();
    const id = slugify(text) || `heading-${idx++}`;
    return `<h${level}${attrs} id="${id}">${inner}</h${level}>`;
  });
}

/** Auto internal links for tool slugs and blog slugs mentioned in plain text */
export function injectInternalLinks(
  html: string,
  tools: Pick<Tool, 'slug' | 'title' | 'href'>[],
  blogs: Pick<BlogPost, 'slug' | 'title'>[],
  currentSlug?: string
): string {
  // 1. Map lowercase titles to link configurations to avoid duplicate loops
  const termMap = new Map<string, { href: string; title: string }>();

  // Add blogs first, then tools so tools overwrite blogs if titles match (tools are higher priority)
  const sortedBlogs = blogs
    .filter((b) => b.slug !== currentSlug)
    .sort((a, b) => b.title.length - a.title.length);

  for (const blog of sortedBlogs) {
    termMap.set(blog.title.toLowerCase(), {
      href: `/blog/${blog.slug}/`,
      title: blog.title,
    });
  }

  const sortedTools = [...tools].sort((a, b) => b.title.length - a.title.length);
  for (const tool of sortedTools) {
    termMap.set(tool.title.toLowerCase(), {
      href: tool.href,
      title: tool.title,
    });
  }

  const keys = Array.from(termMap.keys()).sort((a, b) => b.length - a.length);
  if (keys.length === 0) return html;

  // Compile a single linear alternation regex matching any of the titles
  const escapedTerms = keys.map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const regex = new RegExp(`\\b(${escapedTerms.join('|')})\\b`, 'gi');

  // Split HTML by tags to isolate text nodes and prevent double linking inside tags or anchor elements
  const parts = html.split(/(<[^>]+>)/g);
  let insideLink = false;

  const resultParts = parts.map((part) => {
    if (part.startsWith('<')) {
      if (part.match(/^<a\b/i)) {
        insideLink = true;
      } else if (part.match(/^<\/a>/i)) {
        insideLink = false;
      }
      return part;
    } else {
      if (insideLink || !part.trim()) {
        return part;
      }
      // Single-pass replace on the text node
      return part.replace(regex, (match) => {
        const info = termMap.get(match.toLowerCase());
        if (info) {
          return `<a href="${info.href}" class="text-blue-400 hover:underline" title="${info.title}">${match}</a>`;
        }
        return match;
      });
    }
  });

  return resultParts.join('');
}

/** Prepare blog HTML for publish: ids, lazy images, internal links */
export function optimizeBlogContent(
  content: string,
  tools: Pick<Tool, 'slug' | 'title' | 'href'>[] = [],
  blogs: Pick<BlogPost, 'slug' | 'title'>[] = [],
  currentSlug?: string
): string {
  return injectInternalLinks(
    injectLazyLoadingImages(injectHeadingIds(content)),
    tools,
    blogs,
    currentSlug
  );
}

/** Build breadcrumb trail for a blog post */
export function buildBlogBreadcrumbs(blog: BlogPost): BreadcrumbItem[] {
  const categorySlug = blog.category.toLowerCase().replace(/\s+/g, '-');
  return [
    { name: 'Home', href: '/' },
    { name: 'Blog', href: '/blog/' },
    { name: blog.category, href: `/blog/category/${categorySlug}/` },
    { name: blog.title, href: `/blog/${blog.slug}/` },
  ];
}

/** Build breadcrumbs for category archive */
export function buildCategoryBreadcrumbs(category: string, slug: string): BreadcrumbItem[] {
  return [
    { name: 'Home', href: '/' },
    { name: 'Blog', href: '/blog/' },
    { name: category, href: `/blog/category/${slug}/` },
  ];
}

/** Build breadcrumbs for tag archive */
export function buildTagBreadcrumbs(tagLabel: string, tagSlug: string): BreadcrumbItem[] {
  return [
    { name: 'Home', href: '/' },
    { name: 'Blog', href: '/blog/' },
    { name: `#${tagLabel}`, href: `/blog/tag/${tagSlug}/` },
  ];
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function wordCount(content: string): number {
  return stripHtml(content).split(/\s+/).filter(Boolean).length;
}

function hasHeadings(content: string): boolean {
  return /<h[23]\b/i.test(content) || /^#{2,3}\s/m.test(content);
}

function imagesWithAlt(content: string): { total: number; withAlt: number } {
  const imgs = content.match(/<img\b[^>]*>/gi) || [];
  const withAlt = imgs.filter((img) => /alt\s*=\s*["'][^"']+["']/i.test(img)).length;
  return { total: imgs.length, withAlt };
}

/** Comprehensive SEO score for admin dashboard */
export function calculateBlogSeoScore(
  blog: Pick<
    BlogPost,
    'title' | 'slug' | 'excerpt' | 'content' | 'thumbnail' | 'tags' | 'category' | 'faqs' | 'seoMetadata' | 'status'
  >
): SeoScoreResult {
  const checks: SeoCheck[] = [];
  const seoTitle = blog.seoMetadata?.title || blog.title;
  const seoDesc = blog.seoMetadata?.description || blog.excerpt;
  const words = wordCount(blog.content);
  const imgStats = imagesWithAlt(blog.content);
  const toc = extractTableOfContents(blog.content);

  const add = (check: SeoCheck) => checks.push(check);

  // Title (15 pts)
  const titleLen = seoTitle.length;
  add({
    id: 'meta-title',
    label: 'Meta Title',
    passed: titleLen >= 30 && titleLen <= 60,
    weight: 15,
    message: titleLen === 0 ? 'Missing meta title' : `${titleLen} characters`,
    suggestion: titleLen < 30 ? 'Aim for 30–60 characters' : titleLen > 60 ? 'Shorten to under 60 characters' : undefined,
  });

  // Description (15 pts)
  const descLen = seoDesc.length;
  add({
    id: 'meta-description',
    label: 'Meta Description',
    passed: descLen >= 80 && descLen <= 160,
    weight: 15,
    message: descLen === 0 ? 'Missing description' : `${descLen} characters`,
    suggestion: descLen < 80 ? 'Write 80–160 characters' : descLen > 160 ? 'Trim to 160 characters max' : undefined,
  });

  // Slug (10 pts)
  const slugOk = /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(blog.slug) && blog.slug.length <= 80;
  add({
    id: 'slug',
    label: 'URL Slug',
    passed: slugOk,
    weight: 10,
    message: slugOk ? 'SEO-friendly slug' : 'Slug needs improvement',
    suggestion: !slugOk ? 'Use lowercase letters, numbers, and hyphens only' : undefined,
  });

  // Excerpt (8 pts)
  add({
    id: 'excerpt',
    label: 'Excerpt',
    passed: blog.excerpt.length >= 100,
    weight: 8,
    message: `${blog.excerpt.length} characters`,
    suggestion: blog.excerpt.length < 100 ? 'Write at least 100 characters for cards & SERP' : undefined,
  });

  // Featured image (10 pts)
  add({
    id: 'thumbnail',
    label: 'Featured Image',
    passed: Boolean(blog.thumbnail),
    weight: 10,
    message: blog.thumbnail ? 'Image set' : 'No featured image',
    suggestion: !blog.thumbnail ? 'Add a thumbnail for Open Graph & social shares' : undefined,
  });

  // Content length (12 pts)
  add({
    id: 'content-length',
    label: 'Content Length',
    passed: words >= 300,
    weight: 12,
    message: `${words} words`,
    suggestion: words < 300 ? 'Aim for 300+ words for better rankings' : undefined,
  });

  // Headings / TOC (8 pts)
  add({
    id: 'headings',
    label: 'Headings (TOC)',
    passed: hasHeadings(blog.content) && toc.length >= 2,
    weight: 8,
    message: `${toc.length} sections found`,
    suggestion: toc.length < 2 ? 'Add H2/H3 headings for structure & TOC' : undefined,
  });

  // Tags (7 pts)
  add({
    id: 'tags',
    label: 'Tags',
    passed: blog.tags.length >= 2,
    weight: 7,
    message: `${blog.tags.length} tags`,
    suggestion: blog.tags.length < 2 ? 'Add at least 2 relevant tags' : undefined,
  });

  // Category (5 pts)
  add({
    id: 'category',
    label: 'Category',
    passed: Boolean(blog.category),
    weight: 5,
    message: blog.category || 'No category',
  });

  // Keywords (5 pts)
  const keywords = blog.seoMetadata?.keywords || blog.tags.join(', ');
  add({
    id: 'keywords',
    label: 'Keywords',
    passed: keywords.length > 5,
    weight: 5,
    message: keywords ? 'Keywords set' : 'No keywords',
    suggestion: !keywords ? 'Add SEO keywords or tags' : undefined,
  });

  // Image alt text (5 pts)
  const altOk = imgStats.total === 0 || imgStats.withAlt === imgStats.total;
  add({
    id: 'image-alt',
    label: 'Image Alt Text',
    passed: altOk,
    weight: 5,
    message: imgStats.total === 0 ? 'No inline images' : `${imgStats.withAlt}/${imgStats.total} with alt`,
    suggestion: !altOk ? 'Add descriptive alt text to all images' : undefined,
  });

  // FAQ schema (5 pts bonus)
  add({
    id: 'faq',
    label: 'FAQ Schema',
    passed: (blog.faqs?.length ?? 0) >= 1,
    weight: 5,
    message: blog.faqs?.length ? `${blog.faqs.length} FAQs` : 'No FAQs',
    suggestion: !blog.faqs?.length ? 'Add FAQs for rich results in Google' : undefined,
  });

  // Published status (5 pts)
  add({
    id: 'published',
    label: 'Published',
    passed: blog.status === 'published',
    weight: 5,
    message: blog.status === 'published' ? 'Live & indexable' : 'Draft — not indexed',
    suggestion: blog.status !== 'published' ? 'Publish when ready for indexing' : undefined,
  });

  const totalWeight = checks.reduce((s, c) => s + c.weight, 0);
  const earned = checks.filter((c) => c.passed).reduce((s, c) => s + c.weight, 0);
  const score = Math.round((earned / totalWeight) * 100);

  const grade: SeoScoreResult['grade'] =
    score >= 85 ? 'Excellent' : score >= 70 ? 'Good' : score >= 50 ? 'Fair' : 'Poor';

  return { score, grade, checks };
}

/** Auto-generate SEO metadata from blog fields */
export function autoGenerateSeoMetadata(blog: Pick<BlogPost, 'title' | 'excerpt' | 'tags' | 'category'>) {
  const title =
    blog.title.length <= 60
      ? `${blog.title} | ${SITE_NAME}`
      : `${blog.title.slice(0, 57)}... | ${SITE_NAME}`;

  const description =
    blog.excerpt.length <= 160
      ? blog.excerpt
      : `${blog.excerpt.slice(0, 157)}...`;

  const keywords = [...blog.tags, blog.category].filter(Boolean).join(', ');

  return { title, description, keywords };
}

/** Reading time in minutes (numeric) */
export function getReadingTimeMinutes(content: string): number {
  const text = stripHtml(content);
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

export { computeReadingTime };
