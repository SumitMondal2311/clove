import { prisma } from "@clove/database";
import { compare, hash } from "bcryptjs";
import { randomBytes, randomUUID } from "crypto";
import { NextFunction, Request, Response } from "express";
import { ApiError } from "../configs/api-error.js";
import { constant } from "../configs/constant.js";
import { authSchema } from "../configs/validator.js";
import { signToken } from "../services/jwt-service.js";

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
            banned: false,
            email,
        },
        include: {
            user: true,
        },
    });

    if (!emailRecord) {
        return next(new ApiError(401, "Failed to login: Invalid login credentials"));
    }

    const user = emailRecord.user;
    if (user.status === "LOCKED") {
        return next(
            new ApiError(
                401,
                "Failed to login: Your account is locked for security reasons, and will be unlocked soon..."
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
                status: "ACTIVE",
            },
        });
        if (updatedUser.failedLoginAttempts >= constant.FAILED_LOGIN_ATTEMPTS) {
            await prisma.$transaction(async (tx) => {
                await tx.user.update({
                    data: {
                        status: "LOCKED",
                        lockedUntil: new Date(Date.now() + 24 * 60 * 60 * 1000),
                    },
                    where: {
                        id: user.id,
                        status: "ACTIVE",
                    },
                });
                await tx.session.updateMany({
                    data: {
                        revokedAt: new Date(),
                        revoked: true,
                    },
                    where: {
                        userId: user.id,
                        revoked: false,
                    },
                });
            });
            return next(
                new ApiError(
                    401,
                    "Your account gets locked due to multiple failed login attempts, please try after 24 hours"
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
                status: "ACTIVE",
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
