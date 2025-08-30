import { NextFunction, Request, Response } from "express";
import { meService } from "../../services/user/me.service.js";
import { CloveError } from "../../utils/clove-error.js";

export const meController = async (req: Request, res: Response, _next: NextFunction) => {
    const authData = req?.authData;
    if (!authData) {
        throw new CloveError(401, {
            message: "Unauthorized",
            details: "Auth data is missing or invalid",
        });
    }

    const user = await meService(authData.sessionId);

    res.status(200).json({
        user,
    });
};
