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

const translationsPath = resolve(root, 'src/data/tool_translations.json');
const translations = JSON.parse(readFileSync(translationsPath, 'utf-8'));

// Format rows for postgres columns:
// id, tool_slug, locale, title, description, faq, seo_title, seo_description, created_at, updated_at
const rows = translations.map((t) => ({
  tool_slug: t.toolSlug,
  locale: t.locale,
  title: t.title,
  description: t.description,
  faq: t.faq ?? [],
  seo_title: t.seoTitle ?? null,
  seo_description: t.seoDescription ?? null,
  created_at: t.createdAt || new Date().toISOString(),
  updated_at: t.updatedAt || new Date().toISOString(),
}));

console.log(`Upserting ${rows.length} tool translations to Supabase...`);
const { data, error } = await supabase
  .from('tool_translations')
  .upsert(rows, { onConflict: 'tool_slug,locale' })
  .select('tool_slug,locale');

if (error) {
  console.error('❌ Tool translation seed failed:', error.message);
  process.exit(1);
}

console.log(`✅ Seeded ${data?.length ?? rows.length} tool translation records`);
