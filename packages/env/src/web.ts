import { loadEnv } from './load-env';
loadEnv('currDir');

import { z } from 'zod';
import { validateEnv } from './validate-env';

export const env = validateEnv(
    z.object({
        NEXT_PUBLIC_API_ORIGIN: z.string().url(),
    })
);
