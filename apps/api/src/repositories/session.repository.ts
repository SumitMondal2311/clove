import { LoginMethod, Prisma, prisma } from "@clove/database";
import { constant } from "../configs/constant.js";
import { getExpiryDate } from "../utils/get-expiry-date.js";

export const findSessionsByUserId = (
    userId: string,
    orderBy: Prisma.SessionOrderByWithAggregationInput
) => {
    return prisma.session.findMany({
        where: {
            revoked: false,
            userId,
        },
        orderBy,
    });
};

export const findSession = (id: string) => {
    return prisma.session.findFirst({
        where: {
            id,
            revoked: false,
        },
    });
};

export const findSessionIncludeEmail = (id: string) => {
    return prisma.session.findFirst({
        where: {
            id,
            revoked: false,
        },
        include: {
            email: true,
        },
    });
};

export const findSessionByJti = (jti: string) => {
    return prisma.session.findFirst({
        where: {
            refreshJti: jti,
            revoked: false,
        },
    });
};

export const rotateRefreshToken = ({
    loginMethod = "EMAIL",
    id,
    refreshJti,
}: {
    loginMethod?: LoginMethod;
    id: string;
    refreshJti: string;
}) => {
    return prisma.session.update({
        where: {
            loginMethod,
            id,
            revoked: false,
        },
        data: {
            refreshJti,
            expiresAt: getExpiryDate(constant.REFRESH_TOKEN_EXPIRY_MS),
        },
    });
};
