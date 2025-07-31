import z from "zod";

export const envSchema = z.object({
    NODE_ENV: z.enum(["development", "test", "production"]),
    API_ORIGIN: z.string().optional(),
    PORT: z.string().min(4).transform(Number),
    WEB_ORIGIN: z.string(),
});
