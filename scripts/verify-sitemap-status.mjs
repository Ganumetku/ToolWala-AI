/**
 * verify-sitemap-status.mjs
 * Fetches all URLs from https://toolwala.co/sitemap.xml,
 * tests each URL with HTTP HEAD (no redirect follow),
 * saves results to scripts/sitemap-status-results.csv,
 * and prints summary of any 301/308/404/noindex entries.
 */

import https from 'https';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'https://toolwala.co';
const CONCURRENCY = 8;
const CSV_PATH = path.join(process.cwd(), 'scripts', 'sitemap-status-results.csv');

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

async function checkUrl(url) {
  return new Promise((resolve) => {
    try {
      const req = https.request(url, {
        method: 'HEAD',
        headers: { 'User-Agent': 'ToolWala-Sitemap-Audit/1.0' }
      }, (res) => {
        resolve({
          url,
          status: res.statusCode,
          location: res.headers.location || '',
          xRobots: res.headers['x-robots-tag'] || ''
        });
      });
      req.on('error', (err) => {
        resolve({ url, status: 0, location: '', xRobots: '', error: err.message });
      });
      req.setTimeout(10000, () => {
        req.destroy();
        resolve({ url, status: 0, location: '', xRobots: '', error: 'TIMEOUT' });
      });
      req.end();
    } catch (e) {
      resolve({ url, status: 0, location: '', xRobots: '', error: e.message });
    }
  });
}

async function main() {
  console.log('Fetching live sitemap from', `${BASE_URL}/sitemap.xml ...`);
  const xml = await fetchText(`${BASE_URL}/sitemap.xml`);

  let urls = [];
  const locRegex = /<loc>(https?:\/\/[^<]+)<\/loc>/g;
  let match;
  while ((match = locRegex.exec(xml)) !== null) {
    const loc = match[1].trim();
    if (!loc.endsWith('.xml')) {
      urls.push(loc);
    }
  }

  urls = Array.from(new Set(urls));
  console.log(`Found ${urls.length} unique URLs in sitemap.`);

  if (urls.length === 0) {
    console.error('No URLs found in sitemap.xml. Aborting.');
    return;
  }

  const results = [];
  console.log(`Auditing all ${urls.length} URLs with concurrency ${CONCURRENCY}...`);

  for (let i = 0; i < urls.length; i += CONCURRENCY) {
    const chunk = urls.slice(i, i + CONCURRENCY);
    const chunkResults = await Promise.all(chunk.map(checkUrl));
    results.push(...chunkResults);

    if ((i + CONCURRENCY) % 100 < CONCURRENCY || i + CONCURRENCY >= urls.length) {
      const processed = Math.min(i + CONCURRENCY, urls.length);
      console.log(`Progress: ${processed} / ${urls.length} tested (${Math.round(processed / urls.length * 100)}%)`);
    }
  }

  // Write CSV
  const csvLines = ['url,status,redirect_location,x_robots_tag'];
  for (const r of results) {
    const escapedLoc = (r.location || '').replace(/"/g, '""');
    const escapedRobots = (r.xRobots || '').replace(/"/g, '""');
    csvLines.push(`"${r.url}",${r.status},"${escapedLoc}","${escapedRobots}"`);
  }
  fs.writeFileSync(CSV_PATH, csvLines.join('\n'), 'utf8');
  console.log(`CSV written successfully to ${CSV_PATH}`);

  // Calculate summary
  let okCount = 0;
  const redirects = [];
  const errors = [];
  const noindexList = [];

  for (const r of results) {
    if (r.status === 200) {
      okCount++;
    } else if (r.status === 301 || r.status === 308) {
      redirects.push(r);
    } else {
      errors.push(r);
    }

    if (r.xRobots && r.xRobots.toLowerCase().includes('noindex')) {
      noindexList.push(r);
    }
  }

  console.log('\n=======================================');
  console.log('       SITEMAP AUDIT SUMMARY');
  console.log('=======================================');
  console.log(`Total URLs Audited: ${results.length}`);
  console.log(`200 OK: ${okCount} (${((okCount / results.length) * 100).toFixed(1)}%)`);
  console.log(`Redirects (301/308): ${redirects.length}`);
  console.log(`Errors (404/500/timeout): ${errors.length}`);
  console.log(`Noindex tags: ${noindexList.length}`);
  console.log('=======================================\n');

  if (redirects.length > 0) {
    console.log('--- REDIRECTING URLS (301/308) ---');
    redirects.forEach(r => console.log(`[${r.status}] ${r.url} -> ${r.location}`));
  }

  if (errors.length > 0) {
    console.log('--- ERROR URLS (Non-200) ---');
    errors.forEach(r => console.log(`[${r.status}] ${r.url} ${r.error || ''}`));
  }

  if (noindexList.length > 0) {
    console.log('--- NOINDEX URLS ---');
    noindexList.forEach(r => console.log(`[NOINDEX] ${r.url} (${r.xRobots})`));
  }
}

main().catch(console.error);
