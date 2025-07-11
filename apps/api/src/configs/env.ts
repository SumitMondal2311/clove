import { logger } from '@clove/logger';
import { config } from 'dotenv';
import path from 'path';
import { z } from 'zod';

config({
    path: path.resolve(process.cwd(), `.env.${process.env.NODE_ENV ?? 'development'}`),
});

export const parsedSchema = z
    .object({
        WEB_ORIGIN: z.string().url(),
        NODE_ENV: z.enum(['development', 'test', 'production']),
        PORT: z.string().min(4).transform(Number),
        DATABASE_URL: z.string().url(),
        API_ORIGIN: z.string().url().optional(),
        JWT_SECRET: z.string().base64(),
    })
    .superRefine((env) => {
        if (env.NODE_ENV !== 'production') {
            env.API_ORIGIN = `http://localhost:${env.PORT}`;
        }
    })
    .safeParse(process.env);

if (!parsedSchema.success) {
    parsedSchema.error.issues.forEach((issue) => {
        logger.error(`Invalid or missing ${issue.path} variable`);
    });
    throw new Error('Invalid or missing environment variable(s)');
}

export const env = parsedSchema.data;
