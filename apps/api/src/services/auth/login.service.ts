import { verify } from "argon2";
import { randomBytes, randomUUID } from "crypto";
import { constant } from "../../configs/constant.js";
import { env } from "../../configs/env.js";
import { prisma } from "../../db/index.js";
import { findLocalAccount } from "../../db/queries/account.query.js";
import { findEmailByAddress } from "../../db/queries/email.query.js";
import { findSessionsByUserId } from "../../db/queries/session.query.js";
import { sendVerificationEmail } from "../../emails/service.js";
import { CloveError } from "../../utils/clove-error.js";
import { delay } from "../../utils/delay.js";
import { getExpiryDate } from "../../utils/get-expiry-date.js";
import { getHmacSHA256 } from "../../utils/get-hmac-sha256.js";
import { signToken } from "../../utils/jwt.js";

export const loginService = async ({
    ipAddress,
    userAgent,
    email,
    password,
}: {
    ipAddress?: string;
    userAgent?: string;
    email: string;
    password: string;
}): Promise<
    | {
          status: "EMAIL_VERIFICATION_REQUIRED";
      }
    | {
          refreshToken: string;
          user: {
              email: string;
              id: string;
              primary: boolean;
          };
          sessionId: string;
          status: "LOGIN_SUCCESS";
      }
> => {
    const emailRecord = await findEmailByAddress(email);
    if (!emailRecord) {
        throw new CloveError(404, {
            message: "Email not found",
            details: "No account exists with the provided email address.",
        });
    }

    const { userId } = emailRecord;
    const tokenSecret = randomBytes(32).toString("hex");

    if (!emailRecord.verified) {
        const tokenId = randomUUID();
        await prisma
            .$transaction(async (tx) => {
                await tx.token.deleteMany({
                    where: {
                        userId: userId,
                        type: "EMAIL_VERIFICATION",
                    },
                });
                return await tx.token.create({
                    data: {
                        type: "EMAIL_VERIFICATION",
                        id: tokenId,
                        secret: getHmacSHA256(tokenSecret),
                        expiresAt: getExpiryDate(env.EMAIL_VERIFICATION_TOKEN_EXPIRY_MS),
                        user: {
                            connect: {
                                id: userId,
                            },
                        },
                        email: {
                            connect: {
                                email,
                            },
                        },
                    },
                });
            })
            .then(async () => {
                await sendVerificationEmail(email, `${tokenId}.${tokenSecret}`);
            });

        return {
            status: "EMAIL_VERIFICATION_REQUIRED",
        };
    }

    const account = await findLocalAccount(email);
    if (!account) {
        throw new CloveError(404, {
            message: "Account not found",
            details: "No account is linked to this email address.",
        });
    }

    const passwordMatched = await verify(account.password || "", password);
    if (!passwordMatched) {
        await delay(1000);
        throw new CloveError(401, {
            message: "Invalid credentials",
            details: "The provided password is incorrect.",
        });
    }

    const sessions = await findSessionsByUserId(userId, {
        updatedAt: "asc",
    });

    const refreshJti = randomUUID();
    const sessionId = randomUUID();
    const refreshToken = await signToken(
        {
            sub: userId,
            session_id: sessionId,
            type: "refresh",
            jti: refreshJti,
        },
        getExpiryDate(constant.REFRESH_TOKEN_EXPIRY_MS)
    );

    await prisma.$transaction(async (tx) => {
        if (sessions.length >= env.SESSION_LIMIT) {
            await tx.session.update({
                where: {
                    id: sessions[0].id,
                },
                data: {
                    revoked: true,
                },
            });
        }
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
            },
        });
        await tx.auditLog.create({
            data: {
                event: "LOGGED_IN",
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
        refreshToken,
        user: {
            primary: emailRecord.primary,
            email,
            id: userId,
        },
        sessionId,
        status: "LOGIN_SUCCESS",
    };
};
