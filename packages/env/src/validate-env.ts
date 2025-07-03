import { z } from 'zod';
import { logger } from '@clove/logger';

export const validateEnv = <T extends z.ZodSchema>(schema: T): z.infer<T> => {
    const parsedSchema = schema.safeParse(process.env);
    if (!parsedSchema.success) {
        logger.error('Invalid or missing env varaiable(s):');
        for (const error of parsedSchema.error.errors) {
            logger.error(`${error.path.join('.')}: ${error.message}`);
        }
        process.exit(1);
    }
    return parsedSchema.data;
};
