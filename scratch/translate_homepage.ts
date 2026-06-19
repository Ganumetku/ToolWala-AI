import fs from 'fs';
import path from 'path';

const locales = ['hi', 'es'];

async function translate(text: string, targetLang: string): Promise<string> {
  const trimmed = text.trim();
  if (!trimmed) return '';
  if (/^[\d\s.,\-+*/%=():!@#$^&[\]{}<>|\\?]*$/.test(trimmed)) {
    return trimmed;
  }
  
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(trimmed)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Fetch failed: ${res.statusText}`);
    const data = await res.json();
    return data[0].map((s: any) => s[0]).join('').trim();
  } catch (err) {
    console.error(`Error translating "${trimmed}":`, err);
    return trimmed;
  }
}

async function run() {
  const enPath = path.join(process.cwd(), 'messages/en.json');
  const enMessages = JSON.parse(fs.readFileSync(enPath, 'utf8'));
  const enHome = enMessages.home;

  const targetKeys = [
    'trust_banner',
    'popular_shelf_title',
    'why_use_title',
    'how_it_works_title',
    'sandbox_diagram'
  ];

  for (const locale of locales) {
    const targetPath = path.join(process.cwd(), `messages/${locale}.json`);
    if (!fs.existsSync(targetPath)) {
      console.warn(`Translation file ${targetPath} does not exist. Skipping.`);
      continue;
    }

    console.log(`\n--- Starting homepage translation for locale: ${locale} ---`);
    const targetMessages = JSON.parse(fs.readFileSync(targetPath, 'utf8'));
    if (!targetMessages.home) {
      targetMessages.home = {};
    }

    for (const key of targetKeys) {
      const enVal = enHome[key];
      if (!enVal) continue;

      if (typeof enVal === 'string') {
        console.log(`Translating: home.${key} -> "${enVal}"`);
        targetMessages.home[key] = await translate(enVal, locale);
      } else if (typeof enVal === 'object' && enVal !== null) {
        console.log(`Translating object: home.${key}`);
        if (!targetMessages.home[key]) {
          targetMessages.home[key] = {};
        }
        for (const subKey of Object.keys(enVal)) {
          const enSubVal = enVal[subKey];
          console.log(`  - Translating subKey: ${subKey} -> "${enSubVal}"`);
          targetMessages.home[key][subKey] = await translate(enSubVal, locale);
          await new Promise(resolve => setTimeout(resolve, 80));
        }
      }
      await new Promise(resolve => setTimeout(resolve, 150));
    }

    fs.writeFileSync(targetPath, JSON.stringify(targetMessages, null, 2), 'utf8');
    console.log(`Successfully merged homepage translations into ${targetPath}!`);
  }

  console.log('\n🎉 Homepage translations complete!');
}

run().catch(console.error);
