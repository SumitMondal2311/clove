import { config } from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { PrismaClient } from "../generated/prisma/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

config({
    path: path.resolve(__dirname, `../.env.${process.env.NODE_ENV || "development"}`),
});

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
    throw new Error("Invalid or missing DATABASE_URL");
}

declare global {
    var prismaSingleton: PrismaClient | undefined;
}

const client = (() => {
    return new PrismaClient({
        datasources: {
            db: {
                url: DATABASE_URL,
            },
        },
    });
})();

globalThis.prismaSingleton ??= client;

export const prisma = globalThis.prismaSingleton;
export * from "../generated/prisma/index.js";
