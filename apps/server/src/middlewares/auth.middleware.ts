import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { ApiError } from "../configs/api-error";
import { prisma } from "../lib/prisma.js";
import { verifyToken } from "../utils/token";

export const authMiddleware = async (req: Request, _res: Response, next: NextFunction) => {
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
        return next(new ApiError(401, "Missing auth header"));
    }

    if (!authHeader.startsWith("Bearer")) {
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

    const { sub, sid, type } = decoded;
    if (type !== "access") {
        return next(new ApiError(403, "Invalid token type"));
    }

    await prisma.session.update({
        where: { id: sid },
        data: { lastUsedAt: new Date() },
    });

    (req as any).data = { userId: sub, sessionId: sid };

    next();
};
