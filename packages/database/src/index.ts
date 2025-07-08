import { PrismaClient } from '../generated/prisma/index.js';
export * from '../generated/prisma/index.js';

declare global {
    var prisma: PrismaClient | undefined;
}

const client = globalThis.prisma || new PrismaClient();
export const prisma =
    process.env.NODE_ENV === 'production'
        ? client
        : (globalThis.prisma ?? (globalThis.prisma = client));
