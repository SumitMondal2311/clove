import { compare, hash } from "bcryptjs";
import { NextFunction, Request, Response } from "express";
import { ApiError } from "../configs/api-error.js";
import { IS_PRODUCTION, REFRESH_TOKEN_EXPIRES_IN, SESSIONS_LIMIT } from "../configs/constant.js";
import { authSchema } from "../configs/schemas.js";
import { prisma } from "../lib/prisma.js";
import { getAccessToken, getRefreshToken } from "../utils/token.js";

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

    const [session, _] = await prisma.$transaction([
        prisma.session.create({
            data: {
                refreshTokenHash: await hash("temp-token", 10),
                userAgent: req.headers["user-agent"],
                expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRES_IN * 1000),
                ipAddress: req.ip === "::1" ? "127.0.0.1" : req.ip,
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
                ipAddress: req.ip === "::1" ? "127.0.0.1" : req.ip,
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
        accessToken: getAccessToken(safeUser.id),
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
                    sessions[0].expiresAt <= new Date() ? "EXPIRATION" : "FORCED_BY_SERVER",
            },
            where: {
                id: sessions[0].id,
            },
        });
    }

    const [session, _] = await prisma.$transaction([
        prisma.session.create({
            data: {
                refreshTokenHash: await hash("temp-token", 10),
                userAgent: req.headers["user-agent"],
                expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRES_IN * 1000),
                ipAddress: req.ip === "::1" ? "127.0.0.1" : req.ip,
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
                ipAddress: req.ip === "::1" ? "127.0.0.1" : req.ip,
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
        accessToken: getAccessToken(safeUser.id),
        message: "Logged in successfully",
    });
};
