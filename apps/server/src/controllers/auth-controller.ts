import { prisma } from "@clove/database";
import { compare, hash } from "bcryptjs";
import { randomBytes, randomUUID } from "crypto";
import { NextFunction, Request, Response } from "express";
import { ApiError } from "../configs/api-error.js";
import { constant } from "../configs/constant.js";
import { authSchema } from "../configs/validator.js";
import { redis } from "../lib/redis.js";
import { signToken, verifyToken } from "../services/jwt-service.js";

export const signup = async (req: Request, res: Response, next: NextFunction) => {
    const parsedSchema = authSchema.safeParse(req.body);
    if (!parsedSchema.success) {
        return next(new ApiError(400, parsedSchema.error.issues.map((i) => i.message).join(", ")));
    }

    const { email, password } = parsedSchema.data;
    const userRecord = await prisma.emailAddress.findFirst({
        where: {
            banned: false,
            email,
        },
        select: {
            id: true,
        },
    });

    if (userRecord) {
        return next(new ApiError(409, "Failed to sign up: A user with this email already exists"));
    }
    const sessionId = randomUUID();
    const userId = randomUUID();
    const refreshToken = signToken(
        {
            sub: userId,
            session_id: sessionId,
            type: "refresh",
        },
        constant.REF_TOKEN_EXPIRES_IN
    );

    const { newUser, session } = await prisma.$transaction(async (tx) => {
        const newUser = await tx.user.create({
            data: {
                id: userId,
                password: await hash(password, 10),
                lastLoginIp: req.ip,
            },
        });
        await tx.emailAddress.create({
            data: {
                email,
                primary: true,
                user: {
                    connect: {
                        id: newUser.id,
                    },
                },
            },
        });
        const session = await tx.session.create({
            data: {
                id: sessionId,
                expiresAt: new Date(Date.now() + constant.REF_TOKEN_EXPIRES_IN * 1000),
                refToken: await hash(refreshToken, 10),
                ipAddress: req.ip,
                userAgent: req.headers["user-agent"],
                user: {
                    connect: {
                        id: newUser.id,
                    },
                },
            },
        });
        await tx.auditLog.create({
            data: {
                event: "ACCOUNT_CREATED",
                ipAddress: req.ip,
                userAgent: req.headers["user-agent"],
                user: {
                    connect: {
                        id: newUser.id,
                    },
                },
            },
        });
        await tx.token.create({
            data: {
                expiresAt: new Date(Date.now() + 600 * 1000),
                token: randomBytes(64).toString("hex"),
                type: "EMAIL_VERIFICATION",
                ipAddress: req.ip,
                userAgent: req.headers["user-agent"],
                user: {
                    connect: {
                        id: newUser.id,
                    },
                },
            },
        });
        return { newUser, session };
    });

    const { password: _, ...safeUser } = newUser;

    const responseWithCookie = res.cookie("__refresh_token__", refreshToken, {
        secure: constant.IS_PRODUCTION,
        httpOnly: true,
        maxAge: constant.REF_TOKEN_EXPIRES_IN * 1000,
        sameSite: "strict",
    });

    responseWithCookie.status(201).json({
        user: safeUser,
        accessToken: signToken(
            {
                session_id: session.id,
                type: "access",
                sub: safeUser.id,
            },
            constant.ACC_TOKEN_EXPIRES_IN
        ),
        message: "Signed up successfully",
    });
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
    const parsedSchema = authSchema.safeParse(req.body);
    if (!parsedSchema.success) {
        return next(new ApiError(400, parsedSchema.error.issues.map((i) => i.message).join(", ")));
    }

    const { email, password } = parsedSchema.data;
    const emailRecord = await prisma.emailAddress.findFirst({
        where: {
            email,
        },
        include: {
            user: true,
        },
    });

    if (!emailRecord) {
        return next(new ApiError(401, "Failed to login: Invalid login credentials"));
    }

    const emailBannedUntil = emailRecord.bannedUntil!;
    if (emailRecord.banned) {
        if (Date.now() > emailBannedUntil.getTime()) {
            await prisma.emailAddress.update({
                data: {
                    banned: false,
                },
                where: {
                    email,
                },
            });
        } else {
            return next(
                new ApiError(
                    401,
                    "Failed to login: Your email has been banned for some security reasons, we'll notify you as the ban get uplifted"
                )
            );
        }
    }

    const user = emailRecord.user;
    if (user.status === "LOCKED") {
        return next(
            new ApiError(
                401,
                "Failed to login: Your account is locked for some security reasons, we'll notify you as your account gets unlocked"
            )
        );
    }

    const isPasswordSame = await compare(password, user.password!);
    if (!isPasswordSame) {
        const updatedUser = await prisma.user.update({
            data: {
                failedLoginAttempts: {
                    increment: 1,
                },
            },
            where: {
                id: user.id,
            },
        });
        if (updatedUser.failedLoginAttempts >= constant.FAILED_LOGIN_ATTEMPTS) {
            await prisma.$transaction(async (tx) => {
                const bannedEmail = await tx.emailAddress.update({
                    data: {
                        bannedUntil: new Date(Date.now() + constant.EMAIL_BAN_DURATION_MS),
                        banned: true,
                        banReason: "TOO_MANY_FAILED_ATTEMPTS",
                    },
                    where: {
                        userId_email: {
                            userId: user.id,
                            email,
                        },
                    },
                });
                await tx.auditLog.create({
                    data: {
                        event: "EMAIL_BANNED",
                        ipAddress: req.ip,
                        userAgent: req.headers["user-agent"],
                        metadata: {
                            banned_email: email,
                            description: "Too many failed login attempts",
                            banned_until: bannedEmail.bannedUntil,
                        },
                        user: {
                            connect: {
                                id: updatedUser.id,
                            },
                        },
                    },
                });
            });
            return next(
                new ApiError(
                    401,
                    "Your email has been banned for 24 hours due to multiple failed login attempts, we'll notify you as the ban get uplifted"
                )
            );
        }
        return next(new ApiError(401, "Failed to login: Invalid login credentials"));
    }

    const sessions = await prisma.session.findMany({
        where: {
            userId: user.id,
            revoked: false,
        },
        orderBy: {
            lastActiveAt: "asc",
        },
        select: {
            id: true,
            expiresAt: true,
        },
    });

    if (constant.SESSIONS_LIMIT <= sessions.length) {
        await prisma.session.update({
            data: {
                revokedAt: new Date(),
                revoked: true,
            },
            where: {
                id: sessions[0].id,
            },
        });
    }

    const sessionId = randomUUID();
    const refreshToken = signToken(
        {
            sub: user.id,
            session_id: sessionId,
            type: "refresh",
        },
        constant.REF_TOKEN_EXPIRES_IN
    );

    const { updatedUser, session } = await prisma.$transaction(async (tx) => {
        const updatedUser = await tx.user.update({
            data: {
                failedLoginAttempts: 0,
                lastLoginIp: req.ip,
            },
            where: {
                id: user.id,
            },
        });
        await tx.emailAddress.updateMany({
            data: {
                primary: false,
            },
            where: {
                userId: user.id,
            },
        });
        await tx.emailAddress.upsert({
            where: {
                userId_email: {
                    userId: user.id,
                    email,
                },
            },
            update: {
                primary: true,
            },
            create: {
                email,
                primary: true,
                user: {
                    connect: {
                        id: user.id,
                    },
                },
            },
        });
        const session = await tx.session.create({
            data: {
                id: sessionId,
                expiresAt: new Date(Date.now() + constant.REF_TOKEN_EXPIRES_IN * 1000),
                refToken: await hash(refreshToken, 10),
                ipAddress: req.ip,
                userAgent: req.headers["user-agent"],
                user: {
                    connect: {
                        id: user.id,
                    },
                },
            },
        });
        await tx.auditLog.create({
            data: {
                event: user.lastLoginIp === req.ip ? "LOGGED_INTO_ACCOUNT" : "SUSPICIOUS_LOGIN",
                ipAddress: req.ip,
                userAgent: req.headers["user-agent"],
                user: {
                    connect: {
                        id: user.id,
                    },
                },
            },
        });
        return { updatedUser, session };
    });

    const { password: _, ...safeUser } = updatedUser;

    const responseWithCookie = res.cookie("__refresh_token__", refreshToken, {
        secure: constant.IS_PRODUCTION,
        httpOnly: true,
        maxAge: constant.REF_TOKEN_EXPIRES_IN * 1000,
        sameSite: "strict",
    });

    responseWithCookie.status(200).json({
        user: safeUser,
        accessToken: signToken(
            {
                session_id: session.id,
                type: "access",
                sub: safeUser.id,
            },
            constant.ACC_TOKEN_EXPIRES_IN
        ),
        message: "Logged in successfully",
    });
};

