import { config } from "dotenv";
import path from "path";
import { envSchema } from "./schemas.js";

config({
    path: path.resolve(process.cwd(), `.env.${process.env.NODE_ENV || "development"}`),
});

export const parsedSchema = envSchema.safeParse(process.env);

if (!parsedSchema.success) {
    parsedSchema.error.issues.forEach((issue) => {
        console.error(`${issue.path}: ${issue.message}`);
    });
    process.exit(1);
}

export const env = parsedSchema.data;

if (env.NODE_ENV !== "production") {
    env.API_ORIGIN = `http://localhost:${env.PORT}`;
}
