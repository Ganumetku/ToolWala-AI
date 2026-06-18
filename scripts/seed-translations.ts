import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import { toolArticles } from '../src/data/toolArticles';
import { toolsData } from '../src/data/tools';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

// Load env vars from .env.local
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

// Load static translation files
const enPath = resolve(root, 'messages/en.json');
const hiPath = resolve(root, 'messages/hi.json');
const enMessages = JSON.parse(readFileSync(enPath, 'utf-8'));
const hiMessages = JSON.parse(readFileSync(hiPath, 'utf-8'));

const translationRecords: any[] = [];

// Localized FAQs for Image Compressor (Hindi)
const hiImageCompressorFaqs = [
  {
    question: "क्या इमेज कंप्रेसर का उपयोग करना मुफ़्त है?",
    answer: "हाँ, ToolWala AI इमेज कंप्रेसर पूरी तरह से मुफ़्त है। बिना किसी सीमा या वॉटरमार्क के जितनी चाहें उतनी छवियों को संपीड़ित करें।"
  },
  {
    question: "क्या मेरी तस्वीरें सुरक्षित हैं?",
    answer: "बिल्कुल! सुरक्षा हमारी सर्वोच्च प्राथमिकता है। संपीड़न प्रक्रिया 100% क्लाइंट-साइड (आपके ब्राउज़र में) चलती है। आपकी फ़ाइलें कभी भी किसी बाहरी सर्वर पर अपलोड नहीं की जाती हैं।"
  },
  {
    question: "क्या संपीड़न के बाद मेरी छवि की गुणवत्ता कम हो जाएगी?",
    answer: "हमारा टूल स्मार्ट संपीड़न एल्गोरिदम का उपयोग करता है जो दृश्य गुणवत्ता को बनाए रखते हुए फ़ाइल आकार को 90% तक कम कर देता है। आप अंतर भी नहीं देख पाएंगे!"
  },
  {
    question: "मैं यहाँ कौन से फ़ाइल प्रारूप संपीड़ित कर सकता हूँ?",
    answer: "आप सीधे अपने ब्राउज़र में JPG, JPEG, PNG, और WebP प्रारूपों को आसानी से संपीड़ित कर सकते हैं।"
  }
];

// Localized FAQs for PDF to JPG (Hindi)
const hiPdfToJpgFaqs = [
  {
    question: "क्या पीडीएफ से जेपीजी कनवर्टर सुरक्षित है?",
    answer: "हाँ, पूरी तरह सुरक्षित। रूपांतरण सीधे आपके ब्राउज़र में स्थानीय रूप से होता है। आपकी पीडीएफ फाइलें और उत्पन्न छवियां कभी भी किसी सर्वर पर अपलोड नहीं की जाती हैं।"
  },
  {
    question: "क्या रूपांतरण के दौरान गुणवत्ता खो जाएगी?",
    answer: "नहीं, हमारा कनवर्टर पीडीएफ के प्रत्येक पृष्ठ को मूल रिज़ॉल्यूशन को बनाए रखते हुए उच्च-गुणवत्ता वाली JPG छवियों में बदलता है।"
  },
  {
    question: "क्या मैं विशिष्ट पृष्ठों को चुनकर उन्हें बदल सकता हूँ?",
    answer: "हाँ, टूल में आप संपूर्ण पीडीएफ या विशिष्ट पृष्ठों को निकालने के लिए चुन सकते हैं जिन्हें आप छवि में बदलना चाहते हैं।"
  }
];

// Loop through all defined tools in toolsData
for (const tool of toolsData) {
  const slug = tool.id;
  const article = toolArticles[slug] || { title: tool.title, intro: tool.description, faqs: [] };

  // 1. Resolve English translation values
  const enTitle = enMessages.tools?.[slug]?.title || article.title || tool.title;
  const enDesc = enMessages.tools?.[slug]?.description || article.intro || tool.description;
  const enSeoTitle = enMessages.tools?.[slug]?.meta_title || `${tool.title} – Free Online Tool`;
  const enSeoDesc = enMessages.tools?.[slug]?.meta_description || tool.description;
  const enFaqs = article.faqs || [];

  translationRecords.push({
    toolSlug: slug,
    locale: 'en',
    title: enTitle,
    description: enDesc,
    faq: enFaqs,
    seoTitle: enSeoTitle,
    seoDescription: enSeoDesc
  });

  // 2. Resolve Hindi translation values
  const hiTitle = hiMessages.tools?.[slug]?.title || enTitle;
  const hiDesc = hiMessages.tools?.[slug]?.description || enDesc;
  const hiSeoTitle = hiMessages.tools?.[slug]?.meta_title || `${hiTitle} – मुफ़्त ऑनलाइन टूल`;
  const hiSeoDesc = hiMessages.tools?.[slug]?.meta_description || hiDesc;
  
  // Choose custom translated FAQ if available, otherwise translate/fallback to English
  let hiFaqs = enFaqs;
  if (slug === 'image-compressor') {
    hiFaqs = hiImageCompressorFaqs;
  } else if (slug === 'pdf-to-jpg') {
    hiFaqs = hiPdfToJpgFaqs;
  }

  translationRecords.push({
    toolSlug: slug,
    locale: 'hi',
    title: hiTitle,
    description: hiDesc,
    faq: hiFaqs,
    seoTitle: hiSeoTitle,
    seoDescription: hiSeoDesc
  });

  // 3. Resolve Spanish translation values (mocked/fallback for future 30+ support)
  translationRecords.push({
    toolSlug: slug,
    locale: 'es',
    title: enTitle,
    description: enDesc,
    faq: enFaqs,
    seoTitle: enSeoTitle,
    seoDescription: enSeoDesc
  });

  // 4. Resolve French translation values (mocked/fallback for future 30+ support)
  translationRecords.push({
    toolSlug: slug,
    locale: 'fr',
    title: enTitle,
    description: enDesc,
    faq: enFaqs,
    seoTitle: enSeoTitle,
    seoDescription: enSeoDesc
  });
}

// Write to local JSON fallback database (tool_translations.json)
const jsonDbPath = resolve(root, 'src/data/tool_translations.json');
const now = new Date().toISOString();
const localRecords = translationRecords.map((r, i) => ({
  id: `trans-${i}-${r.toolSlug}-${r.locale}`,
  toolSlug: r.toolSlug,
  locale: r.locale,
  title: r.title,
  description: r.description,
  faq: r.faq,
  seoTitle: r.seoTitle,
  seoDescription: r.seoDescription,
  createdAt: now,
  updatedAt: now
}));

writeFileSync(jsonDbPath, JSON.stringify(localRecords, null, 2), 'utf-8');
console.log(`✅ Saved ${localRecords.length} records to local database fallback (tool_translations.json)`);

// Seed to Supabase if config is present
if (SUPABASE_URL && SERVICE_KEY) {
  const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  console.log('⏳ Connecting to Supabase to seed database...');
  
  const dbRows = translationRecords.map((r) => ({
    tool_slug: r.toolSlug,
    locale: r.locale,
    title: r.title,
    description: r.description,
    faq: r.faq,
    seo_title: r.seoTitle,
    seo_description: r.seoDescription,
    updated_at: now
  }));

  supabase.from('tool_translations')
    .upsert(dbRows, { onConflict: 'tool_slug,locale' })
    .then(({ data, error }) => {
      if (error) {
        console.error('❌ Supabase seeding failed:', error.message);
      } else {
        console.log(`✅ Successfully seeded ${dbRows.length} translations directly to Supabase`);
      }
    });
} else {
  console.log('ℹ️ Supabase credentials not found, skipped SQL seeding.');
}
