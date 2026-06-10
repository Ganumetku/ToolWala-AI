/**
 * Seed blog_posts table from src/data/dynamic_blogs.json
 *
 * Usage: node scripts/seed-blogs.mjs
 */

import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

function loadEnv() {
  const envPath = resolve(root, '.env.local');
  if (!existsSync(envPath)) {
    console.error('❌ .env.local not found');
    process.exit(1);
  }
  for (const line of readFileSync(envPath, 'utf-8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim();
    if (!process.env[key]) process.env[key] = val;
  }
}

loadEnv();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const blogsPath = resolve(root, 'src/data/dynamic_blogs.json');
const blogs = JSON.parse(readFileSync(blogsPath, 'utf-8'));

const rows = blogs.map((b) => ({
  id: b.id.length === 36 ? b.id : undefined,
  slug: b.slug,
  title: b.title,
  excerpt: b.excerpt,
  content: b.content,
  thumbnail: b.thumbnail,
  category: b.category,
  tags: b.tags,
  featured: b.featured,
  trending: b.trending ?? false,
  status: b.status,
  published_at: b.publishedAt || null,
  author: b.author,
  seo_metadata: b.seoMetadata,
  faqs: b.faqs ?? [],
  related_tool_slugs: b.relatedToolSlugs ?? [],
  view_count: b.viewCount ?? 0,
  reading_time: b.readingTime,
}));

const { data, error } = await supabase.from('blog_posts').upsert(rows, { onConflict: 'slug' }).select('slug');

if (error) {
  console.error('❌ Seed failed:', error.message);
  process.exit(1);
}

console.log(`✅ Seeded ${data?.length ?? rows.length} blog posts`);
