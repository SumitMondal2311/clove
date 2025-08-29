import { env } from "../../configs/env.js";
import { redis } from "../../configs/redis.js";
import { prisma } from "../../db/index.js";
import { findSessionByJti } from "../../db/queries/session.query.js";
import { CloveError } from "../../utils/clove-error.js";
import { getTtl } from "../../utils/get-ttl.js";
import { verifyToken } from "../../utils/jwt.js";
import { redisKey } from "../../utils/redis-key.js";

export const logoutService = async ({
    refreshToken,
    ipAddress,
    userAgent,
}: {
    refreshToken: string;
    ipAddress?: string;
    userAgent?: string;
}) => {
    const { payload } = await verifyToken(refreshToken);
    const { jti, sub, exp, session_id, type } = payload;
    if (!session_id || !sub || !jti || type !== "refresh") {
        throw new CloveError(401, {
            message: "Invalid refresh token",
            details: "Required claims are missing or invalid.",
        });
    }

    const session = await findSessionByJti(jti);
    if (!session) {
        throw new CloveError(404, {
            message: "Session not found",
            details: "Refresh jti is not associated with the user",
        });
    }

    await prisma.$transaction(async (tx) => {
        await tx.session.updateMany({
            where: {
                revoked: false,
                id: session_id,
                userId: sub,
            },
            data: {
                revoked: true,
            },
        });
        await tx.auditLog.create({
            data: {
                event: "LOGGED_OUT",
                ipAddress,
                userAgent,
                user: {
                    connect: {
                        id: sub,
                    },
                },
            },
        });
    });

    await redis.set(
        redisKey.blacklistJti(jti),
        "revoked",
        "EX",
        getTtl(exp, env.REFRESH_TOKEN_EXPIRY)
    );
};
