import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

// Load env variables manually from .env.local
try {
  const envPath = path.join(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, 'utf8');
    envFile.split('\n').forEach(line => {
      const parts = line.split('=');
      if (parts.length >= 2) {
        const key = parts[0].trim();
        const val = parts.slice(1).join('=').trim().replace(/^"(.*)"$/, '$1').replace(/^'(.*)'$/, '$1');
        if (key && !key.startsWith('#')) {
          process.env[key] = val;
        }
      }
    });
  }
} catch (e) {
  console.error("Failed to load .env.local", e);
}

const prisma = new PrismaClient();

async function main() {
  try {
    const tool = await prisma.tool.findUnique({
      where: { slug: 'signature-crop-tool' },
      include: {
        inputs: true,
        faqs: true,
        articles: true,
        category: true,
        seoMetadata: true
      }
    });
    console.log("Database Tool signature-crop-tool:");
    console.log(JSON.stringify(tool, null, 2));
    
    // Also list all tool slugs in db
    const allTools = await prisma.tool.findMany({
      select: { slug: true }
    });
    console.log("All tools in database:", allTools);
  } catch (err) {
    console.error("Prisma error:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
