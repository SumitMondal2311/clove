import { loadEnv } from './load-env';
loadEnv('rootDir');

import { z } from 'zod';
import { validateEnv } from './validate-env';

export const sharedEnv = validateEnv(
    z.object({
        NODE_ENV: z.enum(['development', 'production']),
        DATABASE_URL: z.string().startsWith('postgresql://'),
    })
);
