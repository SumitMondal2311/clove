import { loadEnv } from './load-env.js';
loadEnv('rootDir');

import { z } from 'zod';
import { validateEnv } from './validate-env.js';

export const sharedEnv = validateEnv(
    z.object({
        NODE_ENV: z.enum(['development', 'production']),
        DATABASE_URL: z.string().startsWith('postgresql://'),
    })
);
