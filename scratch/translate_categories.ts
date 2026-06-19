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

async function translateWithLinks(text: string, targetLang: string): Promise<string> {
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  let match;
  let lastIndex = 0;
  let result = '';

  while ((match = linkRegex.exec(text)) !== null) {
    const plainText = text.substring(lastIndex, match.index);
    if (plainText) {
      result += await translate(plainText, targetLang);
    }
    const linkText = match[1];
    const linkUrl = match[2];
    const translatedLinkText = await translate(linkText, targetLang);
    result += ` [${translatedLinkText}](${linkUrl}) `;
    lastIndex = linkRegex.lastIndex;
    await new Promise(resolve => setTimeout(resolve, 80));
  }

  if (lastIndex < text.length) {
    result += await translate(text.substring(lastIndex), targetLang);
  }

  // Clean up duplicate spaces
  return result.replace(/\s+/g, ' ').trim();
}

async function run() {
  const enPath = path.join(process.cwd(), 'messages/en.json');
  const enMessages = JSON.parse(fs.readFileSync(enPath, 'utf8'));
  const enCategories = enMessages.categories;

  if (!enCategories) {
    console.error('No categories block found in en.json');
    return;
  }

  const categoryIds = Object.keys(enCategories).filter(key => {
    return typeof enCategories[key] === 'object' && enCategories[key] !== null && 'longDescription' in enCategories[key];
  });

  console.log(`Found categories to translate:`, categoryIds);

  for (const locale of locales) {
    const targetPath = path.join(process.cwd(), `messages/${locale}.json`);
    if (!fs.existsSync(targetPath)) {
      console.warn(`Translation file ${targetPath} does not exist. Skipping.`);
      continue;
    }

    console.log(`\n--- Starting translation for locale: ${locale} ---`);
    const targetMessages = JSON.parse(fs.readFileSync(targetPath, 'utf8'));
    if (!targetMessages.categories) {
      targetMessages.categories = {};
    }

    for (const catId of categoryIds) {
      console.log(`Translating category: ${catId}...`);
      const enCat = enCategories[catId];
      if (!targetMessages.categories[catId]) {
        targetMessages.categories[catId] = {};
      }
      const targetCat = targetMessages.categories[catId];

      // 1. Long Description
      if (enCat.longDescription) {
        console.log(`- Translating longDescription...`);
        targetCat.longDescription = await translateWithLinks(enCat.longDescription, locale);
      }

      // 2. whyUse
      if (Array.isArray(enCat.whyUse)) {
        console.log(`- Translating whyUse array...`);
        targetCat.whyUse = [];
        for (const item of enCat.whyUse) {
          const transTitle = await translate(item.title, locale);
          const transDesc = await translateWithLinks(item.desc, locale);
          targetCat.whyUse.push({
            title: transTitle,
            desc: transDesc,
            icon: item.icon
          });
          await new Promise(resolve => setTimeout(resolve, 80));
        }
      }

      // 3. howItWorks
      if (Array.isArray(enCat.howItWorks)) {
        console.log(`- Translating howItWorks array...`);
        targetCat.howItWorks = [];
        for (const item of enCat.howItWorks) {
          const transTitle = await translate(item.title, locale);
          const transDesc = await translate(item.desc, locale);
          targetCat.howItWorks.push({
            step: item.step,
            title: transTitle,
            desc: transDesc
          });
          await new Promise(resolve => setTimeout(resolve, 80));
        }
      }

      // Sleep a bit between categories
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    fs.writeFileSync(targetPath, JSON.stringify(targetMessages, null, 2), 'utf8');
    console.log(`Successfully wrote translations to ${targetPath}!`);
  }

  console.log('\n🎉 Translation synchronization complete for categories!');
}

run().catch(console.error);
