import { logger } from '@clove/logger';
import { config } from 'dotenv';
import path from 'path';
import { z } from 'zod';

config({
    path: path.resolve(process.cwd(), `.env.${process.env.NODE_ENV ?? 'development'}`),
});

export const parsedSchema = z
    .object({
        NODE_ENV: z.enum(['development', 'test', 'production']),
        PORT: z.string().min(4).transform(Number),
        WEB_ORIGIN: z.string().url(),
        API_ORIGIN: z.string().url().optional(),
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
    process.exit(1);
}

export const env = parsedSchema.data;
