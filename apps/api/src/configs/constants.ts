import { env } from './env.js';

export const IS_PRODUCTION = env.NODE_ENV === 'production';
export const REFRESH_TOKEN_EXPIRY = IS_PRODUCTION ? 604800 : 3600; // 7d : 1h (in sec)
export const SESSIONS_LIMIT = 5;
export const ACCESS_TOKEN_EXPIRY = 900; // 15m (in sec)
