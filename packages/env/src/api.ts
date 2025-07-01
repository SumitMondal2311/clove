import { loadEnv } from './load-env';
loadEnv();

import { z } from 'zod';
import { schema as sharedSchema } from './shared';
import { validateEnv } from './validate-env';

export const env = validateEnv(
    z
        .object({
            PORT: z.string().min(4),
            WEB_ORIGIN: z.string().url(),
        })
        .merge(sharedSchema)
);
