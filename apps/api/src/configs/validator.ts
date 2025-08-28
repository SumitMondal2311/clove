import z from "zod";

export const envSchema = z.object({
    NODE_ENV: z.enum(["development", "test", "production"]),
    PORT: z.string().transform(Number),
    WEB_ORIGIN: z.string(),
    API_ORIGIN: z.string(),
    DATABASE_MAX_RETRIES: z.string().transform(Number),
    HMAC_SHA256_SECRET_KEY: z.base64(),
    DATABASE_URL: z.string(),
    JWT_KID: z.string(),
    JWT_ISS: z.string(),
    RESEND_API_KEY: z.string().optional(),
    REDIS_URL: z.string(),
    ACCESS_TOKEN_EXPIRY: z.string().transform((str): number => eval(str)),
    EMAIL_VERIFICATION_TOKEN_EXPIRY_MS: z.string().transform((str): number => eval(str)),
    SESSION_LIMIT: z.string().transform((str): number => eval(str)),
    REFRESH_TOKEN_EXPIRY: z.string().transform((str): number => eval(str)),
});

export const authSchema = z.object({
    email: z.email("Invalid email").transform((email) => email.trim().toLowerCase()),
    password: z
        .string()
        .trim()
        .nonempty("Password is required")
        .min(8, "Password must be atleast 8 characters long")
        .regex(/[a-z]/, "Password must contain a lowercase letter")
        .regex(/[A-Z]/, "Password must contain a uppercase letter")
        .regex(/[0-9]/, "Password must contain a digit")
        .regex(/[^a-z0-9A-Z]/, "Password must contain a speacial character"),
});
