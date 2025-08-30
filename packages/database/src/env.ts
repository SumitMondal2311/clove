import { config } from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import z from "zod";

const NODE_ENV = process.env.NODE_ENV;
config({
    path: path.resolve(
        path.dirname(fileURLToPath(import.meta.url)),
        "..",
        NODE_ENV === "production"
            ? ".env.production"
            : NODE_ENV === "test"
              ? ".env.test"
              : ".env.local"
    ),
});

const parsedSchema = z
    .object({
        NODE_ENV: z.enum(["development", "test", "production"]),
        DATABASE_MAX_RETRIES: z.string().transform(Number),
        DATABASE_URL: z.string(),
    })
    .safeParse(process.env);

if (!parsedSchema.success) {
    parsedSchema.error.issues.forEach((issue) => {
        console.error(`ENV ERROR: ${issue.path.join(".")} -> ${issue.message}`);
    });
    process.exit(1);
}

export const env = parsedSchema.data;
