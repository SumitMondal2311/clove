import { env } from "./env.js";

const IS_PRODUCTION = env.NODE_ENV === "production";

export const constant = {
    REF_TOKEN_EXPIRES_IN: IS_PRODUCTION ? 604800 : 3600,
    JWT_KEY_ID: "v1",
    IS_PRODUCTION,
    ACC_TOKEN_EXPIRES_IN: 300,
    SESSIONS_LIMIT: 10,
    FAILED_LOGIN_ATTEMPTS: 15,
};
