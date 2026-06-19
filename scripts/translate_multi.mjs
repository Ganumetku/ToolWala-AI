import fs from 'fs';
import path from 'path';

const targetLang = process.argv[2];

if (!targetLang) {
  console.error("❌ Please specify a target language (e.g. node scripts/translate_multi.mjs fr)");
  process.exit(1);
}

const REFINEMENTS = {
  fr: {
    nav_about: "À propos",
    nav_contact: "Contactez-nous",
    footer_about: "À propos",
    footer_contact: "Contact",
    copyright: "© 2026 ToolWala AI. Tous droits réservés."
  },
  de: {
    nav_about: "Über uns",
    nav_contact: "Kontakt",
    footer_about: "Über uns",
    footer_contact: "Kontakt",
    copyright: "© 2026 ToolWala AI. Alle Rechte vorbehalten."
  },
  id: {
    nav_about: "Tentang",
    nav_contact: "Hubungi Kami",
    footer_about: "Tentang",
    footer_contact: "Kontak",
    copyright: "© 2026 ToolWala AI. Hak cipta dilindungi undang-undang."
  },
  ar: {
    nav_about: "من نحن",
    nav_contact: "اتصل بنا",
    footer_about: "من نحن",
    footer_contact: "اتصل بنا",
    copyright: "© 2026 ToolWala AI. جميع الحقوق محفوظة."
  }
};

const GLOSSARY = [
  'ToolWala AI',
  'ToolWala',
  'Aadhaar',
  'UIDAI',
  'NSDL',
  'UTIITSL',
  'SSC',
  'IBPS',
  'PDF',
  'OCR',
  'WASM',
  'ATS',
  'SIP',
  'EMI',
  'GST',
  'CVS',
  'Walgreens',
  'Walmart'
];

function protectText(text) {
  let temp = text;
  
  // Protect braces like {count}, {field}, {query}, {email}
  const bracesMatches = temp.match(/\{[^}]+\}/g) || [];
  const bracesTokens = [];
  bracesMatches.forEach((match, idx) => {
    const token = `___BRC_${idx}___`;
    bracesTokens.push({ token, val: match });
    temp = temp.split(match).join(token);
  });

  // Protect HTML tags (for blog contents/excerpts)
  const htmlMatches = temp.match(/<[^>]+>/g) || [];
  const htmlTokens = [];
  htmlMatches.forEach((match, idx) => {
    const token = `___HTM_${idx}___`;
    htmlTokens.push({ token, val: match });
    temp = temp.split(match).join(token);
  });

  // Protect glossary words (exact word matches)
  const glossaryTokens = [];
  GLOSSARY.forEach((word, idx) => {
    const regex = new RegExp(`\\b${word}\\b`, 'g');
    const token = `___GLS_${idx}___`;
    const replaced = temp.replace(regex, token);
    if (replaced !== temp) {
      glossaryTokens.push({ token, val: word });
      temp = replaced;
    }
  });

  return { temp, bracesTokens, htmlTokens, glossaryTokens };
}

function restoreText(text, { bracesTokens, htmlTokens, glossaryTokens }) {
  let result = text;
  
  // Restore glossary tokens with mutation tolerance
  glossaryTokens.forEach(({ token, val }) => {
    const idxMatch = token.match(/\d+/);
    if (idxMatch) {
      const idx = idxMatch[0];
      const pattern = new RegExp(`_*\\s*(GLS|gls)\\s*_*\\s*${idx}\\s*_*`, 'g');
      result = result.replace(pattern, val);
    }
  });

  // Restore HTML tokens with mutation tolerance
  htmlTokens.forEach(({ token, val }) => {
    const idxMatch = token.match(/\d+/);
    if (idxMatch) {
      const idx = idxMatch[0];
      const pattern = new RegExp(`_*\\s*(HTM|htm)\\s*_*\\s*${idx}\\s*_*`, 'g');
      result = result.replace(pattern, val);
    }
  });

  // Restore braces tokens with mutation tolerance
  bracesTokens.forEach(({ token, val }) => {
    const idxMatch = token.match(/\d+/);
    if (idxMatch) {
      const idx = idxMatch[0];
      const pattern = new RegExp(`_*\\s*(BRC|brc)\\s*_*\\s*${idx}\\s*_*`, 'g');
      result = result.replace(pattern, val);
    }
  });

  return result;
}

