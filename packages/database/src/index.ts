import { env } from '@clove/env';
import { PrismaClient } from '../generated/prisma/index.js';
export * from '../generated/prisma/index.js';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
const client = globalForPrisma.prisma || new PrismaClient();
export const prisma =
    env.NODE_ENV === 'production'
        ? client
        : (globalForPrisma.prisma ?? (globalForPrisma.prisma = client));
