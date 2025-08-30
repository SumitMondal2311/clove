import { NextFunction, Request, Response } from "express";
import { findSession } from "../db/queries/session.query.js";
import { CloveError } from "../utils/clove-error.js";
import { handleAsync } from "../utils/handle-async.js";
import { verifyToken } from "../utils/jwt.js";

export const authMiddleware = handleAsync(
    async (req: Request, _res: Response, next: NextFunction) => {
        const authHeader = req.headers["authorization"];
        if (!authHeader) {
            return next(
                new CloveError(401, {
                    message: "Missing authorization header",
                    details: "Authorization header was not provided.",
                })
            );
        }

        const [schema, accessToken] = authHeader.split(" ");
        if (schema !== "Bearer" || !accessToken) {
            return next(
                new CloveError(400, {
                    message: "Invalid or malformed authorization header",
                    details: "Authorization header format expected: Bearer <access_token>",
                })
            );
        }

        const { payload } = await verifyToken(accessToken);
        const { sub, sid, typ } = payload;
        if (!sub || !sid || typ !== "access") {
            return next(
                new CloveError(401, {
                    message: "Invalid access token",
                    details: "Required claims are missing or invalid",
                })
            );
        }

        const sessionRecord = await findSession(sid);
        if (!sessionRecord) {
            throw new CloveError(401, {
                message: "Invalid session",
                details: "No active session is associated with this token.",
            });
        }

        if (sessionRecord.userId !== sub) {
            throw new CloveError(401, {
                message: "Invalid token claim",
                details: "The user in the token does not match the stored session data.",
            });
        }

        req.authData = {
            userId: sub,
            sessionId: sid,
        };

        next();
    }
);