export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
    const refreshToken = req.cookies["__refresh_token__"];
    if (!refreshToken) {
        return next(new ApiError(401, "Missing refresh token"));
    }

    const verificationResult = await verifyToken(refreshToken);
    if (!verificationResult.verified) {
        return next(
            new ApiError(
                verificationResult.status as number,
                `Failed to verify token: ${verificationResult.message ?? "something went wrong"}`
            )
        );
    }

    const refreshPayload = verificationResult.payload!;
    const currSession = verificationResult.session!;

    if (refreshPayload?.type !== "refresh") {
        return next(new ApiError(403, "Failed to verify token: Invalid token type"));
    }

    if (
        (await compare(refreshToken, currSession.refToken)) === false ||
        (await redis.exists(`jwt-bl:${refreshPayload.jti}`)) === 1
    ) {
        const updatedUser = await prisma.user.update({
            data: {
                warnings: {
                    increment: 1,
                },
            },
            where: {
                id: currSession?.userId,
                status: "ACTIVE",
            },
        });
        if (updatedUser.warnings >= constant.MAX_WARNINGS) {
            await prisma.$transaction(async (tx) => {
                const lockedUser = await tx.user.update({
                    data: {
                        status: "LOCKED",
                        lockedUntil: new Date(Date.now() + constant.ACCOUNT_LOCK_DURATION_MS),
                    },
                    where: {
                        id: updatedUser.id,
                        status: "ACTIVE",
                    },
                });
                await tx.session.updateMany({
                    data: {
                        revokedAt: new Date(),
                        revoked: true,
                    },
                    where: {
                        userId: updatedUser.id,
                        revoked: false,
                    },
                });
                await tx.auditLog.create({
                    data: {
                        event: "ACCOUNT_LOCKED",
                        ipAddress: req.ip,
                        userAgent: req.headers["user-agent"],
                        metadata: {
                            description:
                                "Crossed max warning limits by breaking security protocols multiple times",
                            locked_until: lockedUser.lockedUntil,
                        },
                        user: {
                            connect: {
                                id: updatedUser.id,
                            },
                        },
                    },
                });
            });

            return next(
                new ApiError(
                    401,
                    "Your account has been locked for 7 days for crossing the warning limit & breaching the security protocols multiple times, we'll notify you as your account gets unlocked"
                )
            );
        } else {
            await prisma.session.update({
                data: {
                    revokedAt: new Date(),
                    revoked: true,
                },
                where: {
                    id: currSession?.id,
                    revoked: false,
                },
            });
        }
        res.cookie("__refresh_token__", "", {
            maxAge: 0,
        });
        return next(
            new ApiError(
                401,
                "Warning: Token tampered or attempt re-use, please log in again for security reasons"
            )
        );
    }

    const newRefreshToken = signToken(
        {
            sub: currSession?.userId,
            session_id: currSession?.id,
            type: "refresh",
        },
        constant.REF_TOKEN_EXPIRES_IN
    );

    await prisma.session.update({
        data: {
            refToken: await hash(newRefreshToken, 10),
            lastRotateAt: new Date(),
            expiresAt: new Date(Date.now() + constant.REF_TOKEN_EXPIRES_IN * 1000),
            lastActiveAt: new Date(),
        },
        where: {
            id: currSession?.id,
        },
    });

    await redis.set(
        `jwt-bl:${refreshPayload.jti}`,
        "revoked",
        "EX",
        refreshPayload.exp || constant.REF_TOKEN_EXPIRES_IN
    );

    const responseWithCookie = res.cookie("__refresh_token__", newRefreshToken, {
        secure: constant.IS_PRODUCTION,
        httpOnly: true,
        maxAge: constant.REF_TOKEN_EXPIRES_IN * 1000,
        sameSite: "strict",
    });

    responseWithCookie.status(200).json({
        accessToken: signToken(
            {
                session_id: currSession?.id,
                type: "access",
                sub: currSession?.userId,
            },
            constant.ACC_TOKEN_EXPIRES_IN
        ),
    });
};
