import { prisma } from "@clove/database";

export const findUser = (id: string) => {
    return prisma.user.findUnique({
        where: {
            id,
        },
    });
};
