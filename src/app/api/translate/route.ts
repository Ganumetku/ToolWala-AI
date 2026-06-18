import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const CACHE_FILE = path.join(process.cwd(), 'src/data/ui_translations.json');

// Ensure cache file exists
function loadCache(): Record<string, string> {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      return JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'));
    }
  } catch (err) {
    console.error('Failed to read ui_translations.json:', err);
  }
  return {};
}

function saveCache(cache: Record<string, string>) {
  try {
    const dir = path.dirname(CACHE_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write ui_translations.json:', err);
  }
}

const hasDevanagari = (str: string) => /[\u0900-\u097F]/.test(str || '');

async function translateTextsBatch(texts: string[], targetLang = 'hi'): Promise<Record<string, string>> {
  const results: Record<string, string> = {};
  const toTranslate: string[] = [];

  for (const text of texts) {
    const trimmed = text.trim();
    if (!trimmed || hasDevanagari(trimmed)) {
      results[text] = trimmed || text;
      continue;
    }
    // Check if it's a number or basic symbol
    if (/^[\d\s.,\-+*/%=():!@#$^&[\]{}<>|\\?]*$/.test(trimmed)) {
      results[text] = trimmed;
      continue;
    }
    toTranslate.push(trimmed);
  }

  if (toTranslate.length === 0) {
    return results;
  }

  const batchSize = 15;
  for (let i = 0; i < toTranslate.length; i += batchSize) {
    const chunk = toTranslate.slice(i, i + batchSize);
    try {
      const payload = chunk.join('\n');
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(payload)}`;
      const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
      if (!res.ok) throw new Error(`Google Translate fetch failed: ${res.statusText}`);
      const data = await res.json();
      const translatedText = data[0].map((s: any) => s[0]).join('');
      const translatedLines = translatedText.split('\n').map((s: string) => s.trim());
      
      if (translatedLines.length === chunk.length) {
        chunk.forEach((original, idx) => {
          results[original] = translatedLines[idx] || original;
        });
      } else {
        // Fallback: translate individually
        for (const original of chunk) {
          try {
            const indUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(original)}`;
            const indRes = await fetch(indUrl, { signal: AbortSignal.timeout(5000) });
            if (!indRes.ok) throw new Error(`Google Translate fetch failed: ${indRes.statusText}`);
            const indData = await indRes.json();
            results[original] = indData[0].map((s: any) => s[0]).join('').trim();
          } catch (err) {
            results[original] = original;
          }
        }
      }
    } catch (err) {
      console.error(`Error translating batch chunk:`, err);
      // Fallback: translate individually
      for (const original of chunk) {
        try {
          const indUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(original)}`;
          const indRes = await fetch(indUrl, { signal: AbortSignal.timeout(5000) });
          if (!indRes.ok) throw new Error(`Google Translate fetch failed: ${indRes.statusText}`);
          const indData = await indRes.json();
          results[original] = indData[0].map((s: any) => s[0]).join('').trim();
        } catch (indErr) {
          results[original] = original;
        }
      }
    }
  }

  return results;
}

export async function POST(request: Request) {
  try {
    const { texts, targetLang = 'hi' } = await request.json();
    if (!Array.isArray(texts)) {
      return NextResponse.json({ error: 'texts must be an array of strings' }, { status: 400 });
    }

    const cache = loadCache();
    const results: Record<string, string> = {};
    const missingTexts: string[] = [];
    let cacheUpdated = false;

    // First, try loading from cache or handle numbers/symbols
    for (const text of texts) {
      const trimmed = text.trim();
      if (!trimmed) {
        results[text] = text;
        continue;
      }

      if (/^[\d\s.,\-+*/%=():!@#$^&[\]{}<>|\\?]*$/.test(trimmed)) {
        results[text] = text;
        continue;
      }

      const cacheKey = `${targetLang}:${trimmed}`;
      if (cache[cacheKey]) {
        results[text] = cache[cacheKey];
      } else {
        missingTexts.push(trimmed);
      }
    }

    // Translate all missing texts in a batch
    if (missingTexts.length > 0) {
      const translations = await translateTextsBatch(missingTexts, targetLang);
      for (const text of missingTexts) {
        const cacheKey = `${targetLang}:${text}`;
        const translated = translations[text] || text;
        cache[cacheKey] = translated;
        cacheUpdated = true;
      }

      // Re-map results for all items
      for (const text of texts) {
        const trimmed = text.trim();
        if (results[text] !== undefined) continue;
        const cacheKey = `${targetLang}:${trimmed}`;
        results[text] = cache[cacheKey] || text;
      }
    }

    if (cacheUpdated) {
      saveCache(cache);
    }

    return NextResponse.json({ translations: results });
  } catch (err: any) {
    console.error('API Translation error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
