import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const newKeys = {
  "home": {
    "start_discovering": "Start Discovering",
    "standards_title": "Security & Experience Standards",
    "standards": {
      "browser_based": "100% Browser Based",
      "no_upload": "No Upload Required",
      "fast_processing": "Fast Processing",
      "privacy_focused": "Privacy Focused",
      "free_tools": "Free Tools",
      "secure_utilities": "Secure Utilities"
    },
    "categories_deck": "Categories Deck",
    "hot_trending": "HOT & TRENDING",
    "latest_releases": "LATEST RELEASES",
    "engine_title_1": "AI Processing",
    "engine_title_2": "Engine 2.0",
    "directory_title": "Tools Directory",
    "directory_subtitle": "Instant-run local utilities. Search by keywords or filter by tags."
  },
  "faq": {
    "support_center": "SUPPORT CENTER",
    "title": "Frequently Asked Questions",
    "subtitle": "Answers to common questions regarding local processing, file security, and specifications.",
    "q1": "How does ToolWala AI process files without uploading them?",
    "a1": "ToolWala AI uses modern browser-native technologies like WebAssembly (WASM), WebGL, and JavaScript canvas operations. When you select an image or a PDF, the file is read directly from your local disk into your browser's private sandbox memory. The computation (like cropping, compressing, or background removal) runs on your local CPU/GPU threads, meaning your files never leave your computer.",
    "q2": "Can I use these tools offline?",
    "a2": "Yes! Once you have loaded a tool page (like the Background Remover or Aadhaar Resizer) while online, the assets and models are cached by your browser. You can disconnect from the internet and continue using the core processing features offline, as no server communication is required.",
    "q3": "Is ToolWala AI completely free to use?",
    "a3": "ToolWala AI is currently in free beta. All tools, generators, and compressors are available at zero cost, without registration, limits, or subscription traps.",
    "q4": "Are my documents secure and compliant with data laws?",
    "a4": "Because we process all files locally in your browser memory and do not upload them to external cloud servers, we are inherently GDPR compliant and follow the highest standards of data safety. Your private documents (resumes, signatures, Aadhaar photos, invoices) are completely confidential.",
    "q5": "How do I standardise my passport/Aadhaar photos under target sizes?",
    "a5": "Simply upload your photo into the Resizer. Our algorithm locates the face, aligns it to standard ID crop positions, and lets you select official templates. When downloading, you can choose to compress the output dynamically under 20KB, 50KB, or 100KB limits."
  },
  "testimonials": {
    "badge": "USER REVIEWS",
    "title": "Loved by 50,000+ Professionals",
    "subtitle": "See why freelancers, developers, and daily internet users trust ToolWala AI to speed up their everyday workflows.",
    "quote1": "Aadhaar Resizer is an absolute lifesaver. I was trying to upload my photo to the official portal for hours, and ToolWala formatted it correctly in 5 seconds. The best part is it runs offline!",
    "author1": "Rahul Verma",
    "role1": "Government Exam Aspirant",
    "location1": "New Delhi",
    "quote2": "As a product manager, I deal with PDFs and sensitive customer documents daily. Knowing that ToolWala processes everything client-side without server uploads gives me total peace of mind.",
    "author2": "Priya Sharma",
    "role2": "Senior Product Manager",
    "location2": "Bengaluru",
    "quote3": "The Background Remover is faster than half of the paid utilities I used to subscribe to. The edge sharpening convolution details are incredibly sharp. Highly recommend it!",
    "author3": "Devendra Patil",
    "role3": "Freelance UI Designer",
    "location3": "Mumbai",
    "quote4": "I use the AI Text Humanizer and PDF OCR engines daily. ToolWala AI has completely replaced my set of browser bookmarklets. Simply top-tier engineering.",
    "author4": "Ananya Iyer",
    "role4": "Content Strategist",
    "location4": "Chennai",
    "verified": "Verified"
  }
};

async function translate(text, targetLang = 'hi') {
  if (!text || !text.trim()) return '';
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Fetch failed: ${res.statusText}`);
    const data = await res.json();
    const translated = data[0].map(s => s[0]).join('');
    return translated;
  } catch (err) {
    console.error(`Error translating "${text}":`, err);
    return text;
  }
}

async function mergeTranslations(baseObj, targetObj, targetLang) {
  const result = { ...targetObj };
  
  for (const key in baseObj) {
    if (typeof baseObj[key] === 'object' && baseObj[key] !== null) {
      result[key] = await mergeTranslations(baseObj[key], targetObj[key] || {}, targetLang);
    } else {
      // If target language is 'en', just take base value
      if (targetLang === 'en') {
        result[key] = baseObj[key];
      } else {
        // Only translate if not already translated or empty
        const hasDevanagari = (str) => /[\u0900-\u097F]/.test(str || '');
        if (!result[key] || !hasDevanagari(result[key])) {
          console.log(`Translating key "${key}": "${baseObj[key]}"...`);
          result[key] = await translate(baseObj[key], targetLang);
          // Small sleep to prevent rate limiting
          await new Promise(r => setTimeout(r, 100));
        }
      }
    }
  }
  return result;
}

async function run() {
  const enPath = resolve(root, 'messages/en.json');
  const hiPath = resolve(root, 'messages/hi.json');

  const enJson = JSON.parse(readFileSync(enPath, 'utf-8'));
  const hiJson = JSON.parse(readFileSync(hiPath, 'utf-8'));

  console.log('--- Merging English Keys ---');
  const updatedEn = await mergeTranslations(newKeys, enJson, 'en');

  console.log('\n--- Translating and Merging Hindi Keys ---');
  const updatedHi = await mergeTranslations(newKeys, hiJson, 'hi');

  writeFileSync(enPath, JSON.stringify(updatedEn, null, 2), 'utf-8');
  writeFileSync(hiPath, JSON.stringify(updatedHi, null, 2), 'utf-8');

  console.log('\n✅ Translation updates written successfully to en.json and hi.json!');
}

run().catch(console.error);
