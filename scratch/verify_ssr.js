const http = require('http');

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, html: data }));
    }).on('error', reject);
  });
}

async function runVerification() {
  const targets = [
    { name: 'PAN Card Resize', url: 'http://localhost:3009/tools/pan-card-resize/' },
    { name: 'Exam Photo Resizer', url: 'http://localhost:3009/tools/exam-photo-resizer/' }
  ];

  for (const target of targets) {
    console.log(`\n=======================================\nVerifying: ${target.name} (${target.url})\n=======================================`);
    try {
      const { status, html } = await fetchUrl(target.url);
      console.log(`Status code: ${status}`);
      
      const containsLocksText = html.includes("Checking scheduling locks...");
      console.log(`Contains "Checking scheduling locks...": ${containsLocksText ? 'FAIL❌' : 'PASS✅ (Removed fallback text)'}`);

      const containsH1 = html.includes("<h1");
      console.log(`Contains H1 tag: ${containsH1 ? 'PASS✅' : 'FAIL❌'}`);

      // Check schemas
      const containsLdJson = html.includes('type="application/ld+json"');
      console.log(`Contains JSON-LD schema tag: ${containsLdJson ? 'PASS✅' : 'FAIL❌'}`);

      const containsFAQSchema = html.includes('FAQPage');
      console.log(`Contains FAQPage schema: ${containsFAQSchema ? 'PASS✅' : 'FAIL❌'}`);

      const containsBreadcrumbSchema = html.includes('BreadcrumbList');
      console.log(`Contains Breadcrumb schema: ${containsBreadcrumbSchema ? 'PASS✅' : 'FAIL❌'}`);

      const containsSoftwareAppSchema = html.includes('SoftwareApplication');
      console.log(`Contains SoftwareApplication schema: ${containsSoftwareAppSchema ? 'PASS✅' : 'FAIL❌'}`);

      // Check FAQ/Article contents
      const containsArticle = html.includes('Deep Dive Guide') || html.includes('Deep Dive Guide') || html.includes('Common Questions');
      console.log(`Contains Article / FAQ content: ${containsArticle ? 'PASS✅' : 'FAIL❌'}`);
      
      if (containsLocksText) {
        console.log("Snippet showing the blocked content:");
        const lines = html.split('\n');
        const lockLine = lines.find(l => l.includes("Checking scheduling locks..."));
        console.log(lockLine ? lockLine.trim().slice(0, 300) : "Not found in lines");
      }
    } catch (e) {
      console.error(`Failed to fetch: ${e.message}`);
    }
  }
}

runVerification();
