import { compare, hash } from "bcryptjs";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { ApiError } from "../configs/api-error.js";
import {
    ACCESS_TOKEN_EXPIRES_IN,
    CURR_TIME_EXTENDS_REFRESH_TOKEN_EXPIRES_IN,
    IS_PRODUCTION,
    REFRESH_TOKEN_EXPIRES_IN,
    SESSIONS_LIMIT,
} from "../configs/constant.js";
import { authSchema } from "../configs/schemas.js";
import { prisma } from "../lib/prisma.js";
import { redis } from "../lib/redis.js";
import { AuthRequest } from "../types/auth-request.js";
import { getIP } from "../utils/get-ip.js";
import { getAccessToken, getRefreshToken, verifyToken } from "../utils/token.js";

export const signup = async (req: Request, res: Response, next: NextFunction) => {
    const parsedSchema = authSchema.safeParse(req.body);
    if (!parsedSchema.success) {
        return next(new ApiError(400, parsedSchema.error.issues.map((i) => i.message).join(", ")));
    }

    const { email, password } = parsedSchema.data;
    const userExists = await prisma.user.findUnique({
        where: {
            email,
        },
        select: {
            id: true,
        },
    });

    if (userExists) {
        return next(new ApiError(409, "Failed to sign up: A user with this email already exists"));
    }

    const newUser = await prisma.user.create({
        data: {
            email,
            passwordHash: await hash(password, 10),
        },
    });

    const [session, _auditLog] = await prisma.$transaction([
        prisma.session.create({
            data: {
                deviceName: String(req.headers["device-name"]),
                deviceId: String(req.headers["device-id"]),
                refreshTokenHash: await hash("temp-token", 10),
                userAgent: req.headers["user-agent"],
                expiresAt: CURR_TIME_EXTENDS_REFRESH_TOKEN_EXPIRES_IN,
                ipAddress: getIP(req),
                user: {
                    connect: {
                        id: newUser.id,
                    },
                },
            },
        }),
        prisma.auditLog.create({
            data: {
                event: "Account created",
                ipAddress: getIP(req),
                userAgent: req.headers["user-agent"],
                user: {
                    connect: {
                        id: newUser.id,
                    },
                },
            },
        }),
    ]);

    const refreshToken = getRefreshToken(newUser.id, session.id);
    await prisma.session.update({
        data: {
            refreshTokenHash: await hash(refreshToken, 10),
        },
        where: {
            id: session.id,
        },
    });

    const { passwordHash, ...safeUser } = newUser;

    const responseWithCookie = res.cookie("__refresh_token__", refreshToken, {
        secure: IS_PRODUCTION,
        httpOnly: true,
        maxAge: REFRESH_TOKEN_EXPIRES_IN * 1000,
        sameSite: "lax",
    });

    responseWithCookie.status(201).json({
        user: safeUser,
        accessToken: getAccessToken(safeUser.id, session.id),
        message: "Signed up successfully",
    });
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
    const parsedSchema = authSchema.safeParse(req.body);
    if (!parsedSchema.success) {
        return next(new ApiError(400, parsedSchema.error.issues.map((i) => i.message).join(", ")));
    }

    const { email, password } = parsedSchema.data;
    const user = await prisma.user.findUnique({
        where: {
            email,
        },
    });

    if (!user) {
        return next(new ApiError(401, "Failed to login: Invalid login credentials"));
    }

    const isPasswordSame = await compare(password, user.passwordHash);
    if (!isPasswordSame) {
        return next(new ApiError(401, "Failed to login: Invalid login credentials"));
    }

    const sessions = await prisma.session.findMany({
        where: {
            userId: user.id,
            revoked: false,
        },
        orderBy: {
            lastUsedAt: "asc",
        },
    });

    if (SESSIONS_LIMIT <= sessions.length) {
        await prisma.session.update({
            data: {
                revokedAt: new Date(),
                revoked: true,
                revocationReason:
                    sessions[0].expiresAt.getTime() <= Date.now()
                        ? "EXPIRATION"
                        : "FORCED_BY_SERVER",
            },
            where: {
                id: sessions[0].id,
            },
        });
    }

    const [session, _auditLog] = await prisma.$transaction([
        prisma.session.create({
            data: {
                deviceName: String(req.headers["device-name"]),
                deviceId: String(req.headers["device-id"]),
                refreshTokenHash: await hash("temp-token", 10),
                userAgent: req.headers["user-agent"],
                expiresAt: CURR_TIME_EXTENDS_REFRESH_TOKEN_EXPIRES_IN,
                ipAddress: getIP(req),
                user: {
                    connect: {
                        id: user.id,
                    },
                },
            },
        }),
        prisma.auditLog.create({
            data: {
                event: "Logged into account",
                ipAddress: getIP(req),
                userAgent: req.headers["user-agent"],
                user: {
                    connect: {
                        id: user.id,
                    },
                },
            },
        }),
    ]);

    const refreshToken = getRefreshToken(user.id, session.id);
    await prisma.session.update({
        data: {
            refreshTokenHash: await hash(refreshToken, 10),
        },
        where: {
            id: session.id,
        },
    });

    const { passwordHash, ...safeUser } = user;

    const responseWithCookie = res.cookie("__refresh_token__", refreshToken, {
        secure: IS_PRODUCTION,
        httpOnly: true,
        maxAge: REFRESH_TOKEN_EXPIRES_IN * 1000,
        sameSite: "lax",
    });

    responseWithCookie.status(200).json({
        user: safeUser,
        accessToken: getAccessToken(safeUser.id, session.id),
        message: "Logged in successfully",
    });
};

