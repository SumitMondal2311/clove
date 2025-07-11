import { prisma } from '../src/lib/prisma.js';
import { afterAll, beforeAll } from 'vitest';

beforeAll(async () => {
    await prisma.session.deleteMany();
    await prisma.user.deleteMany();
});

afterAll(async () => {
    await prisma.session.deleteMany();
    await prisma.user.deleteMany();
});
