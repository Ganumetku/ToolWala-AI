import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

// Load env vars
function loadEnv() {
  const envPath = resolve(root, '.env.local');
  if (existsSync(envPath)) {
    const lines = readFileSync(envPath, 'utf-8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      const val = trimmed.slice(eq + 1).trim();
      if (!process.env[key]) process.env[key] = val;
    }
  }
}
loadEnv();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

const hasDevanagari = (str) => /[\u0900-\u097F]/.test(str || '');

async function translate(text, targetLang = 'hi') {
  if (!text || !text.trim()) return '';
  // Skip translating if it is already Hindi
  if (hasDevanagari(text)) return text;
  
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Fetch failed: ${res.statusText}`);
    const data = await res.json();
    const translated = data[0].map(s => s[0]).join('');
    return translated;
  } catch (err) {
    console.error(`Error translating "${text}":`, err);
    return text;
  }
}

async function run() {
  const jsonDbPath = resolve(root, 'src/data/tool_translations.json');
  if (!existsSync(jsonDbPath)) {
    console.error('Error: tool_translations.json not found.');
    return;
  }

  const records = JSON.parse(readFileSync(jsonDbPath, 'utf-8'));
  const enRecords = records.filter(r => r.locale === 'en');
  const hiRecords = records.filter(r => r.locale === 'hi');

  console.log(`Starting translation fix for ${hiRecords.length} Hindi tool records...`);

  let count = 0;
  for (let idx = 0; idx < hiRecords.length; idx++) {
    const hi = hiRecords[idx];
    const en = enRecords.find(r => r.toolSlug === hi.toolSlug) || {};

    let modified = false;

    // Check title
    if (!hasDevanagari(hi.title)) {
      const original = hi.title;
      hi.title = await translate(en.title || hi.title, 'hi');
      console.log(`[${hi.toolSlug}] Translated title: "${original}" -> "${hi.title}"`);
      modified = true;
    }

    // Check description
    if (!hasDevanagari(hi.description)) {
      const original = hi.description;
      hi.description = await translate(en.description || hi.description, 'hi');
      console.log(`[${hi.toolSlug}] Translated description: "${original.slice(0, 30)}..." -> "${hi.description.slice(0, 30)}..."`);
      modified = true;
    }

    // Check seoTitle
    if (!hi.seoTitle || !hasDevanagari(hi.seoTitle)) {
      const original = hi.seoTitle || '';
      hi.seoTitle = await translate(en.seoTitle || hi.seoTitle || hi.title, 'hi');
      console.log(`[${hi.toolSlug}] Translated seoTitle: "${original.slice(0, 30)}..." -> "${hi.seoTitle.slice(0, 30)}..."`);
      modified = true;
    }

    // Check seoDescription
    if (!hi.seoDescription || !hasDevanagari(hi.seoDescription)) {
      const original = hi.seoDescription || '';
      hi.seoDescription = await translate(en.seoDescription || hi.seoDescription || hi.description, 'hi');
      console.log(`[${hi.toolSlug}] Translated seoDescription: "${original.slice(0, 30)}..." -> "${hi.seoDescription.slice(0, 30)}..."`);
      modified = true;
    }

    // Check FAQs
    const enFaqs = en.faq || [];
    const hiFaqs = hi.faq || [];

    for (let i = 0; i < hiFaqs.length; i++) {
      const hiFaq = hiFaqs[i];
      const enFaq = enFaqs[i] || {};

      if (!hasDevanagari(hiFaq.question)) {
        const original = hiFaq.question;
        hiFaq.question = await translate(enFaq.question || hiFaq.question, 'hi');
        console.log(`[${hi.toolSlug}] Translated FAQ question [${i}]: "${original.slice(0, 30)}..." -> "${hiFaq.question.slice(0, 30)}..."`);
        modified = true;
      }

      if (!hasDevanagari(hiFaq.answer)) {
        const original = hiFaq.answer;
        hiFaq.answer = await translate(enFaq.answer || hiFaq.answer, 'hi');
        console.log(`[${hi.toolSlug}] Translated FAQ answer [${i}]: "${original.slice(0, 30)}..." -> "${hiFaq.answer.slice(0, 30)}..."`);
        modified = true;
      }
    }

    if (modified) {
      hi.updatedAt = new Date().toISOString();
      count++;
    }

    // Sleep for 100ms between tools to avoid heavy spamming
    await new Promise(r => setTimeout(r, 100));
  }

  // Update records array
  const updatedRecords = records.map(r => {
    if (r.locale === 'hi') {
      const matchingHi = hiRecords.find(h => h.toolSlug === r.toolSlug);
      return matchingHi ? matchingHi : r;
    }
    return r;
  });

  // Write back to file
  writeFileSync(jsonDbPath, JSON.stringify(updatedRecords, null, 2), 'utf-8');
  console.log(`\n✅ Finished! Successfully translated and updated ${count} tools in tool_translations.json`);

  // Push to Supabase if configured
  if (SUPABASE_URL && SERVICE_KEY) {
    console.log('\n⏳ Connecting to Supabase to sync translation updates...');
    const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const dbRows = hiRecords.map((r) => ({
      tool_slug: r.toolSlug,
      locale: r.locale,
      title: r.title,
      description: r.description,
      faq: r.faq,
      seo_title: r.seoTitle,
      seo_description: r.seoDescription,
      updated_at: r.updatedAt
    }));

    const { error } = await supabase.from('tool_translations')
      .upsert(dbRows, { onConflict: 'tool_slug,locale' });

    if (error) {
      console.error('❌ Supabase translation sync failed:', error.message);
    } else {
      console.log(`✅ Successfully synced all ${dbRows.length} Hindi translations to Supabase!`);
    }
  } else {
    console.log('ℹ️ Supabase credentials not found, skipped SQL sync.');
  }
}

run().catch(console.error);
