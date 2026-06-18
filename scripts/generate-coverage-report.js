import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const hasDevanagari = (str) => /[\u0900-\u097F]/.test(str || '');

function getToolsCoverage() {
  const toolsPath = path.resolve(root, 'src/data/tool_translations.json');
  if (!fs.existsSync(toolsPath)) {
    return { translated: 0, missing: 40, total: 40, details: ['tool_translations.json missing'] };
  }

  const records = JSON.parse(fs.readFileSync(toolsPath, 'utf-8'));
  const enTools = records.filter(r => r.locale === 'en');
  const hiTools = records.filter(r => r.locale === 'hi');

  let translated = 0;
  let missing = 0;
  const details = [];

  for (const en of enTools) {
    const hi = hiTools.find(r => r.toolSlug === en.toolSlug);
    if (!hi) {
      missing++;
      details.push(`[Tool] ${en.toolSlug}: Missing completely in Hindi`);
      continue;
    }

    const isTitleTranslated = hasDevanagari(hi.title);
    const isDescTranslated = hasDevanagari(hi.description);
    
    if (isTitleTranslated && isDescTranslated) {
      translated++;
    } else {
      missing++;
      details.push(`[Tool] ${en.toolSlug}: Partially untranslated (Title: ${isTitleTranslated ? 'HI' : 'EN'}, Desc: ${isDescTranslated ? 'HI' : 'EN'})`);
    }
  }

  return { translated, missing, total: enTools.length, details };
}

function getBlogsCoverage() {
  const blogsDataPath = path.resolve(root, 'src/data/blogs.json');
  const cachePath = path.resolve(root, 'src/data/blog_translations.json');

  let blogSlugs = ['why-local-ocr-is-the-future']; // Fallback
  if (fs.existsSync(blogsDataPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(blogsDataPath, 'utf-8'));
      blogSlugs = data.map(b => b.slug);
    } catch (e) {}
  } else {
    // Attempt fallback from database seed helper or scan src/data
    try {
      const { jsonDb } = require('../src/lib/jsonDb');
      blogSlugs = jsonDb.getBlogs().map(b => b.slug);
    } catch (e) {
      // default fallback to OCR blog slug
    }
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
    const key = `hi:${slug}`;
    const hi = cache[key];
    if (!hi) {
      missing++;
      details.push(`[Blog] ${slug}: Hindi translation cache not found`);
      continue;
    }

    const isTitleHi = hasDevanagari(hi.title);
    const isContentHi = hasDevanagari(hi.content);

    if (isTitleHi && isContentHi) {
      translated++;
    } else {
      missing++;
      details.push(`[Blog] ${slug}: Partially untranslated (Title: ${isTitleHi ? 'HI' : 'EN'}, Content: ${isContentHi ? 'HI' : 'EN'})`);
    }
  }

  return { translated, missing, total: blogSlugs.length, details };
}

function getUiCoverage() {
  const enPath = path.resolve(root, 'messages/en.json');
  const hiPath = path.resolve(root, 'messages/hi.json');

  if (!fs.existsSync(enPath) || !fs.existsSync(hiPath)) {
    return { translated: 0, missing: 1, total: 1, details: ['Translation key JSONs missing'] };
  }

  const en = JSON.parse(fs.readFileSync(enPath, 'utf-8'));
  const hi = JSON.parse(fs.readFileSync(hiPath, 'utf-8'));

  let translated = 0;
  let missing = 0;
  const details = [];

  function check(enObj, hiObj, prefix = '') {
    for (const key in enObj) {
      const pathKey = prefix ? `${prefix}.${key}` : key;
      const enVal = enObj[key];
      const hiVal = hiObj ? hiObj[key] : undefined;

      if (typeof enVal === 'object' && enVal !== null) {
        check(enVal, hiVal, pathKey);
      } else {
        if (!hiVal || hiVal === enVal) {
          if (key === 'All' && hiVal === 'सभी') {
            translated++;
          } else {
            missing++;
            details.push(`[UI Key] ${pathKey}: Missing Hindi value (EN: "${enVal}")`);
          }
        } else {
          translated++;
        }
      }
    }
  }

  check(en, hi);
  return { translated, missing, total: translated + missing, details };
}

function run() {
  console.log('====================================================');
  console.log('     TOOLWALA AI TRANSLATION COVERAGE REPORT        ');
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
    console.log('\n🎉 PERFECT COVERAGE! No missing Hindi translations detected.');
  }
  console.log('====================================================');
}

run();
