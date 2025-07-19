import { env } from "./env";

export const IS_PRODUCTION = env.NODE_ENV === "production";

// in seconds
export const REFRESH_TOKEN_EXPIRES_IN = IS_PRODUCTION ? 604800 : 3600; // 7d (prod) & 1h (dev/test)
export const ACCESS_TOKEN_EXPIRES_IN = 900; // 15m

export const SESSIONS_LIMIT = 10;

// in milliseconds
export const CURR_TIME_EXTENDS_REFRESH_TOKEN_EXPIRES_IN = new Date(
    Date.now() + REFRESH_TOKEN_EXPIRES_IN * 1000
);
