import { z } from 'zod';

export const schema = z.object({
    NODE_ENV: z.enum(['development', 'production']),
});
