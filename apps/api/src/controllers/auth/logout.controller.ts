import { NextFunction, Request, Response } from "express";
import { logoutService } from "../../services/auth/logout.service.js";
import { CloveError } from "../../utils/clove-error.js";
import { getNormalizedIP } from "../../utils/get-normalized-ip.js";
import { constant } from "../../configs/constant.js";

export const logoutController = async (req: Request, res: Response, next: NextFunction) => {
    const refreshToken = req.cookies["__refresh_token__"];
    if (!refreshToken) {
        return next(
            new CloveError(401, {
                message: "Missing refresh token",
                details: "Refresh token is missing from the cookie",
            })
        );
    }

    await logoutService({
        userAgent: req.headers["user-agent"],
        ipAddress: getNormalizedIP(req.ip || ""),
        refreshToken,
    });

    res.status(200)
        .cookie("__refresh_token__", "", {
            sameSite: "strict",
            httpOnly: true,
            maxAge: 0,
            secure: constant.IS_PRODUCTION,
        })
        .json({ message: "Logged out successfully" });
};
