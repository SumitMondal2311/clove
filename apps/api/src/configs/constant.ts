import { env } from "./env.js";

export const constant = {
    REFRESH_TOKEN_EXPIRY_MS: env.REFRESH_TOKEN_EXPIRY * 1000,
    IS_PRODUCTION: env.NODE_ENV === "production",
    ACCESS_TOKEN_EXPIRY_MS: env.ACCESS_TOKEN_EXPIRY * 1000,
};
