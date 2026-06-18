const fs = require('fs');
const path = require('path');

const TOOLS_DIR = path.join(process.cwd(), 'src/app/tools');

function scanDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      scanDirectory(fullPath);
    } else if (file === 'layout.tsx') {
      processLayoutFile(fullPath);
    }
  }
}

function processLayoutFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');

  // Check if it already uses generateMetadata helper
  if (content.includes('generateToolMetadataHelper') || content.includes('generateMetadata')) {
    console.log(`ℹ️ Already dynamic metadata layout: ${path.relative(process.cwd(), filePath)}`);
    return;
  }

  // Extract static title and description
  const titleMatch = content.match(/title:\s*["'`]((?:\\.|[^\\])*?)["'`]/);
  const descMatch = content.match(/description:\s*["'`]((?:\\.|[^\\])*?)["'`]/);

  if (!titleMatch) {
    console.warn(`⚠️ Could not extract title in layout: ${path.relative(process.cwd(), filePath)}`);
    return;
  }

  const title = titleMatch[1];
  const description = descMatch ? descMatch[1] : '';

  // Resolve tool slug from folder path relative to src/app/tools
  const relativeDir = path.dirname(path.relative(TOOLS_DIR, filePath));
  const toolId = relativeDir === '.' ? path.basename(path.dirname(filePath)) : relativeDir;

  const toolSlug = toolId.replace(/\\/g, '/'); // standard slug path
  const pagePath = `/tools/${toolSlug}`;

  const newContent = `import type { Metadata } from 'next';
import { generateToolMetadataHelper } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return generateToolMetadataHelper(
    '${toolSlug}',
    '${title.replace(/'/g, "\\'")}',
    '${description.replace(/'/g, "\\'")}',
    '${pagePath}'
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
`;

  fs.writeFileSync(filePath, newContent, 'utf-8');
  console.log(`✅ Converted layout to dynamic SEO: ${path.relative(process.cwd(), filePath)} (${toolSlug})`);
}

console.log('🚀 Localizing all tool layouts...');
scanDirectory(TOOLS_DIR);
console.log('🎉 Tool layouts localized successfully!');
