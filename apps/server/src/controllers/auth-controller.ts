import { prisma } from "@clove/database";
import { hash } from "bcryptjs";
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
    const userExists = await prisma.emailAddress.findUnique({
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

    const { newUser, session, emailVerificationToken } = await prisma.$transaction(async (tx) => {
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

        const token = await tx.token.create({
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

        return { newUser, session, emailVerificationToken: token.token };
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
