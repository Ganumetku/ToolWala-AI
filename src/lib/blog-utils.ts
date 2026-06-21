import type { Tool } from '@/data/tools';
import type { BlogFaq, BlogPost } from '@/types/blog';
import { marked } from 'marked';

/** Estimate reading time from HTML or plain text content */
export function computeReadingTime(content: string): string {
  const text = content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.ceil(wordCount / 200))} min read`;
}

/** Slugify text for URLs */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .trim();
}

// Configure marked for blog content
const renderer = new marked.Renderer();

// Add slugified IDs to headings for TOC anchoring
renderer.heading = ({ text, depth }: { text: string; depth: number }) => {
  const id = slugify(text.replace(/<[^>]+>/g, ''));
  return `<h${depth} id="${id}">${text}</h${depth}>`;
};

// Open external links in new tab, keep internal links as-is
renderer.link = ({ href, title, text }: { href: string; title?: string | null; text: string }) => {
  const isExternal = href && (href.startsWith('http://') || href.startsWith('https://'));
  const titleAttr = title ? ` title="${title}"` : '';
  if (isExternal) {
    return `<a href="${href}"${titleAttr} target="_blank" rel="noopener noreferrer">${text}</a>`;
  }
  return `<a href="${href}"${titleAttr}>${text}</a>`;
};

marked.setOptions({
  renderer,
  breaks: false,
  gfm: true,
});

/** Convert markdown content to HTML with shortcode support */
export function normalizeBlogContent(raw: string): string {
  let content = raw;

  // Shortcode: [cta tool="slug" title="..." description="..."]
  content = content.replace(
    /\[cta\s+tool="([^"]+)"(?:\s+title="([^"]*)")?(?:\s+description="([^"]*)")?\]/gi,
    (_, slug, title, description) =>
      `<div data-blog-cta data-tool-slug="${slug}" data-title="${title || ''}" data-description="${description || ''}"></div>`
  );

  // Shortcode: [tool slug="pdf-ocr" label="Try PDF OCR"]
  content = content.replace(
    /\[tool\s+slug="([^"]+)"(?:\s+label="([^"]*)")?\]/gi,
    (_, slug, label) =>
      `<div data-try-tool data-tool-slug="${slug}" data-label="${label || 'Try Tool'}"></div>`
  );

  // Convert markdown to HTML using marked
  const html = marked.parse(content, { async: false }) as string;

  return html;
}

/** Score and match related tools from blog metadata */
export function matchRelatedTools(blog: Pick<BlogPost, 'title' | 'excerpt' | 'content' | 'tags' | 'category' | 'slug'>, tools: Tool[], limit = 4): Tool[] {
  const haystack = [
    blog.title,
    blog.excerpt,
    blog.category,
    blog.slug.replace(/-/g, ' '),
    ...blog.tags,
    blog.content.replace(/<[^>]+>/g, ' '),
  ]
    .join(' ')
    .toLowerCase();

  const scored = tools
    .map((tool) => {
      let score = 0;
      const slugWords = tool.slug.split('-');
      const titleWords = tool.title.toLowerCase().split(/\s+/);

      if (haystack.includes(tool.slug.replace(/-/g, ' '))) score += 10;
      if (haystack.includes(tool.slug)) score += 8;

      for (const word of slugWords) {
        if (word.length > 3 && haystack.includes(word)) score += 3;
      }

      for (const word of titleWords) {
        if (word.length > 3 && haystack.includes(word)) score += 2;
      }

      for (const tag of tool.tags) {
        if (haystack.includes(tag.toLowerCase())) score += 4;
      }

      if (blog.category.toLowerCase().includes(tool.category.toLowerCase().split(' ')[0])) {
        score += 2;
      }

      return { tool, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, limit).map(({ tool }) => tool);
}

/** Related blogs by shared tags + category */
export function matchRelatedBlogs(blog: BlogPost, allBlogs: BlogPost[], limit = 4): BlogPost[] {
  return allBlogs
    .filter((b) => b.id !== blog.id && b.status === 'published')
    .map((b) => {
      let score = 0;
      if (b.category === blog.category) score += 5;
      const sharedTags = b.tags.filter((t) => blog.tags.includes(t));
      score += sharedTags.length * 3;
      return { blog: b, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ blog: b }) => b);
}

/** Trending blogs: explicit flag + view count + recency */
export function getTrendingBlogs(blogs: BlogPost[], limit = 5): BlogPost[] {
  const published = blogs.filter((b) => b.status === 'published');

  return [...published]
    .sort((a, b) => {
      const scoreA = (a.trending ? 1000 : 0) + a.viewCount * 2 + new Date(a.publishedAt || a.createdAt).getTime() / 1e10;
      const scoreB = (b.trending ? 1000 : 0) + b.viewCount * 2 + new Date(b.publishedAt || b.createdAt).getTime() / 1e10;
      return scoreB - scoreA;
    })
    .slice(0, limit);
}

/** Paginate an array */
export function paginate<T>(items: T[], page: number, pageSize: number) {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    page: safePage,
    pageSize,
    total,
    totalPages,
    hasNext: safePage < totalPages,
    hasPrev: safePage > 1,
  };
}

/** Search blogs by title, excerpt, tags, category */
export function searchBlogs(blogs: BlogPost[], query: string): BlogPost[] {
  const q = query.toLowerCase().trim();
  if (!q) return blogs;

  return blogs.filter(
    (b) =>
      b.title.toLowerCase().includes(q) ||
      b.excerpt.toLowerCase().includes(q) ||
      b.category.toLowerCase().includes(q) ||
      b.tags.some((t) => t.toLowerCase().includes(q))
  );
}

/** Build FAQ schema.org JSON-LD */
export function buildFaqJsonLd(faqs: BlogFaq[]) {
  if (!faqs.length) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}
