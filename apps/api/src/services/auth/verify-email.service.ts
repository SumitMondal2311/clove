import { randomUUID } from "crypto";
import { constant } from "../../configs/constant.js";
import { prisma } from "../../db/index.js";
import { findEmailInclueUser } from "../../db/queries/email.query.js";
import { findToken } from "../../db/queries/token.query.js";
import { CloveError } from "../../utils/clove-error.js";
import { getExpiryDate } from "../../utils/get-expiry-date.js";
import { getHmacSHA256 } from "../../utils/get-hmac-sha256.js";
import { signToken } from "../../utils/jwt.js";

export const verifyEmailService = async ({
    ipAddress,
    userAgent,
    secret,
    tokenId,
}: {
    ipAddress?: string;
    userAgent?: string;
    secret: string;
    tokenId: string;
}): Promise<{
    refreshToken: string;
    user: {
        email: string;
        id: string;
        primary: boolean;
    };
    sessionId: string;
}> => {
    const tokenRecord = await findToken(tokenId);
    if (!tokenRecord) {
        throw new CloveError(404, {
            message: "Token not found",
            details: "No matching token was found in the database.",
        });
    }

    if (tokenRecord.expiresAt <= new Date()) {
        throw new CloveError(401, {
            message: "Token expired",
            details: "The provided token has expired.",
        });
    }

    if (getHmacSHA256(secret) !== tokenRecord.secret) {
        throw new CloveError(401, {
            message: "Invalid secret",
            details: "The provided secret does not match the stored token.",
        });
    }

    const { userId, emailId } = tokenRecord;
    const emailRecord = await findEmailInclueUser(emailId || "");
    if (!emailRecord) {
        throw new CloveError(404, {
            message: "Email not found",
            details: "No email address is associated with the provided token.",
        });
    }

    if (emailRecord.verified) {
        throw new CloveError(409, {
            message: "Already verified",
            details: "This email address is already verified.",
        });
    }

    if (tokenRecord.emailId !== emailId) {
        throw new CloveError(403, {
            message: "Token is not associated with this email",
            details: "The provided token does not belong to this email address.",
        });
    }

    const refreshJti = randomUUID();
    const sessionId = randomUUID();
    const refreshToken = await signToken(
        {
            jti: refreshJti,
            sub: userId,
            type: "refresh",
            session_id: sessionId,
        },
        getExpiryDate(constant.REFRESH_TOKEN_EXPIRY_MS)
    );

    await prisma.$transaction(async (tx) => {
        await tx.token.delete({
            where: {
                id: tokenRecord.id,
            },
        });
        await tx.email.update({
            where: {
                id: emailRecord.id,
            },
            data: {
                verified: true,
            },
        });
        await tx.session.create({
            data: {
                id: sessionId,
                expiresAt: getExpiryDate(constant.REFRESH_TOKEN_EXPIRY_MS),
                ipAddress,
                userAgent,
                refreshJti,
                user: {
                    connect: {
                        id: userId,
                    },
                },
                email: {
                    connect: {
                        id: emailRecord.id,
                    },
                },
            },
        });
        await tx.auditLog.create({
            data: {
                event: "EMAIL_VERIFIED",
                ipAddress,
                userAgent,
                user: {
                    connect: {
                        id: userId,
                    },
                },
            },
        });
    });

    return {
        sessionId,
        user: {
            primary: emailRecord.primary,
            id: userId,
            email: emailRecord.email,
        },
        refreshToken,
    };
};
