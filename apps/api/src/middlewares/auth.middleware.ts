import { NextFunction, Request, Response } from "express";
import { findEmailByAddress } from "../db/queries/email.query.js";
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
        const { email, sub, session_id, type } = payload;
        if (!email || !sub || !session_id || type !== "access") {
            return next(
                new CloveError(401, {
                    message: "Invalid access token",
                    details: "Required claims are missing or invalid",
                })
            );
        }

        const emailRecord = await findEmailByAddress(email);
        if (!emailRecord) {
            throw new CloveError(401, {
                message: "Email not found",
                details: "No email is associated with this token.",
            });
        }

        if (emailRecord.userId !== sub) {
            throw new CloveError(401, {
                message: "Email and user mismatch",
                details: "Stored email address does not belong to this user.",
            });
        }

        const session = await findSession(session_id);
        if (!session) {
            throw new CloveError(401, {
                message: "Session not found",
                details: "No active session is associated with this token.",
            });
        }

        const { primary } = emailRecord;

        req.authData = {
            user: {
                primary,
                email,
                id: sub,
            },
            sessionId: session_id,
        };

        next();
    }
);
