import { createPrivateKey } from "crypto";
import { existsSync, readFileSync } from "fs";
import { JWTVerifyResult, SignJWT, errors, jwtVerify } from "jose";
import { resolve } from "path";
import { env } from "../configs/env.js";
import { AuthJWTPayload } from "../types/auth-jwt-payload.js";
import { CloveError } from "./clove-error.js";

const secretsDir = resolve(process.cwd(), "secrets");
if (existsSync(secretsDir) === false) {
    console.error("Missing secrets directory");
    process.exit(1);
}

const privatePemPath = resolve(secretsDir, "rsa-private.pem");
const publicPemPath = resolve(secretsDir, "rsa-public.pem");
if (!existsSync(privatePemPath) || !existsSync(privatePemPath)) {
    console.error("Missing rsa-private.pem or rsa-public.pem file");
    process.exit(1);
}

const privateKey = createPrivateKey(readFileSync(privatePemPath, "utf8"));
const publicKey = createPrivateKey(readFileSync(publicPemPath, "utf8"));

export const signToken = (
    payload: AuthJWTPayload,
    expirationTime: number | string | Date
): Promise<string> => {
    return new SignJWT({
        ...payload,
        iss: env.JWT_ISS,
        kid: env.JWT_KID,
    })
        .setProtectedHeader({ alg: "RS256" })
        .setNotBefore(0)
        .setIssuedAt()
        .setExpirationTime(expirationTime)
        .sign(privateKey);
};

export const verifyToken = async (token: string): Promise<JWTVerifyResult<AuthJWTPayload>> => {
    try {
        return jwtVerify(token, publicKey);
    } catch (error) {
        if (
            error instanceof errors.JWTExpired ||
            error instanceof errors.JWTInvalid ||
            error instanceof errors.JWSSignatureVerificationFailed ||
            error instanceof errors.JWTClaimValidationFailed
        ) {
            throw new CloveError(401, {
                message: "Invalid or expired token",
                details: error.message,
            });
        }

        throw error;
    }
};
