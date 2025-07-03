import { loadEnv } from './load-env';
loadEnv('currDir');

import { z } from 'zod';
import { validateEnv } from './validate-env';

export const env = validateEnv(
    z.object({
        PORT: z.string().min(4),
        WEB_ORIGIN: z.string().url(),
    })
);
