import { compare, hash } from 'bcryptjs';
import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { ApiError } from '../configs/api-error.js';
import {
    ACCESS_TOKEN_EXPIRY,
    IS_PRODUCTION,
    REFRESH_TOKEN_EXPIRY,
    SESSIONS_LIMIT,
} from '../configs/constants.js';
import { env } from '../configs/env.js';
import { loginSchema, signupSchema } from '../configs/schemas';
import { prisma } from '../lib/prisma.js';

export const signup = async (req: Request, res: Response, next: NextFunction) => {
    const parsedSchema = signupSchema.safeParse(req.body);
    if (!parsedSchema.success) {
        return next(new ApiError(400, parsedSchema.error.errors[0].message));
    }

    const { email, password } = parsedSchema.data;

    const isAccountExists = await prisma.user.findUnique({
        where: {
            email,
        },
        select: {
            id: true,
        },
    });

    if (isAccountExists) {
        return next(new ApiError(409, 'Account already exists'));
    }

    const newUser = await prisma.user.create({
        data: {
            email,
            password: await hash(password, 10),
        },
    });

    const refreshToken = jwt.sign(
        {
            sub: newUser.id,
            type: 'refresh',
        },
        env.JWT_SECRET,
        {
            expiresIn: REFRESH_TOKEN_EXPIRY,
        }
    );

    await prisma.session.create({
        data: {
            refreshToken: await hash(refreshToken, 10),
            userAgent: req.headers['user-agent'],
            expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRY * 1000),
            ipAddress: req.ip === '::1' ? '127.0.0.1' : req.ip,
            user: {
                connect: {
                    id: newUser.id,
                },
            },
        },
    });

    const { password: _, ...safeUser } = newUser;

    const response = res.cookie('__refresh_token__', refreshToken, {
        secure: IS_PRODUCTION,
        httpOnly: true,
        maxAge: REFRESH_TOKEN_EXPIRY * 1000,
        sameSite: 'lax',
    });

    response.status(201).json({
        user: safeUser,
        accessToken: jwt.sign(
            {
                sub: safeUser.id,
                type: 'access',
            },
            env.JWT_SECRET,
            {
                expiresIn: ACCESS_TOKEN_EXPIRY,
            }
        ),
        message: 'Signed up successfully',
    });
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
    const parsedSchema = loginSchema.safeParse(req.body);
    if (!parsedSchema.success) {
        return next(new ApiError(400, parsedSchema.error.errors[0].message));
    }

    const { email, password } = parsedSchema.data;

    const user = await prisma.user.findUnique({
        where: {
            email,
        },
    });

    if (!user) {
        return next(new ApiError(401, 'Incorrect email or password'));
    }

    const isMatched = await compare(password, user.password);
    if (!isMatched) {
        return next(new ApiError(401, 'Incorrect email or password'));
    }

    const sessions = await prisma.session.findMany({
        where: {
            userId: user.id,
            revoked: false,
        },
        orderBy: {
            createdAt: 'asc',
        },
    });

    if (SESSIONS_LIMIT <= sessions.length) {
        await prisma.session.update({
            data: {
                revoked: true,
            },
            where: {
                id: sessions[0].id,
            },
        });
    }

    const refreshToken = jwt.sign(
        {
            sub: user.id,
            type: 'refresh',
        },
        env.JWT_SECRET,
        {
            expiresIn: ACCESS_TOKEN_EXPIRY,
        }
    );

    await prisma.session.create({
        data: {
            refreshToken: await hash(refreshToken, 10),
            userAgent: req.headers['user-agent'],
            expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRY * 1000),
            ipAddress: req.ip === '::1' ? '127.0.0.1' : req.ip,
            user: {
                connect: {
                    id: user.id,
                },
            },
        },
    });

    const { password: _, ...safeUser } = user;

    const response = res.cookie('__refresh_token__', refreshToken, {
        secure: IS_PRODUCTION,
        httpOnly: true,
        maxAge: REFRESH_TOKEN_EXPIRY * 1000,
        sameSite: 'lax',
    });

    response.status(200).json({
        user: safeUser,
        accessToken: jwt.sign(
            {
                sub: safeUser.id,
                type: 'access',
            },
            env.JWT_SECRET,
            {
                expiresIn: ACCESS_TOKEN_EXPIRY,
            }
        ),
        message: 'Logged in successfully',
    });
};
