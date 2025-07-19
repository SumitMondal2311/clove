import z from "zod";

export const envSchema = z.object({
    NODE_ENV: z.enum(["development", "test", "production"]),
    PORT: z.string().min(4).transform(Number),
    API_ORIGIN: z.string().optional(),
    WEB_ORIGIN: z.string(),
    REDIS_URL: z
        .string()
        .regex(
            /^(redis|rediss):\/\/(?:([^:@]+):([^@]+)@)?([^:/]+)(?::(\d+))?(?:\/(\d+))?\/?$/,
            "Invalid REDIS_URL format"
        ),
});

export const authSchema = z.object({
    deviceId: z.string().optional(),
    deviceName: z.string().optional(),
    email: z.email("Invalid email"),
    password: z.string().nonempty("Password is required"),
});
