import fs from 'fs';
import path from 'path';
import type { BlogPost } from '@/types/blog';

const CACHE_FILE = path.join(process.cwd(), 'src/data/blog_translations.json');

function loadCache(): Record<string, any> {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      return JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'));
    }
  } catch (err) {
    console.error('Failed to read blog_translations.json:', err);
  }
  return {};
}

function saveCache(cache: Record<string, any>) {
  try {
    const dir = path.dirname(CACHE_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write blog_translations.json:', err);
  }
}

const hasDevanagari = (str: string) => /[\u0900-\u097F]/.test(str || '');

export async function translateTextsBatch(texts: string[], targetLang = 'hi'): Promise<Record<string, string>> {
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

async function translateText(text: string, targetLang = 'hi'): Promise<string> {
  const res = await translateTextsBatch([text], targetLang);
  return res[text] || text;
}

function collectMarkdownTexts(markdown: string): string[] {
  if (!markdown) return [];
  const lines = markdown.split('\n');
  const texts = new Set<string>();
  let inCodeBlock = false;

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      continue;
    }

    if (inCodeBlock || !trimmed) {
      continue;
    }

    // Preserve headings
    const headingMatch = line.match(/^(#{1,6}\s+)(.*)$/);
    if (headingMatch) {
      const [, , content] = headingMatch;
      texts.add(content.trim());
      continue;
    }

    // Preserve simple markdown list items
    const listMatch = line.match(/^(\s*[\-\*]\s+)(.*)$/);
    if (listMatch) {
      const [, , content] = listMatch;
      texts.add(content.trim());
      continue;
    }

    const numListMatch = line.match(/^(\s*\d+\.\s+)(.*)$/);
    if (numListMatch) {
      const [, , content] = numListMatch;
      texts.add(content.trim());
      continue;
    }

    // Check link preservation: e.g. [text](url) -> translate only the text
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const linkMatches = Array.from(line.matchAll(linkRegex));

    if (linkMatches.length > 0) {
      for (const match of linkMatches) {
        const [, linkText] = match;
        texts.add(linkText.trim());
      }
    } else {
      texts.add(line.trim());
    }
  }

  return Array.from(texts);
}

/** Translate markdown content line-by-line using lookup dictionary, preserving syntax, headers, and code blocks */
async function translateMarkdown(
  markdown: string,
  targetLang = 'hi',
  translations: Record<string, string> = {}
): Promise<string> {
  if (!markdown) return '';
  
  let lookup = translations;
  if (Object.keys(lookup).length === 0) {
    const texts = collectMarkdownTexts(markdown);
    lookup = await translateTextsBatch(texts, targetLang);
  }

  const getTrans = (str: string): string => {
    const trimmed = str.trim();
    if (!trimmed) return str;
    const hi = lookup[trimmed];
    if (hi) {
      const leadingSpace = str.match(/^\s*/)?.[0] || '';
      const trailingSpace = str.match(/\s*$/)?.[0] || '';
      return `${leadingSpace}${hi}${trailingSpace}`;
    }
    return str;
  };

  const lines = markdown.split('\n');
  const translatedLines: string[] = [];
  let inCodeBlock = false;

  for (const line of lines) {
    const trimmed = line.trim();

    // Check code blocks
    if (trimmed.startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      translatedLines.push(line);
      continue;
    }

    if (inCodeBlock) {
      translatedLines.push(line);
      continue;
    }

    // Skip empty lines
    if (!trimmed) {
      translatedLines.push('');
      continue;
    }

    // Preserve headings
    const headingMatch = line.match(/^(#{1,6}\s+)(.*)$/);
    if (headingMatch) {
      const [, prefix, content] = headingMatch;
      const translatedContent = getTrans(content);
      translatedLines.push(`${prefix}${translatedContent}`);
      continue;
    }

    // Preserve simple markdown list items
    const listMatch = line.match(/^(\s*[\-\*]\s+)(.*)$/);
    if (listMatch) {
      const [, prefix, content] = listMatch;
      const translatedContent = getTrans(content);
      translatedLines.push(`${prefix}${translatedContent}`);
      continue;
    }

    const numListMatch = line.match(/^(\s*\d+\.\s+)(.*)$/);
    if (numListMatch) {
      const [, prefix, content] = numListMatch;
      const translatedContent = getTrans(content);
      translatedLines.push(`${prefix}${translatedContent}`);
      continue;
    }

    // Check link preservation: e.g. [text](url) -> translate only the text
    let processedLine = line;
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const linkMatches = Array.from(line.matchAll(linkRegex));

    if (linkMatches.length > 0) {
      for (const match of linkMatches) {
        const [full, linkText, linkUrl] = match;
        const translatedLinkText = getTrans(linkText);
        processedLine = processedLine.replace(full, `[${translatedLinkText}](${linkUrl})`);
      }
      translatedLines.push(processedLine);
    } else {
      // General line translation
      const translated = getTrans(line);
      translatedLines.push(translated);
    }
  }

  return translatedLines.join('\n');
}

export async function getBlogTranslationWithFallback(blog: BlogPost, locale: string): Promise<BlogPost> {
  if (!locale || locale === 'en') {
    return blog;
  }

  const cache = loadCache();
  const cacheKey = `${locale}:${blog.slug}`;

  if (cache[cacheKey]) {
    const cached = cache[cacheKey];
    return {
      ...blog,
      title: cached.title || blog.title,
      excerpt: cached.excerpt || blog.excerpt,
      content: cached.content || blog.content,
      seoMetadata: {
        title: cached.seoMetadata?.title || blog.seoMetadata?.title,
        description: cached.seoMetadata?.description || blog.seoMetadata?.description,
        keywords: cached.seoMetadata?.keywords || blog.seoMetadata?.keywords,
      },
      faqs: cached.faqs || blog.faqs,
    };
  }

  // Auto-translate values in a single optimized batch
  try {
    console.log(`Auto-translating blog post [${blog.slug}] to locale: ${locale}...`);
    
    // 1. Collect all plain-text strings
    const textsToTranslateSet = new Set<string>();
    
    textsToTranslateSet.add(blog.title);
    textsToTranslateSet.add(blog.excerpt);
    textsToTranslateSet.add(blog.seoMetadata?.title || blog.title);
    textsToTranslateSet.add(blog.seoMetadata?.description || blog.excerpt || '');
    textsToTranslateSet.add(blog.seoMetadata?.keywords || blog.tags.join(', '));
    
    blog.faqs.forEach(faq => {
      textsToTranslateSet.add(faq.question);
      textsToTranslateSet.add(faq.answer);
    });
    
    const mdTexts = collectMarkdownTexts(blog.content);
    mdTexts.forEach(t => textsToTranslateSet.add(t));
    
    // 2. Perform batch translation query
    const translations = await translateTextsBatch(Array.from(textsToTranslateSet), locale);
    
    // 3. Map translated fields
    const getTrans = (str: string): string => {
      const trimmed = str.trim();
      return (trimmed && translations[trimmed]) || str;
    };
    
    const title = getTrans(blog.title);
    const excerpt = getTrans(blog.excerpt);
    const seoTitle = getTrans(blog.seoMetadata?.title || blog.title);
    const seoDescription = getTrans(blog.seoMetadata?.description || blog.excerpt || '');
    const seoKeywords = getTrans(blog.seoMetadata?.keywords || blog.tags.join(', '));
    
    const faqs = blog.faqs.map(faq => ({
      ...faq,
      question: getTrans(faq.question),
      answer: getTrans(faq.answer),
    }));
    
    // 4. Map translated markdown content
    const content = await translateMarkdown(blog.content, locale, translations);

    const translatedBlog = {
      title,
      excerpt,
      content,
      seoMetadata: {
        title: seoTitle,
        description: seoDescription,
        keywords: seoKeywords,
      },
      faqs,
    };

    // Save to cache
    cache[cacheKey] = translatedBlog;
    saveCache(cache);

    return {
      ...blog,
      ...translatedBlog,
    };
  } catch (err) {
    console.error(`Failed to auto-translate blog post [${blog.slug}]:`, err);
    return blog;
  }
}
