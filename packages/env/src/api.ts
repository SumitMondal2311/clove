import { loadEnv } from './load-env.js';
loadEnv('currDir');

import { z } from 'zod';
import { validateEnv } from './validate-env.js';

export const env = validateEnv(
    z.object({
        PORT: z.string().min(4),
        WEB_ORIGIN: z.string().url(),
    })
);
