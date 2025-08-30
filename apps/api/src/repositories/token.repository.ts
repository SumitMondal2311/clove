import { prisma } from "@clove/database";

export const findToken = (id: string) => {
    return prisma.token.findUnique({
        where: {
            id,
        },
    });
};
