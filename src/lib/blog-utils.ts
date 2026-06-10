import type { Tool } from '@/data/tools';
import type { BlogFaq, BlogPost } from '@/types/blog';

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


/** Convert markdown-style ### headings to HTML h2/h3 with anchor ids */
export function normalizeBlogContent(raw: string): string {
  let html = raw;

  // Legacy markdown ### headings → h3
  html = html.replace(/^### (.+)$/gm, (_, title: string) => {
    const id = slugify(title);
    return `<h3 id="${id}">${title}</h3>`;
  });

  // Legacy ## headings → h2
  html = html.replace(/^## (.+)$/gm, (_, title: string) => {
    const id = slugify(title);
    return `<h2 id="${id}">${title}</h2>`;
  });

  // Shortcode: [cta tool="slug" title="..." description="..."]
  html = html.replace(
    /\[cta\s+tool="([^"]+)"(?:\s+title="([^"]*)")?(?:\s+description="([^"]*)")?\]/gi,
    (_, slug, title, description) =>
      `<div data-blog-cta data-tool-slug="${slug}" data-title="${title || ''}" data-description="${description || ''}"></div>`
  );

  // Shortcode: [tool slug="pdf-ocr" label="Try PDF OCR"]
  html = html.replace(
    /\[tool\s+slug="([^"]+)"(?:\s+label="([^"]*)")?\]/gi,
    (_, slug, label) =>
      `<div data-try-tool data-tool-slug="${slug}" data-label="${label || 'Try Tool'}"></div>`
  );

  // Plain newlines → paragraphs when content isn't already HTML-heavy
  if (!/<(p|h[1-6]|ul|ol|div|blockquote)/i.test(html)) {
    html = html
      .split(/\n\n+/)
      .map((block) => block.trim())
      .filter(Boolean)
      .map((block) => `<p>${block.replace(/\n/g, '<br/>')}</p>`)
      .join('\n');
  }

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
