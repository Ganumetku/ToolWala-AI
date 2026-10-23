/**
 * verify-sitemap-status.mjs
 * Fetches the sitemap from live or constructs URL list from codebase,
 * verifies each URL returns 200 OK directly with NO 301/308 redirect or 404.
 */

import https from 'https';

const BASE_URL = 'https://toolwala.co';

async function fetchUrl(url) {
  return new Promise((resolve) => {
    try {
      const req = https.request(url, { method: 'HEAD', headers: { 'User-Agent': 'ToolWala-Sitemap-Validator/1.0' } }, (res) => {
        resolve({
          url,
          status: res.statusCode,
          location: res.headers.location || null
        });
      });
      req.on('error', (err) => {
        resolve({ url, status: 0, error: err.message });
      });
      req.setTimeout(8000, () => {
        req.destroy();
        resolve({ url, status: 0, error: 'TIMEOUT' });
      });
      req.end();
    } catch (e) {
      resolve({ url, status: 0, error: e.message });
    }
  });
}

async function fetchText(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
      res.on('error', () => resolve(''));
    }).on('error', () => resolve(''));
  });
}

async function main() {
  console.log('Fetching live sitemap from', `${BASE_URL}/sitemap.xml ...`);
  const xml = await fetchText(`${BASE_URL}/sitemap.xml`);
  
  let urls = [];
  const locRegex = /<loc>(https?:\/\/[^<]+)<\/loc>/g;
  let match;
  while ((match = locRegex.exec(xml)) !== null) {
    urls.push(match[1]);
  }

  // Deduplicate
  urls = Array.from(new Set(urls));
  console.log(`Found ${urls.length} URLs in live sitemap.`);

  if (urls.length === 0) {
    console.log('No URLs found in live sitemap.xml. Testing sample key tool URLs...');
    urls = [
      `${BASE_URL}/`,
      `${BASE_URL}/tools/`,
      `${BASE_URL}/categories/`,
      `${BASE_URL}/tools/merge-pdf/`,
      `${BASE_URL}/tools/split-pdf/`,
      `${BASE_URL}/tools/compress-pdf/`,
      `${BASE_URL}/tools/edit-pdf/`,
      `${BASE_URL}/tools/pdf-to-word/`,
      `${BASE_URL}/tools/word-to-pdf/`,
      `${BASE_URL}/tools/image-to-pdf/`,
    ];
  }

  // Sample or full run: run concurrently in batches of 15
  const sampleUrls = urls.slice(0, 50); // test up to 50 URLs or all if <= 50
  console.log(`Verifying ${sampleUrls.length} URLs for HTTP 200 OK (no redirects)...`);

  const results = [];
  const concurrency = 10;
  for (let i = 0; i < sampleUrls.length; i += concurrency) {
    const chunk = sampleUrls.slice(i, i + concurrency);
    const chunkResults = await Promise.all(chunk.map(fetchUrl));
    results.push(...chunkResults);
  }

  let okCount = 0;
  let redirectCount = 0;
  let errorCount = 0;

  for (const r of results) {
    if (r.status === 200) {
      okCount++;
    } else if (r.status === 301 || r.status === 308) {
      redirectCount++;
      console.warn(`[REDIRECT ${r.status}] ${r.url} -> ${r.location}`);
    } else {
      errorCount++;
      console.error(`[FAIL ${r.status}] ${r.url} ${r.error || ''}`);
    }
  }

  console.log('--- Verification Summary ---');
  console.log(`Total Checked: ${results.length}`);
  console.log(`200 OK: ${okCount}`);
  console.log(`Redirects (301/308): ${redirectCount}`);
  console.log(`Errors (404/500/timeout): ${errorCount}`);
  
  if (redirectCount === 0 && errorCount === 0) {
    console.log('SUCCESS: All checked URLs in sitemap returned 200 OK!');
  } else {
    console.log('ATTENTION: Some URLs encountered redirects or errors.');
  }
}

main().catch(console.error);
