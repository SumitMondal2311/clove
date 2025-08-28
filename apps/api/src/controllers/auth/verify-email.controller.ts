import { NextFunction, Request, Response } from "express";
import { constant } from "../../configs/constant.js";
import { env } from "../../configs/env.js";
import { verifyEmailService } from "../../services/auth/verify-email.service.js";
import { CloveError } from "../../utils/clove-error.js";
import { getNormalizedIP } from "../../utils/get-normalized-ip.js";
import { signToken } from "../../utils/jwt.js";
import { validateUUID } from "../../utils/validate-uuid.js";

export const verifyEmailController = async (req: Request, res: Response, next: NextFunction) => {
    const { token } = req.query;
    if (!token) {
        return next(
            new CloveError(400, {
                message: "Missing token",
                details: "The token query parameter was not provided.",
            })
        );
    }

    if (typeof token !== "string") {
        return next(
            new CloveError(400, {
                message: "Invalid token type",
                details: "Token type expected: string",
            })
        );
    }

    const decodedToken = decodeURIComponent(token);
    const [tokenId, secret] = decodedToken.split(".");
    if (!tokenId || !secret) {
        throw new CloveError(400, {
            message: "Invalid token format",
            details: "Token format expected: <tokenID>.<secret>",
        });
    }

    if (validateUUID(tokenId) === false) {
        throw new CloveError(400, {
            message: "Invalid token ID",
            details: "Token ID type expected: UUID",
        });
    }

    const { refreshToken, user, sessionId } = await verifyEmailService({
        userAgent: req.headers["user-agent"],
        ipAddress: getNormalizedIP(req.ip || ""),
        secret,
        tokenId,
    });

    const responseWithCookie = res.cookie("__refresh_token__", refreshToken, {
        secure: constant.IS_PRODUCTION,
        httpOnly: true,
        maxAge: constant.REFRESH_TOKEN_EXPIRY_MS,
        sameSite: "strict",
    });

    responseWithCookie.status(200).json({
        user,
        accessToken: await signToken(
            {
                type: "access",
                session_id: sessionId,
                sub: user.id,
            },
            env.ACCESS_TOKEN_EXPIRY
        ),
        message: "Email verified successfully.",
    });
};
