import { PrismaClient } from '../generated/prisma/index.js';
export * from '../generated/prisma/index.js';

export const createClient = (databaseUrl: string) => {
    if (!databaseUrl) throw new Error('Invalid or missing DATABASE_URL');
    return new PrismaClient({ datasourceUrl: databaseUrl });
};
