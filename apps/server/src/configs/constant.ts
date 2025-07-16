import { env } from "./env";

export const IS_PRODUCTION = env.NODE_ENV === "production";
