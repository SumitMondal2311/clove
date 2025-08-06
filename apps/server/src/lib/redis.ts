import { env } from "../configs/env.js";
import { Redis } from "ioredis";

export const redis = new Redis(env.REDIS_URL);

redis.on("connect", () => console.log("Redis connected successfully"));
redis.on("error", (err) => console.error(`Redis error: ${err}`));
