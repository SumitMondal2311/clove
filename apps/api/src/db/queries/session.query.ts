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
