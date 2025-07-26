import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { ApiError } from "../config/api-error";
import { prisma } from "../lib/prisma.js";
import { AuthRequest } from "../types/auth-request";
import { verifyToken } from "../utils/token";

export const authMiddleware = async (req: Request, _res: Response, next: NextFunction) => {
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
        return next(new ApiError(401, "Missing auth header"));
    }

    if (!authHeader.startsWith("Bearer ")) {
        return next(new ApiError(400, "Invalid auth header"));
    }

    let decoded;
    try {
        decoded = verifyToken(authHeader.split(" ")[1]);
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
            return next(new ApiError(401, "Invalid or expired token"));
        }
        return next(new ApiError(500, "Failed to verify token: Something went wrong"));
    }

    const { sub, sid, type, jti, exp } = decoded;
    if (type !== "access") {
        return next(new ApiError(403, "Invalid token type"));
    }

    const session = await prisma.session.findUnique({
        where: {
            id: sid,
        },
        select: {
            lastUsedAt: true,
            id: true,
        },
    });

    if (!session) {
        return next(new ApiError(404, "Session not found"));
    }

    // update at a minimum time-gap of 5 mins
    if (Date.now() - session.lastUsedAt.getTime() > 300 * 1000) {
        await prisma.session.update({
            where: { id: session.id },
            data: { lastUsedAt: new Date() },
        });
    }

    (req as AuthRequest).data = { access: { jti, exp }, userId: sub, sessionId: sid };

    next();
};
