import { jsonDb } from '@/lib/jsonDb';
import { computeReadingTime, matchRelatedTools } from '@/lib/blog-utils';
import { generateSeoSlug } from '@/lib/blog-seo';
import { getPublicTools } from '@/lib/tools-server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import type { BlogFaq, BlogPost, BlogStatus } from '@/types/blog';
import type { DbBlogPost } from '@/types/database';

function defaultAuthor() {
  return {
    name: 'ToolWala Editorial',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    role: 'Tech Writer',
  };
}

function parseFaqs(raw: unknown): BlogFaq[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((f, i) => ({
    id: String((f as BlogFaq).id || `faq-${i}`),
    question: String((f as BlogFaq).question || ''),
    answer: String((f as BlogFaq).answer || ''),
    order: Number((f as BlogFaq).order ?? i),
  }));
}

export function dbToBlog(row: DbBlogPost): BlogPost {
  const author = (row.author as unknown as BlogPost['author'])?.name
    ? (row.author as unknown as BlogPost['author'])
    : defaultAuthor();
  const seo = row.seo_metadata as unknown as BlogPost['seoMetadata'];

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt || '',
    content: row.content || '',
    thumbnail: row.thumbnail || '',
    category: row.category || 'AI Tools',
    tags: row.tags || [],
    featured: row.featured ?? false,
    trending: row.trending ?? false,
    status: row.status as BlogStatus,
    publishedAt: row.published_at || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    author,
    seoMetadata: seo ?? null,
    faqs: parseFaqs(row.faqs),
    relatedToolSlugs: row.related_tool_slugs || [],
    viewCount: row.view_count ?? 0,
    readingTime: row.reading_time || computeReadingTime(row.content || ''),
  };
}

export function blogToDb(
  blog: Partial<BlogPost> & Pick<BlogPost, 'slug' | 'title'>
): Partial<DbBlogPost> {
  return {
    slug: blog.slug,
    title: blog.title,
    excerpt: blog.excerpt,
    content: blog.content,
    thumbnail: blog.thumbnail,
    category: blog.category,
    tags: blog.tags,
    featured: blog.featured,
    trending: blog.trending,
    status: blog.status,
    published_at: blog.publishedAt || null,
    author: blog.author as unknown as Record<string, unknown>,
    seo_metadata: (blog.seoMetadata ?? null) as unknown as Record<string, unknown> | null,
    faqs: blog.faqs as unknown,
    related_tool_slugs: blog.relatedToolSlugs,
    view_count: blog.viewCount,
    reading_time: blog.readingTime,
  };
}

function jsonToBlog(row: ReturnType<typeof jsonDb.getBlogs>[number]): BlogPost {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    content: row.content,
    thumbnail: row.thumbnail,
    category: row.category,
    tags: row.tags,
    featured: row.featured,
    trending: (row as BlogPost).trending ?? false,
    status: row.status,
    publishedAt: row.publishedAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    author: row.author,
    seoMetadata: row.seoMetadata,
    faqs: (row as BlogPost).faqs ?? [],
    relatedToolSlugs: (row as BlogPost).relatedToolSlugs ?? [],
    viewCount: (row as BlogPost).viewCount ?? 0,
    readingTime: row.readingTime,
  };
}

async function fetchFromSupabase(): Promise<BlogPost[] | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from('blog_posts')
      .select('*')
      .order('published_at', { ascending: false, nullsFirst: false });

    if (error) {
      if (error.code === '42P01') return null; // table doesn't exist
      throw error;
    }

    return (data as DbBlogPost[]).map(dbToBlog);
  } catch {
    return null;
  }
}

/** All blogs (admin) — Supabase DB merged with JSON fallback & auto-sync */
export async function getAllBlogs(): Promise<BlogPost[]> {
  const jsonBlogs = jsonDb.getBlogs().map(jsonToBlog);
  const fromDb = await fetchFromSupabase();

  if (!fromDb) {
    return jsonBlogs;
  }

  const dbSlugs = new Set(fromDb.map((b) => b.slug));
  const dbIds = new Set(fromDb.map((b) => b.id));

  // Find JSON blogs missing in Supabase DB
  const missingInDb = jsonBlogs.filter((b) => !dbSlugs.has(b.slug) && !dbIds.has(b.id));

  if (missingInDb.length > 0) {
    for (const blog of missingInDb) {
      try {
        await saveBlog(blog);
      } catch (err) {
        console.warn(`[blogs-server] Syncing JSON blog ${blog.slug} to Supabase failed:`, err);
      }
    }
    const updatedDb = await fetchFromSupabase();
    if (updatedDb) return updatedDb;
  }

  return [...fromDb, ...missingInDb];
}

/** Published blogs for public pages */
export async function getPublicBlogs(): Promise<BlogPost[]> {
  const all = await getAllBlogs();
  return all
    .filter((b) => b.status === 'published')
    .sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return new Date(b.publishedAt || b.createdAt).getTime() - new Date(a.publishedAt || a.createdAt).getTime();
    });
}

export async function getBlogBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .single();

    if (!error && data) return dbToBlog(data as DbBlogPost);
  } catch {
    // fall through
  }

  const json = jsonDb.getBlogs().find((b) => b.slug === slug);
  return json ? jsonToBlog(json) : null;
}

export async function getBlogsByCategory(category: string): Promise<BlogPost[]> {
  const blogs = await getPublicBlogs();
  return blogs.filter((b) => b.category.toLowerCase() === category.toLowerCase());
}

