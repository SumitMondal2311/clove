import { createClient } from '@clove/database';
import { env } from '../configs/env';

export const prisma = createClient(env.DATABASE_URL);
