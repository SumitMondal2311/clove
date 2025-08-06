import z from "zod";

export const envSchema = z.object({
    NODE_ENV: z.enum(["development", "test", "production"]),
    PORT: z.string().min(4).transform(Number),
    JWT_RSA_PVT_KEY: z.string().transform((str) => str.replace(/\\n/g, "\n")),
    JWT_RSA_PUB_KEY: z.string().transform((str) => str.replace(/\\n/g, "\n")),
    REDIS_URL: z
        .string()
        .regex(
            /^(redis|rediss):\/\/(?:([^:@]+):([^@]+)@)?([^:/]+)(?::(\d+))?(?:\/(\d+))?\/?$/,
            "Invalid REDIS_URL format"
        ),
    WEB_ORIGIN: z.string(),
    API_ORIGIN: z.string().optional(),
});

export const authSchema = z.object({
    email: z.email("Invalid email"),
    password: z.string().nonempty("Password is required"),
});
