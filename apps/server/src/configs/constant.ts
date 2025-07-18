import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { env } from "./env";

const keysPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../keys");
export const AUTH_SECRET_KEY = fs.readFileSync(`${keysPath}/secret.pem`, "utf-8");
export const AUTH_PUBLIC_KEY = fs.readFileSync(`${keysPath}/public.pem`, "utf-8");

export const IS_PRODUCTION = env.NODE_ENV === "production";
export const SESSIONS_LIMIT = 10;

// in seconds
export const REFRESH_TOKEN_EXPIRES_IN = IS_PRODUCTION ? 604800 : 3600; // 7d (prod) & 1h (dev/test)
export const ACCESS_TOKEN_EXPIRES_IN = 900; // 15m