export async function getBlogsByTag(tag: string): Promise<BlogPost[]> {
  const blogs = await getPublicBlogs();
  const normalized = tag.toLowerCase().replace(/-/g, ' ');
  return blogs.filter((b) =>
    b.tags.some((t) => t.toLowerCase() === normalized || slugifyTag(t) === tag.toLowerCase())
  );
}

export function slugifyTag(tag: string): string {
  return tag.toLowerCase().replace(/\s+/g, '-');
}

/** Auto-resolve related tool slugs if not manually set */
export async function resolveRelatedToolSlugs(blog: BlogPost): Promise<string[]> {
  if (blog.relatedToolSlugs.length > 0) return blog.relatedToolSlugs;

  const tools = await getPublicTools();
  return matchRelatedTools(blog, tools, 4).map((t) => t.slug);
}

export async function saveBlog(blog: BlogPost): Promise<BlogPost> {
  const tools = await getPublicTools();
  const relatedToolSlugs =
    blog.relatedToolSlugs.length > 0
      ? blog.relatedToolSlugs
      : matchRelatedTools(blog, tools, 4).map((t) => t.slug);

  const payload = blogToDb({ ...blog, relatedToolSlugs });

  try {
    const { data, error } = await supabaseAdmin
      .from('blog_posts')
      .upsert({ ...payload, id: blog.id }, { onConflict: 'id' })
      .select()
      .single();

    if (!error && data) return dbToBlog(data as DbBlogPost);
    if (error?.code !== '42P01') throw error;
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[blogs-server] Supabase save failed, using JSON fallback:', err);
    }
  }

  const blogs = jsonDb.getBlogs().map(jsonToBlog);
  const index = blogs.findIndex((b) => b.id === blog.id);
  const next = { ...blog, relatedToolSlugs };
  if (index >= 0) blogs[index] = next;
  else blogs.push(next);

  jsonDb.saveBlogs(
    blogs.map((b) => ({
      id: b.id,
      slug: b.slug,
      title: b.title,
      excerpt: b.excerpt,
      content: b.content,
      thumbnail: b.thumbnail,
      category: b.category,
      tags: b.tags,
      featured: b.featured,
      trending: b.trending,
      status: b.status,
      publishedAt: b.publishedAt,
      createdAt: b.createdAt,
      updatedAt: b.updatedAt,
      author: b.author,
      seoMetadata: b.seoMetadata,
      faqs: b.faqs,
      relatedToolSlugs: b.relatedToolSlugs,
      viewCount: b.viewCount,
      readingTime: b.readingTime,
    }))
  );

  return next;
}

export async function deleteBlog(id: string): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin.from('blog_posts').delete().eq('id', id);
    if (!error) return true;
    if (error.code !== '42P01') throw error;
  } catch {
    // fall through
  }

  const blogs = jsonDb.getBlogs().filter((b) => b.id !== id);
  if (blogs.length === jsonDb.getBlogs().length) return false;
  jsonDb.saveBlogs(blogs);
  return true;
}

export async function incrementBlogView(slug: string): Promise<void> {
  try {
    const { data } = await supabaseAdmin
      .from('blog_posts')
      .select('id, view_count')
      .eq('slug', slug)
      .single();

    if (data) {
      await supabaseAdmin
        .from('blog_posts')
        .update({ view_count: (data.view_count ?? 0) + 1 })
        .eq('id', data.id);
    }
  } catch {
    // non-critical
  }
}

export function buildBlogFromBody(
  body: Record<string, unknown>,
  existing?: BlogPost
): BlogPost {
  const now = new Date().toISOString();
  const status = (body.status as BlogStatus) || existing?.status || 'draft';
  const title = (body.title as string) || existing?.title || '';
  const slug = (body.slug as string) || existing?.slug || generateSeoSlug(title);
  const content = (body.content as string) || existing?.content || '';

  return {
    id: existing?.id || (body.id as string) || crypto.randomUUID(),
    slug,
    title,
    excerpt: (body.excerpt as string) ?? existing?.excerpt ?? '',
    content,
    thumbnail: (body.thumbnail as string) ?? existing?.thumbnail ?? '',
    category: (body.category as string) ?? existing?.category ?? 'AI Tools',
    tags: Array.isArray(body.tags) ? (body.tags as string[]) : existing?.tags ?? [],
    featured: body.featured !== undefined ? Boolean(body.featured) : (existing?.featured ?? false),
    trending: body.trending !== undefined ? Boolean(body.trending) : (existing?.trending ?? false),
    status,
    publishedAt:
      status === 'published'
        ? (body.publishedAt as string) || existing?.publishedAt || now
        : (body.publishedAt as string) ?? existing?.publishedAt ?? '',
    createdAt: existing?.createdAt || now,
    updatedAt: now,
    author: (body.author as BlogPost['author']) || existing?.author || defaultAuthor(),
    seoMetadata: (body.seoMetadata as BlogPost['seoMetadata']) ?? existing?.seoMetadata ?? null,
    faqs: Array.isArray(body.faqs) ? parseFaqs(body.faqs) : existing?.faqs ?? [],
    relatedToolSlugs: Array.isArray(body.relatedToolSlugs)
      ? (body.relatedToolSlugs as string[])
      : existing?.relatedToolSlugs ?? [],
    viewCount: existing?.viewCount ?? 0,
    readingTime:
      (body.readingTime as string) ||
      existing?.readingTime ||
      computeReadingTime(content),
  };
}
