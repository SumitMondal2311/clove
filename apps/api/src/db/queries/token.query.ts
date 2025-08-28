import { prisma } from "../index.js";

export const findToken = (id: string) => {
    return prisma.token.findUnique({
        where: {
            id,
        },
    });
};
