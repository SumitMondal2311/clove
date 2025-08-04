import { env } from "./env.js";

const IS_PRODUCTION = env.NODE_ENV === "production";

export const constant = {
    REF_TOKEN_EXPIRES_IN: IS_PRODUCTION ? 604800 : 3600,
    IS_PRODUCTION,
    ACC_TOKEN_EXPIRES_IN: 300,
    JWT_KEY_ID: "v1",
};
