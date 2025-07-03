import { z } from 'zod';

export const validateEnv = <T extends z.ZodSchema>(schema: T): z.infer<T> => {
    const parsedSchema = schema.safeParse(process.env);
    if (!parsedSchema.success) {
        for (const error of parsedSchema.error.errors) {
            console.error(`-> ${error.path[0]}: ${error.message}`);
        }
        process.exit(1);
    }
    return parsedSchema.data;
};
