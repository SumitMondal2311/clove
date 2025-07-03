import { loadEnv } from './load-env.js';
loadEnv('currDir');

import { z } from 'zod';
import { validateEnv } from './validate-env.js';

export const env = validateEnv(
    z.object({
        NEXT_PUBLIC_API_ORIGIN: z.string().url(),
    })
);
