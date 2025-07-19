import { randomUUID } from "crypto";
import { existsSync, readFileSync } from "fs";
import jwt from "jsonwebtoken";
import path from "path";
import { fileURLToPath } from "url";
import { ACCESS_TOKEN_EXPIRES_IN, REFRESH_TOKEN_EXPIRES_IN } from "../configs/constant";
import { env } from "../configs/env";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let keysPath;
if (env.NODE_ENV !== "production") {
    keysPath = path.join(__dirname, "..", "keys");
} else {
    keysPath = path.join(__dirname, "keys");
}

if (!existsSync(keysPath)) {
    console.error("Missing keys dir");
    process.exit(1);
}

for (const file of ["secret.pem", "public.pem"]) {
    if (!existsSync(path.join(keysPath, file))) {
        console.error(`Missing ${file} file in keys dir`);
        process.exit(1);
    }
}

const createJwtId = () => {
    return `${Date.now()}-${randomUUID()}`;
};

const AUTH_SECRET_KEY = readFileSync(`${keysPath}/secret.pem`, "utf-8");
export const getRefreshToken = (sub: string | number, sid: Base64URLString) => {
    const jti = createJwtId();
    return jwt.sign(
        {
            sub,
            sid,
            type: "refresh",
        },
        AUTH_SECRET_KEY,
        {
            jwtid: jti,
            expiresIn: REFRESH_TOKEN_EXPIRES_IN,
            algorithm: "RS256",
        }
    );
};

export const getAccessToken = (sub: string | number) => {
    const jti = createJwtId();
    return jwt.sign(
        {
            sub,
            type: "access",
        },
        AUTH_SECRET_KEY,
        {
            jwtid: jti,
            expiresIn: ACCESS_TOKEN_EXPIRES_IN,
            algorithm: "RS256",
        }
    );
};

export const verifyToken = (token: string) => {
    return jwt.verify(token, readFileSync(`${keysPath}/public.pem`, "utf-8")) as jwt.JwtPayload & {
        sub: string;
        sid: string;
        type: "access" | "refresh";
        jti: string;
    };
};
