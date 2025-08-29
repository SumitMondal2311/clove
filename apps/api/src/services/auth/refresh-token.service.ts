import { randomUUID } from "crypto";
import { constant } from "../../configs/constant.js";
import { env } from "../../configs/env.js";
import { redis } from "../../configs/redis.js";
import { findSessionIncludeEmail, rotateRefreshToken } from "../../db/queries/session.query.js";
import { CloveError } from "../../utils/clove-error.js";
import { getExpiryDate } from "../../utils/get-expiry-date.js";
import { getTtl } from "../../utils/get-ttl.js";
import { signToken, verifyToken } from "../../utils/jwt.js";
import { redisKey } from "../../utils/redis-key.js";

export const refreshTokenService = async (
    refreshToken: string
): Promise<{
    newRefreshToken: string;
    user: {
        email: string;
        id: string;
    };
    sessionId: string;
}> => {
    const { payload } = await verifyToken(refreshToken);
    const { session_id, sub, jti, exp, type } = payload;
    if (!session_id || !sub || !jti || type !== "refresh") {
        throw new CloveError(401, {
            message: "Invalid refresh token",
            details: "Missing or invalid claims in refresh token.",
        });
    }

    const sessionRecord = await findSessionIncludeEmail(session_id);
    if (!sessionRecord) {
        throw new CloveError(404, {
            message: "Session not found",
            details: "No active session associated with this refresh token.",
        });
    }

    const emailRecord = sessionRecord.email;

    if (jti !== sessionRecord.refreshJti) {
        throw new CloveError(403, {
            message: "Refresh token mismatch",
            details: "Refresh token ID does not match the stored session token ID.",
        });
    }

    if (await redis.exists(redisKey.blacklistJti(jti))) {
        throw new CloveError(403, {
            message: "Refresh token reuse detected",
            details: "This refresh token has already been revoked.",
        });
    }

    const refreshJti = randomUUID();
    const newRefreshToken = await signToken(
        {
            type: "refresh",
            sub,
            session_id: sessionRecord.id,
            jti: refreshJti,
        },
        getExpiryDate(constant.REFRESH_TOKEN_EXPIRY_MS)
    );

    await rotateRefreshToken({
        refreshJti,
        id: sessionRecord.id,
    });

    await redis.set(
        redisKey.blacklistJti(jti),
        "revoked",
        "EX",
        getTtl(exp, env.REFRESH_TOKEN_EXPIRY)
    );

    return {
        sessionId: sessionRecord.id,
        newRefreshToken,
        user: {
            id: sessionRecord.userId,
            email: emailRecord.email,
        },
    };
};
