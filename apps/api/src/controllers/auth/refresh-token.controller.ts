import { NextFunction, Request, Response } from "express";
import { constant } from "../../configs/constant.js";
import { refreshTokenService } from "../../services/auth/refresh-token.service.js";
import { CloveError } from "../../utils/clove-error.js";
import { signToken } from "../../utils/jwt.js";
import { getExpiryDate } from "../../utils/get-expiry-date.js";

export const refreshTokenController = async (req: Request, res: Response, next: NextFunction) => {
    const refreshToken = req.cookies["__refresh_token__"];
    if (!refreshToken) {
        return next(
            new CloveError(401, {
                message: "Missing refresh token",
                details: "Refresh token missing in the cookies",
            })
        );
    }

    const { user, newRefreshToken, sessionId } = await refreshTokenService(refreshToken);

    res.clearCookie("__refresh_token__");
    res.status(200)
        .cookie("__refresh_token__", newRefreshToken, {
            secure: constant.IS_PRODUCTION,
            httpOnly: true,
            maxAge: constant.REFRESH_TOKEN_EXPIRY_MS,
            sameSite: "strict",
        })
        .json({
            accessToken: await signToken(
                {
                    sub: user.id,
                    session_id: sessionId,
                    type: "access",
                    email: user.email,
                },
                getExpiryDate(constant.ACCESS_TOKEN_EXPIRY_MS)
            ),
        });
};
