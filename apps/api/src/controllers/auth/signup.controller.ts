import { NextFunction, Request, Response } from "express";
import { authSchema } from "../../configs/validator.js";
import { signupService } from "../../services/auth/signup.service.js";
import { CloveError } from "../../utils/clove-error.js";
import { getNormalizedIP } from "../../utils/get-normalized-ip.js";

export const signupController = async (req: Request, res: Response, next: NextFunction) => {
    const validationResult = authSchema.safeParse(req.body);
    if (!validationResult.success) {
        return next(
            new CloveError(400, {
                message: "Invalid input",
                details: validationResult.error.issues[0].message,
            })
        );
    }

    const { email, password } = validationResult.data;
    const status = await signupService({
        userAgent: req.headers["user-agent"],
        ipAddress: getNormalizedIP(req.ip || ""),
        email,
        password,
    });

    if (status === "EMAIL_UNVERIFIED_RESENT") {
        return res.status(200).json({
            message: `Verification link resent to your email. Please check your inbox.`,
        });
    }

    res.status(201).json({
        message: `Signed up successfully. A verification link sent to your email. Please check your inbox.`,
    });
};
