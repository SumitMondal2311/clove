import { env } from "./env.js";

export const constant = {
    IS_PRODUCTION: env.NODE_ENV === "production",
};
