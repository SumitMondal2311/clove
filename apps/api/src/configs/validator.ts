import z from "zod";

export const envSchema = z.object({
    NODE_ENV: z.enum(["development", "test", "production"]),
    PORT: z.string().transform(Number),
    DATABASE_URL: z.string(),
    WEB_ORIGIN: z.string(),
    API_ORIGIN: z.string(),
    DATABASE_MAX_RETRIES: z.string().transform(Number),
});
