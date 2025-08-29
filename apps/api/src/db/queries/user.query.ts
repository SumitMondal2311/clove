import { prisma } from "../index.js";

export const findUser = (id: string) => {
    return prisma.user.findUnique({
        where: {
            id,
        },
    });
};
