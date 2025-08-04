import { prisma } from "@clove/database";
import jwt from "jsonwebtoken";
import { constant } from "../configs/constant.js";
import { env } from "../configs/env.js";
import { AuthPayload } from "../types/auth-payload.js";

export const signToken = (payload: AuthPayload, expiresIn: jwt.SignOptions["expiresIn"]) => {
    payload = {
        ...payload,
        jti: crypto.randomUUID(),
        iss: env.API_ORIGIN,
        kid: constant.JWT_KEY_ID,
    } as AuthPayload;
    return jwt.sign(payload, env.JWT_RSA_PVT_KEY, {
        expiresIn,
        algorithm: "RS256",
    });
};

export const verifyToken = async (token: string) => {
    try {
        const payload = jwt.verify(token, env.JWT_RSA_PUB_KEY, {
            algorithms: ["RS256"],
            issuer: env.API_ORIGIN,
            clockTolerance: 30,
        }) as AuthPayload;

        const session = await prisma.session.findUnique({
            where: {
                userId: payload.sub,
                id: payload.session_id,
                revoked: false,
            },
        });

        if (!session) {
            return {
                verified: false,
                status: 404,
                message: "Session not found",
            };
        }

        return {
            verified: true,
            payload,
        };
    } catch (error) {
        if (
            error instanceof jwt.TokenExpiredError ||
            error instanceof jwt.NotBeforeError ||
            error instanceof jwt.JsonWebTokenError
        ) {
            return {
                verified: false,
                status: 401,
                message: "Invalid, expired or malformed token",
            };
        }
    }
};
