import z from "zod";

export const envSchema = z.object({
    NODE_ENV: z.enum(["development", "test", "production"]),
    API_ORIGIN: z.string().optional(),
    PORT: z.string().min(4).transform(Number),
    WEB_ORIGIN: z.string(),
    JWT_RSA_PVT_KEY: z.string().transform((str) => str.replace(/\\n/g, "\n")),
    JWT_RSA_PUB_KEY: z.string().transform((str) => str.replace(/\\n/g, "\n")),
});

export const authSchema = z.object({
    email: z.email("Invalid email"),
    password: z.string().nonempty("Password is required"),
});
