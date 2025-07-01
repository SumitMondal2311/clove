import { loadEnv } from './load-env';
loadEnv();

import { z } from 'zod';
import { schema as sharedSchema } from './shared';
import { validateEnv } from './validate-env';

export const env = validateEnv(
    z
        .object({
            NEXT_PUBLIC_API_ORIGIN: z.string().url(),
        })
        .merge(sharedSchema)
);
