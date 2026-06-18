import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

// Regular expression to detect Devanagari script (Hindi characters)
const hasHindi = (str) => /[\u0900-\u097F]/.test(str || '');

function auditTools() {
  const jsonDbPath = resolve(root, 'src/data/tool_translations.json');
  if (!existsSync(jsonDbPath)) {
    console.error('Error: tool_translations.json not found.');
    return { translated: 0, missing: 0, details: [] };
  }

  const records = JSON.parse(readFileSync(jsonDbPath, 'utf-8'));
  const enRecords = records.filter(r => r.locale === 'en');
  const hiRecords = records.filter(r => r.locale === 'hi');

  let translatedCount = 0;
  let missingCount = 0;
  const details = [];

  for (const en of enRecords) {
    const hi = hiRecords.find(r => r.toolSlug === en.toolSlug);
    if (!hi) {
      // Missing completely
      missingCount += 4; // Title, desc, seoTitle, seoDesc
      if (en.faq) missingCount += en.faq.length * 2;
      details.push({ slug: en.toolSlug, issue: 'Hindi record completely missing' });
      continue;
    }

    // Check Title
    const isTitleHi = hasHindi(hi.title) || (hi.title !== en.title);
    if (isTitleHi) {
      translatedCount++;
    } else {
      missingCount++;
      details.push({ slug: en.toolSlug, field: 'title', value: hi.title });
    }

    // Check Description
    const isDescHi = hasHindi(hi.description) || (hi.description !== en.description);
    if (isDescHi) {
      translatedCount++;
    } else {
      missingCount++;
      details.push({ slug: en.toolSlug, field: 'description', value: hi.description });
    }

    // Check SEO Title
    const isSeoTitleHi = hasHindi(hi.seoTitle) || (hi.seoTitle !== en.seoTitle);
    if (isSeoTitleHi) {
      translatedCount++;
    } else {
      missingCount++;
      details.push({ slug: en.toolSlug, field: 'seoTitle', value: hi.seoTitle });
    }

    // Check SEO Description
    const isSeoDescHi = hasHindi(hi.seoDescription) || (hi.seoDescription !== en.seoDescription);
    if (isSeoDescHi) {
      translatedCount++;
    } else {
      missingCount++;
      details.push({ slug: en.toolSlug, field: 'seoDescription', value: hi.seoDescription });
    }

    // Check FAQs
    const enFaqs = en.faq || [];
    const hiFaqs = hi.faq || [];

    for (let i = 0; i < enFaqs.length; i++) {
      const enFaq = enFaqs[i];
      const hiFaq = hiFaqs[i];
      if (!hiFaq) {
        missingCount += 2;
        details.push({ slug: en.toolSlug, field: `faq[${i}]`, value: 'Missing completely' });
        continue;
      }

      // Check Question
      const isQHi = hasHindi(hiFaq.question) || (hiFaq.question !== enFaq.question);
      if (isQHi) {
        translatedCount++;
      } else {
        missingCount++;
        details.push({ slug: en.toolSlug, field: `faq[${i}].question`, value: hiFaq.question });
      }

      // Check Answer
      const isAHi = hasHindi(hiFaq.answer) || (hiFaq.answer !== enFaq.answer);
      if (isAHi) {
        translatedCount++;
      } else {
        missingCount++;
        details.push({ slug: en.toolSlug, field: `faq[${i}].answer`, value: hiFaq.answer });
      }
    }
  }

  return { translated: translatedCount, missing: missingCount, details };
}

function auditStaticMessages() {
  const enPath = resolve(root, 'messages/en.json');
  const hiPath = resolve(root, 'messages/hi.json');

  const en = JSON.parse(readFileSync(enPath, 'utf-8'));
  const hi = JSON.parse(readFileSync(hiPath, 'utf-8'));

  let translated = 0;
  let missing = 0;
  const details = [];

  function checkObj(enObj, hiObj, prefix = '') {
    for (const key in enObj) {
      const path = prefix ? `${prefix}.${key}` : key;
      const enVal = enObj[key];
      const hiVal = hiObj ? hiObj[key] : undefined;

      if (typeof enVal === 'object' && enVal !== null) {
        checkObj(enVal, hiVal, path);
      } else {
        if (!hiVal || hiVal === enVal) {
          // If the key is 'All' or is a code/symbol, it might not need Hindi, but let's count it
          if (key === 'All' && hiVal === 'सभी') {
            translated++;
          } else {
            missing++;
            details.push({ key: path, en: enVal, hi: hiVal });
          }
        } else {
          translated++;
        }
      }
    }
  }

  checkObj(en, hi);
  return { translated, missing, details };
}

const toolAudit = auditTools();
const staticAudit = auditStaticMessages();

console.log(JSON.stringify({
  tools: toolAudit,
  static: staticAudit,
  summary: {
    translated: toolAudit.translated + staticAudit.translated,
    missing: toolAudit.missing + staticAudit.missing
  }
}, null, 2));
