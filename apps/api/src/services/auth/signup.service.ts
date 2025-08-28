import { hash } from "argon2";
import { randomBytes } from "crypto";
import { env } from "../../configs/env.js";
import { redis } from "../../configs/redis.js";
import { prisma } from "../../db/index.js";
import { findEmailByAddress } from "../../db/queries/email.query.js";
import { CloveError } from "../../utils/clove-error.js";
import { getExpiryDate } from "../../utils/get-expiry-date.js";
import { redisKey } from "../../utils/redis-key.js";
import { sha256Hash } from "../../utils/sha256-hash.js";

type Status = "EMAIL_UNVERIFIED_RESENT" | "SIGNUP_SUCCESS";

export const signupService = async ({
    ipAddress,
    userAgent,
    email,
    password,
}: {
    ipAddress?: string;
    userAgent?: string;
    email: string;
    password: string;
}): Promise<Status> => {
    let status: Status = "SIGNUP_SUCCESS";
    const rawTokenSecret = randomBytes(32).toString("hex");
    const emailRecord = await findEmailByAddress(email);
    let userId;

    await prisma
        .$transaction(async (tx) => {
            if (emailRecord) {
                if (emailRecord.verified) {
                    throw new CloveError(409, {
                        message: "Email already in use",
                        details: "Conflict: This email is already registered and verified.",
                    });
                } else {
                    const verificationResends = await redis.incr(
                        redisKey.verificationResends(email)
                    );

                    if (verificationResends === 1) {
                        await redis.expire(redisKey.verificationResends(email), 24 * 60 * 60);
                    } else if (verificationResends >= 5) {
                        throw new CloveError(429, {
                            message: "Daily limit reached",
                            details:
                                "Too Many Requests: You have reached the daily limit for verification emails.",
                        });
                    }

                    const isRateLimited = await redis.get(redisKey.verificationRateLimit(email));
                    if (isRateLimited) {
                        throw new CloveError(429, {
                            message: "Rate limit exceeded",
                            details:
                                "Too Many Requests: You can request a new verification email every 60 seconds.",
                        });
                    }

                    await redis.set(redisKey.verificationRateLimit(email), "cooldown", "EX", 60);

                    userId = emailRecord.userId;
                    status = "EMAIL_UNVERIFIED_RESENT";
                }
            } else {
                const user = await tx.user.create({
                    data: {},
                });
                userId = user.id;
                await tx.email.create({
                    data: {
                        email,
                        primary: true,
                        user: {
                            connect: {
                                id: userId,
                            },
                        },
                    },
                });
                await tx.account.create({
                    data: {
                        password: await hash(password),
                        providerUserId: email,
                        user: {
                            connect: {
                                id: userId,
                            },
                        },
                    },
                });
                await tx.auditLog.create({
                    data: {
                        event: "ACCOUNT_CREATED",
                        ipAddress,
                        userAgent,
                        user: {
                            connect: {
                                id: userId,
                            },
                        },
                    },
                });
            }
            await tx.token.deleteMany({
                where: {
                    type: "EMAIL_VERIFICATION",
                    userId,
                },
            });
            return await tx.token.create({
                data: {
                    secret: sha256Hash(rawTokenSecret),
                    type: "EMAIL_VERIFICATION",
                    expiresAt: getExpiryDate(env.EMAIL_VERIFICATION_TOKEN_EXPIRY_MS),
                    user: {
                        connect: {
                            id: userId,
                        },
                    },
                },
            });
        })
        .then(() => {
            // send verification email
        });

    return status;
};
