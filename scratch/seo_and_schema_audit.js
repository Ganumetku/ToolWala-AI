const fs = require('fs');
const path = require('path');
const http = require('http');

const TOOLS_FILE = path.join(__dirname, '../src/data/tools.ts');
const BASE_URL = 'http://localhost:3000';

function extractTools() {
  const content = fs.readFileSync(TOOLS_FILE, 'utf8');
  // Match slug: '...' or slug: "..."
  const slugRegex = /slug:\s*['"`]([^'"`]+)['"`]/g;
  const slugs = [];
  let match;
  while ((match = slugRegex.exec(content)) !== null) {
    if (!slugs.includes(match[1]) && match[1] !== 'edit-pdf') {
      slugs.push(match[1]);
    }
  }
  return slugs;
}

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: data,
          time: Date.now() - start
        });
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

async function auditTool(slug) {
  const url = `${BASE_URL}/tools/${slug}/`;
  const result = {
    slug,
    url,
    status: 0,
    time: 0,
    title: { ok: false, text: '' },
    description: { ok: false, text: '' },
    canonical: { ok: false, text: '' },
    schema: {
      breadcrumb: false,
      faq: false,
      app: false
    },
    relatedTools: { ok: false, count: 0 },
    internalLinksCount: 0,
    errors: []
  };

  try {
    const res = await fetchUrl(url);
    result.status = res.status;
    result.time = res.time;

    if (res.status !== 200) {
      result.errors.push(`Returned status code ${res.status}`);
      return result;
    }

    const body = res.body;

    // Title Check
    const titleMatch = body.match(/<title>([^<]+)<\/title>/i);
    if (titleMatch) {
      result.title.text = titleMatch[1].trim();
      result.title.ok = result.title.text.length > 5 && !result.title.text.includes('Not Found');
    }

    // Description Check
    const descMatch = body.match(/<meta\s+name="description"\s+content="([^"]+)"/i) || 
                      body.match(/<meta\s+content="([^"]+)"\s+name="description"/i);
    if (descMatch) {
      result.description.text = descMatch[1].trim();
      result.description.ok = result.description.text.length > 10;
    }

    // Canonical Check
    const canonicalMatch = body.match(/<link\s+rel="canonical"\s+href="([^"]+)"/i) ||
                           body.match(/<link\s+href="([^"]+)"\s+rel="canonical"/i);
    if (canonicalMatch) {
      result.canonical.text = canonicalMatch[1].trim();
      result.canonical.ok = result.canonical.text.includes(slug);
    }

    // Schema Check
    const schemaMatches = [...body.matchAll(/<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/gi)];
    for (const match of schemaMatches) {
      try {
        const json = JSON.parse(match[1]);
        const checkType = (obj) => {
          if (!obj) return;
          if (obj['@type'] === 'BreadcrumbList') result.schema.breadcrumb = true;
          if (obj['@type'] === 'FAQPage' || obj['@type'] === 'FAQ') result.schema.faq = true;
          if (obj['@type'] === 'SoftwareApplication' || obj['@type'] === 'WebApplication') result.schema.app = true;
          if (obj['@graph'] && Array.isArray(obj['@graph'])) {
            obj['@graph'].forEach(checkType);
          }
        };
        checkType(json);
      } catch (e) {
        // ignore malformed JSON LD in other scripts
      }
    }

    // Related Tools Section Check
    // Our layout links exactly 5 related tools inside <div class="grid grid-cols-1 md:grid-cols-5 gap-4"> or similar under Related Tools.
    // Let's count link matches with /tools/[slug] in the body.
    const linkMatches = [...body.matchAll(/href="\/tools\/([^"\/]+)"/gi)];
    const uniqueToolLinks = new Set(linkMatches.map(m => m[1]));
    
    // Total links count
    result.internalLinksCount = linkMatches.length;

    // Check if ToolSeoFooter / Related tools contains related tools
    // Let's see if the related section text is there
    if (body.includes('Related Tools') || body.includes('Related Utilities')) {
      result.relatedTools.ok = true;
    }

  } catch (err) {
    result.errors.push(`Fetch failed: ${err.message}`);
  }

  return result;
}

async function run() {
  console.log('Starting SEO and Schema audit...');
  const slugs = extractTools();
  console.log(`Found ${slugs.length} registered tools in tools.ts to audit.`);

  const reports = [];
  for (const slug of slugs) {
    console.log(`Auditing /tools/${slug}...`);
    const res = await auditTool(slug);
    reports.push(res);
  }

  // Save report
  fs.writeFileSync(
    path.join(__dirname, 'audit_report.json'),
    JSON.stringify(reports, null, 2)
  );

  console.log('\nAudit complete! Summary:');
  console.log('---------------------------------------------------------');
  let broken = 0;
  let slow = 0;
  let missingTitle = 0;
  let missingDesc = 0;
  let missingSchema = 0;

  reports.forEach(r => {
    if (r.status !== 200) {
      broken++;
      console.log(`[BROKEN] /tools/${r.slug} - Status: ${r.status}, Errors: ${r.errors.join(', ')}`);
    } else {
      if (r.time > 800) {
        slow++;
        console.log(`[SLOW] /tools/${r.slug} took ${r.time}ms`);
      }
      if (!r.title.ok) {
        missingTitle++;
        console.log(`[MISSING TITLE] /tools/${r.slug} - Title: "${r.title.text}"`);
      }
      if (!r.description.ok) {
        missingDesc++;
        console.log(`[MISSING DESC] /tools/${r.slug}`);
      }
      if (!r.schema.breadcrumb || !r.schema.app) {
        missingSchema++;
        console.log(`[MISSING SCHEMA] /tools/${r.slug} - Breadcrumb: ${r.schema.breadcrumb}, App: ${r.schema.app}`);
      }
    }
  });

  console.log('---------------------------------------------------------');
  console.log(`Total Audited: ${reports.length}`);
  console.log(`Broken: ${broken}`);
  console.log(`Slow (>800ms): ${slow}`);
  console.log(`Missing Title: ${missingTitle}`);
  console.log(`Missing Description: ${missingDesc}`);
  console.log(`Missing Critical Schema: ${missingSchema}`);
}

run();
