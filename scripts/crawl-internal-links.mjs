/**
 * crawl-internal-links.mjs
 * Crawls internal links from major pages across ToolWala,
 * checks their direct HTTP response status (no redirect follow),
 * and identifies redirecting URLs along with the source page that contains them.
 */

import https from 'https';

const BASE_URL = 'https://toolwala.co';

const SEED_PAGES = [
  '/',
  '/tools/',
  '/categories/',
  '/categories/pdf-tools/',
  '/categories/image-tools/',
  '/categories/ai-tools/',
  '/categories/calculator-tools/',
  '/categories/developer-tools/',
  '/categories/utility-tools/',
  '/hubs/upsc-exam-utilities/',
  '/hubs/aadhaar-utilities/',
  '/blog/',
  '/tools/merge-pdf/',
  '/tools/split-pdf/',
  '/tools/compress-pdf/',
  '/tools/edit-pdf/',
  '/tools/image-compressor/',
  '/tools/resume-builder/',
  '/tools/aadhaar-masking-tool/',
  '/about/',
  '/privacy/',
];

async function fetchHtml(url) {
  return new Promise((resolve) => {
    https.get(url, { headers: { 'User-Agent': 'ToolWala-Link-Crawler/1.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
      res.on('error', () => resolve(''));
    }).on('error', () => resolve(''));
  });
}

async function checkUrl(url) {
  return new Promise((resolve) => {
    try {
      const req = https.request(url, {
        method: 'HEAD',
        headers: { 'User-Agent': 'ToolWala-Link-Crawler/1.0' }
      }, (res) => {
        resolve({
          url,
          status: res.statusCode,
          location: res.headers.location || ''
        });
      });
      req.on('error', (err) => resolve({ url, status: 0, location: '', error: err.message }));
      req.setTimeout(8000, () => {
        req.destroy();
        resolve({ url, status: 0, location: '', error: 'TIMEOUT' });
      });
      req.end();
    } catch (e) {
      resolve({ url, status: 0, location: '', error: e.message });
    }
  });
}

function extractInternalLinks(html, currentPath) {
  const links = new Set();
  const hrefRegex = /href=["']([^"']+)["']/g;
  let match;
  while ((match = hrefRegex.exec(html)) !== null) {
    let href = match[1].trim();
    if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) {
      continue;
    }
    if (href.startsWith('https://toolwala.co')) {
      href = href.replace('https://toolwala.co', '');
    }
    if (href.startsWith('/') && !href.startsWith('//')) {
      links.add(href.split('#')[0].split('?')[0]);
    }
  }
  return Array.from(links);
}

async function main() {
  console.log(`Starting Internal Links Crawl across ${SEED_PAGES.length} seed pages...\n`);
  
  // Map of targetUrl -> Set of sourcePages
  const linkSources = new Map();

  for (const pagePath of SEED_PAGES) {
    const fullUrl = `${BASE_URL}${pagePath}`;
    process.stdout.write(`Fetching links from ${pagePath} ... `);
    const html = await fetchHtml(fullUrl);
    const links = extractInternalLinks(html, pagePath);
    console.log(`${links.length} internal links found.`);

    for (const link of links) {
      if (!linkSources.has(link)) {
        linkSources.set(link, new Set());
      }
      linkSources.get(link).add(pagePath);
    }
  }

  const uniqueLinks = Array.from(linkSources.keys());
  console.log(`\nFound ${uniqueLinks.length} unique internal URLs across all seed pages.`);
  console.log('Testing each internal URL for HTTP response status (checking for 301/308 redirects)...');

  const checkResults = [];
  const CONCURRENCY = 8;
  for (let i = 0; i < uniqueLinks.length; i += CONCURRENCY) {
    const chunk = uniqueLinks.slice(i, i + CONCURRENCY);
    const chunkUrls = chunk.map(p => `${BASE_URL}${p}`);
    const res = await Promise.all(chunkUrls.map(checkUrl));
    checkResults.push(...res);
  }

  const redirects = [];
  const broken = [];
  let okCount = 0;

  for (const r of checkResults) {
    const rawPath = r.url.replace(BASE_URL, '');
    const sources = Array.from(linkSources.get(rawPath) || []);

    if (r.status === 200) {
      okCount++;
    } else if (r.status === 301 || r.status === 308) {
      redirects.push({
        path: rawPath,
        status: r.status,
        target: r.location,
        sources
      });
    } else {
      broken.push({
        path: rawPath,
        status: r.status,
        sources
      });
    }
  }

  console.log('\n=======================================');
  console.log('    INTERNAL LINKS CRAWL SUMMARY');
  console.log('=======================================');
  console.log(`Total Unique Internal Links Tested: ${uniqueLinks.length}`);
  console.log(`200 OK (Direct canonical links): ${okCount}`);
  console.log(`Redirecting Links (301/308): ${redirects.length}`);
  console.log(`Broken Links (404/errors): ${broken.length}`);
  console.log('=======================================\n');

  if (redirects.length > 0) {
    console.log('⚠️  INTERNAL LINKS CAUSING 301/308 REDIRECTS:');
    redirects.forEach((r, idx) => {
      console.log(`${idx + 1}. [${r.status}] "${r.path}" -> "${r.target}"`);
      console.log(`   Found on pages: ${r.sources.slice(0, 4).join(', ')}${r.sources.length > 4 ? ` (+${r.sources.length - 4} more)` : ''}`);
    });
    console.log('\n');
  }

  if (broken.length > 0) {
    console.log('❌ BROKEN INTERNAL LINKS (404/Errors):');
    broken.forEach((b, idx) => {
      console.log(`${idx + 1}. [${b.status}] "${b.path}"`);
      console.log(`   Found on pages: ${b.sources.join(', ')}`);
    });
    console.log('\n');
  }

  if (redirects.length === 0 && broken.length === 0) {
    console.log('🎉 PERFECT! All internal links tested return direct 200 OK without any redirects!');
  }
}

main().catch(console.error);