export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
    const refreshToken = req.cookies["__refresh_token__"];
    if (!refreshToken) {
        return next(new ApiError(401, "Missing refresh token"));
    }

    let decoded;
    try {
        decoded = verifyToken(refreshToken);
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
            return next(new ApiError(401, "Invalid or expired token"));
        }
        return next(new ApiError(500, "Failed to verify token: Something went wrong"));
    }

    const { sub, sid, type, jti, exp } = decoded;
    if (type !== "refresh") {
        return next(new ApiError(403, "Invalid token type"));
    }

    const currSession = await prisma.session.findFirst({
        where: {
            userId: sub,
            id: sid,
        },
        select: {
            id: true,
            refreshTokenHash: true,
        },
    });

    if (!currSession) {
        return next(new ApiError(404, "Session not found"));
    }

    if (
        (await redis.get(`jwt-bl-${jti}`)) ||
        !(await compare(refreshToken, currSession.refreshTokenHash))
    ) {
        await prisma.session.update({
            data: {
                revokedAt: new Date(),
                revoked: true,
                revocationReason: "SUSPICIOUS_ACTIVITY",
            },
            where: {
                id: currSession.id,
            },
        });
        res.cookie("__refresh_token__", "", {
            maxAge: 0,
        });
        return next(
            new ApiError(
                403,
                "Warning: Attempt blacklisted token re-use, please login again for security reasons"
            )
        );
    }

    const newRefreshToken = getRefreshToken(sub, sid);
    const [session, _auditLog] = await prisma.$transaction([
        prisma.session.update({
            data: {
                refreshTokenHash: await hash(newRefreshToken, 10),
                expiresAt: CURR_TIME_EXTENDS_REFRESH_TOKEN_EXPIRES_IN,
                lastRotatedAt: new Date(),
            },
            where: {
                id: currSession.id,
            },
        }),
        prisma.auditLog.create({
            data: {
                event: "Rotated refresh token",
                ipAddress: getIP(req),
                userAgent: req.headers["user-agent"],
                user: {
                    connect: {
                        id: sub,
                    },
                },
            },
        }),
    ]);

    await redis.set(`jwt-bl-${jti}`, "revoked", "EX", exp ?? REFRESH_TOKEN_EXPIRES_IN);

    const responseWithCookie = res.cookie("__refresh_token__", newRefreshToken, {
        secure: IS_PRODUCTION,
        httpOnly: true,
        maxAge: REFRESH_TOKEN_EXPIRES_IN * 1000,
        sameSite: "lax",
    });

    responseWithCookie.status(200).json({
        accessToken: getAccessToken(sub, session.id),
        message: "Both refresh & access tokens refreshed successfully",
    });
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
    const refreshToken = req.cookies["__refresh_token__"];
    if (!refreshToken) {
        return next(new ApiError(401, "Missing refresh token"));
    }

    const { data } = req as AuthRequest;

    let decoded;
    try {
        decoded = verifyToken(refreshToken);
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
            return next(new ApiError(401, "Invalid or expired token"));
        }
        return next(new ApiError(500, "Failed to verify token: Something went wrong"));
    }

    const { type, jti, exp } = decoded;
    if (type !== "refresh") {
        return next(new ApiError(403, "Invalid token type"));
    }

    if (req.body.fromAll) {
        await prisma.session.updateMany({
            data: {
                revokedAt: new Date(),
                revoked: true,
                revocationReason: "LOGOUT",
            },
            where: {
                userId: data?.userId,
            },
        });
    } else {
        await prisma.session.update({
            data: {
                revokedAt: new Date(),
                revoked: true,
                revocationReason: "LOGOUT",
            },
            where: {
                userId: data?.userId,
                id: data?.sessionId,
            },
        });
    }

    await prisma.auditLog.create({
        data: {
            event: "Logged out from account",
            ipAddress: getIP(req),
            userAgent: req.headers["user-agent"],
            user: {
                connect: {
                    id: data?.userId,
                },
            },
        },
    });

    await Promise.all([
        redis.set(
            `jwt-bl-${data?.access?.jti}`,
            "revoked",
            "EX",
            data?.access?.exp ?? ACCESS_TOKEN_EXPIRES_IN
        ),
        redis.set(`jwt-bl-${jti}`, "revoked", "EX", exp ?? REFRESH_TOKEN_EXPIRES_IN),
    ]);

    res.cookie("__refresh_token__", "", {
        maxAge: 0,
    });

    res.status(200).json({ message: "Logged out successfully" });
};
