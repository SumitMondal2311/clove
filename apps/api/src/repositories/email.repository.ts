import { prisma } from "@clove/database";

export const findEmailByAddress = (email: string) => {
    return prisma.email.findUnique({
        where: {
            email,
        },
    });
};

export const findEmailInclueUser = (id: string) => {
    return prisma.email.findUnique({
        where: {
            id,
        },
        include: {
            user: true,
        },
    });
};
