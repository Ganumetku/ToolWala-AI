import fs from 'fs';
import path from 'path';

const targetLang = 'pt';

// Glossaries and placeholders helper
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
    temp = temp.replace(match, token);
  });

  // Protect HTML tags (for blog contents/excerpts)
  const htmlMatches = temp.match(/<[^>]+>/g) || [];
  const htmlTokens = [];
  htmlMatches.forEach((match, idx) => {
    const token = `___HTM_${idx}___`;
    htmlTokens.push({ token, val: match });
    temp = temp.replace(match, token);
  });

  // Protect glossary words (exact word matches)
  const glossaryTokens = [];
  GLOSSARY.forEach((word, idx) => {
    const regex = new RegExp(`\\b${word}\\b`, 'g');
    if (regex.test(temp)) {
      const token = `___GLS_${idx}___`;
      glossaryTokens.push({ token, val: word });
      temp = temp.replace(regex, token);
    }
  });

  return { temp, bracesTokens, htmlTokens, glossaryTokens };
}

function restoreText(text, { bracesTokens, htmlTokens, glossaryTokens }) {
  let result = text;
  
  // Restore glossary tokens
  glossaryTokens.forEach(({ token, val }) => {
    result = result.replace(new RegExp(token, 'g'), val);
  });

  // Restore HTML tokens
  htmlTokens.forEach(({ token, val }) => {
    result = result.replace(new RegExp(token, 'g'), val);
  });

  // Restore braces tokens
  bracesTokens.forEach(({ token, val }) => {
    result = result.replace(new RegExp(token, 'g'), val);
  });

  return result;
}

// Batch translator (max 15 strings per query)
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
  const ptPath = path.join(process.cwd(), 'messages/pt.json');
  
  console.log(`Reading English messages from ${enPath}...`);
  const enMessages = JSON.parse(fs.readFileSync(enPath, 'utf8'));
  
  const textStrings = new Set();
  collectKeys(enMessages, textStrings);
  console.log(`Collected ${textStrings.size} unique strings from en.json.`);
  
  console.log(`Translating UI messages to Portuguese...`);
  const translations = await translateTextsBatch(Array.from(textStrings));
  
  const ptMessages = replaceKeys(enMessages, translations);
  
  // Custom manual refinements for Portuguese navigation/general terms
  ptMessages.nav.about = "Sobre";
  ptMessages.nav.contact = "Contato";
  ptMessages.footer.about = "Sobre";
  ptMessages.footer.contact = "Contato";
  ptMessages.footer.copyright = "© 2026 ToolWala AI. Todos os direitos reservados.";

  fs.writeFileSync(ptPath, JSON.stringify(ptMessages, null, 2), 'utf8');
  console.log(`Successfully wrote fully translated Portuguese messages to ${ptPath}`);
}

async function translateToolTranslations() {
  const dbPath = path.join(process.cwd(), 'src/data/tool_translations.json');
  console.log(`Reading tool translations from ${dbPath}...`);
  const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

  let ptRecords = data.filter(r => r.locale === 'pt');
  console.log(`Found ${ptRecords.length} Portuguese records to update.`);

  if (ptRecords.length === 0) {
    console.log(`No Portuguese tool translation records found. Initializing from English source...`);
    const enRecords = data.filter(r => r.locale === 'en');
    enRecords.forEach(en => {
      const newRecord = {
        id: `trans-${en.toolSlug}-pt`,
        toolSlug: en.toolSlug,
        locale: 'pt',
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
    ptRecords = data.filter(r => r.locale === 'pt');
    console.log(`Initialized ${ptRecords.length} Portuguese tool records.`);
  }

  const textStrings = new Set();
  ptRecords.forEach(record => {
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
  console.log(`Translating tool descriptions and FAQs to Portuguese...`);
  const translations = await translateTextsBatch(Array.from(textStrings));

  data.forEach(record => {
    if (record.locale === 'pt') {
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
  console.log(`Successfully translated and saved tool_translations.json`);
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
    const ptText = translations[trimmed];
    if (ptText) {
      const leadingSpace = str.match(/^\s*/)?.[0] || '';
      const trailingSpace = str.match(/\s*$/)?.[0] || '';
      return `${leadingSpace}${ptText}${trailingSpace}`;
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
    const cacheKey = `pt:${blog.slug}`;
    console.log(`Preparing Portuguese translation for blog: ${blog.slug}...`);

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
  console.log(`Successfully cached all Portuguese blog translations in blog_translations.json`);
}

async function run() {
  try {
    await translateMessages();
    await translateToolTranslations();
    await translateBlogs();
    console.log(`🎉 Pipeline execution completed successfully!`);
  } catch (err) {
    console.error(`Pipeline failure:`, err);
  }
}

run();
