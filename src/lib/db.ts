import { PrismaClient } from '@prisma/client';

// Force null in pure static frontend hosting to bypass database connections
const prisma = null as unknown as PrismaClient;

export { prisma };
