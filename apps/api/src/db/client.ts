import { env } from "../configs/env.js";
import { PrismaClient } from "./index.js";

declare global {
    var prismaSingleton: PrismaClient | undefined;
}

const client = (() => {
    return new PrismaClient({
        datasources: {
            db: {
                url: env.DATABASE_URL,
            },
        },
    });
})();

globalThis.prismaSingleton ??= client;

export const prisma = (globalThis.prismaSingleton ??= client);
