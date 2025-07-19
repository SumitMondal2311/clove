import { config } from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import z from "zod";
import { PrismaClient } from "../generated/prisma/index.js";

config({
    path: path.join(
        path.dirname(fileURLToPath(import.meta.url)),
        "..",
        `.env.${process.env.NODE_ENV || "development"}`
    ),
});

export const parsedSchema = z
    .object({
        DATABASE_URL: z
            .string()
            .regex(
                /^(postgresql|postgres):\/\/(?:([^:@]+)(?::([^@]+))?@)?([^:/]+)(?::(\d+))?(?:\/([^?]+))?(?:\?(.*))?$/,
                "Invalid DATABASE_URL format"
            ),
    })
    .safeParse(process.env);

if (!parsedSchema.success) {
    for (const issue of parsedSchema.error.issues) {
        console.error(`${issue.path}: ${issue.message}`);
    }
    process.exit(1);
}

const DATABASE_URL = parsedSchema.data.DATABASE_URL;

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
