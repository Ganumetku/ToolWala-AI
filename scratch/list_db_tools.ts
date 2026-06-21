import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const ptool = await prisma.tool.findUnique({
      where: { slug: 'pan-card-resize' },
      include: {
        inputs: true,
        faqs: true,
        articles: true,
        category: true,
        seoMetadata: true
      }
    });
    console.log("PAN Card Resize:");
    console.log(JSON.stringify(ptool, null, 2));

    const etool = await prisma.tool.findUnique({
      where: { slug: 'exam-photo-resizer' },
      include: {
        inputs: true,
        faqs: true,
        articles: true,
        category: true,
        seoMetadata: true
      }
    });
    console.log("Exam Photo Resizer:");
    console.log(JSON.stringify(etool, null, 2));
  } catch (err) {
    console.error("Prisma error:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