// Batch translator (max 12 strings per query)
async function translateTextsBatch(texts) {
  const results = {};
  const toTranslate = [];
  const protectedData = {};

  for (const text of texts) {
    const trimmed = text.trim();
    if (!trimmed) {
      results[text] = text;
      continue;
    }
    // Check if it's numeric/symbols only
    if (/^[\d\s.,\-+*/%=():!@#$^&[\]{}<>|\\?]*$/.test(trimmed)) {
      results[text] = trimmed;
      continue;
    }
    
    const protectedInfo = protectText(trimmed);
    protectedData[trimmed] = protectedInfo;
    toTranslate.push(trimmed);
  }

  if (toTranslate.length === 0) {
    return results;
  }

  const batchSize = 12; // safe batch limit
  for (let i = 0; i < toTranslate.length; i += batchSize) {
    const chunk = toTranslate.slice(i, i + batchSize);
    const payload = chunk.map(c => protectedData[c].temp).join('\n');
    
    try {
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(payload)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Fetch failed: ${res.statusText}`);
      
      const data = await res.json();
      const translatedText = data[0].map(s => s[0]).join('');
      const translatedLines = translatedText.split('\n').map(s => s.trim());
      
      if (translatedLines.length === chunk.length) {
        chunk.forEach((original, idx) => {
          const transRaw = translatedLines[idx] || original;
          results[original] = restoreText(transRaw, protectedData[original]);
        });
      } else {
        // fallback to individual
        for (const original of chunk) {
          results[original] = await translateTextIndividual(original, protectedData[original]);
        }
      }
    } catch (err) {
      console.warn(`Batch translation failed for chunk. Doing individual fallbacks...`, err);
      for (const original of chunk) {
        results[original] = await translateTextIndividual(original, protectedData[original]);
      }
    }
  }

  return results;
}

async function translateTextIndividual(original, protectedInfo) {
  try {
    const payload = protectedInfo.temp;
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(payload)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Individual fetch failed`);
    const data = await res.json();
    const transRaw = data[0].map(s => s[0]).join('').trim();
    return restoreText(transRaw, protectedInfo);
  } catch (err) {
    console.error(`Error translating individual string [${original}]:`, err);
    return original;
  }
}

// Collect translation strings recursively from nested object keys
function collectKeys(obj, set) {
  for (const k in obj) {
    if (typeof obj[k] === 'object' && obj[k] !== null) {
      collectKeys(obj[k], set);
    } else if (typeof obj[k] === 'string') {
      set.add(obj[k]);
    }
  }
}

// Replace strings recursively
function replaceKeys(obj, translations) {
  const next = Array.isArray(obj) ? [] : {};
  for (const k in obj) {
    if (typeof obj[k] === 'object' && obj[k] !== null) {
      next[k] = replaceKeys(obj[k], translations);
    } else if (typeof obj[k] === 'string') {
      next[k] = translations[obj[k]] || obj[k];
    } else {
      next[k] = obj[k];
    }
  }
  return next;
}

async function translateMessages() {
  const enPath = path.join(process.cwd(), 'messages/en.json');
  const outPath = path.join(process.cwd(), `messages/${targetLang}.json`);
  
  console.log(`Reading English messages from ${enPath}...`);
  const enMessages = JSON.parse(fs.readFileSync(enPath, 'utf8'));
  
  const textStrings = new Set();
  collectKeys(enMessages, textStrings);
  console.log(`Collected ${textStrings.size} unique strings from en.json.`);
  
  console.log(`Translating UI messages to ${targetLang}...`);
  const translations = await translateTextsBatch(Array.from(textStrings));
  
  const targetMessages = replaceKeys(enMessages, translations);
  
  // Custom manual refinements for target language
  const refs = REFINEMENTS[targetLang];
  if (refs) {
    if (targetMessages.nav) {
      targetMessages.nav.about = refs.nav_about;
      targetMessages.nav.contact = refs.nav_contact;
    }
    if (targetMessages.footer) {
      targetMessages.footer.about = refs.footer_about;
      targetMessages.footer.contact = refs.footer_contact;
      targetMessages.footer.copyright = refs.copyright;
    }
  }

  fs.writeFileSync(outPath, JSON.stringify(targetMessages, null, 2), 'utf8');
  console.log(`Successfully wrote fully translated ${targetLang} messages to ${outPath}`);
}

async function translateToolTranslations() {
  const dbPath = path.join(process.cwd(), 'src/data/tool_translations.json');
  console.log(`Reading tool translations from ${dbPath}...`);
  const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

  let targetRecords = data.filter(r => r.locale === targetLang);
  console.log(`Found ${targetRecords.length} ${targetLang} records to update.`);

  if (targetRecords.length === 0) {
    console.log(`No ${targetLang} tool translation records found. Initializing from English source...`);
    const enRecords = data.filter(r => r.locale === 'en');
    enRecords.forEach(en => {
      const newRecord = {
        id: `trans-${en.toolSlug}-${targetLang}`,
        toolSlug: en.toolSlug,
        locale: targetLang,
        title: en.title,
        description: en.description,
        seoTitle: en.seoTitle || '',
        seoDescription: en.seoDescription || '',
        faq: (en.faq || []).map(f => ({ question: f.question, answer: f.answer })),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      data.push(newRecord);
    });
    targetRecords = data.filter(r => r.locale === targetLang);
    console.log(`Initialized ${targetRecords.length} ${targetLang} tool records.`);
  }

  const textStrings = new Set();
  targetRecords.forEach(record => {
    // Find corresponding English source to translate from
    const enSource = data.find(r => r.toolSlug === record.toolSlug && r.locale === 'en');
    if (enSource) {
      textStrings.add(enSource.title);
      textStrings.add(enSource.description);
      textStrings.add(enSource.seoTitle || '');
      textStrings.add(enSource.seoDescription || '');
      (enSource.faq || []).forEach(f => {
        textStrings.add(f.question);
        textStrings.add(f.answer);
      });
    }
  });

  console.log(`Collected ${textStrings.size} unique strings from English tool templates.`);
  console.log(`Translating tool descriptions and FAQs to ${targetLang}...`);
  const translations = await translateTextsBatch(Array.from(textStrings));

  data.forEach(record => {
    if (record.locale === targetLang) {
      const enSource = data.find(r => r.toolSlug === record.toolSlug && r.locale === 'en');
      if (enSource) {
        record.title = translations[enSource.title] || enSource.title;
        record.description = translations[enSource.description] || enSource.description;
        record.seoTitle = translations[enSource.seoTitle || ''] || enSource.seoTitle;
        record.seoDescription = translations[enSource.seoDescription || ''] || enSource.seoDescription;
        record.faq = (enSource.faq || []).map(f => ({
          question: translations[f.question] || f.question,
          answer: translations[f.answer] || f.answer
        }));
        record.updatedAt = new Date().toISOString();
      }
    }
  });

  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
  console.log(`Successfully translated and saved tool_translations.json for ${targetLang}`);
}

// Translate markdown content helper
function collectMarkdownTexts(markdown) {
  if (!markdown) return [];
  const lines = markdown.split('\n');
  const texts = new Set();
  let inCodeBlock = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      continue;
    }
    if (inCodeBlock || !trimmed) continue;

    // Headings
    const headingMatch = line.match(/^(#{1,6}\s+)(.*)$/);
    if (headingMatch) {
      texts.add(headingMatch[2].trim());
      continue;
    }

    // List items
    const listMatch = line.match(/^(\s*[\-\*]\s+)(.*)$/);
    if (listMatch) {
      texts.add(listMatch[2].trim());
      continue;
    }
    const numListMatch = line.match(/^(\s*\d+\.\s+)(.*)$/);
    if (numListMatch) {
      texts.add(numListMatch[2].trim());
      continue;
    }

    // Links [text](url)
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const linkMatches = Array.from(line.matchAll(linkRegex));
    if (linkMatches.length > 0) {
      linkMatches.forEach(m => texts.add(m[1].trim()));
    } else {
      texts.add(line.trim());
    }
  }
  return Array.from(texts);
}

function translateMarkdown(markdown, translations) {
  if (!markdown) return '';
  const lines = markdown.split('\n');
  const translatedLines = [];
  let inCodeBlock = false;

  const getTrans = (str) => {
    const trimmed = str.trim();
    if (!trimmed) return str;
    const transText = translations[trimmed];
    if (transText) {
      const leadingSpace = str.match(/^\s*/)?.[0] || '';
      const trailingSpace = str.match(/\s*$/)?.[0] || '';
      return `${leadingSpace}${transText}${trailingSpace}`;
    }
    return str;
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      translatedLines.push(line);
      continue;
    }
    if (inCodeBlock) {
      translatedLines.push(line);
      continue;
    }
    if (!trimmed) {
      translatedLines.push('');
      continue;
    }

    // Headings
    const headingMatch = line.match(/^(#{1,6}\s+)(.*)$/);
    if (headingMatch) {
      translatedLines.push(`${headingMatch[1]}${getTrans(headingMatch[2])}`);
      continue;
    }

    // Lists
    const listMatch = line.match(/^(\s*[\-\*]\s+)(.*)$/);
    if (listMatch) {
      translatedLines.push(`${listMatch[1]}${getTrans(listMatch[2])}`);
      continue;
    }
    const numListMatch = line.match(/^(\s*\d+\.\s+)(.*)$/);
    if (numListMatch) {
      translatedLines.push(`${numListMatch[1]}${getTrans(numListMatch[2])}`);
      continue;
    }

    // Links [text](url)
    let processed = line;
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const linkMatches = Array.from(line.matchAll(linkRegex));
    if (linkMatches.length > 0) {
      linkMatches.forEach(m => {
        const full = m[0];
        const linkText = m[1];
        const linkUrl = m[2];
        processed = processed.replace(full, `[${getTrans(linkText)}](${linkUrl})`);
      });
      translatedLines.push(processed);
    } else {
      translatedLines.push(getTrans(line));
    }
  }

  return translatedLines.join('\n');
}

async function translateBlogs() {
  const blogsPath = path.join(process.cwd(), 'src/data/dynamic_blogs.json');
  const cachePath = path.join(process.cwd(), 'src/data/blog_translations.json');

  console.log(`Reading blogs from ${blogsPath}...`);
  const blogs = JSON.parse(fs.readFileSync(blogsPath, 'utf8'));

  let cache = {};
  if (fs.existsSync(cachePath)) {
    cache = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
  }

  for (const blog of blogs) {
    const cacheKey = `${targetLang}:${blog.slug}`;
    console.log(`Preparing ${targetLang} translation for blog: ${blog.slug}...`);

    const textStrings = new Set();
    textStrings.add(blog.title);
    textStrings.add(blog.excerpt);
    textStrings.add(blog.seoMetadata?.title || blog.title);
    textStrings.add(blog.seoMetadata?.description || blog.excerpt || '');
    textStrings.add(blog.seoMetadata?.keywords || blog.tags.join(', '));
    (blog.faqs || []).forEach(f => {
      textStrings.add(f.question);
      textStrings.add(f.answer);
    });

    const mdTexts = collectMarkdownTexts(blog.content);
    mdTexts.forEach(t => textStrings.add(t));

    console.log(`Collected ${textStrings.size} unique strings for blog.`);
    const translations = await translateTextsBatch(Array.from(textStrings));

    const getTrans = (str) => {
      const trimmed = str.trim();
      return (trimmed && translations[trimmed]) || str;
    };

    const title = getTrans(blog.title);
    const excerpt = getTrans(blog.excerpt);
    const seoTitle = getTrans(blog.seoMetadata?.title || blog.title);
    const seoDescription = getTrans(blog.seoMetadata?.description || blog.excerpt || '');
    const seoKeywords = getTrans(blog.seoMetadata?.keywords || blog.tags.join(', '));
    const faqs = (blog.faqs || []).map(f => ({
      ...f,
      question: getTrans(f.question),
      answer: getTrans(f.answer)
    }));

    const content = translateMarkdown(blog.content, translations);

    cache[cacheKey] = {
      title,
      excerpt,
      content,
      seoMetadata: {
        title: seoTitle,
        description: seoDescription,
        keywords: seoKeywords
      },
      faqs
    };
  }

  fs.writeFileSync(cachePath, JSON.stringify(cache, null, 2), 'utf8');
  console.log(`Successfully cached all ${targetLang} blog translations in blog_translations.json`);
}

async function run() {
  try {
    await translateMessages();
    await translateToolTranslations();
    await translateBlogs();
    console.log(`🎉 Pipeline execution completed successfully for ${targetLang}!`);
  } catch (err) {
    console.error(`Pipeline failure:`, err);
  }
}

run();
