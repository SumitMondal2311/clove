import { env } from "./env.js";

const IS_PRODUCTION = env.NODE_ENV === "production";

export const constant = {
    REF_TOKEN_EXPIRES_IN: IS_PRODUCTION ? 7 * 24 * 60 * 60 : 60 * 60,
    JWT_KEY_ID: "v1",
    IS_PRODUCTION,
    ACCOUNT_LOCK_DURATION_MS: 7 * 24 * 60 * 60 * 1000,
    EMAIL_BAN_DURATION_MS: 24 * 60 * 60 * 1000,
    MAX_WARNINGS: 7,
    ACC_TOKEN_EXPIRES_IN: 15 * 60,
    SESSIONS_LIMIT: 10,
    FAILED_LOGIN_ATTEMPTS: 5,
};
