import { NextFunction, Request, Response } from "express";
import { constant } from "../../configs/constant.js";
import { authSchema } from "../../configs/validator.js";
import { loginService } from "../../services/auth/login.service.js";
import { CloveError } from "../../utils/clove-error.js";
import { getExpiryDate } from "../../utils/get-expiry-date.js";
import { getNormalizedIP } from "../../utils/get-normalized-ip.js";
import { signToken } from "../../utils/jwt.js";

export const loginController = async (req: Request, res: Response, next: NextFunction) => {
    const parsedSchema = authSchema.safeParse(req.body);
    if (!parsedSchema.success) {
        return next(
            new CloveError(400, {
                message: "Invalid input",
                details: parsedSchema.error.issues.map((i) => i.message).join(", "),
            })
        );
    }

    const { email, password } = parsedSchema.data;
    const loginResult = await loginService({
        userAgent: req.headers["user-agent"],
        ipAddress: getNormalizedIP(req.ip || ""),
        email,
        password,
    });

    if (loginResult.status === "EMAIL_VERIFICATION_REQUIRED") {
        return res.status(202).json({
            message: "Verification email has been resent.",
        });
    }

    const { refreshToken, user, sessionId } = loginResult;

    res.status(200)
        .cookie("__refresh_token__", refreshToken, {
            secure: constant.IS_PRODUCTION,
            httpOnly: true,
            maxAge: constant.REFRESH_TOKEN_EXPIRY_MS,
            sameSite: "strict",
        })
        .json({
            user,
            accessToken: await signToken(
                {
                    type: "access",
                    sub: user.id,
                    session_id: sessionId,
                    email,
                },
                getExpiryDate(constant.ACCESS_TOKEN_EXPIRY_MS)
            ),
            message: "Logged in successfully",
        });
};
