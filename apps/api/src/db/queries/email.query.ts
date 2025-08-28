import { Email, prisma } from "../index.js";

export const findEmailByAddress = (email: string) => {
    return prisma.email.findUnique({
        where: {
            email,
        },
    });
};
