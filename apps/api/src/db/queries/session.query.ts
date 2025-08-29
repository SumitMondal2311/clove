import { Prisma, prisma } from "../index.js";

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

export const findSessionByJti = (jti: string) => {
    return prisma.session.findMany({
        where: {
            refreshJti: jti,
            revoked: false,
        },
    });
};
