import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

if (process.env.DATABASE_URL) {
  prisma = globalForPrisma.prisma ?? new PrismaClient();
  if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
} else {
  // Null fallback to prevent app crashes when environment credentials are not present yet.
  // The API endpoints will check for this and automatically serve realistic mock telemetry.
  prisma = null as unknown as PrismaClient;
}

export { prisma };
