import { randomUUID } from "crypto";
import { constant } from "../../configs/constant.js";
import { env } from "../../configs/env.js";
import { redis } from "../../configs/redis.js";
import { findSessionByJti, rotateRefreshToken } from "../../db/queries/session.query.js";
import { CloveError } from "../../utils/clove-error.js";
import { getExpiryDate } from "../../utils/get-expiry-date.js";
import { getTtl } from "../../utils/get-ttl.js";
import { signToken, verifyToken } from "../../utils/jwt.js";
import { redisKey } from "../../utils/redis-key.js";

export const refreshTokenService = async (
    refreshToken: string
): Promise<{
    newRefreshToken: string;
    userId: string;
    sessionId: string;
}> => {
    const { payload } = await verifyToken(refreshToken);
    const { sid, sub, jti, exp, typ } = payload;
    if (!sid || !sub || !jti || typ !== "refresh") {
        throw new CloveError(401, {
            message: "Invalid refresh token",
            details: "Missing or invalid claims in refresh token.",
        });
    }

    const sessionRecord = await findSessionByJti(jti);
    if (!sessionRecord) {
        throw new CloveError(404, {
            message: "Session not found",
            details: "No active session associated with this refresh token.",
        });
    }

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
            jti: refreshJti,
            sub,
            typ: "refresh",
            sid: sessionRecord.id,
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

    const { id, userId } = sessionRecord;

    return {
        newRefreshToken,
        userId,
        sessionId: id,
    };
};
