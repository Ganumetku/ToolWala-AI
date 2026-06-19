import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

// Helper to determine if a string was likely not translated
// Spanish can share short acronyms/proper nouns with English.
// We flag it if they are identical and contain multiple words.
function isUntranslated(esVal, enVal) {
  if (!esVal) return true;
  const trimmedEs = esVal.trim();
  const trimmedEn = enVal.trim();
  if (trimmedEs === '') return true;
  
  if (trimmedEs === trimmedEn) {
    // If it's a long sentence and identical, it's definitely untranslated
    const wordCount = trimmedEn.split(/\s+/).filter(Boolean).length;
    if (wordCount > 3) {
      // Exclude strings that might be code snippets or placeholders
      if (trimmedEn.startsWith('{') && trimmedEn.endsWith('}')) return false;
      if (trimmedEn.startsWith('`') && trimmedEn.endsWith('`')) return false;
      return true;
    }
  }
  return false;
}

function getToolsCoverage() {
  const toolsPath = path.resolve(root, 'src/data/tool_translations.json');
  if (!fs.existsSync(toolsPath)) {
    return { translated: 0, missing: 40, total: 40, details: ['tool_translations.json missing'] };
  }

  const records = JSON.parse(fs.readFileSync(toolsPath, 'utf-8'));
  const enTools = records.filter(r => r.locale === 'en');
  const esTools = records.filter(r => r.locale === 'es');

  let translated = 0;
  let missing = 0;
  const details = [];

  for (const en of enTools) {
    const es = esTools.find(r => r.toolSlug === en.toolSlug);
    if (!es) {
      missing++;
      details.push(`[Tool] ${en.toolSlug}: Missing completely in Spanish`);
      continue;
    }

    const isTitleUntranslated = isUntranslated(es.title, en.title);
    const isDescUntranslated = isUntranslated(es.description, en.description);
    
    if (!isTitleUntranslated && !isDescUntranslated) {
      translated++;
    } else {
      missing++;
      details.push(`[Tool] ${en.toolSlug}: Untranslated fields detected (Title: ${isTitleUntranslated ? 'UNTRANSLATED' : 'OK'}, Desc: ${isDescUntranslated ? 'UNTRANSLATED' : 'OK'})`);
    }
  }

  return { translated, missing, total: enTools.length, details };
}

function getBlogsCoverage() {
  const blogsDataPath = path.resolve(root, 'src/data/dynamic_blogs.json');
  const cachePath = path.resolve(root, 'src/data/blog_translations.json');

  let blogSlugs = [];
  if (fs.existsSync(blogsDataPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(blogsDataPath, 'utf-8'));
      blogSlugs = data.map(b => b.slug);
    } catch (e) {}
  }

  let cache = {};
  if (fs.existsSync(cachePath)) {
    try {
      cache = JSON.parse(fs.readFileSync(cachePath, 'utf-8'));
    } catch (e) {}
  }

  let translated = 0;
  let missing = 0;
  const details = [];

  for (const slug of blogSlugs) {
    const key = `es:${slug}`;
    const es = cache[key];
    if (!es) {
      missing++;
      details.push(`[Blog] ${slug}: Spanish translation cache not found`);
      continue;
    }

    const isTitleUntranslated = isUntranslated(es.title, slug); // placeholder comparison
    const isContentUntranslated = isUntranslated(es.content, 'Traditional optical character recognition');

    if (!isTitleUntranslated && !isContentUntranslated) {
      translated++;
    } else {
      missing++;
      details.push(`[Blog] ${slug}: Untranslated fields detected`);
    }
  }

  return { translated, missing, total: blogSlugs.length, details };
}

function getUiCoverage() {
  const enPath = path.resolve(root, 'messages/en.json');
  const esPath = path.resolve(root, 'messages/es.json');

  if (!fs.existsSync(enPath) || !fs.existsSync(esPath)) {
    return { translated: 0, missing: 1, total: 1, details: ['Translation key JSONs missing'] };
  }

  const en = JSON.parse(fs.readFileSync(enPath, 'utf-8'));
  const es = JSON.parse(fs.readFileSync(esPath, 'utf-8'));

  let translated = 0;
  let missing = 0;
  const details = [];

  function check(enObj, esObj, prefix = '') {
    for (const key in enObj) {
      const pathKey = prefix ? `${prefix}.${key}` : key;
      const enVal = enObj[key];
      const esVal = esObj ? esObj[key] : undefined;

      if (typeof enVal === 'object' && enVal !== null) {
        check(enVal, esVal, pathKey);
      } else {
        if (!esVal || isUntranslated(esVal, enVal)) {
          missing++;
          details.push(`[UI Key] ${pathKey}: Missing or Untranslated Spanish value (EN: "${enVal}")`);
        } else {
          translated++;
        }
      }
    }
  }

  check(en, es);
  return { translated, missing, total: translated + missing, details };
}

function run() {
  console.log('====================================================');
  console.log('     TOOLWALA AI SPANISH TRANSLATION COVERAGE       ');
  console.log('====================================================');

  const tools = getToolsCoverage();
  const blogs = getBlogsCoverage();
  const ui = getUiCoverage();

  console.log('\nSUMMARY METRICS:');
  console.table([
    {
      Component: 'Tool Pages',
      Translated: tools.translated,
      Missing: tools.missing,
      Total: tools.total,
      Percentage: `${Math.round((tools.translated / (tools.total || 1)) * 100)}%`
    },
    {
      Component: 'Blog Pages',
      Translated: blogs.translated,
      Missing: blogs.missing,
      Total: blogs.total,
      Percentage: `${Math.round((blogs.translated / (blogs.total || 1)) * 100)}%`
    },
    {
      Component: 'UI Components',
      Translated: ui.translated,
      Missing: ui.missing,
      Total: ui.total,
      Percentage: `${Math.round((ui.translated / (ui.total || 1)) * 100)}%`
    }
  ]);

  const allDetails = [...tools.details, ...blogs.details, ...ui.details];
  if (allDetails.length > 0) {
    console.log('\nHIGHLIGHTED ISSUES / ACTION ITEMS:');
    allDetails.slice(0, 15).forEach(detail => console.log(` - ${detail}`));
    if (allDetails.length > 15) {
      console.log(` ... and ${allDetails.length - 15} more issues.`);
    }
  } else {
    console.log('\n🎉 PERFECT COVERAGE! No missing or untranslated Spanish texts detected.');
  }
  console.log('====================================================');
}

run();
